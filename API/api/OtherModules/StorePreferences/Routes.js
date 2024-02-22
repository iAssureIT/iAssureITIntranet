const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../../coreAdmin/middlerware/check-auth.js');

const storePreferenceController = require('./Controller');

//route for website model
router.post('/post', 	storePreferenceController.insert_preferences);

router.get('/get', 	    storePreferenceController.get_preferences);

module.exports = router;