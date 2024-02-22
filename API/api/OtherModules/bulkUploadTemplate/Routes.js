const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const bulkUploadTemplateController = require('./Controller');

router.post('/post/addBulkUploadTemplate', 	checkAuth, bulkUploadTemplateController.addBulkUploadTemplate);

router.patch('/patch/bulkUploadTemplate', 	checkAuth, bulkUploadTemplateController.updateBulkUploadTemplate);

router.get('/get/list', 							checkAuth, bulkUploadTemplateController.getTemplates);
	
router.get('/get/count', 							checkAuth, bulkUploadTemplateController.getTemplatesCount);

router.get('/get/:category_ID', 					checkAuth, bulkUploadTemplateController.getTemplateByCategory);

router.get('/getTemplate/:template_ID', 		checkAuth, bulkUploadTemplateController.getTemplateByID);

router.delete('/delete/:template_ID', 			checkAuth, bulkUploadTemplateController.deleteTemplate);

module.exports = router;