const express 	= require("express");
const router 	= express.Router();

const OrgLevelMaster = require('./Controller.js');

router.post('/post', OrgLevelMaster.insertOrgLevel);

router.post('/get/list', OrgLevelMaster.fetchOrgLevel);

// router.get('/get/list', OrgLevelMaster.fetchAllOrgLevel);

router.get('/get/count', OrgLevelMaster.countOrgLevel);

router.get('/get/one/:fieldID', OrgLevelMaster.fetchSingleOrgLevel);

router.get('/search/:str', OrgLevelMaster.searchOrgLevel);

router.patch('/patch', OrgLevelMaster.updateOrgLevel);

router.post('/bulkUploadOrgLevel',OrgLevelMaster.bulkUploadOrgLevel);

router.post('/get/files', OrgLevelMaster.fetch_file); 

router.get('/get/filedetails/:fileName', OrgLevelMaster.filedetails);

router.delete('/delete/:fieldID', OrgLevelMaster.deleteOrgLevel);

module.exports = router;