process.env.NODE_ENV = 'test';
require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const connectDB = require('../src/config/db');
const seedDatabase = require('../src/config/seedData');

test.before(async () => {
  await connectDB();
  await seedDatabase();
});

test.after(async () => {
  await mongoose.disconnect();
});

test('1. Health check endpoint returns status UP and MongoDB backend info', async () => {
  const res = await request(app).get('/api/v1/health');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.status, 'UP');
  assert.strictEqual(res.body.data.database, 'MongoDB');
  assert.strictEqual(res.body.data.version, '1.0.0');
});

test('2. Categories endpoint returns active service categories', async () => {
  const res = await request(app).get('/api/v1/categories');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 6);
  assert.ok(res.body.data.some((c) => c.slug === 'plumbing'));
  assert.ok(res.body.data.some((c) => c.slug === 'electrical'));
});

test('3. Skills endpoint returns seeded skills including regular employment skills', async () => {
  const res = await request(app).get('/api/v1/skills');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 14);
  assert.ok(res.body.data.some((s) => s.name === 'Masonry'));
  assert.ok(res.body.data.some((s) => s.name === 'Retail Sales & Customer Service'));
});

test('4. Login with demo accounts returns valid JWT token and user summary', async () => {
  // Test Admin login
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@labourconnect.com', password: 'Admin@1234' });
  assert.strictEqual(adminRes.statusCode, 200);
  assert.strictEqual(adminRes.body.success, true);
  assert.ok(adminRes.body.data.accessToken);
  assert.ok(adminRes.body.data.user.roles.includes('ROLE_ADMIN'));

  // Test Employer login
  const empRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'employer@labourconnect.com', password: 'Employer@1234' });
  assert.strictEqual(empRes.statusCode, 200);
  assert.strictEqual(empRes.body.success, true);
  assert.ok(empRes.body.data.accessToken);
  assert.ok(empRes.body.data.user.roles.includes('ROLE_EMPLOYER'));

  // Test Worker login
  const workerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'worker@labourconnect.com', password: 'Worker@1234' });
  assert.strictEqual(workerRes.statusCode, 200);
  assert.strictEqual(workerRes.body.success, true);
  assert.ok(workerRes.body.data.accessToken);
  assert.ok(workerRes.body.data.user.roles.includes('ROLE_WORKER'));
});

test('5. Jobs search returns paginated jobs including regular employment', async () => {
  const res = await request(app).get('/api/v1/jobs?status=OPEN');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.content);
  assert.ok(res.body.data.content.length > 0);
  assert.ok(res.body.data.totalPages >= 1);
  assert.ok(res.body.data.totalElements >= 12);

  // Filter regular employment
  const regRes = await request(app).get('/api/v1/jobs?jobType=REGULAR');
  assert.strictEqual(regRes.statusCode, 200);
  assert.ok(regRes.body.data.content.length >= 4);
});

test('6. Service providers search returns verified providers', async () => {
  const res = await request(app).get('/api/v1/services/providers');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.content);
  assert.ok(res.body.data.content.length >= 4);
  assert.strictEqual(res.body.data.content[0].verificationStatus, 'APPROVED');
});

test('7. Admin stats and RBAC security enforcement', async () => {
  // Unauthorized without token
  const unauthRes = await request(app).get('/api/v1/admin/stats');
  assert.strictEqual(unauthRes.statusCode, 401);

  // Authenticate as worker (should get 403 Forbidden on admin endpoint)
  const workerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'worker@labourconnect.com', password: 'Worker@1234' });
  const workerToken = workerRes.body.data.accessToken;

  const forbiddenRes = await request(app)
    .get('/api/v1/admin/stats')
    .set('Authorization', `Bearer ${workerToken}`);
  assert.strictEqual(forbiddenRes.statusCode, 403);

  // Authenticate as admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@labourconnect.com', password: 'Admin@1234' });
  const adminToken = adminRes.body.data.accessToken;

  const adminStatsRes = await request(app)
    .get('/api/v1/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(adminStatsRes.statusCode, 200);
  assert.strictEqual(adminStatsRes.body.success, true);
  assert.ok(adminStatsRes.body.data.totalUsers >= 15);
  assert.ok(adminStatsRes.body.data.totalJobs >= 16);
  assert.ok(adminStatsRes.body.data.totalServiceRequests >= 8);
});

test('8. Worker application workflow', async () => {
  const workerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'worker@labourconnect.com', password: 'Worker@1234' });
  const workerToken = workerRes.body.data.accessToken;

  const myAppsRes = await request(app)
    .get('/api/v1/jobs/applications/my-applications')
    .set('Authorization', `Bearer ${workerToken}`);
  assert.strictEqual(myAppsRes.statusCode, 200);
  assert.ok(myAppsRes.body.data.content);
  assert.ok(myAppsRes.body.data.content.length > 0);
});

