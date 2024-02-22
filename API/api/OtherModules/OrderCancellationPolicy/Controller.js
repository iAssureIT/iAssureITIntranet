const mongoose	                = require("mongoose");
var ObjectId                    = require('mongodb').ObjectID;
const OrderCancellationPolicy   = require('./Model');

exports.insert_order_cancel_policy = (req, res, next) => {
    // console.log("Store Preferences => ",req.body);
	OrderCancellationPolicy.findOne()
    .exec()
    .then(data =>{
        // console.log("data => ",data);
        if(data && data !== null){
            // console.log("if => ") 
        //   console.log("data:",data);
            OrderCancellationPolicy.updateOne(
                { _id : ObjectId(data._id)},  
                {
                    $set:{
                        "maxDurationForCancelOrder"     : req.body.maxDurationForCancelOrder,
                        "orderCancellationCharges"      : req.body.orderCancellationCharges
                    }
                }
            )
            .exec()
            .then(data=>{
                res.status(200).json({
                    "message": "Order Cancellation Policy Updated Successfully."
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
            const orderCancellationPolicy = new OrderCancellationPolicy({
                "_id"                           : mongoose.Types.ObjectId(),      
                "maxDurationForCancelOrder"     : req.body.maxDurationForCancelOrder,
                "orderCancellationCharges"      : req.body.orderCancellationCharges,
                "createdAt"                     : new Date()
            });            
            orderCancellationPolicy.save()
            .then(orderCancellationPolicy=>{
                res.status(200).json({
                    "message"   : "Order Cancellation Policy Saved Successfully.",
                    "data"      : orderCancellationPolicy
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

exports.get_order_cancel_policy = (req, res, next) => {
    OrderCancellationPolicy.find()
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

