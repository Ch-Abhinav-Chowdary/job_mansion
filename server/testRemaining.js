/**
 * testRemaining.js
 * Tests user profile, enquiries, and admin endpoints.
 * Run: node testRemaining.js
 */

const BASE = 'http://localhost:5000/api';
let passed = 0;
let failed = 0;

// ── Helpers ────────────────────────────────────────────────────────────────
async function req(method, url, { body, token } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
}

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// ── Auth helpers ───────────────────────────────────────────────────────────
async function loginAdmin() {
  const r = await req('POST', `${BASE}/auth/login`, {
    body: { email: 'admin@jobmansion.com', password: 'Admin@12345' },
  });
  return r.data?.accessToken;
}

async function registerAndLoginUser(suffix) {
  const email = `testuser_${suffix}_${Date.now()}@example.com`;
  await req('POST', `${BASE}/auth/register`, {
    body: { name: 'Test User', email, password: 'Test@1234' },
  });
  const r = await req('POST', `${BASE}/auth/login`, {
    body: { email, password: 'Test@1234' },
  });
  return { token: r.data?.accessToken, email };
}

// ══════════════════════════════════════════════════════════════════════════
async function run() {
  console.log('\n══════════════════════════════════════════');
  console.log('  Job Mansion — Remaining Endpoints Test');
  console.log('══════════════════════════════════════════\n');

  const adminToken = await loginAdmin();
  check('Admin login OK', !!adminToken, 'could not get admin token');

  const { token: userToken, email: userEmail } = await registerAndLoginUser('remaining');
  check('User register + login OK', !!userToken);

  // ── 1. USER PROFILE ─────────────────────────────────────────────────────
  console.log('\n── 1. User Profile ──────────────────────────────────────────');

  let r = await req('GET', `${BASE}/users/me`, { token: userToken });
  check('GET /users/me — 200', r.status === 200 && r.success);
  check('GET /users/me — no passwordHash', !r.data?.user?.passwordHash);

  r = await req('PUT', `${BASE}/users/me`, {
    token: userToken,
    body: { name: 'Updated Name', phone: '9876543210' },
  });
  check('PUT /users/me — 200', r.status === 200 && r.success);
  check('PUT /users/me — name updated', r.data?.user?.name === 'Updated Name');

  r = await req('GET', `${BASE}/users/me`, { token: userToken });
  check('GET /users/me after update — phone persisted', r.data?.user?.phone === '9876543210');

  r = await req('GET', `${BASE}/users/me`);
  check('GET /users/me — 401 without token', r.status === 401);

  // ── 2. CHANGE PASSWORD ───────────────────────────────────────────────────
  console.log('\n── 2. Change Password ───────────────────────────────────────');

  r = await req('PUT', `${BASE}/users/me/password`, {
    token: userToken,
    body: { currentPassword: 'WrongPass1', newPassword: 'NewPass@1234' },
  });
  check('PUT /users/me/password — wrong current pw → 400', r.status === 400);

  r = await req('PUT', `${BASE}/users/me/password`, {
    token: userToken,
    body: { currentPassword: 'Test@1234', newPassword: 'NewPass@1234' },
  });
  check('PUT /users/me/password — success → 200', r.status === 200 && r.success);

  // ── 3. ENROLLMENTS & PAYMENTS (user) ────────────────────────────────────
  console.log('\n── 3. User Enrollments & Payments ───────────────────────────');

  r = await req('GET', `${BASE}/users/me/enrollments`, { token: userToken });
  check('GET /users/me/enrollments — 200', r.status === 200 && r.success);
  check('GET /users/me/enrollments — array', Array.isArray(r.data?.enrollments));

  r = await req('GET', `${BASE}/users/me/payments`, { token: userToken });
  check('GET /users/me/payments — 200', r.status === 200 && r.success);
  check('GET /users/me/payments — array', Array.isArray(r.data?.payments));

  // ── 4. ENQUIRIES ─────────────────────────────────────────────────────────
  console.log('\n── 4. Enquiries (public) ────────────────────────────────────');

  r = await req('POST', `${BASE}/enquiries`, {
    body: {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '9876543210',
      message: 'I want to know about the Full Stack course.',
      type: 'enquiry',
    },
  });
  check('POST /enquiries — 201', r.status === 201 && r.success);
  const enquiryId = r.data?.enquiry?._id;
  check('POST /enquiries — has _id', !!enquiryId);

  r = await req('POST', `${BASE}/enquiries`, {
    body: { name: 'Bad', email: 'notanemail', phone: '123', message: 'Hi' },
  });
  check('POST /enquiries — invalid email → 400', r.status === 400);

  // ── 5. ADMIN STATS ───────────────────────────────────────────────────────
  console.log('\n── 5. Admin Stats ───────────────────────────────────────────');

  r = await req('GET', `${BASE}/admin/stats`, { token: adminToken });
  check('GET /admin/stats — 200', r.status === 200 && r.success);
  check('GET /admin/stats — has totalStudents', typeof r.data?.totalStudents === 'number');
  check('GET /admin/stats — has totalRevenuePaise', typeof r.data?.totalRevenuePaise === 'number');
  check('GET /admin/stats — has newEnquiries', typeof r.data?.newEnquiries === 'number');
  console.log(`     totalStudents=${r.data?.totalStudents}, totalRevenuePaise=${r.data?.totalRevenuePaise}, activeEnrollments=${r.data?.activeEnrollments}, newEnquiries=${r.data?.newEnquiries}`);

  r = await req('GET', `${BASE}/admin/stats`);
  check('GET /admin/stats — 401 without token', r.status === 401);

  // ── 6. ADMIN USERS ───────────────────────────────────────────────────────
  console.log('\n── 6. Admin Users ───────────────────────────────────────────');

  r = await req('GET', `${BASE}/admin/users`, { token: adminToken });
  check('GET /admin/users — 200', r.status === 200 && r.success);
  check('GET /admin/users — array', Array.isArray(r.data?.users));
  check('GET /admin/users — pagination', !!r.data?.pagination);
  const userId = r.data?.users?.find((u) => u.email === userEmail)?._id;

  r = await req('GET', `${BASE}/admin/users?search=Updated Name`, { token: adminToken });
  check('GET /admin/users?search — 200', r.status === 200 && r.success);

  // Block user
  if (userId) {
    r = await req('PATCH', `${BASE}/admin/users/${userId}/status`, {
      token: adminToken,
      body: { isActive: false },
    });
    check('PATCH /admin/users/:id/status — block → 200', r.status === 200 && r.success);
    check('PATCH /admin/users/:id/status — isActive=false', r.data?.user?.isActive === false);

    // Unblock
    r = await req('PATCH', `${BASE}/admin/users/${userId}/status`, {
      token: adminToken,
      body: { isActive: true },
    });
    check('PATCH /admin/users/:id/status — unblock → 200', r.status === 200 && r.success);
  }

  // Admin cannot block themselves
  const adminSelf = r.data?.users?._id;
  // Get admin id from /users/me with admin token
  const meR = await req('GET', `${BASE}/users/me`, { token: adminToken });
  const adminId = meR.data?.user?._id;
  if (adminId) {
    r = await req('PATCH', `${BASE}/admin/users/${adminId}/status`, {
      token: adminToken,
      body: { isActive: false },
    });
    check('PATCH /admin/users/:id/status — cannot block self → 400', r.status === 400);
  }

  // ── 7. ADMIN PAYMENTS ────────────────────────────────────────────────────
  console.log('\n── 7. Admin Payments ────────────────────────────────────────');

  r = await req('GET', `${BASE}/admin/payments`, { token: adminToken });
  check('GET /admin/payments — 200', r.status === 200 && r.success);
  check('GET /admin/payments — array', Array.isArray(r.data?.payments));

  r = await req('GET', `${BASE}/admin/payments?status=paid`, { token: adminToken });
  check('GET /admin/payments?status=paid — 200', r.status === 200);
  if (r.data?.payments?.length) {
    check('GET /admin/payments?status=paid — all paid', r.data.payments.every((p) => p.status === 'paid'));
  }

  r = await req('GET', `${BASE}/admin/payments?from=2025-01-01&to=2030-12-31`, { token: adminToken });
  check('GET /admin/payments?from=&to= — 200', r.status === 200);

  // ── 8. ADMIN ENQUIRIES ───────────────────────────────────────────────────
  console.log('\n── 8. Admin Enquiries ───────────────────────────────────────');

  r = await req('GET', `${BASE}/admin/enquiries`, { token: adminToken });
  check('GET /admin/enquiries — 200', r.status === 200 && r.success);
  check('GET /admin/enquiries — array', Array.isArray(r.data?.enquiries));
  check('GET /admin/enquiries — pagination', !!r.data?.pagination);

  r = await req('GET', `${BASE}/admin/enquiries?status=new`, { token: adminToken });
  check('GET /admin/enquiries?status=new — 200', r.status === 200);

  if (enquiryId) {
    r = await req('PATCH', `${BASE}/admin/enquiries/${enquiryId}`, {
      token: adminToken,
      body: { status: 'contacted' },
    });
    check('PATCH /admin/enquiries/:id — 200', r.status === 200 && r.success);
    check('PATCH /admin/enquiries/:id — status updated', r.data?.enquiry?.status === 'contacted');

    r = await req('PATCH', `${BASE}/admin/enquiries/${enquiryId}`, {
      token: adminToken,
      body: { status: 'invalid_status' },
    });
    check('PATCH /admin/enquiries/:id — invalid status → 400', r.status === 400);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
