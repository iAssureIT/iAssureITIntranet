const mongoose 				= require("mongoose");
const bcrypt 				= require("bcryptjs");
const jwt 					= require("jsonwebtoken");
var ObjectID 				= require('mongodb').ObjectID;
var request 				= require('request-promise');
const User 					= require('../userManagementnew/ModelUsers.js');
const Role 					= require('../rolesManagement/ModelRoles.js');
const globalVariable 		= require("../../../nodemonConfig.js");
// const GlobalMaster      	= require('../projectSettings/ModelProjectSettings.js');
const nodeMailer        	= require('nodemailer');
const moment 				= require('moment-timezone');
const lookup 				= require('country-code-lookup')
const {sendNotification} 	= require("../../admin2.0/common/globalFunctions");


function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.user_signup_user = (req, res, next) => {
	// console.log("<><><><><><><><><><><>",req.body);
	var username = "EMAIL";
	if(req.body.username){
		if(req.body.username === "EMAIL"){
			username = "EMAIL";
		}else if(req.body.username === "MOBILE"){
			username = "MOBILE";
		}
	}
	signUpFunction();
    async function signUpFunction(){
    var nextEmployeeID = await getNextEmployeeID();
	if(username==="EMAIL"){
		if(req.body.email && req.body.pwd && req.body.role){
			var emailId  	= req.body.email;
			var role_lower 	= String(req.body.role).toLowerCase();
			// console.log("role ", role_lower);

			if (role_lower && emailId) {
				Role.findOne({ role: role_lower })
					.exec()
					.then(role => {
						// console.log("role",role);

						if (role && role !== null) {
							User.find({ "username": emailId.toLowerCase() })
								.exec()
								.then(user => {
									// console.log("user => ",user)
									// console.log("user length => ",user.length)
									if (user.length > 0) {
										return res.status(200).json({
											message: 'Email Id already exist.'
										});
									} else {
										bcrypt.hash(req.body.pwd, 10, (err, hash) => {
											if (err) {
												return res.status(500).json({
													message: "Failed to match the password",
													error: err
												});
											} else {
												const user = new User({
													_id: new mongoose.Types.ObjectId(),
													createdAt 		: new Date,
													services 		: {
														password	: {
															bcrypt 	: hash
														},
													},
													username: emailId.toLowerCase(),
													authService : req.body.authService,
													department: req.body.department,
													designation: req.body.designation,
													orgLevel : req.body.orgLevel,
													profile: {
														employeeID : nextEmployeeID,
														firstname: req.body.firstname,
														lastname: req.body.lastname,
														fullName: req.body.firstname + ' ' + req.body.lastname,
														email: emailId.toLowerCase(),
														mobile: req.body.mobNumber,
														companyID: req.body.companyID,
														company_id: req.body.company_ID,
														pincode: req.body.pincode,
														companyName: req.body.companyName,
														department	: req.body.department,
														designation	: req.body.designation,
														city: req.body.cityName,
														states: req.body.states,
														status: req.body.status ? req.body.status : "Block",
														createdBy: req.body.createdBy,
														createdAt: new Date(),
													},
													deliveryAddress : [],
													roles: [role_lower],
													recieveNotifications : req.body.recieveNotifications
												});
												if (!req.body.firstname) {
													user.profile.fullName = req.body.fullName;
												}
												user.save()
													.then(async(result) => {
														// console.log("result => ",result)
														// console.log("condition => ",user.roles.includes("admin"))
														if(!user.roles.includes("admin")){
															//send Notification, email, sms to customer
															var userNotificationValues = {
																					"userRole" 			: role_lower.replace(/([a-z])([A-Z][a-z])/g, "$1 $2").charAt(0).toUpperCase(),
																					"firstName" 		: result.profile.firstName,
																					"lastName" 			: result.profile.lastName,
																					"fullName" 			: result.profile.fullName,
																					"signupOTP" 		: result.profile.otpEmail,
																					"emailId" 			: result.profile.email,
																					"mobileNumber"		: result.profile.mobile,
																					"loginID" 			: result.username,
																					"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a')
																}
															
															console.log("userNotificationValues email => ",userNotificationValues);
															var send_notification_to_user = await sendNotification(result.profile.fullName,
																													"OTP for SignUp",
																													role_lower.replace(/([a-z])([A-Z][a-z])/g,"$1 $2").charAt(0).toUpperCase(),
																													userNotificationValues);
															// console.log("send_notification_to_user => ",send_notification_to_user)
															//send Notification, email, sms to admin
															var adminNotificationValues =  {
																					"firstName" 		: result.profile.firstName,
																					"lastName" 			: result.profile.lastName,
																					"fullName" 			: result.profile.fullName,
																					"emailId" 			: result.profile.email,
																					"mobileNumber"		: result.profile.mobile,
																					"loginID" 			: result.username,
																					"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a')
															}

															var send_notification_to_admin = await sendNotification(result.profile.email,"Account Created","admin",adminNotificationValues
															);
															// console.log("send_notification_to_admin => ",send_notification_to_admin)
														}
														res.status(200).json({
															message : 'USER_CREATED',
															ID 		: result._id,
														})

													})
													.catch(err => {
														console.log(err);
														res.status(500).json({
															message: "Failed to save User Details",
															error: err
														});
													});
											}
										});
									}
								})
								.catch(err => {
									console.log(err);
									res.status(500).json({
										message: "Failed which finding the User",
										error: err
									});
								});
						} else {
							res.status(200).json({ message: "Role does not exist" });
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							message: "Failed when trying to find Role",
							error: err
						});
					});
			}
		}else {
			res.status(200).json({ message: "Email, pwd and role are mandatory" });
		}
	}else if(username==="MOBILE"){
		if(req.body.mobNumber && req.body.pwd && req.body.role) {
			var mobNumber = req.body.mobNumber;
			var role_lower = (req.body.role).toLowerCase();
			if (role_lower && mobNumber) {
				Role.findOne({ role: role_lower })
					.exec()
					.then(role => {
						if (role) {
							User.find({ "username": mobNumber })
								.exec()
								.then(user => {
									if (user.length > 0) {
										return res.status(200).json({
											message: 'Mobile number already exists.'
										});
									} else {
										bcrypt.hash(req.body.pwd, 10, (err, hash) => {
											if (err) {
												return res.status(500).json({
													message: "Failed to match the password",
													error: err
												});
											} else {
												const user = new User({
													_id: new mongoose.Types.ObjectId(),
													createdAt: new Date,
													services: {
														password: {
															bcrypt: hash

														},
													},
													username: req.body.mobNumber,
													authService : req.body.authService,
													department: req.body.department,
													designation: req.body.designation,
													orgLevel : req.body.orgLevel,
													profile:
													{
														employeeID : nextEmployeeID,
														firstname: req.body.firstname,
														lastname: req.body.lastname,
														fullName: req.body.firstname + ' ' + req.body.lastname,
														email: req.body.email,
														mobile: mobNumber,
														companyID: req.body.companyID,
														pincode: req.body.pincode,
														companyName: req.body.companyName,
														createdAt: new Date(),
														status: req.body.status ? req.body.status : "Block",
														createdBy: req.body.createdBy,
													},
													roles: [role_lower]
												});
												if (!req.body.firstname) {
													user.profile.fullName = req.body.fullName;
												}
												user.save()
												.then(async(result) => {
													if(result) {
														if(!user.roles.includes("admin")){
															//send Notification, email, sms to customer
															var userNotificationValues = {
																"event"			: "Signup",
																"toUser_id"		: result._id,
																"toUserRole"	: role_lower,								
																"variables" 	: {
																					"userRole" 			: role_lower.replace(/([a-z])([A-Z][a-z])/g, "$1 $2").charAt(0).toUpperCase(),
																					"firstName" 		: result.profile.firstName,
																					"lastName" 			: result.profile.lastName,
																					"fullName" 			: result.profile.fullName,
																					"emailId" 			: result.profile.email,
																					"mobileNumber"		: result.profile.mobile,
																					"loginID" 			: result.username,
																					"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a')
																}
															}
															// console.log("userNotificationValues => ",userNotificationValues);
															var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);
															// console.log("send_notification_to_user => ",send_notification_to_user)
															
															//send Notification, email, sms to admin
															var adminNotificationValues = {
																"event"			: "SignUp",
																// "toUser_id"		: req.body.user_ID,
																"toUserRole"	: "admin",								
																"variables" 	: {
																					"firstName" 		: result.profile.firstName,
																					"lastName" 			: result.profile.lastName,
																					"fullName" 			: result.profile.fullName,
																					"emailId" 			: result.profile.email,
																					"mobileNumber"		: result.profile.mobile,
																					"loginID" 			: result.username,
																					"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a')
																}
															}
															// console.log("adminNotificationValues => ",adminNotificationValues);
															var send_notification_to_admin = await sendNotification.send_notification_function(adminNotificationValues);
															// console.log("send_notification_to_admin => ",send_notification_to_admin)
														}
														res.status(200).json({ message: "USER_CREATED", ID: result._id })
													}else {
														res.status(200).json({ message: "USER_NOT_CREATED" })
													}
												})
												.catch(err => {
													console.log(err);
													res.status(500).json({
														message: "Failed to save User Details",
														error: err
													});
												});
											}
										});
									}
								})
								.catch(err => {
									console.log(err);
									res.status(500).json({
										message: "Failed which finding the User",
										error: err
									});
								});
						} else {
							res.status(200).json({ message: "Role does not exists" });
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							message: "Failed when trying to find Role",
							error: err
						});
					});
			}
		} else {
			res.status(200).json({ message: "Email, pwd and role are mandatory" });
		}
	}
	}	
};

function getNextEmployeeID() {
    return new Promise((resolve,reject)=>{
    User.findOne()    
        .sort({"profile.employeeID" : -1})   
        .exec()
        .then(data=>{
        	// console.log("data => ",data)
            if (data && data !== null) { 
            	if(data.profile.employeeID && data.profile.employeeID !== undefined){
	                var seq = data.profile.employeeID;
	                // console.log("seq 1 => ",seq)
	                seq = seq+1;
	                // console.log("seq 2 => ",seq)
	                resolve(seq) 
	            }else{
	            	resolve(1)
	            }
            }else{
               resolve(1)
            }
            
        })
        .catch(err =>{
            reject(0)
        });
    });
}


