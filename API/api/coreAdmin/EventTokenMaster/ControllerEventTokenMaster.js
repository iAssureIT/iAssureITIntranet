const mongoose  = require("mongoose");
var moment      = require('moment');

const EventTokenMaster = require('./ModelEventTokenMaster.js');

exports.insertEventToken = (req,res,next)=>{
    processData();
    async function processData(){
        var getData = await fetchData(req.body.event)
        var event = getData.filter((data)=>{
        if (data.event == req.body.event) {
            return data;
        }
        })
        if(event.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const eventToken = new EventTokenMaster({
                _id             : new mongoose.Types.ObjectId(),
                event     : req.body.event,
                templateName : req.body.templateName,
                tokens : req.body.tokens,
                createdBy       : req.body.createdBy,
                createdAt       : new Date(),
            })
            eventToken.save()
            .then(data=>{
                res.status(200).json({ created : true, id : data._id });
            })
            .catch(err =>{
                res.status(500).json({ error: err }); 
            });
        }
    } 
    
};

var fetchData = async ()=>{
    return new Promise(function(resolve,reject){ 
    EventTokenMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.getAllEventToken = (req,res,next)=>{
    EventTokenMaster.find({})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });

}

exports.getSingleEventToken = (req,res,next)=>{
    EventTokenMaster.findOne({"_id":req.params.id})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
}

exports.getTokensByEvent = (req,res,next)=>{
    EventTokenMaster.findOne({"event":req.params.event})
        .exec()
        .then(data=>{
            res.status(200).json(data.tokens);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
}

exports.updateEventToken = (req,res,next)=>{
    EventTokenMaster.updateOne(

        { "_id" : req.body.id},
        {
            $set:{
                "templateName"    : req.body.templateName,
                "tokens"    : req.body.tokens
            }
        }
        )
        .exec()
        .then(data=>{
            // console.log("in Update Expense type data = ", data);
            if(data.nModified == 1){
                EventTokenMaster.updateOne(
                { _id:req.body.id},
                {
                    $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                updatedBy      : req.body.updatedBy 
                                            }] 
                            }
                } )
                .exec()
                .then(data=>{
                    res.status(200).json({ updated : true });
                })
            }else{
                res.status(404).json("Data Not found");
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
}
exports.deleteEventToken = (req, res, next)=>{
    EventTokenMaster.deleteOne({_id: req.params.id})
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

