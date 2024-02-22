const mongoose	                = require("mongoose");
const ReturnReasons             = require('./Model.js');

/**=========== Insert Reasons of Return ===========*/
exports.insertReasonsOfReturn = (req,res,next)=>{
	processData();
	async function processData(){
		var allReasons          = await fetchAllReasonsOfReturn();
		var reasonsofreturn     = allReasons.filter((data)=>{
			if (data.reasonOfReturn.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
				return data;
			}
		})    

		if (reasonsofreturn.length > 0) {
			res.status(200).json({ 
				duplicated : true 
			});
		}else{
			const returnReasons = new ReturnReasons({
				_id               : new mongoose.Types.ObjectId(),
				reasonOfReturn    : req.body.fieldValue,
				createdBy         : req.body.createdBy,
				createdAt         : new Date()
			})
			returnReasons.save()
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
var fetchAllReasonsOfReturn = async ()=>{
	return new Promise(function(resolve,reject){ 
		ReturnReasons.find({})
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
		ReturnReasons.find({})
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
exports.countUnitOfMeasurment = (req, res, next)=>{
	ReturnReasons.find({}).count()
		.exec()
		.then(data=>{
			res.status(200).json({ count : data });
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
}; 

/**=========== List Reasons of Return with limits ===========*/
exports.fetchReasonsOfReturn = (req, res, next)=>{
	// console.log("req.body => ",req.body)
	ReturnReasons.find({})
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
exports.getAllReasonsOfReturn = (req, res, next)=>{
	ReturnReasons.find({})
		.sort({createdAt : -1})
		.exec()
		.then(data=>{
		   res.status(200).json(data);
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
};

exports.fetchSingleUnitOfMeasurment = (req, res, next)=>{
	ReturnReasons.findOne({ _id: req.params.fieldID })
		.exec()
		.then(data=>{
			res.status(200).json(data);
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
};

exports.searchUnitOfMeasurment = (req, res, next)=>{
	ReturnReasons.find({ department : { $regex : req.params.str ,$options: "i" }  })
		.exec()
		.then(data=>{
			res.status(200).json(data);
		})
		.catch(err =>{
			res.status(500).json({ error: err });
		}); 
};

exports.updateReasonsOfReturn = (req, res, next)=>{
	ReturnReasons.updateOne(
		{ _id:req.body.fieldID },  
		{
			$set:   {  'reasonOfReturn'       : req.body.fieldValue  }
		}
	)
	.exec()
	.then(data=>{
		if(data.nModified == 1){
			ReturnReasons.updateOne(
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
			res.status(200).json({ updated : true });
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({ error: err });
	});
};

exports.deleteReasonsOfReturn = (req, res, next)=>{
	ReturnReasons.deleteOne({_id: req.params.fieldID})
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
		const returnReasons = new ReturnReasons({
						_id                         : new mongoose.Types.ObjectId(),
						department                  : department,
						createdBy                   : createdBy,
						createdAt                   : new Date()
					})
					returnReasons.save()
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
	ReturnReasons.find()
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
	ReturnReasons.remove({})
	  .exec()
	  .then(data => {
		res.status(200).json({
		  "message": "All Units Deleted Successfully."
		});
	  })
	  .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	  });
  };
  


