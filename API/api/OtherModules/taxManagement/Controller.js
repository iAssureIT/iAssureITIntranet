const mongoose	   = require("mongoose");
const Preference   = require('../taxManagement/Model');


exports.create_preference = (req, res, next) => {
	Preference.findOne()
		.exec()
		.then(data =>{
			if(data){
				return res.status(200).json({
					message: 'You can submit only one tax name.'
				});
			}else{
            const preference = new Preference({
                _id             : new mongoose.Types.ObjectId(),      
                taxName         : req.body.taxName
            });
            
            preference.save(
                function(err){
                    if(err){
                        return  res.status(500).json({
                            error: err
                        });          
                    }else{
                        res.status(200).json({ 
                            message: 'Tax name submitted successfully.',
                            data: preference
                        });
                    }
                }
            );
        }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.list_preference = (req, res, next)=>{
    Preference.find()
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
}
exports.get_preference = (req, res, next)=>{
    Preference.find()
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
exports.count_preference = (req, res, next)=>{
    Preference.find().count()
    .exec()
    .then(data=>{
        res.status(200).json({"dataCount": data});
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });         
}
exports.one_preference = (req, res, next)=>{
    Preference.findOne({_id : req.params.preferenceID})
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
exports.one_rate_preference = (req, res, next)=>{
    // console.log("Tax Data body = ", req.body);
    // console.log("Tax Data params = ", req.params);
    Preference.findOne({"taxDetails._id" : req.params.preferenceID})
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
exports.update_preference = (req,res,next)=>{
    Preference.findOne({taxName     : req.body.taxName,  _id: { $ne: req.body.preferenceID } })
		.exec()
		.then(data =>{
			if(data){
				return res.status(200).json({
					message: 'Tax Name is already exists'
				});
			}else{
                Preference.updateOne(
                    { _id:req.body.preferenceID},  
                    {
                        $set:{
                            taxName         : req.body.taxName,
                            createdAt       : new Date()
                        }
                    }
                )
                .exec()
                .then(data=>{
                    res.status(200).json({
                        "message": "Tax name updated successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
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
exports.submit_rate_preference = (req,res,next)=>{
    Preference.findOne({taxName     : req.body.taxName,  _id: { $ne: req.body.preferenceID } })
		.exec()
		.then(data =>{
			if(data){
				return res.status(200).json({
					message: 'Tax is already exists'
				});
			}else{
                Preference.updateOne(
                    { _id:req.body.preferenceID},  
                    {
                        $push:{
                            taxDetails : req.body.taxDetails
                        }
                    }
                )
                .exec()
                .then(data=>{
                    res.status(200).json({
                        "message": "Tax rate submitted successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
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
exports.update_rate_preference = (req,res,next)=>{
    // console.log("Id = ", req.body);
    Preference.updateOne(
        { "_id":req.body.preferenceID, "taxDetails._id" : req.body.taxRateID},  
        {
            $set:{
                "taxDetails.$.taxRate"          : req.body.taxRate,
                "taxDetails.$.effectiveFrom"    : req.body.effectiveFrom,
                "taxDetails.$.effectiveTo"      : req.body.effectiveTo,
            }
        }
    )
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Tax rate updated successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });     
};
exports.delete_preference = (req,res,next)=>{
    Preference.deleteOne({_id:req.params.preferenceID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Tax name  deleted successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.delete_rate_preference = (req,res,next)=>{
    Preference.updateOne(
        { "_id":req.params.preferenceID},  
		{
			$pull: { "taxDetails": { "_id": req.params.taxRateID } }
		}
    )
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Tax rate deleted successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });     
};