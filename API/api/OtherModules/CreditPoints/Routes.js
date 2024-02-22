const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../../coreAdmin/middlerware/check-auth.js');

const creditPointsController = require('./Controller');

router.get('/get/:customer_id', 	    creditPointsController.get_credit_points);

module.exports = router;