exports.user_signup_user_otp = (req, res, next) => {
	// console.log("user_signup_user_otp => ",req.body);

	var username = "EMAIL";
	if(req.body.username){
		if(req.body.username === "EMAIL"){
			username = "EMAIL";
		}else if(req.body.username === "MOBILE"){
			username = "MOBILE";
		}
	}
	if(username==="EMAIL"){
		if(req.body.email && req.body.pwd && req.body.role) {
			var emailId = req.body.email;
			var userRole = (req.body.role).toLowerCase();
			if (userRole && emailId) {
				Role.findOne({ role: userRole })
					.exec()
					.then(role => {
						if (role) {
							User.find({ "username": emailId.toLowerCase(), 
											$or : [
												{authService: { $exists: false }},
												{authService: ""}
											]
								})
								.then(async(user) => {
									console.log("signup user => ",user);
									
									if (user.length > 0) {
										 // console.log("user found => ",user);
										return res.status(200).json({
											message: 'This email is already used!'
										});
									} else {
										var getSameMobileUsers = [];
										if (req.body.mobNumber) {
											getSameMobileUsers = await User.find({ "profile.mobile": req.body.mobNumber});
											 // console.log("getSameMobileUsers => ",getSameMobileUsers)
										}
										if (getSameMobileUsers.length > 0) {
											return res.status(200).json({
												message 	: 'This mobile number is already used!'
											});
										} else {
											bcrypt.hash(req.body.pwd, 10, (err, hash) => {
												if (err) {
													return res.status(500).json({
														message: "Some error occured during password encryption.",
														error: err
													});
												} else {
													var emailOTP = getRandomInt(1000, 9999);
													
													 // console.log("emailOTP => ", emailOTP);

													if (emailOTP) {
														const user = new User({
															_id: new mongoose.Types.ObjectId(),
															createdAt: new Date,
															services: {
																password: {
																	bcrypt: hash
																},
															},
															username: emailId.toLowerCase(),
															authService : req.body.authService,
															profile:
															{
																firstname: req.body.firstname,
																lastname: req.body.lastname,
																fullName: req.body.firstname + ' ' + req.body.lastname,
																email: emailId.toLowerCase(),
																companyID: req.body.companyID,
																pincode: req.body.pincode,
																companyName: req.body.companyName,
																mobile: req.body.mobNumber,
																createdAt: new Date(),
																otpEmail: emailOTP,
																countryCode : req.body.countryCode,
																isdCode : req.body.isdCode,
																status: req.body.status ? req.body.status : "unverified",
																createdBy: req.body.createdBy,
															},
															joinAsConsultant : req.body.joinAsConsultant,
															roles: [userRole]
														});
														if (!req.body.firstname) {
															user.profile.fullName = req.body.fullName;
														}
														user.save()
															.then(async(result) => {
																// console.log("emailOTP result => ", result);
																if (result && result !== null) {
																		//send Notification, email, sms to customer																	
																		var userNotificationValues =  {
																								"userType" 			: userRole.replace(/([a-z])([A-Z][a-z])/g, "$1 $2").charAt(0).toUpperCase(),
																								"firstName" 		: result.profile.firstname,
																								"lastName" 			: result.profile.lastname,
																								"fullName" 			: result.profile.fullName,
																								"email_id" 			: result.profile.email,
																								"mobileNumber"		: result.profile.mobile,
																								"loginID" 			: result.username,
																								"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
																								"signupOTP" 		: result.profile.otpEmail,
																								"login_page_link"   : "https://admin2.0.com"
																			}
																		var send_notification_to_user = await sendNotification(result.profile.email,"OTP for SignUp",userRole,userNotificationValues);
																		// console.log("send_notification_to_user => ",send_notification_to_user)
																		
																		//send Notification, email, sms to admin
																		// var adminNotificationValues = {
																		// 	"event"			: "SignUp_OTP",
																		// 	// "toUser_id"		: req.body.user_ID,
																		// 	"toUserRole"	: "admin",								
																		// 	"variables" 	: {
																		// 						"userType" 			: userRole.replace(/([a-z])([A-Z][a-z])/g, "$1 $2").charAt(0).toUpperCase(),
																		// 						"firstName" 		: result.profile.firstName,
																		// 						"lastName" 			: result.profile.lastName,
																		// 						"fullName" 			: result.profile.fullName,
																		// 						"emailId" 			: result.profile.email,
																		// 						"mobileNumber"		: result.profile.mobile,
																		// 						"loginID" 			: result.username,
																		// 						"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a')
																		// 	}
																		// }
																		// // console.log("adminNotificationValues 3 => ",adminNotificationValues);
																		// var send_notification_to_admin = await sendNotification.send_notification_function(adminNotificationValues);
																		
																		res.status(200).json({ message: "USER_CREATED", ID: result._id,result })
																	// })
																	// .catch(err => {
																	// 	console.log(err);
																	// 	res.status(500).json({
																	// 		message: "Failed to Send Email",
																	// 		error: err
																	// 	});
																	// });
																}else {
																	res.status(200).json({ message: "USER_NOT_CREATED" })
																}
															})
															.catch(err => {
																console.log(err);
																res.status(500).json({
																	message: "Failed to save User Details",
																	error: err
																});
															});
													}
												}
											});
										}
									}
								})
								.catch(err => {
									console.log(err);
									res.status(500).json({
										message: "Failed which finding the User",
										error: err
									});
								});
						} else {
							res.status(200).json({ message: "Role does not exists" });
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							message: "Failed when trying to find Role",
							error: err
						});
					});
			}
		} else {
			res.status(200).json({ message: "Email is mandatory!" });
		}
	}else if(username==="MOBILE"){
		if(req.body.mobNumber && req.body.pwd && req.body.role) {
			var mobNumber = req.body.mobNumber;
			var userRole = (req.body.role).toLowerCase();
			// console.log("userRole 1 => ",userRole);
			if (userRole && mobNumber) {
				Role.findOne({ role: userRole })
					.exec()
					.then(role => {
						if (role) {
							// User.find({ "username": mobNumber })
							User.find({ "username": mobNumber, 
											$or : [
												{authService: { $exists: false }},
												{authService: ""}
											]
								})
								.then(async(user) => {
									if (user.length > 0) {
										return res.status(200).json({
											message: 'This mobile number already used.'
										});
									} else {
										var getSameEmailUsers = [];
										if (req.body.email) {
											getSameEmailUsers = await User.find({ "profile.email": req.body.email, 
																					$or : [
																						{authService: { $exists: false }},
																						{authService: ""}
																					]
																				});
											 // console.log("getSameEmailUsers => ",getSameEmailUsers)
										}
										if (getSameEmailUsers.length > 0) {
											return res.status(200).json({
												message 	: 'This email already used.'
											});
										} else {
											bcrypt.hash(req.body.pwd, 10, (err, hash) => {
												if (err) {
													return res.status(500).json({
														message: "Failed to match the password",
														error: err
													});
												} else {
													// var mobileOTP = getRandomInt(1000, 9999);
													var mobileOTP = 1234;
													if (mobileOTP) {
														const user = new User({
															_id: new mongoose.Types.ObjectId(),
															createdAt: new Date,
															services: {
																password: {
																	bcrypt: hash

																},
															},
															username: req.body.mobNumber,
															authService : req.body.authService,
															profile:
															{
																firstname: req.body.firstname,
																lastname: req.body.lastname,
																fullName: req.body.firstname + ' ' + req.body.lastname,
																email: req.body.email,
																mobile: req.body.mobNumber,
																companyID: req.body.companyID,
																pincode: req.body.pincode,
																companyName: req.body.companyName,
																countryCode : req.body.countryCode,
																isdCode : req.body.isdCode,
																createdAt: new Date(),
																otpMobile: mobileOTP,
																status: req.body.status ? req.body.status : "Inactive",
																createdBy: req.body.createdBy,
															},
															roles: [userRole]
														});
														if (!req.body.firstname) {
															user.profile.fullName = req.body.fullName;
														}
														user.save()
															.then(async(result) => {
																if(result) {
																	//send Notification, email, sms to customer	
																	// console.log("userRole2  => ",userRole);																
																	var userNotificationValues = {
																		"event"			: "SignUp",
																		"toUser_id"		: result._id,
																		"toUserRole"	: userRole,								
																		"variables" 	: {
																							"userType" 			: userRole,
																							"firstName" 		: result.profile.firstname,
																							"lastName" 			: result.profile.lastname,
																							"fullName" 			: result.profile.fullName,
																							"emailId" 			: result.profile.email,
																							"mobileNumber"		: result.profile.mobile,
																							"loginID" 			: result.username,
																							"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
																							"OTP" 				: result.profile.otpMobile
																		}
																	}
																// console.log("userNotificationValues 4 => ",userNotificationValues);
																	var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);
																	// console.log("send_notification_to_user => ",send_notification_to_user)
																	
																	//send Notification, email, sms to admin
																	var adminNotificationValues = {
																		"event"			: "SignUp",
																		// "toUser_id"		: req.body.user_ID,
																		"toUserRole"	: "admin",								
																		"variables" 	: {
																							"userType" 			: userRole,
																							"firstName" 		: result.profile.firstname,
																							"lastName" 			: result.profile.lastname,
																							"fullName" 			: result.profile.fullName,
																							"emailId" 			: result.profile.email,
																							"mobileNumber"		: result.profile.mobile,
																							"loginID" 			: result.username,
																							"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a')
																		}
																	}
																// console.log("adminNotificationValues 4 => ",adminNotificationValues);
																	var send_notification_to_admin = await sendNotification.send_notification_function(adminNotificationValues);

																	res.status(200).json({ message: "USER_CREATED", ID: result._id, result:result })
																}else {
																	res.status(200).json({ message: "USER_NOT_CREATED" })
																}
															})
															.catch(err => {
																console.log(err);
																res.status(500).json({
																	message: "Failed to save User Details",
																	error: err
																});
															});
													}
												}
											});
										}
									}
								})
								.catch(err => {
									console.log(err);
									res.status(500).json({
										message: "Failed which finding the User",
										error: err
									});
								});
						} else {
							res.status(200).json({ message: "Role does not exists" });
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							message: "Failed when trying to find Role",
							error: err
						});
					});
			}
		} else {
			res.status(200).json({ message: "Mobile Number is mandatory!" });
		}
	}		
};


