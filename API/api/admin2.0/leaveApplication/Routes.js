const express 	= require("express");
const router 	= express.Router();

const leaveApplication = require('./Controller.js');

router.post('/post', leaveApplication.insertApplication);
router.patch('/update/status', leaveApplication.updateStatus);
router.get('/singleleave/:leave_id', leaveApplication.getInfo);
router.get('/get/pending-request/:status',leaveApplication.getLeaveRequest)

module.exports = router;