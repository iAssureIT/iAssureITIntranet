const mongoose          = require("mongoose");
const WarehouseMaster      = require('./ModelWareHouseMaster.js');


exports.insertWarehouse = (req,res,next)=>{
   /* BrandsMaster.findOne({  "brand" :  {$regex : req.body.fieldValue ,$options: "i"} })
        .exec()
        .then(data=>{
            if (data) {
                res.status(200).json({ duplicated : true });
            }else{*/
                const warehouseMaster = new WarehouseMaster({
                                _id                         : new mongoose.Types.ObjectId(),
                                warehouse                   : req.body.fieldValue,
                                createdBy                   : req.body.createdBy,
                                createdAt                   : new Date()
                            })
                            warehouseMaster.save()
                            .then(data=>{
                                // console.log("data",data);
                                res.status(200).json({ created : true, fieldID : data._id });
                            })
                            .catch(err =>{
                                res.status(500).json({ error: err }); 
                                console.log("error---->",err);
                            });
/*            }
        })
        .catch(err =>{
            res.status(500).json({ error: err }); 
        });  */                  
};

exports.countWarehouseMaster = (req, res, next)=>{
    WarehouseMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchWareHouseMaster = (req, res, next)=>{
    WarehouseMaster.find({})
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
exports.fetchSingleWareHouseMaster = (req, res, next)=>{
    WarehouseMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchWareHouseMaster = (req, res, next)=>{
    WarehouseMaster.find({ warehouse: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateWareHouseMaster = (req, res, next)=>{
    WarehouseMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'warehouse'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                WarehouseMaster.updateOne(
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
exports.deleteWarehouseMaster = (req, res, next)=>{
    WarehouseMaster.deleteOne({_id: req.params.fieldID})
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



