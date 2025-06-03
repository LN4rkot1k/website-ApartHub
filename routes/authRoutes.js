const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const profileController = require('../controllers/profileController');
const { authLimiter, speedLimiter } = require('../middleware/requestLimiters');


// Маршруты администраторов
router.get('/admin/login', speedLimiter, authLimiter, authController.getLoginAdminPage);
router.post('/admin/login', speedLimiter, authLimiter, authController.loginAdmin);

router.get('/admin/logout', authController.logoutAdmin);

router.get('/adminProfile', speedLimiter, authLimiter, authController.isAdmin, authController.showAdminProfilePage);

// Маршруты пользователей
router.get('/logout', authController.logoutUser);

router.get('/login', speedLimiter, authLimiter, authController.getLoginPage);
router.post('/login', speedLimiter, authLimiter, authController.login);

router.get('/userProfile', authController.showUserProfilePage);

router.get('/register', speedLimiter, authLimiter, authController.getRegisterPage);
router.post('/register', speedLimiter, authLimiter, authController.registerUser);

// Маршруты перехода на политику конфиденциальности и согласие на обработку данных
router.get('/privacy-policy', profileController.getPrivacyPolicy)
router.get('/data-processing-consent', profileController.getConsentPage);

module.exports = router;