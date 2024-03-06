const express 	= require("express");
const router 	= express.Router();

const leaveApplication = require('./Controller.js');

router.post('/post', leaveApplication.insertApplication);

module.exports = router;