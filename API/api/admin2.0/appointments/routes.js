const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post/book-appointment',Controller.bookAppointment);

router.get('/get/user/list/:user_id/:fromDate/:toDate',Controller.getAllUserAppointments);
router.get('/get/video-conference-details/:roomId',Controller.getAppointmentMeetingDetails);

router.get('/get/consultant-appointment-list/:consultant_id',Controller.getOneConsultantAppointments);

router.get('/get/consultant/list/:consultant_id/:fromDate/:toDate',Controller.getAllConsultantAppointments);

router.get('/get/myclients/list/:consultant_id',Controller.getMyClientsList);

router.post('/post/search/myclients',Controller.searchMyClients);

router.patch('/patch/status',Controller.patchStatus);

router.patch('/patch/reschedule',Controller.patchReschedule);

router.get('/get/find-review-not-submitted/:user_id',Controller.findReviewNotSubmitted);

router.get('/get/count-consultant-calls-per-month/:user_id',Controller.monthlyCallsofConsultant);


module.exports = router;