exports.user_signup_verify_email_otp = (req, res, next) => {
	// console.log("user_signup_user_otp => ",req.body);

	if(req.body.email) {
		var emailId = req.body.email;
		if(emailId){
			User.findOne({ "username": emailId.toLowerCase(), 
							$or : [
								{authService: { $exists: false }},
								{authService: ""}
							]
				})
				.then(async(result) => {
					var emailOTP = result.profile.otpEmail;
					if (emailOTP) {
						if (result && result !== null) {
							console.log("verify_email result.profile.status => ",result.profile.status);

							if(result.profile.status === 'unverified'){
								//send Notification, email, sms to customer
								var userNotificationValues =  {
									"userType" 			: result.roles[0],
									"firstName" 		: result.profile.firstname,
									"lastName" 			: result.profile.lastname,
									"fullName" 			: result.profile.fullName,
									"email_id" 			: result.profile.email,
									"mobileNumber"		: result.profile.mobile,
									"loginID" 			: result.username,
									"signupDate" 		: moment(result.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
									"signupOTP" 		: result.profile.otpEmail,
									"login_page_link" : "https://admin2.0.com"
								}
								var send_notification_to_user = await sendNotification(result.profile.email,"OTP for SignUp",result.roles[0],userNotificationValues);
								res.status(200).json({ success:true, message: "OTP sent to your registered email address", ID: result._id, result:result });
							}else{
								res.status(200).json({ success:false,  message: "This email address was verified at the time of signup", ID: result._id, result:result });
							}
						}else {
							res.status(200).json({ success:false,  message: "User Not Found" })
						}
					}
				})
				.catch(err => {
					console.log(err);
					res.status(500).json({
						message: "Failed which finding the User",
						error: err,
						success:false, 
					});
				});
		}
	} else {
		res.status(500).json({ success:false,  message: "Email is mandatory!" });
	}
};


exports.check_userID_EmailOTP = (req, res, next) => {
	// console.log("req params",req.params)
	User.find({ _id: ObjectID(req.params.ID), "profile.otpEmail": req.params.emailotp })
		.exec()
		.then(data => {
			// console.log("data",data);
			if (data.length > 0) {
				User.updateOne(
					{ _id: ObjectID(req.params.ID) },
					{
						$set: {
							"profile.otpEmail": 0,
							"profile.status": "active"
						}
					}
				)
					.exec()
					.then(data => {
						if (data.nModified === 1) {
							res.status(200).json({ message: "SUCCESS", userID: data._id });
						} else {
							res.status(200).json({ message: "SUCCESS_OTP_NOT_RESET" });
						}
					})
					.catch(err => {
						console.log('user error ', err);
						res.status(500).json({
							message: "Failed to update Email OTP",
							error: err
						});
					})
			} else {
				res.status(200).json({ message: "FAILED" });
			}
		})
		.catch(err => {
			console.log('user error ', err);
			res.status(500).json({
				message: "Failed to find the User",
				error: err
			});
		});
};

exports.check_userID_MobileOTP = (req, res, next) => {
	User.findOne({ _id: ObjectID(req.params.ID), "profile.otpMobile": req.params.mobileotp })
		.exec()
		.then(user => {
			if (user) {
				User.updateOne(
					{ _id: ObjectID(req.params.ID) },
					{
						$set: {
							"profile.otpMobile": 0,
							"profile.status": "active"
						}
					}
				)
					.exec()
					.then(data => {
						if (data.nModified === 1) {
								const token = jwt.sign({
									mobile: user.profile.mobile,
									userId: user._id,
								}, globalVariable.JWT_KEY,
									{
										expiresIn: globalVariable.timeOutLimitSecs
									}
								);

							User.updateOne(
								{ "_id": ObjectID(user._id)},
								{
									$push: {
										"services.resume.loginTokens": {
											whenLogin: new Date(),
											loginTimeStamp: new Date(),
											hashedToken: token,
											logoutTimeStamp : ""
										}
									}
								}
							)
								.exec()
								.then(updateUser => {
									if(updateUser.nModified == 1) {
										res.status(200).json({
											message: 'Login Auth Successful',
											token: token,
											roles: user.roles,
											ID: user._id,
											loginTokens: (user.services.resume.loginTokens).slice(-1)[0],
											companyID: user.profile.companyID,
											authService:user.authService,
											userDetails: {
												firstName: user.profile.firstname,
												lastName: user.profile.lastname,
												email: user.profile.email,
												countryCode : user.profile.countryCode,
												phone: user.profile.phone,
												city: user.profile.city,
												deliveryAddress: user.deliveryAddress,
												pincode: user.profile.pincode,
												companyID: user.profile.companyID,
												company_id: user.profile.company_id,
												companyName: user.profile.companyName,
												locationID: user.profile.locationID,
												user_id: user._id,
												roles: user.roles,
												token: token,
											}
										});
									}
								})

								.catch(err => {
									console.log("500 err ", err);
									res.status(500).json({
										message: "Failed to save token",
										error: err
									});
								});
						} else {
							res.status(200).json({ message: "SUCCESS_OTP_NOT_RESET" });
						}
					})
					.catch(err => {
						console.log('user error ', err);
						res.status(500).json({
							message: "Failed to update Mobile OTP",
							error: err
						});
					})
			} else {
				res.status(200).json({ message: "FAILED" });
			}
		})
		.catch(err => {
			console.log('user error ', err);
			res.status(500).json({
				message: "Failed to find the User",
				error: err
			});
		});
};

exports.check_username_EmailOTP = (req, res, next) => {
	// console.log("req.parmas", req.params);
	User.find({ username: req.params.username, "profile.otpEmail": req.params.emailotp })
		.exec()
		.then(data => {
			if (data.length > 0) {
				User.updateOne(
					{
						username: req.params.username
					},
					{
						$set: {
							"profile.otpEmail": 0,
							"profile.status": "active"
						}
					}
				)
				.exec()
				.then(data => {
					if (data.nModified === 1) {
						res.status(200).json({ message: "SUCCESS" });
					} else {
						res.status(200).json({ message: "SUCCESS_OTP_NOT_RESET" });
					}
				})
				.catch(err => {
					console.log('user error ', err);
					res.status(500).json({
						message: "Failed to update Email OTP",
						error: err
					});
				})
			} else {
				res.status(200).json({ message: "FAILED" });
			}
		})
		.catch(err => {
			console.log('user error ', err);
			res.status(500).json({
				message: "Failed to find the User",
				error: err
			});
		});
};

/**=========== User Login ===========*/
exports.user_login_using_email = (req, res, next) => {
	// console.log("user_login_using_email req.body = ",req.body);
	
	var emailId = (req.body.email).toLowerCase(); 
	var role  	= (req.body.role).toLowerCase();
	// console.log("emailId => ", emailId);
	// console.log("role => ", role);
	User.findOne({
		"username" 	: emailId,
		"roles" 		: role,
	})
	.exec()
	.then(user => {
		// console.log("user_login_using_email user ==>",user)
		if (user) {
			if ((user.profile.status).toLowerCase() === "active") {
				var pwd = user.services.password.bcrypt;

				if (pwd) {
					bcrypt.compare(req.body.password, pwd, (err, result) => {
						if (err) {
							return res.status(200).json({
								message: 'Auth failed'
							});
						}
						if (result) {
							const token = jwt.sign({
								email 	: req.body.email,
								userId 	: user._id,
							}, globalVariable.JWT_KEY,
								{
									// expiresIn: "365d"
									expiresIn: globalVariable.timeOutLimitSecs
								}
							);

							User.updateOne(
								{ "username": emailId.toLowerCase() },
								{
									$push: {
										"services.resume.loginTokens": {
											whenLogin 		: new Date(),
											loginTimeStamp 	: new Date(),
											hashedToken 	: token,
											logoutTimeStamp : ""
										}
									}
								}
							)
							.then(updateUser => {
								// console.log("updateUser ==>",updateUser)
								if (updateUser.nModified === 1) {
									res.status(200).json({
										message 		: 'Login Auth Successful',
										token 			: token,
										roles 			: user.roles,
										loginTokens 	: (user.services.resume.loginTokens).slice(-1)[0],
										companyID 		: user.profile.companyID,
										company_id 		: user.profile.company_id,
										userDetails 	: {
															firstName 		: user.profile.firstname,
															lastName 		: user.profile.lastname,
															email 			: user.profile.email,
															countryCode 	: user.profile.countryCode,
															phone 			: user.profile.phone,
															city 			: user.profile.city,
															deliveryAddress : user.deliveryAddress,
															pincode 		: user.profile.pincode,
															companyID 		: user.profile.companyID,
															company_id 		: user.profile.company_id,
															companyName 	: user.profile.companyName,
															locationID 		: user.profile.locationID,
															user_id 		: user._id,
															roles 			: user.roles,
															token 			: token,
										}
									});
								} else {
									return res.status(200).json({
										message : 'Auth failed'
									});
								}
							})
							.catch(err => {
								console.log("Error while Login => ", err);
								res.status(500).json({
									message 	: "Failed to save token",
									error 		: err
								});
							});
						} else {
							return res.status(200).json({
								message : 'INVALID_PASSWORD'
							});
						}
					})
				} else {
					res.status(200).json({ 
						message : "INVALID_PASSWORD" 
					});
				}
			} else if ((user.profile.status).toLowerCase() == "blocked") {
				res.status(200).json({ 
					message : "USER_BLOCK" 
				});
			} else if ((user.profile.status).toLowerCase() == "unverified") {

				var emailOTP = getRandomInt(1000, 9999);
				// console.log("emailOTP ===>",emailOTP);
				User.updateOne(
					{ "username" : emailId.toLowerCase() },
					{$set: {
							"profile.otpEmail" : emailOTP,
						}
					}
				)
				.exec()
				.then(data => {
					// console.log("emailOTP  data===>",data);
					if (data.nModified === 1) {
						User.find({ "profile.email": emailId.toLowerCase() })
						.exec()
						.then(usersdata => {
							// console.log("emailOTP  data===>",usersdata[0].profile);
							res.status(200).json({
								message 	: 'USER_UNVERIFIED',
								userDetails : {
												firstName 	: usersdata[0].profile.fullName,
												email 		: usersdata[0].profile.email,
												otpEmail 	: usersdata[0].profile.otpEmail,
												phone 		: usersdata[0].profile.phone,
												user_id 	: usersdata[0]._id,
												roles 		: usersdata[0].roles,
								}
							});
						});
					} else {
						res.status(200).json({ message: "SUCCESS_OTP_NOT_RESET" });
					}
				})
				.catch(err => {
					console.log('Error while updating OTP => ', err);
					res.status(500).json({
						message : "Failed to update Email OTP",
						error 	: err
					});
				})				
			}
		} else {
			res.status(200).json({ 
				message : "NOT_REGISTER" 
			});
		}
	})
	.catch(err => {
		console.log("Error whole finding user => ",err);
		res.status(500).json({
			message : "Failed to find the User",
			error 	: err
		});
	});
};

/**============ Reset Password ===========*/
exports.resetPassword = (req, res, next) => {
	// console.log("req body => ",req.body)
	User.findOne({ _id: req.body.user_id })
	.then(user => {
		if (user) {				
			var previousPassword = user.services.password.bcrypt;
			// console.log("previousPassword => ",previousPassword);
			if (previousPassword) {
				// console.log(" Condition => ",(bcrypt.compare(req.body.currentPassword, previousPassword)))
				bcrypt.compare(req.body.currentPassword, previousPassword, (error, result) => {
					// console.log("error => ",error)
					// console.log("result => ",result)
					if (error) {
						return res.status(200).json({
							message 	: 'You entered wrong current password',
							messageCode : false
						});
					}
					if (result) {
						bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
							User.updateOne(
								{ _id: req.body.user_id },
								{
									$set: {
										services: {
											password: {
												bcrypt: hash
											},
										},
									}
								}
							)
							.then(data => {
								// console.log("data => ",data)
								if (data.nModified === 1) {
									res.status(200).json({
										message 	: "Password reset successfully",
										messageCode : true
									});
								} else {
									res.status(200).json({
										message 	: "Failed to reset Password",
										messageCode : false
									});
								}
							})
							.catch(err => {
								console.log("Error while updating password => ",err);
								res.status(500).json({
									error 		: err,
									message 	: "Error while updating password",
									messageCode : false
								});
							});
						});
					}else{
						// console.log("You entered wrong current password")
						return res.status(200).json({
							message 	: 'You entered wrong current password',
							messageCode : false
						});
					}
				})
			}else{
				// console.log("Something went wrong")
				res.status(200).json({
					message 	: "Something went wrong",
					messageCode : false
				});
			}
		} else {
			res.status(200).json({
				message 	: "User Not Found",
				messageCode : false
			});
		}
	})
	.catch(err => {
		console.log('Error while finding user ',err);
		res.status(500).json({
			error 		: err,
			message 	: "Error while finding user",
			messageCode : false
		});
	});
};

exports.user_login_using_mobile = (req, res, next) => {
	var mobNumber = req.body.mobNumber;
	var role = (req.body.role).toLowerCase();
	// console.log('mobNumber & role', mobNumber,role);
	User.findOne({
		"profile.mobile": mobNumber,
		"roles" 		: role,
	})
	.exec()
	.then(user => {
		if (user) {
			// console.log('user role', user);
			if ((user.profile.status).toLowerCase() == "active") {
				var pwd = user.services.password.bcrypt;
				
				if (pwd) {
					bcrypt.compare(req.body.password, pwd, (err, result) => {
						if (err) {
							return res.status(200).json({
								message: 'Auth failed'
							});
						}
						if (result) {
							const token = jwt.sign({
								mobile: req.body.mobNumber,
								userId: user._id,
							}, globalVariable.JWT_KEY,
								{
									expiresIn: "365d"
								}
							);

							User.updateOne(
								{ "profile.mobile": mobNumber },
								{
									$push: {
										"services.resume.loginTokens": {
											whenLogin: new Date(),
											hashedToken: token
										}
									}
								}
							)
								.exec()
								.then(updateUser => {
									if (updateUser.nModified == 1) {
										res.status(200).json({
											message: 'Login Auth Successful',
											token: token,
											roles: user.roles,
											ID: user._id,
											companyID: user.profile.companyID,
											userDetails: {
												firstName: user.profile.firstname,
												lastName: user.profile.lastname,
												email: user.profile.email,
												phone: user.profile.phone,
												city: user.profile.city,
												deliveryAddress: user.deliveryAddress,
												pincode: user.profile.pincode,
												companyID: user.profile.companyID,
												locationID: user.profile.locationID,
												user_id: user._id,
												roles: user.roles,
												token: token,
											}
										});
									} else {
										return res.status(200).json({
											message: 'Auth failed'
										});
									}
								})

								.catch(err => {
									console.log("500 err ", err);
									res.status(500).json({
										message: "Failed to save token",
										error: err
									});
								});
						} else {
							return res.status(200).json({
								message: 'INVALID_PASSWORD'
							});
						}
					})
				} else {
					res.status(200).json({ message: "INVALID_PASSWORD" });
				}
			} else if ((user.profile.status).toLowerCase() == "blocked") {
				res.status(200).json({ message: "USER_BLOCK" });
			} else if ((user.profile.status).toLowerCase() == "unverified") {
				res.status(200).json({ message: "USER_UNVERIFIED" });
			}
		} else {
			res.status(200).json({ message: "NOT_REGISTER" });
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			message: "Failed to find the User",
			error: err
		});
	});
};

exports.user_login_using_mobile_email = (req, res, next) => {
	var mobNumber = req.body.mobNumber;
	var role = (req.body.role).toLowerCase();
	User.findOne({
		"profile.mobile": mobNumber,
		"roles": role,
	})

	.exec()
	.then(user => {
		if (user) {
			if ((user.profile.status).toLowerCase() == "active") {
				var pwd = user.services.password.bcrypt;
				// console.log('pwd', pwd);
				if (pwd) {
					bcrypt.compare(req.body.password, pwd, (err, result) => {
						if (err) {
							return res.status(200).json({
								message: 'Auth failed'
							});
						}
						if (result) {
							const token = jwt.sign({
								mobile: req.body.mobNumber,
								userId: user._id,
							}, globalVariable.JWT_KEY,
								{
									expiresIn: "365d"
								}
							);

							User.updateOne(
								{ "username": mobNumber },
								{
									$push: {
										"services.resume.loginTokens": {
											whenLogin: new Date(),
											hashedToken: token
										}
									}
								}
							)
								.exec()
								.then(updateUser => {

									if (updateUser.nModified == 1) {
										res.status(200).json({
											message: 'Login Auth Successful',
											token: token,
											roles: user.roles,
											ID: user._id,
											companyID: user.profile.companyID,
											userDetails: {
												firstName: user.profile.firstname,
												lastName: user.profile.lastname,
												email: user.profile.email,
												phone: user.profile.phone,
												pincode: user.profile.pincode,
												city: user.profile.city,
												companyID: user.profile.companyID,
												locationID: user.profile.locationID,
												user_id: user._id,
												roles: user.roles,
												token: token,
											}
										});
									} else {
										return res.status(200).json({
											message: 'Auth failed'
										});
									}
								})

								.catch(err => {
									console.log("500 err ", err);
									res.status(500).json({
										message: "Failed to save token",
										error: err
									});
								});
						} else {
							return res.status(200).json({
								message: 'INVALID_PASSWORD'
							});
						}
					})
				} else {
					res.status(200).json({ message: "INVALID_PASSWORD" });
				}
			} else if ((user.profile.status).toLowerCase() == "blocked") {
				res.status(200).json({ message: "USER_BLOCK" });
			} else if ((user.profile.status).toLowerCase() == "unverified") {
				res.status(200).json({ message: "USER_UNVERIFIED" });
			}
		} else {
			res.status(200).json({ message: "NOT_REGISTER" });
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			message: "Failed to find the User",
			error: err
		});
	});
};

