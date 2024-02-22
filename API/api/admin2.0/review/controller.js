const mongoose					= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
const Review 					= require('./model.js');
const Appointments			= require('../appointments/model.js');
const User 						= require('../userManagementnew/ModelUsers.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');



exports.insertReview = (req,res,next)=>{
	// console.log("insertReview req.body => ", req.body);

	var review = new Review({
  						_id  					: new mongoose.Types.ObjectId(),
  						tokenNumber 	: req.body.tokenNumber,
					   user_id 			: req.body.user_id,
					   introCallDate    : req.body.introCallDate,
            			introCallTime   : req.body.introCallTime,
			         consultantName  	: req.body.consultantName,
					   entrName        	: req.body.entrName,
					   consultantId   	: req.body.consultantId,
					   company_id          	: req.body.compId,
					   rating   		: req.body.rating,			           
					   reviewComment   	: req.body.review,
					   recommend		: req.body.recommend,
					   reviewSubmitted  : req.body.reviewSubmitted,
					   fbKeyWordsArr	: req.body.fbKeyWordsArr,
					   createdBy 		: req.body.user_id,
					   createdAt 		: new Date(),
					});

		review.save()
			.then(insertedReview =>{
				// console.log("insertedReiew response => ", insertedReview);

				Appointments.updateOne(
												{tokenNumber : req.body.tokenNumber},
												{$set : {reviewSubmitted : true} }
											)
						.then(updatedApmt =>{
							// console.log("Review Appointments updatedApmt => ",updatedApmt);
							res.status(200).json({
								message 	: "Appointments inserted successfully",
								success 	: true,
								feedback : insertedReview
							});
						})
						.catch(error=>{
							console.log("Error while update apmt -> ",error);
							res.status(500).json({
								message 	: "Error while inserting Review",
								success 	: false,
								error 	: error
							});
						})


			})
			.catch(error=>{
				console.log("Error while inserting Review -> ",error);
				res.status(500).json({
					message 	: "Error while inserting Review",
					success 	: false,
					error 		: error
				});
			})

};

exports.getReviewList = (req,res,next)=>{
	Review.find({})
		.sort({"createdAt" : -1})
		.then(reviewList=>{
			res.status(200).json({
				reviewList: reviewList,
				message: "Review List Generated !!"
			})
		})
		.catch(error=>{
			res.status(500).json({
				error:error,
				message:"Some error occured while generating review List"
			})
		});
}

exports.getUserReviewList = (req,res,next)=>{
	var user_id = req.params.user_id;
	// console.log("User List ===",user_id);
	Review.find({user_id : user_id})
		.sort({"createdAt" : -1})
		.then(userReviewList=>{
			console.log("userReviewList => ",userReviewList);
			if(userReviewList && userReviewList.length>0){				
				res.status(200).json({
					userReviewList: userReviewList,
					message: "User Review List Generated !!"
				})
			}else{
				res.status(200).json({
					userReviewList: [],
					message: "Reviews not found"
				})				
			}
		})
		.catch(error=>{
			res.status(500).json({
				error:error,
				message:"Some error occured while generating user review list"
			})
		});
}

exports.getConsultantReviewList = (req,res,next)=>{
	var user_id = req.params.user_id;
	// console.log("Consultant List ===",user_id);
	Review.find({consultantId : ObjectId(user_id)})
		.populate("user_id")
		.sort({"createdAt" : -1})
		.then(consultantReviewList=>{
			res.status(200).json({
				consultantReviewList: consultantReviewList,
				message: "Consultant Review List Generated !!"				
			})
			// console.log("consultantReviewList",consultantReviewList);
		})
		.catch(error=>{
			console.log("getConsultantReviewList error => ",error)
			res.status(500).json({
				error:error,
				message:"Some error occured while generating consultant review list"
			})
		});		
}


exports.patchReply = (req,res,next)=>{
	// console.log("patchReply req.body => ",req.body);
	
	Review.updateOne({_id : req.body.review_id},{$set : {reviewReply : req.body.reply} })
			.then(reviewUpdate=>{
				res.status(200).json({
					success : true,
					reviewUpdate: reviewUpdate,
					message: "Reply Updated Successfully!"
				})
			})
			.catch(error=>{
				res.status(500).json({
					error:error,
					message:"Some error occured while updating reply to review"
				})
			});
}



exports.getEnterpriseReviewList = (req,res,next)=>{
	var enterprise_id = req.params.enterprise_id;

	User.find({"profile.company_id" : enterprise_id},{_id:1})
		.then(entpUsers =>{
			var entpUsers_ids = entpUsers.map(x=>x._id.toString());
			// console.log("entpUsers_ids => ",entpUsers_ids);

			Review.find({consultantId : {$in : entpUsers_ids}})
				.populate("user_id")
				.sort({"createdAt" : -1})
				.then(enterpriseReviewList=>{
					// console.log("enterpriseReviewList => ",enterpriseReviewList);
					res.status(200).json({
						success : true,
						enterpriseReviewList: enterpriseReviewList,
						message: "Consultant Review List Generated !!"				
					})
				})
				.catch(error=>{
					console.log("1 enterpriseReviewList error => ",error);

					res.status(500).json({
						success 	: false,
						error:error,
						message:"Some error occured while generating enterprise review list"
					})
				});
		})
		.catch(error=>{
			console.log("2 enterpriseReviewList error => ",error);

			res.status(500).json({
				success 	: false,
				error  	: error,
				message 	: "Some error occured while generating enterprise review list"
			})
		});		


}
