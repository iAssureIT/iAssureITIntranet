const mongoose				= require("mongoose");
var   ObjectId 			= require('mongodb').ObjectID;

const User 					= require('../userManagementnew/ModelUsers.js');
const globalVariable 	= require("../../../nodemonConfig.js");
const AppointmentSlots 	= require('./model.js');
const Appointments 		= require('../appointments/model.js');


exports.insertAppointmentSlots = (req,res,next)=>{
	// console.log("insertAppointmentSlots req.body = ",req.body);

	var timeSlot 		= req.body.timeSlot;
	var leadTime 		= req.body.leadTime;
	var timeArray 		= req.body.timeArray;
	var selectedDays 	= req.body.selectedDays;
	// var callDuration = parseInt(timeSlot) + parseInt(leadTime);
	
	var callDuration 	= parseInt(timeSlot);

	var fromTime 		= 0;
	var toTime 			= 0;

	var endTime 		= 0;
	var endTimeHr 		= 0;
	var endTimeMin 		= 0;

	var startTime 		= 0;
	var startTimeHr 	= 0;
	var startTimeMin 	= 0;
	var dayWiseArr 		= [];

	for(var j=0; j<Object.keys(selectedDays).length; j++){
		var phaseWiseSlots = [];
		for(let i=0; i<timeArray.length; i++){
			console.log("timeArray[i] => ", timeArray[i]);

			var ft = timeArray[i].fromTime.split(":");
			var tt = timeArray[i].toTime.split(":");
			fromTime = parseInt(ft[0])*60 + parseInt(ft[1]);
			toTime = parseInt(tt[0])*60 + parseInt(tt[1]);

			// var slotPhase = "Night";
			// if(fromTime < 1200){
			// 	slotPhase = "Evening";
			// }
			// if(fromTime < 960){
			// 	slotPhase = "Afternoon";				
			// }
			// if(fromTime < 720){
			// 	slotPhase = "Morning";
			// }
			
			startTimeHr 	= parseInt(ft[0]);
			startTimeMin 	= parseInt(ft[1]);
			startTime 		= startTimeHr*60 + startTimeMin;
			
			endTimeHr  = startTimeHr;
			endTimeMin = startTimeMin + callDuration;
			console.log("startTime => ",startTime);
			// console.log("startTimeMin => ",startTimeMin);

			if(endTimeMin >= 60){
				do{
					endTimeMin = endTimeMin - 60;
					endTimeHr = endTimeHr + 1;
				}
				while(endTimeMin >= 60)
			}else{
				endTimeHr = startTimeHr;
			}			
			endTime 		= endTimeHr*60 + endTimeMin;

			//=======  Enter Morning Slots =======
			var slot 		= {};
			var slotsArr 	= [];			
			while(endTime <= toTime && endTime<=720){
				slot = 	{
								startTime : (startTimeHr<10 ? "0"+startTimeHr : startTimeHr) +":"+ (startTimeMin<10 ? "0"+startTimeMin : startTimeMin),
								endTime 	: (endTimeHr<10 ? "0"+endTimeHr : endTimeHr) +":"+ (endTimeMin<10 ? "0"+endTimeMin : endTimeMin),
								leadTime : leadTime,
								duration : callDuration
							};

				slotsArr.push(slot);
				startTimeHr 	= endTimeHr;
				startTimeMin 	= endTimeMin;

				endTimeMin = endTimeMin + callDuration;
				if(endTimeMin >= 60){
					do{
						endTimeMin = endTimeMin - 60;
						endTimeHr = endTimeHr + 1;
					}
					while(endTimeMin >= 60)
				}else{
					endTimeHr = endTimeHr;
				}

				endTime = endTimeHr*60 + endTimeMin;
				console.log("endTime => ",endTime);
			}
			if(slotsArr.length > 0){
				phaseWiseSlots.push({
						slotPhase 	: "Morning",
						slots 		: slotsArr
				})				
			}

			//=======  Enter Afternoon Slots =======
			var slot 		= {};
			var slotsArr 	= [];			
			while(endTime <= toTime && endTime>720 && endTime<=960){
				slot = 	{
								startTime : (startTimeHr<10 ? "0"+startTimeHr : startTimeHr) +":"+ (startTimeMin<10 ? "0"+startTimeMin : startTimeMin),
								endTime 	: (endTimeHr<10 ? "0"+endTimeHr : endTimeHr) +":"+ (endTimeMin<10 ? "0"+endTimeMin : endTimeMin),
								leadTime : leadTime,
								duration : callDuration
							};

				slotsArr.push(slot);
				startTimeHr 	= endTimeHr;
				startTimeMin 	= endTimeMin;

				endTimeMin = endTimeMin + callDuration;
				if(endTimeMin >= 60){
					do{
						endTimeMin = endTimeMin - 60;
						endTimeHr = endTimeHr + 1;
					}
					while(endTimeMin >= 60)
				}else{
					endTimeHr = endTimeHr;
				}

				endTime = endTimeHr*60 + endTimeMin;
				console.log("endTime => ",endTime);
			}
			if(slotsArr.length > 0){
				phaseWiseSlots.push({
						slotPhase 	: "Afternoon",
						slots 		: slotsArr
				})				
			}



			//=======  Enter Evening Slots =======
			var slot 		= {};
			var slotsArr 	= [];			
			while(endTime <= toTime && endTime>960 && endTime<=1200){
				slot = 	{
								startTime : (startTimeHr<10 ? "0"+startTimeHr : startTimeHr) +":"+ (startTimeMin<10 ? "0"+startTimeMin : startTimeMin),
								endTime 	: (endTimeHr<10 ? "0"+endTimeHr : endTimeHr) +":"+ (endTimeMin<10 ? "0"+endTimeMin : endTimeMin),
								leadTime : leadTime,
								duration : callDuration
							};

				slotsArr.push(slot);
				startTimeHr 	= endTimeHr;
				startTimeMin 	= endTimeMin;

				endTimeMin = endTimeMin + callDuration;
				if(endTimeMin >= 60){
					do{
						endTimeMin = endTimeMin - 60;
						endTimeHr = endTimeHr + 1;
					}
					while(endTimeMin >= 60)
				}else{
					endTimeHr = endTimeHr;
				}

				endTime = endTimeHr*60 + endTimeMin;
				console.log("endTime => ",endTime);
			}
			if(slotsArr.length > 0){
				phaseWiseSlots.push({
						slotPhase 	: "Evening",
						slots 		: slotsArr
				})				
			}



			//=======  Enter Night Slots =======
			var slot 		= {};
			var slotsArr 	= [];
			while(endTime <= toTime && endTime>1200){
				slot = 	{
								startTime : (startTimeHr<10 ? "0"+startTimeHr : startTimeHr) +":"+ (startTimeMin<10 ? "0"+startTimeMin : startTimeMin),
								endTime 	: (endTimeHr<10 ? "0"+endTimeHr : endTimeHr) +":"+ (endTimeMin<10 ? "0"+endTimeMin : endTimeMin),
								leadTime : leadTime,
								duration : callDuration
							};

				slotsArr.push(slot);
				startTimeHr 	= endTimeHr;
				startTimeMin 	= endTimeMin;

				endTimeMin = endTimeMin + callDuration;
				if(endTimeMin >= 60){
					do{
						endTimeMin = endTimeMin - 60;
						endTimeHr = endTimeHr + 1;
					}
					while(endTimeMin >= 60)
				}else{
					endTimeHr = endTimeHr;
				}

				endTime = endTimeHr*60 + endTimeMin;
				console.log("endTime => ",endTime);
			}
			if(slotsArr.length > 0){
				phaseWiseSlots.push({
						slotPhase 	: "Night",
						slots 		: slotsArr
				})				
			}

		}// i loop

		dayWiseArr.push({
				day 			: selectedDays[j],
				phaseWiseSlots 	: phaseWiseSlots
		})
	}// j loop



	if(j >= Object.keys(selectedDays).length){
		AppointmentSlots.findOne({user_id : req.body.user_id})
				.then(record =>{
					// console.log("AppointmentSlots.findOne record =>",record);

					if(record){
						//This means record already exists and need to update it. 
						var canUpdate = false;
						var remainingDays = dayWiseArr;
						var dayWiseSlots = record.dayWiseSlots;
						// console.log("1 dayWiseSlots => ",JSON.stringify(dayWiseSlots));
						// console.log("1 calendarDays => ",record.calendarDays);

						//check if day is already available... if yes, then take new values.. if not then add it as it is
						if(dayWiseSlots && dayWiseSlots.length>0){
							for(var i=0; i<dayWiseSlots.length; i++){
								var index = dayWiseArr.findIndex(elem => elem.day === dayWiseSlots[i].day);
								if(index > -1){
									dayWiseSlots[i].phaseWiseSlots = dayWiseArr[index].phaseWiseSlots;
									dayWiseArr.splice(index,1);
								}
							}
							if(i>= dayWiseSlots.length){
								//add remaining days
								dayWiseSlots = dayWiseSlots.concat(dayWiseArr);
								canUpdate = true;
							}
						}else{
							canUpdate = true;
							dayWiseSlots = dayWiseArr;
						}

						if(canUpdate){
							// console.log("dayWiseSlots = ",dayWiseSlots);

							AppointmentSlots.updateOne(
															{user_id : req.body.user_id},
															{$set : {
																dayWiseSlots : dayWiseSlots
															}}
														)
								.then(updatedata=>{
									// console.log("AppointmentSlots update : ",updatedata);

									AppointmentSlots.findOne({user_id : req.body.user_id})
											.then(newRecord=>{
												// console.log("AppointmentSlots newRecord : ",JSON.stringify(newRecord.dayWiseSlots[0].phaseWiseSlots));
												res.status(200).json({success:true, message:"Update successful!", record : newRecord});
											})
							   			.catch(error=>{
											console.log("Error during 2nd findOne AppointmentSlots : ",error);
							   				res.status(500).json({success:false, message:"Error during 2nd findOne AppointmentSlots", error:error});
							   			})
								})
				   			.catch(error=>{
									console.log("Error during AppointmentSlots update : ",error);
				   				res.status(500).json({success:false, message:"Error during AppointmentSlots update", error:error});
				   			})
						}else{
							console.log("false Canupdate = ",canUpdate);
						}

					}else{
						//Insert the new record. 


						const appointmentSlots = new AppointmentSlots({
				      	_id          :  new mongoose.Types.ObjectId(),
				    		user_id      :  req.body.user_id,
					   	dayWiseSlots :  dayWiseArr,
				      	createdBy    :  req.body.user_id,
				      	createdAt    :  new Date()
					   });

					// console.log("insert appointmentSlots = ",appointmentSlots);

				   	appointmentSlots.save()
				   			.then(savedAppointmentSlots => {
								res.status(200).json({success:true, message:"Insert Successful", record: savedAppointmentSlots});
				   			})
				   			.catch(error=>{
								console.log("Error during AppointmentSlots Insert : ",error);
				   				res.status(500).json({success:false, message:"Error during AppointmentSlots Insert", error:error});
				   			})		
					}
				})
   			.catch(error=>{
				console.log("Error during AppointmentSlots findOne : ",error);
   				res.status(500).json({success:false, message:"Error during findone AppointmentSlots", error:error});
   			})		
  }// if loop
};


