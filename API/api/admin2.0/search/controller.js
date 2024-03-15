const mongoose					= require("mongoose");
var   ObjectID 				= require('mongodb').ObjectID;
const moment               = require('moment');

const User 						= require('../userManagementnew/ModelUsers.js');
const Enterprise 				= require('../enterprise/model.js');
const BusinessCategory 		= require('../masterBusinessCategory/Model.js');
const BusinessSubCategory 	= require('../masterBusinessSubCategory/Model.js');
const Appointments 			= require('../appointments/model.js');
const AppointmentSlots 		= require('../appointmentSlots/model.js');
const Reviews 					= require('../review/model.js');

const globalVariable 		= require("../../../nodemonConfig.js");



exports.getSearchResults = (req,res,next)=>{
	/*
		Search for text in following things
		1. First and last Name of consultant
		2. Name of Organization
		3. Category
		4. Subcategories
		5. Expertise
	*/	

	var searchPhrase = req.body.searchPhrase;
	var introductoryCalls = '';
	// console.log("getSearchResults req.body = ", req.body);

	if(searchPhrase.indexOf('(') > -1){
		var bracketIndex = searchPhrase.indexOf('(');
		searchPhrase = searchPhrase.substr(0, bracketIndex-1)
		console.log("searchPhrase",searchPhrase)
	}

	if(searchPhrase === "*"){
		var selector1 = {
			"profile.status" : "active",
			"roles" : "consultant",
			approvalStatus : "Approved",			
			isProfileReady : true			
		}
	}else{		
		var selector1 = {
			"profile.status" : "active",
			"roles" : "consultant",
			isProfileReady : true,
			approvalStatus : "Approved",			
			$or : [
				{ "profile.firstname" : new RegExp(searchPhrase,'i') },
				{ "profile.lastname" : new RegExp(searchPhrase,'i')  },
				{ "profile.fullName" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.category" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.subCategory.businessSubCategory" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.expertise.expertise" : new RegExp(searchPhrase,'i') },
			]
		};
	}

	if(req.body.location !== ""){
		selector1["address.city"] = req.body.location;
	}


	if(req.body.filters && req.body.filters.category && req.body.filters.category.length>0){
		selector1["catg_subCatg_expertise.category"] = {$in : req.body.filters.category};
	}
	if(req.body.filters && req.body.filters.subCategory && req.body.filters.subCategory.length>0){
		selector1["catg_subCatg_expertise.subCategory.businessSubCategory"] = {$in : req.body.filters.subCategory};
	}
	if(req.body.filters && req.body.filters.expertise && req.body.filters.expertise.length>0){
		selector1["catg_subCatg_expertise.expertise.expertise"] = {$in : req.body.filters.expertise};
	}
	if(req.body.filters && req.body.filters.location && req.body.filters.location.length>0){
		selector1["address.city"] = {$in : req.body.filters.location};
	}
	if(req.body.filters && req.body.filters.experience && req.body.filters.experience.length>0){
		// if(typeof req.body.filters.experience === 'number'){		
			selector1["otherInfo.experience"] = {$in : req.body.filters.experience};
		// }
	}
	if(req.body.filters && req.body.filters.languages && req.body.filters.languages.length > 0){
		selector1["otherInfo.languages.language"] = {$in : req.body.filters.languages};
	}
	if(req.body.filters && req.body.filters.introductoryCalls){
		introductoryCalls = req.body.filters.introductoryCalls;
	}


	if(searchPhrase === "*"){
		var selector2 = {}
	}else{		
		var selector2 = {			
			$or : [
				{ "enterpriseName" : new RegExp(searchPhrase,'i') },
				{ "catg_subCatg_expertise.category" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.subCategory.businessSubCategory" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.expertise.expertise" : new RegExp(searchPhrase,'i') },
			],
			approvalStatus : "Approved",			
		};
	}
	if(req.body.location !== ""){
		selector2["address.city"] = req.body.location;
	}



	if(req.body.filters && req.body.filters.category && req.body.filters.category.length>0){
		selector2["catg_subCatg_expertise.category"] = {$in : req.body.filters.category};
	}
	if(req.body.filters && req.body.filters.subCategory && req.body.filters.subCategory.length>0){
		selector2["catg_subCatg_expertise.subCategory.businessSubCategory"] = {$in : req.body.filters.subCategory};
	}
	if(req.body.filters && req.body.filters.expertise && req.body.filters.expertise.length>0){
		selector2["catg_subCatg_expertise.expertise.expertise"] = {$in : req.body.filters.expertise};
	}

	if(req.body.filters && req.body.filters.location && req.body.filters.location.length>0){
		selector2["address.city"] = {$in : req.body.filters.location};
	}
	if(req.body.filters && req.body.filters.experience && req.body.filters.experience.length>0){
		selector2["experience"] = {$in : req.body.filters.experience};
	}
	if(req.body.filters && req.body.filters.languages && req.body.filters.languages.length>0){
		selector2["language"] = {$in : req.body.filters.languages};
	}



	var enterprises = [];
	var consultants = [];

	// console.log("selector1 = ", selector1);
	// console.log("selector2 = ", selector2);

	User.find(selector1,{services:0, statusLog:0})
		.populate("profile.company_id")
		.then(async (searchResults) =>{
			// console.log("searchResults => ", searchResults);
			var numOfIntroCalls = [];
			var starRatingsArr = [];

			for(var i=0; i<searchResults.length; i++){
				var numOfIntroductoryCalls = await getNumOfIntroductoryCalls(searchResults[i]._id);
				var starRatings 				= await getStarRatings(searchResults[i]._id);
				var nextAvailable 			= await getNextAvailability(searchResults[i]._id);

				consultants.push({
					type 						: "consultant",
					_id 						: searchResults[i]._id,
					fullname 				: searchResults[i].profile.firstname+" "+searchResults[i].profile.lastname,
					imageUrl 				: searchResults[i].documents && searchResults[i].documents.profilePhoto && searchResults[i].documents.profilePhoto.length>0 ? searchResults[i].documents.profilePhoto[0].url : "-",
					city 						: searchResults[i].address ? searchResults[i].address.city : "-",
					fees 						: searchResults[i].otherInfo ? searchResults[i].otherInfo.fees : "-",
					experience 				: searchResults[i].otherInfo &&searchResults[i].otherInfo.experience && searchResults[i].otherInfo.experience !== "" ? searchResults[i].otherInfo.experience : "-",
					languages 				: searchResults[i].otherInfo ? searchResults[i].otherInfo.languages : "-",
					catg_subCatg_expertise 	: searchResults[i].catg_subCatg_expertise,
					enterprise_id 			: searchResults[i].profile && searchResults[i].profile.company_id && searchResults[i].profile.company_id._id ? searchResults[i].profile.company_id._id : "-",
					enterpriseName 		: searchResults[i].profile && searchResults[i].profile.company_id && searchResults[i].profile.company_id.enterpriseName ? searchResults[i].profile.company_id.enterpriseName : "-",
					profile 					: searchResults[i].profile,
					otherInfo 				: searchResults[i].otherInfo,
					numOfIntroCalls 		: numOfIntroductoryCalls,
					starRatings 			: starRatings,
					nextAvailable 			: nextAvailable,
				});

				numOfIntroCalls.push(numOfIntroductoryCalls);
				starRatingsArr.push(parseInt(starRatings))

			}

			Enterprise.find(selector2,{invitations:0, updateLog:0})
				.then(async (entpResults) =>{

					for(var j=0; j<entpResults.length; j++){
						var numOfConsNCalls  = await getNumOfConsNCalls(entpResults[j]._id);
						console.log("numOfConsNCalls => ",numOfConsNCalls);

						enterprises.push({
							type 					: "enterprise",
							_id 					: entpResults[j]._id,
							fullname 			: entpResults[j].enterpriseName,
							imageUrl 			: entpResults[j].documents && entpResults[j].documents.companyLogo && entpResults[j].documents.companyLogo.length>0 ? entpResults[j].documents.companyLogo[0].url : "",
							city 					: entpResults[j].address && entpResults[j].address.city ? entpResults[j].address.city : "",
							experience 			: entpResults[j].experience,
							catg_subCatg_expertise 	: entpResults[j].catg_subCatg_expertise,
							totalConsultants 	: numOfConsNCalls.totalConsultants,
							totalCalls 			: numOfConsNCalls.totalCalls,
						})
					}

					// processData(i, j, searchResults.length, entpResults.length, req.body.user_id, consultants,enterprises);
					// async function processData(i, j, srLength, entLength, user_id, consultants,enterprises){

						if(i>=searchResults.length && j>=entpResults.length){
							if(req.body.user_id === 0){
								var myConsultants = {data: 'User Not Found'};
							}else{
								var myConsultants = await getMyConsultants(req.body.user_id);
								var myEnterprises = await getMyEnterprise(req.body.user_id);
							}
							// console.log("myEnterprises",myEnterprises)
							if(myConsultants.data === 0 && myEnterprises.data === 0){
								res.status(500).json({message : "Error while getting myConsultants or myEnterprises  from User"});
							}else{
								var result = consultants.concat(enterprises);
								let experiencesArr = result.map(({ experience }) => experience );
								let experiences = experiencesArr.filter((elem)=>{return elem !== "-" && elem !== ""});

								var uniqueExpertise = experiences.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
								
								let locations = result.map(({ city }) => city);
								var uniqueLocations = locations.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
								
								// console.log("uniqueLocations => ", uniqueLocations);

								let lang = result.map((elem) => {
									if(elem.type==='consultant' && typeof elem.languages !== 'undefined'){										
										return elem.languages
									} 
								}); 
								var lang1 = lang.filter(function( element ) {    return element !== undefined; });
								var languages = [];
								var uniqueLang = [];
						
								for(var m=0; m<lang1.length; m++){
									var langElem = lang1[m];
									for (var n=0; n<langElem.length; n++) {
										languages.push(langElem[n].language);
									}
								}
								if(m >= lang1.length){
									uniqueLang = languages.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
								}
								var searchFinalResults = {
													searchResult  	: result, 
													myConsultants 	: myConsultants,
													myEnterprises 	: myEnterprises ? myEnterprises : [],
													experiences   	: uniqueExpertise,
													locations 		: uniqueLocations,
													languages 		: uniqueLang,
													numOfIntroCalls : numOfIntroCalls,
													starRatings 	: starRatingsArr
												} 
								// console.log("searchFinalResults",searchFinalResults)

								res.status(200).json(searchFinalResults);
							}
						}

					// }

				})
				.catch(error=>{
					console.log("Error while searching in User => ", error);
					res.status(500).json({message : "Error while searching in User"});
				})
		})
		.catch(error=>{
			console.log("Error while searching in User => ", error);
			res.status(500).json({message : "Error while searching in User"});
		})
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


function getLanguagesArr(lang){
	// console.log(" lang => ",lang);
}

function getNumOfIntroductoryCalls(consultant_id){
	return new Promise((resolve,reject)=>{
      var currDate = moment().tz('Asia/Kolkata').format("YYYY-MM-DD");
      var currTime = moment().tz('Asia/Kolkata').format("HH:mm");
		// Appointments.find({ consultant_id: (consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} },{"meetingRoomDetails":0})
		var selector = { consultant_id: ObjectID(consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} }
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
			.then(numOfAppointments => {
      		console.log("numOfAppointments==============1=============",numOfAppointments.length,currTime)
            for(var i=0; i<numOfAppointments.length; i++){
               if(( numOfAppointments[i].appointmentEnd > currTime && moment(numOfAppointments[i].isoAppointmentDate).diff(moment(currDate)) >= 0)){
                  const index = numOfAppointments.indexOf(numOfAppointments[i]);
                  if (index > -1) { // only splice array when item is found
                    numOfAppointments.splice(index, 1); // 2nd parameter means remove one item only
                  }

               }
            }
            // console.log("numOfAppointments==============2=============",numOfAppointments.length)
            resolve(numOfAppointments.length);
			})
			.catch(error => {
				console.log("getNumOfIntroductoryCalls error =>",error);
				reject(-1)
			})
	})
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
								starRating = (parseFloat(starRating) / i).toFixed(2);
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

function getNumOfConsNCalls(enterprise_id){
	//Using an enterprise_id, send Number of Consultants and Number of Calls

	return new Promise((resolve,reject)=>{
		User.find({"profile.company_id" : ObjectID(enterprise_id), "approvalStatus": 'Approved'})
					.then(consultants => {
						console.log("consultants",enterprise_id,consultants)
						var numOfConsultants =  consultants.length;
						var consultantsArr = consultants.map(e=>e._id);

						if(numOfConsultants > 0){
      					var currTime = moment().tz('Asia/Kolkata').format("HH:mm");
      					var currDate = moment().tz('Asia/Kolkata').format("YYYY-MM-DD");
							var selector = { consultant_id: {$in : consultantsArr}, status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} }
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
				            console.log("totalData==============1=============",totalData.length)
				            for(var i=0; i<totalData.length; i++){
				               if(( totalData[i].appointmentEnd > currTime && moment(totalData[i].isoAppointmentDate).diff(moment(currDate)) >= 0)){
				                  const index = totalData.indexOf(totalData[i]);
				                  // console.log("index",index,i)
				                  if (index > -1) { // only splice array when item is found
				                    totalData.splice(index, 1); // 2nd parameter means remove one item only
				                  }

				               }
				            }
				            console.log("totalData==============2=============",totalData.length)
									var consNCalls = {
										totalConsultants 	: numOfConsultants,
										totalCalls 			: totalData.length
									}
									resolve(consNCalls);
								})
								.catch(error => {
									console.log("getNumOfConsNCalls Appointments.count error => ", error)
									reject(-1)
								})
						}else{
							var consNCalls = {
								totalConsultants 	: 0,
								totalCalls 			: 0
							}
							resolve(consNCalls);
						}
					})
					.catch(error => {
						console.log("getNumOfConsInEntp error =>",error);
						reject(-1);
					})
	})
}

