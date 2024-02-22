const mongoose	= require("mongoose");

const VendorCategory = require('../vendorCategory/Model');

exports.insert_vendor_category = (req,res,next)=>{
	VendorCategory.find()
		.exec()
		.then(data =>{
			const vendorsCategory = new VendorCategory({
                _id                       : new mongoose.Types.ObjectId(),                    
                categoryName              : req.body.categoryName,
                createdAt                 : new Date()
            });
            vendorsCategory.save()
            .then(data=>{
                res.status(200).json({
                    "message": "Vendor Category Submitted Successfully.",
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
exports.update_vendor_category = (req,res,next)=>{
    VendorCategory.updateOne(
            { _id:req.body.vendorCategoryID},  
            {
                $set:{
                    categoryName              : req.body.categoryName,
                    createdAt                 : new Date()
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Vendor Category Updated Successfully."
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
exports.list_vendor_category = (req,res,next)=>{
    VendorCategory.find()       
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
exports.list_vendor_category_with_limits = (req,res,next)=>{
    VendorCategory.find()
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
exports.count_vendor_category = (req,res,next)=>{
    VendorCategory.find({}).count()
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
exports.fetch_vendor_category = (req,res,next)=>{
    VendorCategory.findOne({_id : req.params.vendorCategoryID})
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
exports.delete_vendor_category = (req,res,next)=>{
    VendorCategory.deleteOne({_id:req.params.vendorCategoryID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Vendor Category Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};