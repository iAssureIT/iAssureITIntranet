const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const preferenceController = require('./Controller');

router.post('/post', 														checkAuth, preferenceController.create_preference);

router.get('/get/one/:preferenceID', 									checkAuth, preferenceController.one_preference);

router.get('/get/onerate/:preferenceID', 								checkAuth, preferenceController.one_rate_preference);

router.get('/get/list', 													checkAuth, preferenceController.get_preference);

router.patch('/get/list', 													checkAuth, preferenceController.list_preference);

router.patch('/patch', 														checkAuth, preferenceController.update_preference);

router.patch('/postrate', 													checkAuth, preferenceController.submit_rate_preference);

router.patch('/patchrate', 												checkAuth, preferenceController.update_rate_preference);

router.get('/get/count', 													checkAuth, preferenceController.count_preference);

router.delete('/deleterate/delete/:preferenceID/:taxRateID', 	checkAuth, preferenceController.delete_rate_preference);

router.delete('/delete/:preferenceID', 								checkAuth, preferenceController.delete_preference);

module.exports = router;