exports.user_login_with_companyID = (req, res, next) => {
	var emailId = (req.body.email).toLowerCase();
	var role = (req.body.role).toLowerCase();
	User.findOne({
		"username": emailId,
		"roles": role,
	})
		.exec()
		.then(user => {
			if (user) {
				var loginTokenscount = user.services.resume.loginTokens.length;
				if (user.profile.companyID != "") {
					if ((user.profile.status).toLowerCase() == "active") {
						var pwd = user.services.password.bcrypt;
						if (pwd) {
							bcrypt.compare(req.body.password, pwd, (err, result) => {
								if (err) {
									return res.status(200).json({
										message: 'Auth failed'
									});
								}
								if (result) {
									const token = jwt.sign({
										email 	: req.body.email,
										userId 	: user._id,
									}, globalVariable.JWT_KEY,
										{
											expiresIn: "365d"
										}
									);
									User.updateOne(
										{ "username": emailId.toLowerCase() },
										{
											$push: {
												"services.resume.loginTokens": {
													whenLogin: new Date(),
													loginTimeStamp: new Date(),
													hashedToken: token,
													logoutTimeStamp : ""
												}
											}
										}
									)
										.exec()
										.then(updateUser => {
											if (updateUser.nModified == 1) {
												res.status(200).json({
													message: 'Login Auth Successful',
													token: token,
													roles: user.roles,
													ID: user._id,
													companyID: user.profile.companyID,
													loginTime: user.services.resume.loginTokens[loginTokenscount-1].logoutTimeStamp,
													logoutTime: user.services.resume.loginTokens[loginTokenscount-1].logoutTimeStamp,
													userDetails: {
														firstName: user.profile.firstname,
														lastName: user.profile.lastname,
														email: user.profile.email,
														phone: user.profile.phone,
														city: user.profile.city,
														companyID: user.profile.companyID,
														locationID: user.profile.locationID,
														user_id: user._id,
														roles: user.roles,
														token: token,
														loginTime: user.services.resume.loginTokens[loginTokenscount-1].logoutTimeStamp,
														logoutTime: user.services.resume.loginTokens[loginTokenscount-1].logoutTimeStamp,
													}
												});
											} else {
												return res.status(200).json({
													message: 'Auth failed'
												});
											}
										})
										.catch(err => {
											console.log("500 err ", err);
											res.status(500).json({
												message: "Failed to save token",
												error: err
											});
										});
								} else {
									return res.status(200).json({
										message: 'INVALID_PASSWORD'
									});
								}
							})
						} else {
							res.status(200).json({ message: "INVALID_PASSWORD" });
						}
					} else if ((user.profile.status).toLowerCase() == "blocked") {
						// console.log("user.USER_BLOCK IN ==>")
						res.status(200).json({ message: "USER_BLOCK" });
					} else if ((user.profile.status).toLowerCase() == "unverified") {
						res.status(200).json({ message: "USER_UNVERIFIED" });
					}
				} else if (user.profile.companyID == "") {
					res.status(200).json({ message: "NO_COMPANYID" });
				}
			} else {
				res.status(200).json({ message: "NOT_REGISTER" });
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				message: "Failed to find the User",
				error: err
			});
		});
};

exports.logouthistoryOrig = (req, res, next) => {
	console.log("logouthistory req.body => ", req.body);
	var selector = {
						"_id": ObjectID(req.body.user_id),
						"services.resume.loginTokens.hashedToken":req.body.token
					};

	var updator = 	{
						$set: {
							"services.resume.loginTokens.$.hashedToken": "",
							"services.resume.loginTokens.$.logoutTimeStamp": new Date(),
						}
					};				


	User.updateOne(selector, updator)
		.then(data => {
			console.log("logout data => ", data);
			res.status(200).json({data})
		})
		.catch(err => {
			res.status(500).json({
				message: "Failed to update User",
				error: err
			});
		});
};


exports.logouthistory = (req, res, next) => {
	// console.log("logouthistory req.body => ", req.body);

	User.findOne({"_id": ObjectID(req.body.user_id)})
		.then(data => {
			var loginTokens 					= data.services.resume.loginTokens;
			var loginTokensLastElem				= loginTokens[data.services.resume.loginTokens.length - 1];
			loginTokensLastElem.hashedToken 	= "";
			loginTokensLastElem.logoutTimeStamp = new Date();
		
			var selector = { "_id": ObjectID(req.body.user_id) };
			var updator = 	{ $set: { "services.resume.loginTokens" : loginTokens } };

			// console.log("logouthistory loginTokens => ", loginTokens);

			User.updateOne(selector, updator)
				.then(data => {
					res.status(200).json({data})
				})
				.catch(err => {
					res.status(500).json({
						message: "Failed to update User",
						error: err						
					});
				});
		})
		.catch(err => {
			res.status(500).json({
				message: "Failed to update User",
				error: err
			});
		});
				

};


exports.user_update_password_withoutotp_username = (req, res, next) => {
	// console.log()
	User.findOne({ username: req.params.username })
	.exec()
	.then(user => {
		// console.log("user ", user);
		if (user) {
			bcrypt.hash(req.body.pwd, 10, (err, hash) => {
				User.updateOne(
					{ username: req.params.username },
					{
						$set: {
							services: {
								password: {
									bcrypt: hash
								},
							},
						}
					}
				)
				.exec()
				.then(data => {
					if (data.nModified == 1) {
						res.status(200).json("PASSWORD_RESET");
					} else {
						res.status(401).json("PASSWORD_NOT_RESET");
					}
				})
				.catch(err => {
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			});
		} else {
			res.status(404).json("User Not Found");
		}
	})
	.catch(err => {
		// console.log('update user status error ',err);
		res.status(500).json({
			error: err
		});
	});
};

exports.user_update_password_with_emailOTP_ID = (req, res, next) => {
	User.findOne({
		"_id" 				: req.params.ID,
		"profile.otpEmail" 	: req.body.emailOTP
	})
		.exec()
		.then(user => {
			if (user) {
				bcrypt.hash(req.body.pwd, 10, (err, hash) => {
					User.updateOne(
						{ _id: req.params.ID },
						{
							$set: {
								services: {
									password: {
										bcrypt: hash
									},
								},
							}
						}
					)
					.exec()
					.then(data => {
						if (data.nModified == 1) {
							res.status(200).json("PASSWORD_RESET");
						} else {
							res.status(401).json("PASSWORD_NOT_RESET");
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							error: err
						});
					});
				});
			} else {
				res.status(404).json({ message: "User Not Found or Otp Didnt match" });
			}
		})
		.catch(err => {
			// console.log('update user status error ',err);
			res.status(500).json({
				error: err
			});
		});
};

exports.user_update_password_with_mobileOTP_ID = (req, res, next) => {
	User.findOne({
		"_id" : req.params.user_id,
	})
		.exec()
		.then(user => {
			if (user && user !== undefined && user !== null) {
				var currentPassword = user.services.password.bcrypt;
				
				bcrypt.compare(req.body.pwd, currentPassword, (err, result) => {						
					if (result) {
						return res.status(200).json({
							message : 'SAME_AS_CURRENT_PASSWORD'
						});
					}else{
						bcrypt.hash(req.body.pwd, 10, (err, hash) => {
							User.updateOne(
								{ _id: req.params.user_id },
								{
									$set: {
										services: {
											password: {
												bcrypt: hash
											},
										},
									}
								}
							)
							.exec()
							.then(data => {
								if (data.nModified === 1) {
									res.status(200).json("PASSWORD_RESET");
								} else {
									res.status(401).json("PASSWORD_NOT_RESET");
								}
							})
							.catch(err => {
								console.log(err);
								res.status(500).json({
									error: err
								});
							});
						});
					}
				})
			} else {
				res.status(404).json({ message: "User Not Found" });
			}
		})
		.catch(err => {
			// console.log('update user status error ',err);
			res.status(500).json({
				error: err
			});
		});
};

exports.user_update_password_with_emailOTP_username = (req, res, next) => {
	User.findOne({
		"username": req.params.username,
		"profile.otpEmail": req.body.emailOTP
	})
		.exec()
		.then(user => {
			if (user) {
				bcrypt.hash(req.body.pwd, 10, (err, hash) => {
					User.updateOne(
						{ "username": req.params.username },
						{
							$set: {
								services: {
									password: {
										bcrypt: hash
									},
								},
							}
						}
					)
						.exec()
						.then(data => {
							if (data.nModified == 1) {
								res.status(200).json("PASSWORD_RESET");
							} else {
								res.status(401).json("PASSWORD_NOT_RESET");
							}
						})
						.catch(err => {
							console.log(err);
							res.status(500).json({
								error: err
							});
						});
				});
			} else {
				res.status(404).json({ message: "User Not Found or Otp Didnt match" });
			}
		})
		.catch(err => {
			// console.log('update user status error ',err);
			res.status(500).json({
				error: err
			});
		});
};

exports.set_send_emailotp_usingID = (req, res, next) => {
	var otpEmail = getRandomInt(1000, 9999);
	User.updateOne(
		{ _id: req.params.ID },
		{
			$set: {
				"profile.otpEmail": otpEmail,
			},
		}
	)
		.exec()
		.then(data => {
			if (data.nModified === 1) {
				User.findOne({ _id: req.params.ID })
					.then(user => {
						if (user) {
							main();
							async function main(){ 
								var sendMail = await sendEmail(user.profile.email,req.body.emailSubject,req.body.emailContent + " Your OTP is " + otpEmail);
								res.status(200).json({ message: "OTP_UPDATED", ID: user._id })
							 }
						} else {
							res.status(200).json({ message: "User not found" });
						}
					})
					.catch(err => {
						// console.log('user error ', err);
						res.status(500).json({
							message: "Failed to find User",
							error: err
						});
					});
			} else {
				// console.log("data not modified");
				res.status(401).json({ message: "OTP_NOT_UPDATED" })
			}
		})
		.catch(err => {
			// console.log('user error ', err);
			res.status(500).json({
				message: "Failed to update User",
				error: err
			});
		});
};

/**=========== Resend OTP on Signup ===========*/
exports.set_send_mobileotp_usingID = (req, res, next) => {
	// console.log("inside set_send_mobileotp_usingID", req.body);
	User.findOne({ _id: (req.params.user_id)})
	.then(user => {
		if(user){
			// var otpMobile = getRandomInt(1000, 9999);
			var optMobile = 1234;
			User.updateOne(
			{ _id: req.params.user_id},
			{
				$set: {
					"profile.optMobile" : optMobile,
				},
			})
			.exec()
			.then(async(data) => {
				// if (data.nModified === 1) {
					// var otpMobile = getRandomInt(1000, 9999);
					var otpMobile = 1234;
					var userName = user.profile.firstname;
					var userNotificationValues = {
						"event"			: "SendOTP",
						"toUser_id"		: user._id,
						"toUserRole"	: user.roles[0],
						"toMobileNumber": user.isdCode + user.mobile,								
						"variables" 	: {
							userName 			: userName,
							OTPSendForReason 	: "Reset Password",
							OTP 					: otpMobile
						}
					}
					// console.log("userNotificationValues 5 => ",userNotificationValues);
					var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);							
						
					res.status(201).json({ 
						message 	: "OTP sent on your registered mobile id", 
						userID 	: user._id 
					})
				// } else {
				// 	res.status(200).json({ message: "OTP_NOT_UPDATED" })
				// }
			})
			.catch(err => {
				res.status(500).json({
					message 	: "Failed to update mobile OTP",
					error 		: err
				});
			});
		}else{
			res.status(200).json({ message: "User is not registered" })
		}
	})
	.catch(err => {
		res.status(500).json({
			message 	: "Failed to find user",
			error 		: err
		});
	});
};

