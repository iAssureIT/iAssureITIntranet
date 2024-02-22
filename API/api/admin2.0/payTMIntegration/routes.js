const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post/initializeTransaction',Controller.globalVariable);



module.exports = router;


//"/api/paytm/post/initializeTransaction" 