exports.disableDay = (req,res,next)=>{
	// console.log("disableDay req.body = ",req.body);

	AppointmentSlots.findOne({user_id : req.body.user_id})
		.then(data=>{
			// console.log("data => ",data);
			var calendarDays = data.calendarDays;
			var idArr 	= req.body.id.split("x");
			var Date1 	= idArr[0];
			var Day1 	= idArr[1];
			// console.log("Before calendarDays => ",calendarDays);

			var numSlots = 	calendarDays.reduce(function (n, elem) {
							    return n + (elem.date == Date1 && elem.from !== "");
							}, 0);
			// console.log("numSlots = ",numSlots);

			if(numSlots > 0){
				for(var i=0; i<numSlots; i++){
					var index = calendarDays.findIndex(x => x.date === Date1);
					calendarDays.splice(index,1);
				}

				// if(i>=numSlots){
				// 	AppointmentSlots.updateOne(
				//    		{user_id : req.body.user_id },
				//    		{$set : {
				//    			calendarDays : calendarDays
				//    		}}
				//    	)
				// 	.then(updatedAppointmentSlots => {
				// 		// console.log("updatedAppointmentSlots = ",updatedAppointmentSlots);
				// 		res.status(200).json({
				// 			data 		: updatedAppointmentSlots,
				// 			message 	: "AppointmentSlots enabled for date "+ Date1 +"!",
				// 			date 		: Date1,
				// 			day 		: Day1
				// 		});
				// 	})
				// 	.catch(error=>{
				// 		console.log("2 Error during AppointmentSlots Update : ",error);
				// 		res.status(500).json({message:"Error during AppointmentSlots Update", error:error});
				// 	})						
				// }
			}


			var index = calendarDays.findIndex(x => x.date === Date1 && x.from === "");
			if(index > -1){
				calendarDays.splice(index,1);
				var text = "AppointmentSlots enabled for date "+ Date1 +"!";
			}else{
				calendarDays.push({
					date 	: Date1,
					day 	: Day1,
					from 	: "",
					to 		: "",
					duration: "",
					status 	: "disabled"
				});
				var text = "Appointment slot disabled for Date "+ Date1 +"!";
			}

			AppointmentSlots.updateOne(
		   		{user_id : req.body.user_id },
		   		{$set : {
		   			calendarDays : calendarDays
		   		}}
		   	)
			.then(updatedAppointmentSlots => {
				// console.log("updatedAppointmentSlots = ",updatedAppointmentSlots);
				res.status(200).json({
					data 		: updatedAppointmentSlots,
					message 	: text,
					date 		: Date1,
					day 		: Day1
				});
			})
			.catch(error=>{
				console.log("2 Error during AppointmentSlots Update : ",error);
				res.status(500).json({message:"Error during AppointmentSlots Update", error:error});
			})

		})
		.catch(err=>{
			console.log("2 Error during AppointmentSlots findOne : ",error);
			res.status(500).json({message:"Error during AppointmentSlots Update", error:error});
		})								
};

