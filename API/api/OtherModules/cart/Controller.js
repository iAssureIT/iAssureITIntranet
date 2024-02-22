const mongoose	= require("mongoose");
var ObjectId    = require('mongodb').ObjectID;
const Carts     = require('../cart/Model');
const Orders    = require('../orders/Model');
const Wishlists = require('../wishlist/Model');
const _         = require('underscore');    
// import axios from 'axios';


exports.insert_cartid = (req,res,next)=>{
    // console.log("req.body===",req.body);
	Carts.findOne({"user_ID": req.body.user_ID})
		.exec()
		.then(cartData =>{
            if(cartData){
                Carts.findOne({"user_ID": req.body.user_ID, 'cartItems.product_ID':req.body.product_ID})
                .exec()
                .then(productData =>{
                    if(productData){
                        // req.body.quantity
                        Carts.updateOne(
                            {'_id':cartData._id,'cartItems.product_ID':req.body.product_ID},
                            {
                                $inc:{
                                    'cartItems.$.quantity':req.body.quantity,
                                    'cartItems.$.totalWeight':req.body.totalWeight,
                                },
                            }
                        )
                        .exec()
                        .then(data=>{
                            if(data.nModified == 1){
                                res.status(200).json({
                                    "message": "Product added to cart successfully.",
                                });
                            }else{
                                res.status(401).json({
                                    "message": "Cart Not Found 1"
                                });
                            }
                        })
                        .catch(err =>{
                            // console.log('1',err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    }else{
                        var cartArr = {
                            'product_ID' : req.body.product_ID,
                            'quantity'   : req.body.quantity,
                            'totalWeight': req.body.totalWeight,
                            'rate'       : req.body.rate ? req.body.rate : 0,
                            'discountPercent'  : req.body.discount ? req.body.discount : 0,
                            'discountedPrice'  : req.body.discountedPrice ? req.body.discountedPrice : 0,
                            'CGST'             : req.body.CGST,
                            'SGST'             : req.body.SGST,
                            'CGSTAmt'          : req.body.CGSTAmt,
                            'SGSTAmt'          : req.body.SGSTAmt
                        }
                        Carts.updateOne(
                            {'_id':cartData._id},
                            {
                                $push:{
                                    'cartItems' : cartArr,
                                },
                            }
                        )
                        .exec()
                        .then(data=>{
                            if(data.nModified == 1){
                                res.status(200).json({
                                    "message": "Product added to cart successfully.",
                                });
                            }else{
                                res.status(401).json({
                                    "message": "Cart Not Found 1"
                                });
                            }
                        })
                        .catch(err =>{
                            // console.log('2',err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    }
                })
                .catch(err =>{
                    // console.log('3',err);
                    res.status(500).json({
                        error: err
                    });
                });
            }else{
                var cartItems = [{
                    "product_ID"    : req.body.product_ID,
                    "quantity"      : req.body.quantity,
                    "totalWeight"   : req.body.totalWeight,
                    'rate'          : req.body.rate ? req.body.rate : 0,
                    'discountPercent'      : req.body.discount ? req.body.discount : 0,
                    'discountedPrice'       : req.body.discountedPrice ? req.body.discountedPrice : 0
                }];
                const cartDetails = new Carts({
                    _id             : new mongoose.Types.ObjectId(),  
                    "user_ID"       :   req.body.user_ID,
                    "cartItems"     :   cartItems,
                });
                cartDetails.save()
                .then(data=>{
                    res.status(200).json({
                        "message"   : "Product added to cart successfully.",
                        "cartCount" : 1
                    });
                })
                .catch(err =>{
                    // console.log('4',err);
                    res.status(500).json({
                        error: err
                    });
                });
                return true;
            }
		
	})
	.catch(err =>{
        // console.log('5',err);
		res.status(500).json({
			error: err
		});
	});
};


exports.list_cart = (req,res,next)=>{
    Carts.find({"user_ID": req.params.user_ID})       
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
// exports.list_cart_product = (req,res,next)=>{
//     // console.log(req.params.user_ID);
//     Carts.aggregate([
//         { "$match" : { "user_ID" : ObjectId(req.params.user_ID) } },
//         { "$unwind": "$cartItems" },
//         { "$lookup": {
//             "from": "products",
//             "as": "cartItems.productDetail",
//             "localField": "cartItems.product_ID",
//             "foreignField": "_id"
//         }},
//         { "$unwind": "$cartItems.productDetail" },
//         {
//             "$addFields": {
//                 "cartItems.subTotal": { "$sum": { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.discountedPrice" ] } },
//                 "cartItems.saving":  { "$divide": [{ "$multiply": [ { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.originalPrice" ] }, "$cartItems.productDetail.discountPercent" ]}, 100] } ,
//             }
//         },
//         { "$group": {
//             "_id": "$_id",
//             "paymentMethod":{ "$first": "$paymentMethod" },
//             "deliveryAddress":{ "$first": "$deliveryAddress" },
//             "cartItems": { "$push": "$cartItems" },
//             "cartTotal": { "$sum": { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.originalPrice" ] } },
//             "discount": { "$sum":{ "$divide": [{ "$multiply": [ { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.originalPrice" ] }, "$cartItems.productDetail.discountPercent" ]}, 100] }},
//             "total": { "$sum": { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.discountedPrice" ] } },
//             "cartQuantity":{ "$sum": "$cartItems.quantity" },
//             }
//         },
            
//     ])
//     .exec()
//     .then(data=>{
//         console.log("data",data);
//         if(data && data.length> 0 && data[0].cartItems){
//             for (let k = 0; k < data[0].cartItems.length; k++) {
//                 data[0].cartItems[k] = {...data[0].cartItems[k], isWish:false};
//             }
//             console.log("data[0].cartItems[k]",data[0]);
//             if(req.params.user_ID!=='null'){
//                 Wishlists.find({user_ID:req.params.user_ID})
//                 .then(wish=>{
//                     if(wish.length > 0){
//                         for(var i=0; i<wish.length; i++){
//                             for(var j=0; j<data[0].cartItems.length; j++){
//                                 if(String(wish[i].product_ID) === String(data[0].cartItems[j].product_ID)){
//                                     data[0].cartItems[j]= {...data[0].cartItems[j], isWish:true};
//                                     break;
//                                 }
//                             }
//                         }   
//                         if(i >= wish.length){
//                             res.status(200).json(data);
//                         }       
//                     }else{
//                         res.status(200).json(data);
//                     }
//                  })
//                  .catch(err =>{
//                     console.log(err);
//                     res.status(500).json({
//                         error: err
//                     });
//                 });
//             }else{
//                 res.status(200).json(data);
//             }    
//         }else{
//             res.status(200).json(data);
//         }
//     })
//     .catch(err =>{
//         console.log("err",err);
//         res.status(500).json({
//             error: err
//         });
//     });
// };


exports.list_cart_product = (req,res,next)=>{
    console.log("req.params.user_ID => ", req.params.user_ID);
    Carts.aggregate([
        { "$match"      : { "user_ID" : ObjectId(req.params.user_ID) } },
        { "$unwind"     : "$cartItems" },
        { "$lookup"     : {
                "from"          : "products",
                "as"            : "cartItems.productDetail",
                "localField"    : "cartItems.product_ID",
                "foreignField"  : "_id"
            }
        },
        { "$unwind" : "$cartItems.productDetail" },
        {
            "$addFields"    : {
                "cartItems.subTotal"    : { 
                    "$sum": { 
                        "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.discountedPrice" ] 
                    } 
                },
                "cartItems.saving" : { 
                    "$divide": [{ 
                        "$multiply": [ { 
                            "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.originalPrice" ] 
                        }, "$cartItems.productDetail.discountPercent" ]
                    }, 100] 
                } ,
            }
        },
        { "$group" : {
            "_id"               : "$cartItems.productDetail.vendor_ID",
            "vendorName"        : { "$first" : "$cartItems.productDetail.vendorName" },
            "paymentMethod"     : { "$first" : "$paymentMethod" },
            "deliveryAddress"   : { "$first" : "$deliveryAddress" },
            "cartItems"         : { "$push"  : "$cartItems" },
            "cartTotal"         : { "$sum"   : { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.originalPrice" ] } },
            "discount"          : { "$sum"   : { "$divide": [{ "$multiply": [ { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.originalPrice" ] }, "$cartItems.productDetail.discountPercent" ]}, 100] }},
            "total"             : { "$sum"   : { "$multiply": [ "$cartItems.quantity", "$cartItems.productDetail.discountedPrice" ] } },
            "cartQuantity"      : { "$sum"   : "$cartItems.quantity" },
            }
        },
    ])
    .exec()
    .then(data=>{
        console.log("data",data);

        if(data && data.length> 0 && data[0].cartItems){
            for (let k = 0; k < data[0].cartItems.length; k++) {
                data[0].cartItems[k] = {...data[0].cartItems[k], isWish:false};
            }
            console.log("data[0].cartItems[k]",data[0]);
            if(req.params.user_ID!=='null'){
                Wishlists.find({user_ID:req.params.user_ID})
                .then(wish=>{
                    if(wish.length > 0){
                        for(var i=0; i<wish.length; i++){
                            for(var j=0; j<data[0].cartItems.length; j++){
                                if(String(wish[i].product_ID) === String(data[0].cartItems[j].product_ID)){
                                    data[0].cartItems[j]= {...data[0].cartItems[j], isWish:true};
                                    break;
                                }
                            }
                        }   
                        if(i >= wish.length){
                            res.status(200).json(data);
                        }       
                    }else{
                        res.status(200).json(data);
                    }
                 })
                 .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            }else{
                res.status(200).json(data);
            }    
        }else{
            res.status(200).json(data);
        }
    })
    .catch(err =>{
        console.log("err",err);
        res.status(500).json({
            error: err
        });
    });
};



exports.all_list_cart = (req,res,next)=>{
    Carts.find()       
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

exports.count_cart = (req,res,next)=>{
    Carts.findOne({"user_ID": req.params.user_ID})     
        .exec()
        .then(data=>{
            if(data && data.cartItems){
                res.status(200).json(data.cartItems.length);
            }else{
                res.status(200).json(0);
            }
        })
        .catch(err =>{
            console.log("err",err);
            res.status(500).json({
                error: err
            });
        });
};

exports.remove_cart_items = (req, res, next)=>{
    // console.log('r', req.body);
    Carts.updateOne(
        {"user_ID": req.body.user_ID},
        {
			$pull: { "cartItems": { "_id": req.body.cartItem_ID } }
		}
    )
    .exec()
    .then(data=>{
        if(data.nModified == 1){
            res.status(200).json({
                "message": "Product removed from cart successfully.",
            });
        }else{
            res.status(401).json({
                "message": "Cart Not Found 1"
            });
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.remove_product_from_cart = (req, res, next)=>{
    // console.log("selected products=",req.body.selectedProducts.length);
    for(let i=0;i<=req.body.selectedProducts;i++){
    Carts.update(
        // {"cartItems.$.product_ID": req.body.selectedProducts[0]},
        {},
        {
            '$pull':{ 'cartItems':{'product_ID': req.body.selectedProducts[0] }},
            
			// $pull: { "cartItems": { "product_ID": req.body.selectedProducts[0] } }
        },
        {new:true,multi:true},
    )
    .exec()
    .then(data=>{
        if(data.nModified == 1){
            res.status(200).json({
                "message": "Product removed from cart successfully.",
            });
        }else{
            res.status(401).json({
                "message": "Cart Not Found"
            });
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
}
}

exports.change_cart_item_quantity = (req, res, next)=>{
    Carts.updateOne(
        {"user_ID":req.body.user_ID,'cartItems.product_ID':req.body.product_ID},
        {
            $set:{
                'cartItems.$.quantity'   : parseInt(req.body.quantityAdded),
                'cartItems.$.totalWeight': req.body.totalWeight,
            },
        }
    )
    .exec()
    .then(data=>{
        if(data.nModified == 1){
            res.status(200).json({
                "message": "Product quantity changed successfully."
            });
        }else{
            res.status(401).json({
                "message": "Cart Not Found 1"
            });
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};
exports.add_address_to_cart = (req, res, next)=>{
    Carts.findOne({"user_ID": req.body.user_ID})       
        .exec()
        .then(cartData=>{
            if(cartData){
                Carts.updateOne({ "_id" : cartData._id },
                { $set : 
                    {
                        deliveryAddress : {
                            "name"            : req.body.name,
                            "email"           : req.body.email,
                            "addressLine1"    : req.body.addressLine1,
                            "addressLine2"    : req.body.addressLine2,
                            "pincode"         : req.body.pincode,
                            "city"            : req.body.city,
                            "stateCode"       : req.body.stateCode,
                            "state"           : req.body.state,
                            "district"        : req.body.district,
                            "mobileNumber"    : req.body.mobileNumber,
                            "countryCode"     : req.body.countryCode,
                            "country"         : req.body.country,
                            "addType"         : req.body.addType,
                            "latitude"        : req.body.latitude,
                            "longitude"       : req.body.longitude,
                        }
                    }
                }) 
                .exec()
                .then(data=>{
                    // if(data.nModified == 1){
                        res.status(200).json({
                            "message": "Address added to cart successfully."
                        });
                    // }else{
                    //     res.status(401).json({
                    //         "message": "Cart Not Found"
                    //     });
                    // }
                })
                .catch(err =>{
                    res.status(500).json({
                        error: err
                    });
                });
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.list_cart=(req , res , next)=>{

    Carts.find({"user_ID": req.params.user_ID})
    .exec()
    .then(data =>{
        res.status(200).json(data);       
    })
    .catch(error =>{
        res.status(500).json({
            error:error
        })

    })

}
exports.user_cart=(req , res , next)=>{

    Carts.findOne({"user_ID": req.params.user_ID})
    .exec()
    .then(data =>{
        res.status(200).json(data);       
    })
    .catch(error =>{
        res.status(500).json({
            error:error
        })

    })

}
exports.add_paymentmethod_to_cart = (req, res, next)=>{
    Carts.updateOne({"user_ID": req.body.user_ID},
    { $set : 
        {
            "paymentMethod" : req.body.payMethod,
        }
    }) 
    .exec()
    .then(data=>{
        // if(data.nModified == 1){
            res.status(200).json({
                "message": "Payment Method added successfully."
            });
        // }else{
        //     res.status(401).json({
        //         "message": "Cart Not Found"
        //     });
        // }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};


//code by madhuri ghute

//Update products cart 
exports.update_cart_item = (req, res, next)=>{
    Carts.updateOne(
        {"user_ID":req.body.user_ID,'cartItems.product_ID':req.body.product_ID},
        {
            $set:{
                'cartItems.$.rate'              : req.body.rate,
                'cartItems.$.quantity'          : req.body.quantity,
                'cartItems.$.discountPercent'   : req.body.discountPercent,
                'cartItems.$.discountedPrice'   : req.body.discountedPrice,
            },
        }
    )
    .exec()
    .then(data=>{
        if(data.nModified == 1){
            res.status(200).json({
                "message": "Cart Product changed successfully."
            });
        }else{
            res.status(401).json({
                "message": "Cart Not Found 1"
            });
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};




// ===================== Server side Api call =============
// exports.paymentgatewaypinepg=(req , res , next)=>{
//     // const redirecturl = 'https://uat.pinepg.in/api/PaymentURL/CreatePaymentURL?';
//     // const paymentdetails = 'MERCHANT_ID=9445&MERCHANT_ACCESS_CODE=dc53e787-3e81-427d-9e94-19220eec39ef&REFERENCE_NO=EQWEWEE149&AMOUNT=200&CUSTOMER_MOBILE_NO=8087679825&CUSTOMER_EMAIL_ID=omkar.ronghe@iassureit.com&PRODUCT_CODE=testing';
//     // console.log("paymentdetails==>",paymentdetails)

//     // fetch.post(redirecturl+paymentdetails)
//     //             .then(reponse => {
//     //                console.log("paymentgatewaypinepg==>",reponse)
//     //                res.status(200).json({
//     //                 "message": "Test successfully."
//     //                 });
//     //             })
//     //             .catch(err => {
//     //                 console.log('Errr', err);
//     //             });
//     const paymentdetails = 'MERCHANT_ID=9445&MERCHANT_ACCESS_CODE=dc53e787-3e81-427d-9e94-19220eec39ef&REFERENCE_NO=EQWEWEE149&AMOUNT=200&CUSTOMER_MOBILE_NO=8087679825&CUSTOMER_EMAIL_ID=omkar.ronghe@iassureit.com&PRODUCT_CODE=testing';
//     const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json','Accept':'application/json'},
//         params: {
//                 MERCHANT_ID: 9445,
//                 MERCHANT_ACCESS_CODE: "dc53e787-3e81-427d-9e94-19220eec39ef",
//                 REFERENCE_NO: "hsjfhsfjk1433",
//                 AMOUNT: 200,
//                 PRODUCT_CODE: "testing",
//                 CUSTOMER_MOBILE_NO: "8087679825",
//                 CUSTOMER_EMAIL_ID: "omkar.ronghe@iassureit.com",
//             }
//     };
//     console.log("before post==>",requestOptions)


//     let pg = fetch('https://uat.pinepg.in/api/PaymentURL/CreatePaymentURL', requestOptions);

//         // .then(reponse => {
//            console.log("Response from api==>",pg)
//         //    res.status(200).json({
//         //     "message": "Test successfully."
//         //     });
//         // })
//         // .catch(err =>{
//         //     res.status(500).json({
//         //     "message": "Test NOT successfully.",
//         //         error: err
//         //     });
//         // });

// }