exports.getSearchCatg = async (req,res,next)=>{
	// console.log("******  getSearchFilters  ********")

		BusinessCategory.find({})
			.then(data =>{
				if(data && data.length > 0){
					var result = [];
					// var experiences = await getAllExperiences();
					// console.log("experiences = ",experiences);
					for(var i=0; i<data.length; i++){
						result.push({
							category_id : data[i]._id,
							category 	: data[i].businessCategory,
							expertise 	: data[i].businessExpertise
						});
					}
					if(i>=data.length){
						res.status(200).json({ data: result});
					}
				}else{
					res.status(200).json({data: 'User Not Found'});
				}
			})
			.catch(error=>{
				console.log("error => ", error);
				res.status(500).json({data: 'Some Error in Finding Category', error: error});
			})
}

exports.getSubCatg = async (req,res,next)=>{
		var category = req.params.category;
		BusinessCategory.findOne({businessCategory : category})
			.then(data =>{
				if(data){
					BusinessSubCategory.find({businessCategoryId : data._id})
								.then(result => {
									res.status(200).json({ data: result });
								})
								.catch(error=>{
									console.log("error => ", error);
									res.status(500).json({data: 'Some Error in Finding SubCategory', error: error});
								})
				}else{
					res.status(200).json({data: 'Category Not Found'});
				}
			})
			.catch(error=>{
				console.log("error => ", error);
				res.status(500).json({data: 'Some Error in Finding Category', error: error});
			})
}


