# Job Mansion — Working Rules

> These rules apply to **every** task in this project.
> Source of truth: _Job Mansion Ed Tech Platform Project Guide.pdf_

---

## 1. Project Identity

Job Mansion is an Ed-Tech website for software course training.
Two account roles only: **user** (student) and **admin** — nothing else.
The first admin is created by a seed script, never through public registration.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite, JavaScript (no TypeScript) |
| Styling | Tailwind CSS |
| Routing | React Router |
| Server state | React Query + Context for auth |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Payments | Razorpay |
| Images | Cloudinary |
| Email | Nodemailer (Gmail SMTP) or Resend |

## 3. Monorepo Structure

```
Job Mansion/
  server/          # Express API
  client/          # React SPA (Vite)
  docs/            # This file and other docs
```

Do not nest one inside the other. Each has its own `package.json`.

## 4. Backend Layering

```
routes  →  controllers  →  services  →  models
```

- **Routes** define endpoints and attach middleware (auth, validation, rate-limit).
- **Controllers** handle the request/response cycle; no business logic.
- **Services** contain business logic and talk to models.
- **Models** are Mongoose schemas; keep them thin.
- **Middleware**: `authenticate`, `authorize`, `validate`, `rateLimit`, `errorHandler`.

### Folder layout (inside `server/src/`)

```
config/        db.js, env.js, razorpay.js, cloudinary.js
models/        User.js, Course.js, Enrollment.js, Payment.js, Enquiry.js
routes/        auth.routes.js, course.routes.js, payment.routes.js, ...
controllers/   one file per route group
services/      payment.service.js, email.service.js, enrollment.service.js, ...
middleware/    authenticate.js, authorize.js, validate.js, rateLimit.js, errorHandler.js
validators/    Zod schemas per resource
utils/         generateToken.js, apiError.js, asyncHandler.js
seed/          createAdmin.js, sampleCourses.js
app.js         Express setup, middleware, routes
server.js      Starts the server
```

## 5. Configuration & Secrets

- All config comes from **environment variables** (loaded via `dotenv`).
- **Never** hardcode secrets, URIs, or API keys.
- Keep `.env.example` up to date with every new variable (values blank or example-only).
- `.env` is git-ignored.

### Required variables

```env
# server
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=

# client
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=
```

## 6. Money & Prices

- All prices are stored in **paise** as integers — never as floats.
- The **server** reads the price from the database when creating a Razorpay order; never trust a price sent from the client.
- Currency is always `INR`.

## 7. Validation

- Validate **every** request body with **Zod** schemas (in `validators/`).
- The `validate` middleware wraps Zod parsing and returns a 400 with details on failure.
- Client-side validation (React Hook Form + Zod) is for UX only; the server is the enforcer.

## 8. API Response Shape

Every JSON response follows this shape:

```json
{
  "success": true,
  "data": { ... },
  "message": "Course created"
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [ ... ]       // optional, for field-level detail
}
```

Base path: `/api`. All endpoints are prefixed with it.

## 9. Authentication & Authorization

- Passwords hashed with **bcrypt** (cost 10–12).
- Access token: short-lived (~15 min), kept in memory on the client.
- Refresh token: longer-lived (~7 days), sent as an `httpOnly`, `secure`, `sameSite` cookie.
- Refresh-token rotation: server stores only the hash.
- Every admin route: `router.use(authenticate, authorize('admin'))`.
- Frontend guards (`ProtectedRoute`, `AdminRoute`) are for UX; enforcement is server-side.

## 10. Security Rules

- Never log or return password hashes.
- CORS: allow only the real frontend origin(s).
- Use `helmet` for security headers.
- Rate-limit: login, register, forgot-password, enquiry.
- Use `express-mongo-sanitize` against NoSQL injection.
- Verify Razorpay payment signatures **and** webhook signatures.
- Never expose lesson video URLs in public course responses.
- Central error handler hides stack traces in production.

## 11. Code Style

- **JavaScript** only (no TypeScript).
- Write clear, simple code with short comments where intent isn't obvious.
- No unnecessary libraries — use only what the spec calls for.
- Consistent file naming: `camelCase.js` for utils, `PascalCase.js` for models/components.

## 12. Frontend Structure (inside `client/src/`)

```
api/           Axios instance + one file per resource
components/    ui/, layout/, course/, forms/
context/       AuthContext.jsx
hooks/         useAuth, useCourses, usePayment
pages/
  public/      Home, Courses, CourseDetail, About, Contact, Login, Register
  user/        Dashboard, MyCourses, CoursePlayer, Payments, Profile
  admin/       Dashboard, Courses, CourseForm, Students, Payments, Enquiries
routes/        ProtectedRoute.jsx, AdminRoute.jsx, index.jsx
utils/         formatCurrency, formatDate
main.jsx
```

## 13. Payments Flow (Razorpay)

1. **Create order** (server): read price from DB, create Razorpay order, save `Payment` with status `created`.
2. **Checkout** (client): open Razorpay checkout with `keyId` + `orderId`.
3. **Verify** (server): check HMAC signature, mark `Payment` as `paid`, create `Enrollment`.
4. **Webhook** (server, backup): handle `payment.captured`/`order.paid` idempotently.

All steps must be **idempotent** — no duplicate enrollments.

## 14. Database Models

Five collections: **User**, **Course**, **Enrollment**, **Payment**, **Enquiry**.

Key indexes:
- `Course.slug` (unique), `Course.category`, `Course.isPublished`, text index on `title` + `description`.
- `Enrollment` compound index `(user, course)` unique.
- `Payment.razorpayOrderId` unique.

## 15. Deployment Targets

| Part | Host |
|---|---|
| Frontend | Vercel or Netlify |
| Backend | Render |
| Database | MongoDB Atlas M0 |
| Images | Cloudinary |
| Domain | GoDaddy (DNS only) |

Git branches: `dev` for WIP, `main` for production.

## 16. Task Completion Checklist

After finishing **every** task, provide:
1. Exact commands to run and verify the work.
2. Any new env vars that need to be set (update `.env.example`).
3. What was done and what's next.
