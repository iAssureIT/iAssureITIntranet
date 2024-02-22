const express 	= require("express");
const router 	= express.Router();

const modelMaster = require('./ControllerModelMaster.js');

router.post('/post', modelMaster.insertModel);

router.get('/get/list', modelMaster.getModels);

router.post('/get/list', modelMaster.fetchModels); 

router.get('/get/count', modelMaster.countModels);
 
router.get('/get/one/:fieldID', modelMaster.fetchSingleModel);

router.get('/search/:str', modelMaster.searchModel);

router.patch('/patch', modelMaster.updateModel);

router.delete('/delete/:fieldID', modelMaster.deleteModel);

router.post('/bulkUploadModel',modelMaster.bulkUploadVehicleModel);

router.get('/get/filedetails/:fileName', modelMaster.filedetails);

router.post('/get/files', modelMaster.fetch_file); 


module.exports = router;