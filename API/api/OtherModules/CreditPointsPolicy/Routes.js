const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../../coreAdmin/middlerware/check-auth.js');

const creditPointsController = require('./Controller');

router.post('/post', 	creditPointsController.insert_credit_points_policy);

router.get('/get', 	    creditPointsController.get_credit_points_policy);

module.exports = router;