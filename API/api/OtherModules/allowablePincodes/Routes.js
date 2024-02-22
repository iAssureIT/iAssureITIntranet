const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const allowablePincodeController = require('./Controller');

//route for allowable pincodes
router.post('/post', 						checkAuth, allowablePincodeController.add_allowablePincodes);

router.get('/get', 							checkAuth, allowablePincodeController.get_allowablePincodes);

router.get('/checkpincode/:pincode', 	checkAuth, allowablePincodeController.check_delivery);

router.get('/get/:franchiseID', 			checkAuth, allowablePincodeController.get_allowablePincodes_franchise);


module.exports = router;