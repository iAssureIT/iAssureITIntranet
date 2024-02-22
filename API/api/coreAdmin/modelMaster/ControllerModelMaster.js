const mongoose	        = require("mongoose");
const ModelMaster       = require('./ModelMasterModel.js');
const BrandMaster       = require('../brandMaster/ModelBrandMaster.js');
const FailedRecords     = require('../failedRecords/ModelFailedRecords');


exports.insertModel = (req,res,next)=>{
    // console.log("insertModel req.body = ",req.body);
    const modelMaster = new ModelMaster({
                        _id                         : new mongoose.Types.ObjectId(),                        
                        brandId                     : req.body.dropdownID,
                        model                       : req.body.fieldValue,
                        createdBy                   : req.body.createdBy,
                        createdAt                   : new Date()
                    })

    modelMaster
        .save()
        .then(data=>{
            res.status(200).json({ created : true, fieldID : data._id });
        })
        .catch(err =>{
            res.status(500).json({ error: err }); 
        });
};

function insertModel(brandId, createdBy){
    return new Promise(function(resolve,reject){ 
        const modelMaster = new ModelMaster({
                         _id                        : new mongoose.Types.ObjectId(),
                        brandId                     : brandId,
                        createdBy                   : createdBy,
                        createdAt                   : new Date()
                    })
                    modelMaster.save()
                    .then(data=>{
                        resolve( data._id );
                    })
                    .catch(err =>{
                        reject(err); 
                    });
    });
}

var fetchModels = async (req,res,next)=>{
    return new Promise(function(resolve,reject){ 
      ModelMaster.aggregate([
    {
    $lookup:
        {
           from: "brandmasters",
           localField: "brandId",
           foreignField: "_id",
           as: "brand"
        }
    },
    { "$unwind": "$brand" },{$addFields: { brandName : "$brand.brand"} }])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    // console.log("a ",a);
                    return {
                        "_id"                : a._id,
                        "brandName"          : a.brandName,
                        "model"              : a.model,
                        "brandId"            : a.brandId  
                    }
            })
            resolve( data )
        })
        .catch(err =>{
             reject(err);
        }); 
    });
};

