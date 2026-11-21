const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { hasRole } = require('../middleware/rbac');

// All admin routes require authentication and ROLE_ADMIN
router.use(authenticateToken, hasRole('ROLE_ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/verifications', adminController.getVerifications);
router.put('/verifications/:id', adminController.decideVerification);
router.get('/complaints', adminController.listComplaints);
router.put('/complaints/:id', adminController.resolveComplaint);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;

