const mongoose	        = require("mongoose");
const PackageTypeMaster     = require('./ModelPackageTypeMaster.js');


exports.insertPackageType = (req,res,next)=>{
    PackageTypeMaster.findOne({  "packageType" :  {$regex : req.body.fieldValue ,$options: "i"} })
        .exec()
        .then(data=>{
            if (data) {
                res.status(200).json({ duplicated : true });
            }else{

            const packageTypeMaster = new PackageTypeMaster({
                            _id                         : new mongoose.Types.ObjectId(),
                            packageType                 : req.body.fieldValue,
                            createdBy                   : req.body.createdBy,
                            createdAt                   : new Date()
                        })
                        packageTypeMaster.save()
                        .then(data=>{
                            res.status(200).json({ created : true, fieldID : data._id });
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

exports.countPackageTypes = (req, res, next)=>{
    PackageTypeMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchPackageTypes = (req, res, next)=>{
    PackageTypeMaster.find({})
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
exports.getPackageTypes = (req, res, next)=>{
    PackageTypeMaster.find({})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSinglePackageType = (req, res, next)=>{
    PackageTypeMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchPackageType = (req, res, next)=>{
    PackageTypeMaster.find({ packageType: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updatePackageType = (req, res, next)=>{
    PackageTypeMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'packageType'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                PackageTypeMaster.updateOne(
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
exports.deletePackageType = (req, res, next)=>{
    PackageTypeMaster.deleteOne({_id: req.params.fieldID})
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



