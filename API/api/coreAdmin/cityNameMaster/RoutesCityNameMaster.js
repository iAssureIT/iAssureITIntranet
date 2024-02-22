const express 	= require("express");
const router 	= express.Router();

const cityNameMaster = require('./ControllerCityNameMaster.js');

router.post('/post', cityNameMaster.insertCityName);

router.get('/get/list', cityNameMaster.getCityName);

router.post('/get/list', cityNameMaster.fetchCityNameMaster); 

router.get('/get/count', cityNameMaster.countCityNames);
   
router.get('/get/one/:fieldID', cityNameMaster.fetchSingleCityName);

router.get('/search/:str', cityNameMaster.searchCityName);

router.patch('/patch', cityNameMaster.updateCityName);

router.delete('/delete/:fieldID', cityNameMaster.deleteCityName);

router.post('/bulkUploadModel',cityNameMaster.bulkUploadVehicleModel);

router.get('/get/filedetails/:fileName', cityNameMaster.filedetails);

router.post('/get/files', cityNameMaster.fetch_file); 


module.exports = router;