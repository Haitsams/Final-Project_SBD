const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', UserController.register);
router.post('/login', UserController.login);

router.get('/profile', authenticate, UserController.getProfile);
router.post('/topup', authenticate, UserController.topUp);

module.exports = router;