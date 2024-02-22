const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../../coreAdmin/middlerware/check-auth.js');

const orderCancellationPolicyController = require('./Controller');

//route for website model
router.post('/post', 	orderCancellationPolicyController.insert_order_cancel_policy);

router.get('/get', 	    orderCancellationPolicyController.get_order_cancel_policy);

module.exports = router;