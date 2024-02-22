const mongoose	        = require("mongoose");
var ObjectId            = require('mongodb').ObjectID;
const Wishlists         = require('./Model');
const AdminPreferences  = require('../../Ecommerce/adminPreference/Model.js');
const StorePreferences  = require('../../Ecommerce/StorePreferences/Model.js');
const ProductInventory 	= require('../ProductInventory/Model.js');
const _                 = require('underscore');  
const haversine         = require('haversine-distance')

exports.insert_wishlist = (req,res,next)=>{
    console.log("check insert_wishlist");
	Wishlists.find({user_ID:req.body.user_ID, product_ID:req.body.product_ID})
		.exec()
		.then(data =>{ 
            // console.log('data.length', data, data.length);
            if(data && data.length>0){
                Wishlists.deleteOne({user_ID:req.body.user_ID,product_ID:req.body.product_ID})
                .exec()
                .then(data=>{
                    res.status(200).json({
                        "message": "Product removed from wishlist successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            }else{
                const wishlists = new Wishlists({
                    _id                   : new mongoose.Types.ObjectId(),                    
                    user_ID               : req.body.user_ID,
                    product_ID            : req.body.product_ID,
                    userDelLocation       : req.body.userDelLocation,
                    vendor_id             : req.body.vendor_id,
                    vendorLocation_id     : req.body.vendorLocation_id,
                    createdAt             : new Date()
                });
                wishlists.save()
                .then(datas=>{
                    Wishlists.find({user_ID:req.body.user_ID}).countDocuments()
                    .exec()
                    .then(wishlist=>{
                        res.status(200).json({
                            "message": "Product added in wishlist successfully.",
                            "wishlistCount": wishlist
                        });
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            "message": "Product already in wishlist.",
                            error: err
                        });
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        "message": "Product already in wishlist.",
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

exports.list_wishlist = (req,res,next)=>{
    Wishlists.find()       
        .exec()
        .then(data=>{
            res.status(200).json(data);
            // console.log("res.data",data)
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.get_wishlist = (req,res,next)=>{
    Wishlists.find({user_ID:req.params.user_ID})
        .exec()
        .then(data=>{
                // console.log("wishlist res.data",data);
                res.status(200).json(data);
            
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};


// exports.get_user_wishlist = (req,res,next)=>{
//     Wishlists.find({user_ID:req.params.user_ID}) 
//         .populate("product_ID")      
//         .exec()
//         .then(data=>{
//                 console.log("wishlist res.data",data);
//                 var allData = data.map((x, i)=>{
//                 return {
//                     "_id"              : x.product_ID._id,
//                     "productName"      : x.product_ID.productName,
//                     "productNameRlang" : x.product_ID.productNameRlang,
//                     "brandNameRlang"   : x.product_ID.brandNameRlang,
//                     "productUrl"       : x.product_ID.productUrl,
//                     "originalPrice"    : x.product_ID.originalPrice,
//                     "availableQuantity": x.product_ID.availableQuantity,
//                     "size"             : x.product_ID.size,
//                     "shortDescription" : x.product_ID.shortDescription,
//                     "unit"             : x.product_ID.unit, 
//                     "bestSeller"       : x.product_ID.bestSeller,
//                     "brand"            : x.product_ID.brand,
//                     "category"         : x.product_ID.category,
//                     "currency"         : x.product_ID.currency,
//                     "discountPercent"  : x.product_ID.discountPercent,
//                     "discountedPrice"  : x.product_ID.discountedPrice,
//                     "productCode"      : x.product_ID.productCode,
//                     "productImage"     : x.product_ID.productImage,
//                     "product_ID"       : x.product_ID._id,
//                     "wishlist_ID"      : x._id,
//                     "isWish"           : true
//                 }
//             });            
//             console.log("allData===",allData);
//             res.status(200).json(allData);
            
//         })
//         .catch(err =>{
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
// };

/**=========== get_user_wishlist() ===========*/
exports.get_user_wishlist = (req,res,next)=>{
    Wishlists.find({user_ID : req.body.user_ID}) 
    .populate("product_ID")
    .then(async(wishdata)=>{
        var returnData = [];
        var maxKmRadius = await StorePreferences.findOne({},{maxRadius : 1})
        // console.log("maxKmRadius => ",maxKmRadius)
        var maxDistanceRadius = 0;
        if(maxKmRadius && maxKmRadius !== undefined){
            maxDistanceRadius = maxKmRadius.maxRadius;
        }
        for (var i = 0; i < wishdata.length; i++) {
            if (wishdata[i].product_ID !== null) {
                var inventoryData = await ProductInventory.findOne({productCode : wishdata[i].product_ID.productCode, itemCode : wishdata[i].product_ID.itemCode, vendor_ID : ObjectId(wishdata[i].product_ID.vendor_ID)},{currentQuantity : 1})
    			// console.log("inventoryData => ",inventoryData)

                var product = {
                    vendor_id           : wishdata[i].vendor_id,
                    vendorLocation_id   : wishdata[i].vendorLocation_id,
                    _id                 : wishdata[i].product_ID._id,
                    productName         : wishdata[i].product_ID.productName,
                    productNameRlang    : wishdata[i].product_ID.productNameRlang,
                    brandNameRlang      : wishdata[i].product_ID.brandNameRlang,
                    productUrl          : wishdata[i].product_ID.productUrl,
                    availableQuantity	: inventoryData && inventoryData !== null ? inventoryData.currentQuantity : 0,
                    originalPrice       : wishdata[i].product_ID.originalPrice,
                    size                : wishdata[i].product_ID.size,
                    shortDescription    : wishdata[i].product_ID.shortDescription,
                    unit                : wishdata[i].product_ID.unit, 
                    brand               : wishdata[i].product_ID.brand,
                    section             : wishdata[i].product_ID.section,
                    category            : wishdata[i].product_ID.category,
                    subCategory         : wishdata[i].product_ID.subCategory,
                    section_ID          : wishdata[i].product_ID.section_ID,
                    category_ID         : wishdata[i].product_ID.category_ID,
                    subCategory_ID      : wishdata[i].product_ID.subCategory_ID,
                    currency            : wishdata[i].product_ID.currency,
                    discountPercent     : wishdata[i].product_ID.discountPercent,
                    discountedPrice     : wishdata[i].product_ID.discountedPrice,
                    productCode         : wishdata[i].product_ID.productCode,
                    productImage        : wishdata[i].product_ID.productImage,
                    wishlist_ID         : wishdata[i]._id,
                    isWish              : true
                }

                var areaIndex = returnData.findIndex(record => record.areaName === wishdata[i].userDelLocation.delLocation);
                if(areaIndex >= 0){
                    returnData[areaIndex].products.push(product)
                }else{
                    var returnDataObject = {
                        areaName            : wishdata[i].userDelLocation.delLocation,
                        distance            : await calcUserDist(req.body.userLat, req.body.userLong, wishdata[i].userDelLocation.lat, wishdata[i].userDelLocation.long),
                        maxDistanceRadius   : maxDistanceRadius,
                        products            : [product]
                    }
                    returnData.push(returnDataObject);   
                }
            }               
        }
        if(i >= wishdata.length){
            res.status(200).json(returnData);  
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};


/**=========== calcUserDist() ===========*/
function calcUserDist(userLat1,userLong1, userLat2, userLong2){
    return new Promise(function(resolve,reject){
        processDistance();

        async function processDistance(){
            //First point User Location
            var userLocation1 = { lat: userLat1, lng: userLong1 }

            //Second point User Location
            var userLocation2 = { lat: userLat2, lng: userLong2 }       
            
            //Distance in meters (default)
            var distance_m = haversine(userLocation1, userLocation2);

            //Distance in miles
            var distance_miles = distance_m * 0.00062137119;

            //Distance in kilometers
            var distance_km = distance_m /1000; 
            
            //get unit of distance
            var unitOfDistance = await getAdminPreferences();
            if(unitOfDistance.toLowerCase() === "mile"){
                resolve(distance_miles.toFixed(2));
            }else{
                resolve(distance_km.toFixed(2));
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

exports.list_wishlist_with_limits = (req,res,next)=>{
    Wishlists.find()
    .exec()
    .then(data=>{
        // var allData = data.map((x, i)=>{
        //     return {
        //         "_id"                   : x._id,
        //         "wishlistCode"           : x.wishlistID,
        //         "wishlistName"           : x.wishlistName,
        //         "featured"              : x.featured,
        //         "exclusive"             : x.exclusive,
        //         "status"                : x.status
        //     }
        // })
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.count_wishlist = (req,res,next)=>{
    Wishlists.find({})
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
};

exports.usercount_wishlist = (req,res,next)=>{
    Wishlists.find({"user_ID": req.params.user_ID}).countDocuments()
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

exports.fetch_wishlist = (req,res,next)=>{
    Wishlists.find({_id : req.params.wishID})
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
exports.fetch_wishlist_product = (req,res,next)=>{
    Wishlists.findOne({"user_ID" : req.params.userID, "product_ID": req.params.productID})
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
exports.delete_wishlist = (req,res,next)=>{
    // console.log("req.params.wishlist_ID",req.params.wishlist_ID);
    Wishlists.deleteOne({_id :ObjectID(req.params.wishlist_ID)})
    .exec()
    .then(data=>{
        // console.log("data => ",data);
        if(data.deletedCount === 1){
            res.status(200).json({
                "message": "Product removed from wishlist successfully."
            });
        }else{
            res.status(200).json({
                "message": "Product not removed from wishlist."
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