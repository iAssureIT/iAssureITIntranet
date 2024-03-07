const mongoose          = require("mongoose");
const DesignationMaster     = require('./ModelDesignationMaster.js');
const FailedRecords     = require('../failedRecords/Model.js');


exports.insertDesignation = (req,res,next)=>{
    processData();
    async function processData(){

    var allDesignations = await fetchDesignations();
    var designation = allDesignations.filter((data)=>{
        if (data.designation == req.body.fieldValue.trim().toLowerCase() && data.companyID == req.body.companyID) {
            return data;
        }
        })    
    // console.log("designation",allDesignations);
    // console.log("designation.length > 0",designation.length);
        if (designation.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            // console.log("designation",designation);
            const designationMaster = new DesignationMaster({
                            _id                         : new mongoose.Types.ObjectId(),
                            companyID                   : req.body.companyID,
                            designation                 : req.body.fieldValue,
                            orgLevel                    : req.body.orgLevel,
                            department                  : req.body.department,
                            createdBy                   : req.body.createdBy,
                            createdAt                   : new Date()
                        })
                        designationMaster.save()
                        .then(data=>{
                            //  console.log("designation data",data);
                            res.status(200).json({ created : true, fieldID : data._id });
                        })
                        .catch(err =>{
                            res.status(500).json({ error: err }); 
                        });
        }         
    }    
};
var fetchAllDesignations = async ()=>{
    return new Promise(function(resolve,reject){ 
    DesignationMaster.find()
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

var fetchDesignations = async ()=>{
    return new Promise(function(resolve,reject){ 
    DesignationMaster.find()
        .sort({createdAt : -1})
        // .skip(req.body.startRange)
        // .limit(req.body.limitRange)
        .then(data=>{
            // console.log("data===",data);
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        });
    });
};

exports.countDesignations = (req, res, next)=>{
    DesignationMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchDesignations = (req, res, next)=>{
    DesignationMaster.find({department:req.body.department})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            // console.log("data===",data);
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.getAllDesignations = (req, res, next)=>{
    DesignationMaster.find({})
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleDesignation = (req, res, next)=>{
    DesignationMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchDesignation = (req, res, next)=>{
    DesignationMaster.find({ designation: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateDesignation = (req, res, next)=>{
    DesignationMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'designation'       : req.body.fieldValue,"orgLevel":req.body.orgLevel,"department":req.body.department  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                DesignationMaster.updateOne(
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
exports.deleteDesignation = (req, res, next)=>{
    DesignationMaster.deleteOne({_id: req.params.fieldID})
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



exports.fetch_file = (req,res,next)=>{ 

    DesignationMaster.find( { _id : "fileName"})
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
exports.fetch_file_count = (req,res,next)=>{
    //PersonMaster.find({"type" : req.params.type})
    DesignationMaster.find( { _id : "fileName" } )
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


var fetchAllDesignation = async (type)=>{
    return new Promise(function(resolve,reject){ 
    DesignationMaster.find({type: type})
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

function insertDesignation(designation, createdBy){
    return new Promise(function(resolve,reject){ 
        const designationMaster = new DesignationMaster({
                        _id                         : new mongoose.Types.ObjectId(),
                        designation                 : designation,
                        createdBy                   : createdBy,
                        createdAt                   : new Date()
                    })
                    designationMaster.save()
                    .then(data=>{
                        resolve( data._id );
                    })
                    .catch(err =>{
                        reject(err); 
                    });
    });
}

exports.delete_file = (req,res,next)=>{

    //console.log("type",req.params.type)
    //console.log("fileName",req.params.fileName)
    DesignationMaster.deleteMany({"fileName":req.params.fileName, "type" : req.params.type})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message" : "Records of file "+req.params.fileName+" deleted successfully"
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });  
};

exports.bulkUploadDesignation = (req, res, next)=>{
    var designations = req.body.data;
    // console.log("designations",designations);

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
         // var alldesignations = await fetchDesignations();
        for(var k = 0 ; k < designations.length ; k++){
           if (designations[k].designation == '-') {
                        remark += "designation not found, " ;  
                    }

                      if (remark == '') {
                          var alldesignations = await fetchAllDesignations(req.body.reqdata);
                          var designationExists = alldesignations.filter((data)=>{
                            if (data.designation == designations[k].designation)
                                 {
                                return data;
                            }
                        })
                       
                //  console.log("in else validObjects",designationExists);
                if (designationExists.length==0) {
                    validObjects = designations[k];
                    validObjects.fileName       = req.body.fileName;
                     validObjects.companyID       = req.body.companyID;
                    // validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt      = new Date();

                    validData.push(validObjects); 

                }else{                        
                        remark += "designation already exists." ; 
                        invalidObjects = designations[k];
                        invalidObjects.failedRemark = remark;
                        invalidData.push(invalidObjects); 
                    }                      
                }
        }
         DesignationMaster.insertMany(validData)
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

exports.filedetails = (req,res,next)=>{
    var finaldata = {};
    // console.log(req.params.fileName)

    DesignationMaster.find( { fileName:req.params.fileName  } )

    .exec()
    .then(data=>{
        //finaldata.push({goodrecords: data})
        //  console.log("data===404",data)
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





