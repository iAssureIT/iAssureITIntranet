const mongoose				= require("mongoose");
var   ObjectId 			= require('mongodb').ObjectID;
const bcrypt 				= require("bcryptjs");
const moment 				= require("moment");

const User 					= require('../userManagementnew/ModelUsers.js');
const Appointments 		= require('../appointments/model.js');
const AppointmentSlots 	= require('../appointmentSlots/model.js');
const Reviews 				= require('../review/model.js');

const globalVariable 	= require("../../../nodemonConfig.js");
const Enterprise 			= require('./model.js');
const Cryptr 				= require('cryptr');
const cryptr 				= new Cryptr('admin2.0*SecretKey');
const {sendNotification,getUserDetailsWith_id} 	
								= require("../common/globalFunctions.js");


exports.submit_entprofile = (req,res,next)=>{
	console.log("submit_entprofile req.body = ",req.body);


	Enterprise.findOne({
	   "enterpriseName" 	: req.body.enterpriseName,
		"GSTNumber"       : req.body.gstNumber,
		"PANNumber" 		: req.body.panNumber,
		"address.city" 	: req.body.location,
	})
	.then(enterprise =>{
		if(enterprise){
			res.status(200).json({
				"message" : "Enterprise Profile Already Exists!",
				"enterprise" : enterprise,
			})
		}else{
			const enterprise = new Enterprise({
		      _id            		: new mongoose.Types.ObjectId(),
			   enterpriseName      	: req.body.enterpriseName,
			   GSTNumber           	: req.body.gstNumber,
			   PANNumber           	: req.body.panNumber,
			   experience           : req.body.entExp,
			   totalStaff           : req.body.entStaff,
			   awards           		: req.body.entAwards,
			   membership           : req.body.entMembership,
			   aboutCompany         : req.body.entCompDescr,
			   address             	: {
			      addressLine		: req.body.address,
			      city           : req.body.location,
			      state          : req.body.state,
			      country        : req.body.country,
			      pincode        : req.body.pincode,
			   },
		      createdBy      		: req.body.user_id,
		      createdAt      		: new Date()
		   })
		   enterprise.save()
		   			.then(savedEnterprise => {
							console.log("savedEnterprise = ",savedEnterprise);
		   				//Now enter the enterprise_id into User table so that we will know the relationship
		   				var selector = {_id : ObjectId(req.body.user_id)} ;
							var updater =		{
														$set : {
																	"profile.company_id" : savedEnterprise._id,
																} 
													};
							console.log("selector = ",selector,updater);

							User.updateOne(selector,updater)
								.then(updatedUser2 => {
									console.log("updatedUser2 = ",updatedUser2);
		         				res.status(200).json({
		         					"message" 	: "Enterprise Profile Submitted Successfully!",
		         					"enterprise" : savedEnterprise,
		         				})												
								})
		         			.catch(error=>{
									console.log("Error during User Update with enterprise_id : ",error);
		         				res.status(500).json({message:"Error during User Update with enterprise_id", error:error});
		         			})
		   			})
		   			.catch(error=>{
							console.log("Error during Enterprise Insert : ",error);
		   				res.status(500).json({message:"Error during Enterprise Insert", error:error});
		   			})
		}
	})
	.catch(error=>{
		console.log("Error during Enterprise Find : ",error);
		res.status(500).json({message:"Error during Enterprise Find", error:error});
	})
};


exports.update_entprofile = (req,res,next)=>{
	// console.log("update_entcategories req.body = ",req.body);

   Enterprise.updateOne(
   	{ _id : req.body.enterprise_id },
   	{$set : {
		   enterpriseName      	: req.body.enterpriseName,
		   GSTNumber           	: req.body.gstNumber,
		   PANNumber           	: req.body.panNumber,
		   experience           : req.body.entExp,
		   totalStaff           : req.body.entStaff,
		   awards           		: req.body.entAwards,
		   membership           : req.body.entMembership,
		   aboutCompany         : req.body.entCompDescr,
		   address             	: {
		      addressLine		: req.body.address,
		      city           : req.body.location,
		      state          : req.body.state,
		      country        : req.body.country,
		      pincode        : req.body.pincode,
		   },
   	} }
   )
	.then(updatedEnterprise => {
		// console.log("updatedEnterprise = ",updatedEnterprise);
		if(updatedEnterprise.nModified === 1){
			res.status(200).json({
				data 		: updatedEnterprise,
				message 	: "Enterprise Basic Profile Successfully Updated!",
				enterprise_id : req.body.enterprise_id
			});
		}else{
			console.log("1 Error during Enterprise Update : ");

			res.status(200).json({
				data 		: updatedEnterprise,
				message 	: "Data looks same. So No Update Required!",
				enterprise_id : req.body.enterprise_id
			});			
		}
	})
	.catch(error=>{
		console.log("2 Error during Enterprise Update : ",error);
		res.status(500).json({message:"Error during Enterprise Update", error:error});
	})								
};

