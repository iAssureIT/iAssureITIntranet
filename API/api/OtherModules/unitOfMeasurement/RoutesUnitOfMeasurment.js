const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const unitOfMeasurmentMaster = require('./ControllerUnitOfMeasurment.js');

router.post('/get/list', 						checkAuth, unitOfMeasurmentMaster.fetchUnitOfMeasurmentList);
router.post('/post', 							checkAuth, unitOfMeasurmentMaster.insertUnitOfMeasurment);


router.get('/get/list', 						checkAuth, unitOfMeasurmentMaster.getAllUnitOfMeasurment);

router.get('/get/count', 						checkAuth, unitOfMeasurmentMaster.countUnitOfMeasurment);

router.get('/get/one/:fieldID', 				checkAuth, unitOfMeasurmentMaster.fetchSingleUnitOfMeasurment);

router.get('/search/:str', 					checkAuth, unitOfMeasurmentMaster.searchUnitOfMeasurment);

router.patch('/patch', 							checkAuth, unitOfMeasurmentMaster.updateUnitOfMeasurment);

// router.post('/bulkUploadDepartment',unitOfMeasurmentMaster.bulkUploadUnitOfMeasurment);

router.post('/get/files', 						checkAuth, unitOfMeasurmentMaster.fetch_file); 

router.get('/get/filedetails/:fileName', 	checkAuth, unitOfMeasurmentMaster.filedetails);

router.delete('/delete/:fieldID', 			checkAuth, unitOfMeasurmentMaster.deleteUnitOfMeasurment);

// router.delete('/get/deleteAllUnits',unitOfMeasurmentMaster.deleteAllUnits);
router.delete('/get/deleteAllUnits', 		checkAuth, unitOfMeasurmentMaster.deleteAllUnits);

module.exports = router;