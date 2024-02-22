const express 	= require("express");
const router 	= express.Router();

const businessCategoryMaster = require('./Controller.js');

router.post('/post', businessCategoryMaster.insertBusinessCategory);

router.post('/get/list', businessCategoryMaster.fetchBusinessCategory);

router.get('/get/list', businessCategoryMaster.getBusinessCategory);

router.get('/get/count', businessCategoryMaster.countBusinessCategory);

router.get('/get/one/:fieldID', businessCategoryMaster.fetchSingleBusinessCategory);

router.get('/search/:str', businessCategoryMaster.searchBusinessCategory);

router.patch('/patch', businessCategoryMaster.updateBusinessCategory);

router.delete('/delete/:fieldID', businessCategoryMaster.deleteBusinessCategory);

router.post('/bulkUploadbusinessCategory',businessCategoryMaster.bulkUploadBusinessCategory);

router.post('/get/files', businessCategoryMaster.fetch_file); 

router.get('/get/filedetails/:fileName', businessCategoryMaster.filedetails);

module.exports = router;