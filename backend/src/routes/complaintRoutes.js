const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, complaintController.fileComplaint);
router.get('/my', authenticateToken, complaintController.getMyComplaints);

module.exports = router;

