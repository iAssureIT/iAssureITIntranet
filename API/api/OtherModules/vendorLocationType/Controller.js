const mongoose	= require("mongoose");

const VendorLocationType = require('./Model');

exports.insert_vendor_location = (req,res,next)=>{
    // console.log('inser');
	VendorLocationType.find()
		.exec()
		.then(data =>{
			const vendorsLocation = new VendorLocationType({
                _id                       : new mongoose.Types.ObjectId(),                    
                locationType              : req.body.locationType,
                createdAt                 : new Date()
            });
            vendorsLocation.save()
            .then(data=>{
                res.status(200).json({
                    "message": "Vendor Location Type Submitted Successfully.",
                });
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.update_vendor_location = (req,res,next)=>{
    VendorLocationType.updateOne(
            { _id:req.body.vendorCategoryID},  
            {
                $set:{
                    locationType              : req.body.locationType,
                    createdAt                 : new Date()
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Vendor Location Type Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Vendor Not Found"
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
exports.list_vendor_location = (req,res,next)=>{
    VendorLocationType.find()       
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
exports.list_vendor_location_with_limits = (req,res,next)=>{
    VendorLocationType.find()
    .exec()
    .then(data=>{
        res.status(200).json(data.slice(req.body.startRange, req.body.limitRange));
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.count_vendor_location = (req,res,next)=>{
    VendorLocationType.find({})
    .exec()
    .then(data=>{
        res.status(200).json({"dataCount":data});
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.fetch_vendor_location = (req,res,next)=>{
    VendorLocationType.findOne({_id : req.params.vendorCategoryID})
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
exports.delete_vendor_location = (req,res,next)=>{
    VendorLocationType.deleteOne({_id:req.params.vendorCategoryID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Vendor Location Type Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};