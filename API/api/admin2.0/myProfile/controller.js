const mongoose = require("mongoose");
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var axios = require('axios');

const User 							= require('../userManagementnew/ModelUsers.js');
const Enterprise 					= require('../enterprise/model.js');
const Appointments 				= require('../appointments/model.js');
const AppointmentSlots 			= require('../appointmentSlots/model.js');
const Reviews 						= require('../review/model.js');
const Orders 						= require("../orders/model.js");
const globalVariable 			= require("../../../nodemonConfig.js");
const { getLinkedinProfile } 	= require("../common/linkedin-api.js");
const {sendNotification} 		= require("../../admin2.0/common/globalFunctions");





exports.submit_myprofile = (req, res, next) => {

	// console.log("submit_myprofile req.body => ",req.body);
	var selector = { _id: ObjectID(req.body.user_id), "profile.status": "active" };

	// console.log("submit_myprofile selector => ",selector);

	User.findOne(selector)
		.then(async (user) => {
			// console.log("user = ",user);
			if (user) {
				var isMobileAlreadyUsed = await check_mobile_number(user._id, req.body.mobNumber);
				if (isMobileAlreadyUsed) {
					res.status(200).json({ message: "Mobile number is already used", success: false });
				} else {
					if(user.isProfileReady){
						var isProfileReady = true;
					}else{
						var isProfileReady = false;						
					}

					User.findOneAndUpdate(
						{ _id: ObjectID(req.body.user_id) },
						{
							$set:
							{
								"profile.firstname" 	: req.body.firstname,
								"profile.lastname"  	: req.body.lastname,
								"profile.fullName"	: req.body.firstname + " " + req.body.lastname,
								"profile.email" 		: req.body.email,
								"profile.mobile" 		: req.body.mobNumber,
								"profile.userBusinessInfo" 		: {
									businessTradeName : req.body.businessTradeName,
									businessCategory 	: req.body.businessCategory,
									GSTNumber 			: req.body.gstn,
									address: {
										addressLine 	: req.body.addressLine,
										city 				: req.body.city,
										state 			: req.body.state,
										country 			: req.body.country,
										pincode 			: req.body.pincode,
									},
								},
								"isProfileReady"		: isProfileReady,
							},
						},
						{new : true}
					)
						.then(updatedUser => {
							console.log("updatedUser = ", updatedUser);
							
							res.status(200).json({ 
								message: "Profile Updated Successfully without Business Info", 
								success: true 
							});

							//==============================================
							// 12-09-2022  - Discussion with Ankita
							// Decouple the connection between User and enterprise collection
							// Enter User BusinessInfo into same user collection. 
							//==============================================
							//If Business information given, then add business name in 
							//enterprise collection and then add the enterprise_id in 
							//user collection

							//If Enterprise already available, then update the same
							// else insert the data

							// if (req.body.businessTradeName !== "") {
							// 	Enterprise.findOne({
							// 		enterpriseName: req.body.businessTradeName,
							// 		createdBy: req.body.user_id,
							// 	})
							// 		.then(avblEnterprise => {
							// 			// console.log("avblEnterprise = ",avblEnterprise);
							// 			if (avblEnterprise) {
							// 				//Enterprise Already available... just update...
							// 				Enterprise.updateOne({
							// 					enterpriseName: req.body.businessTradeName,
							// 					createdBy: req.body.user_id,
							// 				}, {
							// 					$set: {
							// 						enterpriseName: req.body.businessTradeName,
							// 						businessCategory: req.body.businessCategory,
							// 						GSTNumber: req.body.gstn,
							// 						address: {
							// 							addressLine: req.body.addressLine,
							// 							city: req.body.city,
							// 							state: req.body.state,
							// 							country: req.body.country,
							// 							pincode: req.body.pincode,
							// 						},
							// 						$push: {
							// 							updateLog: {
							// 								updatedBy: req.body.user_id,
							// 								updatedAt: new Date()
							// 							}
							// 						}
							// 					}
							// 				})
							// 					.then(updatedEnterprise => {
							// 						// console.log("updatedEnterprise = ",updatedEnterprise);
							// 						res.status(200).json({
							// 							success 		: true,
							// 							message 		: "User and Enterprise data updated successfully!",
							// 							enterprise 	: updatedEnterprise,
							// 							user  		: updatedUser
							// 						})
							// 					})
							// 					.catch(error => {
							// 						console.log("Error during Enterprise Update : ", error);
							// 						res.status(500).json({
							// 							success: false,
							// 							message: "Error during Enterprise Update",
							// 							error: error
							// 						});
							// 					})
							// 			} else {
							// 				//Enterprise not available... Insert the same

							// 				const enterprise = new Enterprise({
							// 					_id: new mongoose.Types.ObjectId(),
							// 					enterpriseName: req.body.businessTradeName,
							// 					businessCategory: req.body.businessCategory,
							// 					GSTNumber: req.body.gstn,
							// 					address: {
							// 						addressLine: req.body.addressLine,
							// 						city: req.body.city,
							// 						state: req.body.state,
							// 						country: req.body.country,
							// 						pincode: req.body.pincode,
							// 					},
							// 					createdBy: req.body.user_id,
							// 					createdAt: new Date()
							// 				})

							// 				enterprise.save()
							// 					.then(savedEnterprise => {
							// 						// console.log("savedEnterprise = ",savedEnterprise);
							// 						//Now enter the enterprise_id into User table so that we will know the relationship
							// 						User.findOneAndUpdate(
							// 							{ _id: req.body.user_id },
							// 							{
							// 								$set: {
							// 									"profile.company_id": savedEnterprise._id,
							// 								}
							// 							},
							// 							{new : true}
							// 						)
							// 							.then(updatedUser2 => {
							// 								// console.log("updatedUser2 = ",updatedUser2);
							// 								res.status(200).json({
							// 									success 	: true,
							// 									message: "User and Enterprise data updated successfully!",
							// 									enterprise: savedEnterprise,
							// 									user : updatedUser2,
							// 								})
							// 							})
							// 							.catch(error => {
							// 								console.log("Error during User Update with enterprise_id : ", error);
							// 								res.status(500).json({ 
							// 									success 	: false,
							// 									message 	: "Error during User Update with enterprise_id", 
							// 									error 	: error 
							// 								});
							// 							})
							// 					})
							// 					.catch(error => {
							// 						console.log("Error during Enterprise Insert : ", error);
							// 						res.status(500).json({ message: "Error during Enterprise Insert", error: error });
							// 					})
							// 			}
							// 		})
							// 		.catch(error => {
							// 			console.log("Error while finding enterprise : ", error);
							// 			res.status(500).json({ message: "Error while finding enterprise", error: error });
							// 		})
							// } else {
							// 	res.status(200).json({ message: "Profile Updated Successfully without Business Info", success: true });
							// }
						})
						.catch(error => {
							console.log("submit_myprofile user udpate error -> ", error);
							res.status(500).json({ message: "Error occured while updating user profile" });
						})
				}
			} else {
				res.status(200).json({ message: "User Not Found", success: false });
			}
		})
		.catch(error => {
			console.log("submit_myprofile error -> ", error);
			res.status(500).json({ message: "Error occured while finding the user" });
		})
};

