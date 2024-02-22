const express 	= require("express");
const router 	= express.Router();

const vehicleMaster = require('./ControllerVehicleMaster.js');

router.post('/post', vehicleMaster.insertVehicle);

router.get('/get/list', vehicleMaster.fetchVehicles);


router.get('/get/count', vehicleMaster.countVehicles);
 
router.get('/get/one/:vehicleID', vehicleMaster.fetchSingleVehicle);

router.get('/search/:str/:company_Id', vehicleMaster.searchVehicle);

router.patch('/patch', vehicleMaster.updateVehicle);

router.post('/post/list/filterVehicles', vehicleMaster.filterVehicles);

router.delete('/delete/:vehicleID', vehicleMaster.deleteVehicle);


//Vendor App API (Rushikesh Salunkhe)
router.get('/get/vehicleListMapping/:company_Id', vehicleMaster.vehicleListMapping);

router.post('/get/list', vehicleMaster.getVehicleList);

router.post('/post/list/vehicleforallocation', vehicleMaster.getVehicleListForAllocation);

router.patch('/patch/temp_delete_vehicle', vehicleMaster.tempDeleteVehicle);

router.patch('/patch/restore_vehicle', vehicleMaster.vehicle_update_recover_status);

module.exports = router;