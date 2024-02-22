const express 	= require("express");
const router 	= express.Router();

const mappingMaster = require('./ControllerMappingMaster');

router.post('/post', mappingMaster.insertMapping);
router.get('/get/count',mappingMaster.countMappings);

module.exports = router;