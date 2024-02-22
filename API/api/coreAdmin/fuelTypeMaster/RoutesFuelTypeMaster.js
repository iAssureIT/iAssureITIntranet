const express 	= require("express");
const router 	= express.Router();

const fuelTypeMaster = require('./ControllerFuelTypeMaster.js');

router.post('/post', fuelTypeMaster.insertFuelType);

router.post('/get/list', fuelTypeMaster.fetchFuelTypes);

router.get('/get/list', fuelTypeMaster.getFuelTypes);

router.get('/get/count', fuelTypeMaster.countFuelTypes);

router.get('/get/one/:fieldID', fuelTypeMaster.fetchSingleFuelType);

router.get('/search/:str', fuelTypeMaster.searchFuelType);

router.patch('/patch', fuelTypeMaster.updateFuelType);

router.delete('/delete/:fieldID', fuelTypeMaster.deleteFuelType);

module.exports = router;