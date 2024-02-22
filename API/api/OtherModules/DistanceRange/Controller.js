const mongoose             = require("mongoose");
const _                    = require("underscore");
const DistanceRange        = require('./Model');

exports.insert_distance_range = (req,res,next)=>{
    // console.log("body insert_distance_range => ",req.body);
    DistanceRange.find()
    .exec()
    .then(data =>{
        if(data && data.length > 0){
            // console.log("=====> 1")
            res.status(200).json({
                "message" : "Distance Range Already Exists.",
            });
        }else{
            // console.log("=====> 2")
            const distanceRange = new DistanceRange({
                _id          : new mongoose.Types.ObjectId(), 
                distance     : req.body.fieldValue,
                createdBy    : req.body.createdBy,
                createdAt    : new Date()
            });
            distanceRange.save()
            .then(data=>{
                res.status(200).json({
                    "message"   : "Distance Submitted Successfully.",
                    "created"   : true,
                    "_id"       : data._id
                });
            })
            .catch(err =>{
                console.log("err0 => ",err);
                res.status(500).json({
                    error: err
                });
            });
        }
    })
    .catch(err =>{
        console.log("err1 => ",err);
        res.status(500).json({
            error: err
        });
    });
};

/**=========== update_distance_range =========== */
exports.update_distance_range = (req,res,next)=>{
    
    DistanceRange.updateOne(
        { _id  : req.body.distanceRangeID},  
        { $set : {
                    distance  : req.body.distance
                }
        },
        { $push : {
            updateLog : {
                            updatedBy : req.body.user_ID,
                            updatedAt : new Date()
                        }
            }
        }
    )
    .exec()
    .then(data=>{
        if(data.nModified === 1){
            res.status(200).json({
                "message"       : "Distance Range Updated Successfully.",
                "_id"           : data._id
            });
        }else{
            res.status(500).json({
                "message": "Product Not Found"
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

/**=========== get_distance_range =========== */
exports.get_distance_range = (req, res, next)=>{
    // console.log("req.body => ",req.body);
    DistanceRange.find({})
    .sort({createdAt : -1})
    .skip(req.body.startRange)
    .limit(req.body.limitRange)
    .exec()
    .then(data=>{
        // console.log("data => ",data);
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};

/**=========== get_single_distance_range =========== */
exports.get_single_distance_range = (req, res, next)=>{
    DistanceRange.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

/**=========== get_single_distance_range =========== */
exports.update_distance_range = (req, res, next)=>{
    DistanceRange.updateOne(
        { _id:req.body.fieldID },  
        {
            $set:   {  'distance' : req.body.fieldValue  }
        }
    )
    .exec()
    .then(data=>{
        // console.log("data => ",data)
        if(data.nModified == 1){
            DistanceRange.updateOne(
            { _id:req.body.fieldID},
            {
                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                            updatedBy      : req.body.updatedBy 
                                        }] 
                        }
            })
            .exec()
            .then(updatedata=>{
                console.log("updatedata => ",updatedata)
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

/**=========== delete_distance_range =========== */
exports.delete_distance_range = (req, res, next)=>{
    DistanceRange.deleteOne({_id: req.params.fieldID})
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