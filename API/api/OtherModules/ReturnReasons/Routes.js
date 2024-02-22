const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const reasonsOfReturn = require('./Controller.js');

router.post('/post', 							reasonsOfReturn.insertReasonsOfReturn);

router.post('/get/list', 						reasonsOfReturn.fetchReasonsOfReturn);

router.get('/get/list', 						reasonsOfReturn.getAllReasonsOfReturn);

router.get('/get/count', 						checkAuth, reasonsOfReturn.countUnitOfMeasurment);

router.get('/get/one/:fieldID', 				checkAuth, reasonsOfReturn.fetchSingleUnitOfMeasurment);

router.get('/search/:str', 					    checkAuth, reasonsOfReturn.searchUnitOfMeasurment);

router.patch('/patch', 							checkAuth, reasonsOfReturn.updateReasonsOfReturn);

router.delete('/delete/:fieldID', 			   reasonsOfReturn.deleteReasonsOfReturn);

module.exports = router;