function check_mobile_number(user_id, mobileNumber) {
	return new Promise((resolve, reject) => {
		User.find({ "profile.mobile": mobileNumber })
			.then(user => {
				if(user && user.length > 0){
					// console.log("==========================");
					// console.log("user.length => ",user.length);
					// console.log("user_id.toString() => ",user_id.toString());
					// console.log("user_id => ",user_id);
					// console.log("==========================");
					for(var i = 0; i < user.length; i++) {
						if(user[i]._id.toString() !== user_id.toString()) {
							console.log("user[i]._id.toString() => ",user[i]._id.toString());
							resolve(true)
						}
					}
					if(i>=user.length){
						resolve(false)
					}
				}else{
					resolve(false)
				}
			})
			.catch(error => {
				resolve(error)
			});
	})
}



exports.update_consultant_profile = async (req, res, next) => {

	// console.log("update_consultant_profile req.body => ", req.body);
	var isMobileAlreadyUsed = await check_mobile_number(req.body.user_id, req.body.mobile);
	if (isMobileAlreadyUsed) {
		res.status(200).json({ message: "Mobile number is already used", success: false });
	} else {
		User.updateOne(
			{ _id: req.body.user_id },
			{
				$set: {
					"profile.firstname": req.body.firstName,
					"profile.lastname": req.body.lastName,
					"profile.fullName": req.body.firstName + " " + req.body.lastName,
					"profile.email": req.body.email,
					"profile.mobile": req.body.mobile,

					"address.city": req.body.location,

					"otherInfo.fees": req.body.fees,
					"otherInfo.experience": req.body.experience,
					"otherInfo.panNumber": req.body.panNumber,
					"otherInfo.qualification": req.body.qualification,
					"otherInfo.languages": req.body.languages,
					"otherInfo.awards": req.body.awards,
					"otherInfo.membership": req.body.membership,
					"otherInfo.pastWorkExp": req.body.pastWorkExp,
					"otherInfo.aboutMyself": req.body.aboutMyself,
				}
			},
		)
			.then(updatedUser => {
				res.status(200).json({
					success: true,
					message: "User updated Successfully",
					data: updatedUser
				})
			})
			.catch(error => {
				console.log("update_consultant_profile error -> ", error);
				res.status(500).json({ success: false, message: "Error occured while finding the user" });
			})
	}
};


