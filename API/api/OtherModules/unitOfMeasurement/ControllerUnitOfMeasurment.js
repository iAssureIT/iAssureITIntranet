const mongoose	        = require("mongoose");
const UnitOfMeasurmentMaster     = require('./ModelUnitOfMeasurment.js');
const FailedRecords     = require('../failedRecords/Model.js');

exports.insertUnitOfMeasurment = (req,res,next)=>{
    processData();
    async function processData(){
    var allUnits = await fetchUnitOfMeasurment();
    var unitofmeasurment = allUnits.filter((data)=>{
        if (data.unitofmeasurment.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase() && data.companyID == req.body.companyID) {
            return data;
        }
        })    

        if (unitofmeasurment.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const unitOfMeasurmentMaster = new UnitOfMeasurmentMaster({
                                _id                         : new mongoose.Types.ObjectId(),
                                companyID                   : req.body.companyID,
                                unitOfMeasurment            : req.body.fieldValue,
                                createdBy                   : req.body.createdBy,
                                type                        : req.body.type,
                                createdAt                   : new Date()
                            })
                            unitOfMeasurmentMaster.save()
                            .then(data=>{
                                res.status(200).json({ created : true, fieldID : data._id });
                            })
                            .catch(err =>{
                                res.status(500).json({ error: err }); 
                            });
        }
    }             
};
var fetchAllUnitOfMeasurment = async ()=>{
    return new Promise(function(resolve,reject){ 
    UnitOfMeasurmentMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
var fetchUnitOfMeasurment = async ()=>{
    return new Promise(function(resolve,reject){ 
    UnitOfMeasurmentMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};


exports.countUnitOfMeasurment = (req, res, next)=>{
    UnitOfMeasurmentMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
}; 


exports.fetchUnitOfMeasurment = (req, res, next)=>{
    console.log("req.body => ",req.body)
    UnitOfMeasurmentMaster.find({})
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

exports.getAllUnitOfMeasurment = (req, res, next)=>{
    UnitOfMeasurmentMaster.find({})
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleUnitOfMeasurment = (req, res, next)=>{
    UnitOfMeasurmentMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchUnitOfMeasurment = (req, res, next)=>{
    UnitOfMeasurmentMaster.find({ department : { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateUnitOfMeasurment = (req, res, next)=>{
    UnitOfMeasurmentMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'unitOfMeasurment'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                UnitOfMeasurmentMaster.updateOne(
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
exports.deleteUnitOfMeasurment = (req, res, next)=>{
    UnitOfMeasurmentMaster.deleteOne({_id: req.params.fieldID})
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
function insertUnitOfMeasurment(department, createdBy){
    return new Promise(function(resolve,reject){ 
        const unitOfMeasurmentMaster = new UnitOfMeasurmentMaster({
                        _id                         : new mongoose.Types.ObjectId(),
                        department                  : department,
                        createdBy                   : createdBy,
                        createdAt                   : new Date()
                    })
                    unitOfMeasurmentMaster.save()
                    .then(data=>{
                        resolve( data._id );
                    })
                    .catch(err =>{
                        reject(err); 
                    });
    });
}
var fetchAllUnitOfMeasurment = async (type)=>{
    return new Promise(function(resolve,reject){ 
    UnitOfMeasurmentMaster.find()
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


exports.bulkUploadUnitOfMeasurment = (req, res, next)=>{
    // var departments = [{department:"mesh"},{department:"mesh1"},{department:"mesh2"}];
    var departments = req.body.data;
    //console.log("departments",departments);

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
        for(var k = 0 ; k < departments.length ; k++){
            if (departments[k].department == '-') {
                remark += "Unit not found, " ;  
            }
            // console.log("remark================",remark)

              if (remark == '') {
                // var allDepartments = await fetchAllDepartments(req.body.reqdata);
                // console.log("alldepartments",allDepartments);
                 // console.log()
                  var alldepartments = await fetchAllDepartments(req.body.reqdata);
                  var departmentExists = alldepartments.filter((data)=>{
                    if (data.department == departments[k].department)
                         {
                        return data;
                    }
                })
               
                 // console.log("in else validObjects",departmentExists);
                if (departmentExists.length==0) {
                    validObjects = departments[k];
                    validObjects.fileName       = req.body.fileName;
                    // validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt      = new Date();

                    validData.push(validObjects); 

                }else{
                    
                    remark += "Unit already exists." ; 

                    invalidObjects = departments[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects); 
                }
 
              
            }

        }
        UnitOfMeasurmentMaster.insertMany(validData)
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
    UnitOfMeasurmentMaster.find( { _id : "fileName" } )
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
    UnitOfMeasurmentMaster.find( { _id : "fileName"})
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
    // console.log('req',req,'res',res);
    var finaldata = {};
    // console.log(req.params.fileName)
    UnitOfMeasurmentMaster.find( { fileName:req.params.fileName  }
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


exports.bulkUploadEmployee = (req, res, next)=>{
    var departments = req.body.data;
    // console.log("departments",departments);

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
         var alldepartments = await fetchDepartments();
        for(var k = 0 ; k < departments.length ; k++){
            if (departments[k].department == '-') {
                remark += "department not found, " ;  
            }

              if (remark == '') {
                var departmentId, designationId;
                // check if department exists
                var departmentExists = alldepartments.filter((data)=>{
                    if (data.department.trim().toLowerCase() == departments[k].department.trim().toLowerCase()) {
                        return data;
                    }
                })
                if (departmentExists.length>0) {
                    departmentId = departmentExists[0]._id;
                }else{
                    departmentId = await insertDepartment(departments[k].department.trim(), req.body.reqdata.createdBy);
                    //departmentId = departmentExists[0]._id;
                }

              
            }

        }
    }

};
exports.fetch_file = (req,res,next)=>{ 
    UnitOfMeasurmentMaster.aggregate([
        { $match : { "type" : req.body.type } },
        { $group : { _id : "$fileName", count : {$sum: 1  } } }
        ])
    .exec()
    .then(data=>{
        res.status(200).json(data.slice(req.body.startRange, req.body.limitRange));
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
    // UnitOfMeasurmentMaster.find({ $match : { type: req.params.type, fileName:req.params.fileName } })
    UnitOfMeasurmentMaster.find( { fileName:req.params.fileName  } )
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

exports.deleteAllUnits = (req, res, next) => {
    // console.log("called");
    UnitOfMeasurmentMaster.remove({})
      .exec()
      .then(data => {
        res.status(200).json({
          "message": "All Units Deleted Successfully."
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  };
  


