const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const DiscountManagementController = require('./Controller');

router.post('/post',                              					checkAuth, DiscountManagementController.insert_discount);

router.get('/get/list',                                    		checkAuth, DiscountManagementController.get_discounts);

router.get('/get/list-with-limits/:startRange/:limitRange',	DiscountManagementController.get_discounts_with_limits);

router.get('/get/count',                                    	checkAuth, DiscountManagementController.count_discount);

router.get('/get/one/:discountID',                          	checkAuth, DiscountManagementController.get_single_discount);

router.patch('/patch',                                      	checkAuth, DiscountManagementController.update_discount);

router.delete('/delete/:discountID',                        	checkAuth, DiscountManagementController.delete_discount);

module.exports = router; 