test('9. Role-based profile management (Worker & Employer)', async () => {
  // Worker profile fetch and update
  const workerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'worker@labourconnect.com', password: 'Worker@1234' });
  const workerToken = workerRes.body.data.accessToken;

  const getProfileRes = await request(app)
    .get('/api/v1/profiles/worker')
    .set('Authorization', `Bearer ${workerToken}`);
  assert.strictEqual(getProfileRes.statusCode, 200);
  assert.strictEqual(getProfileRes.body.success, true);
  assert.ok(getProfileRes.body.data.headline);

  const updateProfileRes = await request(app)
    .put('/api/v1/profiles/worker')
    .set('Authorization', `Bearer ${workerToken}`)
    .send({ headline: 'Senior Master Mason & Plaster Specialist', dailyRate: 1000 });
  assert.strictEqual(updateProfileRes.statusCode, 200);
  assert.strictEqual(updateProfileRes.body.data.headline, 'Senior Master Mason & Plaster Specialist');
  assert.strictEqual(updateProfileRes.body.data.dailyRate, 1000);
});

test('10. Service booking lifecycle (Customer & Provider)', async () => {
  // Customer creates a service request
  const custRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'customer@labourconnect.com', password: 'Customer@1234' });
  const custToken = custRes.body.data.accessToken;

  const createReqRes = await request(app)
    .post('/api/v1/requests')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      providerId: 1,
      categoryId: 1,
      title: 'Emergency bathroom pipe burst repair',
      description: 'Water leaking heavily from bathroom main inlet pipe.',
      serviceAddress: 'Flat 302, Green Glen Layout, Bellandur',
      city: 'Bangalore',
      estimatedCost: 500
    });
  assert.strictEqual(createReqRes.statusCode, 200);
  assert.strictEqual(createReqRes.body.success, true);
  const createdReqId = createReqRes.body.data.id;
  assert.strictEqual(createReqRes.body.data.status, 'REQUESTED');

  // Provider transitions status: REQUESTED -> ACCEPTED
  const provRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'provider@labourconnect.com', password: 'Provider@1234' });
  const provToken = provRes.body.data.accessToken;

  const acceptRes = await request(app)
    .put(`/api/v1/requests/${createdReqId}/status`)
    .set('Authorization', `Bearer ${provToken}`)
    .send({ status: 'ACCEPTED' });
  assert.strictEqual(acceptRes.statusCode, 200);
  assert.strictEqual(acceptRes.body.data.status, 'ACCEPTED');
});

test('11. Employer Job Creation, Worker Application, Review & Close Flow', async () => {
  // Employer logs in and posts a job
  const empRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'employer@labourconnect.com', password: 'Employer@1234' });
  const empToken = empRes.body.data.accessToken;
  const empUserId = empRes.body.data.user.id;

  const createJobRes = await request(app)
    .post('/api/v1/jobs')
    .set('Authorization', `Bearer ${empToken}`)
    .send({
      title: 'Full-time Warehouse Logistics Supervisor',
      description: 'Supervising dispatch, loading and packaging operations for e-commerce hub.',
      jobType: 'REGULAR',
      minMonthlySalary: 28000,
      maxMonthlySalary: 35000,
      workingHours: '9:00 AM - 6:00 PM (Mon-Sat)',
      city: 'Bangalore',
      area: 'Whitefield Industrial Area',
      requiredSkillIds: [8]
    });
  assert.strictEqual(createJobRes.statusCode, 200);
  assert.strictEqual(createJobRes.body.success, true);
  const createdJob = createJobRes.body.data;
  assert.strictEqual(createdJob.employerUserId, empUserId);
  assert.strictEqual(createdJob.status, 'OPEN');

  // Worker applies for this job
  const workerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'worker@labourconnect.com', password: 'Worker@1234' });
  const workerToken = workerRes.body.data.accessToken;

  const applyRes = await request(app)
    .post(`/api/v1/jobs/${createdJob.id}/apply`)
    .set('Authorization', `Bearer ${workerToken}`)
    .send({
      bidAmount: 30000,
      coverNote: 'I have 5 years experience managing retail inventory and warehouse dispatches.'
    });
  assert.strictEqual(applyRes.statusCode, 200);
  assert.strictEqual(applyRes.body.success, true);
  const applicationId = applyRes.body.data.id;
  assert.strictEqual(applyRes.body.data.status, 'APPLIED');

  // Employer reviews applications for this job
  const appListRes = await request(app)
    .get(`/api/v1/jobs/${createdJob.id}/applications`)
    .set('Authorization', `Bearer ${empToken}`);
  assert.strictEqual(appListRes.statusCode, 200);
  assert.ok(appListRes.body.data.content.some((a) => a.id === applicationId));

  // Employer updates applicant status to SHORTLISTED then ACCEPTED
  const shortlistRes = await request(app)
    .put(`/api/v1/jobs/applications/${applicationId}/status`)
    .set('Authorization', `Bearer ${empToken}`)
    .send({ status: 'SHORTLISTED' });
  assert.strictEqual(shortlistRes.statusCode, 200);
  assert.strictEqual(shortlistRes.body.data.status, 'SHORTLISTED');

  const hireRes = await request(app)
    .put(`/api/v1/jobs/applications/${applicationId}/status`)
    .set('Authorization', `Bearer ${empToken}`)
    .send({ status: 'ACCEPTED' });
  assert.strictEqual(hireRes.statusCode, 200);
  assert.strictEqual(hireRes.body.data.status, 'ACCEPTED');

  // Employer closes the job post
  const closeJobRes = await request(app)
    .delete(`/api/v1/jobs/${createdJob.id}`)
    .set('Authorization', `Bearer ${empToken}`);
  assert.strictEqual(closeJobRes.statusCode, 200);
  assert.strictEqual(closeJobRes.body.data.status, 'CLOSED');
});

