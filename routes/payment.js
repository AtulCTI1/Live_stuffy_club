const express = require('express');
const paymentController = require('../controller/paymentController');
const router = express.Router();



router.post('/payment', paymentController.payment);

router.post('/GetTranstion', paymentController.GetTranstion);

router.post('/create_customer', paymentController.create_customer);

router.get('/get_customer', paymentController.get_customer_id);

router.post('/create_checkout/:user_id', paymentController.create_checkout);

router.post('/create_checkout/:user_id/:product_id', paymentController.create_checkout_QR_code);

router.post('/create_product', paymentController.create_product);

router.post('/create_price', paymentController.create_price);

router.get('/successfull/:id/:user_id', paymentController.successfull_page);

router.get('/successfull/:id/:user_id/:product_id', paymentController.successfull_page_QR_code);

router.get('/get_product_all', paymentController.get_product_all);

router.post('/get_ALL_Card', paymentController.get_ALL_Card);

router.post('/payment_with_save_card', paymentController.payment_with_save_card);

router.post('/delete_Card', paymentController.delete_Card);

router.post('/createCard', paymentController.createCard);




module.exports = router;