exports.update_consultant_categories = (req, res, next) => {

	console.log("update_consultant_categories req.body => ",req.body);

	User.updateOne(
		{ _id: req.body.user_id },
		{
			$set: {
				"catg_subCatg_expertise": req.body.catg_subCatg_expertise,
			}
		},
	)
		.then(updatedUser => {
			// console.log("updatedUser => ",updatedUser);

			res.status(200).json({
				message: "User updated Successfully",
				data: updatedUser
			})
		})
		.catch(error => {
			console.log("update_consultant_profile error -> ", error);
			res.status(500).json({ message: "Error occured while finding the user" });
		})
};


exports.update_consultant_documents = (req, res, next) => {

	// console.log("1 update_consultant_documents req.body => ",req.body);

	// When a user submits his documents while registering as a consultant, 
	// it means his profile is completed. 
	// Here we can assign a role of consultant to this user

	var selector = { _id: req.body.user_id };

	// console.log("selector => ",selector)

	User.findOne(selector)
		.then(user => {
			// console.log("User findOne => ",user);

			var roles = user.roles;
			if (!roles.find((role) => { return role === "consultant" })) {
				roles.push("consultant");
			}

			console.log("user.isProfileReady => ",user.isProfileReady);
			// console.log("user.catg_subCatg_expertise.length => ",user.catg_subCatg_expertise.length);

			if (user.otherInfo.fees !== "" && user.otherInfo.panNumber !== "" &&
				user.otherInfo.qualification !== "" && user.otherInfo.experience !== "" &&
				user.catg_subCatg_expertise.length > 0) {

				User.updateOne(
					{ _id: ObjectID(req.body.user_id) },
					{
						$set: {
							"documents": {
								profilePhoto: req.body.documents.profilePhoto,
								panCard: req.body.documents.panCard,
								educationalQual: req.body.documents.educationalQual,
							},
							roles: roles,
							isProfileReady: true,
						}
					},
				)
					.then(async updatedUser => {
						console.log("updatedUser => ", updatedUser);
						
						if (user.invitedConsultant) {
							const updateEntp = await updateEntpForInvitedCons(user);
							// console.log("updateEntp => ", updateEntp);
						}

						console.log("!ser.isProfileReady && updatedUser.nModified===1 ",!user.isProfileReady && updatedUser.nModified===1 )
						if(!user.isProfileReady && updatedUser.nModified===1 ){								
							var userNotificationValues = {
								"event"				: "Profile Submitted by Consultant",
								"toUser_id" 		: user._id.toString(),
								"toEmail"			: user.profile.email,
								"toMobileNumber" 	: user.profile.isdCode + user.profile.mobile,
								"toUserRole"		: 'consultant',
								"userDetails" 		: user,
								"variables" 		: {
									UserFullName	: user.profile.fullName,
								}
							}
							var send_notification_to_user = await sendNotification(userNotificationValues);
						}

						res.status(200).json({
							success 		: true,
							message 		: "User updated Successfully",
							data 			: updatedUser,
							newRoles 		: roles
						})					
					})
					.catch(error => {
						console.log("2 update_consultant_profile error -> ", error);
						res.status(500).json({
							success: false,
							message: "Error occured while finding the user"
						});
					})
			} else {
				res.status(500).json({
					success: false,
					message: "Consultant Basic profile or Category fields are not yet submitted!",
				});
			}
		})
		.catch(error => {
			console.log("3 find_user error -> ", error);
			res.status(500).json({
				success: false,
				message: "Error occured while finding the user"
			});
		})

};

