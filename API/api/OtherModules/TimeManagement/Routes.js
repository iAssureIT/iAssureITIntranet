const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js'); 

const TimeController = require('./Controller');

router.post('/post', 													checkAuth, TimeController.insert_Time);

router.get('/get/list', 				                    TimeController.get_Time);

router.get('/get/list-with-limits/:startRange/:limitRange', TimeController.get_Time_with_limits);

router.get('/get/count', 									 checkAuth, TimeController.count_section);

router.get('/get/one/:TimeID', 								 TimeController.get_single_Time);

router.get('/get/get_megamenu_list', 						 TimeController.get_megamenu_list);

router.patch('/patch', 													checkAuth, TimeController.update_Time);

router.delete('/delete/:TimeID', 									checkAuth, TimeController.delete_Time);

module.exports = router; 