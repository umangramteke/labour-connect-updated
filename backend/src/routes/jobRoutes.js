const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');
const { hasRole } = require('../middleware/rbac');

// Specific endpoints first
router.get('/my-jobs', authenticateToken, hasRole('ROLE_EMPLOYER'), jobController.getEmployerJobs);
router.get('/my', authenticateToken, hasRole('ROLE_EMPLOYER'), jobController.getEmployerJobs);
router.get('/applications/my-applications', authenticateToken, hasRole('ROLE_WORKER'), jobController.getMyApplications);
router.put('/applications/:id/status', authenticateToken, hasRole('ROLE_EMPLOYER'), jobController.updateApplicationStatus);
router.post('/applications/:id/withdraw', authenticateToken, hasRole('ROLE_WORKER'), jobController.withdrawApplication);

// Base jobs collection
router.get('/', jobController.searchJobs);
router.post('/', authenticateToken, hasRole('ROLE_EMPLOYER'), jobController.createJob);

// Specific job item operations
router.post('/:id/apply', authenticateToken, hasRole('ROLE_WORKER'), jobController.applyForJob);
router.get('/:id/applications', authenticateToken, hasRole('ROLE_EMPLOYER'), jobController.getJobApplications);
router.get('/:id', jobController.getJobById);
router.put('/:id', authenticateToken, hasRole('ROLE_EMPLOYER'), jobController.updateJob);
router.delete('/:id', authenticateToken, hasRole('ROLE_EMPLOYER'), jobController.closeJob);

module.exports = router;