function updateEntpForInvitedCons(user) {
	var enterprise_id = user.profile.company_id;
	return new Promise((resolve, reject) => {
		Enterprise.updateOne(
			{ _id: enterprise_id, "invitations.email": user.profile.email },
			{ $set: { "invitations.$.profileCreatedOn": new Date() } }
		)
			.then(updatedEntp => {
				resolve(updatedEntp)
			})
			.catch(error => {
				console.log("error => ", error);
				reject(error)
			})

	})
}


exports.get_myprofile = (req, res, next) => {
	var user_id = req.params.user_id;
	console.log("user_id => ", user_id);

	User.findOne(
			{ _id: ObjectID(user_id) },
			{ "profile.userLinkedinProfile" : 0, "profile.entLinkedinProfile":0}
		)
		.then(user => {
			// console.log("user => ", user);

			//==============================================
			// 12-09-2022  - Discussion with Ankita
			// Decouple the connection between User and enterprise collection
			// Enter User BusinessInfo into same user collection. 
			//==============================================

			// if (user.profile.company_id) {
			// 	var company_id = user.profile.company_id;
			// 	Enterprise.findOne({ _id: ObjectID(company_id) })
			// 		.then(enterprise => {
			// 			// console.log("enterprise => ", enterprise);
			// 			var respData = {
			// 				user_id 	: user._id,
			// 				firstname: user.profile.firstname,
			// 				lastname : user.profile.lastname,
			// 				mobile 	: user.profile.mobile,
			// 				email 	: user.profile.email,
			// 				otherInfo: user.otherInfo,
			// 				documents: user.documents,
			// 				businessTradeName: enterprise.enterpriseName,
			// 				businessCategory: enterprise.businessCategory,
			// 				gstn 		: enterprise.GSTNumber,
			// 				addressLine: enterprise.address.addressLine,
			// 				country 	: enterprise.address.country,
			// 				state 	: enterprise.address.state,
			// 				city 		: enterprise.address.city,
			// 				pincode 	: enterprise.address.pincode,
			// 			};

			// 			console.log("1 respData => ", respData);

			// 			res.status(200).json(respData);

			// 		})
			// 		.catch(error => {
			// 			console.log("Error while finding Enterprise => ", error);
			// 			res.status(500).json({ message: "Error while finding Enterprise" })
			// 		})
			// } else {


			var respData = {
				user_id 	 	: user._id,
				firstname 	: user.profile.firstname,
				lastname 	: user.profile.lastname,
				mobile 		: user.profile.mobile,
				email 		: user.profile.email,
				businessTradeName : user.profile.userBusinessInfo ? user.profile.userBusinessInfo.businessTradeName : "",
				businessCategory  : user.profile.userBusinessInfo ? user.profile.userBusinessInfo.businessCategory : "",
				gstn 			: user.profile.userBusinessInfo ? user.profile.userBusinessInfo.GSTNumber : "",
				addressLine : user.profile.userBusinessInfo && user.profile.userBusinessInfo.address ? user.profile.userBusinessInfo.address.addressLine : "",
				pincode 		: user.profile.userBusinessInfo && user.profile.userBusinessInfo.address ? user.profile.userBusinessInfo.address.pincode : "",
				country  	: user.profile.userBusinessInfo && user.profile.userBusinessInfo.address ? user.profile.userBusinessInfo.address.country : "",
				state 		: user.profile.userBusinessInfo && user.profile.userBusinessInfo.address ? user.profile.userBusinessInfo.address.state : "",
				city 			: user.profile.userBusinessInfo && user.profile.userBusinessInfo.address ? user.profile.userBusinessInfo.address.city : "",
			};
			// console.log("2 respData => ", respData);
			res.status(200).json({profile : respData, success : true});

			// }

		})
		.catch(error => {
			console.log("Error while finding User => ", error);
			res.status(500).json({ message: "Error while finding User" })
		})
}


