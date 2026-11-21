const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { authenticateToken } = require('../middleware/auth');
const { hasRole } = require('../middleware/rbac');

// Specific endpoints first
router.get('/my-requests', authenticateToken, hasRole('ROLE_CUSTOMER'), serviceRequestController.getCustomerRequests);
router.get('/provider-requests', authenticateToken, hasRole('ROLE_PROVIDER'), serviceRequestController.getProviderRequests);
router.post('/', authenticateToken, hasRole('ROLE_CUSTOMER'), serviceRequestController.createRequest);

// Item operations
router.get('/:id', authenticateToken, serviceRequestController.getRequestById);
router.put('/:id/status', authenticateToken, hasRole('ROLE_PROVIDER'), serviceRequestController.updateStatus);
router.post('/:id/cancel', authenticateToken, hasRole('ROLE_CUSTOMER'), serviceRequestController.cancelRequest);

module.exports = router;

