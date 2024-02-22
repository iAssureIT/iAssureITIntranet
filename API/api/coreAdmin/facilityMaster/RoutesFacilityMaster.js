const express 	= require("express");
const router 	= express.Router();

const facilityMaster = require('./ControllerFacilityMaster.js');

router.post('/post', facilityMaster.insertFacility);

router.get('/get/list', facilityMaster.getFacilities);

router.post('/get/list', facilityMaster.fetchFacilities); 

router.get('/get/count', facilityMaster.countFacilities);
 
router.get('/get/one/:fieldID', facilityMaster.fetchSingleFacility);

router.get('/search/:str', facilityMaster.searchFacility);

router.patch('/patch', facilityMaster.updateFacility);

router.delete('/delete/:fieldID', facilityMaster.deleteFacility);

module.exports = router;