function sendEmail(toEmail,subject,content){
   
    // async function main() { 
      GlobalMaster.findOne({type:'EMAIL'})
        .exec() 
        .then(data=>{
            const senderEmail = data.user;
            const senderEmailPwd = data.password;
            // create reusable transporter object using the default SMTP transport
              let transporter = nodeMailer.createTransport({
                host: data.emailHost,
                port: data.port,
                // secure: false, // true for 465, false for other ports
                auth: {
                  user: senderEmail, 
                  pass: senderEmailPwd 
                }
              });

              // send mail with defined transport object
              var mailOptions = {
                    from: data.projectName+' <' + senderEmail + '>', // sender address
                    to: toEmail, // list of receiver
                    subject: subject, // Subject line
                    html: "<pre>" + content + "</pre>", // html body
                };
               let info =  transporter.sendMail(mailOptions, (error, info) => {
                    // console.log("Message sent: %s", error,info);
                });
             
              // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // console.log("Message sent: %s", info.messageId);
              // Preview only available when sending through an Ethereal account
              // console.log("Preview URL: %s", nodeMailer.getTestMessageUrl(info));
              // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
              
            

        })
        .catch(err =>{
            console.log('mail error=>',err)
        });
         // main().catch(err=>{console.log('mail error=>',err)});
      
   // }
   
}


exports.set_send_emailotp_usingEmail = (req, res, next) => {
	User.findOne({ "profile.email": req.params.emailId })
	.then(user => {
		if(user){
			// console.log('user status====',user.profile.status)
 			if ((user.profile.status).toLowerCase() === "active") {
 				// var optEmail = getRandomInt(1000, 9999);
 				var optEmail = 1234;
				// console.log("optEmail", optEmail, req.body);
				User.updateOne(
					{ "profile.email": req.params.emailId },
					{
						$set: {
							"profile.otpEmail": optEmail,
						},
					}
				)
				.exec()
				.then(data => {
					// console.log("data => ", data);
					if (data.nModified === 1) {
						User.findOne({ "profile.email": req.params.emailId })
							.then(user => {
								if (user) {
									main();
									async function main(){ 
										var sendMail = await sendEmail(req.params.emailId,req.body.emailSubject,req.body.emailContent + " Please enter this otp " + optEmail+ " to reset your password");
										res.status(200).json({ message: "OTP_UPDATED", ID: user._id,profile:user.profile })
									 }
								} else {
									res.status(200).json({ message: "User not found" });
								}
							})
							.catch(err => {
								res.status(500).json({
									message: "Failed to find User",
									error: err
								});
							});
					} else {
						res.status(401).json({ message: "OTP_NOT_UPDATED" })
					}
				})
				.catch(err => {
					res.status(500).json({
						message: "Failed to update User",
						error: err
					});
				});
 			}else if ((user.profile.status).toLowerCase() == "blocked") {
				// console.log("user.USER_BLOCK IN ==>")
				res.status(200).json({ message: "USER_BLOCK" });
			} else if ((user.profile.status).toLowerCase() == "unverified") {
				res.status(200).json({ message: "USER_UNVERIFIED" });
			}
		}else{
			res.status(200).json({ message: "NOT_REGISTER" })
		}		
	})
	.catch(err => {
		res.status(500).json({
			message: "Failed to find User",
			error: err
		});
	});				
};


exports.set_send_mobileotp_usingMobile = (req, res, next) => {
	User.findOne({ "profile.mobile": req.params.mobileNo })
	.then(user => {
		if(user){
			var optMobile = 1234;
			User.updateOne(
			{ "profile.mobile": req.params.mobileNo },
			{
				$set: {
					"profile.otpEmail": optMobile,
				},
			})
			.exec()
			.then(data => {
				// if (data.nModified === 1) {
					res.status(201).json({ message: "OTP_UPDATED", userID: user._id })
				// } else {
				// 	res.status(200).json({ message: "OTP_NOT_UPDATED" })
				// }
			})
			.catch(err => {
				res.status(500).json({
					message: "Failed to update User",
					error: err
				});
			});
		}else{
			res.status(200).json({ message: "NOT_REGISTER" })
		}
	})
	.catch(err => {
		res.status(500).json({
			message: "Failed to find User",
			error: err
		});
	});	
};


/*=========== User Login ===========*/
exports.user_login_mob_email = (req, res, next) => {
	// console.log("user_login_using_email req.body = ",req.body);
	
	var username 	= (req.body.username).toLowerCase(); 
	var role 		= (req.body.role).toLowerCase();

	User.findOne({$or:[
			{"profile.mobile" : username},
			{$and:[
				{"profile.email"  	:  username},
				{"profile.email"  	:  {$ne:''}},
				{"authService"  	:  {$eq:''}}
			]
			},
		],"roles": role}
	)
	.exec()
	.then(user => {
		// console.log("user => ",user)

		if (user && user !== null) {
			if ((user.profile.status).toLowerCase() == "active") {
				var pwd = user.services.password.bcrypt;
				if (pwd) {
					bcrypt.compare(req.body.password, pwd, (err, result) => {
						if (err) {
							return res.status(200).json({
								message : 'INVALID_PASSWORD'
							});
						}
						if (result) {
							const token = jwt.sign({
								email 	: req.body.email,
								userId 	: user._id,
							}, globalVariable.JWT_KEY,
								{
									// expiresIn: "365d"
									expiresIn: globalVariable.timeOutLimitSecs
								}
							);

							User.updateOne(
								{ "_id": ObjectID(user._id)},
								{
									$push: {
										"services.resume.loginTokens": {
											whenLogin 		: new Date(),
											loginTimeStamp 	: new Date(),
											hashedToken 	: token,
											logoutTimeStamp : ""
										}
									}
								}
							)
							.exec()
							.then(updateUser => {
								// console.log("updateUser ==> ",updateUser)
								if (updateUser.nModified == 1) {
									res.status(200).json({
										message 	: 'Login Auth Successful',
										token 		: token,
										roles 		: user.roles,
										ID 			: user._id,
										loginTokens : (user.services.resume.loginTokens).slice(-1)[0],
										companyID 	: user.profile.companyID,
										authService : user.authService,
										userDetails : {
											firstName 		: user.profile.firstname,
											lastName 		: user.profile.lastname,
											email 			: user.profile.email,
											mobile 			: user.profile.mobile,
											isdCode 		: user.profile.isdCode,
											countryCode 	: user.profile.countryCode,
											phone 			: user.profile.phone,
											city 			: user.profile.city,
											deliveryAddress : user.deliveryAddress,
											pincode 		: user.profile.pincode,
											companyID 		: user.profile.companyID,
											company_id 		: user.profile.company_id,
											companyName 	: user.profile.companyName,
											locationID 		: user.profile.locationID,
											user_id 		: user._id,
											roles 			: user.roles,
											token 			: token,
										}
									});
								} else {
									return res.status(200).json({
										message : 'INVALID_PASSWORD'
									});
								}
							})

							.catch(err => {
								console.log("500 err ", err);
								res.status(500).json({
									message : "Failed to save token",
									error 	: err
								});
							});
						} else {
							return res.status(200).json({
								message : 'INVALID_PASSWORD'
							});
						}
					})
				} else {
					res.status(200).json({ message: "INVALID_PASSWORD" });
				}
			} else if ((user.profile.status).toLowerCase() == "blocked") {
				res.status(200).json({ 
					message : "USER_BLOCK" 
				});
			} else if ((user.profile.status).toLowerCase() == "unverified") {
				
				// var emailOTP = getRandomInt(1000, 9999);
				// var mobileOTP = getRandomInt(1000, 9999);
				var mobileOTP = 1234;

				User.updateOne(
					{"_id" : ObjectID(user._id)},
					{
						$set: {
							"profile.otpMobile": mobileOTP,
						}
					}
				)
				.exec()
				.then(async(updatedata) => {
					// console.log("updatedata ===> ",updatedata);
					// if (updatedata.nModified === 1) {
						// User.find( 
						// 	{$or:[
						// 		{"profile.mobile" : username},
						// 		// {$and:[
						// 			{"profile.email"  :  username},
						// 			// {"profile.email"  :  {$ne:''}},
						// 			// {"authService"    :  {$eq:''}}
						// 		// ]
						// 		// },
						// 	]},
						// )
						// .exec()
						// .then(async(usersdata) => {
							// console.log("emailOTP  data===>",usersdata[0].profile);
							var userName = user.profile.firstname;
								var userNotificationValues = {
									"event"			: "SendOTP",
									"toUser_id"		: user._id,
									"toUserRole"	: user.roles[0],
									"toMobileNumber": user.isdCode + user.mobile,								
									"variables" 	: {
										userName 			: userName,
								OTPSendForReason 	: "Verify User",
								OTP 					: mobileOTP
									}
								}
															// console.log("userNotificationValues 6 => ",userNotificationValues);

								var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);
								res.status(200).json({
									message 	: 'USER_UNVERIFIED',
									ID 			: user._id,
									result 		: user
								});
						// });
					// } else {
					// 	res.status(200).json({ message: "SUCCESS_OTP_NOT_RESET" });
					// }
				})
				.catch(err => {
					console.log('user error ', err);
					res.status(500).json({
						message : "Failed to update Mobile OTP",
						error 	: err
					});
				})
				
			}
		} else {
			res.status(200).json({ message: "NOT_REGISTER" });
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			message : "Failed to find the User",
			error 	: err
		});
	});
};


/*=========== User Login ===========*/

const isNumeric=(value)=>{
	return /^-?\d+$/.test(value);
}

exports.user_login_mob_email_new = (req, res, next) => {
	// console.log("user_login_using_email req.body = ",req.body);
	
	var username 	= (req.body.username).toLowerCase(); 
	var role 		= (req.body.role).toLowerCase();
	if(isNumeric(username) && username.length>10){
		username = username.slice(username.length-10);
	}
	if(username.startsWith('0')){
		username = username.substring(1);
	}
	// console.log('username',username);
	User.findOne({$or:[
			{"profile.mobile" : username},
			{$and:[
				{"profile.email"  	:  username},
				{"profile.email"  	:  {$ne:''}},
				{"authService"  	:  {$eq:''}}
			]
			},
		],"roles": role}
	)
	.exec()
	.then(user => {
		// console.log("After login user => ",user)

		if (user && user !== null) {
			if ((user.profile.status).toLowerCase() == "active") {
				var pwd = user.services.password.bcrypt;
				if (pwd) {
					bcrypt.compare(req.body.password, pwd, (err, result) => {
						if (err) {
							return res.status(200).json({
								message : 'INVALID_PASSWORD'
							});
						}
						if (result) {
							const token = jwt.sign({
								email 	: req.body.email,
								userId 	: user._id,
							}, globalVariable.JWT_KEY,
								{
									expiresIn: globalVariable.timeOutLimitSecs
								}
							);

							User.updateOne(
								{ "_id": ObjectID(user._id)},
								{
									$push: {
										"services.resume.loginTokens": {
											whenLogin 		: new Date(),
											loginTimeStamp 	: new Date(),
											hashedToken 	: token,
											logoutTimeStamp : ""
										}
									}
								}
							)
							.exec()
							.then(updateUser => {
								// console.log("updateUser ==> ",updateUser)
								if (updateUser.nModified == 1) {
									var userDetails = {
											firstName 		: user.profile.firstname,
											lastName 		: user.profile.lastname,
											email 			: user.profile.email,
											mobile 			: user.profile.mobile,
											isdCode 		: user.profile.isdCode,
											countryCode 	: user.profile.countryCode,
											phone 			: user.profile.phone,
											city 			: user.profile.city,
											deliveryAddress : user.deliveryAddress,
											pincode 		: user.profile.pincode,
											companyID 		: user.profile.companyID,
											company_id 		: user.profile.company_id,
											companyName 	: user.profile.companyName,
											locationID 		: user.profile.locationID,
											user_id 		: user._id,
											joinAsConsultant : user.joinAsConsultant,
											invitedConsultant : user.invitedConsultant,
											isProfileReady  : user.isProfileReady,
											roles 			: user.roles,
											token 			: token,
											authService 	: user.authService,
										} ;


									console.log("user_login_mob_email_new userDetails => ",userDetails);

									res.status(200).json({
										message 	: 'Login Auth Successful',
										userDetails : userDetails
									});
								} else {
									return res.status(200).json({
										message : 'INVALID_PASSWORD'
									});
								}
							})

							.catch(err => {
								console.log("500 err ", err);
								res.status(500).json({
									message : "Failed to save token",
									error 	: err
								});
							});
						} else {
							return res.status(200).json({
								message : 'INVALID_PASSWORD'
							});
						}
					})
				} else {
					res.status(200).json({ message: "INVALID_PASSWORD" });
				}
			} else if ((user.profile.status).toLowerCase() == "blocked") {
				res.status(200).json({ 
					message : "USER_BLOCK" 
				});
			} else if ((user.profile.status).toLowerCase() == "unverified") {
				
				// var emailOTP = getRandomInt(1000, 9999);
				// var mobileOTP = getRandomInt(1000, 9999);
				var mobileOTP = 1234;

				User.updateOne(
					{"_id" : ObjectID(user._id)},
					{
						$set: {
							"profile.otpMobile": mobileOTP,
						}
					}
				)
				.exec()
				.then(async(updatedata) => {
					var userName = user.profile.firstname;
						var userNotificationValues = {
							"event"			: "SendOTP",
							"toUser_id"		: user._id,
							"toUserRole"	: user.roles[0],
							"toMobileNumber": user.isdCode + user.mobile,								
							"variables" 	: {
								userName 			: userName,
								OTPSendForReason 	: "Verify User",
								OTP 					: mobileOTP
							}
						}
						var send_notification_to_user = await sendNotification(user.profile.fullName,"OTP for SignUp",user.roles[0],userNotificationValues.variables);
						res.status(200).json({
							message 	: 'USER_UNVERIFIED',
							ID 			: user._id,
							result 		: user
						});
				})
				.catch(err => {
					console.log('user error ', err);
					res.status(500).json({
						message : "Failed to update Mobile OTP",
						error 	: err
					});
				})
				
			}
		} else {
			res.status(200).json({ message: "NOT_REGISTER" });
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			message : "Failed to find the User",
			error 	: err
		});
	});
};

