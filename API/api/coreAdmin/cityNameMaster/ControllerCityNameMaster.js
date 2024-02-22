const mongoose          = require("mongoose");
const CityNameMaster       = require('./ModelCityNameMaster.js');
const CityTypeMaster       = require('../cityType/ModelCityType.js');
const FailedRecords     = require('../failedRecords/ModelFailedRecords');

exports.insertCityName = (req,res,next)=>{
    processData();
    async function processData(){
    var allcityName = await fetchCityNameMaster();

    var cityName = allcityName.filter((data)=>{
        if ( data.cityTypeId == req.body.dropdownID && data.cityName.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (cityName.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const cityNameMaster = new CityNameMaster({
                                _id                             : new mongoose.Types.ObjectId(),
                                cityTypeId                      : req.body.dropdownID,
                                cityName                        : req.body.fieldValue,
                                createdBy                       : req.body.createdBy,
                                createdAt                       : new Date()
                            })
                            cityNameMaster.save()
                            .then(data=>{
                                res.status(200).json({ created : true, fieldID : data._id });
                            })
                            .catch(err =>{
                                res.status(500).json({ error: err }); 
                            });
        }
    }          
};
function insertCityName(cityTypeId, createdBy){
    return new Promise(function(resolve,reject){ 
        const cityNameMaster = new CityNameMaster({
                         _id                        : new mongoose.Types.ObjectId(),
                        cityTypeId                  : cityTypeId,
                        createdBy                   : createdBy,
                        createdAt                   : new Date()
                    })
                    cityNameMaster.save()
                    .then(data=>{
                        resolve( data._id );
                    })
                    .catch(err =>{
                        reject(err); 
                    });
    });
}

var fetchCityNameMaster = async (req,res,next)=>{
    return new Promise(function(resolve,reject){ 
    CityNameMaster.aggregate([
    {
    $lookup:
        {
           from: "citytypemasters",
           localField: "cityTypeId",
           foreignField: "_id",
           as: "cityType"
        }
    },
    { "$unwind": "$cityType" },{$addFields: { cityType : "$cityType.cityType"} }])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    // console.log("a ",a);
                    return {
                        "_id"                : a._id,
                        "cityType"       : a.cityType,
                        "cityName"           : a.cityName,
                        "cityTypeId"         : a.cityTypeId  
                    }
            })
            resolve( data )
        })
        .catch(err =>{
             reject(err);
        }); 
    });
};

exports.countCityNames = (req, res, next)=>{
    CityNameMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchCityNameMaster = (req, res, next)=>{
    CityNameMaster.aggregate([
    {
    $lookup:
        {
           from: "citytypemasters",
           localField: "cityTypeId",
           foreignField: "_id",
           as: "cityType"
        }
    },
    { "$unwind": "$cityType" },{$addFields: { cityType : "$cityType.cityType"} }])
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    // console.log("a ",a);
                    return {
                        "_id"                : a._id,
                        "cityType"       : a.cityType,
                        "cityName"           : a.cityName,
                        "cityTypeId"         : a.cityTypeId
                    }
            })
            res.status(200).json(alldata);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.getCityName = (req, res, next)=>{
    CityNameMaster.find({})
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleCityName = (req, res, next)=>{
    CityNameMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchCityName= (req, res, next)=>{
    CityNameMaster.aggregate([
    {
    $lookup:
        {
           from: "cityTypeMaster",
           localField: "cityTypeId",
           foreignField: "_id",
           as: "cityType"
        }
    },
    { "$unwind": "$cityType" },
    { $addFields: { cityType : "$cityType.cityType"} },
    { $match : { cityName: { $regex : req.params.str ,$options: "i" } } }

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
exports.updateCityName = (req, res, next)=>{
    CityNameMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {   'cityTypeId'                     : req.body.dropdownID,
                            'cityName'                       : req.body.fieldValue
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                CityNameMaster.updateOne(
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
exports.deleteCityName = (req, res, next)=>{
    CityNameMaster.deleteOne({_id: req.params.fieldID})
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

var fetchAllCityNames = async (type)=>{
    return new Promise(function(resolve,reject){ 
    CityNameMaster.find()
        .sort({createdAt : -1})
        // .skip(req.body.startRange)
        // .limit(req.body.limitRange)
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        });
    });
};
var fetchCityType = async ()=>{
    return new Promise(function(resolve,reject){ 
    CityTypeMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.bulkUploadVehicleModel = (req, res, next)=>{
    var models = req.body.data;
    // var models = [{brandId:"mesh", model:"kkk"}];
    console.log("models",models);
    
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
        var allmodels=await fetchAllModels(); 
        var brands = await fetchBrands();
        console.log("brands...",brands);
        for(var k = 0 ; k < models.length ; k++){
            if (models[k].brandId== '-') {
                remark += "brandId not found, " ;  
            }
            if (models[k].model == '-') {
                remark += "model not found, " ;  
            }

              if (remark == '') {
              var brandId;
               var brandExists = brands.filter((data)=>{
                console.log("brandExists",brandExists);
                    if (data.brand == models[k].brandId) {
                        return data;
                    }
                })
               if (brandExists.length>0) {
                    brandId = brandExists[0]._id;
                }else{
                    brandId = await insertModel(models[k].brandName);
                    //departmentId = departmentExists[0]._id;
                }
             var modelExists = allmodels.filter((data)=>{
                    if (data.model== models[k].model) {
                        return data;
                    }
                })
              if (modelExists.length==0) {

                    validObjects = models[k];
                    // validObjects.brandId        = brandId;
                    validObjects.fileName       = req.body.fileName;
                    validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt      = new Date();

                    validData.push(validObjects);  

              }else{

                    remark += "Model already exists." ; 

                    invalidObjects = models[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects); 
              }
            }

        }
        //console.log("validData",validData);
        CityNameMaster.insertMany(validData)
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
    CityNameMaster.find( { _id : "fileName"})
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
    console.log(req.params.fileName)
    CityNameMaster.find( { fileName:req.params.fileName  }
    )
    .exec()
    .then(data=>{
        //finaldata.push({goodrecords: data})
        finaldata.goodrecords = data;
        FailedRecords.find({fileName:req.params.fileName})  
            .exec()
            .then(badData=>{
                finaldata.failedRecords = badData[0].failedRecords
                finaldata.totalRecords = badData[0].totalRecords
                res.status(200).json(finaldata);
            })
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};





