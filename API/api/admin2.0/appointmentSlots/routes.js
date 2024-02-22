const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post/insert-appointment-slots',Controller.insertAppointmentSlots);

router.post('/get/list',Controller.getAppointmentSlots);

router.post('/get/oneday/',Controller.getAppointmentSlots);

router.patch('/patch/disableday',Controller.disableDay);

router.patch('/patch/disableslot',Controller.disableSlot);

router.patch('/patch/deleteday',Controller.deleteDay);


module.exports = router;
