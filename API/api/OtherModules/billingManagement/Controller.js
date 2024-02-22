const mongoose      = require("mongoose");
const _             = require("underscore");
const Products      = require('../products/Model');
const Category      = require('../categories/Model');
const Sections      = require('../sections/Model');
const Orders        = require('../orders/Model');
const Carts         = require('../cart/Model');
const EntityMaster  =  require('../../coreAdmin/entityMaster/ModelEntityMaster');
var   ObjectId        = require('mongodb').ObjectID;
const franchisegoods = require('../distributionManagement/Model');
const ReturnedProducts      = require('../ReturnedProducts/Model');
const FranchiseCustomers      = require('./CustomerModal');

exports.list_products_by_category = (req,res,next)=>{
    Products.find({category_ID : req.params.categoryID, "status": "Publish"})
    .exec()
    .then(data=>{
        main();
        async function main(){
          for(i = 0 ; i < data.length ; i++){
             var franchiseStock = await get_current_stock_of_franchise(data[i].itemCode,req.params.franchiseId);
             data[i].availableQuantity = franchiseStock.totalStock ? franchiseStock.totalStock : 0;
          }
        res.status(200).json(data);
       }

    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

function get_current_stock_of_franchise(itemcode,franchiseId){
     return new Promise(function(resolve,reject){ 
     franchisegoods.find({itemCode : itemcode,franchise_id:franchiseId,balance: { $gt: 0 }})
     .then(data=>{
            var balanceArray = [];
            var balanceUnitArray = [];
            var balanceUnit;
            var finalArray = [];
            data.filter(function(item,index){
                balanceArray.push({"balance" :item.balance,"unit":item.unit});
            });

            balanceArray.filter(function(item,index){
                if(item.unit === "Kg"){
                    balanceUnitArray.push(item.balance);
                    balanceUnit = "Kg"
                }else{
                    if(item.unit == "Gm"){
                        var converToKG = item.balance/1000;
                        balanceUnitArray.push(converToKG);
                        //converted to kg so balanceunit is kg only
                        balanceUnit = "Kg";
                    }else{
                        balanceUnitArray.push(item.balance);
                        balanceUnit = item.unit;
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


exports.list_product_by_section = (req,res,next)=>{
    Products.find({section_ID : req.params.sectionID, "status": "Publish"})
    .exec()
    .then(data=>{
        main();
        async function main(){
          for(i = 0 ; i < data.length ; i++){
            // console.log("franchiseStock",data[i]);
             var franchiseStock = await get_current_stock_of_franchise(data[i].itemCode,req.params.franchiseId);
             // console.log("franchiseStock",franchiseStock);
             data[i].availableQuantity = franchiseStock.totalStock ? franchiseStock.totalStock : 0;
          }
        res.status(200).json(data);
       }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};


//generate bill number 
exports.generate_bill_number = (req,res,next)=>{
    var franchiseId = req.params.companyId;
    Carts.countDocuments()
        .exec()
        .then(cartData =>{
            //console.log("cartData",cartData);
            var maxId = 1;
            Orders.countDocuments()
            .exec()
            .then(orderData =>{
               // console.log("orderData",orderData);
                let calenderYear = new Date().getFullYear();
                if(Number(cartData) > Number(orderData)) {
                   maxId = cartData + 1;
                } 
                if(Number(orderData) > Number(cartData)){
                    maxId = orderData + 1;
                } 
                if(Number(orderData) === Number(cartData)){
                    maxId = orderData + 1;
                }

                let str = maxId.toString().padStart(5, "0");

                let billNum = franchiseId + calenderYear + str;
                res.status(200).json(billNum); 
                    
            })
            .catch(err =>{
                res.status(500).json({
                    error: err
                });
            });
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};


exports.list_product = (req,res,next)=>{
    Products.find({"status": "Publish"}).sort({'itemCode': 1})       
    .exec()
    .then(data=>{
       main();
        async function main(){
          for(i = 0 ; i < data.length ; i++){
             var franchiseStock = await get_current_stock_of_franchise(data[i].itemCode,req.params.franchiseId);
             data[i].availableQuantity = franchiseStock.totalStock ? franchiseStock.totalStock : 0;

          }
          const result = data.filter(product => product.availableQuantity !== 0);
          res.status(200).json(result);
       }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.getCompany = (req,res,next)=>{
  EntityMaster.find({"companyID":req.params.companyID})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.getListBill = (req,res,next)=>{
    // console.log("allocatedToFranchise id",req.params.franchise_id)
  Orders.find({allocatedToFranchise:ObjectId(req.params.franchise_id),billNumber:{ $exists: true, $ne: null }})
    .exec()
    .then(data=>{
        // console.log("getListBill",data);
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.returned_products = (req,res,next)=>{
    ReturnedProducts.find({"orderID":req.params.orderID})
    .populate('orderID')
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

//save returned products

exports.save_returned_products = (req,res,next)=>{
    var obj = {"orderNum":req.body.altorderid,"returnDate":new Date(),"returnQty":req.body.returnProductArray.quantity,"Unit":req.body.returnProductArray.unit, "orderStatus":"Returned"}
    var franchise_id = req.body.franchise_id;
    var ProductId    = req.body.productID;
    var returnProductObj = req.body.returnProductArray;
    returnProductObj.reasonForReturn = req.body.reasonForReturn;
    returnProductObj.paymentMethod = req.body.paymentMethod;

    Orders.updateOne(
        { _id: req.body.orderID,"products.product_ID": ObjectId(req.body.productID)},  
        {
            $push:  { 'returnedProduct' : returnProductObj },
            $set:   { 'products.$.status' : 'Returned', 'products.$.returnedDate'   : new Date()}
        },
    )
    .exec()
    .then(data=>{
        main();
        async function main(){
            var franchiseGoodsOrder =   await addOrderToFranchiseGoods(ProductId,obj,franchise_id);
        }

        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({error: err});
    });
};


function addOrderToFranchiseGoods(productId,obj,franchise_id) {   
      return new Promise(function(resolve,reject){
             franchisegoods.find({productId : productId,balance: { $gt: 0 },franchise_id:franchise_id})
              .sort({createdAt : 1})
              .limit(1)
              .then(fgdata=>{
                    if(fgdata[0].unit.toLowerCase() == obj.Unit.toLowerCase()){
                            var remainingBalance = fgdata[0].balance - obj.returnQty;
                    }else{
                            //if units are different
                            if((fgdata[0].unit.toLowerCase() == 'kg' || fgdata[0].unit.toLowerCase() == 'kilogram') && (obj.Unit.toLowerCase() == "gm" || obj.Unit.toLowerCase() == "gram")){
                                //convert raw material gram to kg formula kg=gm/1000
                               var convertToKg            = obj.returnQty/1000;
                               obj.returnQty = convertToKg;
                               obj.Unit        = fgdata[0].unit
                               var remainingBalance       = fgdata[0].balance - convertToKg;          
                            }
                            if((fgdata[0].unit.toLowerCase() == 'gm' || fgdata[0].unit.toLowerCase() == 'gram') && (obj.Unit.toLowerCase() == "kg" || obj.Unit.toLowerCase() == "kilogram")){
                                //convert raw material kg to gram formula g=kg*1000
                                var convertToGram          = obj.returnQty*1000;
                                obj.returnQty = convertToGram;
                                obj.Unit        = fgdata[0].unit
                                var remainingBalance       = fgdata[0].balance - convertToGram;
                            }
                            if(fgdata[0].unit.toLowerCase() == "kg" &&  obj.Unit.toLowerCase() == "kilogram"){
                               var remainingBalance = fgdata[0].balance - obj.returnQty;
                            }

                             if(fgdata[0].Unit.toLowerCase() == "gm" &&  obj.Unit.toLowerCase() == "gram"){
                               var remainingBalance = fgdata[0].balance - obj.returnQty;
                            }

                             if(fgdata[0].unit.toLowerCase() !== "kg" ||  obj.Unit.toLowerCase() !== "gram"){
                               var remainingBalance = fgdata[0].balance - obj.returnQty;
                            }
                    }

                    // compare and update raw material stock
                       if(fgdata[0].balance >= obj.returnQty){
                         // var remainingBalance = fgdata[0].balance - obj.Quantity;
                         obj.finishedGoods = obj;
                         obj.balance = remainingBalance;

                         orders = {"orderNum":obj.orderNum,"returnDate":obj.returnDate,"ProductId":productId,"returnQty":obj.returnQty,"Unit":obj.Unit};
                            franchiseGoods.update(
                            {    _id:fgdata[0]._id},  
                            {
                                 $set:   {'balance': remainingBalance} ,
                                 $push:  {'returnedOrders' : orders }                         
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
                            var remainFcQty =  obj.returnQty - fgdata[0].balance;
                            var remainingBalance = 0;
                            orders = {"orderNum":obj.orderNum,"returnDate":obj.returnDate,"ProductId":productId,"returnQty":fgdata[0].balance,"Unit":obj.Unit};
                            franchisegoods.updateOne(
                            {    _id:fgdata[0]._id},  
                            {
                                 $set:   {'balance': remainingBalance} ,
                                 $push:  {'returnedOrders' : orders }                         
                            })
                            .then(data=>{
                               PoUpObj = {"orderNum":obj.orderNum,"returnDate":obj.returnDate,"ProductId":productId,"returnQty":remainFcQty,"Unit":obj.Unit};
                                if(data.nModified == 1){
                                    if(remainFcQty != 0){
                                         var updateOtherPoObj = updateOtherFranchiseGoods(itemCode,PoUpObj);
                                         if(updateOtherPoObj){

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
                   reject(err);
              });
      });
}

var updateOtherFranchiseGoods = async (itemCode,obj) => {
    // console.log('Data',data);
    return new Promise(function(resolve,reject){ 
        updateOtherfgControl();
        async function updateOtherfgControl(){
            addOrderToFranchiseGoods(itemCode,obj)
        }
    })
}

exports.save_customer = (req,res,next)=>{
    FranchiseCustomers.find({mobile:req.body.mobile})
    .exec()
    .then(data=>{
        if(data.length > 0){
             FranchiseCustomers.updateOne(
                { _id:data[0]._id},  
                {
                    $set:{
                        customerName              : req.body.Name,
                        mobile                    : req.body.mobile,
                        email                     : req.body.email,
                        houseNo                   : req.body.houseNo,
                        address                   : req.body.address, 
                        pincode                   : req.body.pincode
                    }

                },

            )
            .exec()
            .then(updateData=>{
                FranchiseCustomers.find({_id:data[0]._id})
                .exec()
                .then(data=>{
                    res.status(200).json({"customerData" : data[0], "message": "Customer Updated Successfully." });
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
           
        }else{
            const franchiseCustomers  = new FranchiseCustomers({
                _id                       : new mongoose.Types.ObjectId(),  
                franchise_id              : req.body.franchise_id,                  
                customerName              : req.body.Name,
                mobile                    : req.body.mobile,
                email                     : req.body.email,
                houseNo                   : req.body.houseNo,
                address                   : req.body.address,
                createdBy                 : req.body.createdBy,
                pincode                   : req.body.pincode,
                createdAt                 : new Date()
            });
            franchiseCustomers.save()
                .then(data=>{
                    res.status(200).json({
                        "customerData" : data,
                        "message": "Customer added Successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
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

exports.get_customers = (req,res,next)=>{
    FranchiseCustomers.find({"franchise_id":req.params.franchise_id})
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

exports.customers_count = (req,res,next)=>{
    FranchiseCustomers.find({"franchise_id": req.params.franchise_id})  
        .exec()
        .then(data=>{
            res.status(200).json({dataCount: data.length});
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.contact_persons_count = (req,res,next)=>{
    EntityMaster.find({"_id":ObjectId(req.params.franchise_id)})  
        .exec()
        .then(data=>{
            console.log("contact_persons_count",data);
            res.status(200).json({dataCount: data[0].contactPersons.length});
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};




