const express 	= require("express");
const router 	= express.Router();

const categoryMaster = require('./ControllerCategoryMaster.js');

router.post('/post', categoryMaster.insertCategory);

router.post('/get/list', categoryMaster.fetchCategories);

router.get('/get/list', categoryMaster.getCategories);

router.get('/get/count', categoryMaster.countCategories);

router.get('/get/one/:fieldID', categoryMaster.fetchSingleCategory);

router.get('/search/:str', categoryMaster.searchCategory);

router.patch('/patch', categoryMaster.updateCategory);

router.delete('/delete/:fieldID', categoryMaster.deleteCategory);

module.exports = router;