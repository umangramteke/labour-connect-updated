const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

router.get('/', providerController.searchProviders);
router.get('/:userId', providerController.getProviderByUserId);

module.exports = router;

