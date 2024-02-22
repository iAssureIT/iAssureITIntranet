const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const wareHouseMaster = require('./ControllerWareHouseMaster.js');

router.post('/post', 					checkAuth, wareHouseMaster.insertWarehouse);

router.post('/get/list', 				checkAuth, wareHouseMaster.fetchWareHouseMaster);

router.get('/get/count', 				checkAuth, wareHouseMaster.countWarehouseMaster);

router.get('/get/one/:fieldID', 		checkAuth, wareHouseMaster.fetchSingleWareHouseMaster);

router.get('/search/:str', 			checkAuth, wareHouseMaster.searchWareHouseMaster);

router.patch('/patch', 					checkAuth, wareHouseMaster.updateWareHouseMaster);

router.delete('/delete/:fieldID', 	checkAuth, wareHouseMaster.deleteWarehouseMaster);

module.exports = router;