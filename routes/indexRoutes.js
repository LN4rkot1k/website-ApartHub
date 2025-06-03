const Handlebars = require('handlebars');
const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const showApartments = require('../controllers/apartmentsController');
// const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

router.get('/', mainController.showMainPage);

router.get('/apartments', showApartments.showApartmentsPage);



router.get('/apartment/:id', showApartments.showApartmentDetails);

router.get('/mortgage-calculator', mainController.showCalculatorPage);

router.get('/filter-apartments', showApartments.filterApartments);


// Показ модального окна контактов пользователя
router.get('/api/user/:id', mainController.getContactByApartmentId);


Handlebars.registerHelper("formatPrice", function (price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
});

Handlebars.registerHelper('length', function(array) {
    return array.length;
});

Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
});

module.exports = router;
