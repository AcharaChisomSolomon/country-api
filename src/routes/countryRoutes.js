const express = require('express');
const router = express.Router();
const controller = require('../controllers/countryController');

// ORDER MATTERS!
router.get('/image', controller.getSummaryImage);
router.get('/:name', controller.getCountryByName);
router.delete('/:name', controller.deleteCountry);

router.get('/', controller.getAllCountries);
router.post('/refresh', controller.refreshCountries);

module.exports = router;