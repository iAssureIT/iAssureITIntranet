const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../../coreAdmin/middlerware/check-auth.js');

const returnProductPolicyController = require('./Controller');

//route for website model
router.post('/post', 	returnProductPolicyController.insert_return_product_policy);

router.get('/get', 	    returnProductPolicyController.get_return_product_policy);

module.exports = router;