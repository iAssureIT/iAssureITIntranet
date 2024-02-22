const mongoose  = require("mongoose");
const Shipping = require('./Model');

exports.insert_shipping = (req,res,next)=>{
    Shipping.find({"shippingcosting":req.body.shippingcosting})
        .exec()
        .then(data =>{
            if (data.length == 0) {
        	const ShippingObj = new Shipping({
                        _id                       : new mongoose.Types.ObjectId(),                    
                        shippingcosting                : req.body.shippingcosting,
                        // fromamount                : req.body.fromamount,
                        // toamount                  : req.body.toamount,
                        // shippingcost              : req.body.shippingcost,
                        // shippingallow             : req.body.shippingallow,
                        createdBy 				  : req.body.createdBy, 	
                        createdAt                 : new Date()
                    });
                    // console.log('ShippingObj==>', ShippingObj);
                    ShippingObj.save()
                    .then(data=>{
                        res.status(200).json({
                    		"message": "Shipping Amount is submitted successfully!"
                		});
                    })
                    .catch(err =>{
                    	res.status(500).json({
		                    error: err
		                });
                    });
            }else{
                res.status(200).json({
                            "message": "Shipping Amount already exist!"
                        });
            }
        })
};        

exports.get_Shipping = (req,res,next)=>{
    Shipping.find()       
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

exports.get_single_Shipping = (req,res,next)=>{
    Shipping.findOne({_id : req.params.shippingID})       
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

exports.update_shipping = (req,res,next)=>{
    // console.log("Update Body = ", req.body);
    Shipping.updateOne(
            { _id:req.body.shippingID},  
            {
                $set:{
                    shippingcosting                : req.body.shippingcosting,
                    // fromamount                : req.body.fromamount,
                    // toamount                  : req.body.toamount,
                    // shippingcost              : req.body.shippingcost,
                    // shippingallow              : req.body.shippingallow,
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Shipping Amount Updated Successfully!"
                });
            }else{
                res.status(401).json({
                    "message": "Shipping Amount Not Updated!"
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

exports.delete_shipping = (req,res,next)=>{

    // Products.findOne({section_ID:req.params.sectionID})
    //     .exec()
    //     .then(pdata=>{
    //         if (pdata) {
    //             res.status(200).json({
    //                 "message": "You cannot delete this section as products are related to this section."
    //             });
    //         }else{
    //             Shipping.deleteOne({_id:req.params.sectionID})
    //                     .exec()
    //                     .then(data=>{
    //                         res.status(200).json({
    //                             "message": "Section Deleted Successfully."
    //                         });
    //                     })
    //                     .catch(err =>{
    //                         console.log(err);
    //                         res.status(500).json({
    //                             error: err
    //                         });
    //                     });

    //         }
    //     })
    //     .catch(err =>{
    //         console.log(err);
    //         res.status(500).json({
    //             error: err
    //         });
    //     }); 


    Shipping.deleteOne({_id:req.params.shippingID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Shiping Amount Deleted Successfully!"
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.count_section = (req,res,next)=>{
    Shipping.find({})
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

exports.get_Shipping_with_limits = (req,res,next)=>{
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

exports.get_megamenu_list = (req,res,next)=>{
   
    Shipping.aggregate([
    { $lookup:
        {
         from: 'categories',
         localField: '_id',
         foreignField: 'section_ID',
         as: 'categorylist'
        }
    },
    {
        // $sort: {
        //   "categorylist.createdAt": -1
        // }
        $sort: {
            "sectionRank": 1
          }
    }
    ])
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
