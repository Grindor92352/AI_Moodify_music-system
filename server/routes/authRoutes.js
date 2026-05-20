const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authSignup, authLogin } = require('../validators');

router.post('/signup', authSignup, authController.signup);
router.post('/login', authLogin, authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify', requireAuth, authController.verify);
router.get('/auth/google', authController.googleAuth);

module.exports = router;
