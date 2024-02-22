const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post',Controller.upsertWallet);

router.get('/get/:user_id',Controller.getWallet);

module.exports = router;
