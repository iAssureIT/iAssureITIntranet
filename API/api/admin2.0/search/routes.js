const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post/search',Controller.getSearchResults);

router.get('/get/search-categories',Controller.getSearchCatg);

router.get('/get/subcategories/:category',Controller.getSubCatg);

router.get('/get/auto-suggestions/:searchPhrase',Controller.getSearchSuggestions);

router.patch('/patch/my-consultant',Controller.updateMyConsultant);

router.patch('/patch/my-enterprise',Controller.updateMyEnterprise);


module.exports = router;
