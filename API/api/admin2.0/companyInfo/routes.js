const express 	= require("express");
const router 	= express.Router();
// const checkAuth = require('../../middlerware/check-auth.js');
const CompanyController   = require('./controller');
const { post, patch, get } = require("request");

router.post('/post', CompanyController.insertCompany);

router.get('/getCompany/:_id',CompanyController.getCompany);

router.get('/getAllCompanies',CompanyController.getAllCompanies);

router.post('/fetchCompany',CompanyController.fetchCompany);

router.delete('/delete/:_id',CompanyController.deleteCompany);

// ====== location ===============

router.patch('/patch/addLocation', CompanyController.addLocation);

router.post('/get/singleLocation',CompanyController.singleLocation);

router.patch('/patch/updateSingleLocation', CompanyController.updateSingleLocation);

router.delete('/deleteLocation/:_id/:locationID',CompanyController.deleteLocation);

// ====== contact ===============

router.patch('/patch/addContact', CompanyController.addContact);

router.post('/post/singleContact',CompanyController.singleContact);

router.patch('/patch/updateSingleContact', CompanyController.updateSingleContact);

router.delete('/deleteContact/:_id/:contactID',CompanyController.deleteContact);

// ====== social media ===============

router.patch('/patch/addSocialMedia/:_id', CompanyController.addSocialMedia);

// ====== about ===============

router.patch('/patch/addAbout/:_id', CompanyController.addAbout);

// ====== service ===============

router.patch('/patch/addServices', CompanyController.addServices);

router.delete('/deleteService/:_id/:serviceID',CompanyController.deleteService);




// router.get('/get/count/:entityType',CompanyController.countEntity);

// router.post('/get/filterEntities',CompanyController.filterEntities);

// router.get('/get/list/:entityType/:company_id',CompanyController.listSupplier);

// router.post('/get/gridfilterEntities',CompanyController.filterEntities_grid);

// router.get('/get/getAllVendors/:city',CompanyController.getAllVendors);

// router.post('/get/getAdminCompany',CompanyController.getAdminCompany);

// router.get('/get/one/:_id', CompanyController.singleEntity);

// router.get('/get/one/:entityType/:franchiseId', CompanyController.listEntity_franchise);

// router.get('/get/one/entity/:userID', CompanyController.entityDetails);

// // router.post('/get/one/companyName/:companyID', CompanyController.companyName);
// router.post('/get/company_name/:companyID', CompanyController.get_companyName);

// router.post('/get/one/companyName', CompanyController.get_companyName);

// router.get('/get/companyName/:companyID', CompanyController.companyName);

// router.get('/get/one/companyNameType/:companyID/:type', CompanyController.companyNameType);

// router.get('/get/singlelocation/:_id/:branchCode',CompanyController.branchCodeLocation);

// router.get('/get/companywiseData/:companyName',CompanyController.companyNamewiseData);

// router.patch('/patch', CompanyController.updateEntity);

// router.patch('/patch/profileStatus', CompanyController.updateProfileStatus);

// router.patch('/patch/addLocation', CompanyController.addLocation);
 
// router.post('/post/singleLocation',CompanyController.singleLocation);

// router.post('/getAll',CompanyController.fetchEntities);

// router.get('/getAllcompany',CompanyController.CompanyfromEntities);

// router.get('/getAllEntities',CompanyController.getAllEntities);

// router.post('/getAllLocation',CompanyController.fetchLocationEntities);

// router.post('/getAllContact',CompanyController.fetchContactEntities);

// router.post('/get_worklocation',CompanyController.getWorkLocation);

// router.patch('/patch/updateSingleLocation', CompanyController.updateSingleLocation);

// router.patch('/patch/addContact', CompanyController.addContact);

// router.post('/post/singleContact',CompanyController.singleContact);

// router.patch('/patch/updateSingleContact', CompanyController.updateSingleContact);

// // router.get('/get/checkBAExists/:emailID', baController.check_ba_exists);

// router.delete('/delete/:_id',CompanyController.deleteEntity);

// router.delete('/deleteLocation/:_id/:locationID',CompanyController.deleteLocation);

// router.delete('/deleteContact/:_id/:contactID',CompanyController.deleteContact);

module.exports = router;