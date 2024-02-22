const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const customerQueryController = require('./Controller');

router.post('/post', checkAuth, customerQueryController.query_mail);

module.exports = router;