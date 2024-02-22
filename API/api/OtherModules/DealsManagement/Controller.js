const mongoose   = require("mongoose");
const Deals      = require('./Model');
const Products   = require('../products/Model');
var ObjectId     = require('mongodb').ObjectID;

exports.insert_deals = (req, res, next) => {
    console.log("insert_deals request.body => ",req.body);
    const DealsObj = new Deals({
        _id: new mongoose.Types.ObjectId(),
        section               : req.body.section,
        category              : req.body.category,
        subCategory           : req.body.subCategory,  
        sectionID             : req.body.sectionID,
        categoryID            : req.body.categoryID,
        subCategoryID         : req.body.subCategoryID,    
        dealInPercentage      : req.body.dealInPercentage,
        updateAllProductPrice : req.body.updateAllProductPrice,
        dealImg               : req.body.dealImg,
        startdate             : req.body.startdate,
        enddate               : req.body.enddate,
        createdBy             : req.body.createdBy,
        createdAt             : new Date()
    });
    DealsObj
        .save()
        .then(dealsResponse => {

                if(req.body.sectionID === "all" &&  req.body.categoryID === "all"){
                   var query = {
                        
                    }
                }else if(req.body.sectionID !=="all" && req.body.categoryID === "all"){
                    var query = {
                        "section_ID" : req.body.sectionID
                    }
                }
                else{
                    var query = {
                        "section_ID" : req.body.sectionID, 
                        "category_ID": req.body.categoryID 
                    }
                }
                // Products.find({"section_ID" : req.body.sectionID, "category_ID": req.body.categoryID })
                Products.find(query)
                .then(productResponse =>{

                    // console.log("productResponse====",productResponse);
                    
                    if(productResponse){
                        //if(req.body.updateAllProducts){
                            dealInPercentage = parseInt(req.body.dealInPercentage);
                            main();
                            async function main(){
                                for(var i=0;i<productResponse.length;i++){   
                                    // console.log("productResponse i = > ",productResponse[i]);
                                   var updateResponse = await updateProductData(productResponse[i],dealInPercentage,req.body.updateAllProductPrice);
                                    // console.log("updateResponse = > ",updateResponse);

                                }
                                if(i >= productResponse.length){
                                    res.status(200).json({
                                        "message": "Products Updated successfully."
                                    });
                                }
                            }
                        //}
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });

            //}//if

            // res.status(200).json({
            //     "message": "Deals is submitted successfully."
            // });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

var updateProductData = async(productResponse,dealInPercentage,updateAllProducts) =>{
    // console.log("productResponse id ===",productResponse._id);
    
    return new Promise(function (resolve, reject) {
    if(updateAllProducts==="true"){                     
            Products.updateOne(
            { _id : ObjectId(productResponse._id)},  
            {
                $set:{
                    discountPercent           : dealInPercentage,
                    discountedPrice           : (productResponse.originalPrice - (dealInPercentage * productResponse.originalPrice / 100)).toFixed(2),
                }
            }
        )
        .exec()
        .then(data=>{
            // console.log("data = > ",data)
            if(data.nModified === 1){
                resolve({
                    "message": "Deals added and Product also Updated Successfully.",
                    // "product_ID" : data._id
                });
            }else{
                resolve({
                    "message": "Product Not Found"
                });
            }
        })
        .catch(err =>{
            console.log(err);
            reject({
                error: err
            });
        })
    }else{
        Products.updateOne(
            { _id : ObjectId(productResponse._id , {dealInPercentage : {$lt: dealInPercentage}})},  
            {
                $set:{
                    discountPercent           : dealInPercentage,
                    discountedPrice           : (productResponse.originalPrice - productResponse.originalPrice * dealInPercentage / 100).toFixed(2),
                }
            }
        )
        .exec()
        .then(data=>{
            // console.log("data = > ",data)
            if(data.nModified === 1){
                resolve({
                    "message": "Deals added and Product also Updated Successfully.",
                    // "product_ID" : data._id
                });
            }else{
                resolve({
                    "message": "Product Not Found"
                });
            }
        })
        .catch(err =>{
            console.log(err);
            reject({
                error: err
            });
        })
    }
    })
   
}

exports.get_deals = (req, res, next) => {
    // console.log("Inside get deals req.body===",req.body);
    var selector        = {}; 
    selector['$and']    = [];
    
    selector["$and"].push({"startdate": { $lte : new Date() }})
    selector["$and"].push({"enddate": { $gte : new Date() }})

    if(req.body.section && (req.body.section).toLowerCase() != "all"){
        selector["$and"].push({"section": req.body.section })
    }
    if(req.body.category && (req.body.category).toLowerCase() != "all"){
        selector["$and"].push({"category": req.body.category })
    }
    if(req.body.subCategory && (req.body.subCategory).toLowerCase() != "all"){
        selector["$and"].push({"subCategory": req.body.subCategory })
    }
    // console.log("selector===",selector);
    Deals.find(selector)
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.get_single_deal = (req, res, next) => {
    Deals.findOne({ _id: req.params.deal_id })
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.update_deal = (req, res, next) => {
    // console.log("Update Body = ", req.body);
    Deals.updateOne(
        { _id: req.body.deal_id },
        {
            $set: {
                section               : req.body.section,
                category              : req.body.category,
                subCategory           : req.body.subCategory,  
                sectionID             : req.body.sectionID,
                categoryID            : req.body.categoryID,
                subCategoryID         : req.body.subCategoryID,    
                dealInPercentage      : req.body.dealInPercentage,
                updateAllProductPrice : req.body.updateAllProductPrice,
                dealImg               : req.body.dealImg,
                startdate             : req.body.startdate,
                enddate               : req.body.enddate,
                createdBy             : req.body.updatedBy
            }
        }
    )
        .exec()
        .then(data => {
            if(req.body.sectionID === "all" &&  req.body.categoryID === "all"){
                   var query = {
                        
                    }
                }else if(req.body.sectionID !=="all" && req.body.categoryID === "all"){
                    var query = {
                        "section_ID" : req.body.sectionID
                    }
                }
                else{
                    var query = {
                        "section_ID" : req.body.sectionID, 
                        "category_ID": req.body.categoryID 
                    }
                }
                // Products.find({"section_ID" : req.body.sectionID, "category_ID": req.body.categoryID })
                Products.find(query)
                .then(productResponse =>{

                    // console.log("productResponse====",productResponse);
                    
                    if(productResponse){
                        //if(req.body.updateAllProducts){
                            dealInPercentage = parseInt(req.body.dealInPercentage);
                            main();
                            async function main(){
                                for(var i=0;i<productResponse.length;i++){   
                                    console.log("productResponse i = > ",productResponse[i]);
                                   var updateResponse = await updateProductData(productResponse[i],dealInPercentage,req.body.updateAllProductPrice);
                                    console.log("updateResponse = > ",updateResponse);

                                }
                                if(i >= productResponse.length){
                                    res.status(200).json({
                                        "message": "Products Updated successfully."
                                    });
                                }
                            }
                        //}
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            // res.status(200).json({
            //     "message": "Deal Updated Successfully."
            // });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_deal = (req, res, next) => {
    Deals.deleteOne({ _id: req.params.dealID })
        .exec()
        .then(data => {
            res.status(200).json({
                "message": "deal Deleted Successfully."
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.count_deal = (req, res, next) => {
    Deals.find({})
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

exports.delete_deals = (req, res, next) => {

    Deals.deleteOne({ _id: req.params.dealID })
    .exec()
    .then(data => {
        res.status(200).json({
            "message": "Deals Deleted Successfully."
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.get_deals_with_limits = (req, res, next) => {

    Deals.find()
        .skip(parseInt(req.params.startRange))
        .limit(parseInt(req.params.limitRange))
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};
