const express 	= require("express");
const router 	= express.Router();

const locationTypeMaster = require('./ControllerLocationTypeMaster.js');

const checkAuth = require('../middlerware/check-auth.js');

router.post('/post', checkAuth, locationTypeMaster.insertLocationType);

router.post('/get/list', locationTypeMaster.fetchLocationTypes);

router.get('/get/list', locationTypeMaster.getLocationTypes);

router.get('/get/count', locationTypeMaster.countLocationTypes);

router.get('/get/one/:fieldID', locationTypeMaster.fetchSingleLocationType);

router.get('/search/:str', locationTypeMaster.searchLocationType);

router.patch('/patch', locationTypeMaster.updateLocationType);

router.delete('/delete/:fieldID', locationTypeMaster.deleteLocationType);
//router.delete('/delete/:fieldID', locationTypeMaster.deleteLocationType);

module.exports = router;