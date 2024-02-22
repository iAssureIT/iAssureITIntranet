const mongoose	        = require("mongoose");
const PackageMaster     = require('./ModelPackageMaster.js');


exports.insertPackage = (req,res,next)=>{
    PackageMaster.findOne({"packageTypeId" : req.body.packageTypeId, "packageName" : req.body.packageName})
    .then(data=>{
        if(data){
            res.status(200).json({ duplicate : true });
        }else{
            const packageMaster = new PackageMaster({
                _id                         : new mongoose.Types.ObjectId(),
                packageTypeId               : req.body.packageTypeId,
                packageName                 : req.body.packageName,
                fixCharges                  : req.body.fixCharges, 
                maxHours                    : req.body.maxHours, 
                maxKm                       : req.body.maxKm,                
                way                         : req.body.way,
                cityTypeId                  : req.body.cityTypeId,
                categoryId                  : req.body.categoryId,
                extraHr                     : req.body.extraHr,
                extraKms                    : req.body.extraKms,
                driverAllow                 : req.body.driverAllow,
                nightHalt                   : req.body.nightHalt,
                nightCharges                : req.body.nightCharges,
                morningCharges              : req.body.morningCharges,
                createdBy                   : req.body.createdBy,
                createdAt                   : new Date()
            })
            packageMaster.save()
            .then(data=>{
                res.status(200).json({ created : true, packageId : data._id });
            })
            .catch(err =>{
                res.status(500).json({ error: err }); 
            });
        }
    })
    .catch(err=>{
        res.status(500).json({ error: err }); 
    })
};

exports.countPackages = (req, res, next)=>{
    PackageMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchPackages = (req, res, next)=>{
    PackageMaster.aggregate([{
        $lookup:
            {
               from: "packagetypemasters",
               localField: "packageTypeId",
               foreignField: "_id",
               as: "packageType"
            }
        },{ "$unwind": "$packageType" },{$addFields: { packageType : "$packageType.packageType"} }])
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
exports.fetchListPackages = (req, res, next)=>{
    PackageMaster.find({})
        .sort({packageName : 1})
        .exec()
        .then(data=>{
            console.log(res.data);
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSinglePackage = (req, res, next)=>{
    PackageMaster.findOne({ _id: req.params.packageID })
        .exec()
        .then(data=>{
            res.status(200).json( data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.updatePackage = (req, res, next)=>{
    PackageMaster.findOne({"packageTypeId" : req.body.packageTypeId, "packageName" : req.body.packageName, _id: { $ne: req.body.packageID }})
    .then(data=>{
        if(data){
            res.status(200).json({ duplicate : true });
        }else{
            PackageMaster.updateOne(
                { _id:req.body.packageID},  
                {
                    $set:   {   'packageTypeId'               : req.body.packageTypeId,  
                                'packageName'                 : req.body.packageName,
                                'fixCharges'                  : req.body.fixCharges, 
                                'maxHours'                    : req.body.maxHours, 
                                'maxKm'                       : req.body.maxKm
                            }
                }
            )
            .exec()
            .then(data=>{
                if(data.nModified == 1){
                    PackageMaster.updateOne(
                    { _id:req.body.packageID},
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
                    res.status(200).json({ updated : false });
                }
            })
            .catch(err =>{
                res.status(500).json({ error: err });
            });
        }
    })
    .catch(err=>{
        res.status(500).json({ error: err }); 
    })
};
exports.deletePackage = (req, res, next)=>{
    PackageMaster.deleteOne({_id: req.params.packageID})
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



