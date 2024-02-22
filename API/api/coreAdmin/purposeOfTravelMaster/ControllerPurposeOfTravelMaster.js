const mongoose	        = require("mongoose");
const PurposeOfTravelMaster     = require('./ModelPurposeOfTravelMaster.js');


exports.insertPurposeOfTravel = (req,res,next)=>{
    
    processData();
    async function processData(){
    var allPurposeOfTravel = await fetchPurposeOfTravel();
    var PurposeType = allPurposeOfTravel.filter((data)=>{
        if (data.purposeType.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (PurposeType.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const purposeOfTravelMaster = new PurposeOfTravelMaster({
                                _id                         : new mongoose.Types.ObjectId(),
                                purposeType                    : req.body.fieldValue,
                                createdBy                   : req.body.createdBy,
                                createdAt                   : new Date()
                            })
                            purposeOfTravelMaster.save()
                            .then(data=>{
                                res.status(200).json({ created : true, fieldID : data._id });
                            })
                            .catch(err =>{
                                res.status(500).json({ error: err }); 
                            });
        } 
    }                   
};
var fetchPurposeOfTravel = async ()=>{
    return new Promise(function(resolve,reject){ 
    PurposeOfTravelMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countPurposeOfTravel = (req, res, next)=>{
    PurposeOfTravelMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.allPurposeOfTravel = (req, res, next)=>{
    PurposeOfTravelMaster.find({})
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
exports.getPurposeOfTravel = (req, res, next)=>{
    PurposeOfTravelMaster.find({})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSinglePurposeOfTravel = (req, res, next)=>{
    // console.log('req.params.fieldID: ',req.params.fieldID)
    PurposeOfTravelMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchPurposeOfTravel = (req, res, next)=>{
    PurposeOfTravelMaster.find({ purposeType: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updatePurposeOfTravel = (req, res, next)=>{
    PurposeOfTravelMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'purposeType'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                PurposeOfTravelMaster.updateOne(
                { _id:req.body.fieldID},
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
            console.log(err);
            res.status(500).json({ error: err });
        });
};
exports.deletePurposeOfTravel = (req, res, next)=>{
    PurposeOfTravelMaster.deleteOne({_id: req.params.fieldID})
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