exports.submit_entcategories = (req,res,next)=>{
	console.log("submit_entcategories req.body = ",req.body);

   Enterprise.updateOne(
   	{ _id : req.body.enterprise_id },
   	{$set : {catg_subCatg_expertise : req.body.catg_subCatg_expertise } }
   )
	.then(updatedEnterprise => {
		// console.log("updatedEnterprise = ",updatedEnterprise);
		if(updatedEnterprise.nModified === 1){
			res.status(200).json({
				data 		: updatedEnterprise,
				message 	: "Enterprise Successfully Updated!",
				enterprise_id : req.body.enterprise_id
			});
		}else{
			console.log("1 Error during Enterprise Update : ", updatedEnterprise);

			res.status(200).json({
				data 		: updatedEnterprise,
				message 	: "Data looks same. So No Update Required!",
				enterprise_id : req.body.enterprise_id
			});			
		}
	})
	.catch(error=>{
		console.log("2 Error during Enterprise Update : ",error);
		res.status(500).json({message:"Error during Enterprise Update", error:error});
	})								
};

exports.submit_entdocuments = (req,res,next)=>{
	// console.log("submit_entdocuments req.body = ",req.body);

	//*********************************************************************
	// First check whether Entp Profile and Entp Catg have been submitted.
	//*********************************************************************

	Enterprise.findOne({ _id : req.body.enterprise_id })
				.then(e =>{
					console.log("Enterprise => ",e);
					console.log("e.enterpriseName => ",e.enterpriseName);
					console.log("e.GSTNumber => ",e.GSTNumber);
					console.log("e.PANNumber => ",e.PANNumber);
					console.log("e.experience => ",e.experience);
					console.log("e.catg_subCatg_expertise.length => ",e.catg_subCatg_expertise.length);

					if(e.enterpriseName && e.PANNumber && e.experience &&
						e.catg_subCatg_expertise.length > 0 ){
					   Enterprise.updateOne(
					   	{ _id : req.body.enterprise_id },
					   	{$set : {
							documents : req.body.documents,
							approvalStatus:'Pending',
							approvalLog: [
								{
								  status: 'Pending',
								  updatedAt: new Date(),
								  updatedBy: req.body.user_id,
								  reason: 'New Application',
								}]
						},
					 }
					   )
						.then(updatedEnterprise => {
							// console.log("updatedEnterprise = ",updatedEnterprise);
							if(updatedEnterprise.nModified === 1){
								res.status(200).json({
									success  : true,
									data 		: updatedEnterprise,
									message 	: "Enterprise Successfully Updated!",
									enterprise_id : req.body.enterprise_id
								});
							}else{
								console.log("1 Error during Enterprise Update : ");

								res.status(200).json({
									success  : true,
									data 		: updatedEnterprise,
									message 	: "Data looks same. So No Update Required!",
									enterprise_id : req.body.enterprise_id
								});			
							}
						})
						.catch(error=>{
							console.log("2 Error during Enterprise Update : ",error);
							res.status(500).json({message:"Error during Enterprise Update", error:error});
						})
					}else{
						res.status(200).json({
							success  		: false,
							message 			: "Enterprise Basic profile or Category fields are not yet submitted!",
							enterprise_id 	: req.body.enterprise_id
						});
					}
				})
				.catch(error=>{
					console.log("3 Error during Enterprise FindOne : ",error);
					res.status(500).json({message:"Error during Enterprise FindOne", error:error});
				})								
};