exports.verify_otp_for_login = (req, res, next) => {
	// console.log("verify_otp_for_login req.body ==> ",req.body);
	
	// var selector = {
	// 					$or:
	// 						[{"profile.mobile" : req.body.username},
	// 						 {$and: [{"profile.email"  	:  req.body.username},
	// 									{"profile.email"  	:  {$ne:''}},
	// 									{"authService"  	:  {$eq:''}}]
	// 						}],
	// 					"roles": req.body.role
	// 				};

	var orArr = [{"profile.mobile" : req.body.userName},
						 {"profile.email"  	:  req.body.userName}];

	var selector = {$or: [{"profile.mobile" : req.body.userName},
						 {"profile.email"  	:  req.body.userName}], 
					"roles": req.body.role, "authService"  	: '' };

	// console.log("selector => ",JSON.stringify(selector));


	User.findOne(selector)
		.then(user => {
			// console.log("verify_otp_for_login user => ",user)

			if (user && user !== null && user !== 'undefined') {
				if ((user.profile.status).toLowerCase() == "active") {
					var savedOTP = user.profile.otpEmail;
					if (savedOTP) {
						if (savedOTP !== req.body.OTP) {
							return res.status(200).json({
								message : 'INVALID_OTP'
							});
						}else{
							const token = jwt.sign({
								email 	: user.username,
								userId 	: user._id,
							}, globalVariable.JWT_KEY,
								{
									// expiresIn: "365d"
									expiresIn: globalVariable.timeOutLimitSecs
								}
							);

							User.updateOne(
								{ "_id": ObjectID(user._id)},
								{
									$push: {
										"services.resume.loginTokens": {
											whenLogin 		: new Date(),
											loginTimeStamp 	: new Date(),
											hashedToken 	: token,
											logoutTimeStamp : ""
										}
									}
								}
							)
							.exec()
							.then(updateUser => {
								// console.log("updateUser ==> ",updateUser)
								if (updateUser.nModified == 1) {
									res.status(200).json({
										message 	: 'Login Auth Successful',
										token 		: token,
										roles 		: user.roles,
										ID 			: user._id,
										loginTokens : (user.services.resume.loginTokens).slice(-1)[0],
										companyID 	: user.profile.companyID,
										authService : user.authService,
										userDetails : {
											firstName 		: user.profile.firstname,
											lastName 		: user.profile.lastname,
											email 			: user.profile.email,
											mobile 			: user.profile.mobile,
											isdCode 		: user.profile.isdCode,
											countryCode 	: user.profile.countryCode,
											phone 			: user.profile.phone,
											city 			: user.profile.city,
											deliveryAddress : user.deliveryAddress,
											pincode 		: user.profile.pincode,
											companyID 		: user.profile.companyID,
											company_id 		: user.profile.company_id,
											companyName 	: user.profile.companyName,
											locationID 		: user.profile.locationID,
											user_id 		: user._id,
											roles 			: user.roles,
											token 			: token,
										}
									});
								} else {
									return res.status(200).json({
										message : 'INVALID_OTP'
									});
								}
							})
							.catch(err => {
								console.log("500 err ", err);
								res.status(503).json({
									message : "Failed to save token",
									error 	: err
								});
							});
						} 
					} else {
						res.status(200).json({ message: "INVALID_OTP" });
					}
				} else if ((user.profile.status).toLowerCase() == "blocked") {
					res.status(200).json({ 
						message : "USER_BLOCK" 
					});
				} else if ((user.profile.status).toLowerCase() == "unverified") {
					// var emailOTP = getRandomInt(1000, 9999);
					// var mobileOTP = getRandomInt(1000, 9999);
					var mobileOTP = 1234;

					User.updateOne(
						{"_id" : ObjectID(user._id)},
						{
							$set: {
								"profile.otpMobile": mobileOTP,
							}
						}
					)
					.exec()
					.then(async(updatedata) => {
						// console.log("updatedata ===> ",updatedata);
						var userName = user.profile.firstname;
						var userNotificationValues = {
							"event"			: "SendOTP",
							"toUser_id"		: user._id,
							"toUserRole"	: user.roles[0],
							"toMobileNumber": user.isdCode + user.mobile,								
							"variables" 	: {
								userName 			: userName,
								OTPSendForReason 	: "Verify User",
								OTP 					: mobileOTP
							}
						}

						var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);
						res.status(200).json({
							message 	: 'USER_UNVERIFIED',
							ID 			: user._id,
							result 		: user
						});
					})
					.catch(err => {
						console.log('user error ', err);
						res.status(502).json({
							message : "Failed to update Mobile OTP",
							error 	: err
						});
					})				
				}
			} else {
				res.status(200).json({ message: "NOT_REGISTER" });
			}		
		})
		.catch(err => {
			console.log("find error => ", err);
			res.status(501).json({
				message : "Failed to find the User",
				error 	: err
			});
		});
};


exports.verify_otp_for_signup = (req, res, next) => {
	console.log("verify_otp_for_signup req.body ==> ",req.body);
	
	var selector = {$or: [{"profile.mobile" : req.body.userName},
						 {"profile.email"  	:  req.body.userName.toLowerCase()}], 
					"roles": req.body.role, "authService"  	: '' };

	console.log("selector => ",JSON.stringify(selector));


	User.findOne(selector)
		.then(user => {
			console.log("verify_otp_for_signup user => ",user)
			if(user.profile.otpEmail === req.body.OTP){
				User.updateOne({username : req.body.userName},
							   {$set : {"profile.status" : "active"} })
					.then((updatedUser)=>{
						res.status(200).json({message : "OTP Verified Successfully!"});
					})
					.catch(err => {
						console.log("find error => ", err);
						res.status(500).json({
							message : "Can not update User Collection",
							error 	: err
						});
					});

			}else{
				res.status(200).json({message : "OTP does not match!"});
			}
		})
		.catch(err => {
			console.log("find error => ", err);
			res.status(501).json({
				message : "Failed to find the User",
				error 	: err
			});
		});
};



exports.user_signup_social_media = (req, res, next) => {
	// console.log("req body",req.body);
		if(req.body.pwd && req.body.role) {
			var userRole = (req.body.role).toLowerCase();
			if (userRole) {
				Role.findOne({ role: userRole })
					.exec()
					.then(role => {
						if (role) {
							User.findOne({ 
											"social_media_id"  :  req.body.social_media_id,
											"authService"    	:  req.body.authService
										 })
								.then(async(user) => {
									var username = '';
									if(req.body.authService === "google"){
										username = req.body.email 
									}else if(req.body.authService === "facebook"){
										var users = await User.findOne({'authService':'facebook'}).sort({_id:-1}).limit(1) 
										username = users ? parseInt(users.username)+1 : 1;
									}
									// console.log("user",user);
									if (user) {
										const token = jwt.sign({
											username: req.body.username,
											userId: user._id,
										}, globalVariable.JWT_KEY,
											{
												expiresIn: globalVariable.timeOutLimitSecs
											}
										);

										User.updateOne(
											{ "_id": ObjectID(user._id)},
											{
												$push: {
													"services.resume.loginTokens": {
														whenLogin: new Date(),
														loginTimeStamp: new Date(),
														hashedToken: token,
														logoutTimeStamp : ""
													}
												}
											})
											.then(updateUser => {
												var loginResponse = {
													message: 'Login Auth Successful',
													token: token,
													roles: user.roles,
													ID: user._id,
													loginTokens: (user.services.resume.loginTokens).slice(-1)[0],
													companyID: user.profile.companyID,
													authService:user.authService,
													userDetails: {
														firstName: user.profile.firstname,
														lastName: user.profile.lastname,
														email: user.profile.email,
														countryCode : user.profile.countryCode,
														phone: user.profile.phone,
														city: user.profile.city,
														deliveryAddress: user.deliveryAddress,
														pincode: user.profile.pincode,
														companyID: user.profile.companyID,
														company_id: user.profile.company_id,
														companyName: user.profile.companyName,
														locationID: user.profile.locationID,
														user_id: user._id,
														roles: user.roles,
														token: token,
													}
												};

												// console.log("loginResponse => ",loginResponse);

												res.status(200).json(loginResponse);
											})
											.catch(error =>{
												console.log("login error => ",error);
											})
									} else {										
										// console.log("username",username)
										bcrypt.hash(username.toString(), 10, (err, hash) => {
											if (err) {
												console.log("err",err);
												return res.status(500).json({
													message: "Failed to match the password",
													error: err
												});
											} else {
												var emailOTP = getRandomInt(1000, 9999);
												if (emailOTP) {
													const user = new User({
														_id: new mongoose.Types.ObjectId(),
														createdAt: new Date,
														services: {
															password: {
																bcrypt: hash

															},
														},
														username: username ? username: '',
														authService : req.body.authService,
														social_media_id : req.body.social_media_id,
														profile:
														{
															firstname : req.body.firstname,
															lastname: req.body.lastname,
															fullName: req.body.firstname + ' ' + req.body.lastname,
															email: req.body.email ? req.body.email.toLowerCase() : '',
															companyID: req.body.companyID,
															pincode: req.body.pincode,
															companyName: req.body.companyName,
															mobile: req.body.mobNumber,
															createdAt: new Date(),
															otpEmail: 1234,
															countryCode : req.body.countryCode,
															status: req.body.status ? req.body.status : "Inactive",
															createdBy: req.body.createdBy,
														},
														roles: [userRole]
													});
													if (!req.body.firstname) {
														user.profile.fullName = req.body.fullName;
													}
													user.save()
														.then(result => {
															if (result) {
																const token = jwt.sign({
																	username: username,
																	userId: user._id,
																}, globalVariable.JWT_KEY,
																	{
																		expiresIn: globalVariable.timeOutLimitSecs
																	}
																);
								
																User.updateOne(
																	{ "_id": ObjectID(result._id)},
																	{
																		$push: {
																			"services.resume.loginTokens": {
																				whenLogin: new Date(),
																				loginTimeStamp: new Date(),
																				hashedToken: token,
																				logoutTimeStamp : ""
																			}
																		}
																	}
																)
																.exec()
																.then(updateUser => {
																	if (updateUser.nModified == 1) {
																		res.status(200).json({
																			message: 'Login Auth Successful',
																			token: token,
																			roles: user.roles,
																			ID: user._id,
																			loginTokens: (user.services.resume.loginTokens).slice(-1)[0],
																			companyID: user.profile.companyID,
																			authService:user.authService,
																			userDetails: {
																				firstName: user.profile.firstname,
																				lastName: user.profile.lastname,
																				email: user.profile.email,
																				countryCode : user.profile.countryCode,
																				phone: user.profile.phone,
																				city: user.profile.city,
																				deliveryAddress: user.deliveryAddress,
																				pincode: user.profile.pincode,
																				companyID: user.profile.companyID,
																				company_id: user.profile.company_id,
																				companyName: user.profile.companyName,
																				locationID: user.profile.locationID,
																				user_id: user._id,
																				roles: user.roles,
																				token: token,
																			}
																		});
																	} else {
																		return res.status(200).json({
																			message: 'INVALID_PASSWORD'
																		});
																	}
																})
							
																.catch(err => {
																	console.log("500 err ", err);
																	res.status(500).json({
																		message: "Failed to save token",
																		error: err
																	});
																});
															}else {
																res.status(200).json({ message: "USER_NOT_CREATED"})
															}
														})
														.catch(err => {
															console.log(err);
															res.status(500).json({
																message: "Failed to save User Details",
																error: err
															});
														});
												}
											}
										});
									}
								})
								.catch(err => {
									console.log(err);
									res.status(500).json({
										message: "Failed which finding the User",
										error: err
									});
								});
						} else {
							res.status(200).json({ message: "Role does not exists" });
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							message: "Failed when trying to find Role",
							error: err
						});
					});
			}
		} else {
			res.status(200).json({ message: "Email, pwd and role are mandatory" });
		}
};



