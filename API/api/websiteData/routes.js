const express 	= require("express");
const router 	= express.Router();

const websiteData = require('./controller.js');

router.get('/get/block-data/by-block-name/BrowseBySpeciality', websiteData.getBusinessSubCategory);
router.get('/get/block-data/by-block-name/BroadCategory', websiteData.getBusinessCategory);
router.get('/get/block-data/by-block-name/DisplaySubCatg/:category', websiteData.getSubCatgUsingCatg);
router.get('/get/block-data/by-block-name/Footer2', websiteData.getCatgArray);
router.get('/get/block-data/by-block-name/BestConsultant/:user_id', websiteData.getConsultants);


module.exports = router;