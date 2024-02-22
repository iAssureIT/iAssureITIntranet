const mongoose					= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
const Axios                = require('axios');
const Query 					= require('./model.js');
const moment 					= require('moment-timezone');

const User 						= require('../userManagementnew/ModelUsers.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');
const {sendNotification} 	= require("../common/globalFunctions");



exports.insertQuery = (req,res,next)=>{
	// console.log("insertQuery req.body => ", req.body);

	var query = new Query({
  						_id  					: new mongoose.Types.ObjectId(),
					   user_id 				: req.body.user_id,
			         userName    		: req.body.userName,
					   query   				: req.body.query,
			         consultantName 	: req.body.consultantName,
			         consultant_id  	: req.body.consultant_id,
			         tokenNumber    	: req.body.tokenNumber,
			         callDate       	: req.body.callDate,
			         raisedQuery    	: req.body.raisedQuery,
					   createdBy 			: req.body.user_id,
					   createdAt 			: new Date(),
					});

		query.save()
			.then((insertedQuery)=>{
				// console.log("insertedQuery response => ", insertedQuery);

				// var userNotificationValues = {
				// 			"userRole" 					: 'user',
				// 			"user_fullname" 			: req.body.userName,
				// 			"consultant_fullname" 	: req.body.consultantName,
         		// 		"token_number"    		: req.body.tokenNumber,
         		// 		"raised_query"    		: req.body.raisedQuery,
				// 			"query_dateTime" 			: moment().format('MMMM Do YYYY, h:mm:ss a'),
				// 			"date_of_call" 			: moment(req.body.callDate).format('MMMM Do YYYY, h:mm:ss a'),
				// }
				// // console.log("userNotificationValues email => ",userNotificationValues);
				// var send_notification_to_user = sendNotification(req.body.userName,"Raise A Query","user",userNotificationValues);
				// // console.log("send_notification_to_user => ",send_notification_to_user)

				// //send Notification, email, sms to admin
				// var adminNotificationValues =  {
				// 						"userRole" 					: 'user',
				// 						"user_fullname" 			: req.body.userName,
				// 						"consultant_fullname" 	: req.body.consultantName,
			    //      				"token_number"    		: req.body.tokenNumber,
         		// 					"raised_query"    		: req.body.raisedQuery,
				// 						"query_dateTime" 			: moment().format('MMMM Do YYYY, h:mm:ss a'),
				// 						"date_of_call" 			: moment(req.body.callDate).format('MMMM Do YYYY, h:mm:ss a')
				// }
				// console.log("adminNotificationValues email => ",adminNotificationValues);
				// var send_notification_to_user = sendNotification(req.body.userName,"Raise A Query","admin",adminNotificationValues);
				var formValues =  {
							"subject" 					: "Raise A Query",
							"adminEmail" 				: "support@eadvicer.com",
							"content" 					: 
														"<p>Dear Admin,</p> \n\n" +
						                        "<p>User Name : "+ req.body.userName+ "</p>" +
						                        "<p>Token Number : "+ req.body.tokenNumber+ "</p>" +
						                        "<p>Date of Call : " +  moment(req.body.callDate).format('MMMM Do YYYY, h:mm:ss a') +"</p>"+
						                        "<p>Consultant Name : "+ req.body.consultantName+ "</p>" +
						                        "<p>Query : " + req.body.raisedQuery+"</p>"+
						                        "Thanks & Regards <br/>\n" + 
						                        "<p>eAdvicer Portal System</p>" ,
					
				}
				console.log("formValues email => ",formValues);
         	Axios.post('http://localhost:' + globalVariable.port +"/send-email-ses", formValues)
               .then(sendmaildata =>{
                  console.log("sendmaildata = ", sendmaildata);
               })
               .catch(error =>{
                  console.log("sendmail error = ", error);
               })

				res.status(200).json({
					message 	: "Query inserted successfully",
					success 	: true,
					feedback : insertedQuery
				});					
			})
			.catch(error=>{
				console.log("Error while inserting Query -> ",error);
				res.status(500).json({
					message 	: "Error while inserting Query",
					success 	: false,
					error 	: error
				});
			})

};

function getUserProfile(user_id){

	return new Promise( (resolve, reject)=>{
			User.findOne({_id : ObjectId(user_id)},{services:0})
				.populate("profile.company_id")
				.then(user=>{
					// console.log(user_id, " | getUserProfile user => ",user);

					if(user){
						resolve(user);
					}else{
						resolve(0);
					}
				})
				.catch(error=>{
					console.log("Error while finding User profile -> ",error);
					reject(0);
				})		
	});
}


exports.getAppointmentSlots = (req,res,next)=>{
	console.log("req.body -> ",req.body);

	AppointmentSlots.findOne({user_id : ObjectId(req.body.user_id)})
				.then(data=>{
					console.log("data -> ",data);
					if(data){
						res.status(200).json(data);
					}else{
						res.status(200).json("Data Not Found");						
					}
				})
				.catch(error =>{
					console.log("Error -> ",error);
					res.status(500).json({
						message: "Error while finding AppointmentSlots",
						error : error
					});
				})
}

