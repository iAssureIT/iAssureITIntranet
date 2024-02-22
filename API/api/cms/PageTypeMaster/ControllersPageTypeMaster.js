const mongoose          = require("mongoose");
const PageType          = require('./ModelPageTypeMaster.js');


exports.insertPageType = (req,res,next)=>{
    processData();
    async function processData(){
        var allPageType = await fetchPageType()
        var pageType = allPageType.filter((data)=>{
            if (data.pageType.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
                return data;
            }
        })
        if (pageType.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const pageType = new PageType({
                _id       : new mongoose.Types.ObjectId(),
                pageType  : req.body.fieldValue,
                createdBy : req.body.createdBy,
                createdAt : new Date()
            })
            pageType.save()
                    .then(data=>{
                        res.status(200).json({ created : true, fieldID : data._id });
                    })
                    .catch(err =>{
                        console.log("err",err.code)
                        if (err.code == 11000) {
                            res.status(200).json({ duplicated : true });
                        }else{
                            res.status(500).json({ error: err });
                        }
                    });
        }
    }       
};

var fetchPageType = async ()=>{
    return new Promise(function(resolve,reject){ 
    PageType.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.countPageType = (req, res, next)=>{
    PageType.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.fetchPageType = (req, res, next)=>{
    PageType.find({})
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

exports.getPageType = (req, res, next)=>{
    PageType.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};

exports.fetchSinglePageType = (req, res, next)=>{
    PageType.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchPageType = (req, res, next)=>{
    PageType.find({ pageType: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.updatePageType = (req, res, next)=>{
    PageType.updateOne(
            { _id:req.body.fieldID },  
            {
                $set: {'pageType' : req.body.fieldValue}
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                PageType.updateOne(
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
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.deletePageType = (req, res, next)=>{
    PageType.deleteOne({_id: req.params.fieldID})
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

var fetchAllPageType = async (type)=>{
    return new Promise(function(resolve,reject){ 
    PageType.find()
        .sort({createdAt : -1})
        // .skip(req.body.startRange)
        // .limit(req.body.limitRange)
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        });
    });
};