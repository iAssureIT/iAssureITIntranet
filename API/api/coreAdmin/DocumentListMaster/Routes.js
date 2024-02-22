const express 	= require("express");
const router 	= express.Router();

const DocumentListMaster = require('./Controller.js');

router.post('/post', DocumentListMaster.insertDocumentListMaster);

router.get('/get/list', DocumentListMaster.getDocumentList);

router.post('/get/list', DocumentListMaster.fetchDocumentList); 

router.get('/get/list/:entityname', DocumentListMaster.getDriverData); 
 
router.get('/get/one/:fieldID', DocumentListMaster.fetchSingleDocumentList);

router.patch('/patch', DocumentListMaster.updateDocumentList);

router.delete('/delete/:fieldID', DocumentListMaster.deleteDocumentList);

// router.post('/bulkUploadModel',DocumentListMaster.bulkUploadDocumentList);

// router.get('/get/filedetails/:fileName', DocumentListMaster.filedetails);

// router.post('/get/files', DocumentListMaster.fetch_file); 


module.exports = router;