exports.countModels = (req, res, next)=>{
    ModelMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchModels = (req, res, next)=>{

    // console.log("fetchModels req.body = ",req.body);

    ModelMaster
        .aggregate([{
            $lookup:
                {
                   from: "brandmasters",
                   localField: "brandId",
                   foreignField: "_id",
                   as: "brand"
                }
            },
            { "$unwind": "$brand" },
            {$addFields: { brandName : "$brand.brand"} 
        }])
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    return {
                        "_id"                : a._id,
                        "brandName"          : a.brandName,
                        "model"              : a.model,
                        "brandId"            : a.brandId  
                    }
            })
            // console.log("alldata = ",alldata);
            res.status(200).json(alldata);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.getModels = (req, res, next)=>{
    ModelMaster.find({})
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleModel = (req, res, next)=>{
    ModelMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchModel = (req, res, next)=>{
    ModelMaster.aggregate([
    {
    $lookup:
        {
           from: "brandmasters",
           localField: "brandId",
           foreignField: "_id",
           as: "brand"
        }
    },
    { "$unwind": "$brand" },
    { $addFields: { brandName : "$brand.brand"} },
    { $match : { model: { $regex : req.params.str ,$options: "i" } } }

    ])
    //ModelMaster.find({ model: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateModel = (req, res, next)=>{
    ModelMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {   'brandId'                     : req.body.dropdownID,
                            'model'                       : req.body.fieldValue
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                ModelMaster.updateOne(
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
exports.deleteModel = (req, res, next)=>{
    ModelMaster.deleteOne({_id: req.params.fieldID})
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
var fetchBrands = async ()=>{
    return new Promise(function(resolve,reject){ 
    BrandMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
function insertBrand(brand, createdBy){
    // console.log('brand',brand);
    return new Promise(function(resolve,reject){ 
        const brandMaster = new BrandMaster({
            _id                         : new mongoose.Types.ObjectId(),
            brand                       : brand,
            createdBy                   : createdBy,
            createdAt                   : new Date()
        })
        brandMaster.save()
        .then(data=>{
            resolve( data._id );
        })
        .catch(err =>{
            reject(err); 
        });
    });
}
function fetchBrandName (brandId){
    // console.log('brandId',brandId);
    return new Promise(function(resolve,reject){ 
        BrandMaster.findOne({ _id: brandId })
            .exec()
            .then(data=>{
                resolve( data.brand );
            })
            .catch(err =>{
                reject(err); 
            }); 
    });
};
exports.bulkUploadVehicleModel = (req, res, next)=>{
    var models = req.body.data;
    // var models = [{brandId:"mesh", model:"kkk"}];
    
    var validData = [];
    var validObjects = [];
    var invalidData = [];
    var invalidObjects = [];
    var remark = ''; 
    var failedRecords = [];
    var Count = 0;
    var DuplicateCount = 0;
    processData();
    async function processData(){
        var allmodels=await fetchModels(); 
        var brands = await fetchBrands();
        for(var k = 0 ; k < models.length ; k++){
            if (models[k].brand== '-') {
                remark += "brandId not found, " ;  
            }
            if (models[k].model == '-') {
                remark += "model not found, " ;  
            }

              if (remark == '') {
               var brandId;
               var brandExists = brands.filter((data)=>{
                    if (data.brand == models[k].brand) {
                        return data;
                    }
                })
                // console.log("brandExists",brandExists);
                if (brandExists.length>0) {
                    brandId = brandExists[0]._id;
                }else{
                    brandId = await insertBrand(models[k].brand, req.body.createdBy);
                }
                var modelExists = allmodels.filter((data)=>{
                    if (data.model== models[k].model && data.brandName== models[k].brand) {
                        return data;
                    }
                })

                if (modelExists.length==0) {
                    validObjects = models[k];
                    // console.log('validObjects=====',validObjects);
                    // console.log('models[k]=====',models[k]);
                    validObjects.brandId          = brandId;
                    validObjects.model          = models[k].model;
                    validObjects.fileName       = req.body.fileName;
                    validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt      = new Date();

                    validData.push(validObjects);  
                    // console.log('validDataaa',validData);

                }else{
                    remark += "Model already exists." ; 

                    invalidObjects = models[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects); 
                }
            }

        }
        // console.log("validData",validData);
        ModelMaster.insertMany(validData)
        .then(data=>{
            
        })
        .catch(err =>{
            console.log(err);
        });

        failedRecords.FailedRecords = invalidData;
        failedRecords.fileName = req.body.fileName;
        failedRecords.totalRecords = req.body.totalRecords;

        await insertFailedRecords(failedRecords,req.body.updateBadData);
        
        res.status(200).json({
            "message": "Bulk upload process is completed successfully!",
            "completed": true
        });
    }
};
var insertFailedRecords = async (invalidData,updateBadData) => {
     //console.log('invalidData',invalidData);
    return new Promise(function(resolve,reject){ 
    FailedRecords.find({fileName:invalidData.fileName})  
            .exec()
            .then(data=>{
            if(data.length>0){
                //console.log('data',data[0].failedRecords.length)   
                if (data[0].failedRecords.length>0) {
                    if (updateBadData) {
                        FailedRecords.updateOne({ fileName:invalidData.fileName},  
                        {   $set:   { 'failedRecords': [] } })
                        .then(data=>{
                        if(data.nModified == 1){
                            FailedRecords.updateOne({ fileName:invalidData.fileName},  
                                {   $set:   {'totalRecords': invalidData.totalRecords},
                                    $push:  { 'failedRecords' : invalidData.FailedRecords } 
                                })
                            .then(data=>{
                                if(data.nModified == 1){
                                    resolve(data);
                                }else{
                                    resolve(data);
                                }
                            })
                            .catch(err =>{ reject(err); });
                        }else{
                            resolve(0);
                        }
                        })
                        .catch(err =>{ reject(err); });
                    }else{
                        FailedRecords.updateOne({ fileName:invalidData.fileName},  
                                {   $set:   {'totalRecords': invalidData.totalRecords},
                                    $push:  { 'failedRecords' : invalidData.FailedRecords } 
                                })
                            .then(data=>{
                                if(data.nModified == 1){
                                    resolve(data);
                                }else{
                                    resolve(data);
                                }
                            })
                            .catch(err =>{ reject(err); });
                    }

                }else{
                    FailedRecords.updateOne({ fileName:invalidData.fileName},  
                        {   $set:   {'totalRecords': invalidData.totalRecords},
                            $push:  { 'failedRecords' : invalidData.FailedRecords } 
                        })
                    .then(data=>{
                        if(data.nModified == 1){
                            resolve(data);
                        }else{
                            resolve(data);
                        }
                    })
                    .catch(err =>{ reject(err); });
                }
            }else{
                    const failedRecords = new FailedRecords({
                    _id                     : new mongoose.Types.ObjectId(),                    
                    failedRecords           : invalidData.FailedRecords,
                    fileName                : invalidData.fileName,
                    totalRecords            : invalidData.totalRecords,
                    createdAt               : new Date()
                    });
                    
                    failedRecords
                    .save()
                    .then(data=>{
                        resolve(data._id);
                    })
                    .catch(err =>{
                        console.log(err);
                        reject(err);
                    });
            }
            })  
    })            
}

exports.fetch_file = (req,res,next)=>{ 
    ModelMaster.find( { _id : "fileName"})
    .exec()
    .then(data=>{
        res.status(200).json(data.length);
        //res.status(200).json(data);
        })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });   
};
exports.filedetails = (req,res,next)=>{
    var finaldata = {};
    // console.log(req.params.fileName)
    ModelMaster.aggregate([
    {
        $lookup:
        {
           from: "brandmasters",
           localField: "brandId",
           foreignField: "_id",
           as: "brand"
        }
    },
    { "$unwind": "$brand" },
    { $addFields: { brandName : "$brand.brand"} },
    ])
    .exec()
    .then(data=>{
        //finaldata.push({goodrecords: data})
        finaldata.goodrecords = data;
        // console.log('data',data);
        FailedRecords.find({fileName:req.params.fileName})  
            .exec()
            .then(badData=>{
                finaldata.failedRecords = badData[0].failedRecords
                finaldata.totalRecords = badData[0].totalRecords
                res.status(200).json(finaldata);
                // console.log('finaldata',finaldata);
            })
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};





