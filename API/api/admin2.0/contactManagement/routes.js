const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post',Controller.insertContact);

router.get('/get/list',Controller.getContactUsList);

module.exports = router;
