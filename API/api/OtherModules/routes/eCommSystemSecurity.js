const express 	= require("express");
const router 	= express.Router();

// const checkAuth     = require('../middlerware/check-auth.js');
const UserController = require('../controllers/eCommSystemSecurity.js');


router.get('/:userID',UserController.user_details);
router.delete('/:userID',UserController.delete_user);
router.patch('/userdetails/:userID',UserController.update_user_details); 
router.patch('/updateuseraddress',UserController.add_user_address);
router.patch('/patch/address',UserController.add_delivery_address);
router.patch('/delete/address',UserController.delete_delivery_address);

router.post('/ba', UserController.ba_signupadmin); 
router.post('/vendor', UserController.vendor_signup);  
// router.post('/userslist',UserController.users_fetch); 
// router.get('get/list', UserController.users_list);

module.exports = router;