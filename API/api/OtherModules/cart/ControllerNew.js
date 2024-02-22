const mongoose	                = require("mongoose");
var ObjectId                    = require('mongodb').ObjectID;
const Carts                     = require('./ModelNew');
const Coupon                    = require('../CouponManagement/Model');
const Products                  = require('../products/Model');
const Orders                    = require('../orders/Model');
const Wishlists                 = require('../wishlist/Model');
const EntityMaster              = require('../../coreAdmin/entityMaster/ModelEntityMaster');
const AdminPreferences          = require('../../Ecommerce/adminPreference/Model.js');
const StorePreferences          = require('../../Ecommerce/StorePreferences/Model.js');
const CreditPointsPolicy 		= require('../CreditPointsPolicy/Model');
const CreditPoints 		        = require('../CreditPoints/Model');
const ProductInventory 			= require('../ProductInventory/Model.js');
const _                         = require('underscore');  
const moment 	                = require('moment-timezone');
const haversine                 = require('haversine-distance')  
// import axios from 'axios';

/**=========== Add Cart Products ===========*/
exports.add_to_cart = (req,res,next)=>{
    // console.log("req.body ===> ",req.body);
    Carts.findOne({"user_ID": req.body.user_ID})
    .exec()
    .then(async(cartData) =>{        
        var vendorCartItem = {
            vendor_id           : req.body.vendor_ID,
            vendorLocation_id   : req.body.vendorLocation_id,
            vendorName          : req.body.vendorName,
            cartItems           : [
                {
                    product_ID          : req.body.product_ID,
                    quantity            : req.body.quantity,
                    totalWeight         : req.body.totalWeight,
                    productRate         : req.body.productRate,
                    discountPercent     : req.body.discountPercent,
                    discountedPrice     : req.body.discountedPrice,
                }
            ],
            vendor_numberOfProducts   : 1, 
            vendor_quantityOfProducts : req.body.quantity
        }  
        if(cartData !== null){
            var isVendorProductsExists = cartData.vendorOrders.filter(vendor => {
                return String(vendor.vendor_id) === String(req.body.vendor_ID)
            })
            if(isVendorProductsExists && isVendorProductsExists.length > 0){
                var errMsg = "";
            }else{
                var maxVendorsAllowedInCart = await StorePreferences.findOne({},{maxNumberOfVendors : 1})
                if(maxVendorsAllowedInCart !== undefined && maxVendorsAllowedInCart !== null && maxVendorsAllowedInCart.maxNumberOfVendors > 0 && (maxVendorsAllowedInCart.maxNumberOfVendors <= cartData.vendorOrders.length)){
                    var errMsg = "Only "+ maxVendorsAllowedInCart.maxNumberOfVendors +" different vendor products are allowed to add to cart";
                }else{
                    var errMsg = "";
                }
            }
            if(errMsg !== ""){
                res.status(200).json({
                    "message": errMsg,
                });
            }else{
                // console.log("When Cart data is available")  
                Carts.findOne({"user_ID": req.body.user_ID, 'vendorOrders.vendor_id' : req.body.vendor_ID})
                .exec()
                .then(productDataForVendor =>{
                    if(productDataForVendor !== null){ 
                        // console.log("When some Products are already added for same vendor")  
                        // var filteredVendorProducts = productDataForVendor.vendorOrders.filter(function(vendor){
                        //     return String(vendor.vendor_id) === String(req.body.vendor_ID);
                        // });
                        Carts.findOne({"user_ID": req.body.user_ID, 'vendorOrders.vendor_id' : req.body.vendor_ID, 'vendorOrders.cartItems.product_ID' : req.body.product_ID})
                        .exec()
                        .then(productData =>{                        
                            var filteredVendorProducts = productDataForVendor.vendorOrders.filter(function(vendor){
                                return String(vendor.vendor_id) === String(req.body.vendor_ID);
                            });
                            // console.log(" filteredProduct => ",filteredProduct)

                            if(productData !== null){
                                // console.log("When same Product is already Available")  
                                // console.log("condition => ",(filteredVendorProducts && filteredVendorProducts.length > 0))
                                if (filteredVendorProducts && filteredVendorProducts.length > 0) {
                                    // console.log("filteredVendorProducts=> ",filteredVendorProducts)
                                    // console.log("filteredVendorProducts[0].vendor_quantityOfProducts =>",filteredVendorProducts[0].vendor_quantityOfProducts)
                                    var vendor_quantityOfProducts  = parseInt(filteredVendorProducts[0].vendor_quantityOfProducts) + parseInt(req.body.quantity);
                                }else{
                                    var vendor_quantityOfProducts = 0;
                                }
                                var order_quantityOfProducts = productData.order_quantityOfProducts ? parseInt(productData.order_quantityOfProducts) + parseInt(req.body.quantity) : 0;
                                // console.log("vars => ",vendor_quantityOfProducts)
                                Carts.updateOne(
                                    {'_id' : cartData._id, 'vendorOrders.vendor_id' : req.body.vendor_ID},
                                    // {$set : {
                                    //     'order_quantityOfProducts'                  : 3,
                                    //     'vendorOrders.$.vendor_quantityOfProducts'  : 5
                                    // }},
                                    {$inc:
                                        {
                                            'vendorOrders.$[outer].cartItems.$[inner].quantity'         : req.body.quantity,
                                            // 'vendorOrders.$[outer].cartItems.$[inner].totalWeight'    : req.body.totalWeight,
                                        } 
                                    },
                                    {arrayFilters: [
                                        { 'outer.vendor_id' : req.body.vendor_ID}, 
                                        { 'inner.product_ID': req.body.product_ID }
                                    ]},
                                )
                                .exec()
                                .then(data=>{
                                    // console.log("updated data => ", productData)
                                    if(data.nModified == 1){
                                        Carts.updateOne(
                                            {'_id' : cartData._id, 'vendorOrders.vendor_id' : req.body.vendor_ID},
                                            {$set : {
                                                'order_quantityOfProducts'                  : order_quantityOfProducts,
                                                'vendorOrders.$.vendor_quantityOfProducts'  : vendor_quantityOfProducts,
                                                "userDelLocation"                           : {
                                                    lat     : req.body.userLatitude,
                                                    long    : req.body.userLongitude
                                                },
                                            }},
                                        )
                                        .exec()
                                        .then(updateone=>{
                                            // console.log("updateone => ",updateone)
                                        })
                                        .catch(err =>{
                                            // console.log('1',err);
                                            res.status(500).json({
                                                error: err
                                            });
                                        });
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
                                // console.log("When same Product Not Available")
                                if (filteredVendorProducts && filteredVendorProducts.length > 0) {
                                    // console.log("filteredVendorProducts=> ",filteredVendorProducts)
                                    // console.log("filteredVendorProducts[0].vendor_quantityOfProducts =>",filteredVendorProducts[0].vendor_quantityOfProducts)
                                    // console.log("req.body.quantity =>",req.body.quantity)
                                    var vendor_quantityOfProducts  = parseInt(filteredVendorProducts[0].vendor_quantityOfProducts) + parseInt(req.body.quantity);
                                    // console.log("vendor_quantityOfProducts =>",vendor_quantityOfProducts)
                                    var vendor_numberOfProducts    = parseInt(filteredVendorProducts[0].vendor_numberOfProducts + 1);
                                    // console.log("vendor_numberOfProducts =>",vendor_numberOfProducts)
                                    // console.log("productData =>",productData)
                                }else{
                                    var vendor_quantityOfProducts = 0;
                                    var vendor_numberOfProducts = 0;
                                }
                                var order_quantityOfProducts = productDataForVendor.order_quantityOfProducts ? parseInt(productDataForVendor.order_quantityOfProducts) + parseInt(req.body.quantity) : 0;
                                var order_numberOfProducts   = productDataForVendor.order_numberOfProducts ? parseInt(productDataForVendor.order_numberOfProducts) + 1 : 0;
                                // console.log("d =>>>>>>>> ",vendor_quantityOfProducts, vendor_numberOfProducts, order_quantityOfProducts, order_numberOfProducts)
                                var product = {                                
                                        product_ID          : req.body.product_ID,
                                        quantity            : req.body.quantity,
                                        totalWeight         : req.body.totalWeight,
                                        productRate         : req.body.productRate,
                                        discountPercent     : req.body.discountPercent,
                                        discountedPrice     : req.body.discountedPrice,                                
                                }      
                                Carts.updateOne(
                                    {'_id' : cartData._id, 'vendorOrders.vendor_id' :  req.body.vendor_ID},
                                    {
                                        $push:{
                                            'vendorOrders.$.cartItems' : product                                   
                                        },
                                        $set: { 
                                            'vendorOrders.$.vendor_numberOfProducts'    : vendor_numberOfProducts, 
                                            'vendorOrders.$.vendor_quantityOfProducts'  : vendor_quantityOfProducts,
                                            'order_numberOfProducts'                    : order_numberOfProducts,
                                            'order_quantityOfProducts'                  : order_quantityOfProducts,
                                            'userDelLocation'                           : {
                                                lat     : req.body.userLatitude,
                                                long    : req.body.userLongitude
                                            },
                                        }
                                    },
                                    )
                                    .exec()
                                    .then(updatedvendordata=>{
                                        // console.log("updatedvendordata => ", updatedvendordata)
                                        if(updatedvendordata.nModified == 1){
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
                                        console.log('1',err);
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
                            // console.log("When no Products availabe for same vendor")  
                            // var order_quantityOfProducts = cartData.order_quantityOfProducts ? parseInt(cartData.order_quantityOfProducts) + parseInt(req.body.quantity) : 0;
                            // var order_numberOfProducts   = cartData.order_numberOfProducts  ? parseInt(cartData.order_numberOfProducts) + 1 : 0;                 
                            var order_quantityOfProducts = cartData.order_quantityOfProducts ? parseInt(cartData.order_quantityOfProducts) + parseInt(req.body.quantity) : parseInt(req.body.quantity);
                            var order_numberOfProducts   = cartData.order_numberOfProducts  ? parseInt(cartData.order_numberOfProducts) + 1 : 1;                                     
                            Carts.updateOne(
                            {'_id' : cartData._id},
                            {
                                $push:{
                                    'vendorOrders' : vendorCartItem,
                                },
                                $set: { 
                                    // 'vendorOrders.$.vendor_numberOfProducts'    : vendor_numberOfProducts, 
                                    // 'vendorOrders.$.vendor_quantityOfProducts'  : vendor_quantityOfProducts,
                                    'order_numberOfProducts'        : order_numberOfProducts,
                                    'order_quantityOfProducts'      : order_quantityOfProducts,
                                    "userDelLocation"               : {
                                        lat     : req.body.userLatitude,
                                        long    : req.body.userLongitude
                                    },
                                }

                            }
                        )
                        .exec()
                        .then(data=>{
                            // console.log("else updated => ",data)
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
                            console.log('2',err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    } 
                })
                .catch(err =>{
                    console.log('3',err);
                    res.status(500).json({
                        error: err
                    });
                });
            }
        }else{
            const cartDetails = new Carts({
                _id                         : new mongoose.Types.ObjectId(),
                "user_ID"                   : req.body.user_ID,
                "userDelLocation"           : {
                    lat     : req.body.userLatitude,
                    long    : req.body.userLongitude
                },
                "vendorOrders"              : vendorCartItem,
                "order_numberOfProducts"    : 1, 
                "order_quantityOfProducts"  : req.body.quantity
            });
            cartDetails.save()
            .then(saveddata=>{
                res.status(200).json({
                    "message"   : "Product added to cart successfully.",
                    "cartCount" : 1
                });
            })
            .catch(err =>{
                res.status(500).json({
                    error: err
                });
            });
            return true;
        }		
	})
	.catch(err =>{
		res.status(500).json({
			error: err
		});
	});
};

/**=========== Vendorwise List of Cart Items for Particular User ===========*/
exports.list_cart_product = (req,res,next)=>{    
    // console.log("req.params.user_ID *==* ",req.params.user_ID);
    processCartData();
    async function processCartData(){
        /*1. Check for duplicate vendors in cart or duplicate products in particular vendor*/
        await checkDuplicateVendors(req.params.user_ID);

        /*2. Return Cart Product List*/
        Carts.findOne({user_ID:ObjectId(req.params.user_ID)})
        .populate('vendorOrders.cartItems.product_ID')
        .populate('vendorOrders.vendor_id')
        .exec()
        .then(async(data)=>{
            // console.log("data *=======> ",data);
            if(data && data !== null && data !== undefined){                

                for (var l = 0; l < data.vendorOrders.length; l++) {
                    // console.log("data.vendorOrders[i].vendor_id *=======> ",l ," => ",data.vendorOrders[l].vendor_id);
                    data.vendorOrders[l].cartItems = data.vendorOrders[l].cartItems.filter(function( item ) {
                        return item.product_ID !== null;
                    });
                }
                if(l >= data.vendorOrders.length){
                
                    var vendorOrders                = data.vendorOrders.filter(function( vendor ) {
                                                        return vendor.cartItems.length > 0;
                                                    });
                    var order_beforeDiscountTotal   = 0;
                    var order_afterDiscountTotal    = 0;
                    var order_discountAmount        = 0;
                    var order_taxAmount             = 0;
                    var order_shippingCharges       = 0;
                    var maxServiceCharges           = 0;
                    
                    var wish                        = await Wishlists.find({user_ID:req.params.user_ID});
                    var maxServiceChargesData       = await StorePreferences.findOne({},{maxServiceCharges : 1});
                    var minOrderAmountData          = await StorePreferences.findOne({},{minOrderValue : 1});
                    var creditPointsData            = await CreditPoints.findOne({user_id : ObjectId(req.params.user_ID)});
        			// console.log("creditPointsData => ",creditPointsData);

                    if(minOrderAmountData !== null && minOrderAmountData.minOrderValue > 0){
                        var minOrderAmount = minOrderAmountData.minOrderValue;
                    }else{
                        var minOrderAmount = 0;
                    }
                    
                    if(maxServiceChargesData !== null){
                        maxServiceCharges = maxServiceChargesData.maxServiceCharges;
                    }
                    for(var i = 0; i<vendorOrders.length;i++){    
                        var vendor_beforeDiscountTotal  = 0;
                        var vendor_afterDiscountTotal   = 0;
                        var vendor_discountAmount       = 0;
                        var vendor_taxAmount            = 0;
                        var vendor_shippingCharges      = 0; 
                        
                        var vendorShippingCharges = await getVendorWiseShippingCharges(vendorOrders[i].vendor_id._id, vendorOrders[i].vendorLocation_id, data.userDelLocation);
                        
                        if (vendorShippingCharges.code === "SUCCESS") {
                            vendor_shippingCharges = vendorShippingCharges.serviceCharges;
                            // console.log("vendor_shippingCharges => i => ",i,", ",vendor_shippingCharges);
                        }                    
                        

                    for(var j = 0; j < vendorOrders[i].cartItems.length;j++){
                        // console.log("data.vendorOrders[i].cartItems[j] => ",data.vendorOrders[i].cartItems[j])
                        if (data.vendorOrders[i].cartItems[j].product_ID !== null) {
                            var inventoryData             	= await ProductInventory.findOne({productCode : data.vendorOrders[i].cartItems[j].product_ID.productCode, itemCode : data.vendorOrders[i].cartItems[j].product_ID.itemCode, vendor_ID : ObjectId(data.vendorOrders[i].cartItems[j].product_ID.vendor_ID)},{currentQuantity : 1});
        				    // console.log("inventoryData => ",inventoryData);
                            
                            data.vendorOrders[i].cartItems[j].product_ID.availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0;                      
                            vendor_beforeDiscountTotal +=(vendorOrders[i].cartItems[j].product_ID.originalPrice * vendorOrders[i].cartItems[j].quantity);
                            if(vendorOrders[i].cartItems[j].product_ID.discountPercent !== 0){
                                vendor_discountAmount +=((data.vendorOrders[i].cartItems[j].product_ID.originalPrice -data.vendorOrders[i].cartItems[j].product_ID.discountedPrice)* vendorOrders[i].cartItems[j].quantity);
                            }

                            
                            //======= Product Price without Tax =====
                            var discountedPrice = data.vendorOrders[i].cartItems[j].product_ID.discountedPrice ;
                            var quantity = vendorOrders[i].cartItems[j].quantity;

                            //======  TAX Calculation =============
                            var taxRate = vendorOrders[i].cartItems[j].product_ID.taxRate; 

                            if(vendorOrders[i].cartItems[j].product_ID.taxInclude){
                                var inclusiveTaxRate = 1 - (1/(1+ (taxRate/100) )) ;
                                // console.log("inclusiveTaxRate = ",inclusiveTaxRate);

                                var taxAmount = (
                                                    vendorOrders[i].cartItems[j].product_ID.discountedPrice *
                                                    inclusiveTaxRate *
                                                    vendorOrders[i].cartItems[j].quantity
                                                );
                                discountedPrice = (discountedPrice * quantity)  - taxAmount; 
                                vendor_taxAmount += taxAmount ;
                                // console.log("disc price incl Tax = " + vendorOrders[i].cartItems[j].product_ID.discountedPrice +" | 1 discountedPrice = "+discountedPrice+" | taxRate = "+taxRate+" | taxAmount = "+taxAmount);
                            }else{
                                var taxAmount = (
                                                        vendorOrders[i].cartItems[j].product_ID.discountedPrice *
                                                        (taxRate/100)  *
                                                        vendorOrders[i].cartItems[j].quantity
                                                    );
                                vendor_taxAmount += taxAmount ;                                
                                discountedPrice = discountedPrice * quantity ;
                                // console.log("1 vendorOrders[i].cartItems[j].quantity = ",vendorOrders[i].cartItems[j].quantity);
                                // console.log("disc price incl Tax = "+vendorOrders[i].cartItems[j].product_ID.discountedPrice +" | 2 discountedPrice = "+discountedPrice+" | taxRate = "+taxRate+" | taxAmount = "+taxAmount);
                            }

                            vendor_afterDiscountTotal += discountedPrice;
                            // console.log("vendor_afterDiscountTotal = ",vendor_afterDiscountTotal);

                                data.vendorOrders[i].cartItems[j].product_ID.isWish = false;
                                if(wish.length > 0){
                                    for(var k=0; k<wish.length; k++){
                                        // console.log("String(wish[k].product_ID)",String(wish[k].product_ID));
                                        // console.log("String(data.vendorOrders[i].cartItems[j].product_ID._id)",String(data.vendorOrders[i].cartItems[j].product_ID._id));
                                        if(String(wish[k].product_ID) === String(data.vendorOrders[i].cartItems[j].product_ID._id)){
                                            data.vendorOrders[i].cartItems[j].product_ID.isWish = true;
                                            break;
                                        }
                                    } 
                                } 
                            }    
                        }
                        if(j>=vendorOrders[i].cartItems.length){
                            data.vendorOrders[i].vendor_beforeDiscountTotal = (vendor_beforeDiscountTotal).toFixed(2);
                            data.vendorOrders[i].vendor_afterDiscountTotal  = (vendor_afterDiscountTotal).toFixed(2);
                            data.vendorOrders[i].vendor_discountAmount      = (vendor_discountAmount).toFixed(2);
                            data.vendorOrders[i].vendor_taxAmount           = (vendor_taxAmount).toFixed(2);
                            // data.vendorOrders[i].vendor_shippingChargesBeforeDiscount     = (0).toFixed(2);
                            data.vendorOrders[i].vendor_shippingCharges     = (vendor_shippingCharges).toFixed(2);
                            data.vendorOrders[i].vendor_shippingChargesAfterDiscount     = (vendor_shippingCharges).toFixed(2);
                            // data.vendorOrders[i].vendor_netPayableAmount    = (vendor_afterDiscountTotal + vendor_taxAmount + vendor_shippingCharges).toFixed(2);
                            data.vendorOrders[i].vendor_netPayableAmount    = (vendor_afterDiscountTotal + vendor_taxAmount).toFixed(2);

                            order_beforeDiscountTotal   += vendor_beforeDiscountTotal;
                            order_afterDiscountTotal    += vendor_afterDiscountTotal;
                            order_discountAmount        += vendor_discountAmount;
                            order_taxAmount             += vendor_taxAmount;
                            order_shippingCharges       += vendor_shippingCharges;
                        }
                    }
                    if(i>=vendorOrders.length){
                        data.paymentDetails.beforeDiscountTotal         = (order_beforeDiscountTotal).toFixed(2);
                        data.paymentDetails.afterDiscountTotal          = (order_afterDiscountTotal).toFixed(2);
                        data.paymentDetails.discountAmount              = (order_discountAmount).toFixed(2);
                        data.paymentDetails.taxAmount                   = (order_taxAmount).toFixed(2);
                        /*----------- Apply Shipping charges not greter than max Shipping Charges -----------*/
                        data.paymentDetails.shippingChargesBeforeDiscount = (order_shippingCharges).toFixed(2);                
                        data.paymentDetails.shippingCharges             = maxServiceCharges && maxServiceCharges > 0 
                                                                            ? maxServiceCharges > order_shippingCharges 
                                                                                ? 
                                                                                    (order_shippingCharges).toFixed(2) 
                                                                                : 
                                                                                    maxServiceCharges 
                                                                            : 
                                                                                (order_shippingCharges).toFixed(2);
                        data.paymentDetails.afterDiscountCouponAmount   = 0;
                        data.paymentDetails.creditPointsUsed            = 0;
                        data.paymentDetails.creditPointsValueUsed       = (0).toFixed(2);
                        data.paymentDetails.netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + (maxServiceCharges && maxServiceCharges > 0 
                                                                                                                            ? maxServiceCharges > order_shippingCharges 
                                                                                                                                ? 
                                                                                                                                    (order_shippingCharges)
                                                                                                                                : 
                                                                                                                                    maxServiceCharges 
                                                                                                                            : 
                                                                                                                                (order_shippingCharges)
                                                                                                                        )).toFixed(2);
                        data.minOrderAmount                             = minOrderAmount;
                        if(maxServiceCharges && maxServiceCharges > 0 && maxServiceCharges < order_shippingCharges){
                            for(var k = 0; k<vendorOrders.length;k++){ 
                               var shippingChargesDiscountPercent     = ((data.vendorOrders[k].vendor_shippingCharges * 100) / order_shippingCharges).toFixed(2); 
                               // data.vendorOrders[k].vendor_shippingChargesBeforeDiscount = ((maxServiceCharges * shippingChargesDiscountPercent) / 100).toFixed(2);
                               data.vendorOrders[k].vendor_shippingChargesAfterDiscount = ((maxServiceCharges * shippingChargesDiscountPercent) / 100).toFixed(2);
                            }
                        }
                        if(creditPointsData && creditPointsData !== null){
                            var creditPolicyData = await CreditPointsPolicy.findOne();

        					data.totalCreditPoints 		    = creditPointsData.totalPoints;
        					data.totalCreditPointsValue 	= (creditPointsData.totalPoints * creditPolicyData.creditPointValue).toFixed(2);
        				}else{
        					data.totalCreditPoints 		    = 0;
        					data.totalCreditPointsValue 	= 0;
        				}                
                    }
                    // console.log("data",data);
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
    }
};


/*========== get Vendor wise Delivery Charges ==========*/
function getVendorWiseShippingCharges(vendor_id, location_id, userDelLocation) { 
    // console.log("vendor_id => ", vendor_id);
    // console.log("location_id => ", location_id);
    // console.log("userDelLocation => ", userDelLocation);
    var userLat     = userDelLocation.lat;
    var userLong    = userDelLocation.long;


    var currDate = new Date();
    
    return new Promise(function (resolve, reject) {
        EntityMaster.findOne({"_id" : ObjectId(vendor_id), "locations._id" : ObjectId(location_id)},{locations : 1})
        .then(async(vendorLocationData) => {
            // console.log("vendorLocationData => ",vendorLocationData);
            if(vendorLocationData.locations && vendorLocationData.locations.length > 0){
                var vendorLocation = vendorLocationData.locations.filter(function (locationObj) {
                    return String(locationObj._id) === String(location_id);
                });
                // console.log("vendorLocation => ",vendorLocation)

                if(vendorLocation && vendorLocation.length > 0){
                    var vendorLat   = vendorLocation[0].latitude;
                    var vendorLong  = vendorLocation[0].longitude;

                    if(userLat !== "" && userLat !== undefined && userLong !== "" && userLong !== undefined){
                        var vendorDist = await calcUserVendorDist(vendorLat,vendorLong, userLat, userLong);
                        // console.log("vendorDist => ",vendorDist)
                        var distanceWiseShippinCharges = await getDistanceWiseShippinCharges();

                        // console.log("distanceWiseShippinCharges => ",distanceWiseShippinCharges);
                        if(distanceWiseShippinCharges && distanceWiseShippinCharges.length > 0){
                            var serviceCharges = 0;
                            for (var i = 0; i < distanceWiseShippinCharges.length; i++) {
                                if(vendorDist >= distanceWiseShippinCharges[i].minDistance && vendorDist < distanceWiseShippinCharges[i].maxDistance){
                                    serviceCharges = distanceWiseShippinCharges[i].serviceCharges;
                                }                                
                            }
                            if(i >= distanceWiseShippinCharges.length){
                                resolve({
                                    code                : "SUCCESS", 
                                    serviceCharges      : serviceCharges
                                });
                            }
                        }else{
                            reject({
                                code    : "FAILED", 
                                message : "Please add distance wise Shipping Charges in Store Preferences."
                            });
                        }
                    }else{
                        reject({
                            code    : "FAILED", 
                            message : "No User Location Data Found"
                        });
                    }
                }else{
                    reject({
                        code    : "FAILED", 
                        message : "No Vendor Location Found"
                    });
                }
            }else{
                reject({
                    code    : "FAILED", 
                    message : "No Vendor Locations Found"
                });
            }
            // if(coupondata !== null){
            //     Orders.find({user_ID : user_ID, 'paymentDetails.disocuntCoupon_id' : coupondata._id})
            //     .then(orderData => {  
            //         if(orderData.length < coupondata.couponLimit){
            //             resolve({code: "SUCCESS", dataObj: coupondata});
            //         }else{
            //             resolve({code: "FAILED", message: "This Coupon Code used for "+orderData.length+" times and the max number of times the coupn can be used is "+coupondata.couponLimit});
            //         }
            //     })
            //     .catch(error=>{
            //         reject({code: "FAILED", message: "Some error in finding Order Data"});
            //     })
            // }else{
            //     resolve({code: "FAILED", message: "Such Coupon Code Doesn't exist!"});
            // }
        })
        .catch(error=>{
            reject({
                code    : "FAILED", 
                message : "Some error in finding Vendor Location"
            });
        })
    })
}

/**=========== calcUserVendorDist() ===========*/
function calcUserVendorDist(vendorLat,vendorLong, userLat, userLong){
    return new Promise(function(resolve,reject){
        processDistance()

        async function processDistance(){
            //First point User Location
            var userLocation = { lat: userLat, lng: userLong }

            //Second point Vendor Location
            var vendorLocation = { lat: vendorLat, lng: vendorLong }        
            
            //Distance in meters (default)
            var distance_m = haversine(userLocation, vendorLocation);

            //Distance in miles
            var distance_miles = distance_m * 0.00062137119;

            //Distance in kilometers
            var distance_km = distance_m /1000; 
            
            // console.log("distance_miles => ",distance_miles)
            // console.log("distance_km => ",distance_km)
            //get unit of distance
            var unitOfDistance = await getAdminPreferences();
            if(unitOfDistance.toLowerCase() === "mile"){
                resolve(distance_miles);
            }else{
                resolve(distance_km);                
            }            
        }
    });
}

/**=========== getAdminPreferences() ===========*/
function getAdminPreferences(){
    return new Promise(function(resolve,reject){
        AdminPreferences.findOne()
        .exec()
        .then(adminPreferences=>{
            if(adminPreferences !== null){
                resolve(adminPreferences.unitOfDistance);
            }else{
                resolve(adminPreferences);
            }            
        })
        .catch(err =>{
            console.log("Error while fetching admin preferences => ",err);
            reject(err)
        });
    });
}

/**=========== checkDuplicateVendors() ===========*/
function checkDuplicateVendors(user_ID){
    // console.log("duplicate vendors user_ID => ",user_ID)
    return new Promise(function(resolve,reject){
        Carts.findOne({user_ID:ObjectId(user_ID)})
        .exec()
        .then(async(cartdata)=>{
            // console.log("cartdata => ",cartdata)
            if (cartdata !== null ) {
                var newVendorOrders     = [];
                var vendorOrders        = cartdata.vendorOrders;

                for (var i = 0; i < vendorOrders.length; i++) {
                    // console.log("newVendorOrders i => ",i," = ",newVendorOrders);
                    var findSamevendor = await newVendorOrders.filter(vendor => (
                                        (String(vendor.vendor_id) === String(vendorOrders[i].vendor_id)) && 
                                        (vendor.vendor_numberOfProducts === vendorOrders[i].vendor_numberOfProducts) &&
                                        (vendor.vendor_quantityOfProducts === vendorOrders[i].vendor_quantityOfProducts)))
                    
                    // console.log("findSamevendor = > ",findSamevendor)
                    // console.log("condition = > ",(findSamevendor && findSamevendor.length === 0))
                    if (findSamevendor && findSamevendor.length === 0) {
                        newVendorOrders.push(vendorOrders[i]);
                    }

                }
                if (i >= vendorOrders.length) {
                    // console.log("newVendorOrders => ",newVendorOrders);
                    var order_numberOfProducts      = 0;
                    var order_quantityOfProducts    = 0;

                    for (var j = 0; j < newVendorOrders.length; j++) {                                                                            
                                                                                                                 
                        var newVendorProducts           = [];
                        var vendorProducts              = newVendorOrders[j].cartItems; 
                        var vendor_numberOfProducts     = 0;
                        var vendor_quantityOfProducts   = 0;

                        // console.log("vendorProducts => ",vendorProducts)  

                        for (var k = 0; k < vendorProducts.length; k++) {
                            var findSameProduct = newVendorProducts.filter(product => ((String(product.product_ID) === String(vendorProducts[k].product_ID)) && (String(product.quantity) === String(vendorProducts[k].quantity))))
                            // console.log("findSameProduct => ",k, " = ",findSameProduct)                                                  

                            if (findSameProduct && findSameProduct.length === 0) {
                                vendor_numberOfProducts     += 1;
                                vendor_quantityOfProducts   += vendorProducts[k].quantity;
                                newVendorProducts.push(vendorProducts[k]);
                            }                                   
                            
                        }
                        if (k >= vendorProducts.length) {
                            // console.log("newVendorProducts => ",newVendorProducts)
                            newVendorOrders[j].cartItems                    = newVendorProducts;
                            newVendorOrders[j].vendor_numberOfProducts      = vendor_numberOfProducts;
                            newVendorOrders[j].vendor_quantityOfProducts    = vendor_quantityOfProducts;
                            order_numberOfProducts                          += vendor_numberOfProducts;
                            order_quantityOfProducts                        += vendor_quantityOfProducts;
                        }
                    }
                    if (j >= newVendorOrders.length) {
                        // console.log("newVendorOrders => ",newVendorOrders)
                        // console.log("order_numberOfProducts => ",order_numberOfProducts)
                        // console.log("order_quantityOfProducts => ",order_quantityOfProducts)
                        Carts.updateOne(
                            { "user_ID" : ObjectId(user_ID)},
                            {$set : 
                                {
                                    "vendorOrders"               : newVendorOrders,
                                    "order_numberOfProducts"     : order_numberOfProducts,
                                    "order_quantityOfProducts"   : order_quantityOfProducts,
                                }
                            }
                        )
                        .exec()
                        .then(cartUpdateData=>{
                            console.log("Cart Update while checking duplicate vendor => ",cartUpdateData);
                            resolve(true);
                        })
                        .catch(err =>{
                            console.log("Error while Updating cart Data => ",err);
                            reject(err)
                        });
                    }   
                }                
            } else {
                resolve(true)
            }           
        })
        .catch(err =>{
            console.log("Error while fetching cart Data => ",err);
            reject(err)
        });
    });
}

/**=========== getDistanceWiseShippinCharges() ===========*/
function getDistanceWiseShippinCharges(){
    return new Promise(function(resolve,reject){
        StorePreferences.findOne()
        .then(storePreferences=>{
            // console.log("storePreferences => ",storePreferences)
            // console.log("Condition => ",(storePreferences && storePreferences.serviseChargesByDistance && storePreferences.serviseChargesByDistance.length > 0))
            if(storePreferences && storePreferences.serviseChargesByDistance){
                // console.log("storePreferences.serviseChargesByDistance => ",storePreferences.serviseChargesByDistance)
                resolve(storePreferences.serviseChargesByDistance);
            }else{
                resolve([]);
            }            
        })
        .catch(err =>{
            console.log("Error => ",err);
            reject(err)
        });
    });
}

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
    Carts.aggregate([
        {"$match":{"user_ID": ObjectId(req.params.user_ID)}},
        { 
            "$project": { 
                "count": { "$sum": { "$map": { "input": "$vendorOrders", "as": "l", "in": { "$size": "$$l.cartItems" } } } } 
            } 
        }
    ])
    .exec()
    .then(data=>{
        // console.log("data",data);
        res.status(200).json(data && data.length > 0 ? data[0].count : 0);
    })
    .catch(err =>{
        console.log("err",err);
        res.status(500).json({
            error: err
        });
    });
};

/*============ Remove Cart Items ===========*/
exports.remove_cart_items = (req, res, next)=>{
    // console.log('remove_cart_items =>', req.body);

    Carts.findOne({"user_ID": req.body.user_ID})
    .exec()
    .then(cartdata =>{
        var order_numberOfProducts           = cartdata.order_numberOfProducts;
        var order_quantityOfProducts         = cartdata.order_quantityOfProducts;
        // console.log("cartdata",cartdata);
        var vendor                           = cartdata.vendorOrders.filter(vendorObject => String(vendorObject.vendor_id) === String(req.body.vendor_ID));
        // console.log("vendor",vendor);
        if(vendor && vendor.length > 0 && vendor[0].cartItems && vendor[0].cartItems.length > 0){
            // console.log("vendor[0].vendor_quantityOfProducts => ",vendor[0].vendor_quantityOfProducts);
            // console.log("vendor[0].vendor_numberOfProducts => ",vendor[0].vendor_numberOfProducts);
            if(vendor[0].cartItems.length > 1){
                var productToBeRemoved  = vendor[0].cartItems.filter(cartProduct => String(cartProduct._id) === String(req.body.cartItem_ID));
            }else{
                var productToBeRemoved  = vendor[0].cartItems;
            }
            // console.log("productToBeRemoved => ",productToBeRemoved)
            var vendor_numberOfProducts      = vendor[0].vendor_numberOfProducts - 1;
            var vendor_quantityOfProducts    = vendor[0].vendor_quantityOfProducts - productToBeRemoved[0].quantity;
            var newVendorCartItems           = vendor[0].cartItems.filter(cartProduct => String(cartProduct._id) !== String(req.body.cartItem_ID));
            // console.log("vendor_numberOfProducts => ",vendor_numberOfProducts)
            // console.log("vendor_quantityOfProducts => ",vendor_quantityOfProducts)
            // console.log("newVendorCartItems => ",newVendorCartItems)
            if(newVendorCartItems.length === 0){
                // console.log("if ===============> ")
                //If the removed product was the only product in cartItems array, then remove the whole vendor object.
                var newVendorArr             = cartdata.vendorOrders.filter(vendorObject => String(vendorObject.vendor_id) !== String(req.body.vendor_ID));

                Carts.updateOne(
                    { "user_ID" : req.body.user_ID},
                    {
                        $set : {
                            "vendorOrders"               : newVendorArr,
                            "order_numberOfProducts"     : order_numberOfProducts - 1,
                            "order_quantityOfProducts"   : order_quantityOfProducts - productToBeRemoved[0].quantity,
                        }
                    }
                )
                .exec()
                .then(cartUpdateData=>{
                    // console.log("cartUpdateData remove => ",cartUpdateData);

                    if(cartUpdateData.nModified == 1){                          
                        res.status(200).json({
                            "message": "Product removed from cart successfully.",
                        });
                    }else{
                        res.status(200).json({
                            "message": "Product still their in the Cart."
                        });
                    }
                })
                .catch(err =>{
                    res.status(500).json({
                        error: err
                    });
                });   
            }else{
                // console.log("else ===============> ","newVendorCartItems => ", newVendorCartItems,"vendor_numberOfProducts => ", vendor_numberOfProducts,"vendor_quantityOfProducts => ", vendor_quantityOfProducts,"order_numberOfProducts => ", (order_numberOfProducts - 1),"order_quantityOfProducts => ", (order_quantityOfProducts - productToBeRemoved[0].quantity) )
                // console.log("form values => ",)
                Carts.updateOne(
                    { "user_ID" : req.body.user_ID, 'vendorOrders.vendor_id' :  req.body.vendor_ID },
                    {
                        $set : {
                            "vendorOrders.$.cartItems"                   : newVendorCartItems,
                            "vendorOrders.$.vendor_numberOfProducts"     : vendor_numberOfProducts,
                            "vendorOrders.$.vendor_quantityOfProducts"   : vendor_quantityOfProducts,
                            "order_numberOfProducts"                     : order_numberOfProducts - 1,
                            "order_quantityOfProducts"                   : order_quantityOfProducts - productToBeRemoved[0].quantity,
                        }
                    }
                ) 
                .exec()
                .then(cartUpdateData=>{
                    // console.log("cartUpdateData remove => ",cartUpdateData);

                    if(cartUpdateData.nModified == 1){                          
                        res.status(200).json({
                            "message": "Product removed from cart successfully.",
                        });
                    }else{
                        res.status(200).json({
                            "message": "Product still their in the Cart."
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




/*
        // var previous_order_quantityOfProducts   = cartdata.order_quantityOfProducts;


        // var previous_vendor_quantityOfProducts  = vendor[0].vendor_quantityOfProducts;
            // var vendorProduct                       = vendor[0].cartItems.filter(cartProduct => String(cartProduct._id) === String(req.body.cartItem_ID));

            if(vendorProduct && vendorProduct.length > 0){
                var previousProductQuantity = vendorProduct[0].quantity;
            }else{
                var previousProductQuantity = 0;
            }

Carts.updateOne(
            { "user_ID" : req.body.user_ID, 'vendorOrders.vendor_id' :  req.body.vendor_ID },
            { "$pull" : { 
                            "vendorOrders.$.cartItems" : { 
                                "_id" : ObjectId(req.body.cartItem_ID) 
                            } 
                        } 
            }
        )
        .exec()
        .then(cartUpdateData=>{
            console.log("cartUpdateData remove => ",cartUpdateData);

            if(cartUpdateData.nModified == 1){   
                var order_quantityOfProducts    = (previous_order_quantityOfProducts - previousProductQuantity);
                var vendor_quantityOfProducts   = (previous_vendor_quantityOfProducts - previousProductQuantity);
                
                Carts.updateOne(
                    {"user_ID" : ObjectId(req.body.user_ID), 'vendorOrders.vendor_id' : req.body.vendor_ID},
                    {$set : {
                        'order_quantityOfProducts'                  : order_quantityOfProducts,
                        'vendorOrders.$.vendor_quantityOfProducts'  : vendor_quantityOfProducts
                    }},
                )
                .exec()
                .then(updateone=>{
                    console.log("updateone => ",updateone)
                })
                .catch(err =>{
                    console.log('1',err);
                    res.status(500).json({
                        error: err
                    });
                });
                res.status(200).json({
                    "message": "Product removed from cart successfully.",
                });
            }else{
                res.status(200).json({
                    "message": "Cart Not Found 1"
                });
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });

        */


    })
    .catch(error =>{
        res.status(500).json({
            error:error
        })

    })
};

/**=========== Change Cart Products Quantity ===========*/
exports.change_cart_item_quantity = (req, res, next)=>{
    // console.log("req.body => ",req.body);

    Carts.findOne({"user_ID": req.body.user_ID})
    .exec()
    .then(cartdata =>{
        // console.log("cartdata= > ",cartdata)
        var previous_order_quantityOfProducts = cartdata.order_quantityOfProducts;
        var vendor = cartdata.vendorOrders.filter(vendors => String(vendors.vendor_id) === String(req.body.vendor_ID));
        if(vendor && vendor.length > 0 && vendor[0].cartItems && vendor[0].cartItems.length > 0){
            var previous_vendor_quantityOfProducts = vendor[0].vendor_quantityOfProducts;
            // console.log("vendor => ", vendor);
            var vendorProduct = vendor[0].cartItems.filter(products => String(products.product_ID) === String(req.body.product_ID));
            if(vendorProduct && vendorProduct.length > 0){
                var previousProductQuantity = vendorProduct[0].quantity;
            }else{
                var previousProductQuantity = 0;
            }
        }
        // console.log("previous_order_quantityOfProducts => ", previous_order_quantityOfProducts);
        // console.log("previous_vendor_quantityOfProducts => ", previous_vendor_quantityOfProducts);
        // console.log("previousProductQuantity => ", previousProductQuantity);
        // console.log(" => ", );


        // res.status(200).json(data);       
    
        Carts.updateOne(
            {"user_ID" : ObjectId(req.body.user_ID), 'vendorOrders.vendor_id' : ObjectId(req.body.vendor_ID)},
            {$set:
                {
                    'vendorOrders.$[outer].cartItems.$[inner].quantity'         : req.body.quantityAdded,
                    // 'vendorOrders.$[outer].cartItems.$[inner].totalWeight'    : req.body.totalWeight,
                } 
            },
            {arrayFilters: [
                { 'outer.vendor_id' : ObjectId(req.body.vendor_ID) }, 
                { 'inner.product_ID': ObjectId(req.body.product_ID) }
            ]}       
        )
        .exec()
        .then(data=>{
            // console.log("data => ",data);
            if(data.nModified === 1){    
                var order_quantityOfProducts    = (previous_order_quantityOfProducts - previousProductQuantity) + req.body.quantityAdded;
                var vendor_quantityOfProducts   = (previous_vendor_quantityOfProducts - previousProductQuantity) + req.body.quantityAdded;
                Carts.updateOne(
                    {"user_ID" : ObjectId(req.body.user_ID), 'vendorOrders.vendor_id' : req.body.vendor_ID},
                    {$set : {
                        'order_quantityOfProducts'                  : order_quantityOfProducts,
                        'vendorOrders.$.vendor_quantityOfProducts'  : vendor_quantityOfProducts
                    }},
                )
                .exec()
                .then(updateone=>{
                    // console.log("updateone => ",updateone)
                })
                .catch(err =>{
                    console.log('1',err);
                    res.status(500).json({
                        error: err
                    });
                });
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
    })
    .catch(error =>{
        res.status(500).json({
            error:error
        })

    })
};

/**=========== Update Delivery Address ===========*/
exports.add_address_to_cart = (req, res, next)=>{
    // console.log("cart req.body===",req.body)
    Carts.findOne({"user_ID": req.body.user_ID})       
        .exec()
        .then(cartData=>{
            // console.log("cartData => ",cartData)
            if(cartData){
                // console.log("cartData._id===",cartData._id);
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
                        // console.log("cartdata===",data);
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
            }else{
                res.status(200).json({
                    "message": "Failed to add Address into cart."
                });
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

/**=========== Return Cart Count ===========*/
exports.count_cart = (req,res,next)=>{
    Carts.aggregate([
        {"$match":{"user_ID": ObjectId(req.params.user_ID)}},
        { 
            "$project": { 
                "count": { "$sum": { "$map": { "input": "$vendorOrders", "as": "l", "in": { "$size": "$$l.cartItems" } } } } 
            } 
        }
    ])
    .exec()
    .then(data=>{
        res.status(200).json(data.length > 0 ? data[0].count : 0);
    })
    .catch(err =>{
        console.log("err",err);
        res.status(500).json({
            error: err
        });
    });
};

/**=========== Apply Coupon On Cart ===========*/
exports.apply_coupon = (req,res,next)=>{    
    // console.log("req.body => ",req.body);
    Carts.findOne({user_ID : ObjectId(req.body.user_ID)})
    .populate('vendorOrders.cartItems.product_ID')
    .populate('vendorOrders.vendor_id')
    .then(data=>{   
        // console.log("data => ",data);
        processCouponData(data);
        async function processCouponData(data){
            var errMessage              = "";  
            var isCouponValid           = await checkCouponValidity(req.body.couponCode, req.body.user_ID);                    
            
            var maxServiceChargesData   = await StorePreferences.findOne({},{maxServiceCharges : 1});
            if(maxServiceChargesData !== null){
                maxServiceCharges = maxServiceChargesData.maxServiceCharges;
            }

            var creditPointsData = await CreditPoints.findOne({user_id : ObjectId(req.body.user_ID)});
            if(creditPointsData && creditPointsData !== null){
                var creditPolicyData = await CreditPointsPolicy.findOne();

                data.totalCreditPoints 		    = creditPointsData.totalPoints;
                data.totalCreditPointsValue 	= (creditPointsData.totalPoints * creditPolicyData.creditPointValue).toFixed(2);
            }else{
                data.totalCreditPoints 		    = 0;
                data.totalCreditPointsValue 	= 0;
            } 

            var vendorOrders                = data.vendorOrders;
            var order_beforeDiscountTotal   = 0;
            var order_afterDiscountTotal    = 0;
            var order_discountAmount        = 0;
            var order_taxAmount             = 0;
            var order_shippingCharges       = 0;
            
            for(var i = 0; i < vendorOrders.length; i++){      
                var vendor_beforeDiscountTotal  = 0;
                var vendor_afterDiscountTotal   = 0;
                var vendor_discountAmount       = 0;
                var vendor_taxAmount            = 0;
                var vendor_shippingCharges      = 0;  
                
                var vendorShippingCharges = await getVendorWiseShippingCharges(vendorOrders[i].vendor_id._id, vendorOrders[i].vendorLocation_id, data.userDelLocation);
                if (vendorShippingCharges.code === "SUCCESS") {
                    vendor_shippingCharges = vendorShippingCharges.serviceCharges;
                } 

                // console.log("vendorOrders[i].cartItems",i, " ",vendorOrders[i].cartItems);
                for(var j = 0; j < vendorOrders[i].cartItems.length; j++){
                    var inventoryData             	= await ProductInventory.findOne({productCode : data.vendorOrders[i].cartItems[j].product_ID.productCode, itemCode : data.vendorOrders[i].cartItems[j].product_ID.itemCode, vendor_ID : ObjectId(data.vendorOrders[i].cartItems[j].product_ID.vendor_ID)},{currentQuantity : 1});
				    data.vendorOrders[i].cartItems[j].product_ID.availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 						

                    vendor_beforeDiscountTotal += (vendorOrders[i].cartItems[j].product_ID.originalPrice * vendorOrders[i].cartItems[j].quantity);                    
                    if(vendorOrders[i].cartItems[j].product_ID.discountPercent !== 0){
                        vendor_discountAmount += ((data.vendorOrders[i].cartItems[j].product_ID.originalPrice - data.vendorOrders[i].cartItems[j].product_ID.discountedPrice) * vendorOrders[i].cartItems[j].quantity);
                    }
                    

                    //======= Product Price without Tax =====
                    var discountedPrice = data.vendorOrders[i].cartItems[j].product_ID.discountedPrice ;
                    var quantity = vendorOrders[i].cartItems[j].quantity;

                    //======  TAX Calculation =============
                    var taxRate = vendorOrders[i].cartItems[j].product_ID.taxRate; 
                    var inclusiveTaxRate = 1 - (1/(1+ (taxRate/100) )) ;



                    if(vendorOrders[i].cartItems[j].product_ID.taxInclude){
                        var inclusiveTaxRate = 1 - (1/(1+ (taxRate/100) )) ;
                        var taxAmount = (
                                            vendorOrders[i].cartItems[j].product_ID.discountedPrice *
                                            inclusiveTaxRate *
                                            vendorOrders[i].cartItems[j].quantity
                                        );
                        discountedPrice = (discountedPrice * quantity)  - taxAmount; 
                        vendor_taxAmount += taxAmount ;
                    }else{
                        var taxAmount = (
                                                vendorOrders[i].cartItems[j].product_ID.discountedPrice *
                                                (taxRate/100)  *
                                                vendorOrders[i].cartItems[j].quantity
                                            );
                        vendor_taxAmount += taxAmount ;                                
                        discountedPrice = discountedPrice * quantity ;
                    }

                    vendor_afterDiscountTotal += discountedPrice;
                }

                if(j>=vendorOrders[i].cartItems.length){
                    data.vendorOrders[i].vendor_beforeDiscountTotal = (vendor_beforeDiscountTotal).toFixed(2);
                    data.vendorOrders[i].vendor_afterDiscountTotal  = (vendor_afterDiscountTotal).toFixed(2);
                    data.vendorOrders[i].vendor_discountAmount      = (vendor_discountAmount).toFixed(2);
                    data.vendorOrders[i].vendor_taxAmount           = (vendor_taxAmount).toFixed(2);
                    data.vendorOrders[i].vendor_shippingCharges     = (vendor_shippingCharges).toFixed(2);
                    data.vendorOrders[i].vendor_shippingChargesAfterDiscount     = (vendor_shippingCharges).toFixed(2);
                    // data.vendorOrders[i].vendor_netPayableAmount    = (vendor_afterDiscountTotal + vendor_taxAmount + vendor_shippingCharges).toFixed(2);
                    data.vendorOrders[i].vendor_netPayableAmount    = (vendor_afterDiscountTotal + vendor_taxAmount).toFixed(2);
                    
                    order_beforeDiscountTotal   += vendor_beforeDiscountTotal;
                    order_afterDiscountTotal    += vendor_afterDiscountTotal;
                    order_discountAmount        += vendor_discountAmount;
                    order_taxAmount             += vendor_taxAmount;
                    order_shippingCharges       += vendor_shippingCharges;
                }
            }
            if(i>=vendorOrders.length){
                data.paymentDetails.beforeDiscountTotal     = (order_beforeDiscountTotal).toFixed(2);
                data.paymentDetails.afterDiscountTotal      = (order_afterDiscountTotal).toFixed(2);
                data.paymentDetails.discountAmount          = (order_discountAmount).toFixed(2);
                data.paymentDetails.taxAmount               = (order_taxAmount).toFixed(2);
                data.paymentDetails.creditPointsUsed        = 0;
                data.paymentDetails.creditPointsValueUsed   = (0).toFixed(2);
                /*----------- Apply Shipping charges not greter than max Shipping Charges -----------*/
                data.paymentDetails.shippingChargesBeforeDiscount = (order_shippingCharges).toFixed(2);
                data.paymentDetails.shippingCharges             = maxServiceCharges && maxServiceCharges > 0 
                                                                    ? maxServiceCharges > order_shippingCharges 
                                                                        ? 
                                                                            (order_shippingCharges).toFixed(2) 
                                                                        : 
                                                                            maxServiceCharges 
                                                                    : 
                                                                        (order_shippingCharges).toFixed(2);
                
                if(maxServiceCharges && maxServiceCharges > 0 && maxServiceCharges < order_shippingCharges){
                    for(var k = 0; k<vendorOrders.length;k++){ 
                       var shippingChargesDiscountPercent     = ((data.vendorOrders[k].vendor_shippingCharges * 100) / order_shippingCharges).toFixed(2); 
                       data.vendorOrders[k].vendor_shippingChargesAfterDiscount = ((maxServiceCharges * shippingChargesDiscountPercent) / 100).toFixed(2);
                    }
                }
                if (isCouponValid.code === "FAILED") {
                    errMessage                                      = isCouponValid.message;
                    data.paymentDetails.afterDiscountCouponAmount   = 0;
                    data.paymentDetails.netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + (maxServiceCharges && maxServiceCharges > 0 
                                                                                                                        ? maxServiceCharges > order_shippingCharges 
                                                                                                                            ? 
                                                                                                                                (order_shippingCharges)
                                                                                                                            : 
                                                                                                                                maxServiceCharges 
                                                                                                                        : 
                                                                                                                            (order_shippingCharges)
                                                                                                                    )).toFixed(2);
                    
                    res.status(200).json({
                        data    : data,
                        message : errMessage
                    });   
        
                }else{ 
                    /*---- Check for Min Puchase amount for Coupon to be applied ----*/
                    if(order_afterDiscountTotal >= isCouponValid.dataObj.minPurchaseAmount){

                        if ((isCouponValid.dataObj.couponin).toLowerCase() === "percent") {
                            var discountInPercent                           = (order_afterDiscountTotal * isCouponValid.dataObj.couponvalue) / 100;
                            
                            /*------  Check for Applicable Maximum Discount Amount -------*/
                            var discoutAfterCouponApply                     =   isCouponValid.dataObj.maxDiscountAmount 
                                                                                ? 
                                                                                    discountInPercent < isCouponValid.dataObj.maxDiscountAmount 
                                                                                    ? 
                                                                                        discountInPercent 
                                                                                    :   
                                                                                        isCouponValid.dataObj.maxDiscountAmount 
                                                                                : 
                                                                                    discountInPercent;
    
                            // console.log("discoutAfterCouponApply 1 => ",discoutAfterCouponApply);
                            data.paymentDetails.disocuntCoupon_id           = isCouponValid.dataObj._id;
                            data.paymentDetails.discountCouponPercent       = isCouponValid.dataObj.couponvalue;
                            data.paymentDetails.afterDiscountCouponAmount   = (discoutAfterCouponApply).toFixed(2);
                            data.paymentDetails.netPayableAmount            = ((order_afterDiscountTotal - discoutAfterCouponApply) + order_taxAmount + (maxServiceCharges && maxServiceCharges > 0 
                                                                                                                                                            ? maxServiceCharges > order_shippingCharges 
                                                                                                                                                                ? 
                                                                                                                                                                    (order_shippingCharges)
                                                                                                                                                                : 
                                                                                                                                                                    maxServiceCharges 
                                                                                                                                                            : 
                                                                                                                                                                (order_shippingCharges)
                                                                                                                                                        )).toFixed(2);
                            
                            res.status(200).json({
                                data    : data,
                                message : "Coupon Applied Successfully!"
                            });                       

                        }else if((isCouponValid.dataObj.couponin).toLowerCase() === "amount"){
                            
                            /*------  Check for Applicable Maximum Discount Amount -------*/
                            var discoutAfterCouponApply                     =   isCouponValid.dataObj.maxDiscountAmount 
                                                                                ? 
                                                                                    isCouponValid.dataObj.couponvalue < isCouponValid.dataObj.maxDiscountAmount 
                                                                                    ? 
                                                                                        (isCouponValid.dataObj.couponvalue).toFixed(2) 
                                                                                    : 
                                                                                        isCouponValid.dataObj.maxDiscountAmount 
                                                                                : 
                                                                                    (isCouponValid.dataObj.couponvalue).toFixed(2);
                            // console.log("discoutAfterCouponApply 2 => ",discoutAfterCouponApply);
                            data.paymentDetails.disocuntCoupon_id           = isCouponValid.dataObj._id;
                            data.paymentDetails.discountCouponAmount        = isCouponValid.dataObj.couponvalue;
                            data.paymentDetails.afterDiscountCouponAmount   = discoutAfterCouponApply;
                            data.paymentDetails.netPayableAmount            = ((order_afterDiscountTotal - discoutAfterCouponApply) + order_taxAmount + (maxServiceCharges && maxServiceCharges > 0 
                                                                                                                                                            ? maxServiceCharges > order_shippingCharges 
                                                                                                                                                                ? 
                                                                                                                                                                    (order_shippingCharges)
                                                                                                                                                                : 
                                                                                                                                                                    maxServiceCharges 
                                                                                                                                                            : 
                                                                                                                                                                (order_shippingCharges)
                                                                                                                                                        )).toFixed(2);
                            
                            res.status(200).json({
                                data    : data,
                                message : "Coupon Applied Successfully!"
                            }); 
                        }    
                    }else{
                        data.paymentDetails.afterDiscountCouponAmount   = 0;
                        data.paymentDetails.netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + (maxServiceCharges && maxServiceCharges > 0 
                                                                                                                            ? maxServiceCharges > order_shippingCharges 
                                                                                                                                ? 
                                                                                                                                    (order_shippingCharges)
                                                                                                                                : 
                                                                                                                                    maxServiceCharges 
                                                                                                                            : 
                                                                                                                                (order_shippingCharges)
                                                                                                                        )).toFixed(2);
                        res.status(200).json({
                            data    : data,
                            message : "This Coupon Code is Only Applicable if Minimum Cart Amount is "+ isCouponValid.dataObj.minPurchaseAmount
                        });
                    }  
                }
            }
        }
    })
    .catch(err =>{
        console.log("Error while finding Cart Data => ",err);
        res.status(500).json({
            error   : err,
            message : "Error While finding Cart Details"
        });
    });
};

/**=========== Apply Credit Points ===========*/
exports.apply_credit_points = (req,res,next)=>{    
    // console.log("req.body == ",req.body);
    Carts.findOne({user_ID:ObjectId(req.body.user_ID)})
    .populate('vendorOrders.cartItems.product_ID')
    .populate('vendorOrders.vendor_id')
    .exec()
    .then(async(data)=>{
        if(data && data !== null){
            // console.log("data => ",data)
            var vendorOrders                = data.vendorOrders;
            var order_beforeDiscountTotal   = 0;
            var order_afterDiscountTotal    = 0;
            var order_discountAmount        = 0;
            var order_taxAmount             = 0;
            var order_shippingCharges       = 0;
            var maxServiceCharges           = 0;
            
            var wish                        = await Wishlists.find({user_ID:req.body.user_ID});
            var maxServiceChargesData       = await StorePreferences.findOne({},{maxServiceCharges : 1});
            var minOrderAmountData          = await StorePreferences.findOne({},{minOrderValue : 1})
            
            var creditPointsPolicy          = await CreditPointsPolicy.findOne();   
            if(creditPointsPolicy !== null && creditPointsPolicy.expiryLimitInDays){
                var creditPointValue	= creditPointsPolicy.creditPointValue;
                var creditPoint         = creditPointsPolicy.creditPoint;
            }

            var creditPointsData = await CreditPoints.findOne({user_id : ObjectId(req.body.user_ID)});
            if(creditPointsData && creditPointsData !== null){

                data.totalCreditPoints 		    = creditPointsData.totalPoints;
                data.totalCreditPointsValue 	= (creditPointsData.totalPoints * creditPointsPolicy.creditPointValue).toFixed(2);
            }else{
                data.totalCreditPoints 		    = 0;
                data.totalCreditPointsValue 	= 0;
            } 
            
            if(minOrderAmountData !== null && minOrderAmountData.minOrderValue > 0){
                var minOrderAmount = minOrderAmountData.minOrderValue;
            }else{
                var minOrderAmount = 0;
            }
            
            if(maxServiceChargesData !== null){
                maxServiceCharges = maxServiceChargesData.maxServiceCharges;
            }
            for(var i = 0; i<vendorOrders.length;i++){    
                var vendor_beforeDiscountTotal  = 0;
                var vendor_afterDiscountTotal   = 0;
                var vendor_discountAmount       = 0;
                var vendor_taxAmount            = 0;
                var vendor_shippingCharges      = 0; 
                
                var vendorShippingCharges = await getVendorWiseShippingCharges(vendorOrders[i].vendor_id._id, vendorOrders[i].vendorLocation_id, data.userDelLocation);
                
                if (vendorShippingCharges.code === "SUCCESS") {
                    vendor_shippingCharges = vendorShippingCharges.serviceCharges;
                }                    
                
                for(var j = 0; j < vendorOrders[i].cartItems.length;j++){
                    var inventoryData             	= await ProductInventory.findOne({productCode : data.vendorOrders[i].cartItems[j].product_ID.productCode, itemCode : data.vendorOrders[i].cartItems[j].product_ID.itemCode, vendor_ID : ObjectId(data.vendorOrders[i].cartItems[j].product_ID.vendor_ID)},{currentQuantity : 1});
				    data.vendorOrders[i].cartItems[j].product_ID.availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 						
                    
                    vendor_beforeDiscountTotal +=(vendorOrders[i].cartItems[j].product_ID.originalPrice * vendorOrders[i].cartItems[j].quantity);
                    if(vendorOrders[i].cartItems[j].product_ID.discountPercent !==0){
                        vendor_discountAmount +=((data.vendorOrders[i].cartItems[j].product_ID.originalPrice -data.vendorOrders[i].cartItems[j].product_ID.discountedPrice)* vendorOrders[i].cartItems[j].quantity);
                    }
                    

                    //======= Product Price without Tax =====
                    var discountedPrice = data.vendorOrders[i].cartItems[j].product_ID.discountedPrice ;
                    var quantity = vendorOrders[i].cartItems[j].quantity;

                    //======  TAX Calculation =============
                    var taxRate = vendorOrders[i].cartItems[j].product_ID.taxRate; 
                    var inclusiveTaxRate = 1 - (1/(1+ (taxRate/100) )) ;

                    if(vendorOrders[i].cartItems[j].product_ID.taxInclude){
                        var inclusiveTaxRate = 1 - (1/(1+ (taxRate/100) )) ;
                        var taxAmount = (
                                            vendorOrders[i].cartItems[j].product_ID.discountedPrice *
                                            inclusiveTaxRate *
                                            vendorOrders[i].cartItems[j].quantity
                                        );
                        discountedPrice = (discountedPrice * quantity)  - taxAmount; 
                        vendor_taxAmount += taxAmount ;
                    }else{
                        var taxAmount = (
                                                vendorOrders[i].cartItems[j].product_ID.discountedPrice *
                                                (taxRate/100)  *
                                                vendorOrders[i].cartItems[j].quantity
                                            );
                        vendor_taxAmount += taxAmount ;                                
                        discountedPrice = discountedPrice * quantity ;
                    }

                    vendor_afterDiscountTotal += discountedPrice;



                    data.vendorOrders[i].cartItems[j].product_ID.isWish = false;
                    if(wish.length > 0){
                        for(var k=0; k<wish.length; k++){
                            // console.log("String(wish[k].product_ID)",String(wish[k].product_ID));
                            // console.log("String(data.vendorOrders[i].cartItems[j].product_ID._id)",String(data.vendorOrders[i].cartItems[j].product_ID._id));
                            if(String(wish[k].product_ID) === String(data.vendorOrders[i].cartItems[j].product_ID._id)){
                                data.vendorOrders[i].cartItems[j].product_ID.isWish = true;
                                break;
                            }
                        } 
                    }     
                }
                if(j>=vendorOrders[i].cartItems.length){
                    data.vendorOrders[i].vendor_beforeDiscountTotal = (vendor_beforeDiscountTotal).toFixed(2);
                    data.vendorOrders[i].vendor_afterDiscountTotal  = (vendor_afterDiscountTotal).toFixed(2);
                    data.vendorOrders[i].vendor_discountAmount      = (vendor_discountAmount).toFixed(2);
                    data.vendorOrders[i].vendor_taxAmount           = (vendor_taxAmount).toFixed(2);
                    data.vendorOrders[i].vendor_shippingCharges     = (vendor_shippingCharges).toFixed(2);
                    data.vendorOrders[i].vendor_shippingChargesAfterDiscount     = (vendor_shippingCharges).toFixed(2);
                    // data.vendorOrders[i].vendor_netPayableAmount    = (vendor_afterDiscountTotal + vendor_taxAmount + vendor_shippingCharges).toFixed(2);
                    data.vendorOrders[i].vendor_netPayableAmount    = (vendor_afterDiscountTotal + vendor_taxAmount).toFixed(2);

                    order_beforeDiscountTotal   += vendor_beforeDiscountTotal;
                    order_afterDiscountTotal    += vendor_afterDiscountTotal;
                    order_discountAmount        += vendor_discountAmount;
                    order_taxAmount             += vendor_taxAmount;
                    order_shippingCharges       += vendor_shippingCharges;
                }
            }
            if(i>=vendorOrders.length){
                data.paymentDetails.beforeDiscountTotal         = (order_beforeDiscountTotal).toFixed(2);
                data.paymentDetails.afterDiscountTotal          = (order_afterDiscountTotal).toFixed(2);
                data.paymentDetails.discountAmount              = (order_discountAmount).toFixed(2);
                data.paymentDetails.taxAmount                   = (order_taxAmount).toFixed(2);
                /*----------- Apply Shipping charges not greter than max Shipping Charges -----------*/
                data.paymentDetails.shippingChargesBeforeDiscount = (order_shippingCharges).toFixed(2);
                data.paymentDetails.shippingCharges             = maxServiceCharges && maxServiceCharges > 0 
                                                                    ? maxServiceCharges > order_shippingCharges 
                                                                        ? 
                                                                            (order_shippingCharges).toFixed(2) 
                                                                        : 
                                                                            maxServiceCharges 
                                                                    : 
                                                                        (order_shippingCharges).toFixed(2);
                data.paymentDetails.afterDiscountCouponAmount   = 0;
                data.paymentDetails.creditPointsUsed            = Math.round((req.body.creditPointsValueUsed * creditPoint)/creditPointValue);
                data.paymentDetails.creditPointsValueUsed       = (req.body.creditPointsValueUsed).toFixed(2);
                data.paymentDetails.netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + (maxServiceCharges && maxServiceCharges > 0 
                                                                                                                    ? maxServiceCharges > order_shippingCharges 
                                                                                                                        ? 
                                                                                                                            (order_shippingCharges)
                                                                                                                        : 
                                                                                                                            maxServiceCharges 
                                                                                                                    : 
                                                                                                                        (order_shippingCharges)
                                                                                                                ) - (req.body.creditPointsValueUsed)).toFixed(2);
                data.minOrderAmount                             = minOrderAmount;
                if(maxServiceCharges && maxServiceCharges > 0 && maxServiceCharges < order_shippingCharges){
                    for(var k = 0; k<vendorOrders.length;k++){ 
                       var shippingChargesDiscountPercent                           = ((data.vendorOrders[k].vendor_shippingCharges * 100) / order_shippingCharges).toFixed(2); 
                       data.vendorOrders[k].vendor_shippingChargesAfterDiscount    = ((maxServiceCharges * shippingChargesDiscountPercent) / 100).toFixed(2);
                    }
                }
                // console.log("order_afterDiscountTotal  => ",order_afterDiscountTotal );
                // console.log("order_taxAmount  => ",order_taxAmount );
                // console.log("creditPointsValueUsed  => ",req.body.creditPointsValueUsed );
                // console.log("data.paymentDetails.creditPointsUsed  => ",data.paymentDetails.creditPointsUsed );
                // console.log("data.paymentDetails.creditPointsUsed  => ",data.paymentDetails.creditPointsUsed );
                // console.log("data.paymentDetails.creditPointsUsed  => ",data.paymentDetails.creditPointsUsed );
                // console.log("data.paymentDetails.creditPointsUsed  => ",data.paymentDetails.creditPointsUsed );
                // console.log("data.paymentDetails.creditPointsUsed  => ",data.paymentDetails.creditPointsUsed );
                // console.log("data.paymentDetails.creditPointsUsed  => ",data.paymentDetails.creditPointsUsed );
                // console.log("data.paymentDetails.creditPointsValueUsed => ",data.paymentDetails.creditPointsValueUsed);
            }
            // console.log("data",data);
            res.status(200).json(data);
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

/*========== Fetch Coupon Data ==========*/
function checkCouponValidity(couponCode, user_ID) { 
    var currDate = new Date();
    var selector = {
        "couponcode" : couponCode,
        "startdate"  : {$lte : currDate},
        "enddate"    : {$gte : currDate},
        "status"     : "Active"
    };
    
    return new Promise(function (resolve, reject) {
        Coupon.findOne(selector)
        .then(coupondata => {
            if(coupondata !== null){
                Orders.find({user_ID : user_ID, 'paymentDetails.disocuntCoupon_id' : coupondata._id})
                .then(orderData => {  
                    if(orderData.length < coupondata.couponLimit){
                        resolve({code: "SUCCESS", dataObj: coupondata});
                    }else{
                        resolve({code: "FAILED", message: "This Coupon Code used for "+orderData.length+" times and the max number of times the coupn can be used is "+coupondata.couponLimit});
                    }
                })
                .catch(error=>{
                    reject({code: "FAILED", message: "Some error in finding Order Data"});
                })
            }else{
                resolve({code: "FAILED", message: "Such Coupon Code Doesn't exist!"});
            }
        })
        .catch(error=>{
            reject({code: "FAILED", message: "Some error in finding Coupon"});
        })
    })
}

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


exports.delete_cart = (req,res,next)=>{
    Carts.deleteOne({user_ID : ObjectId(req.params.user_ID)})
    .exec()
    .then(data=>{
        console.log("Data After Deleteing Cart => ",data)
        res.status(200).json({
            "message": "Cart Deleted Successfully!"
        });
    })
    .catch(err =>{
        console.log(err);
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
