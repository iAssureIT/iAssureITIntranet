const mongoose	                	= require("mongoose");
var ObjectId                    	= require('mongodb').ObjectID;
const moment 							= require('moment-timezone');
const CreditPoints              	= require('./Model');
const CreditPointsPolicy 			= require('../CreditPointsPolicy/Model');

/*=========== Get credit points policy data ===========*/
exports.get_credit_points = (req, res, next) => {
	CreditPoints.findOne({user_id : ObjectId(req.params.customer_id)})
	.populate('transactions.order_id', 'orderID')
	.then(async(creditpointsdata)=>{
		// console.log("creditpointsdata => ",creditpointsdata)
		var creditPointsPolicy   = await CreditPointsPolicy.findOne();   
		if(creditPointsPolicy !== null){
			var expiryLimitInDays 	= creditPointsPolicy.expiryLimitInDays;
			var creditPointValue 	= creditPointsPolicy.creditPointValue;
		}         
		if(creditpointsdata !== null){
			var returnData = {
				_id 			: creditpointsdata._id,
				user_id 		: creditpointsdata.user_id,
				totalPoints 	: creditpointsdata.totalPoints,
				totalPointsValue : (parseInt(creditpointsdata.totalPoints) * parseFloat(creditPointValue)).toFixed(2),
				transactions 	: creditpointsdata.transactions && creditpointsdata.transactions.length > 0
									? 
										(creditpointsdata.transactions.map((a, i)=>{	
											if(a.order_id !== null){			
												return {
													_id                 	: a._id,
													order_id    			: a.order_id._id,
													orderID    				: a.order_id.orderID,
													transactionDate     	: a.transactionDate,
													expiryDate 				: a.expiryDate,
													purchaseAmount    	: a.purchaseAmount.toFixed(2),
													shippingCharges     	: a.shippingCharges.toFixed(2),
													totalAmount         	: a.totalAmount.toFixed(2),
													earnedPoints 			: a.earnedPoints.toFixed(2),
													earnedPointsValue 	: (a.earnedPoints * creditPointValue).toFixed(2),
													typeOfTransaction 	: a.typeOfTransaction,
													status               : a.status
												}
											}																				
										}))
									:
										[],
			}
			if (returnData.transactions && returnData.transactions.length > 0) {
				returnData.transactions = await returnData.transactions.sort(function(a,b){  
				  return new Date(b.transactionDate) - new Date(a.transactionDate);
				});
				res.status(200).json(returnData);
			}else{
				res.status(200).json(returnData);
			}
		}else{			
			res.status(200).json("You haven't earned any credit points yet");
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});   
}