exports.get_consultant_profile = (req, res, next) => {
	// console.log("get_consultant_profile req.params => ", req.params);

	User.findOne({ _id: ObjectID(req.params.user_id) },{services:0})
		.then(user => {
			// console.log("get_consultant_profile user => ", user);

			if (user) {

				Enterprise.findOne({ _id: ObjectID(user.profile.company_id) })
					.then(async enterprise => {
						// console.log("get_consultant_profile enterprise => ", enterprise);

						var totalCalls = await getConsultantCalls(req.params.user_id);
						var recommended = await getRecommended(req.params.user_id);
						var nextAvailable = await getNextAvailability(req.params.user_id);


						var data = {
							user_id 					: user._id,
							profile 					: user.profile,
							address 					: user.address,
							otherInfo 				: user.otherInfo,
							documents 				: user.documents,
							role 						: user.roles,
							createdAt 				: user.createdAt,
							subcatgApprovalLog 	: user.subcatgApprovalLog,
							expertiseApprovalLog : user.expertiseApprovalLog,
							enterprise 				: enterprise,
							catg_subCatg_expertise: user.catg_subCatg_expertise,
							totalCalls 				: totalCalls,
							recommended 			: recommended,
							nextAvailable 			: nextAvailable,
						};
						// console.log("get_consultant_profile data => ", data);
						res.status(200).json(data);
					})
					.catch(err => {
						console.log('user error ', err);
						res.status(500).json({ error: err });
					});
			} else {
				res.status(200).json({ message: "USER_NOT_FOUND" });
			}
		})
		.catch(err => {
			console.log('user error ', err);
			res.status(500).json({
				error: err
			});
		});
}

function getNextAvailability(consultant_id){
	// console.log("consultant_id => ",consultant_id);

	return new Promise((resolve,reject)=>{
		AppointmentSlots.findOne({user_id : ObjectID(consultant_id)})
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

      var selector = { consultant_id: ObjectID(consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} }
   	var query = { $match : selector};
   	var statusList =["captured","TXN_SUCCESS"];
     	// Appointments.find({ consultant_id: (consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} },{"meetingRoomDetails":0})
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
            { "$unwind": "$order" },
            { 
               "$match": { 
                  "order.status": { "$in": statusList },
               } 
            }
        	])
        .then(totalData => {
            // console.log("totalData==============1=============",totalData.length)
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
		// Appointments.countDocuments({ consultant_id: consultant_id, status: {$nin : ['cancelled','pending']} })
		// // Appointments.countDocuments({ consultant_id: consultant_id, status: { $ne: 'cancelled' } })
		// 	.then(totalCalls => {
		// 		resolve(totalCalls);
		// 	})
		// 	.catch(err => {
		// 		console.log('getConsultantCalls error => ', err);
		// 		reject(-1);
		// 	});
	})
}

function getRecommended(consultant_id) {
	return new Promise((resolve, reject) => {
		Reviews.countDocuments({ consultantId: consultant_id, recommend: true })
			.then(totalRecommended => {
				resolve(totalRecommended);
			})
			.catch(err => {
				console.log('getRecommended error => ', err);
				reject(-1);
			});
	})
}


exports.update_for_myconsultant = (req, res, next) => {
	var ready = false;
	var added = false;
	User.findOne({ _id: req.body.user_id })
		.then(userData => {
			var myConsultants = userData.myConsultants;
			var index = myConsultants.indexOf(req.body.myConsultant_id);

			if (index > -1) {
				myConsultants.splice(index, 1);
				ready = true;
			} else {
				myConsultants.push(req.body.myConsultant_id);
				ready = true;
				added = true;
			}

			if (ready) {
				User.updateOne(
					{ _id: req.body.user_id },
					{ $set: { myConsultants: myConsultants } }
				)
					.then(updatedMyConsultant => {
						// console.log("updatedMyConsultant => ", updatedMyConsultant, " | added = ", added);

						res.status(200).json({
							message: "Update Successful!",
							data: updatedMyConsultant,
							added: added
						})
					})
					.catch(error => {
						console.log("Error while update for myconsultants", error);
						res.status(500).json({ message: "Error while update for myconsultants", error: error });
					})
			}
		})
		.catch(error => {
			console.log("Error while find user", error);
			res.status(500).json({ message: "Error while find user", error: error });
		})
}

