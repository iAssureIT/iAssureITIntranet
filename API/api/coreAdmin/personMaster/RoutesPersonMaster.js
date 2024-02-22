const express 	= require("express");
const router 	= express.Router();

const personMaster = require('./ControllerPersonMaster');

router.post('/post', personMaster.insertPerson);

router.get('/get/count/:type',personMaster.countPersons);

router.post('/get/list',personMaster.listPersons);

router.post('/get/filterPersons',personMaster.filterPersons);

router.get('/get/one/:personID', personMaster.singlePerson);

// router.get('/get/employee/one/:employeeID', personMaster.singlePersonUsingEmpID);
 
router.get('/get/details/:userID', personMaster.singlePersonByUserId);

router.patch('/patch/deletestatus',personMaster.person_update_delete_status);

router.patch('/patch/restorestatus',personMaster.person_update_recover_status);


router.patch('/patch', personMaster.updatePerson);

router.patch('/patch/changeStatus', personMaster.updatePersonStatus);

router.get('/search/:type/:str/:company_Id', personMaster.searchPerson);

router.get('/searchPersonByIDName/:companyID/:str', personMaster.searchPersonByID_Name);


router.post('/bulkUploadEmployee',personMaster.bulkUploadEmployee);

router.delete('/delete/:personID',personMaster.deletePerson);



//Driver Mobile App Routes (Rushikesh Salunkhe)

router.patch('/patch/basicInfo',personMaster.updatePersonBasicInfo);

router.patch('/patch/addressInfo',personMaster.updatePersonAddressInfo);

router.patch('/patch/documentsInfo',personMaster.updatePersonDocumentsProof);

router.patch('/patch/personProfilePhoto',personMaster.personProfilePhoto);

router.get('/get/personProfilePhoto/:userId',personMaster.getPersonProfilePhoto);

//Vendor App Routes (Rushikesh Salunkhe)

router.get('/get/driverListMapping/:company_Id',personMaster.driverListMapping);

router.post('/get/person/list',personMaster.getPersonList);


router.post('/post/list/driverforallocation', personMaster.getDriverListForAllocation);

router.get('/get/filedetails/:type/:fileName', personMaster.filedetails);

router.post('/get/files', personMaster.fetch_file); 
 
router.get('/get/files/count/:type', personMaster.fetch_file_count);

router.get('/get/UserID/:employeeId/:corporateId',personMaster.getUserByEmpID);

router.get('/get/User/:employeeId',personMaster.getEmpByEmpID);

router.get('/get/emailID/:emailId',personMaster.getUserByEmail);

router.get('/get/guest/:email/:corporateId',personMaster.getGuestByEmail);

router.get('/getUserByUserId/:userId',personMaster.getUserByUserId);

router.get('/get/ID/:userId',personMaster.getUserByID);

router.patch('/patch/temp_delete_driver', personMaster.tempDeleteDriver);

router.patch('/patch/restore_driver', personMaster.driver_update_recover_status);

module.exports = router;