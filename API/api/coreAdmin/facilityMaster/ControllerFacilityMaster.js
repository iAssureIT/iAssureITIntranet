const mongoose          = require("mongoose");
const FacilityMaster       = require('./ModelFacilityMaster.js');


exports.insertFacility = (req,res,next)=>{
    processData();
    async function processData(){
    var allFacilities = await fetchFacilities();
    var facility = allFacilities.filter((data)=>{
        if ( data.moduleId == req.body.dropdownID && data.facility.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (facility.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const facilityMaster = new FacilityMaster({
                                _id                         : new mongoose.Types.ObjectId(),
                                moduleId                    : req.body.dropdownID,
                                facility                    : req.body.fieldValue,
                                createdBy                   : req.body.createdBy,
                                createdAt                   : new Date()
                            })
                            facilityMaster.save()
                            .then(data=>{
                                res.status(200).json({ created : true, fieldID : data._id });
                            })
                            .catch(err =>{
                                res.status(500).json({ error: err }); 
                            });
        }
    }                   
};
var fetchFacilities = async ()=>{
    return new Promise(function(resolve,reject){ 
    FacilityMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countFacilities = (req, res, next)=>{
    FacilityMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchFacilities = (req, res, next)=>{
    FacilityMaster.aggregate([
    {
    $lookup:
        {
           from: "modulemasters",
           localField: "moduleId",
           foreignField: "_id",
           as: "module"
        }
    },
    { "$unwind": "$module" },{$addFields: { moduleName : "$module.moduleName"} }])
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            // console.log(data)

            var alldata = data.map((a, i)=>{
                    // console.log("a ",a);
                    return {
                        "_id"                 : a._id,
                        "moduleName"          : a.moduleName,
                        "facility"            : a.facility,
                        "moduleId"            : a.moduleId  
                    }
            })
            res.status(200).json(alldata);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.getFacilities = (req, res, next)=>{
    FacilityMaster.find({})
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleFacility = (req, res, next)=>{
    FacilityMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchFacility = (req, res, next)=>{
    FacilityMaster.aggregate([
    {
    $lookup:
        {
           from: "modulemaster",
           localField: "moduleId",
           foreignField: "_id",
           as: "module"
        }
    },
    { "$unwind": "$module" },
    { $addFields: { moduleName : "$module.moduleName"} },
    { $match : { model: { $regex : req.params.str ,$options: "i" } } }

    ])
    //FacilityMaster.find({ model: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateFacility = (req, res, next)=>{
    FacilityMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {   'moduleId'                    : req.body.dropdownID,
                            'facility'                    : req.body.fieldValue
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                FacilityMaster.updateOne(
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
            // console.log(err);
            res.status(500).json({ error: err });
        });
};
exports.deleteFacility = (req, res, next)=>{
    FacilityMaster.deleteOne({_id: req.params.fieldID})
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

