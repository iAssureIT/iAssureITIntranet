const express 	= require("express");
const router 	= express.Router();

const GlobalMasterContoller = require('./ControllerGlobalMaster.js');

router.patch('/taxSettings', GlobalMasterContoller.insertTax);

router.patch('/updateTaxSettings', GlobalMasterContoller.updateTaxSettings);

router.get('/getTaxData', GlobalMasterContoller.showAllTaxDetails);

router.get('/TaxData/:type', GlobalMasterContoller.get_tax_Data);

router.get('/getSingleTaxData/:id', GlobalMasterContoller.getSingleTaxData);

router.patch('/patch/status', GlobalMasterContoller.updateStatus);

router.patch('/SMS', GlobalMasterContoller.insertSMSData);

router.patch('/Email', GlobalMasterContoller.insertEmailData);

router.get('/get/sms_details', GlobalMasterContoller.getSMSDetails);

router.get('/get/email', GlobalMasterContoller.getEmailDetails);

module.exports = router;


