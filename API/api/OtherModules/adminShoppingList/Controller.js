const mongoose      = require("mongoose");
var   ObjectId      = require('mongodb').ObjectID;
const AdminPO       = require('./Model');


exports.insert_adminPO = (req,res,next)=>{    
        const adminPO = new AdminPO({
            _id                       : new mongoose.Types.ObjectId(), 
            orderDate                 : req.body.orderDate, 
            orderItems                : req.body.orderItems,
            createdBy                 : req.body.user_id,
            createdAt                 : new Date()
        });
        // console.log("req.body orderNo = ",req.body);

        adminPO.save()
        .then(data => {
            res.status(200).json({
                "message"  : "Admin Purchase Order Submitted Successfully",
                "order_id" : data._id
            });
        })
        .catch(err =>{
            console.log("err0",err);
            res.status(500).json({
                error: err
            });
        })
  
    };

exports.update_adminPO = (req,res,next)=>{
    /* req.body = {
            purchaseorder_id : xxx,
            orderDate : "2020-06-06",
            orderItems : [
                {productID:xxx,itemCode:xxx,productName:xxx,totalOrder:xxx,currentStock:xxx, purchaseOrder:xxx, actualPurchase:xxx, units:xxx, },
                {productID:xxx,itemCode:xxx,productName:xxx,totalOrder:xxx,currentStock:xxx, purchaseOrder:xxx, actualPurchase:xxx, units:xxx, },
                {productID:xxx,itemCode:xxx,productName:xxx,totalOrder:xxx,currentStock:xxx, purchaseOrder:xxx, actualPurchase:xxx, units:xxx, },
                
            ],
            user_id : xxx,
    } */
    // console.log("req.params=>",req.body);


    AdminPO.updateOne( 
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


exports.list_adminPO = (req,res,next)=>{
    var franchise_id = req.params.franchise_id;
    var orderDate    = req.params.orderDate;

    AdminPO
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

exports.one_adminPO = (req,res,next)=>{
    var purchaseorder_id    = req.params.purchaseorder_id;

    AdminPO
        .findOne({_id : purchaseorder_id})
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

exports.delete_adminPO = (req,res,next)=>{
    // console.log("req.params.purchaseorder_id",req.params.purchaseorder_id);
    var purchaseorder_id    = req.params.purchaseorder_id;

    AdminPO
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