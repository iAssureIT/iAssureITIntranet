// import moment from 'moment';
var moment 			= require('moment');
const mongoose	    = require("mongoose");
var ObjectID 		= require('mongodb').ObjectID;
const https         = require('https')
const Razorpay      = require("razorpay");
var request         = require('request-promise')
var sha256          = require('js-sha256');
var CryptoJS        = require("crypto-js");
var globalVariable  = require("../../nodemonConfig.js");

const Orders        = require('../models/paymentProcessModel.js');
const Invoice 		= require('../models/invoiceModel.js');


var instance 		= new Razorpay({
  key_id     : 'rzp_test_lQNmCUfCX3Wkh4',
  key_secret : 'VgF165CC3e5vKlfqwPnbeckJ'
});

exports.payment_response = (req,res,next) =>{
	var _id = req.params.order_id;
	
	var generated_signature = sha256.hmac('VgF165CC3e5vKlfqwPnbeckJ', req.body.razorpay_order_id+"|"+req.body.razorpay_payment_id);
	// console.log("generated_signature",generated_signature);
	if (generated_signature == req.body.razorpay_signature) { 
	  Orders.updateOne(
                    { "_id": _id},

                    {
                        $set : {
								"transactionId" 	: req.body.razorpay_payment_id,
								"paymentStatus"		: "Paid",
                        }
                    }
                    )
 		
         .exec()
         .then(data=>{
         	// res.redirect("http://localhost:3000/paymentResponse");
            if(data.nModified === 1){
         	// console.log("req.body.razorpay_order_id",req.body.razorpay_order_id);

         		Orders.findOne({ "paymentOrderId":req.body.razorpay_order_id})
         		.then((orderDetails)=>{
         			// console.log("orderDetails--",orderDetails);
         			// console.log("globalVariable.url ",globalVariable.url);
         			
         			var url = globalVariable.url+"payment-response/"+orderDetails.paymentOrderId;
         			if(url){
						res.redirect(url);
         			}
         		})
	            .catch(err =>{
	                console.log(err);
	                res.status(500).json({
	                    error: err
	                });
	            });	
            }else{
                res.status(200).json({message : "SIGNATURE_MATCHED_BUT_ORDER_NOT_UPDATED"})
            }
         })
	} else {
		// console.log("payment Failed",JSON.stringify(req.body));
		// console.log("req.body.razorpay_order_id",req.body.razorpay_order_id);
		Orders.updateOne(
                        { "_id" : _id},
                        {
                            $set : {
								"transactionId" 	: req.body.razorpay_payment_id,
								"paymentStatus"		: "Failed",
                            }
                        }
                    )
         .exec()
         .then(data=>{
         	if(data.nModified === 1){
         	// console.log("req.body.razorpay_order_id",req.body.razorpay_order_id);

         		Orders.findOne({ "_id":_id})
         		.then((orderDetails)=>{
         			// console.log("orderDetails--",orderDetails);
         			// console.log("globalVariable.url ",globalVariable.url);
         			var url = globalVariable.url+"payment-response/"+orderDetails.paymentOrderId;
         			if(url){
						res.redirect(url);
         			}
         		})
	            .catch(err =>{
	                console.log(err);
	                res.status(500).json({
	                    error: err
	                });
	            });	
            }else{
                res.status(200).json({message : "SIGNATURE_MATCHED_BUT_ORDER_NOT_UPDATED"})
            }
         	
         })
	}
}
//End of payment gateway integration
exports.create_order = (req, res, next) => {
	var paymentData = {
		"amount" 			: req.body.amount,
		"currency"			: req.body.currency,
		"receipt"			: req.body.receipt,
		"payment_capture"	: req.body.payment_capture,
	};
	instance.orders.create(paymentData, function(err, payment_order) {
      	if(err){
	        res.status(500).json({
	            error: err
	        }); 
	    }else if(payment_order){
	        // res.status(200).json(order);
	        // console.log("payment_order ",payment_order);

			Orders  .find()
					.count()
				    .then((maxInvoiceNum)=>{

						var order = new Orders({
												"_id"           	: mongoose.Types.ObjectId(), 
												"invoiceNum" 		: maxInvoiceNum + 1,
												"plan_ID"			: req.body.planID,
											    "userID"			: req.body.userID,
											    "planName"			: req.body.planName,
												"planAmount"  		: req.body.planAmount, 
												"validityPeriod" 	: req.body.validityPeriod, //1 month or 1 year
												"purchaseDate"		: req.body.purchaseDate, //"YYYY-MM-DD"
												"startDate" 		: req.body.startDate, //"YYYY-MM-DD"
												"endDate" 			: req.body.endDate, //"YYYY-MM-DD"
												"paymentOrderId" 	: payment_order.id,
												"amountPaid"		: payment_order.amount,
												"paymentStatus"		: "unPaid",
												"createdBy"			: req.body.createdBy,
												"createdAt"			: new Date(),
											});
						// console.log("order ",order);


						order.save()
					        .then(data=>{
					                res.status(200).json(payment_order);
					            })
					            .catch(err =>{
					                console.log(err);
					                res.status(500).json({
					                	message: "Some issue occured in Order Insert",
					                    error: err
					                });
					            });	

				    })
		            .catch(err =>{
		                console.log(err);
		                res.status(500).json({
		                	message: "Some issue occured while finding Max Invoice Number",
		                    error: err
		                });
		            });	
	    }
    });
};
exports.paymentOrderDetails = (req,res,next) =>{
	Invoice.find()
	Orders.aggregate([
						{
							$match : {  
								"paymentOrderId" : req.params.paymentOrderId
							}
						},
						{
							$lookup : {
										   	from 			: "users",
									       	localField		: "userID",
									       	foreignField	: "_id",
									       	as 				: "user"
										}
						},
						{
							$unwind : "$user"
						},
						{
							$project : {
											"transactionId"	: 1,
											"paymentStatus"	: 1,
											"invoiceNum"	: 1,
											"createdAt"		: 1,
											"user_ID"		: 1,
											"amountPaid"	: 1,
											"paymentOrderId": 1,
											"planName"		: 1,
											"user_ID"		: "$user._id",
											"userName"		: "$user.profile.fullName",
											"email"			: "$user.profile.emailId",
											"mobileNumber"	: "$user.profile.mobNumber",
											"_id"			: 1,
											"validityPeriod": 1,
									}
						}
					])
		  .then(orders=>{
		  	res.status(200).json(orders[0]);
		  })
		  .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
};
exports.paymentOrderDetails_user = (req,res,next) =>{

	Orders.aggregate([
						{
							$match : {  
								"userID" 		: ObjectID(req.params.userId),
							}
						},
						{
							$lookup : {
										   	from 			: "users",
									       	localField		: "userID",
									       	foreignField	: "_id",
									       	as 				: "user"
										}
						},
						{
							$unwind : "$user"
						},
						{
							$project : {
											"transactionId"	: 1,
											"paymentStatus"	: 1,
											"invoiceNum"	: 1,
											"createdAt"		: 1,
											"user_ID"		: 1,
											"amountPaid"	: 1,
											"paymentOrderId": 1,
											"planName"		: 1,
											"user_ID"		: "$user._id",
											"userName"		: "$user.profile.fullName",
											"email"			: "$user.profile.emailId",
											"mobileNumber"	: "$user.profile.mobNumber",
											"_id"			: 1,
											"validityPeriod": 1,
									}
						}
					])
		  .then(orders=>{
		  	res.status(200).json(orders);
		  })
		  .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
};


exports.paymentOrderDetails_all = (req,res,next) =>{
	Orders.aggregate([
						{
							$lookup : {
										   	from 			: "users",
									       	localField		: "userID",
									       	foreignField	: "_id",
									       	as 				: "user"
										}
						},
						{
							$unwind : "$user"
						},
						{
							$project : {
											"transactionId"	: 1,
											"paymentStatus"	: 1,
											"invoiceNum"	: 1,
											"createdAt"		: 1,
											"user_ID"		: 1,
											"amountPaid"	: 1,
											"paymentOrderId": 1,
											"planName"		: 1,
											"user_ID"		: "$user._id",
											"userName"		: "$user.profile.fullName",
											"email"			: "$user.profile.emailId",
											"mobileNumber"	: "$user.profile.mobNumber",
											"_id"			: 0,
											"validityPeriod": 1,
									}
						}
					])
		  .then(orders=>{
		  	res.status(200).json(orders);
		  })
		  .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
};



