const mongoose	        = require("mongoose");
const MappingMaster     = require('./ModelMappingMaster.js');
var   ObjectID          = require('mongodb').ObjectID;

exports.insertMapping = (req,res,next)=>{
    const mappings = new MappingMaster({
                    _id                         : new mongoose.Types.ObjectId(),
                    designation_id              : req.body.designation_id,
                    designation                 : req.body.designation,
                    vehCatg                     : req.body.vehCatg,
                    createdBy                   : req.body.createdBy,
                    createdAt                   : new Date()
                })
                mappings.save()
                .then(data=>{
                    res.status(200).json({ created : true, mappingID : data._id });
                })
                .catch(err =>{
                    res.status(500).json({ error: err }); 
                });
};
exports.countMappings = (req, res, next)=>{
    MappingMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