exports.updateInvitations = async (req,res,next)=>{
	console.log("updateInvitations req.body = ",req.body);

	//========== Step by step process ===========
	// 1. First check if the email id already exists in Users collection
	// 2. If not available, then create the user account using email & a default password
	// 3. Send invite to consultant with login credentials
	// 4. When consultant logins, he would be redirected to Consultant profile. 
	//===========================================

	var inviteEmail = req.body.inviteEmail;
	const pwd = "eAdvicer@123";
	var isConsultant = false;

	var isUserExists = await checkUser(inviteEmail);
	console.log("isUserExists => ",isUserExists);
	if(isUserExists.success){
		var enterpriseData = await getEnterpriseName(req.body.company_id)
		//This means the email id is already used for some user
		//Invite Consultant - If the invited Consultant is a User, 
		//but not consultant, a notification be sent to the user to login and 
		//create the Consultant profile in the given Enterprise Banner
		console.log("enterpriseData*************",enterpriseData);
		if(isUserExists.user.roles.includes("consultant")){
			isConsultant = true;
			res.status(200).json({
				data 		: isUserExists.user,
				message1 : "This Email is already used by one consultant account!",
				message2 : "You may want to check out with the relevant Consultant if he wants to come into your Enterprise banner. In such case, query be raised to the eAdvicer portal for effecting such change.",
				success  : false,
			});
		}else if(isUserExists.user.profile.company_id?.invitations.find(o => o.email === inviteEmail)){
			res.status(200).json({
				data 		: isUserExists.user,
				message1 : "This Email is already invited!",
				message2 : "Try other email address",
				success  : false,
			});			
		}else{
			//Step-1 -> If invited person is already a user (not consultant), then send simple email
			var userNotificationValues = {
				"event"			: "Invite Consultant",
				"toUser_id"		: isUserExists.user?._id,
				"toUserRole"	: "user",
				"toEmail" 		: inviteEmail,
				"toMobileNumber" : "",
				"variables" 	: {
					"UserFullName" 		: inviteEmail,
					"EnterpriseName" 		: enterpriseData.enterpriseName,
					"InviteConsultantLink"  : globalVariable.websiteName,
					"login_id" 				: inviteEmail,
					"pwd" 					: pwd,
				}
			}
			var send_notification_to_user = await sendNotification(userNotificationValues);
			//Step-2 -> Update Enterprise for invited consultants
		   Enterprise.updateOne(
			   	{ _id : ObjectId(isUserExists.user.profile.company_id?._id) },
			   	{$push : {"invitations" : {
		                                   		email 				: req.body.inviteEmail,
		                                   		inviteSentOn		: new Date(),
		                                   		profileCreatedOn 	: ""
			   									  } 
			   	}}
		   	)
				.then(updatedEnterprise => { 
					// console.log("updatedEnterprise = ",updatedEnterprise);
					Enterprise.findOne({_id : req.body.company_id})
						.then((newEnterprise)=>{
							// console.log("updateInvitations newEnterprise => ", newEnterprise);
							if(updatedEnterprise.nModified === 1){
								res.status(200).json({
									data 			: updatedEnterprise,
									message 		: "Enterprise Successfully Updated!",
									enterprise 	: newEnterprise,
									success 		: true,
								});
							}else{
								console.log("1 Error during Enterprise Update : ");
								res.status(200).json({
									data 			: updatedEnterprise,
									message 		: "Data looks same. So No Update Required!",
									enterprise 	: newEnterprise,
									success 		: true,
								});			
							}
						})
						.catch(error=>{
							console.log("2 Error during Find Enterprise : ",error);
							res.status(500).json({message:"Error during Enterprise Find", error:error, success:false});
						})
				})
				.catch(error=>{
					console.log("2 Error during Enterprise Update : ",error);
					res.status(500).json({message:"Error during Enterprise Update", error:error, success:false});
				})				
		}
	}else{
		if(isUserExists.error){
			res.status(200).json({
				data 		: "",
				message1 : "Some error occured during invited user check",
				message2 : userDetails.error,
				success  : false,
			});
		}else{
			console.log("req.body.user_id => ",req.body.user_id);
			var userDetails = await getUserDetailsWith_id(req.body.user_id);			

			 console.log("userDetails => ",userDetails);
			if(!userDetails.success){
				res.status(200).json({
					data 		: userDetails.user,
					message1 : "Some error occured while finding consultant",
					message2 : userDetails.error,
					success  : false,
				});
			}else{
				var consultant 	= userDetails.user;
				
				const company_id 	= consultant.profile.company_id?._id;
				const entpName 	= consultant.profile.company_id?.enterpriseName;
				const createdBy 	= consultant._id;
				const consName 	= req.body.consultantName;
				console.log("entpName => ",entpName);

				const numOfInvitedConsultants = 	consultant.profile.company_id &&
														  	consultant.profile.company_id.invitations
														  	?
																consultant.profile.company_id.invitations.length
															:
																0 ;
				const subscribedPlanName = consultant.subscriptionDetails.planName;
				const subscribedPlanType = consultant.subscriptionDetails.planType;
				subscriptionPlans = req.body.subscriptionPlans;
				if(!subscriptionPlans){
					res.status(500).json({
						success : false,
						message : "Subscription Plan Information not available"
					})
				}else{
					var inviteLimit = subscriptionPlans.filter((e)=>{ return e.planName === subscribedPlanName && 
																							 	e.type === subscribedPlanType
																					});
					var iclimit = parseInt(inviteLimit[0].inviteConsultants) - 1 ;

					if(parseInt(numOfInvitedConsultants) >= iclimit){
						console.log("numOfInvitedConsultants => ",numOfInvitedConsultants," | inviteLimit[0].inviteConsultants => ",inviteLimit[0].inviteConsultants);
						console.log("You have already invited max allowable "+inviteLimit[0].inviteConsultants+" consultants as per your subscribed plan");

						res.status(200).json({
							success  : false,
							message1  : "You have already invited max allowable "+ parseInt(inviteLimit[0].inviteConsultants) +" consultants, as per your subscribed plan",
							message2  : "Your profile also counts in the limit"
						})
					}else{
						const insertedUser = await insertUser(inviteEmail,pwd,company_id,entpName,createdBy,consName);
						if(!insertedUser.success){
							res.status(500).json({
								data 			: insertedUser,
								message 		: "Insert User not successful",
								enterprise 	: "",
								success 		: false,
							});
						}else{
							//Step-2 -> Update Enterprise for invited consultants
						   Enterprise.updateOne(
							   	{ _id : ObjectId(consultant.profile.company_id?._id) },
							   	{$push : {"invitations" : {
						                                   		email 				: req.body.inviteEmail,
						                                   		inviteSentOn		: new Date(),
						                                   		profileCreatedOn 	: ""
							   									  } 
							   	}}
						   	)
								.then(updatedEnterprise => { 
									// console.log("updatedEnterprise = ",updatedEnterprise);
									Enterprise.findOne({_id : ObjectId(consultant.profile.company_id?._id)})
										.then((newEnterprise)=>{
											// console.log("updateInvitations newEnterprise => ", newEnterprise);
											if(updatedEnterprise.nModified === 1){
												res.status(200).json({
													data 			: updatedEnterprise,
													message 		: "Enterprise Successfully Updated!",
													enterprise 	: newEnterprise,
													success 		: true,
												});
											}else{
												console.log("1 Error during Enterprise Update : ");
												res.status(200).json({
													data 			: updatedEnterprise,
													message 		: "Data looks same. So No Update Required!",
													enterprise 	: newEnterprise,
													success 		: true,
												});			
											}
										})
										.catch(error=>{
											console.log("2 Error during Find Enterprise : ",error);
											res.status(500).json({message:"Error during Enterprise Find", error:error, success:false});
										})								
								})
								.catch(error=>{
									console.log("2 Error during Enterprise Update : ",error);
									res.status(500).json({message:"Error during Enterprise Update", error:error, success:false});
								})								

						}
					}
				}

			}
		}
	}

};
function getEnterpriseName(company_id){
	return new Promise((resolve,reject)=>{
		Enterprise.findOne({_id : ObjectId(company_id)})
			.then(data=>{
				console.log("data -> ",data);
				resolve({enterpriseName : data.enterpriseName})
			})
			.catch(error =>{
				console.log("function getEnterpriseName Error => ",error);
				reject({message:"Error in function getEnterpriseName", success:false, error:error});
			})		
	});
}
function checkUser(email){
	return new Promise((resolve,reject)=>{
		User.findOne({username : email},{services:0})
		.populate("profile.company_id")
		.then(user=>{			
			if(user){
				console.log("user***********",user);
				resolve({success:true, message:"User Exists", user:user})
			}else{
				resolve({success:false, message:"User Doesn't Exist", error:false})
			}
		})
		.catch(error=>{
			console.log("function checkUser Error => ",error);
			reject({message:"Error in function checkUser", success:false, error:error});
		})
	});
}


