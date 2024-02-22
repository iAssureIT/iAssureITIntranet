const mongoose 			= require("mongoose");
var ObjectId 				= require('mongodb').ObjectID;
var Axios 					= require('axios');
const moment 				= require('moment')
const User 					= require('../userManagementnew/ModelUsers.js');
const globalVariable 	= require("../../../nodemonConfig.js");
const Appointments 		= require('./model.js');
const AppointmentSlots 	= require('../appointmentSlots/model.js');
const Reviews 				= require('../review/model.js');
const Enterprise 			= require('../enterprise/model.js');
const MasterNotifications = require('../notificationManagement/ModelMasterNotification.js');
const {default:axios} 	= require("axios");
// const config 				= require("../../../nodemonConfig");
const { createVideoConferencingRoom, rescheduleVideoConference, cancelVideoConference, getVideConferenceDetailReport } = require("../common/globalFunctions.js");
const {sendNotification,getUserDetailsWith_id} 	= require("../../admin2.0/common/globalFunctions");


exports.bookAppointment = async (req, res, next) => {
	console.log("bookAppointment req.body = ", req.body);

	var bookedSlot = req.body.bookedSlot.split("#");
	var appointmentDate = bookedSlot[0];
	var appointmentTime = bookedSlot[1];

	var appointmentDateArr = appointmentDate.split("-");
	var isoApmtDate = appointmentDateArr[2] + "-" + appointmentDateArr[1] + "-" + appointmentDateArr[0];
	var appointmentDateFormat = new Date(appointmentDateArr[2], appointmentDateArr[1], appointmentDateArr[0]);


	const verifyDuplicate = await verifyDuplicateApmt(req.body.consultant_id, appointmentDate, appointmentTime);

	// console.warn(req.body,'req body');
	console.warn("verifyDuplicate => ", verifyDuplicate);

	if (verifyDuplicate.success) {
		// console.log("verifyDuplicate => ",verifyDuplicate);
		res.status(200).json({
			success: false,
			message: "This Appointment Date & Time are already booked.",
			record: verifyDuplicate.response
		});
	} else {
		//This Appointment Date & Time is available to book. 
		const maxTokenNumber = await getMaxToken();
		// console.log("maxTokenNumber => ", maxTokenNumber);

		if (maxTokenNumber.success) {
			var userEntpName = await getEnterpriseName(req.body.user_id);

			// console.log("50 appointmentTime => ", appointmentTime);

			var newToken = maxTokenNumber.response + 1;
			var dtFormat = getDateString(appointmentTime);
			var momentDt1 = moment.tz(appointmentDate + " " + appointmentTime, dtFormat, "Asia/Kolkata");
			var utcMomentDt = momentDt1.utc().format('YYYY-MM-DD HH:mm:ss');

			// console.log("*******************************************");
			// console.log("");
			// console.log("");
			// console.log("appointmentTime => ", appointmentTime);
			// console.log("momentDt1 => ", momentDt1);
			// console.log("utcMomentDt => ", utcMomentDt);
			// console.log("");
			// console.log("");
			// console.log("*******************************************");

			const meetingRoomDetails = await createVideoConferencingRoom(newToken, utcMomentDt,
				req.body.user_id,
				req.body.consultant_id,
				req.body.duration);

			// console.log("meetingRoomDetails => ", meetingRoomDetails);


			const appointment = new Appointments({
				_id: new mongoose.Types.ObjectId(),
				user_id: req.body.user_id,
				consultant_id: req.body.consultant_id,
				isoAppointmentDate: isoApmtDate,
				appointmentDateFormat: appointmentDateFormat,
				appointmentDate: appointmentDate,
				appointmentTime: appointmentTime,
				appointmentEnd : req.body.endTimeSlot,
				appointmentDuration : req.body.duration,
				tokenNumber: newToken,
				fees: req.body.unitPrice,
				consultantEntpName: req.body.enterpriseName,
				userEntpName: userEntpName,
				createdBy: req.body.user_id,
				meetingRoomDetails: {
					name: meetingRoomDetails?.room?.name,
					room_id: meetingRoomDetails?.room?.room_id,
					owner_ref: meetingRoomDetails?.room?.owner_ref,
					service_id: meetingRoomDetails?.room?.service_id,
					scheduledTime: meetingRoomDetails?.room?.settings?.scheduled_time,
				},
				createdAt: new Date(),
				reviewSubmitted : false,
				status : 'pending',
			});
			appointment.save()
				.then(async (savedAppointment) => {
					// console.log("savedAppointment = ", savedAppointment);

					const order = await insertNewOrder(req.body);
					// console.log("Inserted order = ", order.response.data);

					if (order.success) {
						const updatedAppointment = await updateAppointment(savedAppointment._id, order.response.data.record);
						// console.log("updatedAppointment = ", updatedAppointment.response);

						const userDetails = await getUserDetailsWith_id(req.body.user_id);
						// console.log("await userDetails => ",userDetails);
						const consultantDetails = await getUserDetailsWith_id(req.body.consultant_id);
						// console.log("await consultantDetails => ",consultantDetails);

						if (updatedAppointment.success) {
							// var userNotificationValues = {
							// 	"event"				: "Call Book",
							// 	"toUser_id" 		: req.body.user_id.toString(),
							// 	"toEmail"			: userDetails.user.profile.email,
							// 	"toMobileNumber" 	: userDetails.user.profile.isdCode + userDetails.user.profile.mobile,								
							// 	"toUserRole"		: 'user',
							// 	"userDetails" 		: userDetails.user,
							// 	"variables" 	: {
							// 		UserFullName		: userDetails.user.profile.fullName,
							// 		ConsultantName		: consultantDetails.user.profile.fullName,
							// 		IntroCallDate		: appointmentDate,
							// 		IntroCallTime		: appointmentTime,
							// 		IntroCallLink		: 'Link TBD'
							// 	}
							// }
							// var send_notification_to_user = await sendNotification(userNotificationValues);

							// var ConsultantNotificationValues = {
							// 	"event"				: "Call Book",
							// 	"toUser_id" 		: req.body.consultant_id.toString(),
							// 	"toEmail"			: consultantDetails.user.profile.email,
							// 	"toMobileNumber" 	: consultantDetails.user.profile.isdCode + consultantDetails.user.profile.mobile,								
							// 	"toUserRole"		: 'consultant',
							// 	"userDetails" 		: consultantDetails.user,
							// 	"variables" 	: {
							// 		ConsultantName		: consultantDetails.user.profile.fullName,
							// 		UserFullName		: userDetails.user.profile.fullName,
							// 		UserEnterpriseName: userDetails.user.profile.company_id 
							// 									? userDetails.user.profile.company_id.enterpriseName 
							// 										? userDetails.user.profile.company_id.enterpriseName
							// 										: "- Company Name Not Available -"
							// 									: "- Company Name Not Available -" ,
							// 		IntroCallDate		: appointmentDate,
							// 		IntroCallTime		: appointmentTime,
							// 		IntroCallLink		: 'Link TBD'
							// 	}
							// }
							// var send_notification_to_consultant = await sendNotification(ConsultantNotificationValues);


							apmtArr = appointmentDate.split("-");
							var day1 = moment([apmtArr[2], apmtArr[1], apmtArr[0]]).format("dddd");
							// console.log("day1 => ",day1);

							AppointmentSlots.findOne({ user_id: req.body.consultant_id })
								.then(data => {
									// console.log("AppointmentSlots data = ", data);
									var calendarDays = []
									if (data === null) {
										//It means consultant has not yet created any appointment slot. 
										//Just insert new record
										var Date1 = appointmentDate;
										var Day1 = day1;
										var Slot = appointmentTime;
										calendarDays.push({
											date: Date1,
											day: Day1,
											from: Slot,
											to: "",
											duration: "",
											status: "disabled"
										});

										var dayWiseArr = [
											{
												"day": "Monday",
												"phaseWiseSlots": [
													{ slotPhase: "Morning", duration: "60", unit: "Mins", slots: [{ startTime: "10:00 AM" }, { startTime: "11:00 AM" }, { startTime: "12:00 PM" }] },
													{ slotPhase: "Afternoon", duration: "60", unit: "Mins", slots: [{ startTime: "02:00 PM" }, { startTime: "03:00 PM" }, { startTime: "04:00 PM" }] },
													{ slotPhase: "Evening", duration: "60", unit: "Mins", slots: [{ startTime: "05:00 PM" }, { startTime: "06:00 PM" }, { startTime: "07:00 PM" }] },
												]
											},
											{
												"day": "Tuesday",
												"phaseWiseSlots": [
													{ slotPhase: "Morning", duration: "60", unit: "Mins", slots: [{ startTime: "10:00 AM" }, { startTime: "11:00 AM" }, { startTime: "12:00 PM" }] },
													{ slotPhase: "Afternoon", duration: "60", unit: "Mins", slots: [{ startTime: "02:00 PM" }, { startTime: "03:00 PM" }, { startTime: "04:00 PM" }] },
													{ slotPhase: "Evening", duration: "60", unit: "Mins", slots: [{ startTime: "05:00 PM" }, { startTime: "06:00 PM" }, { startTime: "07:00 PM" }] },
												]
											},
											{
												"day": "Wednesday",
												"phaseWiseSlots": [
													{ slotPhase: "Morning", duration: "60", unit: "Mins", slots: [{ startTime: "10:00 AM" }, { startTime: "11:00 AM" }, { startTime: "12:00 PM" }] },
													{ slotPhase: "Afternoon", duration: "60", unit: "Mins", slots: [{ startTime: "02:00 PM" }, { startTime: "03:00 PM" }, { startTime: "04:00 PM" }] },
													{ slotPhase: "Evening", duration: "60", unit: "Mins", slots: [{ startTime: "05:00 PM" }, { startTime: "06:00 PM" }, { startTime: "07:00 PM" }] },
												]
											},
											{
												"day": "Thursday",
												"phaseWiseSlots": [
													{ slotPhase: "Morning", duration: "60", unit: "Mins", slots: [{ startTime: "10:00 AM" }, { startTime: "11:00 AM" }, { startTime: "12:00 PM" }] },
													{ slotPhase: "Afternoon", duration: "60", unit: "Mins", slots: [{ startTime: "02:00 PM" }, { startTime: "03:00 PM" }, { startTime: "04:00 PM" }] },
													{ slotPhase: "Evening", duration: "60", unit: "Mins", slots: [{ startTime: "05:00 PM" }, { startTime: "06:00 PM" }, { startTime: "07:00 PM" }] },
												]
											},
											{
												"day": "Friday",
												"phaseWiseSlots": [
													{ slotPhase: "Morning", duration: "60", unit: "Mins", slots: [{ startTime: "10:00 AM" }, { startTime: "11:00 AM" }, { startTime: "12:00 PM" }] },
													{ slotPhase: "Afternoon", duration: "60", unit: "Mins", slots: [{ startTime: "02:00 PM" }, { startTime: "03:00 PM" }, { startTime: "04:00 PM" }] },
													{ slotPhase: "Evening", duration: "60", unit: "Mins", slots: [{ startTime: "05:00 PM" }, { startTime: "06:00 PM" }, { startTime: "07:00 PM" }] },
												]
											},
											{
												"day": "Saturday",
												"phaseWiseSlots": [
													{ slotPhase: "Morning", duration: "60", unit: "Mins", slots: [{ startTime: "10:00 AM" }, { startTime: "11:00 AM" }, { startTime: "12:00 PM" }] },
													{ slotPhase: "Afternoon", duration: "60", unit: "Mins", slots: [{ startTime: "02:00 PM" }, { startTime: "03:00 PM" }, { startTime: "04:00 PM" }] },
													{ slotPhase: "Evening", duration: "60", unit: "Mins", slots: [{ startTime: "05:00 PM" }, { startTime: "06:00 PM" }, { startTime: "07:00 PM" }] },
												]
											}
										]
										const appointmentSlots = new AppointmentSlots({
											_id: new mongoose.Types.ObjectId(),
											user_id: req.body.consultant_id,
											dayWiseSlots: dayWiseArr,
											calendarDays: calendarDays,
											createdBy: req.body.consultant_id,
											createdAt: new Date()
										});

										appointmentSlots.save()
											.then(savedAppointmentSlots => {
												// console.log("Insert Successful => ", savedAppointmentSlots);
											})
											.catch(error => {
												console.log("Error during AppointmentSlots Insert : ", error);
											})
									} else {
										calendarDays = data.calendarDays;
										var Date1 = appointmentDate;
										var Day1 = day1;
										var Slot = appointmentTime;
										calendarDays.push({
											date: Date1,
											day: Day1,
											from: Slot,
											to: "",
											duration: "",
											status: "disabled"
										});
										AppointmentSlots.updateOne(
											{ user_id: req.body.consultant_id },
											{
												$set: {
													calendarDays: calendarDays
												}
											}
										)
											.then(updatedAppointmentSlots => {
												// console.log("updatedAppointmentSlots = ", updatedAppointmentSlots);
											})
											.catch(error1 => {
												console.log("1 Error during AppointmentSlots Update : ", error1);
											})
									}
								})
								.catch(error2 => {
									console.log("2 Error during Finding the AppointmentSlots : ", error2);
								})



							res.status(200).json({
								success: true,
								message: "Insert Successful",
								record: { ...savedAppointment, order_id: order.response.data.record._id }
							});
						}
					} else {
						res.status(500).json({
							success: false,
							message: "Some Issue Occurred in Order Insert",
							record: order.response
						});
					}

				})
				.catch(error => {
					console.log("Error during Appointment Insert : ", error);
					res.status(500).json({
						success: false,
						message: "Error during Appointment Insert",
						error: error
					});
				});
		} else {
			res.status(500).json({
				success: false,
				message: "Some Issue Occurred in getMaxToken function",
				record: maxTokenNumber.response
			});
		}
	}
};



