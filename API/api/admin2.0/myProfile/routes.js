const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post/submit-myprofile',Controller.submit_myprofile);

router.patch('/patch/update-consultant-profile',Controller.update_consultant_profile);

router.patch('/patch/update-consultant-categories',Controller.update_consultant_categories);

router.patch('/patch/update-consultant-documents',Controller.update_consultant_documents);

router.patch('/patch/my-consultant',Controller.update_for_myconsultant);

router.patch('/patch/subscription-plan',Controller.update_subscription_plan);

router.get('/get/myprofiledata/:user_id',Controller.get_myprofile);

router.get('/get/consultant-list/:enterprise_id',Controller.getConsultatList);

router.get('/get/consultant-profile/:user_id',Controller.get_consultant_profile);

router.get('/get/check-unique-mobile-number/:mobileNumber',Controller.check_unique_mobile_number);

router.get('/get/subscription-plan-details/:user_id',Controller.get_subscription_plan);

router.post('/get/linkedin-profile/',Controller.fetchLinkedinProfile);

router.patch('/patch/renew-subscription-plan',Controller.update_renew_subscription_plan);

module.exports = router;