function insertUser(emailId,pwd,company_id,entpName,createdBy,consName){
	return new Promise((resolve,reject)=>{
		bcrypt.hash(pwd, 10, (err, hash) => {
			if(err){
				resolve({
					success : false,
					message: "Some error occured during password encryption.",
					error: err
				});
			}else{
				const user = new User({
					_id: new mongoose.Types.ObjectId(),
					createdAt: new Date,
					services: {
						password: {
							bcrypt: hash
						},
					},
					username: emailId.toLowerCase(),
					authService : "",
					profile: {
						email 		: emailId.toLowerCase(),
						company_id 	: company_id,
						companyName : entpName,
						createdAt 	: new Date(),
						status 		: 'active',
						createdBy 	: createdBy,
					},
					invitedConsultant 	: true,
					joinAsConsultant 	: false,
					roles: ['user']
				});

				user.save()
					.then(async(result) => {
						// console.log("new user result => ", result);
						if (result && result !== null) {	
							var encryptEmail 	= cryptr.encrypt(emailId);
							var encryptPwd 	= cryptr.encrypt(pwd);
							var link = globalVariable.websiteName+"/atlgn?x="+encryptEmail+"&y="+encryptPwd ;

							var userNotificationValues = {
								"event"				: "Invite Consultant",
								"toUser_id" 		: result._id.toString(),
								"toEmail"			: result.profile.email,
								"toMobileNumber" 	: result.profile.isdCode + user.profile.mobile,								
								"toUserRole"		: 'user',
								"userDetails" 		: result,
								"variables" 	: {
									"UserFullName" 		: emailId,
									"EnterpriseName" 		: entpName,
									"InviteConsultantLink" 	: "<a href='"+link+"' target='_blank'>"+link+"</a>",
									"login_id" 				: result.profile.email,
									"pwd" 					: pwd,
								}
							}

							var send_notification_to_user = await sendNotification(userNotificationValues);
							resolve({ 
								success : true,
								message: "USER_CREATED",
							})							
						}else{
							resolve({ 
								success : false,
								message: "USER_NOT_CREATED",
							})
						}
					})
					.catch(err => {
						console.log(err);
						reject({
							success : false,
							message : "Failed to save User Details",
							error   : err,
						});
					});
			}
		})
	})
}





