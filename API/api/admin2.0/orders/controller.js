const mongoose 		= require("mongoose");
var 	ObjectId 		= require('mongodb').ObjectID;
var 	moment 			= require('moment');
const User 				= require('../userManagementnew/ModelUsers.js');
const globalVariable = require("../../../nodemonConfig.js");
const Appointments 	= require('../appointments/model.js');
const Orders 			= require('./model.js');
const MasterNotifications 		= require('../notificationManagement/ModelMasterNotification.js');
const {sendNotification, 
		getUserDetailsWith_id} 	= require("../common/globalFunctions");



exports.insertOrder = (req, res, next) => {
	// console.log("insertOrder req.body = ",req.body);

	Orders.find({})
		.sort({ orderNum: -1 })
		.limit(1)
		.then(maxOrderNum => {
			// console.log("maxOrderNum => ",maxOrderNum);

			if (maxOrderNum && maxOrderNum.length > 0 && maxOrderNum[0].orderNum) {
				var newOrderNum = maxOrderNum[0].orderNum + 1;
			} else {
				var newOrderNum = 1001;
			}
			var discountPercent = parseInt(req.body.discountPercent) ? parseInt(req.body.discountPercent) : 0

			var totalCost 					= parseInt(req.body.quantity) * parseInt(req.body.unitPrice);
			var discountValue 				= discountPercent * parseInt(totalCost);
			var totalCostAfterDiscount 		= parseInt(totalCost) - parseInt(discountValue);
			var taxValue 					= parseInt((totalCostAfterDiscount * req.body.taxPercent) / 100);
			var netAmountPayable 			= totalCostAfterDiscount + taxValue - req.body.walletAmount;

			const order = new Orders({
				_id: new mongoose.Types.ObjectId(),
				orderNum: newOrderNum,
				user_id: req.body.user_id,
				consultant_id: req.body.consultant_id ? req.body.consultant_id : null,
				paymentMadeBy: req.body.user_id,
				type: req.body.type,
				lineItemDesc: req.body.lineItemDesc,
				quantity: req.body.quantity,
				qtyUnit: req.body.qtyUnit,
				unitPrice: req.body.unitPrice,
				currency: req.body.currency,
				totalCost: totalCost.toFixed(2),
				discountType: req.body.discountType,
				discountPercent: req.body.discountPercent,
				discountValue: discountValue.toFixed(2),
				totalCostAfterDiscount: totalCostAfterDiscount.toFixed(2),
				taxName: req.body.taxName,
				taxPercent: req.body.taxPercent,
				taxValue: taxValue.toFixed(2),
				walletAmount: req.body.walletAmount,
				netAmountPayable: netAmountPayable.toFixed(2),
				status: "unpaid",
				paymentDetail:null,
				createdBy: req.body.user_id,
				createdAt: new Date(),
			});

			order.save()
				.then(savedOrder => {
					res.status(200).json({
						success: true,
						message: "Insert Successful",
						record: savedOrder
					});
				})
				.catch(error => {
					console.log("Error during Order Insert : ", error);
					res.status(500).json({
						success: false,
						message: "Error during Order Insert",
						error: error
					});
				});
		})
		.catch(error => {
			console.log("Error during Finding Max OrderNum : ", error);
			res.status(500).json({
				success: false,
				message: "Error during Finding Max OrderNum",
				error: error
			});
		})
};


