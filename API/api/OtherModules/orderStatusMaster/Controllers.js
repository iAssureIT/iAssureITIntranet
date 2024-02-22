const mongoose              = require("mongoose");
const OrderStatusMaster     = require('./Model.js');
const FailedRecords         = require('../failedRecords/Model');

exports.insertOrderStatus = (req,res,next)=>{
    if(req.body.fieldValue && req.body.fieldValue !== ""){
        processData();
        async function processData(){
            var allOrderStatus  = await fetchOrderStatus();
            console.log("")
            var OrderStatusdata = allOrderStatus.filter((data)=>{
                console.log(" => ",)
                if (data.orderStatus.toLowerCase() === req.body.fieldValue.toLowerCase()) {
                    return data;
                }
            })
            
            if (OrderStatusdata && OrderStatusdata.length > 0) {
                res.status(200).json({ duplicated : true });
            }else{
                const orderStatusMaster = new OrderStatusMaster({
                    _id                         : new mongoose.Types.ObjectId(),
                    orderStatus                 : req.body.fieldValue,
                    statusRank                  : req.body.statusRank,
                    createdBy                   : req.body.createdBy,
                    createdAt                   : new Date()
                })
                orderStatusMaster.save()
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
    }else{
        res.status(200).json({ emptyData : true });
    }     
};
var fetchOrderStatus = async ()=>{
    return new Promise(function(resolve,reject){ 
    OrderStatusMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countOrderStatus = (req, res, next)=>{
    OrderStatusMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchOrderStatus = (req, res, next)=>{
    OrderStatusMaster.find({})
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
exports.getAllOrderStatus = (req, res, next)=>{
    OrderStatusMaster.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};
exports.fetchSingleOrderStatus = (req, res, next)=>{
    OrderStatusMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchOrderStatus = (req, res, next)=>{
    OrderStatusMaster.find({ difficultyLevel: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateOrderStatus = (req, res, next)=>{
    OrderStatusMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  
                    'orderStatus'      : req.body.fieldValue,
                    'statusRank'       : req.body.statusRank 
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                OrderStatusMaster.updateOne(
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
exports.deleteOrderStatus = (req, res, next)=>{
    OrderStatusMaster.deleteOne({_id: req.params.fieldID})
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

var fetchAllOrderStatus = async (type)=>{
    return new Promise(function(resolve,reject){ 
    OrderStatusMaster.find()
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

// exports.orderBulkUpload = (req, res, next)=>{
//     // var departments = [{department:"mesh"},{department:"mesh1"},{department:"mesh2"}];
//     var orderStatuslist = req.body.data;
//     console.log("orderStatus",orderStatus);

//     var validData = [];
//     var validObjects = [];
//     var invalidData = [];
//     var invalidObjects = [];
//     var remark = ''; 
//     var failedRecords = [];
//     var Count = 0;
//     var DuplicateCount = 0;

//     processData();
//     // async function processData(){
//     //      // var alldepartments = await fetchDepartments();
//     //     for(var k = 0 ; k < orderStatuslist.length ; k++){
//     //         if (orderStatuslist[k].orderStatus == '-') {
//     //             remark += "orderStatus not found, " ;  
//     //         }
//     //         console.log("remark",remark)

//     //           if (remark == '') {
//     //             // var allDepartments = await fetchAllDepartments(req.body.reqdata);
//     //             // console.log("alldepartments",allDepartments);
//     //              console.log()
//     //               var alldepartments = await fetchOrderStatus(req.body.reqdata);
//     //               var departmentExists = alldepartments.filter((data)=>{
//     //                 if (data.orderStatus == orderStatuslist[k].orderStatus)
//     //                      {
//     //                     return data;
//     //                 }
//     //             })
               
//     //              console.log("in else validObjects",departmentExists);
//     //             if (departmentExists.length==0) {
//     //                 validObjects = orderStatuslist[k];
//     //                 validObjects.fileName       = req.body.fileName;
//     //                 // validObjects.createdBy      = req.body.reqdata.createdBy;
//     //                 validObjects.createdAt      = new Date();

//     //                 validData.push(validObjects); 

//     //             }else{
                    
//     //                 remark += "order Status already exists." ; 

//     //                 invalidObjects = orderStatuslist[k];
//     //                 invalidObjects.failedRemark = remark;
//     //                 invalidData.push(invalidObjects); 
//     //             }
 
              
//     //         }

//     //     }
//     //     OrderStatusMaster.insertMany(validData)
//     //     .then(data=>{

//     //     })
//     //     .catch(err =>{
//     //         console.log(err);
//     //     });

//     //     failedRecords.FailedRecords = invalidData;
//     //     failedRecords.fileName = req.body.fileName;
//     //     failedRecords.totalRecords = req.body.totalRecords;

//     //     await insertFailedRecords(failedRecords,req.body.updateBadData);
        
//     //     res.status(200).json({
//     //         "message": "Bulk upload process is completed successfully!",
//     //         "completed": true
//     //     });
//     // }

// };
var fetchAllOrderStatuses = async ()=>{
    return new Promise(function(resolve,reject){ 
    OrderStatusMaster.find()
        .sort({createdAt : -1})
        // .skip(req.body.startRange)
        // .limit(req.body.limitRange)
        .then(data=>{
            // console.log("fetchAllOrderStatuses data",data)
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        });
    });
}; 

exports.orderBulkUpload = (req,res,next)=>{
    
    var orderStatuslist = req.body.data;
    // console.log("orderStatuslist",orderStatuslist);
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
        for(var k = 0 ; k < orderStatuslist.length ; k++){
            if (orderStatuslist[k].orderStatus == '-') {
                remark += "order Status not found, " ;  
            }
            //  console.log("remark",remark)
             if (remark == '') {
                 var allorderStatus = await fetchAllOrderStatuses(req.body.reqdata);
                //   console.log("req.body.reqdata",req.body.reqdata);
                  var orderStatusExists = allorderStatus.filter((data)=>{
                    //  console.log("data",data)
                    //  console.log("data.orderStatus",data.orderStatus);
                            // console.log("orderStatuslist[k].orderStatus",orderStatuslist[k].orderStatus);
                       
                    if (data.orderStatus == orderStatuslist[k].orderStatus)
                         {
                             return data;
                    }
                })

                //   console.log("in else validObjects",orderStatusExists);
                if (orderStatusExists.length==0) {

                    validObjects = orderStatuslist[k];
                    // console.log("validObjects",validObjects)
                    validObjects.fileName       = req.body.fileName;
                    // validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt      = new Date();

                    validData.push(validObjects); 

                } 
                else{
                    
                    remark += "Order Status already exists." ; 
                    // console.log("validObjects remark",remark)
                    invalidObjects = orderStatuslist[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects); 
                }
            }
        }
         OrderStatusMaster.insertMany(validData)
        .then(data=>{
            // console.log("validObjects data",data)
             //res.status(200).json(data);
        })
        .catch(err =>{
            console.log(err);
        });
        await insertFailedRecords(failedRecords,req.body.updateBadData);
        
        res.status(200).json({
            "message": "Bulk upload process is completed successfully!",
            "completed": true
        });
    } 
};
exports.fetch_file_count = (req,res,next)=>{
    //PersonMaster.find({"type" : req.params.type})

    OrderStatusMaster.find( { _id : "fileName" } )
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
    OrderStatusMaster.find( { _id : "fileName"})
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
    OrderStatusMaster.find( { fileName:req.params.fileName  }
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