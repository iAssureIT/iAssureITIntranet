const express 	= require("express");
const router 	= express.Router();

const packageTypeMaster = require('./ControllerPackageTypeMaster.js');

router.post('/post', packageTypeMaster.insertPackageType);

router.post('/get/list', packageTypeMaster.fetchPackageTypes);

router.get('/get/list', packageTypeMaster.getPackageTypes);

router.get('/get/count', packageTypeMaster.countPackageTypes);

router.get('/get/one/:fieldID', packageTypeMaster.fetchSinglePackageType);

router.get('/search/:str', packageTypeMaster.searchPackageType);

router.patch('/patch', packageTypeMaster.updatePackageType);

router.delete('/delete/:fieldID', packageTypeMaster.deletePackageType);

module.exports = router;