function sentEmailNotification(user_id, event) {
	MasterNotifications.findOne({
		"event": event,
		"templateType": "Email",
		"role": "user",
		"status": "active",
	})
		.then(template => {
			if (template && template._id) {
				//Send mail to user
				User.findOne({ _id: ObjectId(user_id) })
					.then(userDetails => {
						if (userDetails) {
							var email = userDetails.profile.email;
							var formValues = {
								to: email,
								subject: template.subject, // Subject line
								text: template.content, // plain text body
								html: template.content // html body
							}
							axios.post('http://localhost:' + globalVariable.port + '/api/send-email', formValues)
								.then(emailResponse => {
									console.log("Appointment Book Email Response => ", emailResponse)
								})
								.catch(error => {
									console.log("Appointment Book Email Error => ", error)
								})
						} else {
							console.log("User Not Found with user_id = " + user_id)
						}
					})
					.catch(error => {
						console.log("1 Error during Find User Email : ", error);
					})
			} else {
				console.log("No Email template found for event " + event + " & role=user");
			}
		})
		.catch(error => {
			console.log("2 Error during Find Email Template : ", error);
		})
}






exports.patchOrder = (req, res, next) => {
	// console.log("patchStatus req.body = ",req.body);

	Appointments.updateOne({ _id: req.body.appointment_id }, { $set: { status: "cancelled" } })
		.then(updatedApmt => {
			console.log("updatedApmt = ", updatedApmt);
			res.status(200).json({
				data: updatedApmt,
				message: "Appointment Updated Successfully!",
				success: true
			});
		})
		.catch(error => {
			console.log("1 Error during Appointment Update : ", error);
			res.status(500).json({ message: "Error during Appointment Update", error: error });
		})
};

exports.getOneOrder = (req, res, next) => {
	// console.log("req.params => ", req.params.order_id);
	Orders.findOne({ _id: ObjectId(req.params.order_id) })
		.populate({
			path:"user_id",
			populate: {
		   	path : 'profile.company_id',
		   	model: 'enterprise'
		 	} 					
		})
		.then(order => {
			// console.log("getOneOrder order -> ",order);
			res.status(200).json({
				success: true,
				order: order
			});
		})
		.catch(error => {
			console.log("getOneOrder Error -> ", error);
			res.status(500).json({
				success: false,
				message: "Error while finding Orders",
				error: error
			});
		})
}

exports.getOneOrderDataforInvoice = (req, res, next) => {
	console.log("req.params => ", req.params.order_id);
	Orders.findOne({ _id: ObjectId(req.params.order_id) })
		.populate({
			path:"user_id",
			populate: {
		   	path : 'profile.company_id',
		   	model: 'enterprise'
		 	} 					
		})
		.then(order => {
			// console.log("getOneOrder order -> ",order);
			res.status(200).json({
				success: true,
				order: order
			});
		})
		.catch(error => {
			console.log("getOneOrder Error -> ", error);
			res.status(500).json({
				success: false,
				message: "Error while finding Orders",
				error: error
			});
		})
}


exports.getAllOrders = (req, res, next) => {
	// console.log("req.params => ", req.params);
	var appointments = [];

	Appointments.find({ consultant_id: ObjectId(req.params.consultant_id) })
		.populate("user_id")
		.then(data => {
			// console.log("data -> ",data);
			if (data) {
				for (var i = 0; i < data.length; i++) {
					var apmtDateArr = data[i].appointmentDate.split("-");
					var apmtDate = apmtDateArr[2] + "-" + apmtDateArr[1] + "-" + apmtDateArr[0];

					if (apmtDate >= req.params.fromDate && apmtDate <= req.params.toDate) {
						// console.log("apmtDate => ",apmtDate," | fromDate => ",req.params.fromDate," | toDate => ",req.params.toDate);
						appointments.push(data[i]);
					}
				}

				if (i >= data.length) {
					// console.log("appointments => ", appointments);

					res.status(200).json({
						success: true,
						appointments: appointments
					});
				}

			} else {
				res.status(200).json({
					success: false,
					message: "Data Not Found"
				});
			}
		})
		.catch(error => {
			console.log("Error -> ", error);
			res.status(500).json({
				success: false,
				message: "Error while finding Appointments",
				error: error
			});
		})
}


