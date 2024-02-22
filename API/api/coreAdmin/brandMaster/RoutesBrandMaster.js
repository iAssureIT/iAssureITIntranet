const express 	= require("express");
const router 	= express.Router();

const brandMaster = require('./ControllerBrandMaster.js');

router.post('/post', brandMaster.insertBrand);

router.post('/get/list', brandMaster.fetchBrands);

router.get('/get/list', brandMaster.getBrands);

router.get('/get/count', brandMaster.countBrands);

router.get('/get/one/:fieldID', brandMaster.fetchSingleBrand);

router.get('/search/:str', brandMaster.searchBrand);

router.patch('/patch', brandMaster.updateBrand);

router.delete('/delete/:fieldID', brandMaster.deleteBrand);

// router.post('/bulkUploadbrand ',brandMaster.bulkUploadVehicleBrand);

router.post('/bulkUploadbrand',brandMaster.bulkUploadVehicleBrand);

router.post('/get/files', brandMaster.fetch_file); 

router.get('/get/filedetails/:fileName', brandMaster.filedetails);

module.exports = router;