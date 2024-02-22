const mongoose          = require("mongoose");
const Products          = require('../products/Model');
const CustomerReview    = require('./ModelMVMP');
var ObjectId            = require('mongodb').ObjectID;
const moment            = require('moment-timezone');

/*=========== Insert Customer Review ===========*/
exports.insertCustomerReview = (req,res,next)=>{
	console.log("req body customer Review => ", req.body);
	processData();
	async function processData(){	
		var product = await Products.findOne({"_id" : ObjectId(req.body.product_id)})
		const customerReview = new CustomerReview({
			_id             		: new mongoose.Types.ObjectId(),                    
			customer_id     		: req.body.customer_id,
			customerName    		: req.body.customerName,
			order_id        		: req.body.order_id,
			product_id      		: req.body.product_id,
			vendor_id 				: req.body.vendor_id,
			section_id 				: product.section_ID,
			category_id 			: product.category_ID,
			subCategory_id 		: product.subCategory_ID,
			vendorLocation_id 	: req.body.vendorLocation_id,
			rating          		: req.body.rating,
			customerReview  		: req.body.customerReview,
			reviewProductImages 	: req.body.reviewProductImages,
			status          		: 'New',
			createdAt       		: new Date()
		});
		customerReview.save()
		.then(data=>{
			res.status(200).json({
				"message" : "Thanks for your review."
			});
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});	
	}	
};