exports.update_subscription_plan = async (req, res, next) => {

	console.log("update_subscription_plan => ", req.body);

	const inputObj = {
		discountPercent: 0,
		taxPercent: req.body.gstRate,
		walletAmount: 0,
		user_id: req.body.user_id,
		type: "Subscription to : " + req.body.subscriptionPlanName + " plan",
		lineItemDesc: req.body.subscriptionPlanName + " - " + req.body.subscriptionPlanType,
		quantity: 1,
		qtyUnit: "number",
		unitPrice: parseInt(req.body.subscriptionPlanCost),
		currency: "INR",
		taxName: "GST",
	};

	const order = await insertNewOrder(inputObj);
	// console.log("order => ", order);
	//plan for 6 months 
	var startDate 		= new Date();
	var endDate 	 	= moment(startDate).add(6,'months');
	var endDateISO 	= moment(endDate).format("YYYY-MM-DD");

	if (order.success) {
		User.updateOne({ _id: ObjectID(req.body.user_id) },
			{
				$set: {
					"subscriptionDetails.planName" 	: req.body.subscriptionPlanName,
					"subscriptionDetails.planCost" 	: req.body.subscriptionPlanCost,
					"subscriptionDetails.gstRate" 	: req.body.gstRate,
					"subscriptionDetails.gstAmount" 	: req.body.gstAmount,
					"subscriptionDetails.amountPayable" 	: req.body.amountPayable,
					"subscriptionDetails.planType" 	: req.body.subscriptionPlanType,
					"subscriptionDetails.startDate" 	: new Date(),
					"subscriptionDetails.startDateISO" : moment().format("YYYY-MM-DD"),
					"subscriptionDetails.endDate" 	: endDate,
					"subscriptionDetails.endDateISO" : endDateISO,
					"subscriptionDetails.status" 		: 'paid',
					"subscriptionDetails.order_id" 	: order.result.record._id,
				}
			})
			.then(updatedUser => {
				console.log("updatedUser => ", updatedUser);
				res.status(200).json({
					success: true,
					message: "Subscription Plan Updated Successfully and new Order inserted!",
					order: order.response
				})
			})
			.catch(error => {
				console.log("Error while updating the subscription_plan ", error);
				res.status(500).json({ message: "Error while updating the subscription_plan", error: error });
			})
	} else {
		console.log("Error while inserting the new order ", order.response);
		res.status(500).json({ message: "Error while inserting the new order", error: order.response });
	}

}