exports.updateOrderStatus = (req, res, next) => {
	// console.log("patchStatus req.body = ",req.body);

	Orders.findOneAndUpdate(
			{ _id: req.params.order_id }, 
			{
				$set: {
					status: req.body.status, 
					paymentDetail: {
						transactionId: req.body.paymentDetail.transactionId,
						transactionDate: req.body.paymentDetail.transactionDate,
						currency: req.body.paymentDetail.currency,
						transactionAmount: req.body.paymentDetail.transactionAmount,
						paymentMode: req.body.paymentDetail.paymentMode,
						paymentOrderId:req.body.paymentDetail.paymentOrderId

					}
				}
			},
			{new : true}
		)
		.then(async (updatedOrder)=>{
			// console.log("updatedOrder = ", updatedOrder);

			if(updatedOrder.user_id){
				var updateUserOrderSt = await updateUserOrderStatus(updatedOrder.user_id);
				// console.log("updateUserOrderStatus => ",updateUserOrderSt);

				var userDetails = await getUserDetailsWith_id(updatedOrder.user_id);

				if(userDetails.success){
					var userNotificationValues = {
						"event"				: "Profile Submitted by Consultant",
						"toUser_id" 		: userDetails.user._id.toString(),
						"toEmail"			: userDetails.user.profile.email,
						"toMobileNumber" 	: userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
						"toUserRole"		: 'consultant',
						"userDetails" 		: userDetails.user,
						"variables" 	: {
							UserFullName	: userDetails.user.profile.fullName,
						}
					}
					var send_notification_to_user = await sendNotification(userNotificationValues);					
					res.status(200).json({
						data: updatedOrder,
						message: "Order status Updated Successfully!",
						success: true
					});
				}else{
					// console.log("Issue with getUserDetailsWith_id userDetails => ",userDetails);
					res.status(200).json({
						data: updatedOrder,
						message: "Order status Updated Successfully, but notification can't be send!",
						success: true
					});
				}

			}


		})
		.catch(error => {
			console.log("1 Error during Order Update : ", error);
			res.status(500).json({ message: "Error during Order Update", error: error });
		})
};

function updateUserOrderStatus(user_id){
	return new Promise((resolve,reject)=>{
		User.updateOne(
			{_id : ObjectId(user_id)},
			{$set : {"subscriptionDetails.status" : "paid"}}
		)
		.then(updtUserStatus =>{
			resolve(1)
		})
		.catch(error =>{
			resolve(0)
		})
	})
}

