const mongoose	        = require("mongoose");
const ModuleMaster     = require('./ModelModuleMaster.js');


exports.insertModule = (req,res,next)=>{
    processData();
    async function processData(){
    var allModules = await fetchAllModules();
    var moduleName = allModules.filter((data)=>{
        if (data.moduleName.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (moduleName.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const moduleMaster = new ModuleMaster({
                            _id                         : new mongoose.Types.ObjectId(),
                            moduleName                  : req.body.fieldValue,
                            createdBy                   : req.body.createdBy,
                            createdAt                   : new Date()
                        })
                        moduleMaster.save()
                        .then(data=>{
                            res.status(200).json({ created : true, fieldID : data._id });
                        })
                        .catch(err =>{
                            res.status(500).json({ error: err }); 
                        });
        }
    }          
};
var fetchAllModules = async ()=>{
    return new Promise(function(resolve,reject){ 
    ModuleMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.countModules = (req, res, next)=>{
    ModuleMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchModules = (req, res, next)=>{
    ModuleMaster.find({})
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
exports.getModules = (req, res, next)=>{
    ModuleMaster.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};
exports.fetchSingleModule = (req, res, next)=>{
    ModuleMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchModule = (req, res, next)=>{
    ModuleMaster.find({ moduleName: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateModule = (req, res, next)=>{
    ModuleMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'moduleName'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                ModuleMaster.updateOne(
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
exports.deleteModule = (req, res, next)=>{
    ModuleMaster.deleteOne({_id: req.params.fieldID})
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

exports.groupbylist = (req, res, next)=>{
    ModuleMaster.aggregate([
    {
    $lookup:
        {
           from: "facilitymasters",
           localField: "_id",
           foreignField: "moduleId",
           as: "facility"
        }
    },
    { $group : { _id : "$_id", modules: { $push: "$$ROOT" } } }])
    .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};