exports.getEntBasicProfile = (req,res,next)=>{
	
	console.log("req.params.enterprise_id -> ",req.params.enterprise_id);

	if(req.params.enterprise_id && req.params.enterprise_id !== 'undefined'){
		var enterprise_id = req.params.enterprise_id;

		Enterprise.findOne({_id : enterprise_id})
					.then(data=>{
						// console.log("data -> ",data);
						res.status(200).json({enterprise: data});
					})
					.catch(error =>{
						console.log("Error -> ",error);
						res.status(500).json({
							message: "Error while finding Enterprise",
							error : error
						});
					})		
	}else{
		res.status(200).json({enterprise: {}});
	}
}


exports.getEntBasicProfileUsingUserId = (req,res,next)=>{
	var user_id = req.params.user_id;
	console.log("user_id = ", user_id);

	User.findOne({_id : ObjectId(user_id)})
			.then(userData=>{
				// console.log("getEntBasicProfileUsingUserId userData => ",userData);

				if(userData && userData.profile && userData.profile.company_id){
					Enterprise.findOne({_id : ObjectId(userData.profile.company_id)})
								.then(entData => {
									// console.log("getEntBasicProfileUsingUserId entData => ",entData);
									//It means enterprise data is already populated.
									res.status(200).json({enterprise: entData});
								})
								.catch(error =>{
									console.log("Enterprise Error -> ",error);
									res.status(500).json({
										message: "Error while finding Enterprise",
										error : error
									});
								});
				}else{
					//It means profile.company_id is not available, which means
					//Enterprise data is not yet populated.
					//Check if LinkedIn Profile data available. 
					//Send Linkedin data if available. 
					if(userData && userData.profile && userData.profile.entLinkedinProfile){
						var eData = userData.profile.entLinkedinProfile;
						var enterpriseData = {
                     enterpriseName : eData.name,
                     address 			: { addressLine : eData.hq.line_1,
                     						 city        : eData.hq.city},
                     PANNumber      : "",
                     GSTNumber      : "",
                     experience     : getExperience(eData.founded_year),
                     totalStaff     : getStaffNumber(eData.company_size),
                     awards         : "",
                     membership     : "",
                     aboutCompany   : eData.description
						}
						// console.log("enterpriseData => ",enterpriseData);
						res.status(200).json({enterprise: enterpriseData});
					}else{
						res.status(200).json({enterprise: "", message: "Data Not Found"});
					}					
				}
			})
			.catch(error =>{
				console.log("User Error -> ",error);
				res.status(500).json({
					message: "Error while finding User",
					error : error
				});
			})
}

