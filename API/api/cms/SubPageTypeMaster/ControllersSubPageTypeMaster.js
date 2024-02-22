const mongoose	        = require("mongoose");
const SubPageTypeMaster = require('./ModelSubPageTypeMaster.js');
 

exports.insertSubPageType = (req,res,next)=>{
    processData();
    async function processData(){
        var allSubPageType = await fetchSubPageType();
        var subPageType = allSubPageType.filter((data)=>{
            if (data.subPageType.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
                return data;
            }
        })
        if (subPageType.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const subPageTypeMaster = new SubPageTypeMaster({
                _id             : new mongoose.Types.ObjectId(),
                subPageType     : req.body.fieldValue,
                iconUrl         : req.body.iconUrl,    
                createdBy       : req.body.createdBy,
                createdAt       : new Date()
            })
            subPageTypeMaster.save()
            .then(data=>{
                res.status(200).json({ created : true, fieldID : data._id });
            })
            .catch(err =>{
                res.status(500).json({ error: err }); 
            });
        }
    }
};

var fetchSubPageType = async ()=>{
    return new Promise(function(resolve,reject){ 
    SubPageTypeMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.countSubPageType = (req, res, next)=>{
    SubPageTypeMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.fetchSubPageType = (req, res, next)=>{
    SubPageTypeMaster.find({})
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

exports.getSubPageType = (req, res, next)=>{
    SubPageTypeMaster.find({})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.fetchSingleSubPageType = (req, res, next)=>{
    SubPageTypeMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchSubPageType = (req, res, next)=>{
    SubPageTypeMaster.find({ subPageType: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
           res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.updateSubPageType = (req, res, next)=>{
    SubPageTypeMaster.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'subPageType'       : req.body.fieldValue,
                           'iconUrl'        : req.body.iconUrl
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                SubPageTypeMaster.updateOne(
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

exports.deleteSubPageType = (req, res, next)=>{
    SubPageTypeMaster.deleteOne({_id: req.params.fieldID})
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