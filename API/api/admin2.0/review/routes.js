const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post',Controller.insertReview);

router.get('/get/list',Controller.getReviewList);

router.patch('/patch/reply',Controller.patchReply);

router.get('/get/user_review_list/:user_id',Controller.getUserReviewList);

router.get('/get/consultant_review_list/:user_id',Controller.getConsultantReviewList);

router.get('/get/enterprise_review_list/:enterprise_id',Controller.getEnterpriseReviewList);



module.exports = router;
