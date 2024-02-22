const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const adminPOController = require('./Controller');

router.post('/post', 												checkAuth, adminPOController.insert_adminPO);

router.get('/get/one/purchaseorder/:purchaseorder_id', 	checkAuth, adminPOController.one_adminPO);

router.patch('/patch/purchaseorder', 							checkAuth, adminPOController.update_adminPO);

router.delete('/delete/purchaseorder/:purchaseorder_id', checkAuth, adminPOController.delete_adminPO);


module.exports = router;