const mongoose					= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
const Contact 					= require('./model.js');
const User 						= require('../userManagementnew/ModelUsers.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');



exports.insertContact = (req,res,next)=>{
	console.log("insertContact req.body => ", req.body);

	var contact = new Contact({
  						_id  			: new mongoose.Types.ObjectId(),
					  	name            :req.body.name,
					    phoneNumber     :req.body.phoneNumber,
					    email           :req.body.email,
					    message         :req.body.message,
						createdAt 		: new Date(),
					});

		contact.save()
			.then(insertedContact =>{
				console.log("insertedContact response => ", insertedContact);

				res.status(200).json({
					message 	: "Contact Us added successfully",
					success 	: true,
					feedback 	: insertedContact
				});					
			})
			.catch(error=>{
				console.log("Error while adding Contact Us form -> ",error);
				res.status(500).json({
					message 	: "Error while adding Contact Us form",
					success 	: false,
					error 		: error
				});
			})

};

exports.getContactUsList = (req,res,next)=>{
	Contact.find({})
		.sort({"createdAt" : -1})
		.then(contactUsList=>{
			res.status(200).json({
				contactUsList: contactUsList,
				messages 	 : "Contact Us List Generated !!"
			})
		})
		.catch(error=>{
			res.status(500).json({
				error:error,
				message:"Some error occured while generating contact us List"
			})
		});
}