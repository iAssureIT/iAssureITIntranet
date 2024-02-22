const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../../coreAdmin/middlerware/check-auth.js');

const adminPreferenceController = require('../adminPreference/Controller');

//route for website model
router.post('/post', 	checkAuth, adminPreferenceController.insert_preferences);

router.get('/get', 	    adminPreferenceController.get_preferences);

module.exports = router;