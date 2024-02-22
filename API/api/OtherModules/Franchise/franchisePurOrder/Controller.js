const mongoose       = require("mongoose");
var   ObjectId       = require('mongodb').ObjectID;
const EntityMaster   = require('../../../coreAdmin/entityMaster/ModelEntityMaster');
const FranchiseDelivery = require('../../distributionManagement/franchiseDelivery/Model');
const FinishedGoods = require('../../PurchaseManagement/models/FinishedGoodsEntry');

const FranchisePO   = require('./Model');


exports.insert_franchisePO = (req,res,next)=>{    

    FranchisePO.find({})
    .sort({createdAt: -1})
    .exec()
    .then(data=>{
        if(data && data.length > 0){
            if (data[0].orderNo) {
                var orderNo = data[0].orderNo + 1;
            }else{
                var orderNo = 1000;
            }
        }else{
          var orderNo = 1000;
        }
        const franchisePO = new FranchisePO({
            _id                       : new mongoose.Types.ObjectId(), 
            franchise_id              : req.body.franchise_id, 
            companyID                 : req.body.companyID, 
            orderDate                 : req.body.orderDate, 
            orderItems                : req.body.orderItems,
            orderNo                   : orderNo,
            createdBy                 : req.body.user_id,
            createdAt                 : new Date()
        });

        franchisePO.save()
                .then(data => {
                    res.status(200).json({
                        "message"  : "Franchise Purchase Order Submitted Successfully",
                        "order_id" : data._id,
                        "franchise_id" : data.franchise_id,
                    });
                })
                .catch(err =>{
                    console.log("err0",err);
                    res.status(500).json({
                        error: err
                    });
                })
    })
    .catch(err =>{
        res.status(500).json({error:err})
    });  
    
};

exports.update_franchisePO = (req,res,next)=>{
    /* req.body = {
            purchaseorder_id : xxx,
            orderDate : "2020-06-06",
            orderItems : [
                {productID:xxx,itemCode:xxx,productName:xxx,orderedQty:xxx, units:xxx, suppliedQty: 0, status:xxx },
                {productID:xxx,itemCode:xxx,productName:xxx,orderedQty:xxx, units:xxx, suppliedQty: 0, status:xxx },
                {productID:xxx,itemCode:xxx,productName:xxx,orderedQty:xxx, units:xxx, suppliedQty: 0, status:xxx },
                {productID:xxx,itemCode:xxx,productName:xxx,orderedQty:xxx, units:xxx, suppliedQty: 0, status:xxx },
                {productID:xxx,itemCode:xxx,productName:xxx,orderedQty:xxx, units:xxx, suppliedQty: 0, status:xxx },
            ],
            user_id : xxx,
    } */
    // console.log("req.params=>",req.body);


    FranchisePO.updateOne( 
        { _id: req.body.purchaseorder_id }, 
        {
            $set: {
                orderDate                 : req.body.orderDate, 
                orderItems                : req.body.orderItems,
            },
            $push: {updateLog : {updatedBy : req.body.user_id, updatedAt : new Date() }  }
        },
    )
    .then(data =>{
        if(data.nModified == 1){
            res.status(200).json({
                "message": "Purchase Order Updated Successfully.",
            });
        }else{
            res.status(401).json({
                "message": "Purchase Order " + req.body.purchaseorder_id + " Not Found"
            });
        }
    })
    .catch(err =>{
        console.log("err1",err);
        res.status(500).json({
            error: err
        });
    });
};

