const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var ObjectID = require('mongodb').ObjectID;
var request = require('request-promise');
const User = require('../../coreAdmin/userManagement/ModelUsers.js');
const Role = require('../../coreAdmin/rolesManagement/ModelRoles.js');
const globalVariable = require("../../../nodemonConfig.js");


function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============ Account dashboard users API methods ============
exports.user_details = (req, res, next) => {
	var id = req.params.userID;
	// console.log("inside api:",id);
	User.findOne({ _id: id })
		// .select("profile")
		.exec()
		.then(users => {
			res.status(200).json(users);
			// res.status(200).json({
	  //           message : users
	  //       });
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};
// Handle delete contact
exports.delete_user = function (req, res, next) {
	User.findOne({ _id: req.params.userID })
		.exec()
		.then(user => {
			//console.log(user.roles);
			if (user) {
				if (user.roles.indexOf("ba") !== -1) {					
					BusinessAssociate.deleteOne({userID:req.params.userID})
					    .exec()
					    .then(data=>{
					        // res.status(200).json({
					        //     "message": "Business Associate Deleted Successfully."
					        // });
					    })
					    .catch(err =>{
					        console.log(err);
					        // res.status(500).json({
					        //     error: err
					        // });
					    });
				}
				User.deleteOne({ _id: req.params.userID }, function (err) {
					if (err) {
						return res.json({
							error: err
						});
					}
					res.json({
						status: "success",
						message: 'User is deleted!'
					});
				});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};

exports.update_user = (req, res, next) => {
	// console.log("inside user-update id:",req.params.userID);
	// console.log("firstname:",req.body.firstName);
	User.updateOne(
		{ _id: req.params.userID },
		{
			$set: {
				"profile.firstname": req.body.firstName,
				"profile.lastname" : req.body.lastName,
				"profile.fullName" : req.body.firstName + ' ' + req.body.lastName,
				"profile.email"    : req.body.emailId,
				"profile.mobile"   : req.body.mobileNumber,
			}
		}
	)
		.exec()
		.then(data => {

			if (data.nModified == 1) {

				res.status(200).json("User Updated");
			} else {
				res.status(401).json("User Not Found");
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};

exports.update_user_details = (req, res, next) => {
	var field = req.body.field;
	// console.log("inside update user");
	User.findOne({ _id: req.params.userID })
		.exec()
		.then(user => {
			if(user){
				// console.log(user);
				if (user.profile.email === req.body.emailId) {
					res.status(200).json({ message: "User already exist." });
				}else{

				}
				var pwd = user.services.password.bcrypt;
				switch (field) {
					case 'all':
						if (pwd) {
							bcrypt.compare(req.body.oldPassword, pwd, (err, result) => {
								if (result) {
									bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
										if (err) {
											return res.status(500).json({
												error: err
											});
										} else {
											User.updateOne(
												{ _id: req.params.userID },
												{
													$set: {
														"services": {
															"password": {
																"bcrypt": hash
															},
														},
														"profile.firstname": req.body.firstName,
														"profile.lastname": req.body.lastName,
														"profile.fullName": req.body.firstName + ' ' + req.body.lastName,
														"profile.email": req.body.emailId,
														"profile.mobile": req.body.mobileNumber,
													}
												}
											)
												.exec()
												.then(data => {
													// if (data.nModified == 1) {
														res.status(200).json({ message: "User details updated successfully." });
													// } else {
													// 	res.status(401).json({ message: "User Not Found" });
													// }
												})
												.catch(err => {
													console.log(err);
													res.status(500).json({
														error: err
													});
												});
										}
									})
								} else {
									res.status(200).json({ message: "Incorrect Password" });
								}

							})
						} else {
							res.status(401).json({ message: "Current password isn't valid." });
						}
						break;
					case 'email':
						if (pwd) {
							bcrypt.compare(req.body.oldPassword, pwd, (err, result) => {
								if (result) {
									bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
										if (err) {
											return res.status(500).json({
												error: err
											});
										} else {
											User.updateOne(
												{ _id: req.params.userID },
												{
													$set: {
														"profile.firstname": req.body.firstName,
														"profile.lastname": req.body.lastName,
														"profile.fullName": req.body.firstName + ' ' + req.body.lastName,
														"profile.email": req.body.emailId,
														"profile.mobile": req.body.mobileNumber,
													}
												}
											)
												.exec()
												.then(data => {
													// if (data.nModified == 1) {
														res.status(200).json({ message: "User details updated successfully." });
													// } else {
													// 	res.status(401).json({ message: "User Not Found" });
													// }
												})
												.catch(err => {
													console.log(err);
													res.status(500).json({
														error: err
													});
												});
										}
									})
								} else {
									res.status(401).json({
										message: "Current password isn't valid."
									});
								}

							})
						} else {
							res.status(401).json({ message: "Current password isn't valid." });
						}
						break;
					case 'password':
						if (pwd) {
							bcrypt.compare(req.body.oldPassword, pwd, (err, result) => {
								if (result) {
									bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
										if (err) {
											return res.status(500).json({
												error: err
											});
										} else {
											User.updateOne(
												{ _id: req.params.userID },
												{
													$set: {
														"services": {
															"password": {
																"bcrypt": hash
															},
														},
														"profile.firstname": req.body.firstName,
														"profile.lastname": req.body.lastName,
														"profile.mobile": req.body.mobileNumber,
														"profile.fullName": req.body.firstName + ' ' + req.body.lastName,
													}
												}
											)
												.exec()
												.then(data => {
													// if (data.nModified == 1) {
														res.status(200).json({ message: "User details updated successfully." });
													// } else {
													// 	res.status(401).json({ message: "User Not Found" });
													// }
												})
												.catch(err => {
													console.log(err);
													res.status(500).json({
														error: err
													});
												});
										}
									})
								} else {
									res.status(401).json({
										message: "Current password isn't valid."
									});
								}

							})
						} else {
							res.status(401).json({ message: "Current password isn't valid." });
						}
						break;
					case 'name':
						User.updateOne(
							{ _id: req.params.userID },
							{
								$set: {
									"profile.firstname": req.body.firstName,
									"profile.lastname": req.body.lastName,
									"profile.mobile": req.body.mobileNumber,
									"profile.fullName": req.body.firstName + ' ' + req.body.lastName,
								}
							}
						)
							.exec()
							.then(data => {
								// if (data.nModified == 1) {
									res.status(200).json({ message: "User details updated successfully." });
								// } else {
								// 	res.status(401).json({ message: "User Not Found" });
								// }
							})
							.catch(err => {
								console.log(err);
								res.status(500).json({
									error: err
								});
							});
						break;
				}

			} else {
				res.status(401).json({ message: "User Not found, Please contact admin." });
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};

exports.add_user_address = (req, res, next) => {
	// var roleData = req.body.role;
	// console.log("inside update user address",req.body);
	User.updateOne(
		{ "_id": req.body.user_ID, "deliveryAddress[0]._id": req.body.deliveryAddressID },
		{
			$push: {
				"deliveryAddress": [{
					"name": req.body.name,
					"email": req.body.email,
					"addressLine1": req.body.addressLine1,
					"addressLine2": req.body.addressLine2,
					"pincode": req.body.pincode,
					"block": req.body.block,
					"district" : req.body.district,
					"city": req.body.city,
					"stateCode": req.body.stateCode,
					"state": req.body.state,
					"countryCode": req.body.countryCode,
					"country": req.body.country,
					"mobileNumber": req.body.mobileNumber,
					"addType": req.body.addType
				}]
			}
		}
	)
		.exec()
		.then(data => {
			res.status(200).json({
				"message": "Address updated successfully."
				// "message" : data
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};
exports.add_delivery_address = (req, res, next) => {
	// console.log("inside add delivery req body:",req.body);
	User.updateOne(
		{ '_id': req.body.user_ID },
		{
			$push: {
				"deliveryAddress": [{
					"name": req.body.name,
					"email": req.body.email,
					"addressLine1": req.body.addressLine1,
					"addressLine2": req.body.addressLine2,
					"pincode": req.body.pincode,
					"block": req.body.block,
					"district" : req.body.district,
					"city": req.body.city,
					"stateCode": req.body.stateCode,
					"state": req.body.state,
					"countryCode": req.body.countryCode,
					"country": req.body.country,
					"mobileNumber": req.body.mobileNumber,
					"addType": ""
				}]
			}
		})
		.exec()
		.then(data => {
			if (data.nModified == 1) {
				res.status(200).json({
					"message": "Address added successfully."
				});
			} else {
				// console.log("data:" ,data);
				res.status(401).json({
					"message": "User Not Found"
				});
			}
		})
		.catch(error => {
			console.log("error:",error);
			res.status(500).json({
				error: error
			});
		})
};

exports.delete_delivery_address = (req, res, next) => {
	User.updateOne(
		{ '_id': req.body.user_ID },
		{
			$pull: { "deliveryAddress": { "_id": req.body.deliveryAddressID } }
		}
	)
		.exec()
		.then(data => {
			if (data.nModified == 1) {
				res.status(200).json({
					"message": "Address deleted successfully."
				});
			} else {
				res.status(401).json({
					"message": "User Not Found"
				});
			}
		})
		.catch(error => {
			console.log(error);
			res.status(500).json({
				error: error
			});
		})
};
//===================insert BA  ==================
exports.ba_signupadmin = (req, res, next) => {
	// console.log("Inside add ba");
	User.find()
		.exec()
		.then(user => {
			bcrypt.hash(req.body.pwd, 10, (err, hash) => {
				if (err) {
					return res.status(500).json({
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
						mobileNumber: req.body.mobileNumber,
						emails: [
							{
								address: req.body.emailId,
								verified: true
							}
						],
						profile: {
							firstName: req.body.companyName,
							lastName: req.body.companyName,
							fullName: req.body.companyName,
							emailId: req.body.emailId,
							mobileNumber: req.body.mobileNumber,
							status: req.body.status,
							// center_ID	  : req.body.center_ID,
							// centerName	  : req.body.centerName,
						},
						username: req.body.emailId,
						roles: (req.body.roles),

					});
					user.save()
						.then(newUser => {
							if (newUser) {
								res.status(200).json({
									message: "BA added successfully",
									user: newUser
								});

							}
						})
						.catch(err => {
							console.log(err);
							res.status(500).json({
								error: err
							});
						});
				}
			});

		})
};
//================ vendor signup ========================
exports.vendor_signup = (req, res, next) => {
	// console.log("inside vendor signup:", req.body);
	var mailSubject, mailText, smsText, NotificationData;
	// Masternotifications.findOne({ "templateType": "Email", "templateName": "Vendor New Registration" })
	// 	.exec()
	// 	.then((notificationData) => {
	// 		console.log("Notification response");
	// 		NotificationData = notificationData;
	// 		// mailSubject = maildata.subject;
	// 		// mailText = maildata.content
			
	// 	})
	// 	.catch(err => {
	// 		console.log(err);
	// 		res.status(500).json({
	// 			error: err
	// 		});
	// 	});

	// Masternotifications.findOne({ "templateType": "SMS", "templateName": "Vendor New Registration" })
	// 	.exec()
	// 	.then((smsdata) => {
	// 		var textcontent = smsdata.content;
	// 		var regex = new RegExp(/(<([^>]+)>)/ig);
	// 		var textcontent = smsdata.content.replace(regex, '');
	// 		textcontent = textcontent.replace(/\&nbsp;/g, '');
	// 		smsText = textcontent
	// 	})
	// 	.catch();
	User.find()
		.exec()
		.then(user => {
			bcrypt.hash(req.body.pwd, 10, (err, hash) => {
				if (err) {
					return res.status(500).json({
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
						mobileNumber: req.body.mobileNumber,
						emails: [
							{
								address: req.body.emailId,
								verified: true
							}
						],
						profile: {
							firstname: req.body.firstName,
							lastname : req.body.lastName,
							fullName : req.body.firstName + ' ' + req.body.lastName,
							email    : req.body.emailId,
							mobile   : req.body.mobileNumber,
							status   : req.body.status,
						},
						role: (req.body.roles),
						username: req.body.emailId,

					});
					user.save()
						.then(newUser => {
							if (newUser) {
								var variables = {
									"username"        : newUser.profile.email,
									"password"        : req.body.pwd,
								}
								// if(NotificationData){
								// 	var content = NotificationData.content;
								// 	if(content.indexOf('[') > -1 ){
								// 		var wordsplit = content.split('[');
								// 	}
					
								// 	var tokens = [];
								// 	var n = 0;
								// 	for(i=0;i<wordsplit.length;i++){
								// 		if(wordsplit[i].indexOf(']') > -1 ){
								// 			tokensArr = wordsplit[i].split(']');
								// 			tokens[n] = tokensArr[0];
								// 			n++;
								// 		}
								// 	}
								// 	var numOfVar = Object.keys(variables).length;
					
								// 	for(i=0; i<numOfVar; i++){
								// 		var tokVar = tokens[i].substr(1,tokens[i].length-2);
								// 		content = content.replace(tokens[i],variables[tokens[i]]);
								// 	}
								// 	content = content.split("[").join("'");
								// 	content = content.split("]").join("'");
								// 	// console.log("content = ",content);
								// 	var tData={
								// 		content:content,
								// 		subject:NotificationData.subject
								// 	}
								// 	mailSubject = NotificationData.subject;
								// 	mailText = content 
								// }//NotificationData

								// request({
								// 	"method": "POST",
								// 	"url": "http://localhost:" + gloabalVariable.PORT + "/send-email",
								// 	"body": {
								// 		"email": newUser.profile.email,
								// 		"subject": mailSubject,
								// 		"text": "Submitted",
								// 		"mail": 'Hello ' + newUser.profile.fullName + ',' + '\n' + "\n <br><br>" + mailText + "<b> </b>" + '\n' + '\n' + ' </b><br><br>\nRegards,<br>Team AnasHandicraft',
								// 	},
								// 	"json": true,
								// 	"headers": {
								// 		"User-Agent": "Test App"
								// 	}
								// })
								// .then((sentemail) => {
								// 	res.header("Access-Control-Allow-Origin", "*");

								// 	res.status(200).json({
								// 		"message": 'NEW-USER-CREATED',
								// 		"user_id": newUser._id,
								// 	});
								// })
								// .catch((err) => {
								// 	res.status(500).json({
								// 		error: err
								// 	});
								// });

								
							}
							res.status(200).json({
								"message": 'NEW-USER-CREATED',
								"user_id": newUser._id,
							});
						})
						.catch(err => {
							console.log("error while creating vendor:",err);
							res.status(500).json({
								error: err
							});
						});
				}
			});

		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};