/*=========== Get Review List ===========*/
exports.list_review = (req,res,next)=>{
	console.log("req body get All Reviews => ", req.body)
	var selector        = {};
	selector['$and']    = [];

	if(req.body.vendor !== "" && req.body.vendor !== undefined){
		selector["$and"].push(
			{"vendor_id" : ObjectId(req.body.vendor)}
		)
	}
	if(req.body.section !== "" && req.body.section !== undefined){
		selector["$and"].push(
			{"section_id" : ObjectId(req.body.section)}
		)
	}
	if(req.body.category !== "" && req.body.category !== undefined){
		selector["$and"].push(
			{"category_id" : ObjectId(req.body.category)}
		)
	}
	if(req.body.subCategory !== "" && req.body.subCategory !== undefined){
		selector["$and"].push(
			{"subCategory_id" : ObjectId(req.body.subCategory)}
		)
	}
	if(req.body.status !== "" && req.body.status !== undefined){
		selector["$and"].push(
			{"status" : req.body.status}
		)
	}else{
		selector["$and"].push(
			{"status" : {$ne : ""}}
		)
	}
	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push({ "$vendorDetails.companyName" : {'$regex' : req.body.searchText , $options: "i" } });
		selector["$and"].push({ 
			"$or" : [
						{ "orderDetails.orderID" 												: parseInt(req.body.searchText) },
						{ "customerName" 											: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorDetails.companyName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "userDetails.profile.fullName" 					: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productDetails.productName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "sectionDetails.section" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.category" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.subCategory.subCategoryTitle": {'$regex' : req.body.searchText , $options: "i" } },
						{ "productDetails.productCode"						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productDetails.itemCode"							: {'$regex' : req.body.searchText , $options: "i" } },
					]
		})
	}
	console.log("selector => ",selector)

	CustomerReview.aggregate([
		{ $lookup:{
				from 			: 'products',
				localField 		: 'product_id',
				foreignField 	: '_id',
				as 				: 'productDetails'
			}
		},
		{ $lookup : {
				from 				: 'entitymasters',
				localField 			: 'vendor_id',
				foreignField 		: '_id',
				as 					: 'vendorDetails'
			}
		},
		{ $lookup : {
				from 				: 'users',
				localField 			: 'user_id',
				foreignField 		: '_id',
				as 					: 'userDetails'
			}
		},		
		{ $lookup : {
				from 				: 'sections',
				localField 			: 'section_id',
				foreignField 		: '_id',
				as 					: 'sectionDetails'
			}
		},
		{ $lookup : {
				from 				: 'categories',
				localField 			: 'category_id',
				foreignField 		: '_id',
				as 					: 'categoryDetails'
			}
		},
		{ $lookup : {
				from 				: 'orders',
				localField 			: 'order_id',
				foreignField 		: '_id',
				as 					: 'orderDetails'
			}
		},
		{ $match : selector },
		{ $sort: {
				createdAt : -1
			}
		},
		{$project : {
				customer_id 					: 1,
				customerName    				: 1,
				order_id        				: 1,
				'orderDetails.orderID'     : 1,
				product_id      				: 1,
				vendor_id 						: 1,
				vendorLocation_id 			: 1,
				rating          				: 1,
				customerReview  				: 1,
				status          				: 1,
				createdAt       				: 1,
				"productDetails.productName"	: 1,
				"productDetails.productCode" 	: 1,
				"productDetails.section" 	: 1,
				"productDetails.category" 	: 1,
				"productDetails.subCategory" 	: 1,
				"vendorDetails.companyName"		: 1,
				"categoryDetails.category"		: 1,
				"sectionDetails.section"		: 1
			}
		}
	])
	// .skip(parseInt(req.body.startRange))
	// .limit(parseInt(req.body.limitRange))
	.exec()
	.then(data=>{
		// console.log("data => ",data)
		res.status(200).json({
			dataCount 	: data.length,
			data 			: data.slice(parseInt(req.body.startRange), (parseInt(req.body.limitRange) + parseInt(req.body.startRange)))
		});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

/*=========== Get Single Review ===========*/
exports.get_single_review = (req,res,next)=>{
	// console.log("req.params.review_id => ",req.params.review_id)
	CustomerReview.findOne({"_id" : ObjectId(req.params.review_id)})
	.populate("product_id")
	.populate("vendor_id")
	.populate("customer_id")
	.populate("order_id")
	.then(async(data)=>{
		if(data && data !== undefined){
			if (data.vendor_id && data.vendor_id !== null) {
				var vendorLocation 	= await data.vendor_id.locations.find(location => String(location._id) === String(data.vendorLocation_id));
				var vendorContact 	= vendorLocation && vendorLocation !== undefined 
											  ?
											  		data.vendor_id.contactPersons.find(contactPerson => contactPerson.branchCode === vendorLocation.branchCode)
											  :
											  		null
			}

			var returnData = {
				orderID 						: data.order_id && data.order_id !== null ? data.order_id.orderID : "",
				product_id 					: data.product_id && data.product_id !== null ? data.product_id._id : "",
				productName 				: data.product_id && data.product_id !== null ? data.product_id.productName : "",
				productCode 				: data.product_id && data.product_id !== null ? data.product_id.productCode : "",
				itemCode 					: data.product_id && data.product_id !== null ? data.product_id.itemCode : "",
				section 						: data.product_id && data.product_id !== null ? data.product_id.section : "",
				category 					: data.product_id && data.product_id !== null ? data.product_id.category : "",
				subCategory 				: data.product_id && data.product_id !== null ? data.product_id.subCategory : "",
				size 							: data.product_id && data.product_id !== null ? data.product_id.size : "",
				color 						: data.product_id && data.product_id !== null ? data.product_id.color : "",
				unit 							: data.product_id && data.product_id !== null ? data.product_id.unit : "",
				vendor_id 					: data.vendor_id && data.vendor_id !== null ? data.vendor_id._id : "",
				vendorName 					: data.vendor_id && data.vendor_id !== null ? data.vendor_id.companyName : "",
				vendorLocation_id 		: data.vendorLocation_id,
				vendorLocation 			: vendorLocation ? vendorLocation : {},
				vendorContact  			: vendorContact ? vendorContact : "",
				dateOfPurchase 			: data.order_id && data.order_id !== null ? data.order_id.createdAt : "",
				reviewDate 					: data.createdAt,
				adminComments 				: data.adminComments,
				vendorComment 				: data.vendorComment,
				customer_id 				: data.customer_id && data.customer_id !== null ? data.customer_id._id : "",
				customerName 				: data.customer_id && data.customer_id !== null ? data.customer_id.profile.fullName : "",
				customerEmail 				: data.customer_id && data.customer_id !== null ? data.customer_id.profile.email : "",
				customerMobile 			: data.customer_id && data.customer_id !== null ? data.customer_id.profile.mobile : "",
				customerReview     		: data.customerReview,
				reviewProductImages 		: data.reviewProductImages,
				rating 						: data.rating,
				status 						: data.status
			}
			res.status(200).json(returnData);
		}else{
			res.status(200).json(data);
		}
		// var vendorLocation 	= await data.vendor_id.locations.find(location => String(location._id) === String(data.vendorLocation_id));
		// var vendorContact 	= vendorLocation && vendorLocation !== undefined 
		// 					  ?
		// 					  	data.vendor_id.contactPersons.find(contactPerson => contactPerson.branchCode === vendorLocation.branchCode)
		// 					  :
		// 					  	null
		// if(data && data !== undefined){
		// 	var returnData = {
		// 		product_id 				: data.product_id._id,
		// 		productName 			: data.product_id.productName,
		// 		productCode 			: data.product_id.productCode,
		// 		itemCode 				: data.product_id.itemCode,
		// 		itemCode 				: data.product_id.itemCode,
		// 		itemCode 				: data.product_id.itemCode,
		// 		itemCode 				: data.product_id.itemCode,
		// 		vendor_id 				: data.vendor_id._id,
		// 		vendorName 				: data.vendor_id.companyName,
		// 		vendorLocation_id 	: data.vendorLocation_id,
		// 		vendorLocation 		: vendorLocation,
		// 		vendorContact  		: vendorContact,
		// 		reviewDate 				: data.createdAt,
		// 		adminComment 			: data.adminComment,
		// 		vendorComment 			: data.vendorComment,
		// 		vendorComment 			: data.vendorComment,
		// 		customer_id 			: data.customer_id._id,
		// 		customerName 			: data.customer_id.profile.fullName,
		// 		customerEmail 			: data.customer_id.profile.email,
		// 		customerMobile 		: data.customer_id.profile.mobile,
		// 		customerReview      	: data.customerReview,
		// 		reviewProductImages 	: data.reviewProductImages,
		// 		rating 					: data.rating,
		// 		status 					: data.status
		// 	}
		// 	res.status(200).json(returnData);
		// }else{
		// 	res.status(200).json(data);
		// }		
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

/*=========== Add admin or vendor comment ===========*/
exports.add_admin_or_vendor_comment = (req, res, next) => {
	console.log("req.body => ",req.body);
	// console.log("req.body => ",req.body.vendorComment);
	// if(req.body.adminComment && req.body.adminComment !== undefined){
	// 	var comment = {adminComment : req.body.adminComment}
	// }else if(req.body.vendorComment && req.body.vendorComment !== undefined){
	// 	var comment = {vendorComment : req.body.vendorComment}
	// }
	// console.log("comment => ",comment);
	CustomerReview.updateOne(
		{ _id: ObjectId(req.body.review_id)},
		{$push: 
			{'adminComments' : 
				{
					comment 		: req.body.comment,
					commentBy 	: req.body.commentBy,
					commentedOn : new Date()
				}
			}
		}
	)
	.then(data => {
		res.status(200).json({
			message : 'Comment added successfully.'
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

/*=========== Change Review Status ===========*/
exports.change_review_status = (req, res, next) => {	
	// console.log("req.body => ",req.body);
	CustomerReview.updateOne(
		{ _id: req.body.review_id},
		{
			$set: {status : req.body.status}
		}
	)
	.exec()
	.then(data => {
		// console.log("data => ",data)
		if(data.nModified === 1){
			res.status(200).json({
				message : 'Review ' + req.body.status + ' successfully.'
			});
		}else{
			res.status(200).json({
				message : 'Review is already '+ req.body.status
			});
		}		
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

/*=========== Customer Review List for Particular Product ===========*/
exports.list_customer_review_for_product = (req,res,next)=>{
	CustomerReview.find({"product_id" : req.params.product_id, "status": "Published"})
	.sort({"createdAt" : -1})
	.exec()
	.then(data=>{
		var totalNumOfReviews 	= data.length;
		var totalOfRatings 		= 0;
		var avgRating 			 	= 0;

		if (data && data.length > 0) {
			for (var i = 0; i < data.length; i++) {
				totalOfRatings += data[i].rating;
			}
			if (i >= data.length) {
				avgRating = totalOfRatings / totalNumOfReviews;

				res.status(200).json({
					reviewlist 			: data,
					totalNumOfReviews : totalNumOfReviews,
					avgRating 			: avgRating
				});
			}
		}else{
			res.status(200).json({
				reviewlist 			: data,
				totalNumOfReviews : totalNumOfReviews,
				avgRating 			: avgRating
			});
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error : err
		});
	});
};

/*=========== Customer Review For Single User ===========*/
exports.single_customer_review_for_product = (req,res,next)=>{
	CustomerReview.findOne({"product_id" : req.body.product_id, "customer_id" : req.body.customer_id, "order_id" : req.body.order_id,})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

/*=========== Update Customer Review ===========*/
exports.updateCustomerReview = (req, res, next) => {
	console.log('rating', req.body);
	CustomerReview.updateOne(
		{ _id: req.body.review_id},
		{
			$set: {
					"rating"            		: req.body.rating,
					"customerReview"    		: req.body.customerReview,
					"reviewProductImages" 	: req.body.reviewProductImages,
					"status"          		: 'New',
			}
		}
	)
	.exec()
	.then(data => {
		// console.log("data => ",data)
		if(data.nModified === 1){
			res.status(200).json({
				"messageCode" : true,
				"message": "Your review updated successfully."
			});
		}else{
			res.status(200).json({
				"messageCode" : false,
				"message": "It seems that you didn't change anything."
			});
		}		
	})
	.catch(err => {
		console.log("Error while updating review");
		res.status(500).json({
			error: err
		});
	});
};


exports.listCustomerProductReview = (req,res,next)=>{
	 // console.log('param', req.params);
	 CustomerReview.findOne({"customerID": ObjectId(req.params.customerID),  "product_id" : ObjectId(req.params.product_id), "orderID": ObjectId(req.params.orderID)})
	 .exec()
	 .then(data=>{
		  res.status(200).json(data);
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};
exports.list_customer_reviews = (req,res,next)=>{
	 CustomerReview.find()
	 .exec()
	 .then(data=>{
		  res.status(200).json(data);
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};
exports.update_review_status = (req,res,next)=>{
	 CustomerReview.updateOne(
		  { _id:req.body.review_ID},  
		  {
				$set:{
					 "status" : req.body.status,
				}
		  }
	 )
	 .exec()
	 .then(data=>{
		  if(data.nModified == 1){
				res.status(200).json({
					 "message": "Success",
				});
		  }else{
				res.status(401).json({
					 "message": "Product Not Found"
				});
		  }
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};
exports.customerReviewAvg = (req,res,next)=>{
	 CustomerReview.aggregate([
		  {$match:
				{"product_id" : ObjectId(req.params.product_id)} 
		  },
		  { $group: { _id : ObjectId(req.params.product_id), "reviewAvg" : { "$avg": "$rating" } } }
	 ])
	 .exec()
	 .then(data=>{
		  res.status(200).json(data);
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};
exports.listCustomerReviewbucustomerid = (req,res,next)=>{
	 CustomerReview.aggregate([
		  {$match:
				{"customerID" : ObjectId(req.params.customerID)} 
		  },
		  { $lookup:
				{
				 from: 'products',
				 localField: 'product_id',
				 foreignField: '_id',
				 as: 'productDetails'
				}
		  },
		  {
				$sort: {
				  "reviewlist.createdAt": -1
				}
		  }
	 ])
	 .exec()
	 .then(data=>{
		  res.status(200).json(data);
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};
exports.delete_review = (req,res,next)=>{
	console.log("req.params.reviewID => ",req.params.reviewID)
	 CustomerReview.deleteOne({_id:req.params.reviewID})
	 .exec()
	 .then(data=>{
	// console.log("data => ",data)
	 		if (data.deletedCount === 1) {
	 			res.status(200).json({
			  		deleted 	: true,
					"message": "Review deleted successfully."
			  });
	 		} else {
			  res.status(200).json({
			  		deleted 	: false,
					"message": "Failed to delete review."
			  });
	 			
	 		}
	 })
	 .catch(err =>{
		  console.log(" Error => ",err);
		  res.status(500).json({
				error: err
		  });
	 });
};


exports.add_admin_comment = (req, res, next) => {
	 CustomerReview.updateOne(
		  { _id: req.body.rating_ID},
		  { $push: 
			{'adminComments' : 
				{
					comment 		: req.body.comment,
					commentBy 	: req.body.commentBy,
					commentedOn : new Date()
				}
			}
		}
	 )
	 .exec()
	 .then(data => {
		  res.status(200).json({
				message : 'Comment added successfully.'
		  });
	 })
	 .catch(err => {
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};

exports.vendor_review_list = (req,res,next)=>{
	 CustomerReview.aggregate([
		  { $lookup:
			  {
				from: 'products',
				localField: 'product_id',
				foreignField: '_id',
				as: 'productDetails'
			  }
		  },
		  { $unwind : "$productDetails" },
		  { $match : { "productDetails.vendor_ID" : ObjectId(req.body.vendor_ID) } },
		  {
			  $sort: {
				 "reviewlist.createdAt": -1
			  }
		  }
	 ])
	 .skip(parseInt(req.body.startRange))
	 .limit(parseInt(req.body.limitRange))
	 .exec()
	 .then(data=>{
		  var tableData = data.map((a, i)=>{
				return{
				  "_id"           : a._id,
				  "productName"   : a.productDetails ? (a.productDetails.productName+" "+"("+a.productDetails.productCode)+")" : "-",
				  "productImages" : a.productDetails ? a.productDetails.productImage : [],
				  "customerName"  : a.customerName,
				  "customerReview": a.customerReview,                
				  "adminComment"  : a.adminComment ? a.adminComment : "-",
				  "orderID"       : a.orderID,
				  "product_id"     : a.product_id,
				  "rating"        : a.rating ? a.rating : 0,
				  "reviewlist"    : a.reviewlist,
				  "status"        : a.status
				};
			 })
		  res.status(200).json(tableData);
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};

exports.vendor_review_count = (req,res,next)=>{
	 CustomerReview.aggregate([
		  { $lookup:
			  {
				from: 'products',
				localField: 'product_id',
				foreignField: '_id',
				as: 'productDetails'
			  }
		  },
		  { $match : { "productDetails.vendor_ID" : ObjectId(req.params.vendorID) } },
		  {   
				"$count": "dataCount"
		  },
	 ])
	 .exec()
	 .then(data=>{
		  res.status(200).json(data);
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};

exports.count_review = (req,res,next)=>{
	 CustomerReview.find({})
	 .exec()
	 .then(data=>{
		  res.status(200).json({"dataCount":data.length});
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};

exports.searchCustomerReview = (req, res, next)=>{
	 var searchText = req.body.searchText;
	 CustomerReview.aggregate([
		 { $lookup:
			  {
				from: 'products',
				localField: 'product_id',
				foreignField: '_id',
				as: 'productDetails'
			  }
		 },
		 { $match: { $or: [ 
						  {"customerReview"    : {'$regex' : '^'+searchText, $options: "i"}},
						  {"customerName"      : {'$regex' : '^'+searchText, $options: "i"}},
						  {"rating"            : {'$regex' : '^'+searchText, $options: "i"}},
						  { "productDetails"   : { $elemMatch: { "section"    : {'$regex' : '^'+searchText, $options: "i"} } } },
						  { "productDetails"   : { $elemMatch: { "category"   : {'$regex' : '^'+searchText, $options: "i"} } } },
						  { "productDetails"   : { $elemMatch: { "subCategory": {'$regex' : '^'+searchText, $options: "i"} } } },
						  { "productDetails"   : { $elemMatch: { "productName": {'$regex' : '^'+searchText, $options: "i"} } } },
					 ]
			  } 
		 },
		 {
			  $sort: {
				 "reviewlist.createdAt": -1
			  }
		 }
	 ])
	 .skip(parseInt(req.body.startRange))
	 .limit(parseInt(req.body.limitRange))
	 .exec()
	 .then(data=>{
		  res.status(200).json(data);
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};


exports.ytdreviews = (req,res,next)=>{
	 //console.log('year',moment().tz('Asia/Kolkata').startOf('year'));
	 //console.log('day',moment().tz('Asia/Kolkata').endOf('day'));

	 CustomerReview.find({
		createdAt: {
		  $gte:  moment().tz('Asia/Kolkata').startOf('year'),
		  $lte:  moment().tz('Asia/Kolkata').endOf('day')
		}
	 }).count()     
		  .exec()
		  .then(data=>{
			 res.status(200).json({ "dataCount": data });
		  })
		  .catch(err =>{
				console.log(err);
				res.status(500).json({
					 error: err
				});
		  });
};


exports.mtdreviews = (req,res,next)=>{

	 CustomerReview.find({
		createdAt: {
		  $gte:  moment().tz('Asia/Kolkata').startOf('month'),
		  $lte:  moment().tz('Asia/Kolkata').endOf('day')
		}
	 }).count()      
		  .exec()
		  .then(data=>{
			 res.status(200).json({ "dataCount": data });
		  })
		  .catch(err =>{
				console.log(err);
				res.status(500).json({
					 error: err
				});
		  });
};

exports.count_todaysreview = (req,res,next)=>{
	 CustomerReview.find({ "createdAt": {$gte:  moment().tz('Asia/Kolkata').startOf('day')} }).count()
	 .exec()
	 .then(data=>{
		  res.status(200).json({ "dataCount": data });
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};

exports.UnpublishedCount = (req,res,next)=>{
	 CustomerReview.find({ "status" : "Unpublish" }).count()
	 .exec()
	 .then(data=>{
		  res.status(200).json({ "dataCount": data });
	 })
	 .catch(err =>{
		  console.log(err);
		  res.status(500).json({
				error: err
		  });
	 });
};
