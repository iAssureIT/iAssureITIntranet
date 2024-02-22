const express 	= require("express");
const router 	= express.Router();
const PaymentGatewayController = require('./Controller.js');

router.post('/post', PaymentGatewayController.insertPaymentInfo);

router.get('/get/all', PaymentGatewayController.fetch_PaymentGateway);

router.post('/post/alllist', PaymentGatewayController.fetch_PaymentGateway_all);

router.get('/get/one/:id', PaymentGatewayController.fetch_PaymentGateway_Single);

router.patch('/patch/:id', PaymentGatewayController.updatePaymentgateway);

router.delete('/delete/:id', PaymentGatewayController.deletePaymentgateway);

module.exports = router;