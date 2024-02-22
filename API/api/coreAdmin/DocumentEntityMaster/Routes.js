const express 	= require("express");
const router 	= express.Router();

const DocumentEntityMaster = require('./Controller.js');


router.post('/post', DocumentEntityMaster.insertDocuments);

router.post('/get/list', DocumentEntityMaster.fetchDocuments);

router.get('/get/list', DocumentEntityMaster.getDocuments);

router.get('/get/count', DocumentEntityMaster.countdocuments);

router.get('/get/one/:fieldID', DocumentEntityMaster.fetchSingleDocument);

router.get('/search/:str', DocumentEntityMaster.searchDocuments);

router.patch('/patch', DocumentEntityMaster.updateDocument);

router.delete('/delete/:fieldID', DocumentEntityMaster.deletedocument);

router.post('/get/files', DocumentEntityMaster.fetch_file); 

router.get('/get/filedetails/:fileName', DocumentEntityMaster.filedetails);

module.exports = router;