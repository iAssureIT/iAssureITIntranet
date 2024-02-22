const mongoose	        = require("mongoose");
const EntityMapping          = require('./ModelEntityMapping.js');
var   ObjectId          = require('mongodb').ObjectId;


exports.insertEntityMapping = (req,res,next)=>{
    EntityMapping.find({"corporateId" : req.body.corporateId, "corporateLocationId" : req.body.corporateLocationId})
    .then((data)=>{
        if(data && data.length > 0){
            res.status(200).json({ duplicate : true });
        }else{
            const entities = new EntityMapping({
                _id                         : new mongoose.Types.ObjectId(),
                corporateId                 : req.body.corporateId,
                corporateLocationId         : req.body.corporateLocationId,
                vendor                      : req.body.vendor,
                createdBy                   : req.body.createdBy,
                createdAt                   : new Date()
            })
            entities.save()
            .then(data=>{
                res.status(200).json({ created : true, mappingID : data._id });
            })
            .catch(err =>{
                res.status(500).json({ error: err }); 
            });
        }
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};
exports.countEntityMappings = (req, res, next)=>{
    EntityMapping.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchEntityMappings = (req, res, next)=>{
    EntityMapping.find({})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.getEntityMappings = (req, res, next)=>{
    EntityMapping.aggregate([
        {
           $lookup: {
              from: "entitymasters",
              localField: "vendor.vendorID",    
              foreignField: "_id",  
              as: "vendor"
           }
        },
        {
           $lookup: {
              from: "entitymasters",
              localField: "corporateId",   
              foreignField: "_id",  
              as: "corporate"
           }
        },
        {
           $unwind:"$corporate"
        },
     ])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.joinentities = (req, res, next)=>{
    EntityMapping.aggregate([
        { "$match" : {_id: ObjectId(req.params.mappingID)}},
        {
           $lookup: {
              from: "entitymasters",
              localField: "vendor.vendorID",    
              foreignField: "_id",  
              as: "vendor"
           }
        },
        {
           $lookup: {
              from: "entitymasters",
              localField: "corporateId",   
              foreignField: "_id",  
              as: "corporate"
           }
        },
        {
           $unwind:"$corporate"
        },
     ])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.joinentitieslist = (req, res, next)=>{
    EntityMapping.aggregate([
        {
            $lookup: {
               from: "entitymasters",
               localField: "vendor.vendorID",    
               foreignField: "_id",  
               as: "vendor"
            }
         },
         {
            $lookup: {
               from: "entitymasters",
               localField: "corporateId",   
               foreignField: "_id",  
               as: "corporate"
            }
         },
         {
            $unwind:"$corporate"
         },
     ])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleEntityMapping = (req, res, next)=>{
    EntityMapping.findOne({ _id: req.params.mappingID })
        .exec()
        .then(data=>{
            res.status(200).json( data );
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.updateEntityMapping = (req,res,next)=>{
    var extras = req.body.contactDetails;
    
    EntityMapping.updateOne(
            { "_id":req.body.mappingID},  
            {
                $set:   { 
                    'corporateId'                 : req.body.corporateId,
                    'corporateLocationId'         : req.body.corporateLocationId,
                    'vendor'                      : req.body.vendor,
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                EntityMapping.updateOne(
                { _id:req.body.mappingID},
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
            res.status(500).json({ error: err });
        });
};
exports.deleteEntityMapping = (req, res, next)=>{
    EntityMapping.deleteOne({_id: req.params.mappingID})
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


exports.filterEntityMapping = (req, res, next)=>{

    var selector = {};
    
    // console.log(req.body)
    for (var key in req.body) {

        if (key=='corporateIds' && req.body.corporateIds.length > 0 ) {
            var corporateIds = [];
            // covert array of ids into object ids
            for(var subkey in req.body.corporateIds){
                corporateIds.push(ObjectId(req.body.corporateIds[subkey])) 
            }
            selector.corporateId =  { $in: corporateIds } 
        }
        if (key=='vendorIds' && req.body.vendorIds.length > 0 ) {
            var vendorIds = [];
            // covert array of ids into object ids
            for(var subkey in req.body.vendorIds){
                vendorIds.push(ObjectId(req.body.vendorIds[subkey])) 
            }
            // selector.vendor={};
            selector['vendor._id'] =  { $in: vendorIds } 
        }
        if (key=='stateCodes' && req.body.stateCodes.length > 0 ) {
            selector['$or']=[];
            selector['$or'].push({ "corporate.locations.stateCode" :  { $in: req.body.stateCodes } });
            selector['$or'].push({ "vendor.locations.stateCode" :  { $in: req.body.stateCodes } });
        }
        if (key=='districts' && req.body.districts.length > 0 ) {
            selector['$or']=[];
            selector['$or'].push({ "corporate.locations.district" :  { $in: req.body.districts } });
            selector['$or'].push({ "vendor.locations.district" :  { $in: req.body.districts } });
        }
        // console.log('selector',selector);
    }
    // console.log(selector)
    EntityMapping.aggregate([
        {
            $lookup: {
               from: "entitymasters",
               localField: "vendor.vendorID",    
               foreignField: "_id",  
               as: "vendor"
            }
         },
         {
            $lookup: {
               from: "entitymasters",
               localField: "corporateId",   
               foreignField: "_id",  
               as: "corporate"
            }
         },
         {
            $unwind:"$corporate"
         },
        {
            $match : selector
        }
     ])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchEntityMapping = (req, res, next)=>{
    var selector = {}; 
    selector['$or']=[];
    selector["$or"].push({ "corporate.companyName"    : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ "vendor.companyName"       : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ "corporate.groupName"    : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ "vendor.groupName"    : { $regex : req.params.str, $options: "i"} })
    
    // console.log(selector)
    EntityMapping.aggregate([
        {
            $lookup: {
               from: "entitymasters",
               localField: "vendor.vendorID",    
               foreignField: "_id",  
               as: "vendor"
            }
         },
         {
            $lookup: {
               from: "entitymasters",
               localField: "corporateId",   
               foreignField: "_id",  
               as: "corporate"
            }
         },
         {
            $unwind:"$corporate"
         },
        {
            $match : selector
        }
     ])
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