test('12. Full Service Lifecycle & Review Submission', async () => {
  const custRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'customer@labourconnect.com', password: 'Customer@1234' });
  const custToken = custRes.body.data.accessToken;

  const provRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'provider@labourconnect.com', password: 'Provider@1234' });
  const provToken = provRes.body.data.accessToken;
  const provUserId = provRes.body.data.user.id;

  // 1. Create booking
  const createRes = await request(app)
    .post('/api/v1/requests')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      providerId: 1,
      categoryId: 2,
      title: 'Full home electrical wiring inspection',
      description: 'Check circuit breakers and rewire living room outlet.',
      serviceAddress: 'Plot 45, Indiranagar',
      city: 'Bangalore',
      estimatedCost: 800
    });
  assert.strictEqual(createRes.statusCode, 200);
  const reqId = createRes.body.data.id;

  // 2. Provider: ACCEPTED -> ON_THE_WAY -> SERVICE_STARTED -> COMPLETED
  await request(app)
    .put(`/api/v1/requests/${reqId}/status`)
    .set('Authorization', `Bearer ${provToken}`)
    .send({ status: 'ACCEPTED' });

  await request(app)
    .put(`/api/v1/requests/${reqId}/status`)
    .set('Authorization', `Bearer ${provToken}`)
    .send({ status: 'ON_THE_WAY' });

  await request(app)
    .put(`/api/v1/requests/${reqId}/status`)
    .set('Authorization', `Bearer ${provToken}`)
    .send({ status: 'SERVICE_STARTED' });

  const completeRes = await request(app)
    .put(`/api/v1/requests/${reqId}/status`)
    .set('Authorization', `Bearer ${provToken}`)
    .send({ status: 'COMPLETED', finalCost: 850 });
  assert.strictEqual(completeRes.statusCode, 200);
  assert.strictEqual(completeRes.body.data.status, 'COMPLETED');
  assert.strictEqual(completeRes.body.data.finalCost, 850);

  // 3. Customer submits review for provider
  const reviewRes = await request(app)
    .post('/api/v1/reviews')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      revieweeId: provUserId,
      serviceRequestId: reqId,
      rating: 5,
      reviewText: 'Prompt response and excellent wiring craftsmanship! Highly recommended.'
    });
  assert.strictEqual(reviewRes.statusCode, 200);
  assert.strictEqual(reviewRes.body.success, true);
  assert.strictEqual(reviewRes.body.data.rating, 5);
});

test('13. Service Cancellation with Reason', async () => {
  const custRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'customer@labourconnect.com', password: 'Customer@1234' });
  const custToken = custRes.body.data.accessToken;

  // Create request
  const createRes = await request(app)
    .post('/api/v1/requests')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      providerId: 1,
      categoryId: 1,
      title: 'Kitchen faucet installation',
      description: 'Need new mixer tap installed.',
      serviceAddress: 'Apartment 101, HSR Layout',
      city: 'Bangalore',
      estimatedCost: 350
    });
  const reqId = createRes.body.data.id;

  // Cancel via query param
  const cancelRes = await request(app)
    .post(`/api/v1/requests/${reqId}/cancel?reason=Bought%20pre-assembled%20sink%20instead`)
    .set('Authorization', `Bearer ${custToken}`);
  assert.strictEqual(cancelRes.statusCode, 200);
  assert.strictEqual(cancelRes.body.data.status, 'CANCELLED');
  assert.strictEqual(cancelRes.body.data.cancellationReason, 'Bought pre-assembled sink instead');
});

