const mongoose			= require("mongoose");
const bcrypt			= require("bcryptjs");
const jwt				= require("jsonwebtoken");
var ObjectID 			= require('mongodb').ObjectID;
var request         	= require('request-promise');
const User 				= require('./ModelUsers.js');
const globalVariable 	= require("../../../nodemonConfig.js");

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.user_signup_admin = (req,res,next)=>{
	if(req.body.email && req.body.pwd){
		User.find({emails:{$elemMatch:{address:req.body.email}}})
			.exec()
			.then(user =>{
				if(user.length > 0){
					return res.status(409).json({
						message: 'Email Id already exits.'
					});
				}else{
					bcrypt.hash(req.body.pwd,10,(err,hash)=>{
						if(err){
							return res.status(500).json({
								error:err
							});
						}else{
							const user = new User({
											_id			: new mongoose.Types.ObjectId(),
											createdAt	: new Date,
											services	: {
												password:{
															bcrypt:hash
															
														},
											},
											username	: req.body.email,
											emails		: [
													{
														address  : req.body.email,
														verified : true 
													}
											],
											profile		:
													{
														firstname     : req.body.firstname,
														lastname      : req.body.lastname,
														fullName      : req.body.firstname+' '+req.body.lastname,
														emailId       : req.body.email,
														mobile        : req.body.mobile ? req.body.mobile : '',
														createdOn     : new Date(),
														status		  : 'active',
													},
											roles 		: [req.body.role]
							});	
							if(!req.body.firstname){
								user.profile.fullName = req.body.fullName;
							}
							user.save()
								.then(result =>{
									res.status(201).json({
										message	: 'USER_CREATED',
										ID 		: result._id,
									})
								})
								.catch(err =>{
									res.status(500).json({
										error: err
									});
								});
						}			
					});
				}
			})
			.catch(err =>{
				res.status(500).json({
					error: err
				});
			});
	}else{
		res.status(200).json({message:"Email and pwd are mandatory"});
	}
};

// exports.user_signup_user = (req,res,next)=>{
// 	console.log("user_signup_user req.body = ", req.body);
// 	if(req.body.role && req.body.email && req.body.pwd){
// 		User.find({emails:{$elemMatch:{address:req.body.email}}})
// 			.exec()
// 			.then(user =>{
// 				if(user.length > 0){
// 					return res.status(409).json({
// 						message: 'Email Id already exits.'
// 					});
// 				}else{
// 					bcrypt.hash(req.body.pwd,10,(err,hash)=>{
// 						if(err){
// 							return res.status(500).json({
// 								error:err
// 							});
// 						}else{
// 							const user = new User({
// 											_id: new mongoose.Types.ObjectId(),
// 											createdAt	: new Date,
// 											createdBy   : req.body.createdBy,
// 											services	: {
// 												password:{
// 															bcrypt:hash															
// 														},
// 											},
// 											username	: req.body.email,
// 											emails		: [
// 													{
// 														address  : req.body.email,
// 														verified : true 
// 													}
// 											],
// 											profile		:
// 													{
// 														firstname     : req.body.firstname,
// 														lastname      : req.body.lastname,
// 														fullName      : req.body.firstname+' '+req.body.lastname,
// 														emailId       : req.body.email,
// 														mobNumber     : req.body.mobNumber,
// 														createdOn     : new Date(),
// 														status		  : req.body.status,
// 													},
// 											roles 		: [req.body.role]
// 							});	
// 							if(!req.body.firstname){
// 								user.profile.fullName = req.body.fullName;
// 							}
// 							user.save()
// 								.then(result =>{
// 									res.status(201).json({
// 										message	: 'User created',
// 										ID 		: result._id,
// 									})
// 								})
// 								.catch(err =>{
// 									res.status(500).json({
// 										error: err
// 									});
// 								});
// 						}			
// 					});
// 				}
// 			})
// 			.catch(err =>{
// 				res.status(500).json({
// 					error: err


// 				});
// 			});
// 	}else{
// 		res.status(200).json({message:"Email , pwd and Role are mandatory"});
// 	}
// };

exports.user_signup_user_email_otp = (req,res,next)=>{
	if(req.body.role && req.body.email && req.body.pwd){
		User.find({emails:{$elemMatch:{address:req.body.email}}})
			.exec()
			.then(user =>{
				if(user.length > 0){
					return res.status(409).json({
						message: 'Email Id already exits.'
					});
				}else{
					bcrypt.hash(req.body.pwd,10,(err,hash)=>{
						if(err){
							return res.status(500).json({
								error:err
							});
						}else{
							User.find({"roles":"user"})
								.count()
								.exec()
								.then(countuser=>{
									var emailOTP = getRandomInt(1000,9999);
									if(emailOTP){
										const user = new User({
														_id: new mongoose.Types.ObjectId(),
														createdAt	: new Date,
														createdBy   : req.body.createdBy,
														services	: {
															password:{
																		bcrypt:hash
																		
																	},
														},
														username	: req.body.email,
														emails		: [
																{
																	address  : req.body.email,
																	verified : true 
																}
														],
														profile		:
																{
																	firstname     : req.body.firstname,
																	lastname      : req.body.lastname,
																	fullName      : req.body.firstname+' '+req.body.lastname,
																	emailId       : req.body.email,
																	mobNumber     : req.body.mobNumber,
																	createdOn     : new Date(),
																	optEmail 	  : emailOTP,
																	status		  : req.body.status,
																	clientId 	  : "WL"+(countuser+1)
																},
														roles 		: [req.body.role]
										});	
										if(!req.body.firstname){
											user.profile.fullName = req.body.fullName;
										}
										user.save()
											.then(result =>{
												if(result){
													request({
											                "method"    : "POST", 
											                "url"       : "http://localhost:"+globalVariable.port+"/send-email",
											                "body"      : {
											                					email 	: req.body.email, 
											                					subject : "Successfully Creation of your Account on Pipito",
											                					text    : "Dear "+result.profile.fullName+"Your OTP is "+ emailOTP, 
											                			   },
											                "json"      : true,
											                "headers"   : {
											                                "User-Agent": "Test Agent"
											                            }
											            })
											            .then(source=>{
											            	res.status(201).json({message:"USER__CREATED",ID:result._id})
											            })
											    		.catch(err =>{
															res.status(500).json({
																error: err
															});
														});        
												}else{
													res.status(200).json({message:"USER_NOT_CREATED"})
												}
											})
											.catch(err =>{
												res.status(500).json({
													error: err
												});
											});
									}		
								})
								.catch(err =>{
									res.status(500).json({
										error: err
									});
								})
						}			
					});
				}
			})
			.catch(err =>{
				res.status(500).json({
					error: err
				});
			});
	}else{
		res.status(200).json({message:"Email , pwd and Role are mandatory"});
	}
};