function getAllExperiences(){
	return new Promise((resolve,reject)=>{
		Users.find({roles : "consultant"})
			.then(data =>{
				if(data && data.length > 0){
					let experiences = data.map(({ businessCategory }) => businessCategory)
					// var expertise1 = [];
					// for(let i=0; i<data.length; i++){
					// 	expertise1.push(...data[i].businessExpertise);
					// }
					// var expertise = expertise1.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
					resolve({data : data});
					// resolve({categories: categories, expertise: expertise});
				}else{
					resolve({data: 'User Not Found'});
				}
			})
			.catch(error=>{
				console.log("error => ", error);
				reject({data : 0});
			})
	});
}

function getMyConsultants(user_id){
	// console.log("user_id => ", user_id);
	return new Promise((resolve,reject)=>{
		User.findOne({_id : user_id})
			.then(data =>{
				if(data && data.myConsultants){
					var myConsultants = data.myConsultants;
					resolve({data: myConsultants});
				}else{
					resolve({data: 'User Not Found'});
				}
			})
			.catch(error=>{
				// console.log("error => ", error);
				reject({data : 0});
			})
	});
}

function getMyEnterprise(user_id){
	// console.log("user_id => ", user_id);
	return new Promise((resolve,reject)=>{
		User.findOne({_id : user_id})
			.then(data =>{
				// console.log("data",data);
				if(data && data.myEnterprises){
					var myEnterprises = data.myEnterprises;
					resolve({data: myEnterprises});
				}else{
					resolve({data: 'Enterprise Not Found'});
				}
			})
			.catch(error=>{
				// console.log("error => ", error);
				reject({data : 0});
			})
	});
}