exports.user_signup_guest_login = (req, res, next) => {
	// console.log("req body",req.body);
		if(req.body.pwd && req.body.role) {
			var userRole = (req.body.role).toLowerCase();
			if (userRole) {
				Role.findOne({ role: userRole })
					.exec()
					.then(role => {
						if (role) {
							User.findOne({'authService':'guest'}).sort({_id:-1}).limit(1)
							.exec()
							.then(users => {
								// console.log("users",users);
									bcrypt.hash(req.body.pwd, 10, (err, hash) => {
										if (err) {
											console.log("err",err);
											return res.status(500).json({
												message: "Failed to match the password",
												error: err
											});
										} else {
											var emailOTP = getRandomInt(1000, 9999);
											var username = users ? parseInt(users.username)+1 :1;
											if (emailOTP) {
												const user = new User({
													_id: new mongoose.Types.ObjectId(),
													createdAt: new Date,
													services: {
														password: {
															bcrypt: hash

														},
													},
													username: username,
													authService : req.body.authService,
													profile:
													{
														firstname : req.body.firstname,
														lastname: req.body.lastname,
														fullName: req.body.firstname + ' ' + req.body.lastname,
														email: req.body.email ? req.body.email.toLowerCase() : '',
														companyID: req.body.companyID,
														pincode: req.body.pincode,
														companyName: req.body.companyName,
														mobile: req.body.mobNumber,
														createdAt: new Date(),
														otpEmail: 1234,
														countryCode : req.body.countryCode,
														status: req.body.status ? req.body.status : "Inactive",
														createdBy: req.body.createdBy,
													},
													roles: [userRole]
												});
												if (!req.body.firstname) {
													user.profile.fullName = req.body.fullName;
												}
												user.save()
													.then(result => {
														if (result) {
															const token = jwt.sign({
																email: username,
																userId: user._id,
															}, globalVariable.JWT_KEY,
																{
																	// expiresIn: "365d"
																	expiresIn: globalVariable.timeOutLimitSecs
																}
															);
							
														User.updateOne(
															{ "_id": ObjectID(result._id)},
															{
																$push: {
																	"services.resume.loginTokens": {
																		whenLogin: new Date(),
																		loginTimeStamp: new Date(),
																		hashedToken: token,
																		logoutTimeStamp : ""
																	}
																}
															}
														)
															.exec()
															.then(updateUser => {
																if (updateUser.nModified == 1) {
																	res.status(200).json({
																		message: 'Login Auth Successful',
																		token: token,
																		roles: user.roles,
																		ID: user._id,
																		loginTokens: (user.services.resume.loginTokens).slice(-1)[0],
																		companyID: user.profile.companyID,
																		authService : user.authService,
																		userDetails: {
																			firstName: user.profile.firstname,
																			lastName: user.profile.lastname,
																			email: user.profile.email,
																			countryCode : user.profile.countryCode,
																			phone: user.profile.phone,
																			city: user.profile.city,
																			deliveryAddress: user.deliveryAddress,
																			pincode: user.profile.pincode,
																			companyID: user.profile.companyID,
																			company_id: user.profile.company_id,
																			companyName: user.profile.companyName,
																			locationID: user.profile.locationID,
																			user_id: user._id,
																			roles: user.roles,
																			token: token,
																		}
																	});
																} else {
																	return res.status(200).json({
																		message: 'INVALID_PASSWORD'
																	});
																}
															})
						
															.catch(err => {
																console.log("500 err ", err);
																res.status(500).json({
																	message: "Failed to save token",
																	error: err
																});
															});
														}else {
															res.status(200).json({ message: "USER_NOT_CREATED"})
														}
													})
													.catch(err => {
														console.log(err);
														res.status(500).json({
															message: "Failed to save User Details",
															error: err
														});
													});
											}
										}
									});
								})
								.catch(err => {
									console.log(err);
									res.status(500).json({
										message: "Failed which finding the User",
										error: err
									});
								});
						} else {
							res.status(200).json({ message: "Role does not exists" });
						}
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							message: "Failed when trying to find Role",
							error: err
						});
					});
			}
		} else {
			res.status(200).json({ message: "Email, pwd and role are mandatory" });
		}
};


/**=========== Forgot Password Send OTP ===========*/
exports.set_send_otp = (req, res, next) => {
	// console.log("req body => ",req.params);
	
	User.findOne(
		{$or: [
				{ "profile.mobile" : req.params.username },
				{ $and : [
						{"profile.email"  :  req.params.username},
						{"profile.email"  :  { $ne : '' } },
				 		{$or : [{authService: { $exists: false }}, {authService: ""} ]}
					]
				}
			],
		}
	)
	.then(user => {		
		if(user !== null){
			if (user.authService !== "" && user.authService !== undefined) {
				res.status(200).json({ 
					message : "You are not allowed to change your password. Because you are login through " + user.authService
				});
			} else {
				// console.log("forgot pwd user => ", user);
	 			if ((user.profile.status).toLowerCase() === "active" || (user.profile.status).toLowerCase() === "unverified") {
	 				var otp = getRandomInt(1000, 9999);
					 // var otpMobile = 1234;
					User.updateOne(
						{ "_id": ObjectID(user._id)},
						{
							$set: {
								"profile.otpMobile": otp,
							},
						}
					)
					.exec()
					.then(async(data) => {
						// console.log("data",data);
						// if (data.nModified === 1) {
							var userName = user.profile.email;
							// console.log("userName => ",userName);
							var userNotificationValues = {
									userName 			: userName,
									OTPSendForReason 	: "Reset Password",
									OTP 				: otp
								}
							var send_notification_to_user = await sendNotification(userName,
																					"SendOTP",
																					user.roles[0],
																					userNotificationValues
																					);
							
							// console.log("notification send_notification_to_user => ",send_notification_to_user);
							
							if(send_notification_to_user === 'No event available for this event'){
								res.status(200).json({ 
									message : "Failed to send OTP to your " + req.params.username.includes("@") ? "registered email Id" : "registered mobile number",
									ID 		: user._id,
									profile : user.profile 
								})
							}else{								
								res.status(200).json({ 
									message 	: req.params.username.includes("@") ? "OTP sent on your registered email Id" : "OTP sent on your registered mobile number", 
									ID 			: user._id,
									profile 	: user.profile 
								})
							}
					})
					.catch(err => {
						res.status(500).json({
							message : "Failed to update User",
							error 	: err
						});
					});
	 			}else if ((user.profile.status).toLowerCase() == "blocked") {
					// console.log("user.USER_BLOCK IN ==>")
					res.status(200).json({ 
						message : "user is blocked" 
					});
				} else if ((user.profile.status).toLowerCase() == "unverified") {
					res.status(200).json({ 
						message : "User is unverified" 
					});
				}else{
					res.status(200).json({ 
						message : "User is not active" 
					});
				}
			}
		}else{
			res.status(200).json({ 
				message : "User is not registered" 
			})
		}		
	})
	.catch(err => {
		console.log("Error : Failed to find User => ",err)
		res.status(500).json({
			message : "Failed to find User",
			error 	: err
		});
	});				
};


exports.send_otp_using_username = (req, res, next) => {
	console.log("send_otp_using_username req body => ",req.body);
	var mobile 	= {"profile.mobile" : req.body.userName} ;
	var email 	= {"profile.email"  : req.body.userName} ;

	var selector = {$or: [mobile, email], "roles": req.body.role, "authService" : "" };

	// console.log("mobile => ",JSON.stringify(mobile));
	// console.log("email => ",JSON.stringify(email));
	// console.log("send_otp_using_username selector => ",JSON.stringify(selector));
	
	User.findOne(selector)
		.then(user => {
			// console.log("user => ",user);
			if(user !== null){
				// console.log("forgot pwd user => ", user);
	 			if ((user.profile.status).toLowerCase() === "active" || (user.profile.status).toLowerCase() === "unverified") {
	 				var otp = getRandomInt(1000, 9999);
					// var otpMobile = 1234;
					User.updateOne(
						{ "_id": ObjectID(user._id)},
						{
							$set: {
								"profile.otpMobile": otp,
								"profile.otpEmail" : otp
							},
						}
					)
					.exec()
					.then(async(data) => {
						console.log("data", data);
						// if (data.nModified === 1) {
							var userName = user.profile.firstname;
							// console.log("userName => ",userName);
							var userNotificationValues = {
								"event"			: "SentOTP",
								"toUser_id"		: user._id,
								"toUserRole"	: user.roles[0],
								"toMobileNumber": user.isdCode + user.mobile,								
								"variables" 	: {
									UserName 			: userName,
									OTPSendForReason 	: "Resend OTP for Signup",
									ResendOTP 			: otp
								}
							}
							var send_notification_to_user = await sendNotification(user.username,"SentOTP",'user', userNotificationValues.variables);
							// var send_notification_to_user = true;
							
							console.log("notification send_notification_to_user => ",send_notification_to_user);
							
							if(send_notification_to_user && send_notification_to_user === 'No event available for this event'){
								res.status(200).json({ 
									message : "Failed to send OTP to your " + req.params.username.includes("@") ? "registered email Id" : "registered mobile number",
									ID 		: user._id,
									profile : user.profile 
								})
							}else{								
								res.status(200).json({ 
									message 	: req.body.userName.includes("@") ? "OTP sent on your registered email Id" : "OTP sent on your registered mobile number", 
									ID 		: user._id,
									profile 	: user.profile 
								})
							}
					})
					.catch(err => {
						console.log("notification err => ",err);

						res.status(500).json({
							message : "Failed to update User",
							error 	: err
						});
					});
	 			}else if ((user.profile.status).toLowerCase() == "blocked") {
					// console.log("user.USER_BLOCK IN ==>")
					res.status(200).json({ 
						message : "User is blocked" 
					});
				} else if ((user.profile.status).toLowerCase() == "unverified") {
					res.status(200).json({ 
						message : "User is unverified" 
					});
				}else{
					res.status(200).json({ 
						message : "User is not active" 
					});
				}
			}else{
				res.status(200).json({ 
					message : "User is not registered" 
				})
			}		
		})
		.catch(err => {
			console.log("Error : Failed to find User => ",err)
			res.status(501).json({
				message : "Failed to find User",
				error 	: err
			});
		});				
};

