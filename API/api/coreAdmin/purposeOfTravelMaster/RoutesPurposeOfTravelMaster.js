const express 	= require("express");
const router 	= express.Router();

const PurposeOfTravelMaster = require('./ControllerPurposeOfTravelMaster.js');

router.post('/post', PurposeOfTravelMaster.insertPurposeOfTravel);
router.post('/get/list', PurposeOfTravelMaster.allPurposeOfTravel);
router.get('/get/alllist', PurposeOfTravelMaster.getPurposeOfTravel);

// router.get('/get/count', PurposeOfTravelMaster.countPurposeOfTravels);

router.get('/get/one/:fieldID', PurposeOfTravelMaster.fetchSinglePurposeOfTravel);

// router.get('/search/:str', PurposeOfTravelMaster.searchPurposeOfTravel);

router.patch('/patch', PurposeOfTravelMaster.updatePurposeOfTravel);

router.delete('/delete/:fieldID', PurposeOfTravelMaster.deletePurposeOfTravel);

module.exports = router;