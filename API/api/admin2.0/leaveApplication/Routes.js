const express 	= require("express");
const router 	= express.Router();

const leaveApplication = require('./Controller.js');

router.post('/post', leaveApplication.insertApplication);
router.get('/get/pending-request/:status',leaveApplication.getLeaveRequest)
router.patch('/update/status/:manager_id', leaveApplication.updateStatus);

module.exports = router;