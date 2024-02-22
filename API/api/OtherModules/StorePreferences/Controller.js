const mongoose	        = require("mongoose");
var ObjectId            = require('mongodb').ObjectID;
const StorePreference   = require('./Model');

exports.insert_preferences = (req, res, next) => {
    // console.log("Store Preferences => ",req.body);
	StorePreference.findOne()
    .exec()
    .then(data =>{
        // console.log("data => ",data);
        if(data && data !== null){
            // console.log("if => ") 
        //   console.log("data:",data);
            StorePreference.updateOne(
                { _id : ObjectId(data._id)},  
                {
                    $set:{
                        "maxRadius"                 : req.body.maxRadius,
                        "minOrderValue"             : req.body.minOrderValue,
                        "maxServiceCharges"         : req.body.maxServiceCharges,
                        "maxNumberOfVendors"        : req.body.maxNumberOfVendors,
                        "serviseChargesByDistance"  : req.body.serviseChargesByDistance
                    }
                }
            )
            .exec()
            .then(data=>{
                res.status(200).json({
                    "message": "Order Delivery Policy Updated Successfully."
                });
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        }else{    
            // console.log("else => ",req.body)            
            const storePreference = new StorePreference({
                "_id"                       : mongoose.Types.ObjectId(),      
                "maxRadius"                 : req.body.maxRadius,
                "minOrderValue"             : req.body.minOrderValue,
                "maxServiceCharges"         : req.body.maxServiceCharges,
                "maxNumberOfVendors"        : req.body.maxNumberOfVendors,
                "serviseChargesByDistance"  : req.body.serviseChargesByDistance,
                "createdAt"                 : new Date()
            });            
            storePreference.save()
            .then(storePreference=>{
                res.status(200).json({
                    "message"   : "Order Delivery Policy Saved Successfully.",
                    "data"      : storePreference
                });
            })
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.get_preferences = (req, res, next) => {
    StorePreference.find()
    .exec()
    .then(data=>{
        //console.log("=============data found===========",data);
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });   
}

