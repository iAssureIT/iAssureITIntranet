const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/insert-feedback',Controller.insertFeedback);


module.exports = router;
