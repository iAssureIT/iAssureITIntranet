const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const vendorCategoryController = require('./Controller');

router.post('/post', 								checkAuth, vendorCategoryController.insert_vendor_category);

router.patch('/patch', 								checkAuth, vendorCategoryController.update_vendor_category);

router.get('/get/list', 							checkAuth, vendorCategoryController.list_vendor_category);

router.get('/get/count', 							checkAuth, vendorCategoryController.count_vendor_category);

router.post('/get/list', 							checkAuth, vendorCategoryController.list_vendor_category_with_limits);

router.get('/get/one/:vendorCategoryID', 		checkAuth, vendorCategoryController.fetch_vendor_category);

router.delete('/delete/:vendorCategoryID', 	checkAuth, vendorCategoryController.delete_vendor_category);


module.exports = router;