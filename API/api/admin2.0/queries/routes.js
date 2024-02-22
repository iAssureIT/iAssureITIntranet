const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/insert-query',Controller.insertQuery);


module.exports = router;
