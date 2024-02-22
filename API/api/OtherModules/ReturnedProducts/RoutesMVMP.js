const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const returnedProductsController = require('./ControllerMVMP');

// router.post('/post', 						    checkAuth, returnedProductsController.add_returned_product);

router.post('/get/list', 						returnedProductsController.get_returned_products);

router.get('/get/product/:return_id', 			returnedProductsController.get_single_returned_product);

router.patch('/change/status', 		            checkAuth, returnedProductsController.return_status_update);

router.patch('/add/comment', 					returnedProductsController.add_admin_or_vendor_comment);

router.patch('/returnPickeupInitiated', 	    checkAuth, returnedProductsController.returnPickeupInitiated);

router.get('/get/count', 						checkAuth, returnedProductsController.returnedCount);

router.get('/get/PendingCount', 				checkAuth, returnedProductsController.PendingCount);

module.exports = router;