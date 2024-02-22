const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const distributionController = require('./Controller');

// console.log("abc");

router.post('/post', 											checkAuth, distributionController.insert_franchise_goods);

router.get('/get/franchiseDeliveryChallan/:id', 		checkAuth, distributionController.get_delivery_challan);

router.get('/get/totalFranchiseStock/:franchise_id', 	checkAuth, distributionController.total_franchise_stock);

module.exports = router; 