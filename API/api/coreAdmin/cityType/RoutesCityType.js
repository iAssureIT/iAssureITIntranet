const express 	= require("express");
const router 	= express.Router();

const cityTypeMaster = require('./ControllerCityType.js');

router.post('/post', cityTypeMaster.insertCityType);

router.post('/get/list', cityTypeMaster.fetchCityType);

router.get('/get/list', cityTypeMaster.getCityType);

router.get('/get/count', cityTypeMaster.countCityType);

router.get('/get/one/:fieldID', cityTypeMaster.fetchSingleCityType);

router.get('/search/:str', cityTypeMaster.searchCityType);

router.patch('/patch', cityTypeMaster.updateCityType);

router.delete('/delete/:fieldID', cityTypeMaster.deleteCityType);

router.post('/bulkUploadcityType',cityTypeMaster.bulkUploadCityType);

router.post('/get/files', cityTypeMaster.fetch_file); 

router.get('/get/filedetails/:fileName', cityTypeMaster.filedetails);

module.exports = router;