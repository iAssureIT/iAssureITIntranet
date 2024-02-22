const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const customerReviewController = require('./ControllerMVMP');

router.post('/post', 							                customerReviewController.insertCustomerReview);

router.get('/get/review/:review_id', 						    customerReviewController.get_single_review);

router.patch('/add/comment', 					                customerReviewController.add_admin_or_vendor_comment);

router.patch('/change/status', 					                customerReviewController.change_review_status);

router.get('/get/list/:product_id', 				            customerReviewController.list_customer_review_for_product);

router.post('/get/single/customer/review', 				        customerReviewController.single_customer_review_for_product);

router.patch('/patch/customer/review', 							customerReviewController.updateCustomerReview);

router.post('/search/post', 					                checkAuth, customerReviewController.searchCustomerReview);


router.patch('/admin/review', 					                checkAuth, customerReviewController.add_admin_comment);


router.put('/status', 							                checkAuth, customerReviewController.update_review_status);

router.get('/get/count', 						                customerReviewController.count_review);

router.get('/get/vendorwisecount/:vendorID', 	                checkAuth, customerReviewController.vendor_review_count);

router.post('/get/list', 						                customerReviewController.list_review);

router.post('/get/vendorwiselist', 				                checkAuth, customerReviewController.vendor_review_list);

router.get('/get/user/list/:customerID', 		                checkAuth, customerReviewController.listCustomerReviewbucustomerid);

router.get('/get/order/list/:customerID/:orderID/:productID', 	checkAuth, customerReviewController.listCustomerProductReview);

router.get('/get/avg/:productID', 							    checkAuth, customerReviewController.customerReviewAvg);

router.delete('/delete/:reviewID', 								checkAuth, customerReviewController.delete_review);

router.get('/get/ytdreviews', 					                customerReviewController.ytdreviews);

router.get('/get/mtdreviews', 					                customerReviewController.mtdreviews);

router.get('/get/todayscount', 					                customerReviewController.count_todaysreview);

router.get('/get/UnpublishedCount', 			                customerReviewController.UnpublishedCount);

router.get('/get/count', 						                customerReviewController.count_review);


module.exports = router;