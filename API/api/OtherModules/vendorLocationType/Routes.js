const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const vendorLocationTypeController = require('./Controller');

router.post('/post', 								checkAuth, vendorLocationTypeController.insert_vendor_location);

router.patch('/patch', 								checkAuth, vendorLocationTypeController.update_vendor_location);

router.get('/get/list', 							checkAuth, vendorLocationTypeController.list_vendor_location);

router.get('/get/count', 							checkAuth, checkAuth, vendorLocationTypeController.count_vendor_location);

router.post('/get/list', 							checkAuth, vendorLocationTypeController.list_vendor_location_with_limits);

router.get('/get/one/:vendorCategoryID', 		checkAuth, vendorLocationTypeController.fetch_vendor_location);

router.delete('/delete/:vendorCategoryID', 	checkAuth, vendorLocationTypeController.delete_vendor_location);



module.exports = router;