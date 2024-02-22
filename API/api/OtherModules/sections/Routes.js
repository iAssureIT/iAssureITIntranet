const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const sectionsController = require('./Controller');

router.post('/post', 						checkAuth, sectionsController.insert_section);

router.get('/get/list-with-limits/:startRange/:limitRange', checkAuth, sectionsController.get_sections_with_limits);

router.post('/get/list-with-limits', checkAuth, sectionsController.get_sections_list_with_limits);

router.patch('/patch', 						checkAuth, sectionsController.update_section);

router.patch('/patch/status', 				checkAuth, sectionsController.update_section_status);

router.delete('/delete/:sectionID', 		checkAuth, sectionsController.delete_section);

router.delete('/get/deleteAllSections', 	checkAuth, sectionsController.deleteAllSections);

router.post('/get/list', 	                sectionsController.get_list_for_section_category_block);

router.post('/get/list_by_url', 	          sectionsController.get_list_for_section_category_block_by_url);

router.get('/get/list', 					sectionsController.get_sections);

router.get('/get/filter/sections', 					sectionsController.getFilterSections);

router.get('/get/all/list', 					sectionsController.get_sections_list);

router.get('/get/count', 					sectionsController.count_section);

router.get('/get/one/:sectionID', 			sectionsController.get_single_section);

router.get('/get/get_megamenu_list', 		sectionsController.get_megamenu_list);

module.exports = router; 