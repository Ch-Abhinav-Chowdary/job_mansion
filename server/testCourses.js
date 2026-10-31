/**
 * Test script to verify the Course endpoints (Public & Admin) and Cloudinary upload.
 * Run with: node testCourses.js
 */
const mongoose = require('mongoose');
const { MONGO_URI } = require('./src/config/env');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
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
    let adminToken = '';
    let sampleCourseId = '';
    let sampleCourseSlug = '';
    let studentUserId = '';

    // 0. Setup: Obtain student token and admin token
    printStep('0. Authenticate Student and Admin users');
    const freshStudentEmail = `course_student_${Date.now()}@test.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Course Student', email: freshStudentEmail, password: 'Password@123' }),
    });
    const regData = await regRes.json();
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: freshStudentEmail, password: 'Password@123' }),
    });
    const studentData = await loginRes.json();
    studentToken = studentData.data.accessToken;
    studentUserId = studentData.data.user._id;

    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@jobmansion.com', password: 'Admin@12345' }),
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.data.accessToken;
    console.log('✓ PASS: Student and Admin tokens acquired.');

    // 1. GET /api/courses (Public Catalog with pagination)
    printStep('1. GET /api/courses with default pagination');
    const listRes = await fetch(`${BASE_URL}/courses`);
    const listData = await listRes.json();
    console.log(`Status: ${listRes.status} (Expected: 200)`);
    console.log(`Total published courses: ${listData.data?.pagination?.total}`);
    console.log(`Page: ${listData.data?.pagination?.page}, Limit: ${listData.data?.pagination?.limit}, TotalPages: ${listData.data?.pagination?.totalPages}`);
    if (listRes.status !== 200 || !listData.data?.courses?.length) {
      throw new Error('Failed to retrieve course list');
    }
    sampleCourseId = listData.data.courses[0]._id;
    sampleCourseSlug = listData.data.courses[0].slug;
    console.log(`Sample course: "${listData.data.courses[0].title}" (Slug: ${sampleCourseSlug})`);
    console.log('✓ PASS: Course catalog returned with pagination info.');

    // 2. GET /api/courses with filters (?category= and ?search=)
    printStep('2. GET /api/courses with ?category=Data and ?search=Python');
    const catRes = await fetch(`${BASE_URL}/courses?category=Data`);
    const catData = await catRes.json();
    console.log(`Category filter ("Data"): returned ${catData.data?.courses?.length} courses`);
    const allData = catData.data.courses.every((c) => c.category === 'Data');
    if (!allData) throw new Error('Category filter returned mismatched courses');

    const searchRes = await fetch(`${BASE_URL}/courses?search=Python`);
    const searchData = await searchRes.json();
    console.log(`Text search filter ("Python"): returned ${searchData.data?.courses?.length} courses`);
    console.log('✓ PASS: Query filters (?category and ?search) working accurately.');

    // 3. GET /api/courses/:slug (Verify lesson video protection)
    printStep(`3. GET /api/courses/${sampleCourseSlug} (Check videoUrl security)`);
    const slugRes = await fetch(`${BASE_URL}/courses/${sampleCourseSlug}`);
    const slugData = await slugRes.json();
    console.log(`Status: ${slugRes.status} (Expected: 200)`);
    const courseDetail = slugData.data.course;
    console.log(`Course title: ${courseDetail.title}`);
    console.log(`Lessons count: ${courseDetail.lessons?.length}`);

    // Verify non-preview lesson videoUrl is NOT exposed
    let exposedSecretVideo = false;
    let previewVideoFound = false;
    for (const l of courseDetail.lessons) {
      if (!l.isPreview && l.videoUrl) {
        exposedSecretVideo = true;
      }
      if (l.isPreview && l.videoUrl) {
        previewVideoFound = true;
      }
    }
    if (exposedSecretVideo) {
      throw new Error('Security flaw! Non-preview lesson videoUrl was exposed in public endpoint');
    }
    console.log(`Non-preview lesson videoUrls exposed: ${exposedSecretVideo ? 'YES (BUG)' : 'NONE (SECURE)'}`);
    console.log(`Preview lesson videoUrls present: ${previewVideoFound ? 'YES (CORRECT)' : 'NONE'}`);
    console.log('✓ PASS: Public course detail protects paid video URLs while showing preview videos.');

    // 4. GET /api/courses/:id/content (Access Control)
    printStep('4. GET /api/courses/:id/content — Unauthenticated (Expect 401)');
    const unauthRes = await fetch(`${BASE_URL}/courses/${sampleCourseId}/content`);
    console.log(`Status: ${unauthRes.status} (Expected: 401)`);
    if (unauthRes.status !== 401) throw new Error(`Expected 401 but got ${unauthRes.status}`);
    console.log('✓ PASS: Rejected unauthenticated request with 401.');

    printStep('5. GET /api/courses/:id/content — Authenticated Not-Enrolled (Expect 403)');
    const notEnrolledRes = await fetch(`${BASE_URL}/courses/${sampleCourseId}/content`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`Status: ${notEnrolledRes.status} (Expected: 403)`);
    const notEnrolledData = await notEnrolledRes.json();
    console.log(`Response message: "${notEnrolledData.message}"`);
    if (notEnrolledRes.status !== 403) throw new Error(`Expected 403 but got ${notEnrolledRes.status}`);
    console.log('✓ PASS: Rejected not-enrolled user with 403 Forbidden.');

    printStep('6. GET /api/courses/:id/content — Authenticated Enrolled (Expect 200)');
    // Seed an active enrollment for the student
    await mongoose.connect(MONGO_URI);
    await Enrollment.findOneAndUpdate(
      { user: studentUserId, course: sampleCourseId },
      { user: studentUserId, course: sampleCourseId, status: 'active', enrolledAt: new Date() },
      { upsert: true, new: true }
    );
    await mongoose.connection.close();

    const enrolledRes = await fetch(`${BASE_URL}/courses/${sampleCourseId}/content`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`Status: ${enrolledRes.status} (Expected: 200)`);
    const enrolledData = await enrolledRes.json();
    console.log(`Full lessons retrieved: ${enrolledData.data?.lessons?.length}`);
    const hasAllVideos = enrolledData.data?.lessons?.every((l) => Boolean(l.videoUrl));
    if (enrolledRes.status !== 200 || !hasAllVideos) {
      throw new Error('Enrolled student failed to receive all lesson video URLs');
    }
    console.log('✓ PASS: Enrolled student granted full course video access.');

    printStep('7. GET /api/courses/:id/content — Admin User (Bypasses Enrollment, Expect 200)');
    const adminContentRes = await fetch(`${BASE_URL}/courses/${sampleCourseId}/content`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Status: ${adminContentRes.status} (Expected: 200)`);
    if (adminContentRes.status !== 200) throw new Error(`Admin expected 200 but got ${adminContentRes.status}`);
    console.log('✓ PASS: Admin bypassed enrollment check and retrieved full lessons.');

    // 8. ADMIN: POST /api/admin/courses as normal user (Expect 403)
    printStep('8. POST /api/admin/courses as normal student user (Expect 403)');
    const studentCreate = await fetch(`${BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Hacker Course',
        category: 'Hacking',
        price: 100000,
      }),
    });
    console.log(`Status: ${studentCreate.status} (Expected: 403)`);
    if (studentCreate.status !== 403) throw new Error(`Expected 403 for non-admin but got ${studentCreate.status}`);
    console.log('✓ PASS: Normal user blocked from course creation (403).');

    // 9. ADMIN: POST /api/admin/courses with invalid price (Expect 400 Zod Error)
    printStep('9. POST /api/admin/courses with non-integer paise price (Expect 400)');
    const invalidPriceRes = await fetch(`${BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Invalid Price Course',
        category: 'Testing',
        price: 199.99, // Float instead of integer paise!
      }),
    });
    console.log(`Status: ${invalidPriceRes.status} (Expected: 400)`);
    const invalidPriceData = await invalidPriceRes.json();
    console.log(`Validation message:`, invalidPriceData.errors || invalidPriceData.message);
    if (invalidPriceRes.status !== 400) throw new Error('Expected 400 for float price');
    console.log('✓ PASS: Zod validation rejected non-integer paise price.');

    // 10. ADMIN: POST /api/admin/courses as admin (Expect 201)
    printStep('10. POST /api/admin/courses with valid body as admin (Expect 201)');
    const newCoursePayload = {
      title: `Cloud Architecture with AWS & GCP ${Date.now()}`,
      category: 'Cloud',
      shortDescription: 'Master modern multi-cloud architectures.',
      description: 'In-depth multi-cloud design, networking, and serverless engineering.',
      price: 2999900, // ₹29,999 in paise
      discountPrice: 2499900,
      duration: '4 months',
      mode: 'online',
      level: 'advanced',
      isPublished: true,
      syllabus: [
        { title: 'Module 1: AWS Core Services', topics: ['VPC, Subnets, Gateways', 'EC2, ECS, and Lambda'] },
      ],
      lessons: [
        { title: '01. Architecture Overview', videoUrl: 'https://youtube.com/watch?v=demo1', order: 1, isPreview: true },
        { title: '02. Private VPC Design', videoUrl: 'https://youtube.com/watch?v=demo2', order: 2, isPreview: false },
      ],
    };
    const createRes = await fetch(`${BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newCoursePayload),
    });
    console.log(`Status: ${createRes.status} (Expected: 201)`);
    const createData = await createRes.json();
    const createdCourse = createData.data?.course;
    console.log(`Created course ID: ${createdCourse?._id}`);
    console.log(`Auto-generated Slug: "${createdCourse?.slug}"`);
    if (createRes.status !== 201 || !createdCourse?._id || !createdCourse?.slug) {
      throw new Error('Course creation failed');
    }
    console.log('✓ PASS: Admin created course with auto-generated slug.');

    // 11. ADMIN: PUT /api/admin/courses/:id
    printStep(`11. PUT /api/admin/courses/${createdCourse._id} (Update price)`);
    const updateRes = await fetch(`${BASE_URL}/admin/courses/${createdCourse._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 3499900, // Updated price in paise
        shortDescription: 'Updated: Master cutting-edge multi-cloud architectures.',
      }),
    });
    console.log(`Status: ${updateRes.status} (Expected: 200)`);
    const updateData = await updateRes.json();
    console.log(`Updated price: ${updateData.data?.course?.price} paise`);
    if (updateRes.status !== 200 || updateData.data?.course?.price !== 3499900) {
      throw new Error('Failed to update course');
    }
    console.log('✓ PASS: Course updated successfully by admin.');

    // 12. ADMIN: DELETE /api/admin/courses/:id (Soft delete)
    printStep(`12. DELETE /api/admin/courses/${createdCourse._id} (Soft delete -> isPublished: false)`);
    const deleteRes = await fetch(`${BASE_URL}/admin/courses/${createdCourse._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Status: ${deleteRes.status} (Expected: 200)`);
    const deleteData = await deleteRes.json();
    console.log(`isPublished after soft-delete: ${deleteData.data?.course?.isPublished}`);
    if (deleteRes.status !== 200 || deleteData.data?.course?.isPublished !== false) {
      throw new Error('Soft delete failed to set isPublished: false');
    }

    // Verify it is no longer returned in public list
    const verifyPubList = await fetch(`${BASE_URL}/courses?search=${encodeURIComponent(newCoursePayload.title)}`);
    const verifyPubData = await verifyPubList.json();
    const foundInPublic = verifyPubData.data?.courses?.some((c) => c._id === createdCourse._id);
    console.log(`Found in public catalog after delete: ${foundInPublic ? 'YES (BUG)' : 'NO (CORRECT)'}`);
    if (foundInPublic) throw new Error('Unpublished course appeared in public listing');
    console.log('✓ PASS: Course soft-deleted and removed from public catalog.');

    // 13. ADMIN: POST /api/admin/upload (Multer -> Cloudinary)
    printStep('13. POST /api/admin/upload (Upload image to Cloudinary)');
    // Create a minimal 1x1 valid PNG buffer in memory
    const png1x1Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(png1x1Base64, 'base64');
    const blob = new Blob([pngBuffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('image', blob, 'thumbnail_test.png');

    const uploadRes = await fetch(`${BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });
    console.log(`Status: ${uploadRes.status} (Expected: 200)`);
    const uploadData = await uploadRes.json();
    console.log(`Cloudinary Upload Response:`, JSON.stringify(uploadData, null, 2));
    if (uploadRes.status !== 200 || !uploadData.data?.url) {
      throw new Error('Cloudinary image upload failed');
    }
    console.log(`Uploaded Image URL: ${uploadData.data.url}`);
    console.log('✓ PASS: Image uploaded to Cloudinary successfully via Multer memory storage.');

    console.log('\n======================================================');
    console.log('🎉 ALL 13 PUBLIC AND ADMIN COURSE TESTS PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
};

runTests();
