const mongoose	        = require("mongoose");
const TaxNameMaster     = require('./ModelTaxNameMaster.js');


exports.insertTaxName = (req,res,next)=>{
    processData();
    async function processData(){
    var allTaxNames = await fetchTaxNames();

    var taxName = allTaxNames.filter((data)=>{
        if (data.taxName.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
        })
        if (taxName.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const taxNameMaster = new TaxNameMaster({
                            _id                         : new mongoose.Types.ObjectId(),
                            taxName                     : req.body.fieldValue,
                            createdBy                   : req.body.createdBy,
                            createdAt                   : new Date()
                        })
                        taxNameMaster.save()
                        .then(data=>{
                            res.status(200).json({ created : true, fieldID : data._id });
                        })
                        .catch(err =>{
                            res.status(500).json({ error: err }); 
                        });
        }
    }
};
var fetchTaxNames = async ()=>{
    return new Promise(function(resolve,reject){ 
    TaxNameMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};
exports.countTaxNames = (req, res, next)=>{
    TaxNameMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchTaxNames = (req, res, next)=>{
    TaxNameMaster.find({})
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
exports.getTaxNames = (req, res, next)=>{
    TaxNameMaster.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};
exports.fetchSingleTaxName = (req, res, next)=>{
    TaxNameMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchLocationType = (req, res, next)=>{
    LocationTypeMaster.find({ locationType: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateTaxName = (req, res, next)=>{
    TaxNameMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'taxName'       : req.body.fieldValue  }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                TaxNameMaster.updateOne(
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
exports.deleteTaxName = (req, res, next)=>{
    TaxNameMaster.deleteOne({_id: req.params.fieldID})
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



