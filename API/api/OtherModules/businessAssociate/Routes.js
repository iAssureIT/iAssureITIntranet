const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const baController = require('./Controller');

router.post('/post', 										checkAuth, baController.insert_ba);

router.patch('/patch', 										checkAuth, baController.update_ba);
 
router.patch('/patch/updateBaLoc', 						checkAuth, baController.update_ba_loc);

router.post('/post/singleLocation', 					checkAuth, baController.singleLocation);

router.post('/post/singleContact', 						checkAuth, baController.singleContact);

router.patch('/patch/updateOneBaLoc', 					checkAuth, baController.update_ba_loc_one);

router.patch('/patch/updateBaContact', 				checkAuth, baController.update_ba_contact);

router.patch('/patch/updateOneBaContact', 			checkAuth, baController.update_ba_contact_one);

router.get('/get/list', 									checkAuth, baController.list_ba);

router.get('/get/checkBAExists/:emailID', 			checkAuth, baController.check_ba_exists);

router.get('/get/one/:baID', 								checkAuth, baController.single_ba);

router.delete('/delete/:baID', 							checkAuth, baController.delete_ba);

router.patch('/deleteLocation/:baID/:locationID', 	checkAuth, baController.delete_location);

router.patch('/deleteContact/:baID/:contactID', 	checkAuth, baController.delete_contact);
module.exports = router;