test('14. Dispute Filing and Admin Resolution Workflow', async () => {
  const custRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'customer@labourconnect.com', password: 'Customer@1234' });
  const custToken = custRes.body.data.accessToken;

  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@labourconnect.com', password: 'Admin@1234' });
  const adminToken = adminRes.body.data.accessToken;

  // Customer files complaint against a provider
  const complaintRes = await request(app)
    .post('/api/v1/complaints')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      reportedUserId: 5,
      subject: 'Technician arrived 2 hours late without notice',
      description: 'Scheduled for 10am but arrived after noon causing rescheduling of work.'
    });
  assert.strictEqual(complaintRes.statusCode, 200);
  assert.strictEqual(complaintRes.body.success, true);
  const complaintId = complaintRes.body.data.id;
  assert.strictEqual(complaintRes.body.data.status, 'PENDING');

  // Admin lists complaints
  const adminComplaintsRes = await request(app)
    .get('/api/v1/admin/complaints?status=PENDING')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(adminComplaintsRes.statusCode, 200);
  assert.ok(adminComplaintsRes.body.data.content.some((c) => c.id === complaintId));

  // Admin resolves complaint
  const resolveRes = await request(app)
    .put(`/api/v1/admin/complaints/${complaintId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      status: 'RESOLVED',
      adminResolutionNotes: 'Warning issued to provider regarding punctuality standards.'
    });
  assert.strictEqual(resolveRes.statusCode, 200);
  assert.strictEqual(resolveRes.body.data.status, 'RESOLVED');
  assert.strictEqual(resolveRes.body.data.adminResolutionNotes, 'Warning issued to provider regarding punctuality standards.');
});

test('15. Admin Category Creation (Auto-Slug) and Catalog Verification', async () => {
  const ServiceCategory = require('../src/models/ServiceCategory');
  await ServiceCategory.deleteOne({ slug: 'smart-home-automation-cctv' });

  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@labourconnect.com', password: 'Admin@1234' });
  const adminToken = adminRes.body.data.accessToken;

  // Admin creates category with only name and description (frontend pattern)
  const createCatRes = await request(app)
    .post('/api/v1/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Smart Home Automation & CCTV',
      description: 'Installation and maintenance of IoT door locks, sensors, and security cameras'
    });
  assert.strictEqual(createCatRes.statusCode, 200);
  assert.strictEqual(createCatRes.body.success, true);
  assert.strictEqual(createCatRes.body.data.name, 'Smart Home Automation & CCTV');
  assert.strictEqual(createCatRes.body.data.slug, 'smart-home-automation-cctv');

  // Verify category appears in catalog
  const catalogRes = await request(app).get('/api/v1/categories?activeOnly=false');
  assert.strictEqual(catalogRes.statusCode, 200);
  assert.ok(catalogRes.body.data.some((c) => c.slug === 'smart-home-automation-cctv'));
});

test('16. Admin User Suspension and Reactivation Workflow', async () => {
  const User = require('../src/models/User');
  const targetWorker = await User.findOne({ email: 'worker@labourconnect.com' });
  assert.ok(targetWorker);

  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@labourconnect.com', password: 'Admin@1234' });
  const adminToken = adminRes.body.data.accessToken;

  // Suspend worker user
  const suspendRes = await request(app)
    .put(`/api/v1/admin/users/${targetWorker.id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      suspended: true,
      active: false,
      reason: 'Temporary suspension for compliance audit'
    });
  assert.strictEqual(suspendRes.statusCode, 200);
  assert.strictEqual(suspendRes.body.data.suspended, true);

  // Attempt login with suspended account -> should be blocked with 401 Unauthorized
  const loginSuspendedRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'worker@labourconnect.com', password: 'Worker@1234' });
  assert.strictEqual(loginSuspendedRes.statusCode, 401);
  assert.ok(loginSuspendedRes.body.message.includes('suspended'));

  // Admin reactivates account
  const reactivateRes = await request(app)
    .put(`/api/v1/admin/users/${targetWorker.id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      suspended: false,
      active: true,
      reason: 'Audit resolved cleanly'
    });
  assert.strictEqual(reactivateRes.statusCode, 200);
  assert.strictEqual(reactivateRes.body.data.suspended, false);
  assert.strictEqual(reactivateRes.body.data.active, true);

  // Worker can now login successfully again
  const loginAgainRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'worker@labourconnect.com', password: 'Worker@1234' });
  assert.strictEqual(loginAgainRes.statusCode, 200);
  assert.ok(loginAgainRes.body.data.accessToken);
});