exports.update_franchisePOitem = (req,res,next)=>{
    /* req.body = {
            purchaseorder_id : xxx,
            item : {productID:xxx,itemCode:xxx,productName:xxx,orderedQty:xxx, units:xxx, suppliedQty: 0, status:xxx },
            user_id : xxx,
    } */

    FranchisePO.findOne({_id : req.body.purchaseorder_id})
    .then(purchaseorder => {
        var orderItems = purchaseorder.orderItems;
        var index = orderItems.findIndex(item => item.itemCode == req.body.item.itemCode);
        orderItems[index].status = req.body.item.status;

        FranchisePO.updateOne( 
            { _id: req.body.purchaseorder_id }, 
            {
                $set: {orderItems : orderItems, },
                $push: {updateLog : {updatedBy : req.body.user_id, updatedAt : new Date() }  }                
            }
        )
        .then(data =>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Purchase Order ItemCode "+ req.body.item.itemCode +" Status Updated Successfully.",
                });
            }else{
                res.status(401).json({
                    "message": "Purchase Order " + req.body.purchaseorder_id + " Not Found"
                });
            }
        })
        .catch(err =>{
            console.log("err1",err);
            res.status(500).json({
                error: err
            });
        });

    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.update_franchisePOaccept = (req,res,next)=>{
    /* req.body = {
            purchaseorder_id : xxx,
            user_id : xxx,
    } */

    FranchisePO.findOne({_id : req.body.purchaseorder_id})
    .then(purchaseorder => {
        var orderItems = purchaseorder.orderItems.map( orderItem => {orderItem.status = "Accepted"});
        
        FranchisePO.updateOne( 
            { _id: req.body.purchaseorder_id }, 
            {
                $set: {orderItems : orderItems, },
                $push: {updateLog : {updatedBy : req.body.user_id, updatedAt : new Date() }  }                
            }
        )
        .then(data =>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Purchase Order "+ req.body.purchaseorder_id +" Status Updated Successfully.",
                });
            }else{
                res.status(401).json({
                    "message": "Purchase Order " + req.body.purchaseorder_id + " Not Found"
                });
            }
        })
        .catch(err =>{
            console.log("err1",err);
            res.status(500).json({
                error: err
            });
        });

    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });   
};


