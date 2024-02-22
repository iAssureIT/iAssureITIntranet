const mongoose					= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
var moment             		= require('moment');
const Feedback 				= require('./model.js');
const Axios                = require('axios');
const User 						= require('../userManagementnew/ModelUsers.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');
const {sendNotification} 	= require("../common/globalFunctions");

 
exports.insertFeedback = (req,res,next)=>{
	console.log("insertFeedback req.body => ", req.body);
	if(req.body.user_id !== ""){
		var feedback = new Feedback({
	      					_id  	: new mongoose.Types.ObjectId(),
							   user_id : req.body.user_id,
							   name    : req.body.name,
							   email   : req.body.email,
							   mobile  : req.body.mobNumber,
							   feedback   : req.body.feedback,
							   createdBy : req.body.user_id,
							   createdAt : new Date(),
							});		
	}else{
		var feedback = new Feedback({
	      					_id  	: new mongoose.Types.ObjectId(),
							   user_id : null,
							   name    : req.body.name,
							   email   : req.body.email,
							   mobile  : req.body.mobNumber,
							   feedback   : req.body.feedback,
							   createdBy : null,
							   createdAt : new Date(),
							});
	}

		feedback.save()
				.then(insertedFeedback =>{
					console.log("insertedFeedback response => ", insertedFeedback);
			
					//send Notification, email, sms to admin
					var formValues =  {
								"subject" 					: "Send Feedback",
								"adminEmail" 				: "support@eadvicer.com",
								"content" 					: 
															"<p>Dear Admin,</p> \n\n" +
							                        "<p>Username : "+ req.body.name+ "</p>" +
							                        "<p>Email : "+ req.body.email+ "</p>" +
							                        "<p>Mobile : "+ req.body.mobNumber+"</p>" + 
							                        "<p>Content : " + req.body.feedback+"</p>"+
							                        "Thanks & Regards <br/>\n" + 
							                        "<p>eAdvicer Portal System</p>" ,
						
					}
					console.log("formValues email => ",formValues);
               Axios.post('http://localhost:' + globalVariable.port +"/send-email-ses", formValues)
	                  .then(sendmaildata =>{
	                     // console.log("sendmaildata = ", sendmaildata);
	                  })
	                  .catch(error =>{
	                     console.log("sendmail error = ", error);
	                  })

					res.status(200).json({
						message 	: "Feedback inserted successfully",
						success 	: true,
						feedback    : insertedFeedback
					});					
				})
				.catch(error=>{
					console.log("Error while inserting feedback -> ",error);
					res.status(500).json({
						message 	: "Error while inserting feedback",
						success 	: false,
						error 		: error
					});
				})

};