exports.updateOrderStatusBookslot = (req, res, next) => {
	// console.log("updateOrderStatusBookslot req.body = ",req.body);

	Orders.findOneAndUpdate(
			{ _id: req.params.order_id }, 
			{
				$set: {
					status: req.body.status, 
					paymentDetail: {
						transactionId: req.body.paymentDetail.transactionId,
						transactionDate: req.body.paymentDetail.transactionDate,
						currency: req.body.paymentDetail.currency,
						transactionAmount: req.body.paymentDetail.transactionAmount,
						paymentMode: req.body.paymentDetail.paymentMode,
						paymentOrderId:req.body.paymentDetail.paymentOrderId
					}
				}
			},
			{new : true}
		)
		.then(updatedOrder=>{
			// console.log("updateOrderStatusBookslot updatedOrder = ", updatedOrder);

			Appointments.findOne({orderNum: updatedOrder.orderNum})
			.then(async appointment=>{
				if(updatedOrder.user_id){
					var userDetails = await getUserDetailsWith_id(updatedOrder.user_id);
					var consultantDetails = await getUserDetailsWith_id(updatedOrder.consultant_id);
					// console.log("appointment",appointment)
					if(userDetails.success && consultantDetails.success){
						var room_id = appointment?.meetingRoomDetails?.room_id;
						var owner_ref = appointment?.meetingRoomDetails?.owner_ref;
						var user = userDetails.user.profile.firstname;
						var consultant = consultantDetails.user.profile.firstname;
						// console.log("room_id",room_id)
						// console.log("owner_ref",owner_ref)
						var videoLinkforUser = globalVariable.websiteName+"/video-conference/"+room_id+"?isConsultant=false&id="+owner_ref+"&name="+user;
						var videoLinkforConsultant = globalVariable.websiteName+"/video-conference/"+room_id+"?isConsultant=false&id="+owner_ref+"&name="+consultant;
						// console.log("videoLinkforUser = >",videoLinkforUser);
						// console.log("videoLinkforConsultant = >",videoLinkforConsultant);
						var userNotificationValues = {
							"event"				: "Call Book",
							"toUser_id" 		: userDetails.user._id.toString(),
							"toEmail"			: userDetails.user.profile.email,
							"toMobileNumber" 	: userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
							"toUserRole"		: 'user',
							"userDetails" 		: userDetails.user,
							"variables" 	: {
								UserFullName		: userDetails.user.profile.fullName,
								ConsultantName		: consultantDetails.user.profile.fullName,
								IntroCallDate		: appointment.appointmentDate,
								IntroCallTime		: appointment.appointmentTime + " IST",
								IntroCallLink		: "<a href="+videoLinkforUser+" target='_blank' rel='noopener noreferrer'> Click Here</a>"
							}
						}
						// console.log("userNotificationValues",userNotificationValues)
						var send_notification_to_user = await sendNotification(userNotificationValues);

						var consultantNotificationValues = {
							"event"				: "Call Book",
							"toUser_id" 		: consultantDetails.user._id.toString(),
							"toEmail"			: consultantDetails.user.profile.email,
							"toMobileNumber" 	: consultantDetails.user.profile.isdCode + consultantDetails.user.profile.mobile,								
							"toUserRole"		: 'consultant',
							"userDetails" 		: consultantDetails.user,
							"variables" 	: {
								ConsultantName		: consultantDetails.user.profile.fullName,
								UserFullName		: userDetails.user.profile.fullName,
								UserEnterpriseName: userDetails.user.profile.company_id 
															? userDetails.user.profile.company_id.enterpriseName 
																? userDetails.user.profile.company_id.enterpriseName
																: "- Company Name Not Available -"
															: "- Company Name Not Available -" ,
								IntroCallDate		: appointment.appointmentDate,
								IntroCallTime		: appointment.appointmentTime + " IST",
								IntroCallLink		: "<a href="+videoLinkforConsultant+" target='_blank' rel='noopener noreferrer'> Click Here</a>"
							}
						}
						// console.log("consultantNotificationValues",consultantNotificationValues)
						var send_notification_to_consultant = await sendNotification(consultantNotificationValues);
						var adminNotificationValues = {
							"event"				: "Call Book",
							"toEmail"			: "admin@eadvicer.com",
							"toUserRole"		: 'admin',
							"variables" 	: {
								ConsultantName		: consultantDetails.user.profile.fullName,
								UserFullName		: userDetails.user.profile.fullName,
								UserEnterpriseName: userDetails.user.profile.company_id 
															? userDetails.user.profile.company_id.enterpriseName 
																? userDetails.user.profile.company_id.enterpriseName
																: "- Company Name Not Available -"
															: "- Company Name Not Available -" ,
								IntroCallDate		: appointment.appointmentDate,
								IntroCallTime		: appointment.appointmentTime + " IST",
								IntroCallLink		: "<a href="+videoLinkforConsultant+" target='_blank' rel='noopener noreferrer'> Click Here</a>"
							}
						}
						// console.log("adminNotificationValues",adminNotificationValues)
						var send_notification_to_admin = await sendNotification(adminNotificationValues);


						res.status(200).json({
							data: updatedOrder,
							message: "Order status Updated Successfully!",
							success: true
						});
					}else{
						// console.log("Issue with getUserDetailsWith_id userDetails => ",userDetails);
						res.status(200).json({
							data: updatedOrder,
							message: "Order status Updated Successfully, but notification can't be send!",
							success: true
						});
					}
				}
			})
			.catch(error => {
				console.log("1 Error during findone Appointment : ", error);
				res.status(500).json({ message: "Error during findone Appointment", error: error });
			})

		})
		.catch(error => {
			console.log("1 Error during Order Update : ", error);
			res.status(500).json({ message: "Error during Order Update", error: error });
		})
};

