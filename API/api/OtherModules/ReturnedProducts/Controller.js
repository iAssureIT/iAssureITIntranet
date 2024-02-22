const mongoose	= require("mongoose");

const ReturnedProducts = require('./Model');
const moment                = require('moment-timezone');

exports.get_returned_products = (req,res,next)=>{
    ReturnedProducts.aggregate([{ $lookup:
      {
         from: 'products',
         localField: 'product_ID',
         foreignField: '_id',
         as: 'productsArray'
       } 
      },
      {
        $sort: {
          "productsArray.createdAt": -1
        }
      }
    ])
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({error: err});
    });
};

exports.returnStatusUpdate = (req,res,next)=>{
    ReturnedProducts.updateOne({ _id: req.body.id},  
                        {
                            $push:  { 'returnStatus' : {status : req.body.status, date: new Date()} }
                        })
    .exec()
    .then(data=>{
        res.status(200).json({"message":req.body.status+" Successfully!"});
    })
    .catch(err =>{
        res.status(500).json({error: err});
    });
};

exports.returnPickeupInitiated = (req,res,next)=>{
    ReturnedProducts.updateOne({ _id: req.body.id}, 
                        { $push:  { 'returnStatus' : {status : "Return Pickup Initiated", date: new Date()} } ,    
                          $set : { pickedupBy : req.body.pickupby } 
                        })
    .exec()
    .then(data=>{
        res.status(200).json({"message":"Return Initiated Successfully!"});
    })
    .catch(err =>{
        res.status(500).json({error: err});
    });
};

exports.returnedCount = (req,res,next)=>{
    ReturnedProducts.find({}).count()
    .exec()
    .then(data=>{
        res.status(200).json({ "dataCount": data });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.PendingCount = (req,res,next)=>{
    ReturnedProducts.aggregate([
    { "$match": { "returnStatus.status" :  "Return Approval Pending" }
    },
    { "$redact":
        {
            "$cond": {
               "if": { "$eq": [ { "$arrayElemAt": [ "$returnStatus.status", -1 ] }, "Return Approval Pending" ] },
               "then": "$$KEEP",
               "else": "$$PRUNE"
            }
        }
    },
    {
      $count: "count"
    }
    ])     
        .exec()
        .then(data=>{
          if (data.length==0) {
            res.status(200).json({ "dataCount": 0 });
          }else{
            res.status(200).json({ "dataCount": data[0].count });
          }
          
          
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};