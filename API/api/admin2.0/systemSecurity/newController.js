const mongoose 			= require("mongoose");
const bcrypt  			= require("bcryptjs");
const jwt 				= require("jsonwebtoken");
var ObjectID 			= require('mongodb').ObjectID;
var request 			= require('request-promise');
const User 				= require('../userManagementnew/ModelUsers.js');
const Role 				= require('../rolesManagement/ModelRoles.js');
const globalVariable 	= require("../../../nodemonConfig.js");
const plivo 			= require('plivo');

exports.user_signup_user = (req, res, next) => {
	var username 	= "EMAIL";
	var checkValid 	= req.body.email && req.body.pwd && req.body.role;
	var selector    = {"username" : req.body.email}
	if(req.body.username){
		if(req.body.username === "MOBILE"){
			username 	= "MOBILE";
			checkValid 	= req.body.mobNumber && req.body.pwd && req.body.role;
			selector    = {"username" : req.body.mobNumber}
		}
	}
	if(checkValid){
		var emailId 	= req.body.email.toLowerCase();
		var mobNumber 	= req.body.mobNumber;
		var role_lower 	= (req.body.role).toLowerCase();
		if (role_lower) {
			Role.findOne({ role: role_lower })
				.exec()
				.then(role => {
					if (role) {
						User.find(selector)
							.exec()
							.then(user => {
								if (user.length > 0) {
									return res.status(200).json({
										message: username === 'EMAIL' ? 'Email Id already exist.' : 'Mobile Number already exist.'
									});
								} else {
									bcrypt.hash(req.body.pwd, 10, (err, hash) => {
										if (err) {
											return res.status(500).json({
												message: "Failed to match the password",
												error: err
											});
										} else {
											var emailOTP  = getRandomInt(1000, 9999);
											var mobileOTP = 1234;
											if(emailOTP && mobileOTP){
												const user = new User({
													_id			: new mongoose.Types.ObjectId(),
													createdAt	: new Date(),
													services	: {
																	password: {
																		bcrypt: hash
																	},
													},
													username 	: username === 'EMAIL' ? emailId : mobNumber,
													profile 	: {
																	firstname	: req.body.firstname,
																	lastname  	: req.body.lastname,
																	fullName  	: req.body.firstname + ' ' + req.body.lastname,
																	email 	  	: emailId.toLowerCase(),
																	otpEmail    : emailOTP,
																	otpMobile	: mobileOTP,
																	mobile 		: req.body.mobNumber,
																	companyID 	: req.body.companyID,
																	companyName : req.body.companyName,
																	createdAt 	: new Date(),
																	status		: req.body.status ? req.body.status : "Block",
																	createdBy 	: req.body.createdBy,
																},
													roles 		: [role_lower]
												});
												if(!req.body.firstname) {
													user.profile.fullName = req.body.fullName;
												}
												user.save()
												.then(result => {
													if(result){
														if(req.body.emailValidation){
															request({
																"method"	: "POST",
																"url" 		: "http://localhost:" + globalVariable.port + "/send-email",
																"body" 		: 	{
																					email   : req.body.email,
																					subject : req.body.emailSubject,
																					text	: req.body.emailContent + " Your OTP is " + emailOTP,
																				},
																"json" 		: true,
																"headers" 	: 	{
																					"User-Agent": "Test Agent"
																				}
															})
															.then(source => {
																res.status(200).json({ message: "USER_CREATED", ID: result._id })
															})
															.catch(err => {
																console.log(err);
																res.status(500).json({
																	message: "Failed to Send OTP",
																	error: err
																});
															});
														}
														if(req.body.mobileValidation){
															axios.get('http://localhost:'+ globalVariable.port +'/api/globalmaster/get/sms_details')
															.then(smsDetails => {
																const client 		= new plivo.Client(smsDetails.data.authID, smsDetails.data.authToken);
												                const sourceMobile  = smsDetails.data.sourceMobile;
												                var text 			= mobileOTP+" is your OTP for online verification to your Pipito Account. OTP is valid for 24 hours and can be only used once."; 
												                client.messages.create(
												                    src=sourceMobile,
												                    dst=req.body.mobNumber,
												                    text=text
												                ).then((smsSend)=> {
																	res.status(200).json({ message: "USER_CREATED", ID: result._id })
												                })
														        .catch(err => {
														            console.log(err);
																	res.status(500).json({
																		message: "Failed to Send OTP",
																		error: err
																	});
														        });
															})
															.catch(err =>{
																console.log(err);
															})
														}
														if(!req.body.emailValidation && !req.body.mobileValidation){
															res.status(200).json({message: 'USER_CREATED',ID: result._id,})
														}
													}else{
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
							})
							.catch(err => {
								console.log(err);
								res.status(500).json({
									message: "Failed which finding the User",
									error: err
								});
							});
					} else {
						res.status(200).json({ message: "Role does not exits" });
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
		res.status(200).json({ message: username === 'EMAIL' ? "Email, pwd and role are mandatory": "Mobile number, pwd and role are mandatory"});
	}
};

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};