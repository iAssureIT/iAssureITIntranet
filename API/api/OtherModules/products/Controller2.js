const mongoose      = require("mongoose");
const Products      = require('./Model');
const FinishedGoods = require('../PurchaseManagement/models/FinishedGoodsEntry.js');
const FranchiseGoods = require('../distributionManagement/Model');

var   ObjectId      = require('mongodb').ObjectID;

//for admin
exports.getfranchisestock = (req,res,next)=>{
    Products.find({})
            .then(products=>{
                FinishedGoods
                    .aggregate([
                        {"$match" : {"balance" : {"$gt" : 0 } } },
                        {"$group" : {
                                    "_id": {"prodcode" : "$ProductCode", "itemcode" : "$ItemCode","fgUnitQty" : "$fgUnitQty","fgUnitWt" : "$fgUnitWt"},
                                    "total": {$sum: "$balance"}
                         }}
                    ])
                    .then(finGoods=>{
                        // console.log("finGoods =====> ",finGoods);
                        var franchiseStock = [];

                        products.forEach((element)=>{
                            let pCode = element.productCode ;
                            let pId = element._id ;
                            let iCode = element.itemCode ;
                            let currentStock = 0;
                            let fgUnitQty = '';
                            let fgUnitWt = '';
                            //Search in finGoods array
                            let obj = finGoods.find(o => o._id.prodcode === pCode && o._id.itemcode === iCode);
                            
                            if(typeof obj !== "undefined"){
                                // console.log("if obj = ",obj.total);
                                currentStock = obj.total;
                                fgUnitQty    = obj._id.fgUnitQty;
                                fgUnitWt     = obj._id.fgUnitWt;
                            }

                            franchiseStock.push({
                                                productId    : pId,
                                                productCode  : pCode,
                                                itemCode     : iCode,
                                                productName  : element.productName,
                                                currentStock : currentStock, 
                                                unit         : element.unit,
                                                section      : element.section,
                                                category     : element.category,
                                                subcategory  : element.subcategory,
                                                fgUnitQty    : fgUnitQty,
                                                fgUnitWt     : fgUnitWt
                            });


                        });

                        if(franchiseStock.length > 0){
                            // console.log("franchiseStock = ",franchiseStock);
                            res.status(200).json(franchiseStock);                            
                        }
                    })
                    .catch(err =>{
                        console.log(err);
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

//for franchise
//"fgUnitQty" : "$fgUnitQty","fgUnitWt" : "$fgUnitWt"
exports.getFranchiseCurrentStock = (req,res,next)=>{
    Products.find()
            .then(products=>{
                FranchiseGoods
                    .aggregate([
                        {"$match" : {"balance" : {"$gt" : 0 },"franchise_id":req.params.franchise_id }},
                        {"$group" : {
                                    "_id": {"prodcode" : "$productCode", "itemcode" : "$itemCode"},
                                    "total": {$sum: "$balance"}
                         }}
                    ])
                    .then(finGoods=>{
                      //  console.log("finGoods fs=====> ",finGoods);
                      FinishedGoods
                      .aggregate([
                          {"$group" : {
                                      "_id": {"prodcode" : "$ProductCode", "itemcode" : "$ItemCode","fgUnitQty" : "$fgUnitQty","fgUnitWt" : "$fgUnitWt"},
                           }}
                      ])
                      .then(FinishedGoods=>{

                        var franchiseStock = [];

                        products.forEach((element)=>{
                            let pCode = element.productCode ;
                            let pId = element._id ;
                            let iCode = element.itemCode ;
                            let currentStock = 0;
                            let fgUnitQty = '';
                            let fgUnitWt = '';
                            //Search in finGoods array
                            let obj = FinishedGoods.find(o => o._id.prodcode === pCode && o._id.itemcode === iCode);
                            let obj2 = finGoods.find(o => o._id.prodcode === pCode && o._id.itemcode === iCode);

                            if(typeof obj !== "undefined"){
                               // console.log("if obj fs= ",obj.total);
                               if(typeof obj2 !== "undefined"){
                                 currentStock = obj2.total;
                               }else{
                                  currentStock = 0;

                               }
                                fgUnitQty    = obj._id.fgUnitQty ? obj._id.fgUnitQty : 0;
                                fgUnitWt     = obj._id.fgUnitWt ? obj._id.fgUnitWt : 'nan';
                            }

                            franchiseStock.push({
                                                productId    : pId,
                                                productCode  : pCode,
                                                itemCode     : iCode,
                                                productName  : element.productName,
                                                currentStock : currentStock, 
                                                unit         : element.unit,
                                                section      : element.section,
                                                category     : element.category,
                                                subcategory  : element.subcategory,
                                                fgUnitQty    : fgUnitQty,
                                                fgUnitWt     : fgUnitWt
                            });
                        });

                        if(franchiseStock.length > 0){
                            //console.log("franchiseStock fs= ",franchiseStock);
                            res.status(200).json(franchiseStock);                            
                        }

                      })
                      .catch(err =>{
                        console.log(err);
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
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
};