exports.disableSlot = (req,res,next)=>{
	//console.log("disableSlot req.body = ",req.body);
	if(req.body.id !== ""){
		AppointmentSlots.findOne({user_id : req.body.user_id})
			.then(data=>{
				// console.log("data => ",data);
				var calendarDays = data.calendarDays;
				var idArr 	= req.body.id.split("x");
				var Date1 	= idArr[0];
				var Day1 	= idArr[1];
				var Slot 	= idArr[2];
				// console.log("Before calendarDays => ",calendarDays);

				var index = calendarDays.findIndex(x => x.date === Date1 && x.from === Slot);

				if(index>-1){
					calendarDays.splice(index,1);

					AppointmentSlots.updateOne(
				   		{user_id : req.body.user_id },
				   		{$set : {
				   			calendarDays : calendarDays
				   		}}
				   	)
					.then(updatedAppointmentSlots => {
						//console.log("disableSlot updatedAppointmentSlots = ",updatedAppointmentSlots);
						res.status(200).json({
							data 		: updatedAppointmentSlots,
							message 	: "Appointment slot enabled for Date "+ Date1 +" & Time "+Slot,
							date 		: Date1,
							day 		: Day1,
							slot 		: Slot
						});
					})
					.catch(error=>{
						console.log("2 Error during AppointmentSlots Update : ",error);
						res.status(500).json({message:"Error during AppointmentSlots Update", error:error});
					})								
				}else{
					calendarDays.push({
						date 	: Date1,
						day 	: Day1,
						from 	: Slot,
						to 		: "",
						duration: "",
						status 	: "disabled"
					});

					AppointmentSlots.updateOne(
				   		{user_id : req.body.user_id },
				   		{$set : {
				   			calendarDays : calendarDays
				   		}}
				   	)
					.then(updatedAppointmentSlots => {
						//console.log("disableSlot updatedAppointmentSlots = ",updatedAppointmentSlots);
						res.status(200).json({
							data 		: updatedAppointmentSlots,
							message 	: "AppointmentSlots disabled for date "+ Date1 +" & Time "+Slot,
							date 		: Date1,
							day 		: Day1,
							slot 		: Slot
						});
					})
					.catch(error=>{
						console.log("2 Error during AppointmentSlots Update : ",error);
						res.status(500).json({message:"Error during AppointmentSlots Update", error:error});
					})
				}
			})
			.catch(err=>{
				console.log("2 Error during AppointmentSlots findOne : ",error);
				res.status(500).json({message:"Error during AppointmentSlots Update", error:error});
			})		
	}else{
		res.status(200).json({
						data 		: "",
						message 	: "Need to click on Icon properly!",
						date 		: Date1,
						day 		: Day1,
						slot 		: Slot
					});
	}							
};



