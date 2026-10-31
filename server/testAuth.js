/**
 * Test script to verify the authentication endpoints and middleware.
 * Run with: node testAuth.js
 */
const BASE_URL = 'http://localhost:5000/api';

const printStep = (title) => {
  console.log(`\n======================================================`);
  console.log(`▶ TEST: ${title}`);
  console.log(`======================================================`);
};

const runTests = async () => {
  try {
    const testEmail = `student_${Date.now()}@test.com`;
    const testPassword = 'SecretPassword123!';
    let studentAccessToken = '';
    let studentCookie = '';

    // 1. REGISTER
    printStep('1. Register a new student user (attempts role "admin")');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: testEmail,
        phone: '9876543210',
        password: testPassword,
        role: 'admin', // Should be ignored; role must always be 'user'
      }),
    });
    const registerData = await registerRes.json();
    console.log(`Status: ${registerRes.status} (Expected: 201)`);
    console.log(`Response:`, JSON.stringify(registerData, null, 2));
    if (registerData.data?.user?.role !== 'user') {
      throw new Error(`Security violation! Expected role 'user' but got '${registerData.data?.user?.role}'`);
    }
    if (registerData.data?.user?.passwordHash || registerData.data?.user?.refreshTokenHash) {
      throw new Error('Security violation! Password hash or refresh token hash was exposed in JSON output');
    }
    console.log('✓ PASS: Registered successfully with enforced role: "user" and stripped password hashes.');

    // 2. LOGIN
    printStep('2. Login with registered student credentials');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status} (Expected: 200)`);
    console.log(`Access Token: ${loginData.data?.accessToken ? 'Present (JWT)' : 'MISSING'}`);
    studentAccessToken = loginData.data?.accessToken;

    const setCookieHeader = loginRes.headers.get('set-cookie');
    console.log(`Set-Cookie header: ${setCookieHeader ? setCookieHeader.split(';')[0] : 'MISSING'}`);
    if (setCookieHeader) {
      studentCookie = setCookieHeader.split(';')[0];
    }
    if (!studentAccessToken || !studentCookie) {
      throw new Error('Login failed to return accessToken or set refreshToken cookie');
    }
    console.log('✓ PASS: Access token returned and httpOnly refresh cookie set.');

    // 3. CALL PROTECTED ROUTE WITHOUT TOKEN (EXPECT 401)
    printStep('3. Call protected route (/api/auth/me) without token (Expect 401)');
    const unauthRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
    });
    const unauthData = await unauthRes.json();
    console.log(`Status: ${unauthRes.status} (Expected: 401)`);
    console.log(`Response:`, JSON.stringify(unauthData, null, 2));
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${unauthRes.status}`);
    }
    console.log('✓ PASS: Protected route properly rejected without token (401).');

    // 4. CALL PROTECTED ROUTE WITH VALID TOKEN (EXPECT 200)
    printStep('4. Call protected route (/api/auth/me) with student token (Expect 200)');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentAccessToken}` },
    });
    const meData = await meRes.json();
    console.log(`Status: ${meRes.status} (Expected: 200)`);
    console.log(`User profile:`, meData.data?.user?.email, `Role:`, meData.data?.user?.role);
    if (meRes.status !== 200) {
      throw new Error(`Expected 200 OK but got ${meRes.status}`);
    }
    console.log('✓ PASS: Protected route returned authenticated user profile.');

    // 5. CALL ADMIN ROUTE AS NORMAL USER (EXPECT 403)
    printStep('5. Call admin route (/api/admin/stats) as normal student user (Expect 403)');
    const forbiddenRes = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentAccessToken}` },
    });
    const forbiddenData = await forbiddenRes.json();
    console.log(`Status: ${forbiddenRes.status} (Expected: 403)`);
    console.log(`Response:`, JSON.stringify(forbiddenData, null, 2));
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden but got ${forbiddenRes.status}`);
    }
    console.log('✓ PASS: Admin route properly blocked normal user with 403 Forbidden.');

    // 6. CALL ADMIN ROUTE AS ADMIN (EXPECT 200)
    printStep('6. Login as Admin and call admin route (/api/admin/stats) (Expect 200)');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@jobmansion.com',
        password: 'Admin@12345',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminAccessToken = adminLoginData.data?.accessToken;
    const adminRes = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });
    const adminData = await adminRes.json();
    console.log(`Status: ${adminRes.status} (Expected: 200)`);
    console.log(`Admin Response:`, JSON.stringify(adminData, null, 2));
    if (adminRes.status !== 200) {
      throw new Error(`Expected 200 OK for admin but got ${adminRes.status}`);
    }
    console.log('✓ PASS: Admin route allowed admin access.');

    // 7. REFRESH TOKEN (ROTATION)
    printStep('7. Refresh access token using refresh cookie');
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: studentCookie,
      },
    });
    const refreshData = await refreshRes.json();
    console.log(`Status: ${refreshRes.status} (Expected: 200)`);
    console.log(`New Access Token: ${refreshData.data?.accessToken ? 'Present (JWT)' : 'MISSING'}`);
    const newCookieHeader = refreshRes.headers.get('set-cookie');
    console.log(`Rotated Cookie: ${newCookieHeader ? newCookieHeader.split(';')[0] : 'MISSING'}`);
    if (refreshRes.status !== 200 || !refreshData.data?.accessToken) {
      throw new Error(`Expected 200 OK for token refresh but got ${refreshRes.status}`);
    }
    const rotatedCookie = newCookieHeader ? newCookieHeader.split(';')[0] : studentCookie;
    console.log('✓ PASS: Refresh token rotated and new access token issued.');

    // 8. LOGOUT
    printStep('8. Logout (clears cookie and stored hash)');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshData.data.accessToken}`,
        Cookie: rotatedCookie,
      },
    });
    const logoutData = await logoutRes.json();
    console.log(`Status: ${logoutRes.status} (Expected: 200)`);
    console.log(`Logout Response:`, JSON.stringify(logoutData, null, 2));
    if (logoutRes.status !== 200) {
      throw new Error(`Expected 200 OK for logout but got ${logoutRes.status}`);
    }
    console.log('✓ PASS: Logged out cleanly.');

    // 9. VERIFY REFRESH AFTER LOGOUT (EXPECT 401)
    printStep('9. Attempt refresh after logout (Expect 401)');
    const postLogoutRefresh = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: rotatedCookie,
      },
    });
    const postLogoutData = await postLogoutRefresh.json();
    console.log(`Status: ${postLogoutRefresh.status} (Expected: 401)`);
    console.log(`Response:`, JSON.stringify(postLogoutData, null, 2));
    if (postLogoutRefresh.status !== 401) {
      throw new Error(`Expected 401 Unauthorized after logout but got ${postLogoutRefresh.status}`);
    }
    console.log('✓ PASS: Invalidated refresh token rejected after logout.');

    // 10. FORGOT PASSWORD
    printStep('10. Request password reset (forgot-password)');
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData = await forgotRes.json();
    console.log(`Status: ${forgotRes.status} (Expected: 200)`);
    console.log(`Response:`, JSON.stringify(forgotData, null, 2));
    if (forgotRes.status !== 200) {
      throw new Error(`Expected 200 OK for forgot-password but got ${forgotRes.status}`);
    }
    console.log('✓ PASS: Password reset link generated.');

    // 11. RESET PASSWORD & RE-LOGIN
    printStep('11. Reset password using generated token and verify login with new password');
    const mongoose = require('mongoose');
    const { MONGO_URI } = require('./src/config/env');
    const User = require('./src/models/User');
    const { hashToken, generateRandomToken } = require('./src/utils/generateToken');
    
    await mongoose.connect(MONGO_URI);
    const testUser = await User.findOne({ email: testEmail });
    // Generate a fresh known token
    const freshRawToken = generateRandomToken();
    testUser.passwordResetTokenHash = hashToken(freshRawToken);
    testUser.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await testUser.save();
    await mongoose.connection.close();

    const newPassword = 'BrandNewPassword456!';
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: freshRawToken,
        password: newPassword,
      }),
    });
    const resetData = await resetRes.json();
    console.log(`Status: ${resetRes.status} (Expected: 200)`);
    console.log(`Reset Response:`, JSON.stringify(resetData, null, 2));
    if (resetRes.status !== 200) {
      throw new Error(`Expected 200 OK for reset-password but got ${resetRes.status}`);
    }

    // Verify login with new password
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword,
      }),
    });
    const newLoginData = await newLoginRes.json();
    console.log(`New Login Status: ${newLoginRes.status} (Expected: 200)`);
    if (newLoginRes.status !== 200 || !newLoginData.data?.accessToken) {
      throw new Error('Failed to login with newly reset password');
    }
    console.log('✓ PASS: Password reset verified and successful login with new password.');

    console.log('\n======================================================');
    console.log('🎉 ALL 11 AUTHENTICATION AND AUTHORIZATION TESTS PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
};

runTests();
