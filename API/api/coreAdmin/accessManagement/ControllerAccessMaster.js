const mongoose	= require("mongoose");

const AccessMaster = require('./ModelAccessMaster');
var request = require('request-promise');
const gloabalVariable = require('../../../nodemonConfig.js');
var   ObjectId          = require('mongodb').ObjectID;

exports.insertAccess = (req,res,next)=>{
    // console.log(req.body) 
    var accessData = req.body;
    AccessMaster.deleteMany({})
        .exec()
        .then(data=>{
        for(var k = 0 ; k < accessData.length ; k++){
            const access = new AccessMaster({
                        _id                     : new mongoose.Types.ObjectId(),
                        role                    : accessData[k].role,
                        module                  : accessData[k].module,
                        createdBy               : req.body.createdBy,
                        createdAt               : new Date()
                    })
                    access.save()
                    .then(data=>{
                        //res.status(200).json({ created : true });
                    })
                    .catch(err =>{
                        res.status(500).json({ error: err }); 
                    });
        }
    })
    .catch(err =>{
        res.status(500).json({ error: err }); 
    });    
    res.status(200).json({
        "completed": true
    });
};
exports.getAccess = (req,res,next)=>{
    AccessMaster.find({})
        .exec() 
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.getRolewiseAccess = (req,res,next)=>{
    // console.log(req.body)
    AccessMaster.find({ "role" : {$in : req.body} })
        .exec() 
        .then(data=>{
            // console.log(data)
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};


exports.getRolewiseAccessToModule = (req,res,next)=>{
    // console.log(req.body)
    AccessMaster.find({ "role" : {$in : req.body.roles}, "module.module" : req.body.module })
        .exec() 
        .then(data=>{
            // console.log(data)
            data.length>0 ? res.status(200).json({access:true}):res.status(200).json({access:false});
        })
        .catch(err =>{
            // console.log(err.response)
            res.status(500).json({ error: err });
        }); 
};



exports.getAccessToFacilityOfModule = (req,res,next)=>{
    
    var selector = { "role" : {$in : req.body.roles}, 
                        "module.module" : req.body.module, "module.facility" : req.body.facility }
    // console.log(selector)                    
    AccessMaster.find(selector)
        .exec() 
        .then(data=>{
            // console.log(data)
            data.length>0 ? res.status(200).json({access:true}):res.status(200).json({access:false});
        })
        .catch(err =>{
            // console.log(err.response)
            res.status(500).json({ error: err });
        }); 
};