const mongoose  = require("mongoose");
var moment      = require('moment');

const ExpenseTypeMaster = require('./ModelExpenseTypeMaster.js');

exports.insertExpenseType = (req,res,next)=>{
    // console.log(" insertExpenseType body",req.body)
    processData();
    async function processData(){
    var allData = await fetchAllData();
    var type = allData.filter((data)=>{
        if (data.type == req.body.type.trim().toUpperCase()) {
            return data;
        }
        })    

        if (type.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            const expenseTypeMaster = new ExpenseTypeMaster({
                    _id           : new mongoose.Types.ObjectId(),
                    type          : req.body.type.toUpperCase(),
                    GSTRate       : req.body.GSTRate,
                    CGSTRate      : req.body.CGSTRate,
                    SGSTRate      : req.body.SGSTRate,
                    IGSTRate      : req.body.IGSTRate,
                    createdAt     : new Date(),
                })
                expenseTypeMaster.save()
                .then(data=>{
                    // console.log(" insertExpenseType data",data)

                    res.status(200).json({ created : true, fieldID : data._id });
                })
                .catch(err =>{
                    res.status(500).json({ error: err }); 
                });
        }
    }   
    
        
};

var fetchAllData = async ()=>{
    return new Promise(function(resolve,reject){ 
    ExpenseTypeMaster.find({})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.fetchExpenseTypeList = (req, res, next) => {
    ExpenseTypeMaster.find({})
        .sort({ createdAt: -1 })
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.showAllData = (req,res,next)=>{
    ExpenseTypeMaster.find({})
    .sort({createdAt : -1})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });

}

exports.getSingleData = (req,res,next)=>{
	ExpenseTypeMaster.find({_id:req.params.id})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};

exports.fetchSingleExpenseType = (req, res, next) => {
    ExpenseTypeMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.getDataByType = (req,res,next)=>{
    // console.log('------',req.params.type)
    ExpenseTypeMaster.find({type:req.params.type})
    .exec() 
    .then(data=>{
        // console.log('=========================',data)
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};

exports.updateExpenseType = (req,res,next)=>{
    // console.log("in Update Expense type = ", req.body);
    ExpenseTypeMaster.updateOne(

        { "_id" : req.body.id},
        {
            $set:{
                "type"       : req.body.type.toUpperCase(),
                "GSTRate"    : req.body.GSTRate,
                "CGSTRate"   : req.body.CGSTRate,
                "SGSTRate"   : req.body.SGSTRate,
                "IGSTRate"   : req.body.IGSTRate,
            }
        }
        )
        .exec()
        .then(data=>{
            // console.log("in Update Expense type data = ", data);
            if(data.nModified == 1){
                ExpenseTypeMaster.updateOne(
                { _id:req.body.id},
                {
                    $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                updatedBy      : req.body.updatedBy 
                                            }] 
                            }
                } )
                .exec()
                .then(data=>{
                    res.status(200).json({ updated : true });
                })
            }else{
                res.status(200).json({ updated : false });
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
}
exports.deleteExpenseType = (req, res, next)=>{
    ExpenseTypeMaster.deleteOne({_id: req.params.fieldID})
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


exports.deleteAllTaxes = (req, res, next) => {
    ExpenseTypeMaster.remove({})
      .exec()
      .then(data => {
        res.status(200).json({
          "message": "Taxes Deleted Successfully."
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  };
  