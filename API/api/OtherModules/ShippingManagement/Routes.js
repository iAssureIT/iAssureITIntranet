const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const shippingController = require('./Controller');

router.post('/post', 													checkAuth, shippingController.insert_shipping);

router.get('/get/list', 												checkAuth, shippingController.get_Shipping);

router.get('/get/list-with-limits/:startRange/:limitRange', shippingController.get_Shipping_with_limits);

router.get('/get/count', 												checkAuth, shippingController.count_section);

router.get('/get/one/:shippingID', 									checkAuth, shippingController.get_single_Shipping);

router.get('/get/get_megamenu_list', 								checkAuth, shippingController.get_megamenu_list);

router.patch('/patch', 													checkAuth, shippingController.update_shipping);

router.delete('/delete/:shippingID', 								checkAuth, shippingController.delete_shipping);

module.exports = router; 