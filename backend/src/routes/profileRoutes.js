const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { hasRole } = require('../middleware/rbac');

// Worker
router.get('/worker', authenticateToken, hasRole('ROLE_WORKER'), profileController.getWorkerProfile);
router.put('/worker', authenticateToken, hasRole('ROLE_WORKER'), profileController.updateWorkerProfile);

// Employer
router.get('/employer', authenticateToken, hasRole('ROLE_EMPLOYER'), profileController.getEmployerProfile);
router.put('/employer', authenticateToken, hasRole('ROLE_EMPLOYER'), profileController.updateEmployerProfile);

// Customer
router.get('/customer', authenticateToken, hasRole('ROLE_CUSTOMER'), profileController.getCustomerProfile);
router.put('/customer', authenticateToken, hasRole('ROLE_CUSTOMER'), profileController.updateCustomerProfile);

// Provider
router.get('/provider', authenticateToken, hasRole('ROLE_PROVIDER'), profileController.getProviderProfile);
router.put('/provider', authenticateToken, hasRole('ROLE_PROVIDER'), profileController.updateProviderProfile);

module.exports = router;

