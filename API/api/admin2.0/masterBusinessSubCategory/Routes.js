const express 	= require("express");
const router 	= express.Router();

const businessSubCategoryMaster = require('./Controller.js');

router.post('/post', businessSubCategoryMaster.addBusinessSubCategory);

router.get('/get/list/:category_id', businessSubCategoryMaster.getBusinessSubCategory);

router.post('/get/list', businessSubCategoryMaster.getAllBusinessSubCategoryMaster); 

router.get('/get/count', businessSubCategoryMaster.countBusinessSubCategorys);
   
router.get('/get/one/:fieldID', businessSubCategoryMaster.fetchSingleBusinessSubCategory);

router.get('/search/:str', businessSubCategoryMaster.searchBusinessSubCategory);

router.patch('/patch', businessSubCategoryMaster.updateBusinessSubCategory);

router.delete('/delete/:fieldID', businessSubCategoryMaster.deleteBusinessSubCategory);

router.post('/bulkUploadModel',businessSubCategoryMaster.bulkUploadVehicleModel);

router.get('/get/filedetails/:fileName', businessSubCategoryMaster.filedetails);

router.post('/get/files', businessSubCategoryMaster.fetch_file); 


module.exports = router;