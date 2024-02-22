const mongoose	= require("mongoose");

const FranchiseDelivery = require('./Model');
const FranchiseGoods = require('../Model');
const FinishedGoods      = require('../../PurchaseManagement/models/FinishedGoodsEntry');
//console.log("FinishedGoods",FinishedGoods);
exports.insert_franchise_delivery = (req,res,next)=>{
            getData();
            async function getData(){
                var dc_challan = await generate_delivery_Challan();
                //deliverySent, deliveryAccepted, deliveryRejected, deliveryCancelled
                var obj = req.body.supply;
                const franchiseDelivery = new FranchiseDelivery({
                    _id                       : new mongoose.Types.ObjectId(),    
                    franchise_id              : req.body.franchise_id, 
                    franchisePO_id            : req.body.franchisePO_id,
                    deliveryDate              : new Date(), 
                    deliveredBy               : req.body.deliveredBy,          
                    deliveryChallanNum        : dc_challan,
                    supply                    : req.body.supply,
                    purchaseOrderId           : req.body.purchaseOrderId,
                    totalDemand               : req.body.totalDemand,
                    totalSupply               : req.body.totalSupply,
                    orderedDate               : req.body.orderedDate,
                    createdBy                 : req.body.createdBy,
                    createdAt                 : new Date()
                });
                franchiseDelivery.save()
                .then(data=>{
                    
                    var manageFinishedGoodsObj = manage_finished_goods(obj,new Date());
                         if(manageFinishedGoodsObj){

                         }else{
                            console.log("err");
                    }
                    res.status(200).json({
                        "franchiseDeliveryId" : data._id,
                        "message": "purchaseEntry Submitted Successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            }
};

exports.get_delivery_challan = (req,res,next)=>{
        FranchiseDelivery.find({"_id":req.params.id})
        .exec()
        .then(data=>{
             res.status(200).json(data[0]);   
          })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
       
};

function generate_delivery_Challan() {
    // console.log("itemCode",itemCode,"productName",productName);
    return new Promise(function(resolve,reject){  
        FranchiseDelivery.findOne()
        .sort({ "createdAt": -1 })
        .exec()
        .then(data=>{
            if(data){
                // console.log("data",data);
                 const  dcChallan = data.deliveryChallanNum.replace('DC','');
                 const number = Number(dcChallan) + Number(1);
                 dc_challan = "DC" + number;
             }else{
                 dc_challan = "DC" + 1;
             }
             resolve(dc_challan);
            
        })
        .catch(err =>{ reject(err); }); 
    })         
}

exports.update_delivery_attribute = (req,res,next)=>{
    if (req.body.remark){
        remark = req.body.remark;
    }else{
        remark = '';
    }
 
    FranchiseDelivery.updateOne(
         { "_id" : req.body.FranchiseDeliveryId, "supply.itemCode": req.body.itemcode }, 
         { "$set": { "supply.$.status": req.body.attribute,"supply.$.remark" : remark}}, 
        )
        .exec()
        .then(data=>{
            getData();
            async function getData(){
                    if(data.nModified == 1){
                       if(req.body.attribute == "deliveryAccepted" || req.body.attribute == "deliveryCompleted"){
                            //if accepted insert into frinchise goods
                            var updateFinishedGoods = await update_franchise_goods(req.body.FranchiseDeliveryId,req.body.itemcode);
                            // console.log("updateFinishedGoods",updateFinishedGoods);
                       }

                       if(req.body.attribute == "deliveryRejected"){
                        //if accepted insert into frinchise goods
                           var deleteFromFinishedGoods = deletefrom_franchise_goods(req.body.FranchiseDeliveryId,req.body.itemcode);
                       }
                    }else{
                         res.status(200).json({
                           "message": "Success",
                         });
                    }
                

                res.status(200).json({
                    "message": "Success",
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

var update_franchise_goods = async (franchiseDcId,itemCode) => {
     // console.log('manage_raw_material',obj);
    return new Promise(function(resolve,reject){ 
        updateFranchiseGoodsControl();
         async function updateFranchiseGoodsControl(){
        //        FranchiseDelivery.find({ "_id" : franchiseDcId, "supply.itemCode": itemCode,'supply.$': 1 })
        //       .sort({createdAt : 1})
              FranchiseDelivery.findOne(
                {
                  _id: franchiseDcId,
                  'supply.itemCode': itemCode
                }, 
                // {'supply.$': 1}
                )
               .then(franchiseData=>{
                   var productObj = franchiseData.supply.find(o => o.itemCode === itemCode);
                   var date = new Date();
                    const franchiseGoods = new FranchiseGoods({
                        _id                       : new mongoose.Types.ObjectId(),
                        franchiseDeliveryId       : franchiseData._id,
                        franchise_id              : franchiseData.franchise_id, 
                        franchisePO_id            : franchiseData.franchisePO_id,
                        deliveryChallanNum        : franchiseData.deliveryChallanNum,
                        productId                 : productObj.productId,
                        productCode               : productObj.productCode,
                        itemCode                  : productObj.itemCode,
                        productName               : productObj.productName,
                        inwardQty                 : productObj.suppliedQty,
                        orders                    : [],
                        balance                   : productObj.suppliedQty,
                        unit                      : productObj.suppliedUnit,
                        createdBy                 : franchiseData.createdBy,
                        createdAt                 : new Date()
                    });
                    franchiseGoods.save()
                    .then(data=>{
                            if(data){
                                resolve(data);
                            }else{
                                resolve(data);
                            }
                    })
                    .catch(err =>{ reject(err); });
                })
               .catch(err =>{
                   console.log(err);
                   reject(err);
               });
           }
             
    })

}

var deletefrom_franchise_goods = async (franchiseDcId,itemCode) => {
     // console.log('manage_raw_material',obj);
    return new Promise(function(resolve,reject){ 
        deleteFranchiseGoodsControl();
         async function deleteFranchiseGoodsControl(){
              FranchiseDelivery.findOne(
                {
                  _id: franchiseDcId,
                  'supply.itemCode': itemCode
                }, 
                )
               .then(franchiseData=>{
                   FranchiseGoods.remove({"franchiseDeliveryId" : franchiseDcId,"franchisePO_id" : franchiseData.franchisePO_id,"itemCode":itemCode})
                    .then(data=>{
                            if(data){
                                resolve(data);
                            }else{
                                resolve(data);
                            }
                    })
                    .catch(err =>{ reject(err); });
                })
               .catch(err =>{
                   console.log(err);
                   reject(err);
               });
           }
             
    })

}

exports.get_delivery_challans_for_po = (req,res,next)=>{
        FranchiseDelivery.find({"franchisePO_id":req.params.id})
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
       
};

var manage_finished_goods = async (data,deliveryDate) => {
    //   console.log('manage_finished_goods',data);
    return new Promise(function(resolve,reject){ 
        updateFinishGoodsControl();
        async function updateFinishGoodsControl(){
               for(let obj of data) {
                   FinishedGoods.find({itemCode : obj.ItemCode,balance: { $gt: 0 }})
                  .sort({createdAt : 1})
                  .limit(1)
                  .then(fgdata=>{
                   // console.log("fgdata",obj.suppliedUnit,obj.suppliedUnit);
                   // console.log("fgdata",obj.suppliedUnit.toLowerCase(),obj.suppliedUnit);
                        if(escape(fgdata.balanceUnit).toLowerCase() == escape(obj.suppliedUnit).toLowerCase()){
                            var remainingBalance = fgdata[0].balance - obj.suppliedQty;
                        }else{
                            //if units are different
                            if((escape(fgdata[0].balanceUnit).toLowerCase() == 'kg' || escape(fgdata[0].balanceUnit).toLowerCase() == 'kilogram') && (escape(obj.suppliedUnit.toLowerCase()) == "gm" || escape(obj.suppliedUnit.toLowerCase()) == "gram")){
                                //convert raw material gram to kg formula kg=gm/1000
                               var convertToKg        = obj.suppliedQty/1000;
                               obj.suppliedQty = convertToKg;
                               obj.suppliedUnit        = fgdata[0].balanceUnit
                               var remainingBalance   = fgdata[0].balance - convertToKg;          
                            }
                            if((escape(fgdata[0].balanceUnit).toLowerCase() == 'gm' || fgdata[0].balanceUnit.toLowerCase() == 'gram') && (obj.suppliedUnit.toLowerCase() == "kg" || obj.suppliedUnit.toLowerCase() == "kilogram")){
                                //convert raw material kg to gram formula g=kg*1000
                                var convertToGram      = obj.suppliedQty*1000;
                                obj.suppliedQty = convertToGram;
                                obj.suppliedUnit        = fgdata[0].balanceUnit
                                var remainingBalance   = fgdata[0].balance - convertToGram;
                            }
                            if(escape(fgdata[0].balanceUnit.toLowerCase()) == "kg" &&  escape(obj.suppliedUnit.toLowerCase()) == "kilogram"){
                               var remainingBalance = fgdata[0].balance - obj.suppliedQty;
                            }

                             if(escape(fgdata[0].balanceUnit).toLowerCase() == "gm" &&  escape(obj.suppliedUnit.toLowerCase()) == "gram"){
                               var remainingBalance = fgdata[0].balance - obj.suppliedQty;
                            }

                             if(escape(fgdata[0].balanceUnit).toLowerCase() !== "kg" ||  escape(obj.suppliedUnit.toLowerCase()) !== "gram"){
                               var remainingBalance = fgdata[0].balance - obj.suppliedQty;
                            }
                        }


                       // compare and update raw material stock
                       if(fgdata[0].balance >= obj.suppliedQty){
                         // var remainingBalance = fgdata[0].balance - obj.suppliedQty;
                         obj.finishedGoods = obj;
                         obj.balance = remainingBalance;
                         franchiseDistArray = {"Date":deliveryDate,"ItemCode":obj.itemCode,"Quantity":obj.suppliedQty,"Unit":obj.suppliedUnit};
                            FinishedGoods.update(
                            {    _id:fgdata[0]._id},  
                            {
                                 $set:   {'balance': remainingBalance} ,
                                 $push:  {'franchiseDistArray' : franchiseDistArray }                         
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
                            var remainFcQty =  obj.suppliedQty - fgdata[0].balance;
                            var remainingBalance = 0;
                            franchiseDistArray = {"Date":deliveryDate,"ItemCode":obj.itemCode,"Quantity":fgdata[0].balance,"Unit":obj.suppliedUnit};
                            FinishedGoods.updateOne(
                            {    _id:fgdata[0]._id},  
                            {
                                 $set:   {'balance': remainingBalance} ,
                                 $push:  {'franchiseDistArray' : franchiseDistArray }                         
                            })
                            .then(data=>{
                               FgUpObj = {"date":deliveryDate,"ItemCode":obj.itemCode,"OutwardRawMaterial":remainFcQty,"OutwardUnit":obj.suppliedUnit};
                                if(data.nModified == 1){
                                    if(remainFcQty != 0){
                                         var updateOtherFgentriesObj = updateOtherFgentries(FgUpObj);
                                         if(updateOtherFgentriesObj){

                                         }else{
                                            console.log("err");
                                         }
                                    }
                                    resolve(data);
                                }else{
                                    resolve(data);
                                }
                            })
                            .catch(err =>{ reject(err); });
                            resolve(0);
                        }   
                   })
                   .catch(err =>{
                       console.log(err);
                       reject(err);
                   });
                
               }
               
        }
    })
}

var updateOtherFgentries = async (data) => {
    // console.log('Data',data);
    return new Promise(function(resolve,reject){ 
        updateOtherFgControl();
        async function updateOtherFgControl(){
            manage_finished_goods(data)
        }
    })
}


exports.finish_goods_current_stock = (req,res,next) => {
    FinishedGoods.find({ItemCode : req.params.itemcode,balance: { $gt: 0 }})
     .then(data=>{
            var balanceArray = [];
            var balanceUnitArray = [];
            var balanceUnit;
            var finalArray = [];
            var finalStock = [];
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

            let stock = balanceUnitArray.reduce(function(prev, current) {
                   finalArray.push({"totalStock":current})
                return finalArray;
            }, 0);

            var total = 0;
            finalArray.forEach(item => {
                total += item.totalStock;
            });
            res.status(200).json([{"totalStock":total,"StockUnit":balanceUnit}]);   
       
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    }); 
}





