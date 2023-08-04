const express = require('express');
const homeController = require('../controller/homeController');
const router = express.Router();
const auth = require('../middleware/auth');


router.post('/homePage', auth, homeController.homePage);

// router.get('/privacyPolicy', homeController.redirectToPP);

// router.get('/termsandcondition', homeController.redirectTerms);

router.post('/termsandcondition', homeController.termsAndcondition);

router.post('/privacyPolicy', homeController.privacyPolicy);

router.post('/plans', homeController.plans);

module.exports = router;