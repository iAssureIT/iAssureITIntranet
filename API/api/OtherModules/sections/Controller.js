const mongoose  = require("mongoose");
var ObjectId    = require('mongodb').ObjectID;
const Sections  = require('../sections/Model');
const Category  = require('../categories/Model');
const Products  = require('../products/Model');

exports.insert_section = (req,res,next)=>{
	var sectionUrl = req.body.section.replace(/\s+/g, '-').toLowerCase();

    Sections.find({"section"    :  { "$regex": req.body.section, $options: "i"}  })
    .exec()
    .then(async(data) =>{
        if (data.length === 0) {
            var sectionRankExist = await Sections.findOne({"sectionRank" : req.body.sectionRank})
            // console.log("sectionRankExist =>",sectionRankExist)
            if(sectionRankExist && sectionRankExist !== null){ 
                res.status(200).json({
                    "message": "Section Rank already exists!"
                });
            }else{
                const SectionObj = new Sections({
                    _id                       : new mongoose.Types.ObjectId(),                    
                    section                   : req.body.section,
                    sectionUrl                : sectionUrl,
                    sectionRank               : req.body.sectionRank,
                    createdBy 				  : req.body.createdBy, 
                    status                    : "Published", 	
                    createdAt                 : new Date(),
                    sectionImage              : req.body.sectionImage
                });
    
                SectionObj
                .save()
                .then(data=>{
                    res.status(200).json({
                        "message": "Section is submitted successfully!"
                    });
                })
                .catch(err =>{
                    res.status(500).json({
                        error: err
                    });
                });
            }
        }else{
            res.status(200).json({
                "message": "Section already exists!"
            });
        }
    })
};        

exports.get_sections = (req,res,next)=>{
    Sections.find({status : "Published"}) 
    .sort({"sectionRank" : 1})
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error : err
        });
    });
};

exports.getFilterSections = (req,res,next)=>{
    Sections.find({}, {section : 1}) 
    .sort({"section" : 1})
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error : err
        });
    });
};

exports.get_sections_list = (req,res,next)=>{
    Sections.find() 
    .sort({"sectionRank" : 1})
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error : err
        });
    });
};

