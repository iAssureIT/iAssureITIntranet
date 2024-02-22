const express 			= require("express");
const router 			= express.Router();
const checkAuth       	= require('../middlerware/check-auth.js');
const UserController  	= require('./ControllerSystemSecurity.js');
const UserController1 	= require('./newController.js');

router.post('/post/signup/user', UserController.user_signup_user); //Working

router.post('/post/signup/user/otp', UserController.user_signup_user_otp); //Working
router.post('/post/signup/verify-email/otp', UserController.user_signup_verify_email_otp); //Working

router.get('/get/checkemailotp/usingID/:ID/:emailotp',UserController.check_userID_EmailOTP);
router.get('/get/checkemailotp/usingUsername/:username/:emailotp',UserController.check_username_EmailOTP);
router.post('/post/loginwithcompanyid',UserController.user_login_with_companyID); //Working
router.patch('/patch/change_password_withoutotp/username/:username',UserController.user_update_password_withoutotp_username);

router.patch('/patch/setsendemailotpusingID/:ID',UserController.set_send_emailotp_usingID);
router.patch('/patch/setsendemailotpusingEmail/:emailId',UserController.set_send_emailotp_usingEmail);

/** Updated API's for MVMP */
router.patch('/patch/reset_password',   UserController.resetPassword);

router.post('/post/login',              UserController.user_login_using_email); //Working

router.post('/post/logout',             UserController.logouthistory); //Working

//API for Mobile app
router.post('/post/login/mobile',UserController.user_login_using_mobile); //Working
router.post('/post/signup_user', UserController1.user_signup_user); //Working
router.get('/get/checkmobileotp/usingID/:ID/:mobileotp',UserController.check_userID_MobileOTP);//Working
router.patch('/patch/setsendmobileotpusingMobile/:mobileNo',UserController.set_send_mobileotp_usingMobile);//working


//new api for systemsecurity
router.post('/post/login/mob_email',UserController.user_login_mob_email); 
router.post('/post/login/mob_email_new',UserController.user_login_mob_email_new); 
router.post('/post/signup/social_media',UserController.user_signup_social_media); 
router.post('/post/signup/guest_login',UserController.user_signup_guest_login);

router.patch('/patch/set_send_otp/:username',           UserController.set_send_otp); 


router.patch('/patch/setsendmobileotpusingID/:user_id', UserController.set_send_mobileotp_usingID);//working
router.patch('/patch/change_password_withoutotp/id', UserController.change_password_withoutotp);//working
router.patch('/patch/change_password_using_otp/id/:user_id', UserController.user_update_password_with_mobileOTP_ID);//working

router.patch('/patch/change-password-using-username', UserController.change_password_using_username);//working
router.patch('/patch/change-password-after-login', UserController.change_password_after_login);//working

router.post('/post/send-otp-using-username', UserController.send_otp_using_username); 

router.post('/patch/send-otp-using-username', UserController.send_otp_using_username); 

router.post('/post/send-otp-forgot-password', UserController.send_otp_forgot_password); 
router.post('/post/verify-otp-for-signup', UserController.verify_otp_for_signup); 

router.post('/post/send-otp-for-login', UserController.send_otp_for_login); 
router.post('/post/verify-otp-for-login', UserController.verify_otp_for_login); 


module.exports = router;