exports.updateMyConsultant = (req,res,next)=>{
	console.log("updateMyConsultant req.body => ",req.body);

	var ready = false; 
	User.findOne({_id : req.body.user_id})
		.then(userData=>{
			var myConsultants = userData.myConsultants;
			console.log("before myConsultants => ",myConsultants);

			var index = myConsultants.indexOf(req.body.myConsultant_id);
			// console.log("index => ",index);

			if(index>-1){
				myConsultants.splice(index,1);
				ready = true;
			}else{
				myConsultants.push(req.body.myConsultant_id);
				ready = true;
			}

			console.log("after myConsultants => ",myConsultants);

			if(ready){
				User.updateOne(
					{_id : req.body.user_id},
					{$set : {myConsultants : myConsultants}}
				)
				.then(updatedMyConsultant => {
					console.log("updatedMyConsultant => ",updatedMyConsultant);

					processData(req.body.user_id);

					async function processData(user_id,updatedMyConsultant){
						var myConsultants = await getMyConsultants(user_id);
						console.log("myConsultants => ",myConsultants);
						if(myConsultants){
							res.status(200).json({
								success 			: true,
								message 			: "Update Successful!", 
								data 				: updatedMyConsultant, 
								myConsultants 	: myConsultants.data
							})							
						}else{
							res.status(500).json({
								success 			: false,
								message 			: "Update Not Successful!", 
								data 				: updatedMyConsultant, 
								myConsultants 	: []
							})
						}
					}

				})
				.catch(error=>{
					console.log("Error while update consultant",error);
					res.status(500).json({message: "Error while update consultant", error:error})
				})				
			}
		})
		.catch(error=>{
			console.log("Error while find user",error);
			res.status(500).json({message: "Error while find user", error:error})
		})
}

