const express 	= require("express");
const router 	= express.Router();

const leaveMaster = require('./Controller.js');

router.post('/post', leaveMaster.insertLeaveData);

router.get('/getLeaveCount', leaveMaster.getLeaveCount);

module.exports = router;