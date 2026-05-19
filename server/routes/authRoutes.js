const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authController.verify);
router.get('/auth/google', authController.googleAuth);

module.exports = router;