exports.updateMyEnterprise = (req,res,next)=>{
	console.log("updateMyEnterprise req.body => ",req.body);

	var ready = false; 
	User.findOne({_id : req.body.user_id})
		.then(userData=>{
			var myEnterprises = userData.myEnterprises;
			console.log("before myEnterprises => ",myEnterprises);

			var index = myEnterprises.indexOf(req.body.enterprise_id);
			 console.log("index => ",index);

			if(index>-1){
				myEnterprises.splice(index,1);
				ready = true;
			}else{
				myEnterprises.push(req.body.enterprise_id);
				ready = true;
			}

			console.log("after myEnterprises => ",myEnterprises);

			if(ready){
				User.updateOne(
					{_id : req.body.user_id},
					{$set : {myEnterprises : myEnterprises}}
				)
				.then(updateMyEnterprise => {
					console.log("updateMyEnterprise => ",updateMyEnterprise);

					processData(req.body.user_id);

					async function processData(user_id,updateMyEnterprise){
						var myEnterprises = await getMyEnterprise(user_id);
						console.log("myEnterprises => ",myEnterprises);
						if(myEnterprises){
							res.status(200).json({
								success 			: true,
								message 			: "Update Successful!", 
								data 				: updateMyEnterprise, 
								myEnterprises 		: myEnterprises.data
							})							
						}else{
							res.status(500).json({
								success 			: false,
								message 			: "Update Not Successful!", 
								data 				: updateMyEnterprise, 
								myEnterprises 		: []
							})
						}
					}

				})
				.catch(error=>{
					console.log("Error while update Enterprise",error);
					res.status(500).json({message: "Error while update Enterprise", error:error})
				})				
			}
		})
		.catch(error=>{
			console.log("Error while find user",error);
			res.status(500).json({message: "Error while find user", error:error})
		})
}

exports.getSearchSuggestions = async (req,res,next)=>{
	var searchPhrase = req.params.searchPhrase;
	// console.log("getSearchSuggestions searchPhrase => ",searchPhrase);
	var returnArr = [];

	var categories 			= await getCategories(searchPhrase);
	returnArr = returnArr.concat(categories);	
	// console.log("getSearchSuggestions categories => ",categories);

	var subCategories 		= await getSubCategories(searchPhrase);	
	returnArr = returnArr.concat(subCategories);
	// console.log("getSearchSuggestions subCategories => ",subCategories);

	var expertise 			= await getExpertise(searchPhrase);
	returnArr = returnArr.concat(expertise);
	// console.log("getSearchSuggestions expertise => ",expertise);

	var consultantName 	= await getConsultantName(searchPhrase);
	returnArr = returnArr.concat(consultantName);
	// console.log("getSearchSuggestions consultantName => ",consultantName);

	var enterpriseName 	= await getEnterpriseName(searchPhrase);
	returnArr = returnArr.concat(enterpriseName);
	// console.log("getSearchSuggestions enterpriseName => ",enterpriseName);

	var resArr = [];
	returnArr.filter(function(item){
	  	var i = resArr.findIndex(x => { return (x.name === item.name) });
	  	if(i <= -1){
	   	resArr.push(item);
	  	}
	  	return null;
	});

	resArr.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

	// console.log("737 getSearchSuggestions resArr => ",resArr);
	res.status(200).json({ list : resArr });
}

