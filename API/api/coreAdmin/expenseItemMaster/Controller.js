const mongoose              = require("mongoose");
const ExpenseItemMaster     = require('./Model.js');
const ExpenseTypeMaster     = require('../expenseTypeMaster/ModelExpenseTypeMaster.js');

exports.insertExpenseItemMaster = (req, res, next) => {
    processData();
    async function processData(){
    var expenseItem = await fetchExpenseItemList();

    var ExpenseItemName = expenseItem.filter((data)=>{
        if ( data.expenseTypeId == req.body.peId && data.expenseItem.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
            return data;
        }
    })
    if (ExpenseItemName.length > 0) {
        res.status(200).json({ duplicated : true });
    }else{
            const expenseItemMaster = new ExpenseItemMaster({
                _id             : new mongoose.Types.ObjectId(),
                expenseTypeId   : req.body.expenseTypeId,
                expenseItem     : req.body.expenseItem,
                HSN             : req.body.HSN,
                billingCode     : req.body.billingCode,
                createdBy       : req.body.createdBy,
                createdAt       : new Date()
            })
            expenseItemMaster.save()
                .then(data => {
                    res.status(200).json({ created: true, fieldID: data._id });
                })
                .catch(err => {
                    res.status(500).json({ error: err });
                });
        }
    }
};

var fetchExpenseItemList = async (req,res,next)=>{
        return new Promise(function(resolve,reject){ 
        ExpenseItemMaster.aggregate([
            {$lookup:
                {
                    from        : "expensetypemasters",
                    localField  : "expenseTypeId",
                    foreignField: "_id",
                    as          : "expenseTypeDetails"
                }
            },
            {"$unwind": "$expenseTypeDetails" },
            {$addFields: 
                { 
                    expenseType : "$expenseTypeDetails.type"
                }
            }
        ])
        .sort({createdAt : -1})
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    // console.log("a =>",a);
                    return {
                        "_id"             : a._id,
                        "expenseType"     : a.expenseType,
                        "expenseItem"     : a.expenseItem,
                        "HSN"             : a.HSN,
                        "billingCode"     : a.billingCode,
                        "expenseTypeId"   : a.expenseTypeId  
                    }
            })
            resolve( data )
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
    });
};

exports.fetchExpenseItemList = (req, res, next)=>{
    // console.log("in fetchExpenseItemList")
    ExpenseItemMaster.aggregate([
            {
            $lookup:
                {
                    from        : "expensetypemasters",
                    localField  : "expenseTypeId",
                    foreignField: "_id",
                    as          : "expenseTypeDetails"
                }
            },
            { "$unwind": "$expenseTypeDetails" },
            {$addFields: { type : "$expenseTypeDetails.type"}}
        ])
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            var alldata = data.map((a, i)=>{
                    // console.log("a =>",a);
                    return {
                        "_id"                : a._id,
                        "expenseType"        : a.type,
                        "expenseItem"        : a.expenseItem,
                        "HSN"                : a.HSN,
                        "billingCode"        : a.billingCode,
                        "expenseTypeId"      : a.expenseTypeId  
                    }
            })
            res.status(200).json(alldata);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};


exports.getExpenseItemList = (req, res, next) => {
    ExpenseItemMaster.find({})
        .sort({ createdAt: -1 })
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.getReimbursementItems = (req, res, next) => {
    ExpenseItemMaster.find({
        'billingCode':{$in:
                        [301, 302, 303, 304, 305]
                    }
      })
        .sort({ createdAt: -1 })
        .exec()
        .then(data => {
            // console.log("Data => ",data);
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.fetchSingleExpenseItem = (req, res, next) => {
    // console.log("Expense field Id = ", req.params.fieldID);
    ExpenseItemMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data => {
            // console.log("Expense One Data = ", data);
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.updateExpenseItem = (req, res, next) => {
    
    // console.log("req.params.fieldID==>",req.body.id)
    ExpenseItemMaster.updateOne(
            { _id: req.body.id },
            {
                $set: {
                    'expenseTypeId' : req.body.expenseTypeId,
                    'expenseItem'   : req.body.expenseItem,
                    'HSN'           : req.body.HSN,
                    'billingCode'   : req.body.billingCode,
                }
            }
        )
        .exec()
        .then(data => {
            // console.log("reqdata==>",data)
            if (data.nModified == 1) {
                ExpenseItemMaster.updateOne(
                    { _id: req.body.fieldID },
                    {
                        $push: {
                            'updateLog': [{
                                updatedAt: new Date(),
                                updatedBy: req.body.updatedBy
                            }]
                        }
                    })
                    .exec()
                    .then(data => {
                        res.status(200).json({ updated: true });
                    })
            } else {
                res.status(200).json({ updated: false });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.deleteExpenseItem = (req, res, next) => {
    ExpenseItemMaster.deleteOne({ _id: req.params.fieldID })
        .exec()
        .then(data => {
            if (data.deletedCount === 1) {
                res.status(200).json({ deleted: true });
            } else {
                res.status(200).json({ deleted: false });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
