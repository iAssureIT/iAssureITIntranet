const mongoose	        = require("mongoose");
const EventMapping      = require('./ModelEventMapping.js');
var   ObjectId          = require('mongodb').ObjectId;


exports.insertEventMapping = (req,res,next)=>{
    EventMapping.findOne({event:req.body.event,role:req.body.role,templateName:req.body.templateName,status:"active"})
    .exec()
    .then((data)=>{
        if(data){
                return res.status(200).json({
                    message: 'Duplicate Entry'
                });
        }else{
            const entities = new EventMapping({
                    _id                         : new mongoose.Types.ObjectId(),
                    event                   : req.body.event,
                    role                    : req.body.role,
                    templateName                  : req.body.templateName,
                    mode                  : req.body.mode,
                    mapDate                     : new Date(),
                    status                      : req.body.status,
                    createdBy                   : req.body.createdBy,
                    createdAt                   : new Date(),
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
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    
};

exports.fetchEventMappings = (req, res, next)=>{
    EventMapping.find({})
        .sort({createdAt : -1})
        .skip(parseInt(req.body.startRange))
        .limit(parseInt(req.body.limitRange))
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.updateEventMapping = (req,res,next)=>{    
    EventMapping.updateOne(
            { "_id":req.body.mappingID},  
            {
                $set:   { 
                    'unmapDate'                 :  new Date(),
                    'status'                    :  req.body.status,
                },
                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                            updatedBy      : req.body.updatedBy 
                                        }] ,
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({ updated : true });
            }else{
                res.status(200).json({ updated : false });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });
};