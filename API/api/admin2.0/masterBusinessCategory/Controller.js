const mongoose          = require("mongoose");
const BusinessCategory  = require('./Model.js');

exports.insertBusinessCategory = (req,res,next)=>{
    processData();
    async function processData(){
        var allBusinessCategory = await fetchBusinessCategory();
        var businessCategory = allBusinessCategory.filter((data)=>{
        if (data.businessCategory.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (businessCategory.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const businessCategory = new BusinessCategory({
                            _id                         : new mongoose.Types.ObjectId(),
                            businessCategory            : req.body.fieldValue,
                            expertise                   : req.body.expertise,
                            createdBy                   : req.body.createdBy,
                            createdAt                   : new Date()
                        })
                        businessCategory.save()
                        .then(data=>{
                            res.status(200).json({ created : true, fieldID : data._id });
                        })
                        .catch(err =>{
                            console.log("err",err.code)
                            if (err.code == 11000) {
                                res.status(200).json({ duplicated : true });
                            }else{
                                res.status(500).json({ error: err });
                            }
                             
                        });
        }
    }       
};
var fetchBusinessCategory = async ()=>{
    return new Promise(function(resolve,reject){ 
    BusinessCategory.find({})
        .sort({businessCategory : 1})
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countBusinessCategory = (req, res, next)=>{
    BusinessCategory.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchBusinessCategory = (req, res, next)=>{
    BusinessCategory.find({})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            // console.log("data",data)
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.getBusinessCategory = (req, res, next)=>{
    BusinessCategory.find({})
        .sort({businessCategory : 1})
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleBusinessCategory = (req, res, next)=>{
    BusinessCategory.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchBusinessCategory = (req, res, next)=>{
    BusinessCategory.find({ businessCategory: { $regex : req.params.str ,$options: "i" }  })
        .sort({businessCategory : 1})
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateBusinessCategory = (req, res, next)=>{
    BusinessCategory.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'businessCategory'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                BusinessCategory.updateOne(
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
exports.deleteBusinessCategory = (req, res, next)=>{
    BusinessCategory.deleteOne({_id: req.params.fieldID})
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

var fetchAllBusinessCategory = async (type)=>{
    return new Promise(function(resolve,reject){ 
    BusinessCategory.find()
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
};


exports.bulkUploadBusinessCategory = (req, res, next)=>{
    // console.log("inside bulk upload brand");
     // var businessCategoryBulk = [{brand:"mesh"}];
    var businessCategoryBulk = req.body.data;
    // console.log("businessCategoryBulk",businessCategoryBulk);

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
         // var alldepartments = await fetchDepartments();
        for(var k = 0 ; k < businessCategoryBulk.length ; k++){
            if (businessCategoryBulk[k].businessCategory == '-') {
                remark += "department not found, " ;  
            }
            // console.log("remark",remark)

              if (remark == '') {
                // var allDepartments = await fetchAllDepartments(req.body.reqdata);
                // console.log("alldepartments",allDepartments);
                 // console.log()
                  var allbusinessCategorys = await fetchAllBusinessCategorys(req.body.reqdata);
                  var businessCategoryExists = allbusinessCategorys.filter((data)=>{
                    if (data.businessCategory == businessCategoryBulk[k].businessCategory)
                         {
                        return data;
                    }
                })
               
                 // console.log("in else validObjects",businessCategoryExists);
                if (businessCategoryExists.length==0) {
                    validObjects = businessCategoryBulk[k];
                    validObjects.fileName       = req.body.fileName;
                    // validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt      = new Date();

                    validData.push(validObjects); 

                }else{
                    
                    remark += "City Type already exists." ; 

                    invalidObjects = businessCategoryBulk[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects); 
                }
 
              
            }

        }
        BusinessCategory.insertMany(validData)
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
exports.fetch_file = (req,res,next)=>{ 
    BusinessCategory.find( { _id : "fileName"})
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
    BusinessCategory.find( { fileName:req.params.fileName }  )
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