function getDateString(date) {
	return date.includes('AM') || date.includes('PM') || date.includes('am') || date.includes('pm') 
			? 
				'DD-MM-YYYY HH:mm:ss a' 
			: 
				"DD-MM-YYYY HH:mm" ;
}


function insertNewOrder(inputObj) {
	// console.log("insertNewOrder inputObj => ",inputObj);

	return new Promise((resolve, reject) => {
		Axios.post("http://localhost:" + globalVariable.port + "/api/orders/post", inputObj)
			.then(savedOrder => {
				resolve({ success: true, response: savedOrder });
			})
			.catch(error => {
				console.log("Error during Appointment Insert : ", error);
				reject({ success: false, response: error })
			});
	});
}

function updateAppointment(appointments_id, orderObj) {
	// console.log("orderObj = ",orderObj);

	return new Promise((resolve, reject) => {
		Appointments.updateOne(
			{ _id: appointments_id },
			{
				$set: {
					order_id: orderObj._id, orderNum: orderObj.orderNum
				}
			}
		)
			.then(updApmt => {
				resolve({ success: true, response: updApmt });
			})
			.catch(error => {
				console.log("Error during Appointment Update : ", error);
				reject({ success: false, response: error })
			});

	});
}

function getMaxToken() {
	// console.log("*** inside getMaxToken ***");

	return new Promise((resolve, reject) => {
		Appointments.find({ tokenNumber: { $exists: true } }, { tokenNumber: 1 })
			.sort({ tokenNumber: -1 })
			.limit(1)
			.then(maxTokenObj => {
				// console.log("maxTokenObj => ",maxTokenObj);
				if (maxTokenObj && maxTokenObj.length > 0 && maxTokenObj[0].tokenNumber) {
					resolve({ success: true, response: maxTokenObj[0].tokenNumber });
				} else {
					resolve({ success: true, response: 1000 });
				}
			})
			.catch(error => {
				console.log("Error getMaxToken function : ", error);
				reject({ success: false, response: error })
			});
	});
}

