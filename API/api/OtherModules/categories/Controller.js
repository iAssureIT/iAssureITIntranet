const mongoose	= require("mongoose");

var ObjectId    = require('mongodb').ObjectID;
const Category = require('./Model');
const Section = require('../sections/Model');
const Product = require('../products/Model');
const { json } = require("body-parser");

exports.insert_category = (req,res,next)=>{
    // console.log("req.body => ",req.body);
	Category.find({"category":req.body.category, "section":req.body.section})
		.exec()
		.then(async(data) =>{
            // console.log("insert category body",req.body)
            if(data && data.length > 0){
                res.status(200).json({
                    "message": "Category already exists.!"
                });
            }else{
                var categoryRankExist = await Category.findOne({"categoryRank" : req.body.categoryRank})
                // console.log("sectionRankExist =>",sectionRankExist)
                if(categoryRankExist && categoryRankExist !== null){ 
                    res.status(200).json({
                        "message": "Category Rank already exists!"
                    });
                }else{
                    const category = new Category({
                        _id                       : new mongoose.Types.ObjectId(),                    
                        category                  : req.body.category,
                        categoryNameRlang         : req.body.categoryNameRlang,
                        categoryUrl               : req.body.categoryUrl,
                        categoryRank              : req.body.categoryRank,
                        subCategory               : req.body.subCategory,
                        categoryDescription       : req.body.categoryDescription,
                        categoryImage             : req.body.categoryImage,
                        categoryIcon              : req.body.categoryIcon,
                        section                   : req.body.section,
                        section_ID                : req.body.section_ID,
                        status                    : "Published",
                        createdAt                 : new Date()
                    });
                    // console.log("Category:",category);
                    category.save()
                    .then(data=>{
                        // console.log("data => ",data);
                        res.status(200).json({
                            "message": "Category Submitted Successfully!"
                        });
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
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

exports.update_category = (req,res,next)=>{
    
    // console.log("subCategory:" ,req.body.subCategory);
    // console.log("Data:" ,req.body);
    processData();
    async function processData(){
        var categoryRankExist = await Category.findOne({"categoryRank" : req.body.categoryRank})
        // var categoryRankExist = await Category.findOne({_id: { $ne: ObjectId(req.body.category_ID) }, "categoryRank" : req.body.categoryRank})
        // console.log("categoryRankExist =>",categoryRankExist)
        if(categoryRankExist && categoryRankExist !== null && String(req.body.category_ID) !== String(categoryRankExist._id)){ 
            res.status(200).json({
                "message": "Category Rank already exists!"
            });
        }else{
            // console.log("req.body.subCategory => ",req.body.subCategory)
            if (req.body.subCategory && req.body.subCategory.length > 0) {
                var subCategories = Array.from(new Set(req.body.subCategory.map(a => a.subCategoryTitle)))
                                     .map(subCategory => {
                                       return req.body.subCategory.find(a => (a.subCategoryTitle).toLowerCase() === subCategory)
                                     })
            }else{
                var subCategories = [];
            }
            // console.log("subCategories => ",subCategories)
            Category.updateOne(
                { _id:req.body.category_ID},  
                {
                    $set:{
                    category                  : req.body.category,
                    categoryUrl               : req.body.categoryUrl,
                    categoryRank              : req.body.categoryRank,
                    categoryNameRlang         : req.body.categoryNameRlang,
                    subCategory               : req.body.subCategory,
                    categoryDescription       : req.body.categoryDescription,
                    categoryImage             : req.body.categoryImage,
                    categoryIcon              : req.body.categoryIcon,
                    section                   : req.body.section,
                    section_ID                : req.body.section_ID,
                    createdAt                 : new Date()
                    }
                }
            )
            .exec()
            .then(data=>{
                if(data.nModified === 1){
                    res.status(200).json({
                        "message": "Category Updated Successfully!"
                    });
                }else{
                    res.status(401).json({
                        "message": "Category Not Found"
                    });
                }
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
exports.list_section = (req,res,next)=>{
    Category.find().sort({"categoryRank": 1})       
        .exec()
        .then(data=>{
            // console.log("data:===",data);
            res.status(200).json(data);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.list_category = (req,res,next)=>{
    Category.find({"section_ID" : req.params.section_ID})
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
exports.list_category_with_limits = (req,res,next)=>{
    
    // console.log(req.body.startRange, req.body.limitRange);
    var selector        = {};
    selector['$and']    = [];

    /**----------- Seach Sections. ------------ */
    if(req.body.searchText && req.body.searchText !== ""){
        selector["$and"].push({ 
         $or : [           
                { "section"     : {'$regex' : req.body.searchText , $options: "i" } },            
                { "category"    : {'$regex' : req.body.searchText , $options: "i" } }, 
            ]           
        })
    }else{
        selector["$and"].push({  category : {"$ne" : ""}  })
    }

    Category.find(selector)
    // .skip(parseInt(req.body.startRange))
    // .limit(parseInt(req.body.limitRange))
    .sort({"createdAt" : -1})
    .then(data=>{
        // console.log('data', data);
        // var allData = data.map((x, i)=>{
        //     return {
        //         "_id"                   : x._id,
        //         "section"               : x.section,
        //         "category"              : x.category,
        //         "categoryNameRlang"     : x.categoryNameRlang ? "<span class='RegionalFont'>"+x.categoryNameRlang+"</span>" : '-',
        //         "categoryRank"          : x.categoryRank ? x.categoryRank : '',
        //         "subCategory"           : x.subCategory ? ((x.subCategory.map((a, i)=>{return '<p>'+a.subCategoryTitle+'</p>'})).toString()).replace(/,/g, " ") : [],
        //         "categoryDescription"   : x.categoryDescription ? x.categoryDescription : '',
        //         "categoryImage"         : x.categoryImage,
        //         "categoryIcon"          : x.categoryIcon,
        //         "status"                : x.status,
        //     }
        // })
        var allData = data.map((x, i)=>{
            return {
                "_id"                   : x._id,
                "section"               : x.section,
                "category"              : x.category,
                "categoryNameRlang"     : x.categoryNameRlang ? "<span class='RegionalFont'>"+x.categoryNameRlang+"</span>" : '-',
                "categoryRank"          : x.categoryRank ? x.categoryRank : '',
                "subCategory"           : x.subCategory 
                                            ? 
                                                (x.subCategory.map((a, i)=>{
                                                    // console.log("a.subCategoryTitle=> ",a.subCategoryTitle)
                                                    if(a.subCategoryTitle && a.subCategoryTitle !== undefined){
                                                        return {
                                                            _id                 : a._id+"-"+x._id,
                                                            subCategoryTitle    : a.subCategoryTitle,
                                                            subCategoryCode     : a.subCategoryCode,
                                                            subCategoryImage    : a.subCategoryImage,
                                                            subCategoryUrl      : a.subCategoryUrl,
                                                            status              : a.status,
                                                        }
                                                    }  
                                                                                                  
                                                }))
                                            :
                                                [],
                "categoryDescription"   : x.categoryDescription ? x.categoryDescription : '',
                "categoryImage"         : x.categoryImage,
                "categoryIcon"          : x.categoryIcon,
                "status"                : x.status,
            }
        })
        // console.log("allData => ",allData)
        res.status(200).json({
            dataCount   : allData.length,
            data        : allData.slice(parseInt(req.body.startRange), (parseInt(req.body.startRange) + parseInt(req.body.limitRange))) 
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.listFilterCategories = (req,res,next)=>{
    Category.find({section_ID : ObjectId(req.params.section_id)}, {category : 1, subCategory : 1})
    .sort({"category" : 1})
    .then(data=>{
        var allData = data.map((x, i)=>{
            return {
                "_id"                   : x._id,
                "category"              : x.category,
                "subCategory"           : x.subCategory && x.subCategory.length > 0
                                            ? 
                                                x.subCategory.sort(dynamicSort("subCategoryTitle"))
                                            :
                                                []
            }
        })
        // console.log("allData => ",allData)
        res.status(200).json(allData);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

function dynamicSort(property) {
    var sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        if(sortOrder == -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
}

exports.searchCategory = (req,res,next)=>{
    // console.log(req.body.startRange, req.body.limitRange);
    Category.find({
        $or: [
                { "section": { "$regex": req.body.searchText, $options: "i" } },
                { "category": { "$regex": req.body.searchText, $options: "i" } },
                { "categoryDescription": { "$regex": req.body.searchText, $options: "i" } },
            ]
    })
    .skip(parseInt(req.body.startRange))
    .limit(parseInt(req.body.limitRange))
    .exec()
    .then(data=>{
        // console.log('data', data);

        var allData = data.map((x, i)=>{
            return {
                "_id"                   : x._id,
                "section"               : x.section,
                "category"              : x.category,
                "categoryNameRlang"     : x.categoryNameRlang ? "<span class='RegionalFont'>"+x.categoryNameRlang+"</span>" : '-',
                "subCategory"           : x.subCategory ? ((x.subCategory.map((a, i)=>{return '<p>'+a.subCategoryTitle+'</p>'})).toString()).replace(/,/g, " ") : [],
                "categoryRank"          : x.categoryRank ? x.categoryRank : '',
                "categoryDescription"   : x.categoryDescription ? x.categoryDescription : '',
                "categoryImage"         : x.categoryImage,
                "categoryIcon"          : x.categoryIcon,
            }
        })

        res.status(200).json(allData);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.searchCategoryCount = (req,res,next)=>{
    // console.log(req.body.startRange, req.body.limitRange);
    Category.find({
        $or: [
                { "section": { "$regex": req.body.searchText, $options: "i" } },
                { "category": { "$regex": req.body.searchText, $options: "i" } },
                { "categoryDescription": { "$regex": req.body.searchText, $options: "i" } },
            ]
    })
    
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

exports.count_category = (req,res,next)=>{
    Category.find({})
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
exports.fetch_category = (req,res,next)=>{
    // console.log("insode fetch category => ", req.params.categoryID);
    Category.findOne({_id : ObjectId(req.params.categoryID)})
    .exec()
    .then(data=>{
        // console.log("data =>" ,data)
        res.status(200).json({
            "_id"                   : data._id,
            "section_ID"            : data.section_ID,
            "section"               : data.section,
            "category"              : data.category,
            "categoryUrl"           : data.categoryUrl,
            "categoryNameRlang"     : data.categoryNameRlang ? "<span class='RegionalFont'>"+data.categoryNameRlang+"</span>" : '-',
            "categoryRank"          : data.categoryRank ? data.categoryRank : '',
            "subCategory"           : data.subCategory 
                                        ? 
                                            (data.subCategory.map((a, i)=>{
                                                // console.log("a.subCategoryTitle=> ",a.subCategoryTitle)
                                                if(a.subCategoryTitle && a.subCategoryTitle !== undefined){
                                                    return {
                                                        _id                 : a._id+"-"+data._id,
                                                        subCategoryTitle    : a.subCategoryTitle,
                                                        subCategoryCode     : a.subCategoryCode,
                                                        subCategoryImage    : a.subCategoryImage,
                                                        subCategoryUrl      : a.subCategoryUrl,
                                                        status              : a.status,
                                                    }
                                                }  
                                                                                                
                                            }))
                                        :
                                            [],
            "categoryDescription"   : data.categoryDescription ? data.categoryDescription : '',
            "categoryImage"         : data.categoryImage,
            "categoryIcon"          : data.categoryIcon,
            "status"                : data.status
        })
        // res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.fetch_one_category = (req,res,next)=>{
    console.log("insode fetch category => ", req.body);
    // console.log(req.body.startRange, req.body.limitRange);
    var selector        = {};
    selector['$and']    = [];

    /**----------- Seach Sections. ------------ */
    // if(req.body.searchText && req.body.searchText !== ""){
    //     selector["$and"].push({ 
    //         subCategory : { 
    //             $elemMatch: { subCategoryTitle: {'$regex' : req.body.searchText , $options: "i" } } 
    //         }          
    //     })
    // }else{
    //     selector["$and"].push({  
    //         subCategory : { 
    //             $elemMatch: { subCategoryTitle: {'$regex' : {"$ne" : ""} , $options: "i" } } 
    //         }   })
    // }

    selector["$and"].push({_id : ObjectId(req.body.category_id)})
    // console.log("selector => ",selector.$and[0].subCategory)
    Category.findOne(selector)
    .exec()
    .then(data=>{
        // console.log("data =>" ,data)
        if(data !== null){
            res.status(200).json({
                "_id"                   : data._id,
                "section_ID"            : data.section_ID,
                "section"               : data.section,
                "category"              : data.category,
                "categoryUrl"           : data.categoryUrl,
                "categoryNameRlang"     : data.categoryNameRlang ? "<span class='RegionalFont'>"+data.categoryNameRlang+"</span>" : '-',
                "categoryRank"          : data.categoryRank ? data.categoryRank : '',
                "subCategory"           : data.subCategory 
                                            ? 
                                                (data.subCategory.map((a, i)=>{
                                                    // console.log("a.subCategoryTitle=> ",a.subCategoryTitle)
                                                    if(a.subCategoryTitle && a.subCategoryTitle !== undefined){
                                                        return {
                                                            _id                 : a._id+"-"+data._id,
                                                            subCategoryTitle    : a.subCategoryTitle,
                                                            subCategoryCode     : a.subCategoryCode,
                                                            subCategoryImage    : a.subCategoryImage,
                                                            subCategoryUrl      : a.subCategoryUrl,
                                                            status              : a.status,
                                                        }
                                                    }  
                                                                                                    
                                                }))
                                            :
                                                [],
                "categoryDescription"   : data.categoryDescription ? data.categoryDescription : '',
                "categoryImage"         : data.categoryImage,
                "categoryIcon"          : data.categoryIcon,
                "status"                : data.status
            })
        }else{
            res.status(200).json(data);
        }
        // res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.fetch_categories_by_section = (req,res,next)=>{
    Category.find({ section_ID: req.params.sectionID})
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


exports.fetch_categories_by_sectionUrl = (req,res,next)=>{
    // console.log("params => ",req.params.sectionUrl)
    Section.findOne({sectionUrl: req.params.sectionUrl})
    .then(sectiondata=>{
        // console.log("sectiondata => ",sectiondata)
        if(sectiondata && sectiondata !== null && sectiondata !== undefined){
            Category.find({section_ID: sectiondata._id})
            .exec()
            .then(data=>{
                // console.log("data => ",data)
                res.status(200).json(data);
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        }else{
            res.status(200).json({
                message : "No Section found"
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

exports.delete_category = (req,res,next)=>{
    console.log("In Delete Categories => ", req.params.categoryID);

    Product.findOne({category_ID : ObjectId(req.params.categoryID)})
    .exec()
    .then(pdata=>{
        if (pdata) {
            res.status(200).json({
                deleted     : false,
                message     : "You cannot delete this category as products are related to this category.!"
            });
        }else{
            Category.deleteOne({_id : ObjectId(req.params.categoryID)})
            .exec()
            .then(data=>{
                // console.log("Data After Deleteing Category => ",data)
                res.status(200).json({
                    deleted     : true,
                    "message"   : "Category Deleted Successfully!"
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


exports.deleteAllCategories = (req, res, next) => {
	Category.remove({})
	  .exec()
	  .then(data => {
		res.status(200).json({
		  "message": "All categories Deleted Successfully!"
		});
	  })
	  .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	  });
  };

exports.get_Category_with_limits = (req,res,next)=>{
    Shipping.find()  
        .skip(parseInt(req.params.startRange))
        .limit(parseInt(req.params.limitRange))     
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

exports.update_category_status = (req,res,next)=>{
    console.log("update_category_status Body = ", req.body);
    // console.log(" req.body.item_id ====" ,req.body.item_id);
    // console.log(" req.body.status ====" ,req.body.status);
    Category.updateOne(
        { _id : ObjectId(req.body.item_id)},  
        { $set : 
            {
                'status'                      : req.body.status,
                'subCategory.$[].status' 	: req.body.status,	
            }
        }
    )
    .exec()
    .then(async(data)=>{
        // console.log("data => ", data);
    //     await Category.update(
    //         { _id : ObjectId(req.body.item_id)},  
    //         { $set : 
    //             {
    //                 // status                      : req.body.status,
    //                 'subCategory.$[].status'     : req.body.status,  
    //             }
    //         }
    //     )
    //     .exec()
    // .then(async(data1)=>{
    //     console.log("data1 => ", data);
    //     })
    // .catch(err =>{
    //     console.log(err);
    //     // res.status(500).json({
    //     //     error: err
    //     // });
    // });
        await updateProductStatus(req.body.status, req.body.item_id);
        if(data.nModified == 1){
            res.status(200).json({
                "message": "Category " + req.body.status + " Successfully!"
            });
        }else{
            res.status(200).json({
                "message": "Failed to update category status"
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

exports.update_subcategory_status = (req,res,next)=>{
    console.log("body => ",req.body)
    Category.updateOne(
        { _id : ObjectId(req.body.item_id.split("-")[1]), 'subCategory._id' : ObjectId(req.body.item_id.split("-")[0])},  
        { $set : 
            {
                'subCategory.$.status' 	: req.body.status,	
            }
        }
    )
    .exec()
    .then(async(data)=>{
        await updateProductStatus(req.body.status, req.body.item_id.split("-")[0]);
        if (data.nModified === 1) {
            res.status(200).json({
                "message": "SubCategory " + req.body.status + " Successfully!"
            });
        } else {
            res.status(200).json({
                "message": "Failed to update SubCategory status!"
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

/** =========== updateProductStatus() =========== */
var updateProductStatus = async(status, id) =>{
    
    return new Promise(function (resolve, reject) {
        Product.updateMany(
            {$or :
                [
                    {category_ID     : ObjectId(id)},
                    {subCategory_ID  : ObjectId(id)}
                ]
            },
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

/**========== fetch_categories_by_vendor ===========*/
exports.fetch_categories_by_vendor = (req,res,next)=>{
    // console.log("req.params.sectionUrl => ",req.params.sectionUrl)
    Section.findOne({sectionUrl : req.params.sectionUrl})
    .then(sectiondata=>{
        if(sectiondata && sectiondata !== null && sectiondata !== undefined){  

            Product.find({section_ID : ObjectId(sectiondata._id), vendor_ID : ObjectId(req.params.vendorID), status : "Publish"}, {section_ID : 1, section : 1, category_ID : 1, category : 1,  subCategory_ID : 1, brand : 1})
            .then(productData=>{
                // console.log("productData",productData);
                if(productData && productData.length > 0){
                    processData();
                    async function processData(){   
                        var brandList            = [...new Set(productData.map(product => product.brand))];               
                        var categories           = [...new Set(productData.map(product => String(product.category_ID)).filter(product => product !== 'undefined'))];
                        var subCategories        = [...new Set(productData.map(product => String(product.subCategory_ID)).filter(product => product !== 'undefined'))];
                        // console.log("brandList",brandList.filter(brand => brand));
                        // console.log("subCategories",subCategories);
                        var categoryAndSubcategoryList = await getSubCategoryList(categories, subCategories);
                        // console.log("categoryAndSubcategoryList",categoryAndSubcategoryList);
                        if (categoryAndSubcategoryList && categoryAndSubcategoryList.length > 0) {
                            for (var i = 0; i < categoryAndSubcategoryList.length; i++) {
                                var categoryWiseProductList             = await productData.filter(product => String(product.category_ID) === String(categoryAndSubcategoryList[i]._id));
                                var categoryWiseBrandList               = [...new Set(categoryWiseProductList.map(product => product.brand))];
                                categoryAndSubcategoryList[i].brandList =  categoryWiseBrandList.filter(brand => brand);
                            }
                            if (i >= categoryAndSubcategoryList.length) {
                                res.status(200).json({
                                    categoryList    : categoryAndSubcategoryList,
                                    brandList       : brandList.filter(brand => brand)   
                                }); 
                            }
                        }else{
                            res.status(200).json({
                                categoryList    : categoryAndSubcategoryList,
                                brandList       : brandList.filter(brand => brand)   
                            });
                        }
                    }
                }
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error : err
                });
            });
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    }); 
};

/**=========== getCategoryList() ===========*/
function getCategoryList(categories){
    return new Promise(function(resolve,reject){
        Category.find({"_id" : {$in : categories}, "status" : "Published" }, {category : 1, _id : 1, categoryUrl : 1, "status" : "Published"})              
        .exec()
        .then(categoryDetails=>{
            // console.log("categoryDetails => ",categoryDetails);
            resolve(categoryDetails);
        })
        .catch(err =>{
            console.log(err);
            reject(err);
        }); 
    });
}

/**=========== getSubCategoryList() ===========*/
function getSubCategoryList(categories, subcategories){
    // console.log("categories===>",categories);
    // console.log("subcategories===>",subcategories);

    return new Promise(function(resolve,reject){
        Category.find(
            {
                "_id"                   : {$in : categories}, 
                "status"                : "Published",
                // "subCategory._id"       : {$in : subcategories}, 
                // "subCategory.status"    : "Published"
            }, 
            {                
                category                        : 1, 
                _id                             : 1, 
                categoryUrl                     : 1, 
                categoryRank                    : 1,
                categoryImage                   : 1,
                'subCategory._id'               : 1,
                'subCategory.subCategoryTitle'  : 1,
                'subCategory.subCategoryUrl'    : 1,
                'subCategory.status'            : 1,
            }
        )              
        .exec()
        .then(categoryDetails=>{
            // console.log("categoryDetails * => ",categoryDetails);
            if(categoryDetails && categoryDetails.length > 0){
                var returnData = categoryDetails.map((a, i)=>{
                    // console.log("a = > " , a)
                    return {
                        "_id"                   : a._id,
                        "category"              : a.category,
                        "categoryUrl"           : a.categoryUrl,
                        "categoryImage"         : a.categoryImage,
                        // "categoryNameRlang"     : categoryDetails.categoryNameRlang ? "<span class='RegionalFont'>"+categoryDetails.categoryNameRlang+"</span>" : '-',
                        "categoryRank"          : a.categoryRank ? a.categoryRank : '',
                        "subCategory"           : a.subCategory && a.subCategory.length > 0
                                                    ? 
                                                        filterByKey(subcategories, a.subCategory).filter(subcategory => subcategory.status === 'Published')
                                                    :
                                                        []
                    }
                })
                // console.log("returnData",returnData);
                resolve(returnData.sort((a, b) => a.categoryRank - b.categoryRank));
            }else{
                resolve([]);
            }
        })
        .catch(err =>{
            console.log(err);
            reject(err);
        }); 
    });
}

/** =============== filterByKey() =============== */
const filterByKey = (arr1 = [], arr2 = []) => {
    let res = [];
    res = arr2.filter(el => {
        const index = arr1.indexOf(String(el._id));
        return index !== -1;
    });
    return res;
}; 




exports.getSectionofCategory = (req,res,next)=>{
    console.log("req.params.categoryUrl => ",req.params.categoryUrl);

    Category.findOne({categoryUrl: req.params.categoryUrl})
            .then(categorydata=>{
                console.log("categorydata => ",categorydata)
                if(categorydata && categorydata !== null && categorydata !== undefined){
                    res.status(200).json({section: categorydata.section});
                }else{
                    res.status(200).json({
                        message : "No Category found"
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
