# Testing Guide — Job Mansion

This document provides complete instructions on how to test the **Razorpay Payment Gateway**, **Webhooks**, and **Authentication & Course** workflows both locally and in staging environments.

---

## 1. Razorpay Test Keys Setup

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle the dashboard to **Test Mode** (switch in the top navigation bar).
3. Go to **Settings** → **API Keys** → **Generate Test Key**.
4. Copy the generated **Key ID** and **Key Secret**.
5. Paste them into `server/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_yourKeyHere
   RAZORPAY_KEY_SECRET=yourKeySecretHere
   RAZORPAY_WEBHOOK_SECRET=yourWebhookSecretHere
   ```
6. Also set the public Key ID in `client/.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_yourKeyHere
   ```

---

## 2. Testing Webhooks Locally via Tunnel

Because Razorpay servers send webhooks over public HTTPS, you need a tunnel tool to forward webhook requests to your local Express server running on `localhost:5000`.

### Option A: Using ngrok (Recommended)

1. **Install or run ngrok**:
   ```bash
   npx ngrok http 5000
   ```
   *(Or if ngrok is installed globally: `ngrok http 5000`)*

2. **Copy the Forwarding HTTPS URL**:
   ngrok will display an HTTPS URL like:
   `https://a1b2-c3d4.ngrok-free.app`

3. **Construct your Webhook URL**:
   `https://a1b2-c3d4.ngrok-free.app/api/payments/webhook`

### Option B: Using Cloudflare Tunnel (Free, no account required)

```bash
npx cloudflared tunnel --url http://localhost:5000
```
Copy the generated `https://<random>.trycloudflare.com/api/payments/webhook` URL.

---

## 3. Configuring Webhook in Razorpay Dashboard

1. In Razorpay Dashboard (in **Test Mode**), navigate to **Settings** → **Webhooks**.
2. Click **Add New Webhook**.
3. Fill in the fields:
   - **Webhook URL**: `https://<your-tunnel-url>/api/payments/webhook`
   - **Secret**: Enter the exact secret string you put in `server/.env` as `RAZORPAY_WEBHOOK_SECRET`.
   - **Alert Email**: Enter your developer email.
4. Under **Active Events**, check the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
   - `refund.created`
5. Click **Save Webhook**.

---

## 4. Razorpay Test Payment Credentials

When checking out with the Razorpay modal in Test Mode, use these official test credentials:

### A. Test Cards
- **Card Number**: `4111 1111 1111 1111` (Visa) or `5123 4567 8901 2345` (Mastercard)
- **Expiry**: Any future month/year (e.g., `12/30`)
- **CVV**: `123`
- **OTP**: Enter `123456` on the Razorpay simulated bank page.

### B. Test UPI
- **Success UPI ID**: `success@razorpay` (always succeeds immediately)
- **Failure UPI ID**: `failure@razorpay` (simulates failed transaction)

---

## 5. Automated Backend Test Suites

The project includes automated regression test scripts for every backend domain. Run them from the `server/` directory:

```bash
# 1. Test Authentication & Role Authorization (11 tests)
npm run test:auth

# 2. Test Course Catalog, Slug Details, Video Protection & Admin CRUD (13 tests)
npm run test:courses

# 3. Test Payments, HMAC Signatures, Webhooks & Refunds (8 tests)
npm run test:payments
```