exports.get_single_section = (req,res,next)=>{
    Sections.findOne({_id : req.params.sectionID})       
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

exports.update_section = (req,res,next)=>{
    console.log("Update Body = ", req.body);
    processData();
    async function processData(){
        var sectionRankExist = await Sections.findOne({"sectionRank" : req.body.sectionRank})
        console.log("sectionRankExist =>",sectionRankExist)
        if(sectionRankExist && sectionRankExist !== null && String(req.body.sectionID) !== String(sectionRankExist._id)){ 
            res.status(200).json({
                "message": "Section Rank already exists!"
            });
        }else{
            var sectionUrl = req.body.section.replace(/\s+/g, '-').toLowerCase();
            Sections.updateOne(
                { _id:req.body.sectionID},  
                {
                    $set:{
                    section                   : req.body.section,
                    sectionRank               : req.body.sectionRank,
                    sectionUrl                : sectionUrl,
                    sectionImage              : req.body.sectionImage
                    }
                }
            )
            .exec()
            .then(data=>{
                Category.updateOne(
                    {section_ID : req.body.sectionID},
                    { $set:{ section : req.body.section}
                    })
                    .exec()
                    .then(data=>{
                        // console.log(data);
                    }) 
                    .catch(err =>{console.log(err);})
        
                // if(data.nModified == 1){
                    res.status(200).json({
                        "message": "Section Updated Successfully!"
                    });
                // }else{
                //     res.status(401).json({
                //         "message": "Section Not Found"
                //     });
                // }
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        }
    }
};

exports.delete_section = (req,res,next)=>{

    Products.findOne({section_ID : req.params.sectionID})
    .exec()
    .then(pdata=>{
        if (pdata) {
            res.status(200).json({
                deleted     : false,
                message     : "You cannot delete this section as products are related to this section.!"
            });
        }else{
            Sections.deleteOne({_id:req.params.sectionID})
            .exec()
            .then(data=>{
                res.status(200).json({
                    deleted     : true,
                    message     : "Section Deleted Successfully!"
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


    /*Sections.deleteOne({_id:req.params.sectionID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Section Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });*/
};
exports.count_section = (req,res,next)=>{
    Sections.find({})
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

exports.get_sections_with_limits = (req,res,next)=>{
    Sections.find()  
        .sort({"createdAt" : -1})
        .skip(parseInt(req.params.startRange))
        .limit(parseInt(req.params.limitRange))     
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.get_sections_list_with_limits = (req,res,next)=>{
    console.log("req.body ==> ",req.body)
    var selector        = {};
    selector['$and']    = [];

    /**----------- Seach Sections. ------------ */
    if(req.body.searchText && req.body.searchText !== ""){
        selector["$and"].push(            
            { "section"   : {'$regex' : req.body.searchText , $options: "i" } },            
        )
    }else{
        selector["$and"].push({  section : {"$ne" : ""}  })
    }
    Sections.find(selector)  
    .sort({"createdAt" : -1})
    // .skip(parseInt(req.body.startRange))
    // .limit(parseInt(req.body.limitRange))     
    .then(data=>{

        res.status(200).json({
            dataCount   : data.length,
            data        : data.slice(parseInt(req.body.startRange), (parseInt(req.body.startRange) + parseInt(req.body.limitRange)))
        });
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.get_megamenu_list = (req,res,next)=>{
   
    Sections.aggregate([
        {$match : 
            {
                status : "Published"
            }
        },
        { $lookup :
            {
                from           : 'categories',
                localField     : '_id',
                foreignField   : 'section_ID',
                as             : 'categorylist'
            }
        },
        {$sort: {
                "sectionRank": 1
            }
        }
    ])
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.deleteAllSections = (req, res, next) => {
	Sections.remove({})
	  .exec()
	  .then(data => {
		res.status(200).json({
		  "message": "All Users Deleted Successfully!"
		});
	  })
	  .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	  });
  };


/**=========== get_list_for_section_category_block() =========== */
exports.get_list_for_section_category_block = (req,res,next)=>{
    // console.log("secreq.body => ",req.body);
    var startRange      = 0;
    var selector        = {}; 
    selector['$and']    = [];

    //=================================================
    // Now Section URL will be send instead of Section ID
    //=================================================

    selector["$and"].push({"status": "Published"})

    if(req.body.section && (req.body.section).toLowerCase() != "all"){
        selector["$and"].push({"_id": ObjectId(req.body.section) })
    }else{
        selector["$and"].push({"_id": {$ne: ""} })
    }

    if(req.body.sectionUrl && (req.body.sectionUrl).toLowerCase() != "all"){
        selector["$and"].push({"sectionUrl": req.body.sectionUrl })
    }else{
        selector["$and"].push({"sectionUrl": {$ne: ""} })
    }
    
    if(req.body.showCarousel){
        var limitRange = req.body.displayItemInCarousel * 2;
    }else if(req.body.numOfRows && req.body.numOfItemPerRow){
        var limitRange = req.body.numOfRows * req.body.numOfItemPerRow;
    }

    // console.log("selector => ",selector)

    Sections.aggregate([
        {$match : selector},
        { $lookup:
            {
                from            : 'categories',
                localField      : '_id',
                foreignField    : 'section_ID',
                as              : 'categorylist'
            }
        },
    ])
    .exec()    
    .then(sectiondata=>{
        // console.log("section data => ", sectiondata);
        var returnData = [];
        if (sectiondata && sectiondata.length > 0) {  
            processData();
            async function processData(){
                if (req.body.showOnlySection && req.body.section && (req.body.section).toLowerCase() === "all") {
                    // console.log("In Show only Sections => ", sectiondata);
                    for (var i = 0; i < sectiondata.length; i++) {
                        // console.log("sectiondata[i] => ", i, sectiondata[i]);
                        if(sectiondata[i].status === "Published"){
                            returnData.push({
                                _id         : sectiondata[i]._id,
                                itemName    : sectiondata[i].section,
                                itemUrl     : sectiondata[i].sectionUrl,
                                itemImg     : sectiondata[i].sectionImage
                            })    
                        }                
                    }
                    if(i >= sectiondata.length){
                        // console.log("returnData => ", returnData);
                        res.status(200).json(returnData.slice(startRange, limitRange));
                    }
                } else if (req.body.showOnlyCategory && req.body.section && (req.body.section).toLowerCase() !== "all" && req.body.category && (req.body.category).toLowerCase() === "all"){
                    // console.log("In Show only Categories => ", sectiondata[0].categorylist);

                    if (sectiondata[0].categorylist && sectiondata[0].categorylist.length > 0) {
                        for (var j = 0; j < sectiondata[0].categorylist.length; j++) {
                            // console.log("sectiondata[0].categorylist[j] => ", j, sectiondata[0].categorylist[j]);
                            if(sectiondata[0].categorylist[j].status === "Published"){
                                returnData.push({
                                    _id         : sectiondata[0].categorylist[j]._id,
                                    itemName    : sectiondata[0].categorylist[j].category,
                                    itemUrl     : sectiondata[0].categorylist[j].categoryUrl,
                                    itemImg     : sectiondata[0].categorylist[j].categoryImage
                                })  
                            }  
                        }
                        if(j >= sectiondata[0].categorylist.length){
                            // console.log("returnData => ", returnData);
                            res.status(200).json(returnData.slice(startRange, limitRange));
                        }                
                    }
                } else if (req.body.showOnlySubCategory && req.body.section && (req.body.section).toLowerCase() !== "all" && req.body.category && (req.body.category).toLowerCase() !== "all" && req.body.subCategory && (req.body.subCategory).toLowerCase() === "all"){
                    // console.log("In Show only SubCategories => ", sectiondata[0].categorylist);
                    if (sectiondata[0].categorylist && sectiondata[0].categorylist.length > 0) {
                        var filteredCategory = sectiondata[0].categorylist.filter((filteredcategory)=> String(filteredcategory._id) === String(req.body.category));
                        // console.log("filteredCategory => ",filteredCategory);
                        // console.log("filteredCategory => ",sectiondata[0].categorylist);
                        if(filteredCategory && filteredCategory.length > 0 && filteredCategory[0].subCategory  && filteredCategory[0].subCategory.length > 0){
                            for (var k = 0; k < filteredCategory[0].subCategory.length; k++) {
                                // console.log("filteredCategory[0].subCategory[j] => ", k, filteredCategory[0].subCategory[k]);
                                if(filteredCategory[0].subCategory[k].status === "Published"){
                                    returnData.push({
                                        _id         : filteredCategory[0].subCategory[k]._id,
                                        itemName    : filteredCategory[0].subCategory[k].subCategoryTitle,
                                        itemUrl     : filteredCategory[0].subCategory[k].subCategoryUrl,
                                        itemImg     : filteredCategory[0].subCategory[k].subCategoryImage
                                    })   
                                } 
                            }
                            if(k >= filteredCategory[0].subCategory.length){
                                // console.log("returnData => ", returnData);
                                res.status(200).json(returnData.slice(startRange, limitRange));
                            }   
                        }             
                    }
                }else if (req.body.showOnlyBrand && req.body.section && (req.body.section).toLowerCase() !== "all" && req.body.category && (req.body.category).toLowerCase() !== "all"){
                    // console.log("In Show only Brands => ", sectiondata[0].categorylist);
                    if (sectiondata[0].categorylist && sectiondata[0].categorylist.length > 0) {
                        var filteredCategory = sectiondata[0].categorylist.filter((filteredcategory)=> String(filteredcategory._id) === String(req.body.category));
                            
                        if(req.body.subCategory && (req.body.subCategory).toLowerCase() !== "all"){
                            if(filteredCategory && filteredCategory.length > 0){
                                var subcategoryBrands = await getCategoryBrands(req.body.section, req.body.category, req.body.subCategory);
                                // console.log("subcategoryBrands=> ",subcategoryBrands);
                                if(subcategoryBrands && subcategoryBrands.length > 0){   
                                    var uniqueBrands = [...new Set(subcategoryBrands.map(item => item.brand.trim()))]; 
                                    res.status(200).json(uniqueBrands.slice(startRange, limitRange));
                                }
                            } 
                        }else{
                            if(filteredCategory && filteredCategory.length > 0){
                                var categoryBrands = await getCategoryBrands(req.body.section, req.body.category);
                                if(categoryBrands && categoryBrands.length > 0){   
                                    var uniqueBrands = [...new Set(categoryBrands.map(item => item.brand.trim()))]; 
                                    res.status(200).json(uniqueBrands.slice(startRange, limitRange));
                                }
                            }  
                        }                               
                    }
                }
            }
        }else{
            res.status(200).json(returnData);
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

/**=========== get_list_for_section_category_block() =========== */
exports.get_list_for_section_category_block_by_url = (req,res,next)=>{

    console.log("section req.body => ",req.body);
    processData();
    async function processData(){
        var startRange      = 0;
        var selector        = {}; 
        selector['$and']    = [];
        

        selector["$and"].push({"status": "Published"})

        if(req.body.sectionUrl && (req.body.sectionUrl).toLowerCase() !== "all"){
            selector["$and"].push({"sectionUrl": req.body.sectionUrl })            
        }else{
            selector["$and"].push({"sectionUrl": {$ne: ""} })
        }
        
        
        if(req.body.showCarousel){
            var limitRange = req.body.displayItemInCarousel * 2;
        }else if(req.body.numOfRows && req.body.numOfItemPerRow){
            var limitRange = req.body.numOfRows * req.body.numOfItemPerRow;
        }

        console.log("selector => ",selector)

        Sections.aggregate([
            { $match : selector},
            { $lookup:
                {
                    from            : 'categories',
                    localField      : '_id',
                    foreignField    : 'section_ID',
                    as              : 'categorylist'
                }
            },
        ])
        .exec()    
        .then(async(sectiondata)=>{
            console.log("section data => ", sectiondata);
            var section_id      = "";
            var category_id     = "";
            var subCategory_id  = "";

            if(req.body.sectionUrl && (req.body.sectionUrl).toLowerCase() !== "all"){
                var sectionData = await Sections.findOne({"sectionUrl" : req.body.sectionUrl}, {_id : 1})
                console.log("sectionData => ",sectionData)
                if (sectionData !== null) {
                    section_id  =  sectionData._id;           
                }
            }

            if(req.body.categoryUrl && (req.body.categoryUrl).toLowerCase() !== "all"){
                var categoryData = await Category.findOne({"categoryUrl" : req.body.categoryUrl}, {_id : 1})
                console.log("categoryData => ",categoryData)
                if (categoryData !== null) {
                    category_id  =  categoryData._id;           
                } 
            }
            if(req.body.subCategoryUrl && (req.body.subCategoryUrl).toLowerCase() !== "all"){
                var subCategoryData = await Category.findOne({"categoryUrl" : req.body.categoryUrl,"subCategory.subCategoryUrl" : req.body.subCategoryUrl}, {'subCategory.$._id' : 1})
                console.log("subCategoryData => ",subCategoryData)
                if (subCategoryData !== null) {
                    subCategory_id  =  subCategoryData.subCategory._id;
                }
            }
            var returnData = [];
            if (sectiondata && sectiondata.length > 0) {  
                // processData();
                // async function processData(){
                    if (req.body.showOnlySection && req.body.sectionUrl && (req.body.sectionUrl).toLowerCase() === "all") {
                        console.log("In Show only Sections => ", sectiondata);
                        for (var i = 0; i < sectiondata.length; i++) {
                            // console.log("sectiondata[i] => ", i, sectiondata[i]);
                            if(sectiondata[i].status === "Published"){
                                returnData.push({
                                    _id         : sectiondata[i]._id,
                                    itemName    : sectiondata[i].section,
                                    itemUrl     : sectiondata[i].sectionUrl,
                                    itemImg     : sectiondata[i].sectionImage
                                })    
                            }                
                        }
                        if(i >= sectiondata.length){
                            console.log("returnData => ", returnData);
                            res.status(200).json(returnData.slice(startRange, limitRange));
                        }
                    } else if (req.body.showOnlyCategory && req.body.sectionUrl && (req.body.sectionUrl).toLowerCase() !== "all" && req.body.categoryUrl && (req.body.categoryUrl).toLowerCase() === "all"){
                        console.log("In Show only Categories => ", sectiondata[0].categorylist);

                        if (sectiondata[0].categorylist && sectiondata[0].categorylist.length > 0) {
                            for (var j = 0; j < sectiondata[0].categorylist.length; j++) {
                                // console.log("sectiondata[0].categorylist[j] => ", j, sectiondata[0].categorylist[j]);
                                if(sectiondata[0].categorylist[j].status === "Published"){
                                    returnData.push({
                                        _id         : sectiondata[0].categorylist[j]._id,
                                        itemName    : sectiondata[0].categorylist[j].category,
                                        itemUrl     : sectiondata[0].categorylist[j].categoryUrl,
                                        itemImg     : sectiondata[0].categorylist[j].categoryImage
                                    })  
                                }  
                            }
                            if(j >= sectiondata[0].categorylist.length){
                                console.log("returnData => ", returnData);
                                res.status(200).json(returnData.slice(startRange, limitRange));
                            }                
                        }
                    } else if (req.body.showOnlySubCategory && req.body.sectionUrl && (req.body.sectionUrl).toLowerCase() !== "all" && req.body.categoryUrl && (req.body.categoryUrl).toLowerCase() !== "all" && req.body.subCategoryUrl && (req.body.subCategoryUrl).toLowerCase() === "all"){
                        console.log("In Show only SubCategories => ", sectiondata[0].categorylist);
                        if (sectiondata[0].categorylist && sectiondata[0].categorylist.length > 0) {
                            var filteredCategory = sectiondata[0].categorylist.filter((filteredcategory)=> String(filteredcategory.categoryUrl) === String(req.body.categoryUrl));
                            // console.log("filteredCategory => ",filteredCategory);
                            // console.log("filteredCategory => ",sectiondata[0].categorylist);
                            if(filteredCategory && filteredCategory.length > 0 && filteredCategory[0].subCategory  && filteredCategory[0].subCategory.length > 0){
                                for (var k = 0; k < filteredCategory[0].subCategory.length; k++) {
                                    console.log("filteredCategory[0].subCategory[j] => ", k, filteredCategory[0].subCategory[k]);
                                    if(filteredCategory[0].subCategory[k].status === "Published"){
                                        returnData.push({
                                            _id         : filteredCategory[0].subCategory[k]._id,
                                            itemName    : filteredCategory[0].subCategory[k].subCategoryTitle,
                                            itemUrl     : filteredCategory[0].subCategory[k].subCategoryUrl,
                                            itemImg     : filteredCategory[0].subCategory[k].subCategoryImage
                                        })   
                                    } 
                                }
                                if(k >= filteredCategory[0].subCategory.length){
                                    console.log("returnData => ", returnData);
                                    res.status(200).json(returnData.slice(startRange, limitRange));
                                }   
                            }             
                        }
                    }else if (req.body.showOnlyBrand && req.body.sectionUrl && (req.body.sectionUrl).toLowerCase() !== "all" && req.body.categoryUrl && (req.body.categoryUrl).toLowerCase() !== "all"){
                        console.log("In Show only Brands => ", sectiondata[0].categorylist);
                        if (sectiondata[0].categorylist && sectiondata[0].categorylist.length > 0) {
                            var filteredCategory = sectiondata[0].categorylist.filter((filteredcategory)=> String(filteredcategory.categoryUrl) === String(req.body.categoryUrl));
                                
                            if(req.body.subCategoryUrl && (req.body.subCategoryUrl).toLowerCase() !== "all"){
                                if(filteredCategory && filteredCategory.length > 0){
                                    var subcategoryBrands = await getCategoryBrands(section_id, category_id, subCategory_id);
                                    console.log("subcategoryBrands=> ",subcategoryBrands);
                                    if(subcategoryBrands && subcategoryBrands.length > 0){   
                                        var uniqueBrands = [...new Set(subcategoryBrands.map(item => item.brand.trim()))]; 
                                        uniqueBrands     = uniqueBrands.filter(brand => brand)
                                        res.status(200).json(uniqueBrands.slice(startRange, limitRange));
                                    }
                                } 
                            }else{
                                if(filteredCategory && filteredCategory.length > 0){
                                    var categoryBrands = await getCategoryBrands(section_id, category_id);
                                    if(categoryBrands && categoryBrands.length > 0){   
                                        var uniqueBrands = [...new Set(categoryBrands.map(item => item.brand.trim()))]; 
                                        uniqueBrands     = uniqueBrands.filter(brand => brand)
                                        res.status(200).json(uniqueBrands.slice(startRange, limitRange));
                                    }
                                }  
                            }                               
                        }
                    }
                // }
            }else{
                res.status(200).json(returnData);
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
    }
};

/** =========== getCategoryBrands() =========== */
var getCategoryBrands = async(section_id, category_id, subCategory_id) =>{
    var selector = {};
    if(section_id && section_id !== undefined){
        selector.section_ID =  ObjectId(section_id);
    }
    if(category_id && category_id !== undefined){
        selector.category_ID = ObjectId(category_id);        
    }
    if(subCategory_id && subCategory_id !== undefined){
        selector.subCategory_ID = ObjectId(subCategory_id);
    }
    // console.log("selector => ", selector);
    return new Promise(function (resolve, reject) {
        Products.find(selector, {brand : 1})
        .exec()
        .then(data=>{
            // console.log("ProductData ===> ",data);
            resolve(data);
        })
        .catch(err =>{
            console.log(err);
            reject(err);
        });
    });    
} 


exports.update_section_status = (req,res,next)=>{
    console.log("update_section_status Body = ", req.body);
    Sections.updateOne(
        { _id : ObjectId(req.body.item_id)},  
        { $set : 
            {
                status   : req.body.status
            }
        }
    )
    .exec()
    .then(async(data)=>{
        await updateCategoryStatus(req.body.status, req.body.item_id);
        await updateProductStatus(req.body.status, req.body.item_id);
        
        // console.log("data => ",data);
    
        if(data.nModified == 1){
            res.status(200).json({
                "message": "Section " + req.body.status + " Successfully!"
            });
        }else{
            res.status(200).json({
                "message": "Faild to update status"
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


/** =========== updateCategoryStatus() =========== */
var updateCategoryStatus = async(status, section_id) =>{
    
    return new Promise(function (resolve, reject) {
        Category.updateMany(
            {section_ID : ObjectId(section_id)},
            { $set : 
                {
                    'status'                    : status,
                    'subCategory.$[].status'     : status,  
                }
            }
        )
        .exec()
        .then(data=>{
            console.log("CategoryData ===> ",data);
            resolve(data);
        }) 
        .catch(err =>{
            console.log(err);
            reject(err);
        })
    });    
} 

/** =========== updateProductStatus() =========== */
var updateProductStatus = async(status,section_id) =>{
    
    return new Promise(function (resolve, reject) {
        Products.updateMany(
            {section_ID : ObjectId(section_id)},
            { $set : 
                {
                    status : status 
                }
            }
        )
        .exec()
        .then(data=>{
            // console.log("ProductData ===> ",data);
            resolve(data);
        }) 
        .catch(err =>{
            console.log(err);
            reject(err);
        })
    });    
} 
