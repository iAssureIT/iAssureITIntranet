const express 	= require("express");
const router 	= express.Router();

const EventTokenContoller = require('./ControllerEventTokenMaster.js');

router.post('/post', EventTokenContoller.insertEventToken);

router.patch('/patch', EventTokenContoller.updateEventToken);

router.post('/list', EventTokenContoller.getAllEventToken);

router.get('/get/one/:id', EventTokenContoller.getSingleEventToken);

router.get('/get/token/:event', EventTokenContoller.getTokensByEvent);

router.delete('/delete/:id', EventTokenContoller.deleteEventToken);

module.exports = router;