exports.update_renew_subscription_plan = async (req, res, next) => {

	/*===========================================================
		Logic

		1. Check if current subscription plan is expired
		2. If current subscription plan status === 'Paid', add new data in futurePlans
		3. If current subscription plan status === 'expired', add Old data in planHistory
		4. First put data in planHistory and second update for new data
	  ===========================================================*/


	const inputObj = {
		discountPercent  		: 0,
		taxPercent 				: req.body.gstRate,
		walletAmount 			: 0,
		user_id 					: req.body.user_id,
		type: "Subscription to 	: " + req.body.subscriptionPlanName + " plan",
		lineItemDesc			: req.body.subscriptionPlanName + " - " + req.body.subscriptionPlanType,
		quantity 				: 1,
		qtyUnit 					: "number",
		unitPrice				: parseInt(req.body.subscriptionPlanCost),
		currency					: "INR",
		taxName 					: "GST",
	};

	const order = await insertNewOrder(inputObj);
	console.log("1 order => ", order);

	if(order.success){
		const userData = await getUserData(req.body.user_id);
		console.log("userData => ", userData);
		if(userData.success) {
			if(userData.data.subscriptionDetails.status==="paid"){
				//This is a straight forward case i  which we add new plan data to FuturePlans array
				
				console.log("userData.data.subscriptionDetails.endDate =>",userData.data.subscriptionDetails.endDate);				
				var startDate = moment(userData.data.subscriptionDetails.endDate).add(1,'days');
				var startDateISO = moment(startDate).format("YYYY-MM-DD");

				if(req.body.subscriptionPlanType === 'Quarter'){
					var endDate = moment(startDate).add(3,'months');
					var endDateISO = moment(endDate).format("YYYY-MM-DD");
				}

				if(req.body.subscriptionPlanType === 'Annual'){
					var endDate = moment(startDate).add(12,'months');
					var endDateISO = moment(endDate).format("YYYY-MM-DD");
				}

				User.updateOne({ _id: ObjectID(req.body.user_id) },
									{
										$push:{ 
											"subscriptionDetails.futurePlans": {
												"planName" 			: req.body.subscriptionPlanName,
												"planCost" 			: req.body.subscriptionPlanCost,
												"gstRate" 			: req.body.gstRate,
												"gstAmount" 		: req.body.gstAmount,
												"amountPayable" 	: req.body.amountPayable,
												"planType" 			: req.body.subscriptionPlanType,
												"startDate" 		: startDate,
												"startDateISO" 	: startDateISO,
												"endDate" 			: endDate,
												"endDateISO" 		: endDateISO,
												"status" 			: 'pending',
												"order_id" 			: order.result.record._id,
											}
										}
									})
					.then(updatedUser => {
						console.log("updatedUser => ", updatedUser);
						res.status(200).json({
							success: true,
							message: "Make your payment now",
							order  : order
						})
					})
					.catch(error => {
						console.log("Error while renewing the subscription_plan ", error);
						res.status(500).json({ message: "Error while renewing the subscription_plan", error: error });
					})			
			}

			if(userData.data.subscriptionDetails.status==="expired"){
				console.log("userData.data.subscriptionDetails.endDate =>",userData.data.subscriptionDetails.endDate);
				var startDate 		= moment();
				var startDateISO 	= moment(startDate).format("YYYY-MM-DD");

				if(req.body.subscriptionPlanType === 'Quarter'){
					var endDate = moment(startDate).add(3,'months');
					var endDateISO = moment(endDate).format("YYYY-MM-DD");
				}

				if(req.body.subscriptionPlanType === 'Annual'){
					var endDate = moment(startDate).add(12,'months');
					var endDateISO = moment(endDate).format("YYYY-MM-DD");
				}

				//=================
				//1. In this case, add current subscription details to plan history
				//2. Move new plan details to current subscription details
				//=================

				User.updateOne({ _id: ObjectID(req.body.user_id) },
					{
						$push : {
									"subscriptionDetails.planHistory" : {
										"planName" 			: userData.data.subscriptionDetails.planName,
										"planCost" 			: userData.data.subscriptionDetails.planCost,
										"gstRate" 			: userData.data.subscriptionDetails.gstRate,
										"gstAmount" 		: userData.data.subscriptionDetails.gstAmount,
										"amountPayable" 	: userData.data.subscriptionDetails.amountPayable,
										"planType" 			: userData.data.subscriptionDetails.planType,
										"startDate" 		: userData.data.subscriptionDetails.startDate,
										"startDateISO" 	: userData.data.subscriptionDetails.startDateISO,
										"endDate" 			: userData.data.subscriptionDetails.endDate,
										"endDateISO" 		: userData.data.subscriptionDetails.endDateISO,
										"order_id" 			: userData.data.subscriptionDetails.order_id,
										"status" 			: userData.data.subscriptionDetails.status														
									}
								}
					})
					.then(updatedUser => {
						console.log("updatedUser => ", updatedUser);
						User.updateOne({ _id: ObjectID(req.body.user_id) },
											{
												$set: {
													"subscriptionDetails.planName" 			: req.body.subscriptionPlanName,
													"subscriptionDetails.planCost" 			: req.body.subscriptionPlanCost,
													"subscriptionDetails.gstRate" 			: req.body.gstRate,
													"subscriptionDetails.gstAmount" 			: req.body.gstAmount,
													"subscriptionDetails.amountPayable" 	: req.body.amountPayable,
													"subscriptionDetails.planType" 			: req.body.subscriptionPlanType,
													"subscriptionDetails.startDate" 			: startDate,
													"subscriptionDetails.startDateISO" 		: startDateISO,
													"subscriptionDetails.endDate" 			: endDate,
													"subscriptionDetails.endDateISO" 		: endDateISO,
													"subscriptionDetails.status" 				: 'paid',
													"subscriptionDetails.order_id" 			: order.result.record._id,
												}
										})
							.then(updatedUser => {
								res.status(200).json({
									success: true,
									message: "Make your payment now",
									order  : order
								})
							})
							.catch(error => {
								console.log("2. Error while renewing the subscription_plan ", error);
								res.status(500).json({ message: "Error while renewing the subscription_plan", error: error });
							})							
					})
					.catch(error => {
						console.log("1. Error while renewing the subscription_plan ", error);
						res.status(500).json({ message: "Error while renewing the subscription_plan", error: error });
					})
			}		
		} else {
			console.log("Error while fetching user data ", userData);
			res.status(500).json({ message: "Error while fetching user data ", error: userData});
		}
	}else{
		console.log("Error while inserting new order ", order);
		res.status(500).json({ message: "Error while inserting new order ", error: order});
	}

}


