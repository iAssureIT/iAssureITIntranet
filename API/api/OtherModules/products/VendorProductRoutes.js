const express 		        = require("express");
const router 		        = express.Router();
const checkAuth 	        = require('../../coreAdmin/middlerware/check-auth.js');
const productController 	= require('./Controller');
const productStock 			= require('./Controller2');


router.post('/post', 													checkAuth, productController.insert_product);


module.exports = router;