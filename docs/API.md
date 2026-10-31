# Job Mansion — API Reference

Base URL: `http://localhost:5000/api`

All responses follow this shape:
```json
{ "success": true|false, "data": {...}|null, "message": "string" }
```

Auth: `Authorization: Bearer <accessToken>` (15-min JWT from login/refresh).
Cookies: `refreshToken` is set as httpOnly, secure, sameSite cookie.

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Server liveness check |

**Response**
```json
{ "success": true, "data": null, "message": "Server is running" }
```

---

## Auth — `/api/auth`

| Method | Endpoint | Auth | Rate Limit |
|--------|----------|------|-----------|
| POST | `/auth/register` | None | 10/15min |
| POST | `/auth/login` | None | 10/15min |
| POST | `/auth/refresh` | Cookie | None |
| POST | `/auth/logout` | Cookie | None |
| POST | `/auth/forgot-password` | None | 5/15min |
| POST | `/auth/reset-password` | None | None |
| GET  | `/auth/me` | Bearer | None |

### POST `/auth/register`
```json
// Body
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Secure@1234" }

// 201 Response
{ "success": true, "data": { "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "user" } }, "message": "Registration successful" }
```

### POST `/auth/login`
```json
// Body
{ "email": "jane@example.com", "password": "Secure@1234" }

// 200 Response — sets refreshToken cookie
{ "success": true, "data": { "accessToken": "eyJ...", "user": { "_id": "...", "name": "Jane Doe", "role": "user" } }, "message": "Login successful" }
```

### POST `/auth/refresh`
```json
// No body — uses refreshToken cookie

// 200 Response — rotates cookie and returns new access token
{ "success": true, "data": { "accessToken": "eyJ..." }, "message": "Token refreshed" }
```

### POST `/auth/logout`
```json
// No body — clears refreshToken cookie
{ "success": true, "data": null, "message": "Logged out" }
```

### POST `/auth/forgot-password`
```json
// Body
{ "email": "jane@example.com" }

// 200 — always (prevents user enumeration); link logged to console in dev
{ "success": true, "data": null, "message": "If that email exists, a reset link has been sent" }
```

### POST `/auth/reset-password`
```json
// Body
{ "token": "<reset-token-from-email>", "password": "NewSecure@1234" }

// 200
{ "success": true, "data": null, "message": "Password reset successful" }
```

### GET `/auth/me`
```json
// 200
{ "success": true, "data": { "user": { "_id": "...", "name": "Jane Doe", "role": "user" } }, "message": "User fetched" }
```

---

## Courses (Public) — `/api/courses`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/courses` | None | List published courses (filters + pagination) |
| GET | `/courses/:slug` | None | Course detail (no video URLs except preview) |
| GET | `/courses/:id/content` | Bearer (enrolled or admin) | Full lesson content |

### GET `/courses`
```
Query params:
  ?category=web-development
  ?search=react          (full-text search)
  ?page=1
  ?limit=10

// 200
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": { "page": 1, "limit": 10, "total": 42, "pages": 5 }
  }
}
```

### GET `/courses/:slug`
```json
// 200 — lesson videoUrl hidden unless isPreview=true
{
  "success": true,
  "data": {
    "course": {
      "_id": "...", "title": "Full Stack Web Development", "slug": "full-stack-web-development",
      "syllabus": [{ "title": "Intro", "lessons": [{ "title": "HTML Basics", "isPreview": true, "videoUrl": "https://..." }] }]
    }
  }
}
```

### GET `/courses/:id/content`
```
Authorization: Bearer <adminOrEnrolledUserToken>

// 200 — full lesson video URLs included
{
  "success": true,
  "data": { "syllabus": [...all lessons with videoUrl...] }
}
```

---

## Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-order` | Bearer (user) | Create Razorpay order |
| POST | `/payments/verify` | Bearer (user) | Verify signature, activate enrollment |
| POST | `/payments/webhook` | Razorpay signature | Webhook (raw body) |

### POST `/payments/create-order`
```json
// Body
{ "courseId": "64abc..." }

// 200
{ "success": true, "data": { "orderId": "order_...", "amount": 1999900, "currency": "INR", "keyId": "rzp_test_..." } }
```

### POST `/payments/verify`
```json
// Body
{
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "abc123..."
}

// 200
{ "success": true, "data": { "enrollment": {...} }, "message": "Payment verified and enrollment activated" }
```

---

## User Profile — `/api/users`

All endpoints require `Authorization: Bearer <token>` (role: `user` or `admin`).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Bearer | Get own profile |
| PUT | `/users/me` | Bearer | Update name, phone, avatar |
| PUT | `/users/me/password` | Bearer | Change password |
| GET | `/users/me/enrollments` | Bearer | List active enrollments |
| GET | `/users/me/payments` | Bearer | Payment history |

### GET `/users/me`
```json
// 200
{ "success": true, "data": { "user": { "_id": "...", "name": "Jane Doe", "email": "...", "role": "user", "isActive": true } } }
```

### PUT `/users/me`
```json
// Body (all optional)
{ "name": "Jane Updated", "phone": "9876543210", "avatar": "https://..." }

// 200
{ "success": true, "data": { "user": {...} }, "message": "Profile updated" }
```

### PUT `/users/me/password`
```json
// Body
{ "currentPassword": "OldPass@1", "newPassword": "NewPass@1234" }

// 200
{ "success": true, "data": null, "message": "Password changed successfully" }

// 400 — wrong current password
{ "success": false, "data": null, "message": "Current password is incorrect" }
```

### GET `/users/me/enrollments`
```json
// 200
{
  "success": true,
  "data": {
    "enrollments": [
      { "_id": "...", "status": "active", "course": { "title": "Python", "slug": "python", "thumbnailUrl": "..." } }
    ]
  }
}
```

