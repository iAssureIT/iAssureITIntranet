const express 	= require("express");
const router 	= express.Router();

const packageMaster = require('./ControllerPackageMasterBulk.js');

router.post('/post', packageMaster.insertPackage);

router.post('/get/list', packageMaster.fetchPackages);

router.get('/get/list', packageMaster.fetchListPackages);

router.get('/get/count', packageMaster.countPackages);

router.get('/get/one/:packageID', packageMaster.fetchSinglePackage);

router.patch('/patch', packageMaster.updatePackage);

router.delete('/delete/:packageID', packageMaster.deletePackage);

module.exports = router;