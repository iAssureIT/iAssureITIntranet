const mongoose                  = require("mongoose");
const BusinessSubCategoryMaster = require('./Model.js');
const BusinessCategoryMaster    = require('../masterBusinessCategory/Model.js');
// const FailedRecords             = require('../failedRecords/ModelFailedRecords');

exports.insertBusinessSubCategory = (req,res,next)=>{
    BusinessCategory.find({_id : req.body.dropdownID})
                    .then(catgData=>{
                        if(catgData && catgData.length>0){
                            //Need to Update the Category document with expertise
                            // console.log("catgData => ",catgData);
                            var subCatg1  = catgData[0].businessSubCatg;
                            var subCatg2  = req.body.fieldValue.split(",");

                            if(SubCatg1){
                                var newSubCatg   = SubCatg1.concat(SubCatg2) ;
                            }else{
                                var newSubCatg   = SubCatg2 ;
                            }

                            BusinessCategory.updateOne(
                                {_id : catgData[0]._id },
                                {$set : {
                                            businessExpertise : newExpertise
                                        }
                                }
                            )
                            .then(updateCatg => {
                                // console.log("updateCatg => ", updateCatg);
                                res.status(200).json({
                                    created : true,
                                    data : updateCatg,
                                    message : "Expertise Updated Successfully!"
                                })
                            })
                            .catch(error =>{
                                console.log("3 insertCatgExpertise update error => ",error);
                                res.status(500).json({
                                                        message: "Error occured while updating category", 
                                                        error: error
                                                    })
                            })
                        }else{
                            //Need to Insert category and Expertise
                            const businessCategory = new BusinessCategory({
                                _id                         : new mongoose.Types.ObjectId(),
                                businessCategory            : req.body.fieldValue,
                                businessExpertise           : req.body.businessExpertise,
                                createdBy                   : req.body.createdBy,
                                createdAt                   : new Date()
                            });

                            businessCategory.save()
                            .then(data=>{
                                res.status(200).json({ created : true, data : data });
                            })
                            .catch(error=>{
                                console.log("1 insertCatgExpertise insert error => ",error);
                                res.status(500).json({
                                                        message: "Error occured while inserting category", 
                                                        error: error
                                                    })
                            })
                        }
                    })
                    .catch(error=>{
                        console.log("2 insertCatgExpertise find error => ",error);
                        res.status(500).json({
                                                message: "Error occured while finding category", 
                                                error: error
                                            })
                    })


};



function insertBusinessSubCategory(businessCategoryId, createdBy){
    return new Promise(function(resolve,reject){ 
        const businessSubCategoryMaster = new BusinessSubCategoryMaster({
                         _id                        : new mongoose.Types.ObjectId(),
                        businessCategoryId          : businessCategoryId,
                        createdBy                   : createdBy,
                        createdAt                   : new Date()
                    })
                    businessSubCategoryMaster.save()
                    .then(data=>{
                        resolve( data._id );
                    })
                    .catch(err =>{
                        reject(err); 
                    });
    });
}

var fetchBusinessSubCategoryMaster = async (req,res,next)=>{
    return new Promise(function(resolve,reject){ 
    BusinessSubCategoryMaster.aggregate([
    {
    $lookup:
        {
           from: "businesssubcategorymasters",
           localField: "businessCategoryId",
           foreignField: "_id",
           as: "businessCategory"
        }
    },
    { "$unwind": "$businessCategory" },{$addFields: { businessCategory : "$businessCategory.businessCategory"} }])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    // console.log("a ",a);
                    return {
                        "_id"                   : a._id,
                        "businessCategory"      : a.businessCategory,
                        "businessSubCategory"   : a.businessSubCategory,
                        "businessCategoryId"    : a.businessCategoryId  
                    }
            })
            resolve( data )
        })
        .catch(err =>{
             reject(err);
        }); 
    });
};

exports.countBusinessSubCategorys = (req, res, next)=>{
    BusinessSubCategoryMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchBusinessSubCategoryMaster = (req, res, next)=>{
    BusinessSubCategoryMaster.aggregate([
    {
    $lookup:
        {
           from         : "businesscategorymasters",
           localField   : "businessCategoryId",
           foreignField : "_id",
           as           : "businessCategory"
        }
    },
    { "$unwind": "$businessCategory" },{$addFields: { businessCategory : "$businessCategory.businessCategory"} }])
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    // console.log("a ",a);
                    return {
                        "_id"                   : a._id,
                        "businessCategory"      : a.businessCategory,
                        "businessSubCategory"   : a.businessSubCategory,
                        "businessCategoryId"    : a.businessCategoryId
                    }
            })

            // console.log("fetchBusinessSubCategoryMaster alldata => ",alldata);

            res.status(200).json(alldata);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.getBusinessSubCategory = (req, res, next)=>{
    var category_id = req.params.category_id;

    console.log("category_id => ", category_id);


    BusinessSubCategoryMaster.find({businessCategoryId : category_id})
                .sort({createdAt : -1})
                .exec()
                .then(data=>{
                    // console.log("getBusinessSubCategory data => ", data);
                    res.status(200).json(data);
                })
                .catch(err =>{
                    console.log("getBusinessSubCategory err => ", err);                    
                    res.status(500).json({ error: err });
                }); 
};
exports.fetchSingleBusinessSubCategory = (req, res, next)=>{
    BusinessSubCategoryMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchBusinessSubCategory= (req, res, next)=>{
    BusinessSubCategoryMaster.aggregate([
    {
    $lookup:
        {
           from: "businessCategoryMaster",
           localField: "businessCategoryId",
           foreignField: "_id",
           as: "businessCategory"
        }
    },
    { "$unwind": "$businessCategory" },
    { $addFields: { businessCategory : "$businessCategory.businessCategory"} },
    { $match : { businessSubCategory: { $regex : req.params.str ,$options: "i" } } }

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
exports.updateBusinessSubCategory = (req, res, next)=>{
    BusinessSubCategoryMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {   'businessCategoryId'                     : req.body.dropdownID,
                            'businessSubCategory'                       : req.body.fieldValue
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                BusinessSubCategoryMaster.updateOne(
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
exports.deleteBusinessSubCategory = (req, res, next)=>{
    BusinessSubCategoryMaster.deleteOne({_id: req.params.fieldID})
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

var fetchAllBusinessSubCategorys = async (type)=>{
    return new Promise(function(resolve,reject){ 
    BusinessSubCategoryMaster.find()
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
var fetchBusinessCategory = async ()=>{
    return new Promise(function(resolve,reject){ 
    BusinessCategoryMaster.find({})
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
    // console.log("models",models);
    
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
        // console.log("brands...",brands);
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
                // console.log("brandExists",brandExists);
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
        BusinessSubCategoryMaster.insertMany(validData)
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
    BusinessSubCategoryMaster.find( { _id : "fileName"})
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
    BusinessSubCategoryMaster.find( { fileName:req.params.fileName  }
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





