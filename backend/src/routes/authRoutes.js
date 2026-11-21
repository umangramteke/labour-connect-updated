const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.authenticateGoogle);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authController.logout);

module.exports = router;

