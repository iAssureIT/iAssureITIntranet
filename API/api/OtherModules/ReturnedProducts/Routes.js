const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const returnedProductsController = require('./Controller');

router.get('/get/list', 						checkAuth, returnedProductsController.get_returned_products);

router.patch('/returnStatusUpdate', 		checkAuth, returnedProductsController.returnStatusUpdate);

router.patch('/returnPickeupInitiated', 	checkAuth, returnedProductsController.returnPickeupInitiated);

router.get('/get/count', 						checkAuth, returnedProductsController.returnedCount);

router.get('/get/PendingCount', 				checkAuth, returnedProductsController.PendingCount);

module.exports = router;