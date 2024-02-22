const mongoose	        = require("mongoose");
const Adminpreference   = require('../adminPreference/Model');
const EntityMaster      = require('../../coreAdmin/entityMaster/ModelEntityMaster');


exports.insert_preferences = (req, res, next) => {
    // console.log("res:",res);
	Adminpreference.findOne()
		.exec()
		.then(data =>{
			if(data){
            //   console.log("data:",data);
                Adminpreference.updateOne(
                    { _id:data._id},  
                    {
                        $set:{
                            "websiteModel"      : req.body.websiteModel,
                            "askPincodeToUser"  : req.body.askPincodeToUser,
                            "showLoginAs"       : req.body.showLoginAs,
                            "showInventory"     : req.body.showInventory,
                            "showDiscount"      : req.body.showDiscount,
                            "showCoupenCode"    : req.body.showCoupenCode,
                            "showOrderStatus"   : req.body.showOrderStatus,
                            "currency"          : req.body.currency,
                            "unitOfDistance"    : req.body.unitOfDistance
                        }
                    }
                )
                .exec()
                .then(data=>{
                    res.status(200).json({
                        "message": "WebSite model updated successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
			}else{                
            const adminpreference = new Adminpreference({
                _id                 : mongoose.Types.ObjectId(),      
                "websiteModel"      : req.body.websiteModel,
                "askPincodeToUser"  : req.body.askPincodeToUser,
                "showLoginAs"       : req.body.showLoginAs,
                "showInventory"     : req.body.showInventory,
                "showDiscount"      : req.body.showDiscount,
                "showCoupenCode"    : req.body.showCoupenCode,
                "showOrderStatus"   : req.body.showOrderStatus,
                "currency"          : req.body.currency,
                "unitOfDistance"    : req.body.unitOfDistance,
                 createdAt           : new Date()
            });            
            adminpreference.save(
                function(err){
                    if(err){
                        // console.log("error:",err);
                        return  res.status(500).json({
                            error: err
                        });          
                    }else{
                        res.status(200).json({ 
                            message: 'Preferences Saved Successfully.',
                            data: adminpreference
                        });
                    }
                }
            );
        }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.get_preferences = (req, res, next) => {
    Adminpreference.find()
    .exec()
    .then(data=>{
        //console.log("=============data found===========",data);
        // if(data[0].websiteModel === "SingleOwner"){
        //     EntityMaster.findOne({companyID: 1})
        //                 .then(singleVendor=>{
        //                     var singleVendor_id = singleVendor._id;
        //                     var prefAndVendorId = [{...data[0]._doc, singleVendor_id: singleVendor_id}];
        //                     // console.log("prefAndVendorId => ",prefAndVendorId);
                            
        //                     res.status(200).json(prefAndVendorId);
        //                 })
        //                 .catch(err =>{
        //                     console.log(err);
        //                     res.status(500).json({
        //                         error: err
        //                     });
        //                 });   
        // }else{
            res.status(200).json(data);
        // }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });   
}

