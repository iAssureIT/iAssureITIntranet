const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const unitofmeasurment = require('./ControllerUnitofmeasurmen.js');

router.post('/post', 							checkAuth, unitofmeasurment.insertDepartment);

router.post('/get/list', 						checkAuth, unitofmeasurment.fetchDepartments);

router.get('/get/list', 						checkAuth, unitofmeasurment.getAllDepartments);

router.get('/get/count', 						checkAuth, unitofmeasurment.countDepartments);

router.get('/get/one/:fieldID', 				checkAuth, unitofmeasurment.fetchSingleDepartment);

router.get('/search/:str', 					checkAuth, unitofmeasurment.searchDepartment);

router.patch('/patch', 							checkAuth, unitofmeasurment.updateDepartment);

router.post('/bulkUploadDepartment', 		checkAuth, unitofmeasurment.bulkUploadDepartment);

router.post('/get/files', 						checkAuth, unitofmeasurment.fetch_file); 

router.get('/get/filedetails/:fileName', 	checkAuth, unitofmeasurment.filedetails);

router.delete('/delete/:fieldID', 			checkAuth, unitofmeasurment.deleteDepartment);

router.delete('/get/deleteAllUnits', 		checkAuth, unitofmeasurment.deleteAllUnits);


module.exports = router;