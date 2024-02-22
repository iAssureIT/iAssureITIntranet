const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.get('/get/list/:user_id',Controller.getMyConsultants);

router.get('/get/names-of-my-consultants/:user_id',Controller.getMyConsultantNames);

router.post('/post/search',Controller.searchMyConsultants);


module.exports = router;
