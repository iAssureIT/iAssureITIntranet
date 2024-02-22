const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const orderRejectReasons = require('./Controller.js');

router.post('/post', 							orderRejectReasons.insertOrderRejectReasons);

router.post('/get/list', 						orderRejectReasons.fetchOrderRejectReasons);

router.get('/get/list', 						orderRejectReasons.getAllOrderRejectReasons);

router.get('/get/count', 						checkAuth, orderRejectReasons.countOrderRejectReasons);

router.get('/get/one/:fieldID', 				checkAuth, orderRejectReasons.fetchSingleOrderRejectReason);

router.get('/search/:str', 					    checkAuth, orderRejectReasons.searchOrderRejectReasons);

router.patch('/patch', 							checkAuth, orderRejectReasons.updateOrderRejectReasons);

router.delete('/delete/:fieldID', 			   orderRejectReasons.deleteOrderRejectReasons);

module.exports = router;