function verifyDuplicateApmt(consultant_id, apmtDate, apmtTime) {
	var selector = { consultant_id: consultant_id, appointmentDate: apmtDate, appointmentTime: apmtTime };
	// console.log("selector =>", selector);

	return new Promise((resolve, reject) => {
		Appointments.findOne(selector)
			.then(duplicate => {
				// console.log("duplicate =>", duplicate);

				if (duplicate) {
					resolve({ success: true, response: duplicate });
				} else {
					resolve({ success: false, response: "" });
				}
			})
			.catch(error => {
				console.log("Error verifyDuplicateApmt function : ", error);
				reject({ success: false, response: error })
			});

	});
}




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
									// console.log("Appointment Book Email Response => ", emailResponse)
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






exports.patchStatus = (req, res, next) => {
	// console.log("patchStatus req.body = ",req.body);


	Appointments.findByIdAndUpdate(
		{ _id: req.body.appointment_id }, 
		{
			$set: {				
				status 				: "cancelled",
				cancelDetails 	: 	{					
					cancelledBy_id			: req.body.cancelledBy_id,
					cancelledByName 		: req.body.cancelledByName,
					cancelledByRole 		: req.body.cancelledByRole,
					reasonForCancel 		: req.body.reasonForCancel,
					cancelledOn 	 		: new Date(),
					returnPercent 			: req.body.returnPercent,
					refundAmount 			: req.body.refundAmount,
					chargeableAmount 		: req.body.chargeableAmount,
					cancelledBeforeHours : req.body.cancelledBeforeHours
				}
			},
		}, 
		{ new: true }
	)
	.then(async (updatedApmt)=>{
		if (updatedApmt?.meetingRoomDetails?.room_id) {
			cancelVideoConference(updatedApmt?.meetingRoomDetails?.room_id)
		}
		const userDetails = await getUserDetailsWith_id(updatedApmt.user_id);
		const consultantDetails = await getUserDetailsWith_id(updatedApmt.consultant_id);

		if(req.body.cancelledByRole === 'user'){
			var event = "Call Cancelled By User";
		}else{
			var event = "Call Cancelled By Consultant";			
		}

		var userNotificationValues = {
			"event"				: event,
			"toUser_id" 		: userDetails.user._id.toString(),
			"toEmail"			: userDetails.user.profile.email,
			"toMobileNumber" 	: userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
			"toUserRole"		: 'user',
			"userDetails" 		: userDetails.user,
			"variables" 	: {
				UserFullName		: userDetails.user.profile.fullName,
				ConsultantName		: consultantDetails.user.profile.fullName,
				IntroCallDate		: updatedApmt.appointmentDate,
				IntroCallTime		: updatedApmt.appointmentTime,
			}
		}

		var send_notification_to_user = await sendNotification(userNotificationValues);

		var consultantNotificationValues = {
			"event"				: event,
			"toUser_id" 		: consultantDetails.user._id.toString(),
			"toEmail"			: consultantDetails.user.profile.email,
			"toMobileNumber" 	: consultantDetails.user.profile.isdCode + consultantDetails.user.profile.mobile,
			"toUserRole"		: 'consultant',
			"userDetails" 		: consultantDetails.user,
			"variables" 	: {
				UserFullName		: userDetails.user.profile.fullName,
				ConsultantName		: consultantDetails.user.profile.fullName,
				IntroCallDate		: updatedApmt.appointmentDate,
				IntroCallTime		: updatedApmt.appointmentTime,
			}
		}

		var send_notification_to_user = await sendNotification(consultantNotificationValues);



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



exports.patchReschedule = (req, res, next) => {
	 console.log("patchReschedule req.body = ", req.body);

	Appointments.findOne({_id : req.body.appointment_id})
	.then(oldAppointment=>{
		console.log("oldAppointment => ",oldAppointment);

		var bookedSlot 		= req.body.bookedSlot.split("#");
		var appointmentDate 	= bookedSlot[0];
		var appointmentTime 	= bookedSlot[1];

		var appointmentDateArr 		= appointmentDate.split("-");
		var isoApmtDate 				= appointmentDateArr[2] + "-" + appointmentDateArr[1] + "-" + appointmentDateArr[0];
		var appointmentDateFormat 	= new Date(appointmentDateArr[2], appointmentDateArr[1], appointmentDateArr[0]);
		var apmtDay 					= appointmentDateFormat.getDay();
		var currTime               = moment().tz('Asia/Kolkata');
		var limitTime		 			= moment(oldAppointment.meetingRoomDetails.scheduledTime).tz('Asia/Kolkata')
		// var limitTime		 			= moment(oldAppointment).subtract(120, 'm').tz('Asia/Kolkata')
		console.log("limitTime",limitTime)
		console.log("currTime",currTime)
		var timeDifference = (limitTime.diff(currTime, 'minutes'))


		console.log("timeDifference",timeDifference)
		if(timeDifference <=120){
			res.status(200).json({
				reschedule : false,
				data: oldAppointment,
				message: "Appointment can not be rescheduled before 2 hours of Scheduled Time!",
				success: true
			});	
		}else{
			Appointments.findByIdAndUpdate(
				{
					_id: req.body.appointment_id
				},
				{
					$set: {
						status: "rescheduled",
						isoAppointmentDate: isoApmtDate,
						appointmentDateFormat: appointmentDateFormat,
						appointmentDate: appointmentDate,
						appointmentTime: appointmentTime,
						rescheduledBy : req.body.createdBy
					}
				},
				{ new: true }
			)
			.then(updatedApmt => {
				console.log("updatedApmt = ", updatedApmt);

				AppointmentSlots.findOne({user_id : ObjectId(oldAppointment.consultant_id)})
				.then(apmtSlots =>{
					var calendarDays = apmtSlots.calendarDays;
					// console.log("calendarDays => ",calendarDays);
					let apmt 	= calendarDays.find(x => x.date === oldAppointment.appointmentDate && x.time === oldAppointment.appointmentTime);
					let index 	= calendarDays.indexOf(apmt);
					// console.log("apmt => ", apmt, " | index => ",index);
					calendarDays.splice(index,1);

					calendarDays.push({
	               "date" 	: appointmentDate,
	               "day" 	: apmtDay,
	               "from" 	: appointmentTime,
	               "to" 		: "",
	               "duration" : "",
	               "status" : "disabled"
	            })

					AppointmentSlots.updateOne(
						{user_id : ObjectId(oldAppointment.consultant_id)},
						{$set : {calendarDays : calendarDays}}
					)
					.then(async updtedApmtSlot=>{
						// console.log(" updtedApmtSlot => ",updtedApmtSlot);

						if (updatedApmt.meetingRoomDetails?.room_id) {
							var dtFormat 		= getDateString(updatedApmt.appointmentTime);
							var momentDt1 		= moment.tz(updatedApmt.appointmentDate + " " + updatedApmt.appointmentTime, dtFormat, "Asia/Kolkata");
							var utcMomentDt 	= momentDt1.utc().format('YYYY-MM-DD HH:mm:ss');
							rescheduleVideoConference(updatedApmt?.meetingRoomDetails?.room_id, utcMomentDt)
						}
						var userDetails 			= await getUserDetailsWith_id(updatedApmt.user_id);
						var consultantDetails 	= await getUserDetailsWith_id(updatedApmt.consultant_id);
						var userNotificationValues = {
							"event"				: "Call Reschedule by User",
							"toUser_id" 		: userDetails.user._id.toString(),
							"toEmail"			: userDetails.user.profile.email,
							"toMobileNumber" 	: userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
							"toUserRole"		: 'user',
							"userDetails" 		: userDetails.user,
							"variables" 		: {
								UserFullName		: userDetails.user.profile.fullName,
								ConsultantName		: consultantDetails.user.profile.fullName,
								IntroCallDate		: oldAppointment.appointmentDate,
								IntroCallTime		: oldAppointment.appointmentTime,
								NewIntroCallDate	: updatedApmt.appointmentDate,
								NewIntroCallTime	: updatedApmt.appointmentTime,
								NewIntroCallLink	: 'Link TBD'
							}
						}
						var send_notification_to_user = await sendNotification(userNotificationValues);
						var consultantNotificationValues = {
							"event"				: "Call Reschedule by User",
							"toUser_id" 		: consultantDetails.user._id.toString(),
							"toEmail"			: consultantDetails.user.profile.email,
							"toMobileNumber" 	: consultantDetails.user.profile.isdCode + userDetails.user.profile.mobile,
							"toUserRole"		: 'consultant',
							"userDetails" 		: consultantDetails.user,
							"variables" 		: {
								UserFullName		: userDetails.user.profile.fullName,
								ConsultantName		: consultantDetails.user.profile.fullName,
								IntroCallDate		: oldAppointment.appointmentDate,
								IntroCallTime		: oldAppointment.appointmentTime,
								NewIntroCallDate	: updatedApmt.appointmentDate,
								NewIntroCallTime	: updatedApmt.appointmentTime,
								NewIntroCallLink	: 'Link TBD'
							}
						}
						var send_notification_to_user = await sendNotification(consultantNotificationValues);
						res.status(200).json({
							reschedule : true,
							data: updatedApmt,
							message: "Appointment Rescheduled Successfully!",
							success: true
						});

					})
					.catch(error => {
						console.log("Error during update AppointmentSlots : ", error);
						res.status(500).json({ message: "Error during update AppointmentSlots", error: error });
					})
				})
				.catch(error => {
					console.log("Error during find AppointmentSlots : ", error);
					res.status(500).json({ message: "Error during find AppointmentSlots", error: error });
				})

			})
			.catch(error => {
				console.log("1 Error during Appointment Update : ", error);
				res.status(500).json({ message: "Error during Appointment Update", error: error });
			})
		}
	})
	.catch(error => {
		console.log("1 Error during Find Appointment : ", error);
		res.status(500).json({ message: "Error during Find Appointment", error: error });
	})

};

exports.getAllUserAppointments = (req, res, next) => {
	// console.log("req.params => ",req.params);
	var appointments = [];

	Appointments.find({ user_id: ObjectId(req.params.user_id) })
		.populate("consultant_id")
		.populate("order_id")
		.sort({ createdAt: -1 })
		.then(data => {
			// console.log("getAllUserAppointments data -> ",data);
			if (data) {
				for (var i = 0; i < data.length; i++) {
					var apmtDateArr = data[i].appointmentDate.split("-");
					var apmtDate = apmtDateArr[2] + "-" + apmtDateArr[1] + "-" + apmtDateArr[0];

					if (apmtDate >= req.params.fromDate && apmtDate <= req.params.toDate && data[i].order_id && ["captured","TXN_SUCCESS"].includes(data[i].order_id.status)) {
						// console.log("apmtDate => ", apmtDate, " | fromDate => ", req.params.fromDate, " | toDate => ", req.params.toDate);
						appointments.push(data[i]);
					}
				}

				if (i >= data.length) {
					// console.log("appointments => ",appointments);

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


exports.getAllConsultantAppointments = (req, res, next) => {
	// console.log("req.params => ",req.params);
	var appointments = [];

	Appointments.find({ consultant_id: ObjectId(req.params.consultant_id) })
		.populate("order_id")
		.populate("user_id")
		.sort({ createdAt: -1 })
		.then(async data => {
			if (data) {
				// console.log("getAllConsultantAppointments data => ",data);
				for (var i = 0; i < data.length; i++) {
					// console.log("data[i].appointmentDate = ", data[i].appointmentDate);
					var apmtDateArr = data[i].appointmentDate.split("-");
					var apmtDate = apmtDateArr[2] + "-" + apmtDateArr[1] + "-" + apmtDateArr[0];

					if (apmtDate >= req.params.fromDate && apmtDate <= req.params.toDate && data[i].order_id && ["captured","TXN_SUCCESS"].includes(data[i].order_id.status)) {
						// console.log("apmtDate => ",apmtDate," | fromDate => ",req.params.fromDate," | toDate => ",req.params.toDate);

						var reviewResponse = await getAppointmentReview(data[i].tokenNumber);

						if (reviewResponse.success) {
							appointments.push({
								...data[i]._doc,
								review: reviewResponse.review,
							});
						} else {
							res.status(500).json({
								success: false,
								message: "Error while geting Reviews for appointment",
								error: reviewResponse.review
							});
						}
					}
				}

				if (i >= data.length) {
					// console.log("consultant appointments => ", appointments);

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

exports.getOneConsultantAppointments = (req, res, next) => {
	// console.log("req.params => ",req.params);
	var appointments = [];

	Appointments.find({ 
			consultant_id: ObjectId(req.params.consultant_id), 
			status: { $ne: 'cancelled' } 
		})
		.populate("user_id")
		.then(data => {
			if (data) {
				// console.log("getAllConsultantAppointments data => ",data);
				for (var i = 0; i < data.length; i++) {
					// console.log("data[i] = ", data[i]);

					var apmtDateArr = data[i].appointmentDate.split("-");
					var apmtDate = apmtDateArr[2] + "-" + apmtDateArr[1] + "-" + apmtDateArr[0];
					var apmtTimeArr = data[i].appointmentTime.split(":"); // "06:00 PM"
					var minArr = apmtTimeArr[1].split(" "); //separating AM/PM
					if (minArr[1] === 'PM') {
						var hr = parseInt(apmtTimeArr[0]) + 12;
					} else {
						var hr = parseInt(apmtTimeArr[0]);
					}

					var sd = new Date(apmtDateArr[2], apmtDateArr[1], apmtDateArr[0], hr, parseInt(minArr[0]), 0, 0);
					var ed = new Date(apmtDateArr[2], apmtDateArr[1], apmtDateArr[0], hr, parseInt(minArr[0]), 0, 0);

					var currDt = moment().format('yyyy-MM-DD');
					var apmtDt = apmtDateArr[2] + "-" + apmtDateArr[1] + "-" + apmtDateArr[0];

					if (apmtDt > currDt) {
						var type = 'pending';
					}
					if (apmtDt < currDt) {
						var type = 'completed';
					}
					// console.log("hour => ", new Date().getHours());
					if (hr < new Date().getHours()) {
						var type = 'completed';
					}

					appointments.push({
						start: moment([apmtDateArr[2], apmtDateArr[1] - 1, apmtDateArr[0], parseInt(hr), parseInt(minArr[0]), 0, 0]),
						end: moment([apmtDateArr[2], apmtDateArr[1] - 1, apmtDateArr[0], parseInt(hr), parseInt(minArr[0]), 0, 0]),
						title: data[i].appointmentTime + " - " + data[i].user_id.profile.firstname + " " + data[i].user_id.profile.lastname,
						type: type
					});
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

function getAppointmentReview(tokenNumber) {
	return new Promise((resolve, reject) => {

		Reviews.findOne({ tokenNumber: tokenNumber })
			.then(review => {
				if (review) {
					resolve({ review: review, success: true });
				} else {
					resolve({ review: 0, success: true });
				}
			})
			.catch(error => {
				resolve({ review: error, success: false });
			})
	})
}




exports.getMyClientsList = (req, res, next) => {
	// console.log("req.params Clients List => ",req.params);
	var appointments = [];

	Appointments.find({ consultant_id: ObjectId(req.params.consultant_id) })
		.populate("user_id")
		.sort({ createdAt: -1 })
		.then(async (data) => {
			// console.log("Appointments data -> ",data);
			if (data) {
				// console.log("data => ",data);

				var uniqueuid = [];
				var uniqueAppointments = [];
				var uidCount = {};
				var lastContactDate = {};

				data.forEach((value, index) => {
					var user_id = value?.user_id?._id;
					// console.log("value => ",value.appointmentDate);

					if (uniqueuid.indexOf(user_id) === -1) {
						uniqueuid.push(user_id);
						uniqueAppointments.push(value);
						uidCount[user_id] = 1;
						lastContactDate[user_id] = value.appointmentDate;
						// console.log(user_id," | lastContactDate => ",lastContactDate);
					} else {
						uidCount[user_id] += 1
					}
				});

				// console.log("lastContactDate => ",lastContactDate);

				res.status(200).json({
					success: true,
					appointments: uniqueAppointments,
					uidCount: uidCount,
					lastContactDate: lastContactDate
				});

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

exports.searchMyClients = (req, res, next) => {
	// console.log("searchMyClients req.body => ", req.body);

	var appointments = [];

	Appointments.find({ consultant_id: ObjectId(req.body.consultant_id) })
		.populate("user_id")
		.sort({ createdAt: -1 })
		.then(async (data) => {
			// console.log("Appointments data -> ",data);
			if (data) {
				// console.log("data => ",data);

				var uniqueuid = [];
				var uniqueAppointments = [];
				var uidCount = {};
				var lastContactDate = {};

				data.forEach((value, index) => {
					var user_id = value.user_id._id;
					// console.log("value => ",value.appointmentDate);

					if (uniqueuid.indexOf(user_id) === -1) {
						uniqueuid.push(user_id);
						uniqueAppointments.push(value);
						uidCount[user_id] = 1;
						lastContactDate[user_id] = value.appointmentDate;
						// console.log(user_id," | lastContactDate => ",lastContactDate);
					} else {
						uidCount[user_id] += 1
					}
				});



				var searchResult = [];
				var st = req.body.searchText.toLowerCase();
				// console.log("uniqueAppointments.length => ", uniqueAppointments.length);

				for (var i = 0; i < uniqueAppointments.length; i++) {
					var fname = uniqueAppointments[i].user_id.profile.firstname.toLowerCase();
					var lname = uniqueAppointments[i].user_id.profile.lastname.toLowerCase();
					var entpName = uniqueAppointments[i].userEntpName.toLowerCase();

					if (req.body.searchText !== "") {
						if (fname.indexOf(st) > -1 || lname.indexOf(st) > -1 || entpName.indexOf(st) > -1) {
							searchResult.push(uniqueAppointments[i]);
						}
					} else {
						searchResult = uniqueAppointments;
					}
				}

				// console.log(i," searchResult = ",searchResult);

				if (i >= uniqueAppointments.length) {
					res.status(200).json({
						success: true,
						appointments: searchResult,
						uidCount: uidCount,
						lastContactDate: lastContactDate
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



// function getEnterpriseName(user_id) {
// 	// console.log("getEnterpriseName user_id => ", user_id);

// 	return new Promise((resolve, reject) => {
// 		User.findOne({ _id: ObjectId(user_id) })
// 			.then(userProfile => {
// 				// console.log("654 userProfile => ", userProfile);

// 				if (userProfile && userProfile.profile.company_id) {
// 					Enterprise.findOne({ _id: userProfile.profile.company_id }, { enterpriseName: 1 })
// 						.then(companyDetails => {
// 							console.log("companyDetails => ", companyDetails);
// 							if (companyDetails) {
// 								resolve(companyDetails.enterpriseName);
// 							} else {
// 								resolve("--NA--");
// 							}
// 						})
// 						.catch(error => {
// 							console.log("error in getEnterpriseDetails function => ", error);
// 							reject("--NA--")
// 						})
// 				}
// 			})
// 			.catch(error => {
// 				console.log("error in getEnterpriseDetails function => ", error);
// 				reject(0)
// 			})

// 	})
// }

function getEnterpriseName(user_id) {
	// console.log("getEnterpriseName user_id => ", user_id);

	return new Promise((resolve, reject) => {
		User.findOne({ _id: ObjectId(user_id) })
			.populate("profile.company_id")
			.then(user => {
				// console.log("getEnterpriseName user => ", user);
				if (user && user.profile && user.profile.company_id && user.profile.company_id.enterpriseName) {
					resolve(user.profile.company_id.enterpriseName);
				} else {
					resolve("--NA--");
				}
			})
			.catch(error => {
				console.log("error in getEnterpriseDetails function => ", error);
				reject(0)
			})

	})
}




exports.getAppointmentMeetingDetails = async (req, res, next) => {
	const roomId = req.params.roomId
	Appointments
		.findOne({ "meetingRoomDetails.room_id": roomId })
		.then(async appointment => {
			const cdrReport = await getVideConferenceDetailReport(appointment?.meetingRoomDetails?.room_id)
			// console.log(cdrReport, "cdrReport");
			if (cdrReport.success && cdrReport.data.cdr.length > 0) {
				Appointments
					.updateOne(
						{ _id: ObjectId(appointment._id) },
						{
							$set: {
								videoConferenceDetails: cdrReport.data.cdr.map(cdr => {
									return {

										cdr_id: cdr?.cdr_id,
										trans_date: cdr?.trans_date,
										room: {
											room_id: cdr?.room?.room_id,
											connect_dt: cdr?.room?.connect_dt,
											disconnect_dt: cdr?.room?.disconnect_dt,
											duration: cdr?.room?.duration,
											sip: cdr?.room?.sip
										},
										usage: {
											subscribed_minutes: cdr?.usage?.subscribed_minutes,
											published_minutes: cdr?.usage?.published_minutes,
											screen_minutes: cdr?.usage?.screen_minutes,
											connect_minutes: cdr?.usage?.connect_minutes,
											room_connect_minutes: cdr?.usage?.room_connect_minutes,
											connect_minutes_cal: cdr?.usage?.connect_minutes_cal,

										},
										user: {
											name: cdr?.user?.name,
											role: cdr?.user?.role,
											ref: cdr?.user?.ref,
										},
										price: {
											connect_duration: cdr?.price?.connect_duration
										},
									}
								})
							}



						}
					)
					.then(function (response) {

						res.status(200).json({
							success: true,
							data: response
						});
					})
					.catch(error => {
						res.status(500).json({
							success: false,
							error: error
						});
					})
			}
		})
		.catch(error => {
			console.log('getAppointmentMeetingDetails=>', error);
			res.status(500).json({
				success: false,
				error: error
			});
		})



}


exports.findReviewNotSubmitted = (req, res, next) => {
	const user_id = req.params.user_id
	var selector = {
			user_id 				: ObjectId(user_id), 					
			status 				: 'completed', 
			reviewSubmitted 	: {$exists: false},
			reviewSubmitted 	: false,
		};

	// console.log("selector => ",selector);

	Appointments
		.find(selector)
		.populate("order_id")
		.then(appointments => {
			// console.log("appointments => ",appointments.length);			
			if(appointments && appointments.length > 0){
				var appointmentsArr = [];
				for(var i=0; i<appointments.length; i++){
					if(appointments[i].order_id.status === 'captured'){
						// console.log("appointments[i] => ",appointments[i]);

						var apmtDateArr = appointments[i].appointmentDate.split("-");
						
						if(appointments[i].appointmentEnd){
							var apmtTimeArr = appointments[i].appointmentEnd.split(":"); // "06:00 PM"
						}else{
							var apmtTimeArr = appointments[i].appointmentTime.split(":"); // "06:00 PM"
						}
						var minArr = apmtTimeArr[1].split(" "); //separating AM/PM
						if (minArr[1] === 'PM') {
							var hr = parseInt(apmtTimeArr[0]) + 12;
						} else {
							var hr = parseInt(apmtTimeArr[0]);
						}
						if(hr<10){
							hr = '0'+hr;
						}
						var mins = parseInt(minArr[0]);
						if(mins<10){
							mins = '0'+mins;
						}

						var apmtTime = hr+":"+mins ;
						// console.log("apmtTime => ",apmtTime);

						var currDt = moment().tz('Asia/Kolkata').format('yyyy-MM-DD');
						var currTime = moment().tz('Asia/Kolkata').format('HH:mm');
						// console.log("currTime => ",currTime);

						var apmtDt = apmtDateArr[2] + "-" + apmtDateArr[1] + "-" + apmtDateArr[0];

						if((apmtDt < currDt) || (apmtDt===currDt && apmtTime < currTime)){
							appointmentsArr.push(appointments[i]);
						}

					}
				}
				if(i>=appointments.length){
					// console.log("appointmentsArr => ",appointmentsArr)
					if(appointmentsArr.length>0){
						res.status(200).json({
							success: true,
							appointments: appointmentsArr
						});											
					}else{
						res.status(200).json({
							success: false,
							appointments: []
						});
					}
				}
			}else{
				res.status(200).json({
					success: false,
					appointments: []
				});				
			}
		})
		.catch(error => {
			console.log('getAppointmentMeetingDetails=>', error);
			res.status(500).json({
				success: false,
				error: error
			});
		})

}


exports.monthlyCallsofConsultant = (req, res, next)=>{
	const consultant_id = req.params.user_id;

	var currDate = new Date();
	var currYear = currDate.getFullYear();
	var currMonth = currDate.getMonth();
	var startDate = new Date(currYear, currMonth, 1);
	var endDate = new Date(currYear, currMonth+1, 0);

	Appointments.find({
		"cancelDetails.cancelledBy_id" : consultant_id,
		"cancelDetails.cancelledOn" : {$gte:startDate, $lte:endDate},
		status : "cancelled"
	})
	.then(monthlyCalls =>{
      // console.log("monthlyCalls => ",monthlyCalls);      
		res.status(200).json({
			success: true,
			calls: monthlyCalls.length
		});     

	})
	.catch(error => {
		console.log('monthlyCallsofConsultant error =>', error);
		res.status(500).json({
			success: false,
			error: error
		});
	})

}