exports.user_login = (req,res,next) =>{
	// console.log("Inside user_login");
	User.findOne({emails:{$elemMatch:{address:req.body.email}}})
		.exec()
		.then(user => {
			if(user){
				var pwd = user.services.password.bcrypt;
				if(pwd){
					bcrypt.compare(req.body.password,pwd,(err,result)=>{
						if(err || !result){
							return res.status(401).json({
								message: 'Auth failed'
							});		
						}
						if(result){ 
							const token = jwt.sign({
								email 	: req.body.email,
								userId	:  user._id ,
							},globalVariable.JWT_KEY,
							{
								expiresIn: "365d"
							}
							);
							User.updateOne(
									{ emails:{$elemMatch:{address:req.body.email}}},
									{
										$push : {
											"services.resume.loginTokens" : {
													loginTimeStamp: new Date(),
													hashedToken : token,
													logoutTimeStamp : null
												}
										}
									}
								)
								.exec()
								.then(updateUser=>{
									if(updateUser.nModified == 1){
										//===========================================================
										//====  Change Done by Ashish Naik ==========================
										// After login, send Company ID and Location ID of User
										// So at the time of creation of User, we must have 
										// companyID & locationID available for each user.
										// From Org-Setting form, we can get these things for Admin. 
										// We need to check into Entity master 
										// where CompanyID & LocID are available
										//===========================================================

										const companyID = '';
										const locID = '';
										if(user.companyID){
											companyID = user.companyID;
										}else{
											companyID = 0;
										}

										if(user.locID){
											locID = user.locID;
										}else{
											locID = 0;
										}

										res.status(200).json({
													message	: 'Auth successful',
													token	: token,
													ID 		: user._id,
													companyID : companyID,
													locID : locID,
										});	
										
									}else{
										return res.status(401).json({
												message: 'Auth failed'
											});
									}
								})
								.catch(err=>{
									res.status(500).json(err);
								});	
						}
					})
				}else{
                    res.status(409).status({message:"Password not found"}); 
				}
			}else{
                res.status(409).status({message:"User Not found"});
			}			
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};

exports.admin_login = (req,res,next) =>{
	User.findOne({
					emails	: {$elemMatch:{address:req.body.email}},
					roles   : ["admin"]
				})
		.exec()
		.then(user => {
			if(user != null && user != undefined){
				var pwd = user.services.password.bcrypt;
				if(pwd){
					bcrypt.compare(req.body.password,pwd,(err,result)=>{
						if(err || !result){
							return res.status(401).json({
								message: 'Auth failed'
							});		
						}
						if(result){ 
							const token = jwt.sign({
								email 	: req.body.email,
								userId	:  user._id ,
							},globalVariable.JWT_KEY,
							{
								expiresIn: "1h"
							}
							);
							User.updateOne(
									{ emails:{$elemMatch:{address:req.body.email}}},
									{
										$push : {
											"services.resume.loginTokens" : {
													loginTimeStamp: new Date(),
													hashedToken : token,
													logoutTimeStamp : null
												}
										}
									}
								)
								.exec()
								.then(updateUser=>{
									if(updateUser.nModified == 1){
										//===========================================================
										//====  Change Done by Ashish Naik ==========================
										// After login, send Company ID and Location ID of User
										// So at the time of creation of User, we must have 
										// companyID & locationID available for each user.
										// From Org-Setting form, we can get these things for Admin. 
										// We need to check into Entity master 
										// where CompanyID & LocID are available
										//===========================================================

										const companyID = '';
										const locID = '';
										if(user.companyID){
											companyID = user.companyID;
										}else{
											companyID = 0;
										}

										if(user.locID){
											locID = user.locID;
										}else{
											locID = 0;
										}


										res.status(200).json({
												message	: 'Auth successful',
												token	: token,
												ID 		: user._id,
												companyID : companyID,
												locID : locID													
										});	
									}else{
										return res.status(401).json({
												message: 'Auth failed'
											});
									}
								})
								.catch(err=>{									
									res.status(500).json(err);
								});	
						}
					})
				}else{
          res.status(409).status({message:"Password not found"}); 
				}
			}else{
        res.status(409).status({message:"User Not found Or User is not a admin"});
			}			
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};


exports.user_update_name_mobile = (req,res,next)=>{
	User.findOne({_id:req.params.ID})
		.exec()
		.then(user=>{
			if(user){
				User.updateOne(
					{_id:req.params.ID},
					{
						$set:{
							"profile.firstname"     : req.body.firstname,
							"profile.lastname"      : req.body.lastname,
							"profile.fullName"      : req.body.firstname+' '+req.body.lastname,
							"profile.mobile"     	: req.body.mobNumber,
							"profile.image"     	: req.body.image,
						},
					}
				)
				.exec()
				.then(data=>{
					if(data.nModified == 1){
						res.status(200).json("USER_UPDATED");
					}else{
                        res.status(200).json({ 
                            updated : false, 
                            "message"    : "USER_NOT_UPDATED", 
                        });
						// res.status(401).status("USER_NOT_UPDATED")
					}
				})
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(404).json("User Not Found");
			}
		})
		.catch(err=>{
			res.status(500).json({
				error:err
			});
		});
};

exports.user_update_status = (req,res,next)=>{
	User.findOne({_id:req.params.ID})
		.exec()
		.then(user=>{
			if(user){
				User.updateOne(
					{_id:req.params.ID},
					{
						$set:{
							"profile.status"     : req.body.status,
						},
					}
				)
				.exec() 
		        .then(data=>{
		            if(data.nModified == 1){
		                User.updateOne(
							{_id:req.params.ID},
							{
			                    $push:  { 'statusLog' : [{  
														status         : req.body.status,
														updatedAt      : new Date(),
														updatedBy      : req.body.username 
			                                            }] 
			                            }
			                })
		                .exec()
		                .then(data=>{
							res.status(200).json("USER_STATUS_UPDATED");
		                })
		            }else{
						res.status(200).json("USER_STATUS_NOT_UPDATED")
		            }
		        })
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(200).json("User Not Found");
			}
		})
		.catch(err=>{
			res.status(500).json({
				error:err
			});
		});
};

exports.user_update_delete_status = (req,res,next)=>{
	// console.log("req.body.user_id_tobedeleted==>",req.body.user_id_tobedeleted);
	User.findOne({_id:req.body.user_id_tobedeleted})
		.exec()
		.then(user=>{
			if(user){
				// console.log("req.user==>",user);
				var newstatus = "";
				if(user.profile.status === 'active'){
					newstatus = 'deleted-active';
				}
				if(user.profile.status === 'blocked'){
					newstatus = 'deleted-blocked';
				}
				User.updateOne(
					{_id:req.body.user_id_tobedeleted},
					{
						$set:{
							"profile.status" : newstatus,
						},
					}
				)
				.exec() 
		        .then(data=>{
					// console.log("RESPONSE.data==>",data);
		            if(data.nModified == 1){
		                User.updateOne(
							{_id:req.body.user_id_tobedeleted},
							{
			                    $push:  { 'statusLog' : [{  
			                    							status         : newstatus,
			                    							updatedAt      : new Date(),
			                                                updatedBy      : req.body.updatedBy,
			                                            }] 
			                            }
			                })
		                .exec()
		                .then(data=>{
							res.status(200).json("USER_SOFT_DELETED");
		                })
		            }else{
						res.status(200).json("USER_NOT_DELETED")
		            }
		        })
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(200).json("User Not Found");
			}
		})
		.catch(err=>{
			res.status(500).json({
				error:err
			});
		});
};

exports.user_update_recover_status = (req,res,next)=>{
	User.findOne({_id:req.body.user_id_toberecover})
		.exec()
		.then(user=>{
			if(user){
				var newstatus = "";
				if(user.profile.status === 'deleted-active'){
					newstatus = 'active';
				}
				if(user.profile.status === 'deleted-blocked'){
					newstatus = 'blocked';
				}
				User.updateOne(
					{_id:req.body.user_id_toberecover},
					{
						$set:{
							"profile.status" : newstatus,
						},
					}
				)
				.exec() 
		        .then(data=>{
		            if(data.nModified == 1){
		                User.updateOne(
							{_id:req.body.user_id_toberecover},
							{
			                    $push:  { 'statusLog' : [{  
			                    							status         : newstatus,
			                    							updatedAt      : new Date(),
			                                                updatedBy      : req.body.updatedBy,
			                                            }] 
			                            }
			                })
		                .exec()
		                .then(data=>{
							res.status(200).json("USER_SOFT_DELETED");
		                })
		            }else{
						res.status(200).json("USER_NOT_DELETED")
		            }
		        })
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(200).json("User Not Found");
			}
		})
		.catch(err=>{
			res.status(500).json({
				error:err
			});
		});
};

exports.user_update_many_status = (req,res,next)=>{
	var userID = req.body.userID.map((a,i)=>ObjectID(a));
	User.updateMany(
		{"_id": { "$in": userID }},
		{
			$set:{
				"profile.status"     : req.body.status,
			},
		}
	)
	.exec()
	.then(data=>{
        if(data.nModified == 1){
            User.updateOne(
				{"_id": { "$in": userID }},
				{
                    $push:  { 'statusLog' : [{  
	                							status         : req.body.status,
	                							updatedAt      : new Date(),
	                                            updatedBy      : req.body.username 
	                                        }] 
                            }
                })
            .exec()
            .then(data=>{
				res.status(200).json("USER_STATUS_UPDATED");
            })
        }else{
			res.status(200).json("USER_STATUS_NOT_UPDATED")
        }
    })
	.catch(err =>{
		res.status(500).json({
			error: err
		});
	});
};

exports.user_update_role = (req,res,next)=>{
	switch(req.params.action){
		case 'assign' :
				User.findOne({"_id":req.params.ID, "roles": req.body.role})
				.exec()
				.then(data=>{
						if(data){
							res.status(200).json("USER_ROLE_ASSIGNED");
						}else{
							User.updateOne(
								{_id:req.params.ID},
								{
									$push:{
										roles : req.body.role
									}
								}
							)
							.exec()
							.then(data=>{
								if(data.nModified == 1){
									res.status(200).json("USER_ROLE_ASSIGNED");
								}else{
									res.status(401).json("USER_ROLE_NOT_ASSIGNED");
								}
							})
							.catch(err =>{
								res.status(500).json({
									error: err
								});
							});
						}
					})
					.catch(err =>{
						res.status(500).json({
							error: err
						});
					});
			break;
		case 'remove' :
				User.findOne({"_id":req.params.ID})
				.exec()
				.then(data=>{
						if(data.roles.length==1){
							res.status(200).json("USER_ROLE_ASSIGNED");
						}else{
						User.updateOne(
							{_id:req.params.ID},
							{
								$pull:{
									roles : req.body.role
								}
							}
						)
						.exec()
						.then(data=>{
							if(data.nModified == 1){
								res.status(200).json("USER_ROLE_REMOVED");
							}else{
								res.status(401).json("USER_ROLE_NOT_REMOVED");
							}
						})
						.catch(err =>{
							res.status(500).json({
								error: err
							});
						});
					}
				})
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
			break;
		default :
			res.status(200).json({message:"INVALID_ACTION"})
	}
};

exports.user_update_password_ID = (req,res,next)=>{
	User.findOne({_id:req.params.ID})
		.exec()
		.then(user=>{
			if(user){
				bcrypt.hash(req.body.pwd,10,(err,hash)=>{
				    User.updateOne(
				        {_id:req.params.ID},  
				        {
				            $set:{
								services: {
									password: {
										bcrypt:hash
									},
								},
							}			
				        }
				    )
				    .exec()
				    .then(data=>{
				        if(data.nModified == 1){
				            res.status(200).json("PASSWORD_RESET");
				        }else{
				            res.status(401).json("PASSWORD_NOT_RESET");
				        }
				    })
				    .catch(err =>{
				        res.status(500).json({
				            error: err
				        });
					});
				});
			}else{
				res.status(404).json("User Not Found");
			}
		})
		.catch(err=>{
			res.status(500).json({
				error:err
			});
		});
};

exports.fetch_user_ID = (req,res,next)=>{
	User.findOne({_id:req.params.ID})
		// .select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.image profile.clientId createdAt services.resume.loginTokens statusLog")

		// .select("profile.firstname profile.lastname profile.status profile.fullName roles profile.email profile.mobile profile.image")
		.exec()
		.then(data=>{
			if(data){
				// console.log('userdata',data);
				var loginTokenscount = data.services.resume.loginTokens.length;
				var statuslogLength = data.statusLog.length;
				// console.log('loginTokenscount',loginTokenscount,"statuslogLength",statuslogLength);

				res.status(200).json({
					"_id"			: data._id,
					"firstname" 	: data.profile.firstname,
					"middlename" 	: data.profile.middlename,
					"lastname"		: data.profile.lastname,
					"companyID"		: data.profile.companyID,
					"companyName"	: data.profile.companyName,
					"deliveryAddress"	: data.deliveryAddress,
					"email"			: data.profile.email, //Mandatory 
					"mobile" 		: data.profile.mobile,
					"role"      	: data.roles, //Mandatory
					"image" 		: data.profile.image,
					"status"		: data.profile.status, //Either "Active" or "Inactive"
					"fullName"		: data.profile.fullName,
					"createdAt" 	: data.createdAt,
					"logDetails"	: loginTokenscount > 0 ? data.services.resume.loginTokens: "-",
				});
			}else{
				res.status(200).json({message:"USER_NOT_FOUND"});
			}
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};

exports.post_list_deleted_users = (req,res,next)=>{
	var companyID= parseInt(req.body.companyID);
	// console.log("req.body==>",req.body);
	if(req.body.companyID){
		if(companyID === 1){
			// var selector = {roles:{$ne:["admin"]}};
			var selector = {roles:{$ne:["admin"]}, "profile.status":{$ne:"active"}};
		}else{
			var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
		}
		// console.log("selector==>",selector);
		User.find(selector)
			.select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog")
			.sort({createdAt : -1})
			.skip(req.body.startRange)
			.limit(req.body.limitRange)
			.exec()
			.then(data=>{
				if(data){
					var i = 0;
					var returnData = [];
					for(i = 0 ; i < data.length ; i++){
						var loginTokenscount = data[i].services.resume.loginTokens.length 
						// console.log('data in services.resume.loginTokens ==>',data[i].services.resume.loginTokens);
						var statuslogLength = data[i].statusLog.length
						returnData.push({
							"_id"		      : data[i]._id,
							"firstname"       : data[i].profile.firstname,
							"lastname"	      : data[i].profile.lastname,
							"companyID"	      : data[i].profile.companyID,
							"companyName"	  : data[i].profile.companyName,
							"email"		      : data[i].profile.email, //Mandatory 
							"mobNumber"       : data[i].profile.mobile,
							"role"            : data[i].roles, //Mandatory
							"status"		  : data[i].profile.status, //Either "Active" or "Inactive"
							"fullName"	      : data[i].profile.fullName,
							"createdAt"       : data[i].createdAt,
							"clientId"	      : data[i].clientId,
							"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : "-",
							"statusupdatedAt" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedAt : "-",
							"statusupdatedBy" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedBy : "-"

						});
					}
					if( i >= data.length){
						res.status(200).json(returnData);
						// console.log('returnData',returnData);
					}
				}else{
					res.status(200).json({message:"USER_NOT_FOUND"});
				}
			})
			.catch(err =>{
				res.status(500).json({
					error: err
				});
			});
	} //end of if condition
	else{
		res.status(500).json({
			message : "COMPANYID_NOT_AVAILABLE",
			error: err
		});
	}
};

exports.post_list_users = (req,res,next)=>{
	var companyID= req.body.companyID;
	var startRange= req.body.startRange;
	var limitRange= req.body.limitRange;
	console.log("req.body",req.body)
	// console.log("=====================req==================",req.body,startRange,limitRange);
	if(req.body.companyID){
		if(companyID === 1){
			// var selector = {roles:{$ne:["admin"]}, "profile.status":{$ne:"deleted-active"}};
			var selector = {"profile.status":{$ne:"deleted-active"}};
			// console.log("selector",selector);

		}else{
			// var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
			var selector = {"profile.companyID":companyID};
		}
		User.find(selector)
			// .select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog")
			.sort({createdAt : -1})
			.skip(startRange)
			.limit(limitRange)
			.exec()
			.then(data=>{
				if(data){
					// console.log("--------------data----------",data);
					var i = 0;
					var returnData = [];
					for(i = 0 ; i < data.length ; i++){
						// console.log('data in post ==>',data[i].profile);
						var loginTokenscount = data[i].services.resume.loginTokens.length;
						// console.log('data in services.resume.loginTokens ==>',loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null );
						var statuslogLength = data[i].statusLog.length
						returnData.push({
							"_id"		      : data[i]._id,
							"firstname"       : data[i].profile.firstname,
							"lastname"	      : data[i].profile.lastname,
							"companyID"	      : data[i].profile.companyID,
							"companyName"	  : data[i].profile.companyName,
							"workLocation"	  : data[i].profile.workLocation,
							"email"		      : data[i].profile.email, //Mandatory 
							"mobNumber"       : data[i].profile.mobile,
							"role"            : data[i].roles, //Mandatory
							"status"		  : data[i].profile.status, //Either "Active" or "Inactive"
							"fullName"	      : data[i].profile.fullName,
							"createdAt"       : data[i].createdAt,
							"clientId"	      : data[i].clientId,
							"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
							"statusupdatedAt" : statuslogLength  > 0 ? data[i].statusLog[statuslogLength-1].updatedAt : "-",
							"statusupdatedBy" : statuslogLength  > 0 ? data[i].statusLog[statuslogLength-1].updatedBy : "-"

						});
					}
					if( i >= data.length){
						// console.log('returnData=============>',returnData);
						res.status(200).json(returnData);
					}
				}else{
					res.status(200).json({message:"USER_NOT_FOUND"});
				}
			})
			.catch(err =>{
				res.status(500).json({
					error: err
				});
			});
	} //end of if condition
	else{
		res.status(500).json({
			message : "COMPANYID_NOT_AVAILABLE",
			error: err
		});
	}
};

exports.fetch_users_Companies = (req,res,next)=>{
	
	User.find({"profile.companyName":req.params.company})
		.select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens")
		.sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
		.exec()
		.then(data=>{
			if(data){
				var i = 0;
				var returnData = [];
				for(i = 0 ; i < data.length ; i++){
					var loginTokenscount = data[i].services.resume.loginTokens.length 
					returnData.push({
										"_id"		: data[i]._id,
										"firstname" : data[i].profile.firstname,
										"lastname"	: data[i].profile.lastname,
										"companyID"	: data[i].profile.companyID,
										"companyName" : data[i].profile.companyName,
										"email"		: data[i].profile.email, //Mandatory 
										"mobNumber" : data[i].profile.mobile,
										"role"      : data[i].roles, //Mandatory
										"status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
										"fullName"	: data[i].profile.fullName,
										"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
									});
					// console.log("returnData==>",returnData);
				}
				if( i >= data.length){
					res.status(200).json(returnData);
				}
			}else{
				res.status(200).json({message:"USER_NOT_FOUND"});
			}
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};

exports.fetch_users_roles = (req,res,next)=>{
	// console.log("inside fetch_users_roles");
	User.find({roles:req.params.role})
		// .select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens")
		.sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
		.exec()
		.then(data=>{
			// console.log("roles data",data);
			if(data){
				var i = 0;
				var returnData = [];
				for(i = 0 ; i < data.length ; i++){
					var loginTokenscount = data[i].services.resume.loginTokens.length 
					returnData.push({
										"_id"		: data[i]._id,
										"firstname" : data[i].profile.firstname,
										"lastname"	: data[i].profile.lastname,
										"companyID"	: data[i].profile.companyID,
										"companyName" : data[i].profile.companyName,
										"email"		: data[i].profile.email, //Mandatory 
										"mobNumber" : data[i].profile.mobile,
										"role"      : data[i].roles, //Mandatory
										"createdAt" : data[i].createdAt,
										"status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
										"fullName"	: data[i].profile.fullName,
										"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
									});
					// console.log("returnData==>",returnData);
				}
				if( i >= data.length){
					res.status(200).json(returnData);
				}
			}else{
				res.status(200).json({message:"USER_NOT_FOUND"});
			}
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};

exports.fetch_users_status = (req,res,next)=>{
	// User.find({"profile.status":req.params.status})
	var companyID= parseInt(req.body.companyID);
	var status   = req.params.status;
	// console.log("req.body==>",req.body);
	if(req.body.companyID){
		if(companyID === 1){
			var selector = {roles:{$ne:["admin"]}};
		}else{
			var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
		}
		// console.log("selector==>",selector);
		// console.log("req.params.status==>",status);
		// User.find({"profile.status":status})
		User.aggregate([
			{$match:selector},
			{$match:{"profile.status": {$nin:["deleted-active","deleted-blocked" ]}}},
			{$match:{"profile.status":status}},
		])
		// .select("profile.firstname profile.lastname profile.status profile.companyID profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens")
		.sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
		.exec()
		.then(data=>{
			// console.log('data',data);
			if(data){
				var i = 0;
				var returnData = [];
				for(i = 0 ; i < data.length ; i++){
					var loginTokenscount = data[i].services.resume.loginTokens.length 
					returnData.push({
										"_id"		: data[i]._id,
										"firstname" : data[i].profile.firstname,
										"lastname"	: data[i].profile.lastname,
										"companyID"	: data[i].profile.companyID,
										"companyName" : data[i].profile.companyName,
										"email"		: data[i].profile.email, //Mandatory 
										"mobNumber" : data[i].profile.mobile,
										"role"      : data[i].roles, //Mandatory
										// "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
										"status"	: data[i].profile.status, //Either "Active" or "Inactive"
										"fullName"	: data[i].profile.fullName,
										"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
									});
				}
				if( i >= data.length){
					res.status(200).json(returnData);
				}
			}else{
				res.status(200).json({message:"USER_NOT_FOUND"});
			}
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
	}
};

exports.fetch_users_status_roles = (req,res,next)=>{
	// User.find({"roles":req.params.role,"profile.status":req.params.status})
	// 	.select("profile.firstname profile.lastname profile.status profile.companyID profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens")
	var companyID= parseInt(req.body.companyID);
	var status   = req.params.status;
	var role   = req.params.role;
	// console.log("req.body==>",req.body);
	if(req.body.companyID){
		if(companyID === 1){
			var selector = {roles:{$ne:["admin"]}};
		}else{
			var selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
		}
		// console.log("selector==>",selector);
		User.aggregate([
			{$match:selector},
			{$match:{"profile.status": {$nin:["deleted-active","deleted-blocked" ]}}},
			{$match:{"profile.status":status,"roles":role}},
		])
		.sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
		.exec()
		.then(data=>{
			// console.log('data in role status==>>',data);
			if(data){
				var i = 0;
				var returnData = [];
				for(i = 0 ; i < data.length ; i++){
					var loginTokenscount = data[i].services.resume.loginTokens.length 
					returnData.push({
										"_id"		: data[i]._id,
										"firstname" : data[i].profile.firstname,
										"lastname"	: data[i].profile.lastname,
										"companyID"	: data[i].profile.companyID,
										"companyName" : data[i].profile.companyName,
										"email"		: data[i].profile.email, //Mandatory 
										"mobNumber" : data[i].profile.mobile,
										"role"      : data[i].roles, //Mandatory
										// "status"	: ((data[i].profile.status ==="active") && (data[i].profile.status !=="deleted"))  ? '<span class="label label-success statusLabel">'+data[i].profile.status+"</span>" : '<span class="label label-default statusLabel">'+data[i].profile.status+"</span>" , //Either "Active" or "Inactive"
										"status"	: data[i].profile.status, //Either "Active" or "Inactive"
										"fullName"	: data[i].profile.fullName,
										"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
									});
				}
				if( i >= data.length){
					res.status(200).json(returnData);
					// console.log('returnData================	',returnData);
				}
			}else{
				res.status(200).json({message:"USER_NOT_FOUND"});
			}
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
	}
};

exports.delete_user_ID = (req,res,next)=>{
	User.deleteOne({_id:req.params.ID})
		.exec()
		.then(data=>{
			
			if(data.deletedCount === 1){
				res.status(200).json({message:"USER_DELETED"});
			}else{
				res.status(200).json({message:"USER_NOT_DELETED"});
			}
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};

exports.check_EmailOTP = (req,res,next)=>{
	User.find({_id : req.params.ID, "profile.optEmail" : req.params.emailotp})
		.exec()
		.then(data=>{
			if(data.length > 0){
				User.updateOne(
							{_id : req.params.ID}, 
							{
								$set:{
									"profile.optEmail" : 0
								}
							}
					)
				    .exec()
				    .then(data=>{
				    	if(data.nModified === 1){
							res.status(200).json({message:"SUCCESS"});
				    	}else{
							res.status(200).json({message:"SUCCESS_OTP_NOT_RESET"});    		
				    	}
				    })
				    .catch(err =>{
						res.status(500).json({
							error: err
						});
					})
			}else{
				res.status(200).json({message:"FAILED"});
			}
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});		
};

exports.update_email_otp = (req,res,next) =>{
	var optEmail = getRandomInt(1000,9999);
	User.updateOne(
					{_id:req.params.ID},
					{
						$set:{
							"profile.optEmail"     : optEmail,
						},
					}
				)
				.exec()
				.then(data=>{
					if(data.nModified == 1){
						request({
					                "method"    : "POST", 
					                "url"       : "http://localhost:"+globalVariable.port+"/send-email",
					                "body"      : {
					                					email 	: req.body.email, 
					                					subject : "Pipito OTP",
					                					text    : "Pipito updated OTP is "+ optEmail, 
					                			   },
					                "json"      : true,
					                "headers"   : {
					                                "User-Agent": "Test Agent"
					                            }
					            })
					            .then(source=>{
					            	res.status(201).json({message:"OTP_UPDATED"})
					            })
					    		.catch(err =>{
									res.status(500).json({
										error: err
									});
								});
					}else{
						res.status(401).status("USER_NOT_UPDATED")
					}
				})
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
};

exports.update_email_otp_email = (req,res,next) =>{
	var optEmail = getRandomInt(1000,9999);
	User.updateOne(
					{_username:req.body.emailId},
					{
						$set:{
							"profile.optEmail"     : optEmail,
						},
					}
				)
				.exec()
				.then(data=>{
					if(data.nModified == 1){
						request({
					                "method"    : "POST", 
					                "url"       : "http://localhost:"+globalVariable.port+"/send-email",
					                "body"      : {
					                					email 	: req.body.emailId, 
					                					subject : "Pipito OTP",
					                					text    : "Pipito updated OTP is "+ optEmail, 
					                			   },
					                "json"      : true,
					                "headers"   : {
					                                "User-Agent": "Test Agent"
					                            }
					            })
					            .then(source=>{
					            	res.status(201).json({message:"OTP_UPDATED"})
					            })
					    		.catch(err =>{
									res.status(500).json({
										error: err
									});
								});
					}else{
						res.status(401).status("USER_NOT_UPDATED")
					}
				})
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
};

exports.change_password_email_verify = (req,res,next)=>{
	User.findOne({username : req.body.emailId})
		.exec()
		.then(data=>{
			if(data){
				request({
			                "method"    : "PATCH", 
			                "url"       : "http://localhost:"+globalVariable.port+"/api/users/patch/optEmail/"+data._id,
			                "body"		: {email : data.username},
			                "json"      : true,
			                "headers"   : {
			                                "User-Agent": "Test Agent"
			                            }
			            })
			            .then(source=>{
			            	if(source.message === "OTP_UPDATED"){
				            	res.status(201).json({message:"OTP_UPDATED",ID:data._id})
			            	}else{
			            		res.status(201).json({message:"OTP_NOT_UPDATED"})
			            	}
			            })
			    		.catch(err =>{
							res.status(500).json({
								error: err
							});
						});
			}else{ //end of if data
				res.status(200).json({message:"USER_NOT_FOUND"})
			}
		})
		.catch(err =>{
				res.status(500).json({
					error: err
				});
			})
};

exports.search_text = (req, res, next)=>{
	var companyID= parseInt(req.body.companyID);
	// console.log("req.body in search==>",req.body);
	if(req.body.companyID){
		var selector = {};
		if(companyID === 1){
			// console.log("req.body in search companyID==>",companyID);
			selector = {roles:{$ne:["admin"]}};
		}else{
			// console.log("req.body in search ekse companyID==>",companyID);
			selector = {"profile.companyID":companyID,roles:{$ne:["admin"]}};
		}
		// console.log("selector==>",selector);
	User.aggregate([
		{$match:selector},
		{$match:{"profile.status": {$nin:["deleted-active","deleted-blocked" ]}}},
		{$match:
			{$or:
			  [
						{ "profile.firstname"	: { "$regex": req.body.searchText, $options: "i" } },
						{ "profile.lastname"	: { "$regex": req.body.searchText, $options: "i" } },
						{ "profile.email"		: { "$regex": req.body.searchText, $options: "i" } },
						{ "profile.mobile"		: { "$regex": req.body.searchText, $options: "i" } },
						{ "role"				: { "$regex": req.body.searchText, $options: "i" } },
						{ "profile.status"		: { "$regex": req.body.searchText, $options: "i" } },
						{ "profile.companyName"	: { "$regex": req.body.searchText, $options: "i" } },
						{ "profile.fullName"	: { "$regex": req.body.searchText, $options: "i" } },
			  ]
			}
		 },
		])
	// .select("profile.firstname profile.lastname profile.companyName profile.companyID profile.status profile.fullName roles profile.email profile.mobile services.resume.loginTokens")
	.skip(req.body.startRange)
	.limit(req.body.limitRange)
	.exec()
	.then(data=>{
		// console.log("Data in search==>",data)
		if(data){
			var i = 0;
			var returnData = [];
			for(i = 0 ; i < data.length ; i++){
				var loginTokenscount = data[i].services.resume.loginTokens.length 
				returnData.push({
									"_id"			: data[i]._id,
									"email"			: data[i].profile.email, //Mandatory 
									"firstname" 	: data[i].profile.firstname,
									"lastname"  	: data[i].profile.lastname,
									"companyID" 	: data[i].profile.companyID,
									"companyName"  	: data[i].profile.companyName,
									"mobNumber" 	: data[i].profile.mobile,
									"role"      	: data[i].roles, //Mandatory
									"status"		: data[i].profile.status, //Either "Active" or "Inactive"
									"fullName"		: data[i].profile.fullName,
									"lastLogin"     : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
								});
			}
			if( i >= data.length){
				res.status(200).json(returnData);
			}
		}else{
			res.status(200).json({message:"USER_NOT_FOUND"});
		}
	})
	.catch(err=>{
		res.status(500).json({
			error : err
		})
	})
}
}

exports.search_text_delete = (req, res, next)=>{
	User.find({
		$and:[
				{$or:[
					{ "profile.firstname"	: { "$regex": req.body.searchText, $options: "i" } },
					{ "profile.lastname"	: { "$regex": req.body.searchText, $options: "i" } },
					{ "profile.email"		: { "$regex": req.body.searchText, $options: "i" } },
					{ "profile.fullName"	: { "$regex": req.body.searchText, $options: "i" } },
				]},

				{$or:[
					{"profile.status": "deleted-active"},
					{"profile.status": "deleted-blocked"}
				]},
		]
	})
	.select("profile.firstname profile.lastname profile.status profile.companyID profile.companyName profile.fullName roles profile.email profile.mobile profile.clientId createdAt services.resume.loginTokens statusLog")
	.skip(req.body.startRange)
	.limit(req.body.limitRange)
	.exec()
	.then(data=>{
		// console.log("Data in delete list==>",data)
		if(data){
			var i = 0;
					var returnData = [];
					for(i = 0 ; i < data.length ; i++){
						var loginTokenscount = data[i].services.resume.loginTokens.length;
						var statuslogLength = data[i].statusLog.length
						returnData.push({
							"_id"		      : data[i]._id,
							"firstname"       : data[i].profile.firstname,
							"lastname"	      : data[i].profile.lastname,
							"companyID"	      : data[i].profile.companyID,
							"companyName"	  : data[i].profile.companyName,
							"email"		      : data[i].profile.email, //Mandatory 
							"mobNumber"       : data[i].profile.mobile,
							"role"            : data[i].roles, //Mandatory
							"status"		  : data[i].profile.status, //Either "Active" or "Inactive"
							"fullName"	      : data[i].profile.fullName,
							"createdAt"       : data[i].createdAt,
							"clientId"	      : data[i].clientId,
							"lastLogin"       : loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : null ,
							"statusupdatedAt" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedAt : "-",
							"statusupdatedBy" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedBy : "-"

						});
					}
			// var i = 0;
			// var returnData = [];
			// for(i = 0 ; i < data.length ; i++){
			// 	var statuslogLength = data[i].statusLog.length
			// 	var loginTokenscount = data[i].services.resume.loginTokens.length 
			// 	returnData.push({
			// 						"_id"			: data[i]._id,
			// 						"email"			: data[i].profile.email,
			// 						"firstname" 	: data[i].profile.firstname,
			// 						"lastname"  	: data[i].profile.lastname,
			// 						"companyID"  	: data[i].profile.companyID,
			// 						"companyName"  	: data[i].profile.companyName,
			// 						"mobNumber" 	: data[i].profile.mobile,
			// 						"role"      	: data[i].roles,
			// 						"status"		: data[i].profile.status,
			// 						"fullName"		: data[i].profile.fullName,
			// 						"lastLogin" 	: loginTokenscount > 0 ? data[i].services.resume.loginTokens[loginTokenscount-1].loginTimeStamp : "-",

			// 						"statusupdatedAt" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedAt : "-",
			// 						"statusupdatedBy" : statuslogLength > 0 ? data[i].statusLog[statuslogLength-1].updatedBy : "-"
			// 					});
			// }
			// console.log("returnData in delete list==>",returnData)
			if( i >= data.length){
				res.status(200).json(returnData);
			}
		}else{
			res.status(200).json({message:"USER_NOT_FOUND"});
		}
	})
	.catch(err=>{
		res.status(500).json({
			error : err
		})
	})
}

exports.user_update_img = (req,res,next)=>{
	User.findOne({_id:req.params.ID})
		.exec()
		.then(user=>{
			if(user){
				User.updateOne(
					{_id:req.params.ID},
					{
						$set:{
							"profile.image"  : req.body.userImg,
						},
					}
				)
				.exec()
				.then(data=>{
					if(data.nModified == 1){
						res.status(200).json("USER_IMAGE_UPDATED");
					}else{
						res.status(401).status("USER_IMAGE_NOT_UPDATED")
					}
				})
				.catch(err =>{
					console.log('user error ',err);
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(404).json("User Not Found");
			}
		})
		.catch(err=>{
			console.log('update user error ',err);
			res.status(500).json({
				error:err
			});
		});
};

exports.fetch_email = (req,res,next)=>{
	User.findOne({_id:req.params.userID})
		.exec()
		.then(data=>{
			res.status(200).json(data.username);
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};

exports.getID = (req,res,next)=>{
	User.findOne({username:req.params.id})
		.exec()
		.then(data=>{
			res.status(200).json(data._id);
		})
		.catch(err =>{
			res.status(500).json({
				error: err
			});
		});
};


exports.countUsers = (req,res,next)=>{
	User.find({})   
	   .exec()
	   .then(data=>{
		   res.status(200).json({dataCount: data.length});
	   })
	   .catch(err =>{
		   console.log(err);
		   res.status(500).json({
			   error: err
		   });
	   });
};


exports.onlineUserCount = (req,res,next)=>{
	// console.log("onlineUserCount",req)
   User.find({ roles: ["user"] })  
	   .exec()
	   .then(data=>{
		   res.status(200).json({dataCount: data.length});
	   })
	   .catch(err =>{
		   console.log(err);
		   res.status(500).json({
			   error: err
		   });
	   });
};





exports.update_user_company = (req,res,next)=>{
	User.findOne({_id:req.params.userID})
		.exec()
		.then(user=>{
			if(user){
				User.updateOne(
					{_id:req.params.userID},
					{
						$set:{
							"profile.companyID"     : req.body.companyID,
						},
					}
				)
				.exec()
				.then(data=>{
					if(data.nModified == 1){
						res.status(200).json("USER_UPDATED");
					}else{
                        res.status(200).json({ 
                            updated : false, 
                            "message"    : "USER_NOT_UPDATED", 
                        });
						// res.status(401).status("USER_NOT_UPDATED")
					}
				})
				.catch(err =>{
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(404).json("User Not Found");
			}
		})
		.catch(err=>{
			res.status(500).json({
				error:err
			});
		});
};


