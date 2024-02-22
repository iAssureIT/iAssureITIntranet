const express 	= require("express");
const router 	= express.Router();

const accessMaster = require('./ControllerAccessMaster.js');
const checkAuth = require('../middlerware/check-auth.js');


router.post('/post', accessMaster.insertAccess);

router.get('/get', accessMaster.getAccess);

router.post('/getRolewiseAccess', accessMaster.getRolewiseAccess);

router.post('/getRolewiseAccessToModule', accessMaster.getRolewiseAccessToModule);

router.post('/getAccessToFacilityOfModule', accessMaster.getAccessToFacilityOfModule);

module.exports = router;