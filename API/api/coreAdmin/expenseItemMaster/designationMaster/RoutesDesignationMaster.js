const express 	= require("express");
const router 	= express.Router();

const designationMaster = require('./ControllerDesignationMaster.js');

router.post('/post', designationMaster.insertDesignation);

router.post('/get/list', designationMaster.fetchDesignations);

router.get('/get/list', designationMaster.getAllDesignations);

router.get('/get/count', designationMaster.countDesignations);

router.get('/get/one/:fieldID', designationMaster.fetchSingleDesignation);

router.get('/search/:str', designationMaster.searchDesignation);

router.patch('/patch', designationMaster.updateDesignation);

router.post('/bulkUploadDesignation',designationMaster.bulkUploadDesignation);

router.get('/get/filedetails/:fileName', designationMaster.filedetails);

router.post('/get/files', designationMaster.fetch_file); 

router.delete('/delete/:fieldID', designationMaster.deleteDesignation);

module.exports = router;