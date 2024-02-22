const mongoose					= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
const User 						= require('../userManagementnew/ModelUsers.js');
const Appointments 			= require('../appointments/model.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');



exports.getMyClients = (req,res,next)=>{
	// console.log("getMyConsultants req.params = ",req.params);
	var consultant_id = req.params.consultant_id;

	//List of MyConsultants means those consultants with which an appointment is taken
	//and the ones whom user has saved in search results. 

	Appointments.find({consultant_id : consultant_id, user_id : {$exists : true} },{user_id : 1})
		.then(myClients1=>{
			console.log("myClients1 -> ",myClients1);
			var myClientsArr = myClients1.map(e=> e.user_id.toString());

			User.find({_id : {$in : myClientsArr} },{profile:1,address:1})
				.then(userDetails =>{
					console.log("userDetails -> ",userDetails);

					res.status(200).json({
						success 	 : true,
						myClients : userDetails
					})
				})
				.catch(error=>{
					console.log("Error while finding UserDetails -> ",error);
					res.status(500).json({
						message 	: "Error while finding UserDetails",
						error 	: error
					});
				})
		})
		.catch(error=>{
			console.log("Error while finding myClients from appointments -> ",error);
			res.status(500).json({
				message 	: "Error while finding myClients from appointments",
				error 	: error
			});
		})
};

exports.getMyClientsNames = (req,res,next)=>{
	// console.log("getMyConsultants req.params = ",req.params);
	var user_id = req.params.user_id;

	//List of MyConsultants means those consultants with which an appointment is taken
	//and the ones whom user has saved in search results. 

	Appointments.find({user_id : user_id})
		.then(myConsultants1=>{
			// console.log("myConsultants1 -> ",myConsultants1);

			var myConsultantsArr = [];
			myConsultantsArr = myConsultants1.map(e=> e.consultant_id.toString());
			var responseMyConsultants = [];
			User.findOne({_id : ObjectId(user_id)},{myConsultants:1})
				.then(async (user)=>{
					// console.log("user -> ",user);
					if(user && user.myConsultants && user.myConsultants.length>0){
						//var mcArr contains consultants from appointments collections as well as
						//from user collection where consultants from search results are saved
						var mcArr = myConsultantsArr.concat(user.myConsultants);
						// console.log("mcArr => ",mcArr);
	
						for(var i=0; i<mcArr.length; i++){
							var userProfile = await getUserProfile(mcArr[i]);
							// console.log("1 userProfile => ",userProfile);
							if(userProfile !== 0){
								let obj = false;
								// console.log("userProfile._id = ",JSON.stringify(userProfile._id));

								obj = responseMyConsultants.find(o => JSON.stringify(o._id) === JSON.stringify(userProfile._id));
								if(!obj){
									responseMyConsultants.push({
										_id 	: userProfile._id,
										fullName: userProfile.profile.fullName,
									});
								}
							}
							// console.log("responseMyConsultants[i]._id = ",responseMyConsultants[i]._id);
						}

						if(i>=mcArr.length){
							// var uniqueConsultants = responseMyConsultants.filter((v, i, a) => a.indexOf(v) === i);
							// const uniqueConsultants = [...new Map(responseMyConsultants.map(item =>[item["_id"], item])).values()];
							// console.log("uniqueConsultants = ",uniqueConsultants);

							res.status(200).json({
								success : true,							
								myConsultants : responseMyConsultants
							})
						}						
						// console.log("1 responseMyConsultants => ",responseMyConsultants);
					}else{
						//mcArr contains only consultants from appointments collections
						var mcArr = myConsultantsArr;
	
						for(var i=0; i<mcArr.length; i++){
							var userProfile = await getUserProfile(mcArr[i]);
							if(userProfile !== 0){
								responseMyConsultants.push({
									_id 	: userProfile._id,
									fullName: userProfile.profile.fullName,
								});
							}
						}

						if(i>=mcArr.length){
							res.status(200).json({
								success : true,							
								myConsultants : responseMyConsultants
							})
						}						
						// console.log("2 responseMyConsultants => ",responseMyConsultants);
					}
				})
				.catch(error=>{
					console.log("Error while finding myConsultants array from user -> ",error);
					res.status(500).json({
						message 	: "Error while finding myConsultants array from user",
						error 	: error
					});
				})
		})
		.catch(error=>{
			console.log("Error while finding myConsultants from appointments -> ",error);
			res.status(500).json({
				message 	: "Error while finding myConsultants from appointments",
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
					// console.log("data -> ",data);
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