function getCategories(searchPhrase){
	return new Promise((resolve,reject)=>{
		// BusinessCategory.find({ businessCategory : new RegExp(searchPhrase,'i') })
		BusinessCategory.find({ businessCategory : new RegExp(searchPhrase,'i') })
			.then(data =>{
				if(data && data.length>0){
					var result = [];
					for(var i=0; i<data.length; i++){
						result.push({name:data[i].businessCategory})
					}
					if(i>=data.length){
						// console.log("getCategories data => ",data);
						resolve(result);
					}
				}else{
					resolve([]);
				}
			})
			.catch(error=>{
				console.log("getCategories error => ", error);
				reject([]);
			})
	});	
}

function getSubCategories(searchPhrase){
	return new Promise((resolve,reject)=>{
		BusinessSubCategory.find({ businessSubCategory : new RegExp(searchPhrase,'i') })
			.then(data =>{
				if(data && data.length>0){
					var result = [];
					for(var i=0; i<data.length; i++){
						result.push({name:data[i].businessSubCategory})
					}
					if(i>=data.length){
						// console.log("getSubCategories data => ",data);
						resolve(result);
					}
				}else{
					resolve([]);
				}
			})
			.catch(error=>{
				console.log("getSubCategories error => ", error);
				reject([]);
			})
	});	
}

function getExpertise(searchPhrase){
	return new Promise((resolve,reject)=>{
		BusinessCategory.find({ businessExpertise : new RegExp(searchPhrase,'i') })
			.then(data =>{
				if(data && data.length>0){
					var result = [];
					for(var i=0; i<data.length; i++){
						console.log("getExpertise data[i].businessExpertise => ",data[i].businessExpertise);

						var ind = data[i].businessExpertise.findIndex(element => {
									  	return element.toLowerCase() === new RegExp(searchPhrase,'i');
									});

						console.log("getExpertise ind => ",ind);

						if(ind > -1){
							result.push({name:data[i].businessExpertise[ind]})
						}
					}
					if(i>=data.length){
						// console.log("getExpertise data => ",data);
						resolve(result);
					}
				}else{
					resolve([]);
				}
			})
			.catch(error=>{
				console.log("getExpertise error => ", error);
				reject([]);
			})
	});	
}

function getConsultantName(searchPhrase){
	return new Promise((resolve,reject)=>{
		User.find({ 
				$or : [
					{ "profile.firstname" 	: new RegExp(searchPhrase,'i') },
					{ "profile.lastname" 	: new RegExp(searchPhrase,'i')  },
					{ "profile.fullName" 	: new RegExp(searchPhrase,'i')  },
				],
				roles : "consultant",
				approvalStatus : "Approved"
			})
			.then(data =>{
				if(data && data.length>0){
					var result = [];
					for(var i=0; i<data.length; i++){
						result.push({name:data[i].profile.firstname+" "+data[i].profile.lastname})
					}
					if(i>=data.length){
						// console.log("getConsultantName data => ",data);
						resolve(result);
					}
				}else{
					resolve([]);
				}
			})
			.catch(error=>{
				console.log("getConsultantName error => ", error);
				reject([]);
			})
	});	
}

function getEnterpriseName(searchPhrase){
	return new Promise((resolve,reject)=>{
		Enterprise.find({ 
			enterpriseName : new RegExp(searchPhrase,'i'),
			approvalStatus : "Approved"
		})
			.then(data =>{
				if(data && data.length>0){
					var result = [];
					for(var i=0; i<data.length; i++){
						result.push({name:data[i].enterpriseName})
					}
					if(i>=data.length){
						// console.log("enterpriseName data => ",data);
						resolve(result);
					}
				}else{
					resolve([]);
				}
			})
			.catch(error=>{
				console.log("enterpriseName error => ", error);
				reject([]);
			})
	});	
}



