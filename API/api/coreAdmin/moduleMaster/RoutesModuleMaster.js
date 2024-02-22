const express 	= require("express");
const router 	= express.Router();

const moduleMaster = require('./ControllerModuleMaster.js');

router.post('/post', moduleMaster.insertModule);

router.post('/get/list', moduleMaster.fetchModules);

router.get('/get/list', moduleMaster.getModules);

router.get('/get/groupbylist', moduleMaster.groupbylist); 

router.get('/get/count', moduleMaster.countModules);

router.get('/get/one/:fieldID', moduleMaster.fetchSingleModule);

router.get('/search/:str', moduleMaster.searchModule);

router.patch('/patch', moduleMaster.updateModule);

router.delete('/delete/:fieldID', moduleMaster.deleteModule);

module.exports = router;