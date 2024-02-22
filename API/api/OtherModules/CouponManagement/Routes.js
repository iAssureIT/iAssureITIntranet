const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const CouponManagementController = require('./Controller');

router.post('/post', 										checkAuth, CouponManagementController.insert_coupon);

router.post('/post/inActivateExpiredCoupons', 		CouponManagementController.inActivateExpiredCoupons);

router.get('/get/list', 									checkAuth, CouponManagementController.get_coupon);

router.get('/get/list-with-limits/:startRange/:limitRange', checkAuth, CouponManagementController.get_discounts_with_limits);

router.get('/get/count', 									checkAuth, CouponManagementController.count_discount);

router.get('/get/one/:couponID', 							checkAuth, CouponManagementController.get_single_coupon);

router.get('/get/one_by_couponcode/:couponCode/:user_id', 	CouponManagementController.get_coupon_by_couponcode);

router.patch('/patch', 										checkAuth, CouponManagementController.update_coupon);

router.patch('/patch/couponBulkAction', 					checkAuth, CouponManagementController.couponBulkAction);

router.delete('/delete/:couponID', 							checkAuth, CouponManagementController.delete_coupon);

module.exports = router; 