exports.renewSubscriptionOrder = (req, res, next) => {
	// console.log("renewSubscriptionOrder req.body = ",req.body);

	Orders.findOneAndUpdate(
			{ _id: req.params.order_id }, 
			{
				$set: {
					status: req.body.status, 
					paymentDetail: {
						transactionId 		: req.body.paymentDetail.transactionId,
						transactionDate 	: req.body.paymentDetail.transactionDate,
						currency 			: req.body.paymentDetail.currency,
						transactionAmount : req.body.paymentDetail.transactionAmount,
						paymentMode 		: req.body.paymentDetail.paymentMode,
						paymentOrderId 	: req.body.paymentDetail.paymentOrderId
					}
				}
			},
			{new : true}
		)
		.then(async (updatedOrder)=>{
			// console.log("updatedOrder = ", updatedOrder);

			if(req.body.status === 'captured'){
				if(updatedOrder.user_id){
					var userDetails = await getUserDetailsWith_id(updatedOrder.user_id);				
					// console.log("userDetails => ",userDetails);

					if(userDetails.success){
						var updateUserOrderStatus = await update_SubscriptionDetails(updatedOrder.user_id, req.params.order_id, userDetails.user);
						// console.log("update_SubscriptionDetails => ",updateUserOrderStatus);

						var userNotificationValues = {
							"event"				: "Renewal Successful",
							"toUser_id" 		: userDetails.user._id.toString(),
							"toEmail"			: userDetails.user.profile.email,
							"toMobileNumber" 	: userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
							"toUserRole"		: 'consultant',
							"userDetails" 		: userDetails.user,
							"variables" 	: {
								ConsultantName	: userDetails.user.profile.fullName,
								PlanName	: userDetails.user.subscriptionDetails.planName,
								PlanExpiryDate	: moment(userDetails.user.subscriptionDetails.enddate).format("DD-MM-YYYY"),
							}
						}
						var send_notification_to_user = await sendNotification(userNotificationValues);					
						res.status(200).json({
							data: updatedOrder,
							message: "Order status Updated Successfully!",
							success: true
						});
					}else{
						// console.log("Issue with getUserDetailsWith_id userDetails => ",userDetails);
						res.status(200).json({
							data: updatedOrder,
							message: "Order status Updated Successfully, but notification can't be send!",
							success: true
						});
					}
				}				
			}else{
				res.status(200).json({
					data: updatedOrder,
					message: "Payment failed",
					success: true
				});				
			}


		})
		.catch(error => {
			console.log("1 Error during Order Update : ", error);
			res.status(500).json({ message: "Error during Order Update", error: error });
		})
};


function update_SubscriptionDetails(user_id, order_id,userDetails){

	return new Promise((resolve,reject)=>{
		if(userDetails.subscriptionDetails.status === 'paid'){
			User.updateOne(
				{_id : ObjectId(user_id), "subscriptionDetails.futurePlans" : { $elemMatch : {"order_id" : order_id } } },
				{
					$set:{ 
						"subscriptionDetails.futurePlans.$.status":  'paid'
					}
				}
			)
			.then(updtUserStatus =>{
				resolve(1)
			})
			.catch(error =>{
				console.log("1. update_SubscriptionDetails error => ", error);
				resolve(0)
			})
		}else{
			User.updateOne(
				{_id : ObjectId(user_id)},
				{
					$set:{ 
						"subscriptionDetails.status":  'paid'
					}
				}
			)
			.then(updtUserStatus =>{
				resolve(1)
			})
			.catch(error =>{
				console.log("2. update_SubscriptionDetails error => ", error);
				resolve(0)
			})

		}
	})
}