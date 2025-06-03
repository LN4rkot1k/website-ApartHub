const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const passport = require('passport');
const { uploadComplexPhotos } = require('../middleware/upload');
const { ensureAdmin } = require('../middleware/authMiddleware');
const { profileLimiter, speedLimiter } = require('../middleware/requestLimiters');

router.get('/add-admin', ensureAdmin, speedLimiter, profileLimiter, adminController.getAddAdminPage);
router.post('/add-admin', ensureAdmin, speedLimiter, profileLimiter, adminController.addAdmin);


router.get('/add-complex', ensureAdmin, speedLimiter, profileLimiter, adminController.getAddComplexPage);
router.post('/add-complex', ensureAdmin, speedLimiter, profileLimiter, uploadComplexPhotos.array('complex_imageurls', 10), adminController.addComplex);

router.post('/delete-complex', ensureAdmin, speedLimiter, profileLimiter, adminController.deleteComplex);

router.get('/moderating-announcement', ensureAdmin, speedLimiter, profileLimiter, adminController.getModeratingPage);
router.get('/apartments/:id', ensureAdmin, speedLimiter, profileLimiter, adminController.getApartmentByIdForAdmin);
router.post('/apartments/:id/edit', ensureAdmin, speedLimiter, profileLimiter, adminController.updateApartmentByIdForAdmin);


module.exports = router;