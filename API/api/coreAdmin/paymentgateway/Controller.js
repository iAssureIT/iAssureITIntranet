const mongoose	        = require("mongoose");
const PaymentGateway   = require('./Model.js');

exports.insertPaymentInfo = (req, res, next) => {
    // console.log("req.body In paymentgateway=>", req.body.namepayg);
    PaymentGateway
        .find({})
        .then(data =>{
            // if (data.length > 0) {
            //     res.status(409).json({ duplicated: true });
            // } else {
                const paymentgateway = new PaymentGateway({
                    _id         : new mongoose.Types.ObjectId(),
                    namepayg    : req.body.namepayg,
                    environment : req.body.environment,
                    status      : req.body.status,
                    secretkey   : req.body.secretkey,
                    partnerid   : req.body.partnerid,
                    createdBy   : req.body.createdBy,
                    createdAt   : new Date()
                })
                paymentgateway.save()
                    .then(data => {
                        res.status(200).json({ data });
                    })
                    .catch(err => {
                        console.log("err", err.code)
                        if (err.code == 11000) {
                            res.status(409).json({ duplicated: true });
                        } else {
                            res.status(500).json({ error: err });
                        }
    
                    });   
            // }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });


      
};
exports.fetch_PaymentGateway = (req, res, next)=>{
    PaymentGateway.find({})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(200).json({
                    message : "DATA_NOT_FOUND",
                })
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });            
};
exports.fetch_PaymentGateway_Single = (req, res, next)=>{
    PaymentGateway.findOne({ _id: req.params.id })
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(200).json({
                    message : "DATA_NOT_FOUND",
                })
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });            
};
exports.fetch_PaymentGateway_all = (req, res, next)=>{
    PaymentGateway.find({})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(200).json({
                    message : "DATA_NOT_FOUND",
                })
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });            
};

exports.updatePaymentgateway = (req, res, next)=>{
    // console.log("req.params.id==>",req.params.id);
        PaymentGateway.updateOne(
                { _id:req.params.id},  
                {
                    $set:   {   
                                "namepayg"    : req.body.namepayg,
                                "environment" : req.body.environment,
                                "status"      : req.body.status,
                                "secretkey"   : req.body.secretkey,
                                "partnerid"   : req.body.partnerid,
                            }
                }
            )
            .exec()
            .then(data=>{
                if(data.nModified == 1){
                    res.status(200).json({ updated : true });
                }else{
                    res.status(200).json({ updated : false });
                }
            })
            .catch(err =>{
                res.status(500).json({ error: err });
            });
};

exports.deletePaymentgateway = (req, res, next)=>{
    PaymentGateway.deleteOne({ _id:req.params.id})
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