exports.getAppointmentSlots = (req,res,next)=>{
	// console.log("getAppointmentSlots req.body -> ",req.body);
	AppointmentSlots.findOne({user_id : ObjectId(req.body.user_id)})
				.then(data=>{
					 // console.log("getAppointmentSlots data -> ",data);
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


exports.deleteDay = (req,res,next)=>{
	console.log("disableDay req.body = ",req.body);

	AppointmentSlots.findOne({user_id : ObjectId(req.body.user_id)},{dayWiseSlots:1})
		.then(data=>{
			console.log("data => ",data);
			if(data){
				var dayWiseSlots = data.dayWiseSlots; 
				if(dayWiseSlots.length > 0){
					var dayIndex = dayWiseSlots.findIndex(x => x.day == req.body.day); 
					if(dayIndex > -1){
						dayWiseSlots.splice(dayIndex,1);
						console.log("new dayWiseSlots => ", dayWiseSlots);

						AppointmentSlots.updateOne(
					   		{user_id : ObjectId(req.body.user_id) },
					   		{$set : {
							   			"dayWiseSlots" : dayWiseSlots,
						   			}
					   		}
					   	)
						.then(updatedAppointmentSlots => {
							console.log("updatedAppointmentSlots = ",updatedAppointmentSlots);
							res.status(200).json({
								data 		: updatedAppointmentSlots,
								message 	: "All slots of "+req.body.day+" deleted successfully",
								success 	: true
							});
						})
						.catch(error=>{
							console.log("2 Error during AppointmentSlots Update : ",error);
							res.status(500).json({
								data 		: error,
								message 	: "Some Error in updating dayWiseSlots",
								success 	: false
							});
						})
					}
				}else{
					res.status(200).json({
						data 		: [],
						message 	: "dayWiseSlots is blank array",
						success 	: true
					});					
				}

			}else{
				res.status(200).json({
					data 		: [],
					message 	: "Data not found",
					success 	: true
				});
			}			

		})
		.catch(err=>{
			console.log("2 Error during AppointmentSlots findOne : ",error);
			res.status(500).json({
				data 		: error,
				message 	: "Error during AppointmentSlots findOne",
				success 	: false
			});
		})								
};