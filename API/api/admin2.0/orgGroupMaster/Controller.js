const mongoose          = require("mongoose");
const OrgLevelMaster     = require('./Model.js');
const FailedRecords     = require('../failedRecords/Model.js');

exports.insertOrgLevel = (req,res,next)=>{
    processData();
    async function processData(){
    var allOrgLevel = await fetchOrgLevel();
    var orgLevel = allOrgLevel.filter((data)=>{
        if (data.orgLevel.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase() && data.companyID == req.body.companyID) {
           
            return data;
        }
        })    
        if (orgLevel.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const departmentMaster = new OrgLevelMaster({
                _id                         : new mongoose.Types.ObjectId(),
                orgLevel                    : req.body.fieldValue,
                createdBy                   : req.body.createdBy,
                createdAt                   : new Date()
            })
            departmentMaster.save()
            .then(data=>{
                res.status(200).json({ created : true, fieldID : data._id });
            })
            .catch(err =>{
                res.status(500).json({ error: err }); 
            });
        }
    }             
};

var fetchAllOrgLevel = async ()=>{
    return new Promise(function(resolve,reject){ 
    OrgLevelMaster.find({})
         .sort({createdAt : -1})
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

var fetchOrgLevel = async ()=>{
    return new Promise(function(resolve,reject){ 
    OrgLevelMaster.find({})
        .sort({createdAt : -1})
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.countOrgLevel = (req, res, next)=>{
    OrgLevelMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
}; 


exports.fetchOrgLevel = (req, res, next)=>{
    OrgLevelMaster.find({})
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

exports.getAllOrgLevel = (req, res, next)=>{
    OrgLevelMaster.find({})
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            // console.log("getAllOrgLevel=============",data);
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleOrgLevel = (req, res, next)=>{
    OrgLevelMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchOrgLevel = (req, res, next)=>{
    OrgLevelMaster.find({ orgLevel : { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateOrgLevel = (req, res, next)=>{
    OrgLevelMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'orgLevel'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                OrgLevelMaster.updateOne(
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
                res.status(200).json({ updated : true });
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({ error: err });
        });
};
exports.deleteOrgLevel = (req, res, next)=>{
    OrgLevelMaster.deleteOne({_id: req.params.fieldID})
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
function insertOrgLevel(orgLevel, createdBy){
    return new Promise(function(resolve,reject){ 
        const departmentMaster = new OrgLevelMaster({
                        _id                         : new mongoose.Types.ObjectId(),
                        orgLevel                  : orgLevel,
                        createdBy                   : createdBy,
                        createdAt                   : new Date()
                    })
                    departmentMaster.save()
                    .then(data=>{
                        resolve( data._id );
                    })
                    .catch(err =>{
                        reject(err); 
                    });
    });
}
var fetchAllOrgLevel = async (type)=>{
    return new Promise(function(resolve,reject){ 
    OrgLevelMaster.find()
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
}


exports.bulkUploadOrgLevel = (req, res, next)=>{
     //var departments = [{orgLevel:"mesh"},{orgLevel:"mesh1"},{orgLevel:"mesh2"}];
    var departments = req.body.data;
    // console.log("departments",departments);
    // console.log("req.body.data",req.body.data);

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
         // var alldepartments = await fetchOrgLevel();
        for(var k = 0 ; k < departments.length ; k++){
            if (departments[k].orgLevel == '-') {
                remark += "orgLevel not found, " ;  
            }
            // console.log("remark",remark)

              if (remark == '') {
                // var allOrgLevel = await fetchAllOrgLevel(req.body.reqdata);
                // console.log("alldepartments",allOrgLevel);
                 console.log()
                  var alldepartments = await fetchAllOrgLevel(req.body.reqdata);
                  var departmentExists = alldepartments.filter((data)=>{
                    if (data.orgLevel == departments[k].orgLevel)
                         {
                        return data;
                    }
                })
               
                 // console.log("in else validObjects",departmentExists);
                if (departmentExists.length==0) {
                    validObjects = departments[k];
                    // console.log("validObjects",validObjects);
                    validObjects.fileName       = req.body.fileName;
                    validObjects.companyID       = req.body.companyID;
                    // validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt      = new Date();

                    validData.push(validObjects); 

                }else{
                    
                    remark += "OrgLevel already exists." ; 

                    invalidObjects = departments[k];
                    // console.log("invalidObjects",invalidObjects);

                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects); 
                }
 
              
            }

        }
        OrgLevelMaster.insertMany(validData)
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
exports.fetch_file_count = (req,res,next)=>{
    //PersonMaster.find({"type" : req.params.type})
    OrgLevelMaster.find( { _id : "fileName" } )
    .exec()
    .then(data=>{
        
        res.status(200).json(data.length);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    }); 
};
exports.fetch_file = (req,res,next)=>{ 
    OrgLevelMaster.find( { _id : "fileName"})
    .exec()
    .then(data=>{
        // console.log("orgLevel data",data);
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

    OrgLevelMaster.find( { fileName:req.params.fileName  } )

    .exec()
    .then(data=>{
        //finaldata.push({goodrecords: data})
         // console.log("data===404",data)
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
