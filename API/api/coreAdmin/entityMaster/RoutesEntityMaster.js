const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../middlerware/check-auth.js');

const entityMaster	= require('./ControllerEntityMaster');

router.post('/post',  												checkAuth, entityMaster.insertEntity);

router.post('/post/sos',  											entityMaster.sos_to_appCompony_contacts);

router.get('/get/:entityType', 									entityMaster.listEntity);

router.get('/get/filter/:entityType', 							checkAuth, entityMaster.listFilterEntity);

router.get('/countContacts/:entityType', 						checkAuth, entityMaster.countContacts);

router.get('/getCompany/:companyID', 							entityMaster.getCompany);

router.get('/get/count/:entityType', 							checkAuth, entityMaster.countEntity);

router.post('/get/filterEntities', 								entityMaster.filterEntities);

router.get('/get/list/:entityType/:company_id', 			checkAuth, entityMaster.listSupplier);

router.post('/get/gridfilterEntities', 						entityMaster.filterEntities_grid);

router.get('/get/getAllVendors/:city', 						checkAuth, entityMaster.getAllVendors);

router.post('/get/getAdminCompany', 							checkAuth, entityMaster.getAdminCompany);

router.get('/get/one/:entityID', 								entityMaster.singleEntity);

router.get('/get/one/:entityType/:franchiseId', 			checkAuth, entityMaster.listEntity_franchise);

router.get('/get/one/entity/:userID', 							checkAuth, entityMaster.entityDetails);

// router.post('/get/one/companyName/:companyID', checkAuth, entityMaster.companyName);
router.post('/get/company_name/:companyID', 					 checkAuth, entityMaster.get_companyName);

router.post('/get/one/companyName', 							checkAuth, entityMaster.get_companyName);

router.get('/get/companyName/:companyID', 					entityMaster.companyName);

router.get('/get/one/companyNameType/:companyID/:type', 	checkAuth, entityMaster.companyNameType);

router.get('/get/singlelocation/:entityID/:branchCode', 	checkAuth, entityMaster.branchCodeLocation);

router.get('/get/companywiseData/:companyName', 			checkAuth, entityMaster.companyNamewiseData);

router.patch('/patch', 												checkAuth, entityMaster.updateEntity);

router.patch('/patch/profileStatus', 							checkAuth, entityMaster.updateProfileStatus);

router.patch('/patch/addLocation', 								checkAuth, entityMaster.addLocation);
 
router.post('/post/singleLocation', 							checkAuth, entityMaster.singleLocation);

router.post('/getAll', 												entityMaster.fetchEntities);

router.get('/getAllcompany', 										checkAuth, entityMaster.CompanyfromEntities);

router.get('/getAllEntities', 									checkAuth, entityMaster.getAllEntities);

router.post('/getAllLocation', 									entityMaster.fetchLocationEntities);

router.post('/getAllContact', 									checkAuth, entityMaster.fetchContactEntities);

router.post('/get_worklocation', 								checkAuth, entityMaster.getWorkLocation);

router.patch('/patch/updateSingleLocation', 					checkAuth, entityMaster.updateSingleLocation);

router.patch('/patch/addContact', 								checkAuth, entityMaster.addContact);

router.post('/post/singleContact', 								checkAuth, entityMaster.singleContact);

router.patch('/patch/updateSingleContact', 					checkAuth, entityMaster.updateSingleContact);

router.post('/post/vendor/list', 								entityMaster.getVendorList);

router.post('/bulkUploadEntity',                                entityMaster.bulkUploadEntity);

router.get('/get/filedetails/:fileName',                        entityMaster.filedetails);

router.post('/get/files',                                        entityMaster.fetch_file);

router.post('/get/searchfile', 									entityMaster.search_file);
// router.get('/get/checkBAExists/:emailID', baController.check_ba_exists);

router.patch('/change/status/:entityID', 						entityMaster.changeEntityStatus);

router.delete('/delete/:entityID', 								entityMaster.deleteEntity);

router.delete('/deleteLocation/:entityID/:locationID', 	checkAuth, entityMaster.deleteLocation);

router.delete('/deleteContact/:entityID/:contactID', 		checkAuth, entityMaster.deleteContact);


//API Mobile App - Rushikesh Salunkhe
//Get details to display contact details
router.get('/get/one', entityMaster.appCompanyDetails);


//============  For Inactive Companies ============

router.post('/getAll/inactive', entityMaster.fetchInactiveEntities);

router.get('/get/list/inactive/:entityType/:company_id',checkAuth, entityMaster.listInactiveSupplier);

router.get('/get/inactive/:entityType', checkAuth, entityMaster.listInactiveEntity);

router.get('/get/count/inactive/:entityType', checkAuth, entityMaster.countInactiveEntity);

router.post('/get/filterEntities/inactive', entityMaster.filterInactiveEntities);



module.exports = router;