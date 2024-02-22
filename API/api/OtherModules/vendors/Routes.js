const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const vendorController = require('./Controller');

router.post('/post', 												checkAuth, vendorController.insert_vendor);

router.patch('/patch', 												checkAuth, vendorController.update_vendor);

router.get('/get/list', 											checkAuth, vendorController.list_vendor);

router.get('/get/greatestid', 									checkAuth, vendorController.get_greatest_vendorid);

router.patch('/insert/location/:vendorID', 					checkAuth, vendorController.insert_vendor_location);

router.patch('/update/location/:vendorID/:locationID', 	checkAuth, vendorController.update_vendor_location);

router.patch('/delete/location/:vendorID/:locationID', 	checkAuth, vendorController.delete_vendor_location);

router.patch('/insert/contact/:vendorID', 					checkAuth, vendorController.insert_vendor_contact);

router.patch('/update/contact/:vendorID/:contactID', 		checkAuth, vendorController.update_vendor_contact);

router.patch('/delete/contact/:vendorID/:contactID', 		checkAuth, vendorController.delete_vendor_contact);

router.get('/get/count', 											checkAuth, vendorController.count_vendor);

router.post('/get/list', 											checkAuth, vendorController.list_vendor_with_limits);

router.get('/get/one/:vendorID', 								checkAuth, vendorController.fetch_vendor);

router.get('/get/listbyuserid/:userID', 						checkAuth, vendorController.fetch_vendorid);

router.delete('/delete/:vendorID', 								checkAuth, vendorController.delete_vendor);

// router.delete('/',vendorController.deleteall_vendor);





module.exports = router;