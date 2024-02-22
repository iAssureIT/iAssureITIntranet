const mongoose	        = require("mongoose");
const LocationTypeMaster     = require('./ModelLocationTypeMaster.js');


exports.insertLocationType = (req,res,next)=>{
    processData();
    async function processData(){
    var allLocationTypes = await fetchLocationTypes();

    var locationType = allLocationTypes.filter((data)=>{
        if (data.locationType.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase() && data.companyID == req.body.companyID) {
            return data;
        }
        })
        if (locationType.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const locationTypeMaster = new LocationTypeMaster({
                            _id                         : new mongoose.Types.ObjectId(),
                            companyID                   : req.body.companyID,
                            locationType                : req.body.fieldValue,
                            createdBy                   : req.body.createdBy,
                            createdAt                   : new Date()
                        })
                        locationTypeMaster.save()
                        .then(data=>{
                            res.status(200).json({ created : true, fieldID : data._id });
                        })
                        .catch(err =>{
                            res.status(500).json({ error: err }); 
                        });
        }
    }
};
var fetchLocationTypes = async ()=>{
    return new Promise(function(resolve,reject){ 
    LocationTypeMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countLocationTypes = (req, res, next)=>{
    LocationTypeMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchLocationTypes = (req, res, next)=>{
    LocationTypeMaster.find({})
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
exports.getLocationTypes = (req, res, next)=>{
    LocationTypeMaster.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};
exports.fetchSingleLocationType = (req, res, next)=>{
    LocationTypeMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchLocationType = (req, res, next)=>{
    LocationTypeMaster.find({ locationType: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateLocationType = (req, res, next)=>{
    LocationTypeMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'locationType'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                LocationTypeMaster.updateOne(
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
exports.deleteLocationType = (req, res, next)=>{
    LocationTypeMaster.deleteOne({_id: req.params.fieldID})
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



