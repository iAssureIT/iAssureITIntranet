const express 		        = require("express");
const router 		        = express.Router();
const TrackingController    = require('./Controller.js');

router.post('/post/add_tracking',   TrackingController.addActivity);

router.post('/post/start_racking',  TrackingController.startTracking);

router.get('/get/status/:user_id', TrackingController.getStatus);

module.exports = router;