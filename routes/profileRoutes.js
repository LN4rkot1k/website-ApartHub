const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { uploadPhotos } = require('../middleware/upload');
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { profileLimiter, speedLimiter } = require('../middleware/requestLimiters');

router.get('/complexes', profileController.getComplexes);


// Маршрут добавления квартиры с фото
router.post('/apartments/add', ensureAuthenticated, uploadPhotos.array('loadPhotos', 10), profileController.addApartment);


// Получение объявлений текущего пользователя
router.get('/apartments', ensureAuthenticated, profileController.getUserApartments);

router.post('/apartments/delete/:id', ensureAuthenticated, speedLimiter, profileLimiter, profileController.deleteApartment);

router.get('/apartments/:id/edit', ensureAuthenticated, speedLimiter, profileLimiter, profileController.getEditApartmentPage);

router.post('/apartments/:id/edit', ensureAuthenticated, speedLimiter, profileLimiter, uploadPhotos.array('image_urls', 10), profileController.saveEditedApartment);

// Маршруты редактирования контактных данных пользователя
router.get('/edit', ensureAuthenticated, speedLimiter, profileLimiter, profileController.getEditProfilePage);
router.post('/update', ensureAuthenticated, speedLimiter, profileLimiter, profileController.updateProfile);
router.delete('/delete', ensureAuthenticated, speedLimiter, profileLimiter, profileController.deleteProfile);
module.exports = router;