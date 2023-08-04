const express = require('express');
const notificationController = require('../controller/notificationController');
const router = express.Router();



router.get('/testnotification', notificationController.testNotification);

router.post('/getallnotification', notificationController.getallNotification);



module.exports = router;







