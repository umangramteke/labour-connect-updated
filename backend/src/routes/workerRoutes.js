const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authenticateToken } = require('../middleware/auth');
const { hasAnyRole } = require('../middleware/rbac');

router.get('/', authenticateToken, hasAnyRole('ROLE_EMPLOYER', 'ROLE_ADMIN'), workerController.searchWorkers);
router.get('/:userId', authenticateToken, hasAnyRole('ROLE_EMPLOYER', 'ROLE_ADMIN'), workerController.getWorkerByUserId);

module.exports = router;

