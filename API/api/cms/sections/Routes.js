const express 	= require("express");
const router 	= express.Router();

const sectionsController = require('./Controller');

router.post('/post', sectionsController.insert_section);

router.get('/get/list',sectionsController.get_sections);

router.get('/get/list-with-limits/:startRange/:limitRange',sectionsController.get_sections_with_limits);

router.get('/get/count',sectionsController.count_section);

router.get('/get/one/:sectionID',sectionsController.get_single_section);

router.get('/get/get_megamenu_list',sectionsController.get_megamenu_list);

router.patch('/patch', sectionsController.update_section);

router.delete('/delete/:sectionID',sectionsController.delete_section);

module.exports = router; 