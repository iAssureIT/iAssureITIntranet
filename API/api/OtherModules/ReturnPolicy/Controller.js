const mongoose	     = require("mongoose");
var ObjectId         = require('mongodb').ObjectID;
const ReturnPolicy   = require('./Model');

exports.insert_return_product_policy = (req, res, next) => {
    // console.log("Store Preferences => ",req.body);
	ReturnPolicy.findOne()
    .exec()
    .then(data =>{
        // console.log("data => ",data);
        if(data && data !== null){
            // console.log("if => ") 
        //   console.log("data:",data);
            ReturnPolicy.updateOne(
                { _id : ObjectId(data._id)},  
                {
                    $set:{
                        "maxDaysToReturn"     : req.body.maxDaysToReturn
                    }
                }
            )
            .exec()
            .then(data=>{
                res.status(200).json({
                    "message": "Return Product Policy Updated Successfully."
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
            const returnPolicy = new ReturnPolicy({
                "_id"                 : mongoose.Types.ObjectId(),      
                "maxDaysToReturn"     : req.body.maxDaysToReturn,
                "createdAt"           : new Date()
            });            
            returnPolicy.save()
            .then(returnPolicyData=>{
                res.status(200).json({
                    "message"   : "Return Product Policy Saved Successfully.",
                    "data"      : returnPolicyData
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

exports.get_return_product_policy = (req, res, next) => {
    ReturnPolicy.findOne()
    .exec()
    .then(data=>{
        // console.log("data => ",data);
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });   
}

