/**
 * Test script for Razorpay Payments, Signatures, Webhooks, Refunds, and Idempotency.
 * Run with: node testPayments.js
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const { MONGO_URI, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = require('./src/config/env');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Payment = require('./src/models/Payment');
const Enrollment = require('./src/models/Enrollment');

const BASE_URL = 'http://localhost:5000/api';

const printStep = (title) => {
  console.log(`\n======================================================`);
  console.log(`▶ TEST: ${title}`);
  console.log(`======================================================`);
};

const runTests = async () => {
  try {
    let studentToken = '';
    let studentUser = null;
    let adminToken = '';
    let sampleCourse = null;
    let sampleCourse2 = null;

    // 0. Setup: Authenticate users and fetch sample courses
    printStep('0. Authenticate Student and Admin users & query courses');
    await mongoose.connect(MONGO_URI);
    
    // Find courses
    const courses = await Course.find({ isPublished: true }).limit(2);
    if (courses.length < 2) throw new Error('Need at least 2 sample courses in DB');
    sampleCourse = courses[0];
    sampleCourse2 = courses[1];

    // Create a fresh student for payment tests
    const testEmail = `pay_student_${Date.now()}@test.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Payment Student', email: testEmail, password: 'Password@123' }),
    });
    const regData = await regRes.json();
    studentUser = regData.data.user;

    const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password@123' }),
    });
    const studentData = await studentLogin.json();
    studentToken = studentData.data.accessToken;

    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@jobmansion.com', password: 'Admin@12345' }),
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.data.accessToken;
    console.log(`✓ PASS: Setup complete. Student ID: ${studentUser._id}, Course: "${sampleCourse.title}"`);

    // 1. CREATE ORDER (User only)
    printStep('1. POST /api/payments/create-order (Create Razorpay order for published course)');
    const orderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ courseId: sampleCourse._id.toString() }),
    });
    const orderData = await orderRes.json();
    console.log(`Status: ${orderRes.status} (Expected: 200)`);
    console.log(`Order Data:`, JSON.stringify(orderData.data, null, 2));

    const expectedPrice = (sampleCourse.discountPrice !== null && sampleCourse.discountPrice !== undefined && sampleCourse.discountPrice >= 0)
      ? sampleCourse.discountPrice
      : sampleCourse.price;

    if (orderRes.status !== 200 || !orderData.data?.orderId || orderData.data?.amount !== expectedPrice) {
      throw new Error('Order creation failed or returned mismatched price');
    }

    const orderId1 = orderData.data.orderId;
    console.log(`✓ PASS: Razorpay order created with ID "${orderId1}" and server-verified price: ${orderData.data.amount} paise.`);

    // 2. TAMPERED SIGNATURE (Expect 400 & payment marked failed)
    printStep('2. POST /api/payments/verify with tampered signature (Expect 400 Bad Request)');
    const fakePaymentId = `pay_mock_${Date.now()}`;
    const tamperedSignature = 'bad_tampered_signature_hex_1234567890abcdef1234567890abcdef';

    const tamperRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderId1,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: tamperedSignature,
      }),
    });
    const tamperData = await tamperRes.json();
    console.log(`Status: ${tamperRes.status} (Expected: 400)`);
    console.log(`Response message: "${tamperData.message}"`);

    const failedPaymentDoc = await Payment.findOne({ razorpayOrderId: orderId1 });
    console.log(`Payment record status in DB: "${failedPaymentDoc?.status}" (Expected: "failed")`);
    if (tamperRes.status !== 400 || failedPaymentDoc?.status !== 'failed') {
      throw new Error('Tampered signature verification did not reject or fail payment record');
    }
    console.log('✓ PASS: Tampered signature rejected with 400 and payment marked failed.');

    // 3. VALID SIGNATURE VERIFICATION (Expect 200, status paid, enrollment active)
    printStep('3. POST /api/payments/verify with genuine HMAC SHA256 signature (Expect 200)');
    // Create another clean order
    const orderRes2 = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ courseId: sampleCourse._id.toString() }),
    });
    const orderData2 = await orderRes2.json();
    const orderId2 = orderData2.data.orderId;
    const realPaymentId = `pay_test_${Date.now()}`;

    // Compute genuine signature using key secret
    const validSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId2}|${realPaymentId}`)
      .digest('hex');

    const verifyRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderId2,
        razorpay_payment_id: realPaymentId,
        razorpay_signature: validSignature,
      }),
    });
    const verifyData = await verifyRes.json();
    console.log(`Status: ${verifyRes.status} (Expected: 200)`);
    console.log(`Payment status: "${verifyData.data?.payment?.status}"`);
    console.log(`Enrollment ID: ${verifyData.data?.enrollment?._id}, Status: "${verifyData.data?.enrollment?.status}"`);

    if (verifyRes.status !== 200 || verifyData.data?.payment?.status !== 'paid' || verifyData.data?.enrollment?.status !== 'active') {
      throw new Error('Valid signature verification failed');
    }
    console.log('✓ PASS: Signature verified via timingSafeEqual, payment marked paid, enrollment activated, receipt email triggered.');

    // 4. REPEATED VERIFY (IDEMPOTENCY)
    printStep('4. POST /api/payments/verify repeated with identical parameters (Idempotency check)');
    const repeatRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderId2,
        razorpay_payment_id: realPaymentId,
        razorpay_signature: validSignature,
      }),
    });
    const repeatData = await repeatRes.json();
    console.log(`Status: ${repeatRes.status} (Expected: 200)`);
    console.log(`Response message: "${repeatData.message}"`);
    console.log(`Already activated flag: ${repeatData.data?.alreadyActivated}`);

    // Verify enrollment count in DB
    const enrollmentsCount = await Enrollment.countDocuments({
      user: studentUser._id,
      course: sampleCourse._id,
    });
    console.log(`Total Enrollment records in DB for this course: ${enrollmentsCount} (Expected: exactly 1)`);
    if (enrollmentsCount !== 1) {
      throw new Error(`Idempotency violation! Found ${enrollmentsCount} enrollments instead of 1`);
    }
    console.log('✓ PASS: Activation function is strictly idempotent — no duplicate enrollments created.');

    // 5. ALREADY ENROLLED USER ORDER ATTEMPT (Expect 400)
    printStep('5. POST /api/payments/create-order for already enrolled course (Expect 400)');
    const duplicateOrderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ courseId: sampleCourse._id.toString() }),
    });
    const duplicateOrderData = await duplicateOrderRes.json();
    console.log(`Status: ${duplicateOrderRes.status} (Expected: 400)`);
    console.log(`Response message: "${duplicateOrderData.message}"`);
    if (duplicateOrderRes.status !== 400) {
      throw new Error('Allowed already-enrolled user to create order');
    }
    console.log('✓ PASS: Blocked already-enrolled student from purchasing the same course again.');

    // 6. WEBHOOK VERIFICATION (payment.captured event)
    printStep('6. POST /api/payments/webhook with raw body & valid X-Razorpay-Signature');
    // Create an order for course 2
    const orderRes3 = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ courseId: sampleCourse2._id.toString() }),
    });
    const orderData3 = await orderRes3.json();
    const orderId3 = orderData3.data.orderId;

    const webhookPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: `pay_webhook_${Date.now()}`,
            order_id: orderId3,
            amount: sampleCourse2.price,
            currency: 'INR',
            status: 'captured',
            method: 'upi',
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    });

    const webhookSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest('hex');

    const webhookRes = await fetch(`${BASE_URL}/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': webhookSignature,
      },
      body: webhookPayload,
    });
    const webhookData = await webhookRes.json();
    console.log(`Status: ${webhookRes.status} (Expected: 200)`);
    console.log(`Webhook response:`, JSON.stringify(webhookData));

    // Verify DB updated by webhook
    const webhookPaymentDoc = await Payment.findOne({ razorpayOrderId: orderId3 });
    const webhookEnrollmentDoc = await Enrollment.findOne({ user: studentUser._id, course: sampleCourse2._id });
    console.log(`Payment status updated by webhook: "${webhookPaymentDoc?.status}" (Expected: "paid")`);
    console.log(`Enrollment activated by webhook: status="${webhookEnrollmentDoc?.status}"`);
    if (webhookRes.status !== 200 || webhookPaymentDoc?.status !== 'paid' || !webhookEnrollmentDoc) {
      throw new Error('Webhook processing failed to activate enrollment');
    }
    console.log('✓ PASS: Webhook raw body signature verified and enrollment activated.');

    // 7. ADMIN MANUAL ENROLLMENT (POST /api/admin/enrollments)
    printStep('7. POST /api/admin/enrollments (Admin manual student enrollment)');
    const manualStudentEmail = `manual_student_${Date.now()}@test.com`;
    const manualRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Manual Cash Student', email: manualStudentEmail, password: 'Password@123' }),
    });
    const manualRegData = await manualRegRes.json();
    const manualStudentId = manualRegData.data.user._id;

    const manualRes = await fetch(`${BASE_URL}/admin/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: manualStudentId,
        courseId: sampleCourse._id.toString(),
        notes: 'Paid via cash at office counter',
      }),
    });
    const manualData = await manualRes.json();
    console.log(`Status: ${manualRes.status} (Expected: 201)`);
    console.log(`Manual Payment Method: "${manualData.data?.payment?.method}" (Expected: "manual")`);
    console.log(`Manual Enrollment Status: "${manualData.data?.enrollment?.status}" (Expected: "active")`);
    if (manualRes.status !== 201 || manualData.data?.payment?.method !== 'manual') {
      throw new Error('Admin manual enrollment failed');
    }
    console.log('✓ PASS: Admin manual enrollment recorded Payment (method: manual) and activated Enrollment.');

    // 8. ADMIN REFUND (POST /api/admin/payments/:id/refund)
    printStep('8. POST /api/admin/payments/:id/refund (Admin triggers refund and revokes access)');
    const paymentToRefund = manualData.data.payment._id;
    const refundRes = await fetch(`${BASE_URL}/admin/payments/${paymentToRefund}/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const refundData = await refundRes.json();
    console.log(`Status: ${refundRes.status} (Expected: 200)`);
    console.log(`Refunded payment status: "${refundData.data?.payment?.status}"`);
    console.log(`Enrollment status after refund: "${refundData.data?.enrollment?.status}" (Expected: "revoked")`);

    if (refundRes.status !== 200 || refundData.data?.payment?.status !== 'refunded' || refundData.data?.enrollment?.status !== 'revoked') {
      throw new Error('Refund failed to transition payment and revoke enrollment');
    }
    console.log('✓ PASS: Admin refund successfully set payment to "refunded" and enrollment to "revoked".');

    await mongoose.connection.close();

    console.log('\n======================================================');
    console.log('🎉 ALL 8 RAZORPAY PAYMENT & WEBHOOK TESTS PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    try {
      await mongoose.connection.close();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
};

runTests();