function getExperience(founded_year){
	if(founded_year){
		var currYear = parseInt(new Date().getYear()) + 1900;
		var exp = parseInt(currYear) - parseInt(founded_year);
		var formattedExp = exp;
		// console.log("exp => ",exp);
		if(exp === 1){formattedExp = "1 Year";} 
		if(exp>1 && exp<=5){formattedExp = exp+" Years";}
		if(exp>=6  && exp<=10){formattedExp = "6-10 Years";}
		if(exp>=11 && exp<=15){formattedExp = "11-15 Years";}
		if(exp>=16 && exp<=20){formattedExp = "16-20 Years";}
		if(exp>=21 && exp<=25){formattedExp = "21-25 Years";}
		if(exp>=26 && exp<=30){formattedExp = "26-30 Years";}
		if(exp>=31 && exp<=35){formattedExp = "31-35 Years";}
		if(exp>=36 && exp<=40){formattedExp = "36-40 Years";}
		if(exp>=41 && exp<=45){formattedExp = "41-45 Years";}
		if(exp>=46 && exp<=50){formattedExp = "46-50 Years";}
		if(exp>=51){formattedExp = "Above 50 Years";}

		// console.log("formattedExp => ",formattedExp);
		return formattedExp;
	}else{
		return null;
	}
}

function getStaffNumber(company_size){
	// console.log("typeof company_size => ",typeof company_size);

	if(company_size.length>0){
		var minSize = company_size[0];
		var maxSize = company_size[1];
		var average = (parseInt(minSize)+parseInt(maxSize))/2;
		var formattedStaff = 0;

		// console.log("average => ",average);
		if(average===1){formattedStaff = "1 Year";}
		if(average>=1  && average<=5){formattedStaff = "1-5";}
		if(average>=6  && average<=10){formattedStaff = "6-10";}
		if(average>=11 && average<=15){formattedStaff = "11-15";}
		if(average>=16 && average<=20){formattedStaff = "16-20";}
		if(average>=21 && average<=25){formattedStaff = "21-25";}
		if(average>=26 && average<=50){formattedStaff = "26-50";}
		if(average>=51 && average<=100){formattedStaff = "51-100";}
		if(average>=101 && average<=200){formattedStaff = "101-200";}
		if(average>=201 && average<=500){formattedStaff = "201-500";}
		if(average>=501){formattedStaff = "Above 500";}

		// console.log("formattedStaff => ",formattedStaff);
		return formattedStaff;
	}else{
		return null;
	}
}

exports.getEnterpriseConsultants = (req,res,next)=>{
	var enterprise_id = req.params.enterprise_id;
	// console.log("getEnterpriseConsultants enterprise_id => ",enterprise_id);

	User.find({
			"profile.company_id" : enterprise_id, 
			isProfileReady : true,
			approvalStatus : "Approved",
		},{services:0, statusLog:0})
		.populate("profile.company_id")
		.then(async entpUsers =>{
			// console.log("entpUsers => ",entpUsers);
			
			if(entpUsers.length>0){
				var totalCalls = 0;
				for(var i=0; i<entpUsers.length; i++){
					var consCalls = await getConsultantCalls(entpUsers[i]._id);
					if(consCalls > -1){
						totalCalls = totalCalls + consCalls;
					}

					var nextAvailable = await getNextAvailability(entpUsers[i]._id);
					var starRatings 	= await getStarRatings(entpUsers[i]._id);
					
					entpUsers[i] = {
											...entpUsers[i]._doc, 
											consCalls  		: consCalls, 
											nextAvailable 	: nextAvailable,
											starRatings 	: starRatings
										}					
				}
				if(i>=entpUsers.length){
					res.status(200).json({
						success : true,
						enterpriseConsultants: entpUsers,
						totalCalls : totalCalls,
						message: "Enterprise Consultants List Generated !!"				
					})
				}
			}else{
				res.status(200).json({
					success : true,
					enterpriseConsultants: [],
					totalCalls : 0,
					message: "Enterprise Consultants List Generated !!"				
				})				
			}
		})
		.catch(error=>{
			console.log("enterpriseConsultants error => ",error);

			res.status(500).json({
				success 	: false,
				error  	: error,
				message 	: "Some error occured while generating enterprise review list"
			})
		});		
}

