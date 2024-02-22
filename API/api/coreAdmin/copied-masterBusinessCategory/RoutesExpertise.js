const express 	= require("express");
const router 	= express.Router();

const busCatgExpertiseMaster = require('./ControllerExpertise.js');

router.post('/post', busCatgExpertiseMaster.insertCatgExpertise);

router.post('/get/list', busCatgExpertiseMaster.fetchCatgExpertise);

router.get('/get/list', busCatgExpertiseMaster.getCatgExpertise);

router.get('/get/one/:fieldID', busCatgExpertiseMaster.fetchSingleBusinessCategory);

router.patch('/patch', busCatgExpertiseMaster.updateBusinessCategory);

router.delete('/delete/:fieldID', busCatgExpertiseMaster.deleteBusinessCategory);


module.exports = router;