exports.list_franchisePO = (req,res,next)=>{
    var franchise_id = req.params.franchise_id;
    var orderDate    = req.params.orderDate;

    FranchisePO
        .find({
                franchise_id : franchise_id, 
                orderDate : new Date(orderDate)
            })       
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
// exports.allorder_franchise = (req,res,next)=>{
//     FranchisePO
//         .find({})       
//         .then(data=>{
//             console.log("res prodlist====>",data);
//             res.status(200).json(data);
//         })
//         .catch(err =>{
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
// };
// exports.allorder_franchise = (req,res,next)=>{
//     FranchisePO.aggregate([
//         {
//         $lookup:
//             {
//                from: "entitymasters",
//                localField: "franchise_id",
//                foreignField: "_id",
//                as: "franchiseData"
//             }
//         },
//         { "$unwind": "$franchiseData" },{$addFields: { companyname : "$franchiseData.companyname"} }])
//             .sort({createdAt : -1})
// 			.skip(req.body.startRange)
// 			.limit(req.body.limitRange)
// 			.exec()
//             .then(data=>{
//                 var alldata = data.map((a, i)=>{
//                         return {
//                             "_id"             : a._id,
//                             "orderNo"         : a.orderNo,
//                             "orderDate"       : a.orderDate,
//                             "orderItems"      : a.orderItems,
//                             "orderItemsqty"   : a.orderItems.length,
//                             "franchiseName"	  : companyname,
//                         }
//                 })
//                 console.log("aaaa==> ",alldata);
//                 res.status(200).json(data);
//             })
//             .catch(err =>{}); 
        
// };
exports.allorder_franchise = (req,res,next)=>{
    // console.log("req.body.date",req.body.date)
        FranchisePO.find({orderDate:req.body.date})
			.sort({createdAt : -1})
			.skip(req.body.startRange)
			.limit(req.body.limitRange)
			.exec()
			.then(data=>{
                main();
                async function main(){
                    if(data){
                        var i = 0;
                        var returnData = [];
                        var DistData = [];
                        for(i = 0 ; i < data.length ; i++){
                            var AllUnits = "";
                         
                            AllUnits = await entityID(data[i].franchise_id);
                            DistributionData = await franchiseDelivery(data[i]._id);

                            DistributionData.forEach((item)=>{  
                             // do something with each item  
                             DistData.push(item.supply[0]); 
                             // console.log("item",item.supply[0]);
                            });

                            returnData.push({
                                "_id"		      : data[i]._id,
                                "orderNo"         : data[i].orderNo,
                                "orderDate"       : data[i].orderDate,
                                "orderItems"      : data[i].orderItems,
                                "orderItemsqty"   : data[i].orderItems.length,
                                "franchiseName"	  : AllUnits.length > 0 || AllUnits.length !== null ? AllUnits : null,
                                "distributionData": DistData.length > 0 || DistData.length !== null ? DistData : null,
                            });
                        }
                        // console.log('data in returnData ==>',returnData);
                        if( i >= data.length){
                            res.status(200).json(returnData);
                        }
                    }else{
                        res.status(200).json({message:"USER_NOT_FOUND"});
                    }
                }
			})
			.catch(err =>{
				res.status(500).json({
					error: err
				});
			});
};

function entityID(franchise_id){
    return new Promise(function(resolve,reject){ 
        EntityMaster.find({ _id: franchise_id })
        .exec()
        .then(res=>{
            
            // console.log('res in EntityMaster ==>',res);
            resolve(res);
        })
        .catch(err =>{
            // res.status(500).json({ error: err });
            reject(err);
        }); 
    });
};

function franchiseDelivery(po_id){
    // console.log("po_id",po_id);
    return new Promise(function(resolve,reject){ 
        FranchiseDelivery.find({ franchisePO_id: po_id })
        .exec()
        .then(res=>{
            // console.log('res in franchiseGoods ==>',res);
            resolve(res);
        })
        .catch(err =>{
            // res.status(500).json({ error: err });
            reject(err);
        }); 
    });
};

exports.franchise_Wise_order = (req,res,next)=>{
    FranchisePO.find({franchise_id : req.params.franchise_id})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            main();
            async function main(){
                if(data){
                    var i = 0;
                    var returnData = [];
                    for(i = 0 ; i < data.length ; i++){
                        var AllUnits = "";
                        var DistData = [];
                        AllUnits = await franchiseentityID(data[i].franchise_id);
                        DistributionData = await franchiseDelivery(data[i]._id);
                        DistributionData.forEach((item)=>{  
                            DistData.push(item.supply[0]); 
                        });

                        returnData.push({
                            "_id"             : data[i]._id,
                            "orderNo"         : data[i].orderNo,
                            "orderDate"       : data[i].orderDate,
                            "orderItems"      : data[i].orderItems,
                            "orderItemsqty"   : data[i].orderItems.length,
                            "franchiseName"   : AllUnits.length > 0 || AllUnits.length !== null ? AllUnits : null,
                            "distributionData": DistData.length > 0 || DistData.length !== null ? DistData : null,
                        });
                     
                    }
                    // console.log('data in returnData ==>',returnData);
                    if( i >= data.length){
                        res.status(200).json(returnData);
                    }
                }else{
                    res.status(200).json({message:"USER_NOT_FOUND"});
                }
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};
function franchiseentityID(franchise_id){
    return new Promise(function(resolve,reject){ 
        EntityMaster.find({ _id: franchise_id })
        .exec()
        .then(res=>{
            
            // console.log('res in EntityMaster ==>',res);
            resolve(res);
        })
        .catch(err =>{
            // res.status(500).json({ error: err });
            reject(err);
        }); 
    });
};
exports.order_franchise = (req,res,next)=>{
    var franchise_id = req.params.franchise_id;
    // console.log("franchise_id==>",franchise_id);
    FranchisePO
        .find({
                franchise_id : franchise_id,
            })       
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
exports.search_PO = (req, res, next)=>{
	// console.log("req.body in search==>",req.body.searchText);
	FranchisePO.aggregate([
		{$match:
			{$or:
			  [
				{ "orderNo"	: { "$regex": req.body.searchText, $options: "i" } },
			  ]
			}
		},
	])
	.exec()
	.then(data=>{
        // console.log("Data in search==>",data)
        main();
        async function main(){
            if(data){
                var i = 0;
                var returnData = [];
                for(i = 0 ; i < data.length ; i++){
                    var AllUnits = ""
                    AllUnits = await franchiseentityID(data[i].franchise_id);
                    // console.log('data in AllUnits ==>',AllUnits.length > 0 || AllUnits.length !== null ? AllUnits : null);
                    returnData.push({
                        "_id"		      : data[i]._id,
                        "orderNo"         : data[i].orderNo,
                        "orderDate"       : data[i].orderDate,
                        "orderItems"      : data[i].orderItems,
                        "orderItemsqty"   : data[i].orderItems.length,
                        "franchiseName"	  : AllUnits.length > 0 || AllUnits.length !== null ? AllUnits : null,
                        
                    });
                }
                // console.log('data in returnData ==>',returnData);
                if( i >= data.length){
                    res.status(200).json(returnData);
                }
            }else{
                res.status(200).json({message:"USER_NOT_FOUND"});
            }
        }
	})
	.catch(err=>{
		res.status(500).json({
			error : err
		})
	})
}
function franchiseentityID(franchise_id){
    return new Promise(function(resolve,reject){ 
        EntityMaster.find({ _id: franchise_id })
        .exec()
        .then(res=>{
            
            // console.log('res in EntityMaster ==>',res);
            resolve(res);
        })
        .catch(err =>{
            // res.status(500).json({ error: err });
            reject(err);
        }); 
    });
};

exports.list_allfranchisePO = (req,res,next)=>{
   var orderDate    = req.params.orderDate;
   FranchisePO.aggregate([
        {$match : { orderDate : new Date(orderDate)}},
        {$lookup: {from: "entitymasters",localField: "franchise_id",foreignField: "_id",as: "franchiseData"}},
   ])
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

exports.allFrachisePOData = (req,res,next)=>{   
    var orderDate    = req.params.orderDate;
    FranchisePO
        .find({ orderDate : new Date(orderDate) })       
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

exports.one_franchisePO = (req,res,next)=>{
    var purchaseorder_id    = req.params.purchaseorder_id;
    FranchisePO
        .findOne({_id : purchaseorder_id})
        .then(data=>{
            main();
            async function main(){
                if(data){
                    var returnData = {};
                    var DistData = [];

                    // console.log('data in     ==>',data);
                    AllUnits             = await franchiseid(data.franchise_id);
                    DistributionData     = await franchiseDelivery(data._id);
                    // console.log('data in AllUnits ==>',AllUnits);
                        for(let obj of data.orderItems) {
                          currentStock = await getFgCurrentStock(obj.itemCode);
                          obj.currentStock = currentStock[0].totalStock;
                          obj.currentStockUnit = currentStock[0].StockUnit;
                        }

                        DistributionData.forEach((item)=>{  
                             // do something with each item  
                             DistData.push(item.supply[0]); 
                             // console.log("item",item.supply[0]);
                        });

                        returnData={
                            "_id"		      : data._id,
                            "orderNo"         : data.orderNo,
                            "orderDate"       : data.orderDate,
                            "orderItems"      : data.orderItems,
                            "orderItemsqty"   : data.orderItems.length,
                            "franchiseName"	  : AllUnits.length !== "undefined" || undefined || null ? AllUnits :null,
                            "DistributionData": DistData !== "undefined" || undefined || null ? DistData :null 
                        };
                    res.status(200).json(returnData);
                }else{
                    res.status(200).json({message:"USER_NOT_FOUND"});
                }
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });    
};

function franchiseid(franchise_id){
    return new Promise(function(resolve,reject){ 
        EntityMaster.find({ _id: franchise_id })
        .exec()
        .then(res=>{
            
            // console.log('res in EntityMaster ==>',res);
            resolve(res);
        })
        .catch(err =>{
            // res.status(500).json({ error: err });
            reject(err);
        }); 
    });
};
exports.delete_franchisePO = (req,res,next)=>{
    // console.log("req.params.purchaseorder_id",req.params.purchaseorder_id);
    var purchaseorder_id    = req.params.purchaseorder_id;

    FranchisePO
        .remove({_id : purchaseorder_id})
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

function getFgCurrentStock(itemcode){
    return new Promise(function(resolve,reject){ 
      FinishedGoods.find({"ItemCode" : itemcode,balance: { $gt: 0 }})
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
           resolve([{"totalStock":total,"StockUnit":balanceUnit}]);   
       
    })
    .catch(err =>{
       reject(err);
    }); 
    });
};

exports.count_order = (req, res, next) => {
  var selector = {};
  var franchise_id = req.params.franchise_id ? req.params.franchise_id : ''
  if(franchise_id){
    selector = {"franchise_id":franchise_id}
  }
  FranchisePO.find(selector)
    .exec()
    .then(data => {
      res.status(200).json({ "dataCount": data.length });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};