function getStarRatings(consultant_id){
	return new Promise((resolve,reject)=>{
		Reviews.find({consultantId : consultant_id})
					.then(reviewResponse => {
						// console.log("reviewResponse => ",reviewResponse);
						var starRating = 0;
						if(reviewResponse && reviewResponse.length>0){
							for(var i=0; i<reviewResponse.length; i++){
								starRating += parseFloat(reviewResponse[i].rating);
							}
							if(i >= reviewResponse.length){
								starRating = (parseFloat(starRating) / i).toFixed(1);
								resolve(starRating);
							}
						}else{
							resolve(0);
						}
					})
					.catch(error => {
						console.log("getStarRatings error =>",error);
						reject(-1);
					})
	})
}
function getNextAvailability(consultant_id){
	// console.log("consultant_id => ",consultant_id);

	return new Promise((resolve,reject)=>{
		AppointmentSlots.findOne({user_id : ObjectId(consultant_id)})
					.then(slots => {
						// console.log("consultant_id => ",consultant_id);
						// console.log("slots => ",slots);

						if(slots && slots.calendarDays && slots.calendarDays.length > 0){
							// for(var i=0; i<slots.calendarDays.length; i++){
							// 	var dtArr = slots.calendarDays[i].date.split("-");
							// 	var yr = parseInt(dtArr[2]);
							// 	var currYr = parseInt(moment(new Date()).format("yyyy"));
							// 	if(currYr >= yr){
							// 		var yr = parseInt(dtArr[2]);
							// 		var currYr = parseInt(moment(new Date()).format("yyyy"));

							// 	}

							// }
							var currTime = moment(new Date()).format("HH");
							// console.log("time => ",currTime);

							if( parseInt(currTime) > 19){
								resolve(moment(new Date()).add(1, 'days').format("DD MMM"));
							}else{
								resolve(moment(new Date()).format("DD MMM"));								
							}
						}else{							
							resolve(moment(new Date()).format("DD MMM"));
						}
					})
					.catch(error => {
						console.log("getNextAvailability error =>",error);
						reject(-1);
					})
	})
}

function getConsultantCalls(consultant_id) {
	return new Promise((resolve, reject) => {
		var currDate = moment().tz('Asia/Kolkata').format("YYYY-MM-DD");
      	var currTime = moment().tz('Asia/Kolkata').format("HH:mm");

      	// Appointments.find({ consultant_id: (consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} },{"meetingRoomDetails":0})
        var selector = { consultant_id: (consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} }
      	var query = { $match : selector};
      	var statusList =["captured","TXN_SUCCESS"];
      	Appointments.aggregate([
	            query,
	            {
	               	$lookup:
	                  	{
	                    	from: "orders",
	                    	localField: "order_id",
	                    	foreignField: "_id",
	                   	 	as: "order"
	                  }
	            },
	            { 	"$unwind": "$order" },
	            { 
	               	"$match": { 
	                  	"order.status": { "$in": statusList },
	               	} 
	            }

        	])
         	.then(totalData => {
            // console.log("totalData==============1=============",totalData.length,currTime)
            for(var i=0; i<totalData.length; i++){
               	if(( totalData[i].appointmentEnd > currTime && moment(totalData[i].isoAppointmentDate).diff(moment(currDate)) >= 0)){
                  	const index = totalData.indexOf(totalData[i]);
                  	// console.log("index",index,i)
                  	if (index > -1) { // only splice array when item is found
                    	totalData.splice(index, 1); // 2nd parameter means remove one item only
                  	}

               	}
            }
            // console.log("totalData==============2=============",totalData.length)
        	resolve(totalData.length);
         	})
         	.catch(err => {
            	console.log('getConsultantCalls error => ', err);
            	reject(-1);
         	});
		
	})
}

