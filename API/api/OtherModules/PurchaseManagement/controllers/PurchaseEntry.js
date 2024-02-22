const mongoose	= require("mongoose");

const PurchaseEntry = require('../models/PurchaseEntry');
const EntityMaster = require('../../../coreAdmin/entityMaster/ModelEntityMaster');
const Products      = require('../../products/Model');
const FailedRecords = require('../../failedRecords/Model');
var UnitOfMeasurment = require('../../departmentMaster/ModelUnitofmeasurment');

// const UnitOfMeasurment = require('../../unitOfMeasurement/ControllerUnitOfMeasurment');
// const UnitOfMeasurmentMaster     = require('../../unitOfMeasurement/ModelUnitOfMeasurment.js');
const moment = require('moment-timezone');

exports.insert_purchaseEntry = (req,res,next)=>{
                const purchaseEntry = new PurchaseEntry({
                    _id                       : new mongoose.Types.ObjectId(),                    
                    purchaseDate              : moment(req.body.purchaseDate).tz('Asia/Kolkata').startOf('day'),
                    purchaseStaff             : req.body.purchaseStaff,
                    purchaseLocation          : req.body.purchaseLocation,
                    /*productId                 : req.body.productId, 
                    itemId                    : req.body.itemId,*/
                    itemCode                  : req.body.itemCode,
                    productCode               : req.body.productCode,
                    productName               : req.body.productName,
                    quantity                  : req.body.quantity,
                    unit                      : req.body.unit,
                    amount                    : req.body.amount,
                    unitRate                  : req.body.unitRate,
                    unitOfMeasurement         : req.body.unitOfMeasurement,
                    Details                   : req.body.Details,
                    purchaseNumber            : req.body.purchaseNumber,
                    balance                   : req.body.quantity,
                    finishedGoodsArray        : [],
                    balanceUnit               : req.body.unit,
                    createdBy                 : req.body.createdBy,
                    createdAt                 : new Date()
                });
                purchaseEntry.save()
                .then(data=>{
                    res.status(200).json({
                        "message": "purchaseEntry Submitted Successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
   
};
exports.fetch_one = (req,res,next)=>{
    PurchaseEntry.findOne({"_id":req.params.fetchId})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('PAGE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};   
exports.update_PurchaseEntry = (req,res,next)=>{
    PurchaseEntry.updateOne(
            { _id:req.params.purchaseID},  
            {
                $set:{
                    purchaseDate              : moment(req.body.purchaseDate).tz('Asia/Kolkata').startOf('day'),
                    purchaseStaff             : req.body.purchaseStaff,
                    purchaseLocation          : req.body.purchaseLocation,
                    productName               : req.body.productName,
                    productCode               : req.body.productCode,
                    itemCode                  : req.body.itemCode,
                    quantity                  : req.body.quantity,
                    unit                      : req.body.unit,
                    amount                    : req.body.amount,
                    unitRate                  : req.body.unitRate,
                    Details                   : req.body.Details,
                    purchaseNumber            : req.body.purchaseNumber,
                    unitOfMeasurement         : req.body.unitOfMeasurement,
                    balance                   : req.body.quantity,
                    balanceUnit               : req.body.unit,
                    // createdBy                 : req.body.createdBy,
                    // createdAt                 : new Date()
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "PurchaseEntry Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "PurchaseEntry Not Found"
                });
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.get_datewise_purchaceEntry = (req, res, next)=>{
    const moment = require('moment-timezone');
    const purchaseDate = moment(req.body.purchaseDate).tz('Asia/Kolkata').startOf('day');
    var selector = {};
    if(typeof(req.body.purchaseDate) != "undefined" && typeof(req.body.purchaseNumber) != "undefined" && typeof(req.body.productName) != "undefined"){
        selector ={"purchaseDate":purchaseDate,"purchaseNumber":req.body.purchaseNumber,"productName":req.body.productName};
    }else{
        if(typeof(req.body.purchaseNumber) != "undefined"){
            selector.purchaseNumber =req.body.purchaseNumber;
        }
        if(typeof(req.body.productName) != "undefined"){
            selector.productName =req.body.productName;
        } 
        if(typeof(req.body.purchaseDate) != "undefined"){
            selector.purchaseDate =purchaseDate;
        }
    }


    // console.log("selector",selector);
    PurchaseEntry.find(selector)
    .then(data=>{
    //    console.log("data----=",data);
       res.status(200).json(data);   
       
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

    function getUserData(user_id){
        return new Promise(function(resolve,reject){
            User.findOne({_id : ObjectId(user_id)})
                .then(staff => {
                      resolve(staff);
                })
                .catch()
        })
    }
};
exports.list_purchaseEntry = (req, res, next)=>{
    PurchaseEntry.find({})
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            // console.log("data--",data);
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });
};
exports.delete_purchaseEntry = (req,res,next)=>{
    PurchaseEntry.deleteOne({_id:req.params.purchaseID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "PurchaseEntry Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.get_purchase_numbers = (req,res,next)=>{
    PurchaseEntry.distinct( "purchaseNumber" )
    .then(data=>{
      // console.log("purchaseNumber----=",data);
       res.status(200).json(data);   
       
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    }); 
}

/*code by madhuri start*/

exports.get_total_inward = (req,res,next) => {
    PurchaseEntry.aggregate([
       {"$match": { "itemCode": req.params.itemcode}},
       {"$group": {"_id": null,"TotalInward": { "$sum": "$quantity"}}
    }])
     .then(data=>{
       res.status(200).json(data[0]);   
       
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    }); 
}


exports.raw_material_current_stock = (req,res,next) => {
    PurchaseEntry.find({itemCode : req.params.itemcode,balance: { $gt: 0 }})
     .then(data=>{
            var balanceArray = [];
            var balanceUnitArray = [];
            var balanceUnit;
            var finalArray = [];
            data.filter(function(item,index){
                balanceArray.push({"balance" :item.balance,"balanceUnit":item.balanceUnit});
            });

            balanceArray.filter(function(item,index){
                if(item.balanceUnit === "Kg"){
                    balanceUnitArray.push(item.balance);
                    balanceUnit = "Kg"
                }else{
                    if(item.balanceUnit == "Gm"){
                        var converToKG = item.balance/1000;
                        balanceUnitArray.push(converToKG);
                        //converted to kg so balanceunit is kg only
                        balanceUnit = "Kg";
                    }else{
                        balanceUnitArray.push(item.balance);
                        balanceUnit = item.balanceUnit;
                    }                    
                }
            });

            let totalBalance = balanceUnitArray.reduce(function(prev, current) {
                finalArray.push({"totalStock":current,"StockUnit":balanceUnit})
                return finalArray;
            }, 0);

            var sum = 0;
            finalArray.forEach(function(obj){
              sum += obj.totalStock;
            });
           res.status(200).json({"totalStock":sum,"StockUnit":balanceUnit});   
       
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    }); 
}

exports.generate_purchase_number = (req, res, next)=>{
    PurchaseEntry.findOne()
        .sort({ "createdAt": -1 })
        .exec()
        .then(data=>{
            if(data){
                 const PONum= data.purchaseNumber.replace('PR','');
                 const number = Number(PONum) + Number(1);
                 PurchaseNumber = "PR" + number;
             }else{
                 PurchaseNumber = "PR" + 1;
             }
            res.status(200).json(PurchaseNumber);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });
};

exports.raw_material_bulk_upload = (req,res,next)=>{
    const moment = require('moment-timezone');
    var purchaseNumber = req.body.reqdata.purchaseNumber;
    var record = []; 
    var i = 0;
    var found = 0;
    var failedRecords = [];
    getData();
    async function getData(){
        var productData = req.body.data;
        var TotalCount  = 0;
        var Count  = 0;
        var DuplicateCount  = 0;
        var invalidData = [];
        var invalidObjects = [];
        var remark = ''; 
        var date;


      //  console.log("test",productData,req.body.reqdata);

        for(k = 0 ; k < productData.length ; k++){
            productData[k].purchaseNumber = req.body.reqdata.purchaseNumber;
                if (typeof productData[k].purchaseDate == 'number') {
                    date = moment(new Date(Math.round((productData[k].purchaseDate - 25569)*86400*1000))).format("YYYY-MM-DD");
               }else{
                    date = moment(productData[k].purchaseDate,'YYYY-MM-DD')._i
                }

                productData[k].purchaseDate = date;

                if (productData[k].product != '') {
                    if (productData[k].product != undefined && productData[k].productCode != undefined && productData[k].itemCode != undefined) {
                        var productPresent = await findProduct(productData[k].itemCode,productData[k].product);
                        if (productPresent) {
                           var AllUnits = await fetchUnitOfMeasurment();
                           const unitOfMeasurement = AllUnits.find(element => element.department === productData[k].unitOfMeasurement);
                           const unit = AllUnits.find(element => element.department === productData[k].unit);
 
                           if (unitOfMeasurement && unit) {
                            if(moment(new Date(date), "YYYY-MM-DD").isValid()){
                               if(typeof productData[k].unitRate  === 'number'){
                                  if(typeof productData[k].unitOfMeasurement != undefined){
                                    if(typeof productData[k].unit != undefined){
                                        if(typeof productData[k].quantity  === 'number'){
                                            if(typeof productData[k].amount  === 'number'){
                                                productData[k].fileName = req.body.fileName;
                                                // console.log("insert filename",productData[k].fileName);
                                                var insertPurchaseEntryObj = await insertPurchaseEntry(productData[k]);
                                                if (insertPurchaseEntryObj != 0) {
                                                    Count++;
                                                }else{
                                                    remark += insertPurchaseEntryObj.err;
                                                    invalidObjects =  productData[k];
                                                    invalidObjects.failedRemark = remark;
                                                    invalidData.push(invalidObjects);
                                                }
                                            }else{
                                                remark += "Amount should be number and not empty";
                                                invalidObjects =  productData[k];
                                                invalidObjects.failedRemark = remark;
                                                invalidData.push(invalidObjects);
                                           }
                                       }else{
                                            remark += "Quantity should be number and not empty";
                                            invalidObjects =  productData[k];
                                            invalidObjects.failedRemark = remark;
                                            invalidData.push(invalidObjects);
                                       }
                                    }else{
                                            remark += "Unit should not be empty.";
                                            invalidObjects =  productData[k];
                                            invalidObjects.failedRemark = remark;
                                            invalidData.push(invalidObjects);
                                    }
                                }else{
                                        remark += "Unit Of Measurement should not be empty";
                                        invalidObjects =  productData[k];
                                        invalidObjects.failedRemark = remark;
                                        invalidData.push(invalidObjects);
                                }
                               }else{
                                    remark += "Unit rate should be number and not empty";
                                    invalidObjects =  productData[k];
                                    invalidObjects.failedRemark = remark;
                                    invalidData.push(invalidObjects);
                               }
                            }else{
                                remark += "Purchase date should be in YYYY-MM-DD formart";
                                invalidObjects =  productData[k];
                                invalidObjects.failedRemark = remark;
                                invalidData.push(invalidObjects);
                            }
                          }else{
                             remark += "Unit of measurement is not defined";
                             invalidObjects =  productData[k];
                             invalidObjects.failedRemark = remark;
                             invalidData.push(invalidObjects);   

                          }   
                         }else{


                         }
                    }
                }

            if (productData[k].itemCode != undefined) {
                TotalCount++;
                if(productData[k].productCode == undefined){
                     remark += "Product Code not found";
                }
                if (productData[k].purchaseDate) {
                    if(productData[k].purchaseDate == undefined){
                        remark += ", Purchase Date not found, ";
                    }else{
                       if(moment(new Date(date), "YYYY-MM-DD").isValid() !== true){
                            remark += ", Purchase date should be in YYYY-MM-DD formart, ";
                        }
                    }
                    
                }
                if (productData[k].unitRate == undefined) {
                    remark += "Unit Rate not found, ";
                }
                if (productData[k].quantity == undefined) {
                    remark += "Quantity not found, ";
                }
                if (productData[k].amount == undefined) {
                    remark += "Amount not found, ";
                }
                if (productData[k].product == undefined) {
                    remark += "Product Name not found, ";
                }
            }
            
            if (remark != '') {
                invalidObjects = productData[k];
                invalidObjects.remark = remark;
                invalidData.push(invalidObjects);
            } 
            remark = '';
        }
        
        failedRecords.FailedRecords = invalidData
        failedRecords.fileName = req.body.fileName;
        failedRecords.totalRecords = TotalCount;

        await insertFailedRecords(failedRecords); 
        
         var msgstr = "";
        if (Count > 0) {
               msgstr =  " " + Count+" products are added successfully";         
        }else{
            msgstr = "Failed to add products";
        }
        res.status(200).json({
            "message": msgstr,
            "completed": true
        });
    }
};

function findProduct(itemCode, productName) {
    return new Promise(function(resolve,reject){  
    Products.findOne(
                { "$or": 
                    [
                    {"productName"    : {'$regex' : '^' + productName , $options: "i"} },
                    {"itemCode"       : itemCode },
                    ]
                })

                .exec()
                .then(productObject=>{
                    if(productObject){
                        resolve(1);
                    }else{
                        resolve(0);
                    }
                })
    })           
}

function fetchUnitOfMeasurment(){
    return new Promise(function(resolve,reject){ 
    UnitOfMeasurment.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.filedetails = (req,res,next)=>{
    var finaldata = {};
    PurchaseEntry.find({fileName:req.params.fileName})
    .exec()
    .then(data=>{
        //finaldata.push({goodrecords: data})
        finaldata.goodrecords = data;
        FailedRecords.find({fileName:req.params.fileName})  
            .exec()
            .then(badData=>{
               // console.log("baddata",badData);
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

var insertPurchaseEntry = async (data) => {
    // console.log('Data',data);
    return new Promise(function(resolve,reject){ 
        insertPurchaseEntryControl();
        async function insertPurchaseEntryControl(){
             const purchaseEntry = new PurchaseEntry({
                    _id                       : new mongoose.Types.ObjectId(),                    
                    purchaseDate              : moment(data.purchaseDate).tz('Asia/Kolkata').startOf('day'),
                    purchaseStaff             : data.purchaseStaff,
                    purchaseLocation          : data.purchaseLocation,
                    productCode               : data.productCode,
                    itemCode                  : data.itemCode,
                    productName               : data.product,
                    quantity                  : data.quantity,
                    unit                      : data.unit,
                    amount                    : data.amount,
                    unitRate                  : data.unitRate,
                    unitOfMeasurement         : data.unitOfMeasurement,
                    Details                   : data.details,
                    purchaseNumber            : data.purchaseNumber,
                    balance                   : data.quantity,
                    balanceUnit               : data.unit,
                    fileName                  : data.fileName,
                    createdBy                 : data.createdBy,
                    createdAt                 : new Date()
                });
                purchaseEntry.save()
                .then(data=>{
                   resolve(data._id);
                })
                .catch(err =>{
                    console.log(err);
                    reject(err);
                });
                
        }
    })
}



var insertFailedRecords = async (invalidData) => {
    return new Promise(function(resolve,reject){ 
    FailedRecords.find({fileName:invalidData.fileName})  
            .exec()
            .then(data=>{
            if(data.length>0){
                //console.log('data',data)   
                if (data[0].failedRecords.length>0) {
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

function get_opening_stock_of_raw(itemCode,id,date){
    var date = moment(date).tz('Asia/Kolkata').startOf('day');
     return new Promise(function(resolve,reject){ 
     PurchaseEntry.find({
                  itemCode : itemCode,
                  _id: {$ne: id},
                  balance: { $gt: 0 },
                  createdAt: {
                     $lte: moment(date).endOf('day').toDate()
                  }
              })
           .then(data=>{
            var balanceArray = [];
            var balanceUnitArray = [];
            var balanceUnit;
            var finalArray = [];
            data.filter(function(item,index){
                balanceArray.push({"balance" :item.balance,"balanceUnit":item.balanceUnit});
            });

            balanceArray.filter(function(item,index){
                if(item.balanceUnit === "Kg"){
                    balanceUnitArray.push(item.balance);
                    balanceUnit = "Kg"
                }else{
                    if(item.balanceUnit == "Gm"){
                        var converToKG = item.balance/1000;
                        balanceUnitArray.push(converToKG);
                        //converted to kg so balanceunit is kg only
                        balanceUnit = "Kg";
                    }else{
                        balanceUnitArray.push(item.balance);
                        balanceUnit = item.balanceUnit;
                    }                    
                }
            });

            let totalBalance = balanceUnitArray.reduce(function(prev, current) {
                finalArray.push({"totalStock":current,"StockUnit":balanceUnit})
                return finalArray;
            }, 0);
            var sum = 0;
            finalArray.forEach(function(obj){
              sum += obj.totalStock;
            });
            resolve(sum);
       
    })
    .catch(err =>{
        reject(err);
    }); 
   })
}

function get_current_stock_of_raw(itemcode){
     return new Promise(function(resolve,reject){ 
     PurchaseEntry.find({itemCode : itemcode,balance: { $gt: 0 }})
     .then(data=>{
            var balanceArray = [];
            var balanceUnitArray = [];
            var balanceUnit;
            var finalArray = [];
            data.filter(function(item,index){
                balanceArray.push({"balance" :item.balance,"balanceUnit":item.balanceUnit});
            });

            balanceArray.filter(function(item,index){
                if(item.balanceUnit === "Kg"){
                    balanceUnitArray.push(item.balance);
                    balanceUnit = "Kg"
                }else{
                    if(item.balanceUnit == "Gm"){
                        var converToKG = item.balance/1000;
                        balanceUnitArray.push(converToKG);
                        //converted to kg so balanceunit is kg only
                        balanceUnit = "Kg";
                    }else{
                        balanceUnitArray.push(item.balance);
                        balanceUnit = item.balanceUnit;
                    }                    
                }
            });

            let totalBalance = balanceUnitArray.reduce(function(prev, current) {
                finalArray.push({"totalStock":current,"StockUnit":balanceUnit})
                return finalArray;
            }, 0);
            var sum = 0;
            finalArray.forEach(function(obj){
              sum += obj.totalStock;
            });
            resolve({"totalStock":sum,"StockUnit":balanceUnit});
       
    })
    .catch(err =>{
        reject(err);
    }); 
   })
}



exports.get_purchase_entry_report = (req, res, next)=>{
    const moment = require('moment-timezone');
    const startDate = moment(req.body.fromDate).tz('Asia/Kolkata').startOf('day');
    const endDate =  moment(req.body.toDate).tz('Asia/Kolkata').endOf('day');

    if(req.body.itemcode != undefined && req.body.itemcode != ""){
        PurchaseEntry.find({ 
            purchaseDate: { '$gte': startDate, '$lt': endDate},
            itemCode:req.body.itemcode
        })
        .sort({createdAt:-1})      
        .exec()
        .then(data=>{
            main();
             async function main(){
                        var i = 0;
                        var returnData = [];
                        var DistData = [];
                        for(i = 0 ; i < data.length ; i++){
                        var currentStock =  await get_current_stock_of_raw(data[i].itemCode);
                        var openingStock =  await get_opening_stock_of_raw(data[i].itemCode,data[i]._id,data[i].purchaseDate);

                            returnData.push({
                                "_id"             : data[i]._id,
                                "purchaseDate"    : data[i].purchaseDate,
                                "purchaseStaff"   : data[i].purchaseStaff,
                                "purchaseStaff"   : data[i].purchaseStaff,
                                "purchaseLocation": data[i].purchaseLocation,
                                "itemCode"        : data[i].itemCode,
                                "productCode"     : data[i].productCode,
                                "productName"     : data[i].productName,
                                "quantity"        : data[i].quantity,
                                "unit"            : data[i].unit,
                                "amount"          : data[i].amount,
                                "unitRate"        : data[i].unitRate,
                                "unitOfMeasurement": data[i].unitOfMeasurement,
                                "Details"          : data[i].Details,
                                "purchaseNumber"   : data[i].purchaseNumber,
                                "balance"          : data[i].balance,
                                "balanceUnit"      : data[i].balanceUnit,
                                "totalStock"       : currentStock.totalStock,
                                "StockUnit"        : currentStock.StockUnit,
                                "openingStock"     : openingStock,
                                "createdAt"        : data[i].createdAt,
                            });
                        }
                        if( i >= data.length){
                            res.status(200).json(returnData);
                        }
                }
          
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }else{
    
        PurchaseEntry.find({ 
            purchaseDate: { '$gte': startDate, '$lt': endDate},
        })
        // .sort({createdAt:-1})      
        .exec()
        .then(data=>{
             main();
             async function main(){
                        var i = 0;
                        var returnData = [];
                        var DistData = [];
                        for(i = 0 ; i < data.length ; i++){
                         var currentStock =  await get_current_stock_of_raw(data[i].itemCode);
                         var openingStock =  await get_opening_stock_of_raw(data[i].itemCode,data[i]._id,data[i].purchaseDate);
                            returnData.push({
                                "_id"             : data[i]._id,
                                "purchaseDate"    : data[i].purchaseDate,
                                "purchaseStaff"   : data[i].purchaseStaff,
                                "purchaseStaff"   : data[i].purchaseStaff,
                                "purchaseLocation": data[i].purchaseLocation,
                                "itemCode"        : data[i].itemCode,
                                "productCode"     : data[i].productCode,
                                "productName"     : data[i].productName,
                                "quantity"        : data[i].quantity,
                                "unit"            : data[i].unit,
                                "amount"          : data[i].amount,
                                "unitRate"        : data[i].unitRate,
                                "unitOfMeasurement": data[i].unitOfMeasurement,
                                "Details"          : data[i].Details,
                                "purchaseNumber"   : data[i].purchaseNumber,
                                "balance"          : data[i].balance,
                                "balanceUnit"      : data[i].balanceUnit,
                                "totalStock"       : currentStock.totalStock,
                                "StockUnit"        : currentStock.StockUnit,
                                "openingStock"     : openingStock,
                                "createdAt"        : data[i].createdAt,
                            });
                        }
                        if( i >= data.length){
                            res.status(200).json(returnData);
                        }
                }
            })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }
};


exports.get_total_raw_balance = (req,res,next)=>{
    PurchaseEntry.aggregate([
           {"$group": {"_id": null,"TotalInward": { "$sum": "$balance"}}
        }])
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json({count:data[0].TotalInward});
            }else{
                res.status(404).json('PAGE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};  

exports.get_total_raw_balance = (req,res,next)=>{
    PurchaseEntry.aggregate([
           {"$group": {"_id": null,"TotalInward": { "$sum": "$balance"}}
        }])
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json({count:data[0].TotalInward});
            }else{
                res.status(404).json('PAGE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};  




/*code by madhuri end*/

/*exports.list_category = (req,res,next)=>{
    Category.find({"section_ID":req.params.section_ID})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};*/
/*exports.list_category_with_limits = (req,res,next)=>{
   
    Category.find()
    .skip(parseInt(req.body.startRange))
    .limit(parseInt(req.body.limitRange))
    .exec()
    .then(data=>{
        console.log('data', data);
        var allData = data.map((x, i)=>{
            return {
                "_id"                   : x._id,
                "section"               : x.section,
                "category"              : x.category,
                "subCategory"           : ((x.subCategory.map((a, i)=>{return '<p>'+a.subCategoryTitle+'</p>'})).toString()).replace(/,/g, " "),
                "categoryDescription"   : x.categoryDescription,
                "categoryImage"         : x.categoryImage,
                "categoryIcon"          : x.categoryIcon,
            }
        })
        res.status(200).json(allData);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};*/

/*exports.searchCategory = (req,res,next)=>{
    Category.find({
        $or: [
                { "section": { "$regex": req.body.searchText, $options: "i" } },
                { "category": { "$regex": req.body.searchText, $options: "i" } },
                { "categoryDescription": { "$regex": req.body.searchText, $options: "i" } },
            ]
    })
    .skip(parseInt(req.body.startRange))
    .limit(parseInt(req.body.limitRange))
    .exec()
    .then(data=>{
        console.log('data', data);

        var allData = data.map((x, i)=>{
            return {
                "_id"                   : x._id,
                "section"               : x.section,
                "category"              : x.category,
                "subCategory"           : ((x.subCategory.map((a, i)=>{return '<p>'+a.subCategoryTitle+'</p>'})).toString()).replace(/,/g, " "),
                "categoryDescription"   : x.categoryDescription,
                "categoryImage"         : x.categoryImage,
                "categoryIcon"          : x.categoryIcon,
            }
        })

        res.status(200).json(allData);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};*/

/*exports.searchCategoryCount = (req,res,next)=>{
    // console.log(req.body.startRange, req.body.limitRange);
    Category.find({
        $or: [
                { "section": { "$regex": req.body.searchText, $options: "i" } },
                { "category": { "$regex": req.body.searchText, $options: "i" } },
                { "categoryDescription": { "$regex": req.body.searchText, $options: "i" } },
            ]
    })
    
    .exec()
    .then(data=>{
        res.status(200).json({"dataCount":data.length});
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};*/

/*exports.count_category = (req,res,next)=>{
    Category.find({})
    .exec()
    .then(data=>{
        res.status(200).json({"dataCount":data.length});
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};*/
/*exports.fetch_category = (req,res,next)=>{
    Category.findOne({_id : req.params.categoryID})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};*/

/*exports.fetch_categories_by_section = (req,res,next)=>{
    Category.find({ section_ID: req.params.sectionID})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};*/

