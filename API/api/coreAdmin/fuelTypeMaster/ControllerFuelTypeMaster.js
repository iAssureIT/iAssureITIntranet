const mongoose	        = require("mongoose");
const FuelTypeMaster     = require('./ModelFuelTypeMaster.js');


exports.insertFuelType = (req,res,next)=>{
    
    processData();
    async function processData(){
    var allFuelTypes = await fetchFuelTypes();
    var fuelType = allFuelTypes.filter((data)=>{
        if (data.fuelType.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (fuelType.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const fuelTypeMaster = new FuelTypeMaster({
                                _id                         : new mongoose.Types.ObjectId(),
                                fuelType                    : req.body.fieldValue,
                                createdBy                   : req.body.createdBy,
                                createdAt                   : new Date()
                            })
                            fuelTypeMaster.save()
                            .then(data=>{
                                res.status(200).json({ created : true, fieldID : data._id });
                            })
                            .catch(err =>{
                                res.status(500).json({ error: err }); 
                            });
        } 
    }                   
};
var fetchFuelTypes = async ()=>{
    return new Promise(function(resolve,reject){ 
    FuelTypeMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countFuelTypes = (req, res, next)=>{
    FuelTypeMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchFuelTypes = (req, res, next)=>{
    FuelTypeMaster.find({})
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
exports.getFuelTypes = (req, res, next)=>{
    FuelTypeMaster.find({})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleFuelType = (req, res, next)=>{
    FuelTypeMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchFuelType = (req, res, next)=>{
    FuelTypeMaster.find({ fuelType: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateFuelType = (req, res, next)=>{
    FuelTypeMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'fuelType'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                FuelTypeMaster.updateOne(
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
exports.deleteFuelType = (req, res, next)=>{
    FuelTypeMaster.deleteOne({_id: req.params.fieldID})
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



