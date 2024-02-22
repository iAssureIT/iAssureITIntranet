const mongoose	                = require("mongoose");
var ObjectId                    = require('mongodb').ObjectID;
const CreditPointsPolicy              = require('./Model');

/*=========== Add Credit Points Policy ===========*/
exports.insert_credit_points_policy = (req, res, next) => {
	CreditPointsPolicy.findOne()
	.exec()
	.then(data =>{
		if(data && data !== null){
			CreditPointsPolicy.updateOne(
				{ _id : ObjectId(data._id)},  
				{
					$set:{
						"purchaseAmount"        : req.body.purchaseAmount,
						"creditPoint"           : req.body.creditPoint,
						"creditPointValue"      : req.body.creditPointValue,
						"expiryLimitInDays"     : req.body.expiryLimitInDays
					}
				}
			)
			.exec()
			.then(data=>{
				res.status(200).json({
					"message": "Credit Point Policy Updated Successfully."
				});
			})
			.catch(err =>{
				console.log("Failed to Update Credit Point Policy");
				res.status(500).json({
					error: err
				});
			});
		}else{    
			const creditPointsPolicy = new CreditPointsPolicy({
				"_id"                   : mongoose.Types.ObjectId(),      
				"purchaseAmount"        : req.body.purchaseAmount,
				"creditPoint"           : req.body.creditPoint,
				"creditPointValue"      : req.body.creditPointValue,
				"expiryLimitInDays"     : req.body.expiryLimitInDays,
				"createdAt"             : new Date()
			});            
			creditPointsPolicy.save()
			.then(creditPointsPolicyData=>{
				res.status(200).json({
					"message"   : "Credit Point Policy Saved Successfully.",
					"data"      : creditPointsPolicyData
				});
			})
			.catch(err =>{
				console.log("Failed to Save Credit Point Policy");				
				res.status(500).json({
					error: err
				});
			});
		}
	})
	.catch(err =>{
		console.log("Failed to Find Credit Point Policy");				
		res.status(500).json({
			error: err
		});
	});
};

/*=========== Get credit points policy data ===========*/
exports.get_credit_points_policy = (req, res, next) => {
	CreditPointsPolicy.find()
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
}