exports.send_otp_for_login = (req, res, next) => {
	var mobile 	= {"profile.mobile" : req.body.userName} ;
	var email 	= {"profile.email"  : req.body.userName} ;
	var selector = {$or: [mobile, email], "roles": req.body.role, "authService" : "" };
	
	User.findOne(selector)
		.then(user => {
			if(user !== null){
	 			if ((user.profile.status).toLowerCase() === "active" || (user.profile.status).toLowerCase() === "unverified") {
	 				var otpEmail = getRandomInt(1000, 9999);
					User.updateOne(
						{ "_id": ObjectID(user._id)},
						{
							$set: {
								"profile.otpEmail": otpEmail,
							},
						}
					)
					.exec()
					.then(async(data) => {
							var userName = user.profile.email;
							var userNotificationValues = {
								"event"			: "OTP for Login",
								"toUser_id"		: user._id,
								"toUserRole"	: user.roles[0],
								"toMobileNumber": user.isdCode + user.mobile,								
								"variables" 	: {
									userName 			: userName,
									OTPSendForReason 	: "OTP for Login",
									OTP 				: otpEmail
								}
							}
							var send_notification_to_user = await sendNotification( userName,
																					"OTP for Login",
																					user.roles[0],
																					userNotificationValues.variables);
							
							console.log("send_otp_for_login send_notification_to_user => ",send_notification_to_user);
							
							if(send_notification_to_user === 'No event available for this event'){
								res.status(200).json({ 
									success : false,
									message : "Failed to send OTP to your registered email Id",
									ID 		: user._id,
									profile : user.profile 
								})
							}else{								
								res.status(200).json({ 
									success 	: true,
									message 	: "OTP sent on your registered email Id & Mobile", 
									ID 			: user._id,
									profile 	: user.profile 
								})
							}
					})
					.catch(err => {
						console.log("send_otp_for_login err => ",err);
						res.status(501).json({
							message : "Failed to update User",
							error 	: err
						});
					});
	 			}else if ((user.profile.status).toLowerCase() == "blocked") {
					// console.log("user.USER_BLOCK IN ==>")
					res.status(200).json({ 
						message : "User is blocked" 
					});
				} else if ((user.profile.status).toLowerCase() == "unverified") {
					res.status(200).json({ 
						message : "User is unverified" 
					});
				}else{
					res.status(200).json({ 
						message : "User is not active" 
					});
				}
			}else{
				res.status(200).json({ 
					message : "User is not registered" 
				})
			}		
		})
		.catch(err => {
			console.log("Error : Failed to find User => ",err)
			res.status(500).json({
				message : "Failed to find User",
				error 	: err
			});
		});				
};

exports.send_otp_forgot_password = (req, res, next) => {
	console.log("send_otp_forgot_password req body => ",req.body);
	var mobile 	= {"profile.mobile" : req.body.userName} ;
	var email 	= {"profile.email"  : req.body.userName} ;

	var selector = {$or: [mobile, email], "roles": req.body.role, "authService" : "","profile.status":"active" };
	// console.log("send_otp_forgot_password selector => ",selector);


	User.findOne(selector)
		.then(user => {
			// console.log("send_otp_forgot_password user => ",user);
			if(user !== null){
				// console.log("forgot pwd user => ", user);
	 			if ((user.profile.status).toLowerCase() === "active" || (user.profile.status).toLowerCase() === "unverified") {
	 				var otpEmail = getRandomInt(1000, 9999);
					// var otpMobile = 1234;
					User.updateOne(
						{ "_id": ObjectID(user._id)},
						{
							$set: {
								"profile.otpEmail": otpEmail,
							},
						}
					)
					.then(async(data) => {
						// console.log("data",data);
						// if (data.nModified === 1) {
							var userName = user.profile.email;
							console.log("send_otp_forgot_password userName => ",userName);
							var userNotificationValues = {
									userName 			: userName,
									OTPSendForReason 	: "Forgot Password",
									OTP 				: otpEmail
								}
							var send_notification_to_user = await sendNotification(userName, "Forgot Password",user.roles[0],userNotificationValues);
							// var send_notification_to_user = true;
							
							// console.log("send_otp_forgot_password send_notification_to_user => ",send_notification_to_user);
							
							if(send_notification_to_user === 'No event available for this event'){
								res.status(500).json({ 
									message : "Failed to send OTP to your " + req.params.username.includes("@") ? "registered email Id" : "registered mobile number",
									ID 		: user._id,
									profile : user.profile,
									success : false
								})
							}else{								
								res.status(200).json({ 
									// message 	: req.params.username.includes("@") ? "OTP sent on your registered email Id" : "OTP sent on your registered mobile number", 
									message 	: "OTP sent on your registered email address "+userName, 
									ID 		: user._id,
									profile 	: user.profile,
									success 	: true
								})
							}
					})
					.catch(err => {
						console.log("send_otp_forgot_password ==> Update Error ==> ",err);
						res.status(502).json({
							message 	: "Failed to update User",
							error 	: err,
							success : false
						});
					});
	 			}else if ((user.profile.status).toLowerCase() == "blocked") {
					// console.log("user.USER_BLOCK IN ==>")
					res.status(200).json({ 
						message : "User is blocked" ,
						success : false
					});
				} else if ((user.profile.status).toLowerCase() == "unverified") {
					res.status(200).json({ 
						message : "User is unverified" ,
						success : false
					});
				}else{
					res.status(200).json({ 
						message : "User is not active" ,
						success : false
					});
				}
			}else{
				res.status(200).json({ 
					message : "User is not registered or active yet",
					success : false
				})
			}		
		})
		.catch(err => {
			console.log("Error : Failed to find User => ",err)
			res.status(501).json({
				message : "Failed to find User",
				error 	: err,
				success : false
			});
		});				
};



exports.change_password_withoutotp = (req, res, next) => {
	// console.log("inside change_password_withoutotp", req.body);
	bcrypt.hash(req.body.pwd, 10, (err, hash) => {
		if (err) {
			return res.status(500).json({
				message: "Some problem occured in Password encryption!",
				error: err
			});
		} else {
			User.updateOne(
					{ _id: req.body.user_id},
					{
						$set: { "services.password.bcrypt" 	: hash },
					}
				)
				.then(data => {			
					// console.log("updatedata =>",data);
					res.status(201).json({ 
						message 	: "Password Changed successfully!", 
					})
				})
				.catch(err => {
					res.status(500).json({
						message 	: "Failed to Reset the password",
						error 		: err
					});
				});
		}
	});	
};

function comparePwds(inputPwd, hashedPwd){

	return new Promise( (reject,resolve)=>{
			bcrypt.compare(inputPwd, hashedPwd, (err, result) => {				
				if (err) {
					console.log("compare err => ",err);
					reject(err);
				}
				if (result === true) {
					// console.log("1 compare result => ",result);					
					resolve("Matched");
				}
				if (result === false) {
					// console.log("2 compare result => ",result);					
					resolve("Not Matched");
				}
			})
	});
}


exports.change_password_using_username = (req, res, next) => {

	// console.log("inside change_password_using_username", req.body);
	var updateAllowed = false;

	bcrypt.hash(req.body.pwd, 10, (err, hash) => {
		if (err) {
			return res.status(500).json({
				message: "Some problem occured in Password encryption!",
				error: err
			});
		} else {

			var selector = { $or: [{"profile.mobile" : req.body.userName},
								 {"profile.email"  	:  req.body.userName}], 
							 "authService"  	: '' };
			
			// console.log("change_password_using_username selector => ",selector );

			User.findOne(selector)
				.then(async (user)=>{
					var currPwd  = user.services.password.bcrypt;
					var lastPwd  = user.services.password.bcrypt1  ? user.services.password.bcrypt1 : "";
					var olderPwd = user.services.password.bcrypt2  ? user.services.password.bcrypt2 : "";

					console.log("req.body.pwd = ",req.body.pwd);
					console.log("currPwd = ",currPwd);

					bcrypt.compare(req.body.pwd, currPwd, (err, result) => {				
						if (err) {
							console.log("1 compare err => ",err);
							res.status(500).json({
								message 	: "Something went wrong 1",
								error 		: err
							});							
						}
						if (result) {
							// console.log("1 compare result => ",result);					
							res.status(200).json({
								message : "Your password should not be same as last 3 passwords",
							});
						}else{
							// console.log("2 compare result => ",result);					
							if(lastPwd !== ""){
								bcrypt.compare(req.body.pwd, lastPwd, (err, result) => {				
									if (err) {
										console.log("2 compare err => ",err);
										res.status(500).json({
											message 	: "Something went wrong 2",
											error 		: err
										});							
									}
									if (result === true) {
										console.log("2 compare result => ",result);					
										res.status(200).json({
											message 	: "Your password should not be same as last 3 passwords",
										});
									}
									if (result === false) {
										if(olderPwd !== ""){
											bcrypt.compare(req.body.pwd, olderPwd, (err, result) => {				
												if (err) {
													console.log("3 compare err => ",err);
													res.status(500).json({
														message 	: "Something went wrong 3",
														error 		: err
													});							
												}
												if (result === true) {
													// console.log("3 compare result => ",result);					
													res.status(200).json({
														message 	: "Your password should not be same as last 3 passwords",
													});
												}else{
													// Now you can update password in database
													updateUserPwd(selector, hash, currPwd, lastPwd, res);
												}
											});
										}else{
												updateUserPwd(selector, hash, currPwd, lastPwd,res);
										}
									}
								});
							}else{
								updateUserPwd(selector, hash, currPwd, lastPwd, res);
							}
						}
					})




					
				})
				.catch(error => {
					console.log("Find User error => ",error);
					res.status(500).json({
						message 	: "User not found",
						error 		: error
					});
				});

		}
	});	
};


exports.change_password_after_login = (req, res, next) => {

	console.log("inside change_password_after_login ", req.body);
	var updateAllowed = false;

	bcrypt.hash(req.body.pwd, 10, (err, hash) => {
		if (err) {
			return res.status(500).json({
				message: "Some problem occured in Password encryption!",
				error: err
			});
		} else {

			var selector = { $or: [{"profile.mobile" : req.body.userName},
								   {"profile.email"  :  req.body.userName}], 
							 "authService"  	: '' };
			
			// console.log("change_password_using_username selector => ",selector );
			User.findOne(selector)
				.then(async (user)=>{
					var currPwd  = user.services.password.bcrypt;
					var lastPwd  = user.services.password.bcrypt1  ? user.services.password.bcrypt1 : "";
					var olderPwd = user.services.password.bcrypt2  ? user.services.password.bcrypt2 : "";

					bcrypt.compare(req.body.currentPassword, currPwd, (err, result) => {				
						if (err) {
							console.log("1 compare err => ",err);
							res.status(500).json({
								message 	: "Something went wrong 1",
								error 		: err
							});							
						}
						if (result) {
							bcrypt.compare(req.body.pwd, currPwd, (err, result) => {				
								if (err) {
									console.log("1 compare err => ",err);
									res.status(500).json({
										message 	: "Something went wrong 1",
										error 		: err
									});							
								}
								if (result) {
									// console.log("1 compare result => ",result);					
									res.status(200).json({
										message : "Your password should not be same as last 3 passwords",
									});
								}else{
									// console.log("2 compare result => ",result);					
									if(lastPwd !== ""){
										bcrypt.compare(req.body.pwd, lastPwd, (err, result) => {				
											if (err) {
												console.log("2 compare err => ",err);
												res.status(500).json({
													message 	: "Something went wrong 2",
													error 		: err
												});							
											}
											if (result === true) {
												console.log("2 compare result => ",result);					
												res.status(200).json({
													message 	: "Your password should not be same as last 3 passwords",
												});
											}
											if (result === false) {
												if(olderPwd !== ""){
													bcrypt.compare(req.body.pwd, olderPwd, (err, result) => {				
														if (err) {
															console.log("3 compare err => ",err);
															res.status(500).json({
																message 	: "Something went wrong 3",
																error 		: err
															});							
														}
														if (result === true) {
															// console.log("3 compare result => ",result);					
															res.status(200).json({
																message 	: "Your password should not be same as last 3 passwords",
															});
														}else{
															// Now you can update password in database
															updateUserPwd(selector, hash, currPwd, lastPwd, res);
														}
													});
												}else{
													updateUserPwd(selector, hash, currPwd, lastPwd,res);
												}
											}
										});
									}else{
										updateUserPwd(selector, hash, currPwd, lastPwd, res);
									}
								}
							})
						}else{
							console.log("Current Pwd Not Matching => ",result);
							res.status(200).json({
								message 	: "Your Current Password is Wrong!",
							});							
						}
					})
				})
				.catch(error => {
					console.log("Find User error => ",error);
					res.status(500).json({
						message 	: "User not found",
						error 		: error
					});
				});

		}
	});	

};

function updateUserPwd(selector, hash, currPwd, lastPwd, res){
		if(lastPwd !== ""){
			var resetPwd =  { 
								"services.password.bcrypt" : hash,
								"services.password.bcrypt1" : currPwd,
								"services.password.bcrypt2" : lastPwd,
							}						
		}else{
			var resetPwd =  { 
								"services.password.bcrypt" : hash,
								"services.password.bcrypt1" : currPwd,
							}						
		}

		User.updateOne( selector ,  { $set: resetPwd }  )
			.then(data => {			
				// console.log("updatedata =>",data);
				if(data.nModified === 1){
					res.status(200).json({ 
						message 	: "Password Changed successfully!", 
					})						
				}else{
					res.status(201).json({ 
						message 	: "Some problem while changing the Password!", 
					})						
				}
			})
			.catch(err1 => {
				console.log("Update error => ",err1);
				res.status(500).json({
					message 	: "Failed to Reset the password",
					error 		: err1
				});
			});	
}