const express 	= require("express");
const router 	= express.Router();

const taxNameMaster = require('./ControllerTaxNameMaster.js');

const checkAuth = require('../middlerware/check-auth.js');

router.post('/post', checkAuth, taxNameMaster.insertTaxName);

router.post('/get/list', taxNameMaster.fetchTaxNames);

router.get('/get/list', taxNameMaster.getTaxNames);

router.get('/get/count', taxNameMaster.countTaxNames);

router.get('/get/one/:fieldID', taxNameMaster.fetchSingleTaxName);

router.get('/search/:str', taxNameMaster.searchLocationType);

router.patch('/patch', taxNameMaster.updateTaxName);

router.delete('/delete/:fieldID', taxNameMaster.deleteTaxName);

module.exports = router;