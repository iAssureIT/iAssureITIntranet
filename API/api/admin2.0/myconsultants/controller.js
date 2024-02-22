const mongoose					= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
const User 						= require('../userManagementnew/ModelUsers.js');
const Appointments 			= require('../appointments/model.js');
const AppointmentSlots 		= require('../appointmentSlots/model.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');
const Reviews 					= require('../review/model.js');
const moment 					= require('moment');



exports.getMyConsultants = (req,res,next)=>{
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
							var starRatings = await getStarRatings(mcArr[i]);
							var totalCalls  = await getTotalCalls(mcArr[i]);
							var nextAvailable = await getNextAvailability(mcArr[i]);
							// console.log("nextAvailable => ",nextAvailable);

							if(userProfile && userProfile !== 0){
								userProfile = {...userProfile._doc, starRatings : starRatings, totalCalls : totalCalls, nextAvailable : nextAvailable};
								// console.log("1 userProfile => ",userProfile);
								let obj = false;
								// console.log("userProfile._id = ",JSON.stringify(userProfile._id));

								obj = responseMyConsultants.find(o => JSON.stringify(o._id) === JSON.stringify(userProfile._id));
								if(!obj){
									responseMyConsultants.push(userProfile);
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
							let obj = false;
							obj = responseMyConsultants.find(o => JSON.stringify(o._id) === JSON.stringify(mcArr[i]));
							if(!obj){
								var userProfile 	= await getUserProfile(mcArr[i]);
								var starRatings 	= await getStarRatings(mcArr[i]);
								var totalCalls  	= await getTotalCalls(mcArr[i]);
								var nextAvailable = await getNextAvailability(mcArr[i]);

							if(userProfile && userProfile !== 0){
									userProfile = {...userProfile._doc, starRatings : starRatings, totalCalls : totalCalls, nextAvailable : nextAvailable};
									responseMyConsultants.push(userProfile);
								}
							}
						}

						if(i>=mcArr.length){
							res.status(200).json({
								success 			: true,
								myConsultants 	: responseMyConsultants
							})
						}						
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

function getTotalCalls(consultant_id){
	// console.log("consultant_id => ",consultant_id);

	return new Promise((resolve,reject)=>{

      var currDate = moment().tz('Asia/Kolkata').format("YYYY-MM-DD");
      var currTime = moment().tz('Asia/Kolkata').format("HH:mm");

		// Appointments.find({ consultant_id: ObjectId(consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} },{"meetingRoomDetails":0})
      var selector = { consultant_id: ObjectId(consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} }
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
            { "$unwind": "$order" },
            { 
               "$match": { 
                  "order.status": { "$in": statusList },
               } 
            }

         ])
         .then(totalData => {
            console.log("totalData==============1=============",totalData.length,currTime)
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



exports.getMyConsultantNames = (req,res,next)=>{
	// console.log("getMyConsultantNames req.params = ",req.params);
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
					// console.log("getMyConsultantNames user -> ",user);
					if(user && user.myConsultants && user.myConsultants.length>0){
						//var mcArr contains consultants from appointments collections as well as
						//from user collection where consultants from search results are saved
						var mcArr = myConsultantsArr.concat(user.myConsultants);
						// console.log("mcArr => ",mcArr);
	
						for(var i=0; i<mcArr.length; i++){
							var userProfile = await getUserProfile(mcArr[i]);
							// console.log("getMyConsultantNames 1 userProfile => ",userProfile);
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
							let obj = false;
							obj = responseMyConsultants.find(o => JSON.stringify(o._id) === JSON.stringify(mcArr[i]));
							// console.log(i, " obj => ",obj);
							if(!obj){
								var userProfile = await getUserProfile(mcArr[i]);
								// console.log("getMyConsultantNames 2 userProfile => ",userProfile);

								if(userProfile !== 0){
									responseMyConsultants.push({
										_id 	: userProfile._id,
										fullName: userProfile.profile.fullName,
									});
								}
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
	// console.log("req.body -> ",req.body);

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



exports.searchMyConsultants = (req,res,next)=>{
	
	// console.log("searchMyConsultants req.body =>",req.body) ;

	//List of MyConsultants means those consultants with which an appointment is taken
	//and the ones whom user has saved in search results. 

	Appointments.find({user_id : ObjectId(req.body.user_id)})
		.then(myConsultants1=>{
			// console.log("myConsultants1 -> ",myConsultants1);

			var myConsultantsArr = [];
			myConsultantsArr = myConsultants1.map(e=> e.consultant_id.toString());
			var responseMyConsultants = [];
			User.findOne({_id : ObjectId(req.body.user_id)},{myConsultants:1})
				.then(async (user)=>{
					// console.log("user -> ",user);
					if(user && user.myConsultants && user.myConsultants.length>0){
						//var mcArr contains consultants from appointments collections as well as
						//from user collection where consultants from search results are saved
						var mcArr = myConsultantsArr.concat(user.myConsultants);
						// console.log("mcArr => ",mcArr);
						
						var st = req.body.searchText.toLowerCase();

						for(var i=0; i<mcArr.length; i++){
							var userProfile = await getUserProfile(mcArr[i]);
							// console.log("1 userProfile => ",userProfile);
							if(userProfile !== 0){
								let obj = false;
								// console.log("userProfile._id = ",JSON.stringify(userProfile._id));

								obj = responseMyConsultants.find(o => JSON.stringify(o._id) === JSON.stringify(userProfile._id));
								if(!obj){
									if(st !== ""){
										var fname 		= userProfile.profile.firstname.toLowerCase();
										var lname 		= userProfile.profile.lastname.toLowerCase();
										var entpName 	= userProfile.profile.company_id.enterpriseName.toLowerCase();
								      if(fname.indexOf(st) > -1  || lname.indexOf(st)  > -1  || entpName.indexOf(st) > -1 ){
											responseMyConsultants.push(userProfile);
										}
							      }else{
							      	responseMyConsultants.push(userProfile);
							      }
								}
							}
							// console.log("responseMyConsultants[i]._id = ",responseMyConsultants[i]._id);
						}

						if(i>=mcArr.length){
							// var uniqueConsultants = responseMyConsultants.filter((v, i, a) => a.indexOf(v) === i);
							// const uniqueConsultants = [...new Map(responseMyConsultants.map(item =>[item["_id"], item])).values()];
							// console.log("1 responseMyConsultants = ",responseMyConsultants);

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
								if(st !== ""){
									var fname 		= userProfile.profile.firstname.toLowerCase();
									var lname 		= userProfile.profile.lastname.toLowerCase();
									var entpName 	= userProfile.profile.company_id.enterpriseName.toLowerCase();
							      if(fname.indexOf(st) > -1  || lname.indexOf(st)  > -1  || entpName.indexOf(st) > -1 ){
										responseMyConsultants.push(userProfile);
									}
						      }else{
						      	responseMyConsultants.push(userProfile);
						      }
							}
						}

						if(i>=mcArr.length){
							// console.log("2 responseMyConsultants = ",responseMyConsultants);

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
