const express 	= require("express");
const router 	= express.Router();

const contract = require('./ControllerContract.js');

router.post('/post', contract.insertContract);

router.patch('/patch/addpackage', contract.savePackage);

router.patch('/patch/addcondition', contract.saveCondition);

router.patch('/patch/corporateapprovalstatus', contract.UpdateCorporateApprovalStatus);

router.patch('/patch/updatepackage', contract.updatePackage);

router.post('/get/list', contract.fetchContracts);

router.get('/get/list', contract.getContracts);

router.get('/get/count', contract.countContracts);

router.get('/get/joincontract/:contractID', contract.joincontract);

router.get('/get/joincontractlist', contract.joincontractlist);

router.get('/get/one/:contractID', contract.fetchSingleContract);

router.patch('/patch', contract.updateContract);

router.post('/filterContract', contract.filterContract);

router.get('/search/:str', contract.searchContract);

router.get('/packagesInContract/:corporateID', contract.packagesInContract);

// router.get('/image', contract.image);

router.get('/get/packageData/:todayDate', contract.getPackageDetails);

router.delete('/delete/:contractID', contract.deleteContract);

router.delete('/deletepackageincontract/:contractID/:packageID', contract.deletePackageInContract);

module.exports = router;