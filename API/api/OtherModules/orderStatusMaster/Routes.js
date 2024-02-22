const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const orderStatusMaster = require('./Controllers.js');

router.post('/post', 							checkAuth, orderStatusMaster.insertOrderStatus);

router.post('/get/list', 						checkAuth, orderStatusMaster.fetchOrderStatus);

router.get('/get/list', 						checkAuth, orderStatusMaster.getAllOrderStatus);

router.get('/get/count', 						checkAuth, orderStatusMaster.countOrderStatus);

router.get('/get/one/:fieldID', 				checkAuth, orderStatusMaster.fetchSingleOrderStatus);

router.get('/search/:str', 					checkAuth, orderStatusMaster.searchOrderStatus);

router.patch('/patch', 							checkAuth, orderStatusMaster.updateOrderStatus);

router.post('/bulkuploadorderstatus',		checkAuth, orderStatusMaster.orderBulkUpload);

 router.post('/get/files', 					checkAuth, orderStatusMaster.fetch_file); 

 router.get('/get/filedetails/:fileName', checkAuth, orderStatusMaster.filedetails);

router.delete('/delete/:fieldID', 			checkAuth, orderStatusMaster.deleteOrderStatus);

module.exports = router;