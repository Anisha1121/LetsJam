const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// GET /users/me/library
router.get('/me/library', auth, userController.getMyLibrary);

// GET /users/me/stats
router.get('/me/stats', auth, userController.getStats);

module.exports = router;