### GET `/users/me/payments`
```json
// 200
{
  "success": true,
  "data": {
    "payments": [
      { "_id": "...", "status": "paid", "amount": 1999900, "razorpayOrderId": "order_...", "course": { "title": "Python" } }
    ]
  }
}
```

---

## Enquiries (Public) — `/api/enquiries`

| Method | Endpoint | Auth | Rate Limit |
|--------|----------|------|-----------|
| POST | `/enquiries` | None | 5/15min per IP |

### POST `/enquiries`
```json
// Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "message": "I am interested in the DevOps course.",
  "type": "enquiry",     // "enquiry" | "demo" (default: "enquiry")
  "course": "64abc..."   // Optional course ObjectId
}

// 201
{ "success": true, "data": { "enquiry": { "_id": "...", "status": "new" } }, "message": "Enquiry submitted. We will get back to you shortly." }

// 400 — validation error
{ "success": false, "data": null, "message": "Validation failed", "errors": [...] }
```

---

## Admin — `/api/admin`

All endpoints require `Authorization: Bearer <adminToken>`.

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Dashboard summary |

#### GET `/admin/stats`
```json
// 200
{
  "success": true,
  "data": {
    "totalStudents": 11,
    "totalRevenuePaise": 12599400,
    "activeEnrollments": 8,
    "newEnquiries": 1,
    "totalCourses": 6
  }
}
```

---

### Admin Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/courses` | List all (incl. drafts) + pagination |
| POST | `/admin/courses` | Create course |
| PUT | `/admin/courses/:id` | Update course |
| DELETE | `/admin/courses/:id` | Soft delete (unpublish) |
| POST | `/admin/upload` | Upload thumbnail to Cloudinary |

#### POST `/admin/courses`
```json
// Body
{
  "title": "React Advanced",
  "shortDescription": "Deep dive into React",
  "description": "Full markdown description...",
  "category": "web-development",
  "price": 1999900,
  "discountPrice": 1499900,
  "isPublished": true,
  "syllabus": [
    {
      "title": "Module 1 — Hooks",
      "lessons": [
        { "title": "useState", "videoUrl": "https://...", "duration": 1200, "isPreview": true }
      ]
    }
  ]
}

// 201
{ "success": true, "data": { "course": {...} }, "message": "Course created" }
```

#### POST `/admin/upload`
```
Content-Type: multipart/form-data
Field name: image
Max size: 2 MB, allowed types: jpg, png, webp

// 200
{ "success": true, "data": { "url": "https://res.cloudinary.com/...", "publicId": "jobmansion/...", "bytes": 123456, "format": "jpg" } }
```

---

### Admin Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List users with search + pagination |
| PATCH | `/admin/users/:id/status` | Block or unblock a user |

#### GET `/admin/users`
```
Query params:
  ?search=Jane       (name or email, case-insensitive)
  ?page=1
  ?limit=20

// 200
{
  "success": true,
  "data": {
    "users": [{ "_id": "...", "name": "...", "email": "...", "role": "user", "isActive": true }],
    "pagination": { "page": 1, "limit": 20, "total": 11, "pages": 1 }
  }
}
```

#### PATCH `/admin/users/:id/status`
```json
// Body
{ "isActive": false }   // false = block, true = unblock

// 200
{ "success": true, "data": { "user": { "_id": "...", "isActive": false } }, "message": "User blocked successfully" }

// 400 — if admin tries to block themselves
{ "success": false, "message": "You cannot change your own account status" }
```

---

### Admin Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/payments` | List payments with filters + pagination |
| POST | `/admin/payments/:id/refund` | Trigger Razorpay refund |
| POST | `/admin/enrollments` | Manually enroll a user |

#### GET `/admin/payments`
```
Query params:
  ?status=paid           (created | paid | failed | refunded)
  ?from=2024-01-01
  ?to=2024-12-31
  ?page=1
  ?limit=20

// 200
{
  "success": true,
  "data": {
    "payments": [
      { "_id": "...", "status": "paid", "amount": 1999900, "user": { "name": "...", "email": "..." }, "course": { "title": "..." } }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 8, "pages": 1 }
  }
}
```

#### POST `/admin/payments/:id/refund`
```json
// No body required

// 200
{ "success": true, "data": { "refundId": "rfnd_...", "amount": 1999900 }, "message": "Refund initiated" }
```

#### POST `/admin/enrollments`
```json
// Body
{ "userId": "64abc...", "courseId": "64def..." }

// 201
{ "success": true, "data": { "enrollment": {...} }, "message": "Enrollment created successfully" }
```

---

### Admin Enquiries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/enquiries` | List enquiries with filters + pagination |
| PATCH | `/admin/enquiries/:id` | Update status |

#### GET `/admin/enquiries`
```
Query params:
  ?status=new            (new | contacted | closed)
  ?page=1
  ?limit=20

// 200
{
  "success": true,
  "data": {
    "enquiries": [
      { "_id": "...", "name": "John", "email": "...", "status": "new", "type": "enquiry", "message": "..." }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
  }
}
```

#### PATCH `/admin/enquiries/:id`
```json
// Body
{ "status": "contacted" }   // new | contacted | closed

// 200
{ "success": true, "data": { "enquiry": { "_id": "...", "status": "contacted" } }, "message": "Enquiry status updated" }
```

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Validation failed / bad request |
| 401 | Missing or invalid access token |
| 403 | Insufficient role (not admin) |
| 404 | Resource not found |
| 409 | Conflict (e.g. already enrolled) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

```json
// Error shape
{ "success": false, "data": null, "message": "Human-readable error message" }
// Validation errors also include:
{ "errors": [{ "field": "email", "message": "Invalid email" }] }
```
