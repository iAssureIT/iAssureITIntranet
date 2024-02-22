const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const customerReviewController = require('../customerReview/Controller');

router.post('/post', 							checkAuth, customerReviewController.insertCustomerReview);

router.post('/search/post', 					checkAuth, customerReviewController.searchCustomerReview);

router.patch('/patch', 							checkAuth, customerReviewController.updateCustomerReview);

router.patch('/admin/review', 					checkAuth, customerReviewController.add_admin_comment);

router.get('/get/list/:productID', 				customerReviewController.listCustomerReview);

router.put('/status', 							checkAuth, customerReviewController.update_review_status);

router.get('/get/count', 						customerReviewController.count_review);

router.get('/get/vendorwisecount/:vendorID', 	checkAuth, customerReviewController.vendor_review_count);

router.post('/get/list', 						customerReviewController.list_review);

router.post('/get/vendorwiselist', 				checkAuth, customerReviewController.vendor_review_list);

router.get('/get/user/list/:customerID', 		checkAuth, customerReviewController.listCustomerReviewbucustomerid);

router.get('/get/order/list/:customerID/:orderID/:productID', 	checkAuth, customerReviewController.listCustomerProductReview);

router.get('/get/avg/:productID', 										checkAuth, customerReviewController.customerReviewAvg);

router.delete('/delete/:reviewID', 										checkAuth, customerReviewController.delete_review);

router.get('/get/ytdreviews', 					customerReviewController.ytdreviews);

router.get('/get/mtdreviews', 					customerReviewController.mtdreviews);

router.get('/get/todayscount', 					customerReviewController.count_todaysreview);

router.get('/get/UnpublishedCount', 			customerReviewController.UnpublishedCount);

router.get('/get/count', 						customerReviewController.count_review);


module.exports = router;