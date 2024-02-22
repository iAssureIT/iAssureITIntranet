const express 	= require("express");
const router 	= express.Router();

const ControllerEventMapping = require('./ControllerEventMapping.js');


router.post('/post', ControllerEventMapping.insertEventMapping);
router.post('/post/list', ControllerEventMapping.fetchEventMappings);
router.patch('/patch', ControllerEventMapping.updateEventMapping);


module.exports = router;
