const mongoose	        = require("mongoose");
const CategoryMaster     = require('./ModelCategoryMaster.js');
 

exports.insertCategory = (req,res,next)=>{
    processData();
    async function processData(){
    var allCategories = await fetchCategories();
    var category = allCategories.filter((data)=>{
        if (data.category.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (category.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const categoryMaster = new CategoryMaster({
                            _id                         : new mongoose.Types.ObjectId(),
                            category                    : req.body.fieldValue,
                            iconUrl                     : req.body.iconUrl,    
                            createdBy                   : req.body.createdBy,
                            createdAt                   : new Date()
                        })
                        categoryMaster.save()
                        .then(data=>{
                            res.status(200).json({ created : true, fieldID : data._id });
                        })
                        .catch(err =>{
                            res.status(500).json({ error: err }); 
                        });
        }
    }
};
var fetchCategories = async ()=>{
    return new Promise(function(resolve,reject){ 
    CategoryMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countCategories = (req, res, next)=>{
    CategoryMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchCategories = (req, res, next)=>{
    CategoryMaster.find({})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.getCategories = (req, res, next)=>{
    CategoryMaster.find({})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchSingleCategory = (req, res, next)=>{
    CategoryMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchCategory = (req, res, next)=>{
    CategoryMaster.find({ category: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateCategory = (req, res, next)=>{
    CategoryMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'category'       : req.body.fieldValue,
                           'iconUrl'        : req.body.iconUrl
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                CategoryMaster.updateOne(
                { _id:req.body.fieldID},
                {
                    $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                updatedBy      : req.body.updatedBy 
                                            }] 
                            }
                })
                .exec()
                .then(data=>{
                    res.status(200).json({ updated : true });
                })
            }else{
                res.status(200).json({ updated : false });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });
};
exports.deleteCategory = (req, res, next)=>{
    CategoryMaster.deleteOne({_id: req.params.fieldID})
        .exec()
        .then(data=>{
            if(data.deletedCount === 1){
                res.status(200).json({ deleted : true });
            }else{
                res.status(200).json({ deleted : false });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });            
};