function getUserData(user_id) {
	return new Promise((resolve, reject) => {
	User.findOne({ _id: ObjectID(user_id) })
			.then(data => {
				resolve({ success: true, data: data });
			})
			.catch(error => {
				console.log("Error  ", error);
				reject({ success: false, result: error })
			});
	});
}

function insertNewOrder(inputObj) {
	// console.log("insertNewOrder inputObj => ",inputObj);

	return new Promise((resolve, reject) => {
		axios.post("http://localhost:" + globalVariable.port + "/api/orders/post", inputObj)
			.then(savedOrder => {
				resolve({ success: true, result: savedOrder.data });
			})
			.catch(error => {
				console.log("Error during Appointment Insert : ", error);
				reject({ success: false, result: error })
			});
	});
}



exports.get_subscription_plan = (req, res, next) => {
	User.findOne({ _id: ObjectID(req.params.user_id) })
		.then(user => {
			// console.log("user => ", user.subscriptionDetails);
			res.status(200).json({
				success: true,
				message: "Subscription Details found for user",
				result: { _id: user._id, profile: user.profile, subscriptionDetails: user.subscriptionDetails, invitedConsultant : user.invitedConsultant }
			})
		})
		.catch(error => {
			console.log("Error while finding the subscription_plan ", error);
			res.status(500).json({ message: "Error while finding the subscription_plan", error: error });
		})
}


exports.getConsultatList = (req, res, next) => {
	var enterprise_id = req.params.enterprise_id;
	// console.log("User List ===", enterprise_id);
	User.find({ company_id: enterprise_id })
		.sort({ "createdAt": -1 })
		.then(consultatList => {
			res.status(200).json({
				consultatList: consultatList,
				message: "Consultat List Generated !!"
			})
		})
		.catch(error => {
			res.status(500).json({
				error: error,
				message: "Some error occured while generating consultat list"
			})
		});
}


exports.check_unique_mobile_number = (req, res, next) => {
	var mobileNumber = req.params.mobileNumber;
	// console.log("mobileNumber ==> ", mobileNumber);

	User.findOne({ "profile.mobile": mobileNumber })
		.then(user => {
			// console.log("user ==> ", user._id);
			if (user && user._id) {
				res.status(200).json({
					success: true,
					numberAlreadyUsed: true
				})
			} else {
				res.status(200).json({
					success: true,
					numberAlreadyUsed: false
				})
			}
		})
		.catch(error => {
			res.status(500).json({
				error: error,
				message: "Some error occured while validating mobile number"
			})
		});
}


exports.fetchLinkedinProfile = async (req, res, next) => {
	console.log("fetchLinkedinProfile req.body => ",req.body);

	const { profileType, userId, url } = req.body
	const Model = {
		consultant: User,
		enterprise: Enterprise
	}

	if (!profileType) {
		console.log("error => Invalid profile type");
		res.status(500).json({
			success: false,
			error: "Please provide a valid profile type"
		})
		return
	}
	const isExists = await User.exists({ _id: ObjectID(userId) })
	if (!isExists || url == null) {
		console.log("error => Linkedin profile not found or URL is empty");

		res.status(500).json({
			success: false,
			error: "Linkedin profile not found or URL is empty"
		})
		return
	}

	const linkedinProfile = await getLinkedinProfile(profileType, url)
	console.log("await getLinkedinProfile response => ",linkedinProfile);

	if (linkedinProfile.success) {		
		console.log("linkedinProfile => ",linkedinProfile);
		const field = profileType == "consultant" ? "profile.userLinkedinProfile" : "profile.entLinkedinProfile";

		const response=await User.updateOne({ _id: ObjectID(userId) }, { $set: { [field]: linkedinProfile.data } })

		res.status(200).json({ ...linkedinProfile })
		return
	}

	res.status(500).json({ ...linkedinProfile })

}