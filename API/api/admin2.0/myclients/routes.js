const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.get('/get/list/:consultant_id',Controller.getMyClients);

router.get('/get/names-of-my-clients/:user_id',Controller.getMyClientsNames);


module.exports = router;