exports.getSearchResultsOld = (req,res,next)=>{
	/*
		Search for text in following things
		1. First and last Name of consultant
		2. Name of Organization
		3. Category
		4. Subcategories
		5. Expertise
	*/	

	var searchPhrase = req.body.searchPhrase;
	var introductoryCalls = '';
	// console.log("getSearchResults req.body = ", req.body);

	if(searchPhrase === "*"){
		var selector1 = {}
	}else{		
		var selector1 = {
			$or : [
				{ "profile.firstname" : new RegExp(searchPhrase,'i') },
				{ "profile.lastname" : new RegExp(searchPhrase,'i')  },
				{ "profile.fullName" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.category" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.subCategory.businessSubCategory" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.expertise.expertise" : new RegExp(searchPhrase,'i') },
			],
			approvalStatus : "Approved"
		};
	}

	if(req.body.location !== ""){
		selector1["address.city"] = req.body.location;
	}
	if(req.body.filters && req.body.filters.category){
		selector1["catg_subCatg_expertise.category"] = req.body.filters.category;
	}
	if(req.body.filters && req.body.filters.subCategory){
		selector1["catg_subCatg_expertise.subCategory.businessSubCategory"] = req.body.filters.subCategory;
	}
	if(req.body.filters && req.body.filters.expertise){
		selector1["catg_subCatg_expertise.expertise.expertise"] = req.body.filters.expertise;
	}
	if(req.body.filters && req.body.filters.location){
		selector1["address.city"] = req.body.filters.location;
	}
	if(req.body.filters && req.body.filters.experience){
		// if(typeof req.body.filters.experience === 'number'){		
			selector1["otherInfo.experience"] = parseInt(req.body.filters.experience);
		// }
	}
	if(req.body.filters && req.body.filters.languages){
		selector1["otherInfo.languages.language"] = req.body.filters.languages;
	}
	if(req.body.filters && req.body.filters.introductoryCalls){
		introductoryCalls = req.body.filters.introductoryCalls;
	}


	if(searchPhrase === "*"){
		var selector2 = {}
	}else{		
		var selector2 = {
			$or : [
				{ "enterpriseName" : new RegExp(searchPhrase,'i') },
				{ "catg_subCatg_expertise.category" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.subCategory.businessSubCategory" : new RegExp(searchPhrase,'i')  },
				{ "catg_subCatg_expertise.expertise.expertise" : new RegExp(searchPhrase,'i') },
			],
			approvalStatus : "Approved"
		};
	}

	if(req.body.filters && req.body.filters.category){
		selector2["catg_subCatg_expertise.category"] = req.body.filters.category;
	}
	if(req.body.filters && req.body.filters.subCategory){
		selector2["catg_subCatg_expertise.subCategory.businessSubCategory"] = req.body.filters.subCategory;
	}
	if(req.body.filters && req.body.filters.expertise){
		selector2["catg_subCatg_expertise.expertise.expertise"] = req.body.filters.expertise;
	}

	if(req.body.filters && req.body.filters.location){
		selector2["address.city"] = req.body.filters.location;
	}
	if(req.body.filters && req.body.filters.experience){
		selector2["experience"] = req.body.filters.experience;
	}
	if(req.body.filters && req.body.filters.languages){
		selector2["language"] = req.body.filters.languages;
	}


	var enterprises = [];
	var consultants = [];

	// console.log("selector1 = ", selector1);
	// console.log("selector2 = ", selector2);

	User.find(selector1,{services:0, statusLog:0})
		.populate("profile.company_id",{'profile':1})
		.then(async (searchResults) =>{
			// console.log("searchResults => ", searchResults);
			var numOfIntroCalls = [];
			var starRatingsArr = [];

			for(var i=0; i<searchResults.length; i++){
				var numOfIntroductoryCalls = await getNumOfIntroductoryCalls(searchResults[i]._id);
				var starRatings 				= await getStarRatings(searchResults[i]._id);

				consultants.push({
					type 						: "consultant",
					_id 						: searchResults[i]._id,
					fullname 				: searchResults[i].profile.firstname+" "+searchResults[i].profile.lastname,
					imageUrl 				: searchResults[i].documents && searchResults[i].documents.profilePhoto && searchResults[i].documents.profilePhoto.length>0 ? searchResults[i].documents.profilePhoto[0].url : "-",
					city 						: searchResults[i].address ? searchResults[i].address.city : "-",
					fees 						: searchResults[i].otherInfo ? searchResults[i].otherInfo.fees : "-",
					experience 				: searchResults[i].otherInfo ? parseInt(searchResults[i].otherInfo.experience) : "-",
					languages 				: searchResults[i].otherInfo ? searchResults[i].otherInfo.languages : "-",
					catg_subCatg_expertise 	: searchResults[i].catg_subCatg_expertise,
					enterprise_id 			: searchResults[i].profile && searchResults[i].profile.company_id && searchResults[i].profile.company_id._id ? searchResults[i].profile.company_id._id : "-",
					enterpriseName 		: searchResults[i].profile && searchResults[i].profile.company_id && searchResults[i].profile.company_id.enterpriseName ? searchResults[i].profile.company_id.enterpriseName : "-",
					profile 					: searchResults[i].profile,
					otherInfo 				: searchResults[i].otherInfo,
					numOfIntroCalls 		: numOfIntroductoryCalls,
					starRatings 			: starRatings,
				});

				numOfIntroCalls.push(numOfIntroductoryCalls);
				starRatingsArr.push(parseInt(starRatings))

			}

			Enterprise.find(selector2,{invitations:0, updateLog:0})
				.then(async (entpResults) =>{

					for(var j=0; j<entpResults.length; j++){
						var numOfConsNCalls  = await getNumOfConsNCalls(entpResults[j]._id);
						// console.log("numOfConsNCalls => ",numOfConsNCalls);

						enterprises.push({
							type 					: "enterprise",
							_id 					: entpResults[j]._id,
							fullname 			: entpResults[j].enterpriseName,
							imageUrl 			: entpResults[j].documents && entpResults[j].documents.companyLogo && entpResults[j].documents.companyLogo.length>0 ? entpResults[j].documents.companyLogo[0].url : "",
							city 					: entpResults[j].address && entpResults[j].address.city ? entpResults[j].address.city : "",
							experience 			: parseInt(entpResults[j].experience),
							catg_subCatg_expertise 	: entpResults[j].catg_subCatg_expertise,
							totalConsultants 	: numOfConsNCalls.totalConsultants,
							totalCalls 			: numOfConsNCalls.totalCalls,
						})
					}

					// processData(i, j, searchResults.length, entpResults.length, req.body.user_id, consultants,enterprises);
					// async function processData(i, j, srLength, entLength, user_id, consultants,enterprises){

						if(i>=searchResults.length && j>=entpResults.length){
							if(req.body.user_id === 0){
								var myConsultants = {data: 'User Not Found'};
							}else{
								var myConsultants = await getMyConsultants(req.body.user_id);
							}

							if(myConsultants.data === 0){
								res.status(500).json({message : "Error while getting myConsultants from User"});
							}else{
								var result = consultants.concat(enterprises);
								// console.log("result => ", result);
								let experiences = result.map(({ experience }) => experience);
								var uniqueExpertise = experiences.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
								
								let locations = result.map(({ city }) => city);
								var uniqueLocations = locations.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
								
								let lang = result.map((elem) => {
									if(elem.type==='consultant' && typeof elem.languages !== 'undefined'){										
										return elem.languages
									} 
								}); 
								var lang1 = lang.filter(function( element ) {    return element !== undefined; });
								var languages = [];
								var uniqueLang = [];
						
								for(var m=0; m<lang1.length; m++){
									var langElem = lang1[m];
									for (var n=0; n<langElem.length; n++) {
										languages.push(langElem[n].language);
									}
								}
								if(m >= lang1.length){
									uniqueLang = languages.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
								}

								res.status(200).json({
													searchResult  	: result, 
													myConsultants 	: myConsultants,
													experiences   	: uniqueExpertise,
													locations 		: uniqueLocations,
													languages 		: uniqueLang,
													numOfIntroCalls: numOfIntroCalls,
													starRatings 	: starRatingsArr
												});
							}
						}

					// }

				})
				.catch(error=>{
					console.log("Error while searching in User => ", error);
					res.status(500).json({message : "Error while searching in User"});
				})
		})
		.catch(error=>{
			console.log("Error while searching in User => ", error);
			res.status(500).json({message : "Error while searching in User"});
		})
}
