const mongoose	                = require("mongoose");
const OrderRejectReasons        = require('./Model.js');

/**=========== Insert Reasons of Return ===========*/
exports.insertOrderRejectReasons = (req,res,next)=>{
	processData();
	async function processData(){
		var allReasons         	= await fetchAllOrderRejectReasons();
		var orderrejectreasons  = allReasons.filter((data)=>{
			if (data.reasonOfOrderReject.trim().toLowerCase() === req.body.fieldValue.trim().toLowerCase()) {
				return data;
			}
		})    

		if (orderrejectreasons.length > 0) {
			res.status(200).json({ 
				duplicated : true 
			});
		}else{
			const orderRejectReasons = new OrderRejectReasons({
				_id               	: new mongoose.Types.ObjectId(),
				reasonOfOrderReject : req.body.fieldValue,
				createdBy         	: req.body.createdBy,
				createdAt         	: new Date()
			})
			orderRejectReasons.save()
			.then(data=>{
				res.status(200).json({ created : true, fieldID : data._id });
			})
			.catch(err =>{
				res.status(500).json({ error: err }); 
			});
		}
	}             
};

/**=========== Fetch all Reasons of Return ===========*/
var fetchAllOrderRejectReasons = async ()=>{
	return new Promise(function(resolve,reject){ 
		OrderRejectReasons.find({})
		.then(data=>{
			resolve( data );
		})
		.catch(err =>{
			reject(err);
		}); 
	});
};

/**=========== List all Reasons of Return ===========*/
var fetchUnitOfMeasurment = async ()=>{
	return new Promise(function(resolve,reject){ 
		OrderRejectReasons.find({})
		.exec()
		.then(data=>{
			resolve( data );
		})
		.catch(err =>{
			reject(err);
		}); 
	});
};

/**=========== Count Reasons of Return ===========*/
exports.countOrderRejectReasons = (req, res, next)=>{
	OrderRejectReasons.find({}).count()
		.exec()
		.then(data=>{
			res.status(200).json({ count : data });
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
}; 

/**=========== List Reasons of Return with limits ===========*/
exports.fetchOrderRejectReasons = (req, res, next)=>{
	// console.log("req.body => ",req.body)
	OrderRejectReasons.find({})
	.sort({createdAt : -1})
	.skip(req.body.startRange)
	.limit(req.body.limitRange)
	.exec()
	.then(data=>{
		// console.log("data => ", data)
		res.status(200).json(data);
	})
	.catch(err =>{
		res.status(500).json({ error: err });
	}); 
};

/**=========== Insert Reasons of Return ===========*/
exports.getAllOrderRejectReasons = (req, res, next)=>{
	OrderRejectReasons.find({})
		.sort({createdAt : -1})
		.exec()
		.then(data=>{
		   res.status(200).json(data);
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
};

exports.fetchSingleOrderRejectReason = (req, res, next)=>{
	OrderRejectReasons.findOne({ _id: req.params.fieldID })
		.exec()
		.then(data=>{
			res.status(200).json(data);
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
};

exports.searchOrderRejectReasons = (req, res, next)=>{
	OrderRejectReasons.find({ department : { $regex : req.params.str ,$options: "i" }  })
		.exec()
		.then(data=>{
			res.status(200).json(data);
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
};

exports.updateOrderRejectReasons = (req, res, next)=>{
	OrderRejectReasons.updateOne(
		{ _id:req.body.fieldID },  
		{
			$set:   {  'reasonOfOrderReject'       : req.body.fieldValue  }
		}
	)
	.exec()
	.then(data=>{
		if(data.nModified == 1){
			OrderRejectReasons.updateOne(
			{ _id:req.body.fieldID},
			{
				$push:  { 'updateLog' : [{  updatedAt      : new Date(),
											updatedBy      : req.body.updatedBy 
										}] 
						}
			})
			.exec()
			.then(data=>{
				res.status(200).json({ updated : true });
			})
		}else{
			res.status(200).json({ updated : false });
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({ error: err });
	});
};

exports.deleteOrderRejectReasons = (req, res, next)=>{
	OrderRejectReasons.deleteOne({_id: req.params.fieldID})
		.exec()
		.then(data=>{
			if(data.deletedCount === 1){
				res.status(200).json({ deleted : true });
			}else{
				res.status(200).json({ deleted : false });
			}
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		});            
};

function insertUnitOfMeasurment(department, createdBy){
	return new Promise(function(resolve,reject){ 
		const orderRejectReasons = new OrderRejectReasons({
						_id                         : new mongoose.Types.ObjectId(),
						department                  : department,
						createdBy                   : createdBy,
						createdAt                   : new Date()
					})
					orderRejectReasons.save()
					.then(data=>{
						resolve( data._id );
					})
					.catch(err =>{
						reject(err); 
					});
	});
}

var fetchAllUnitOfMeasurment = async (type)=>{
	return new Promise(function(resolve,reject){ 
	OrderRejectReasons.find()
		.sort({createdAt : -1})
		// .skip(req.body.startRange)
		// .limit(req.body.limitRange)
		.then(data=>{
			resolve( data );
		})
		.catch(err =>{
			reject(err);
		});
	});
}; 

exports.deleteAllReasons = (req, res, next) => {
	// console.log("called");
	OrderRejectReasons.remove({})
	  .exec()
	  .then(data => {
		res.status(200).json({
		  "message": "All Reasons Deleted Successfully."
		});
	  })
	  .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	  });
  };
  


