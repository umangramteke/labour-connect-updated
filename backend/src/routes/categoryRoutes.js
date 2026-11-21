const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { hasRole } = require('../middleware/rbac');

router.get('/', categoryController.getCategories);
router.post('/', authenticateToken, hasRole('ROLE_ADMIN'), categoryController.createCategory);
router.put('/:id', authenticateToken, hasRole('ROLE_ADMIN'), categoryController.updateCategory);

module.exports = router;

