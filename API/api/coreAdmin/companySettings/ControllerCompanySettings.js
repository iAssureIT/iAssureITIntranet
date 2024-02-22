const mongoose  = require("mongoose");

const Companysettings = require('./ModelCompanySettings.js');

exports.create_companysettings = (req,res,next)=>{
    Companysettings.find()
                    .exec()
                    .then(data =>{
                        const companysettings = new Companysettings({
                                _id                    : new mongoose.Types.ObjectId(),
                                companyName            : req.body.companyName,
                                companyContactNumber   : req.body.companyContactNumber,
                                companyAltContactNumber: req.body.companyAltContactNumber,
                                companyEmail           : req.body.companyEmail,
                                // companyAltEmail        : req.body.companyAltEmail,
                                companywebsite         : req.body.companywebsite,
                                companyaddress         : req.body.companyaddress,
                                countryCode            : req.body.country,
                                country                : req.body.countryName, 
                                stateCode              : req.body.state,
                                state                  : req.body.stateName,
                                district               : req.body.district,
                                taluka                 : req.body.taluka,
                                city                   : req.body.city, 
                                pincode                : req.body.pincode,
                                companyLogo            : req.body.companyLogo
                        });
                        companysettings.save()
                                        .then(data=>{
                                            res.status(200).json("CompanySetting Added");
                                        })
                                        .catch(err =>{
                                            console.log(err);
                                            res.status(500).json({
                                                error: err
                                            });
                                        });
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
};

exports.detail_companysettings = (req,res,next)=>{
    Companysettings.findOne({})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('Company Details not found');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.list_companysettings = (req,res,next)=>{
    Companysettings.find({})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('Company Details not found');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}


exports.update_companysettinginfo = (req,res,next)=>{
    // var roleData = req.body.role;
    Companysettings.updateOne(

        { _id : req.body.companyId},    
            {
                $set:{

                    "companyName"            : req.body.companyName,
                    "companyContactNumber"   : req.body.companyContactNumber,
                    "companyAltContactNumber": req.body.companyAltContactNumber,
                    "companyEmail"           : req.body.companyEmail,
                    "companywebsite"         : req.body.companywebsite,
                    "companyaddress"         : req.body.companyaddress,
                    "countryCode"            : req.body.country, 
                    "country"                : req.body.countryName,  
                    "stateCode"              : req.body.state, 
                    "state"                  : req.body.stateName, 
                    "district"               : req.body.district,
                    "taluka"                 : req.body.taluka,
                    "city"                   : req.body.city, 
                    "pincode"                : req.body.pincode,
                    "companyLogo"            : req.body.companyLogo
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company Setting Updated");
            }else{
                res.status(401).json("Company Setting Not Found");
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}


exports.addLocation = (req,res,next)=>{
    // var roleData = req.body.role;
    Companysettings.updateOne(
        {  _id : req.body.companyId},
        {
            $push:{
                companyLocationsInfo : {
                    locationType    : req.body.locationType,
                    contactNumber   : req.body.contactnumber,
                    blockName       : req.body.blockname,
                    area            : req.body.area,
                    landmark        : req.body.landmark,
                    countryCode     : req.body.countryCode,
                    country         : req.body.country,
                    stateCode       : req.body.stateCode,
                    state           : req.body.state,
                    district        : req.body.district,
                    taluka          : req.body.taluka,
                    city            : req.body.companyCity,
                    pincode         : req.body.companyPincode,
                    GST             : req.body.GST,
                    PAN             : req.body.PAN
                }
            }
        }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company Locations Details added");
            }else{
                res.status(200).json("Company not found");
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.singleLocation = (req,res,next)=>{
    // var roleData = req.body.role;
    Companysettings.findOne({"companyLocationsInfo._id":req.params.locationID}, {"companyLocationsInfo.$" : 1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
exports.singleTaxDetails = (req,res,next)=>{
    // var roleData = req.body.role;
    Companysettings.findOne({"taxSettings._id":req.params.taxDetailsID}, {"taxSettings.$" : 1})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
exports.update_location = (req,res,next)=>{
    // var roleData = req.body.role;
    Companysettings.updateOne(
        {  _id : req.body.companyId, "companyLocationsInfo._id":req.body.locationID },
        {
            $set:{
                    "companyLocationsInfo.$.locationType"    : req.body.locationType,
                    "companyLocationsInfo.$.contactNumber"   : req.body.contactnumber,
                    "companyLocationsInfo.$.blockName"       : req.body.blockname,
                    "companyLocationsInfo.$.area"            : req.body.area,
                    "companyLocationsInfo.$.landmark"        : req.body.landmark,
                    "companyLocationsInfo.$.countryCode"     : req.body.countryCode,
                    "companyLocationsInfo.$.country"         : req.body.country,
                    "companyLocationsInfo.$.stateCode"       : req.body.stateCode,
                    "companyLocationsInfo.$.state"           : req.body.state,
                    "companyLocationsInfo.$.district"        : req.body.district,
                    "companyLocationsInfo.$.taluka"          : req.body.taluka,
                    "companyLocationsInfo.$.city"            : req.body.companyCity,
                    "companyLocationsInfo.$.pincode"         : req.body.companyPincode,                           
                    "companyLocationsInfo.$.GST"             : req.body.GST,                           
                    "companyLocationsInfo.$.PAN"             : req.body.PAN                           
            }
        }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company Locations Details added");
            }else{
                res.status(404).json("Company Locations Not found");
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
exports.update_taxDetails = (req,res,next)=>{
    // var roleData = req.body.role;
    Companysettings.updateOne(
        {  _id : req.body.companyId, "taxSettings._id":req.body.taxID },
        {
            $set:{
                    "taxSettings.$.locationType"    : req.body.locationType,
                    "taxSettings.$.contactNumber"   : req.body.contactnumber,
                    "taxSettings.$.blockName"       : req.body.blockname,
                    "taxSettings.$.area"            : req.body.area,
                                               
            }
        }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company Tax Details added");
            }else{
                res.status(404).json("Company Tax Details Not found");
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.delete_location = (req,res,next)=>{    
    Companysettings.updateOne(
            { _id:req.params.companyID},  
            {
                $pull: { 'companyLocationsInfo' : {_id:req.params.locationID}}
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Location is deleted successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Location not found"
                });
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_taxDetails = (req,res,next)=>{    
    Companysettings.updateOne(
            { _id:req.params.companyID},  
            {
                $pull: { 'taxSettings' : {_id:req.params.taxDetailsID}}
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Tax details is deleted successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Tax details not found"
                });
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.addBankDetails = (req,res,next)=>{
    Companysettings.updateOne(
        {  _id : req.body.companyId},

        {
            $push:{
                bankDetails : {
                accHolderName       : req.body.accHolderName,
                accNickName         : req.body.accNickName,
                bankName            : req.body.bankName,
                accType             : req.body.accType,
                branchName          : req.body.branchName,
                accNumber           : req.body.accNumber,
                ifscCode            : req.body.ifscCode
                }
            }
        }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company banck details is added");
            }else{
                res.status(404).json("Company not found");
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.updateBankDetails = (req,res,next)=>{
    Companysettings.updateOne(
        {  _id : req.body.companyId, "bankDetails._id":req.body.bankDetailsId},
        {
            $set:{
                "bankDetails.$.accHolderName"       : req.body.accHolderName,
                "bankDetails.$.accNickName"         : req.body.accNickName,
                "bankDetails.$.bankName"            : req.body.bankName,
                "bankDetails.$.accType"             : req.body.accType,
                "bankDetails.$.branchName"          : req.body.branchName,
                "bankDetails.$.accNumber"           : req.body.accNumber,
                "bankDetails.$.ifscCode"            : req.body.ifscCode
            }
        }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company banck details is added");
            }else{
                res.status(404).json("Company not found");
            }
        })
        .catch(err =>{
            // console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.addTaxSettings = (req,res,next)=>{
    taxData();
    async function taxData(){
    var fromDate1 = req.body.effectiveFrom.replace(/-/g, '\/');
    var toDateForPreviousRecordISOFormat = new Date(new Date(fromDate1) - (24*60*60*1000) );
    var formateddate = new Date(toDateForPreviousRecordISOFormat);
    var toDateForPreviousRecord = formateddate.getFullYear()+'-' + (formateddate.getMonth()+1) + '-'+formateddate.getDate();
    var checkTaxSettings =  await checkTaxSettingsData();

    async function checkTaxSettingsData(){
        Companysettings.find({'_id': req.body.companyId})
        .exec()
        .then((res)=>{
            // console.log('res=>',res)
        })
        .catch((err)=>{
            console.log('checkTaxSettingsData err: ',err)
        })
    
    }
    // console.log('checkTaxSettings: ',checkTaxSettings)
    if(checkTaxSettings){

    }

    var queryResult =  await queryResultData();

    async function queryResultData() {
        Companysettings.aggregate([
        {$match:{'_id': req.body.companyId}},
        {$match:{
           'taxSettings':
                      {
                        $elemMatch:
                        { 
                          'taxType' : req.body.taxType , 
                            'effectiveTo' : "",
                          }
                    } 
                }},
                {$count:"count"}
    ])
    .exec()
    .then((res)=>{
        // console.log('res=>',res)
    })
    .catch((err)=>{console.log('queryResultData err: ',err)})
    }

    // console.log('formateddate: ',formateddate)
    // console.log('queryResult: ',queryResult)
    if(queryResult){
        // console.log('inside if')
        // console.log('req.body.taxType: ',req.body.taxType)
        Companysettings.updateOne({'taxSettings':
                      {
                        $elemMatch:
                        { 
                          'taxType' : req.body.taxType , 
                            'effectiveTo' : "",
                          }
                    }
          },
          {$set:{ 
              'taxSettings.$.effectiveTo' : formateddate,
              
              }
          },
        )
        .exec()
        .then((respose)=>{
            Companysettings.updateOne({'_id': req.body.companyId},
              {$push:{ taxSettings :{
                  taxType       : req.body.taxSettings.taxType,
                  taxRating : req.body.taxSettings.taxRating,
                  effectiveFrom : req.body.taxSettings.effectiveFrom,
                  effectiveTo : req.body.taxSettings.effectiveTo,
                  createdAt     : new Date(),
                }
              }
            },
            )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company tax details is added");
            }else{
                res.status(404).json("Company not found");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

        
    }else if(queryResult === undefined){
        const  taxSettings  = new Companysettings({
                _id               : new mongoose.Types.ObjectId(),                    
                taxSettings       :{
                "taxType"         : req.body.taxType,
                "taxRating"       : req.body.taxRating,
                "effectiveFrom"   : req.body.effectiveFrom,
                "effectiveTo"     : req.body.effectiveTo ? req.body.effectiveTo : null,
                }
            })
        taxSettings.save()
        .then(data=>{
            // if(data.nModified == 1){
            //     res.status(200).json("Company Tax Details added");
            // }else{
                res.status(200).json(data);
            // }
        })
        .catch(err =>{
            console.log("Companysettings save error",err);
            res.status(500).json({
                error: err
            });
        });
    }
    else{
        Companysettings.updateOne({'_id': req.body.companyId},
          {$push:{ taxSettings :{
              taxType       : req.body.taxType,
              taxRating : req.body.taxRating,
              effectiveFrom : req.body.effectiveFrom,
              effectiveTo : '',
              createdAt     : new Date(),
            }
          }
        },
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company tax details is added");
            }else{
                res.status(404).json("Company not found");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    } 
    
};
    
}
exports.updateTaxSettings = (req,res,next)=>{
    Companysettings.updateOne(
        {  _id : req.body.companyId,"taxSettings._id":req.body.taxId},
        {
            $set:{
                "taxSettings.$.taxType"         : req.body.taxSettings.taxType,
                "taxSettings.$.taxRating"       : req.body.taxSettings.taxRating,
                "taxSettings.$.effectiveFrom"   : req.body.taxSettings.effectiveFrom,
                "taxSettings.$.effectiveTo"     : req.body.taxSettings.effectiveTo,
            }
        }

        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Company Tax Details added");
            }else{
                res.status(404).json("Company Tax Not found");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.showAllTaxDetails = (req,res,next)=>{
    //{_id: req.params.companyID}
    Companysettings.find({})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });

}

exports.addPaymentInfo = (req,res,next)=>{
    Companysettings.updateOne(
        {   $set:{
                paymentInfo:[]
            }
        }
        )
        .exec()
        .then(data=>{
                Companysettings.updateOne({
                    $set:{
                        paymentInfo : req.body.paymentInfo
                    }}
                )
                .exec()
                .then(data=>{
                    if(data.nModified == 1){
                        res.status(200).json("Company tax details is added");
                    }else{
                        res.status(404).json("Company not found");
                    }
                })
            
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
// exports.update_companysettings = (req,res,next)=>{
//     var info = req.params.info;
//     var action = req.params.action;
//     switch(action){
//         case 'add' :
//             switch(info){
//                 case 'location':
//                      Companysettings.updateOne(

//                         { companyId : req.body.companyId},  
//                         {
//                             $push:{
//                                 companyLocationsInfo : {
//                                     Location        : req.body.Location,
//                                     contactnumber   : req.body.contactnumber,
//                                     blockname       : req.body.blockname,
//                                     landmark        : req.body.landmark,
//                                     companyDistrict : req.body.companyDistrict,
//                                     companyPincode  : req.body.companyPincode,
//                                     companyCity     : req.body.companyCity,
//                                     companyState    : req.body.companyState,
//                                     companyCountry  : req.body.companyCountry,
//                                     companytaluka   : req.body.companytaluka,
//                                 }
//                             }
//                         }
//                     )
//                     .exec()
//                     .then(data=>{
//                         if(data.nModified == 1){
//                             res.status(200).json("Company Locations Details added");
//                         }else{
//                             res.status(404).json("Company Locations Not found");
//                         }
//                     })
//                     .catch(err =>{
//                         console.log(err);
//                         res.status(500).json({
//                             error: err
//                         });
//                     });  
//                     break;              
//                 case 'tax' :
//                     Companysettings.updateOne(
//                         { companyId : req.body.companyId},  
//                         {
//                             $push:{
//                                 taxSettings : {
//                                     taxType         : req.body.taxType,
//                                     taxRating       : req.body.taxRating,
//                                     effectiveFrom   : req.body.effectiveFrom,
//                                     createdAt       : new Date(),
//                                 }
//                             }
//                         }
//                     )
//                     .exec()
//                     .then(data=>{
//                         if(data.nModified == 1){
//                             res.status(200).json("Company Tax Details added");
//                         }else{
//                             res.status(404).json("Company Tax Not found");
//                         }
//                     })
//                     .catch(err =>{
//                         console.log(err);
//                         res.status(500).json({
//                             error: err
//                         });
//                     });  
//                     break;
//                 case 'bank' :
//                     Companysettings.updateOne(

//                         { companyId : req.body.companyId},  
//                         {
//                             $push:{
//                                 bankDetails : {
//                                     accHolderName : req.body.accHolderName,
//                                     accNickName   : req.body.accNickName,
//                                     bankName      : req.body.bankName,
//                                     branchName    : req.body.branchName,
//                                     accType       : req.body.accType,
//                                     accNumber     : req.body.accNumber,
//                                     ifscCode      : req.body.ifscCode,
//                                 }
//                             }
//                         }
//                     )
//                     .exec()
//                     .then(data=>{
//                         if(data.nModified == 1){
//                             res.status(200).json("Company Bank Details added");
//                         }else{
//                             res.status(404).json("Company Bank Not found");
//                         }
//                     })
//                     .catch(err =>{
//                         console.log(err);
//                         res.status(500).json({
//                             error: err
//                         });
//                     });  
//                     break;
//                 default :
//                     res.status(404).json('This Information is not captured yet.')
//             };
//             break;
//         case 'remove' :
//             switch(info){
//                 case 'location':
//                     Companysettings.updateOne(
//                                         { companyId : req.body.companyID},  
//                                         {
//                                             $pull:{
//                                                 companyLocationsInfo : {
//                                                     _id        : req.body.locationID,
//                                                 }
//                                             }
//                                         }
//                                     )
//                                     .exec()
//                                     .then(data=>{
//                                         if(data.nModified == 1){
//                                             res.status(200).json("Company Location removed");
//                                         }else{
//                                             res.status(404).json("Company Location Not found");
//                                         }
//                                     })
//                                     .catch(err =>{
//                                         console.log(err);
//                                         res.status(500).json({
//                                             error: err
//                                         });
//                                     });  
//                     break;
//                 case 'tax' :
//                     Companysettings.updateOne(
//                                         { companyId : req.body.companyID},  
//                                         {
//                                             $pull:{
//                                                 taxSettings : {
//                                                     _id        : req.body.taxID,
//                                                 }
//                                             }
//                                         }
//                                     )
//                                     .exec()
//                                     .then(data=>{
//                                         if(data.nModified == 1){
//                                             res.status(200).json("Company Tax Settings removed");
//                                         }else{
//                                             res.status(404).json("Company Not found");
//                                         }
//                                     })
//                                     .catch(err =>{
//                                         console.log(err);
//                                         res.status(500).json({
//                                             error: err
//                                         });
//                                     });  
//                     break;
//                 case 'bank' 
//                     Companysettings.updateOne(
//                                         { companyId : req.body.companyID},  
//                                         {
//                                             $pull:{
//                                                 bankDetails : {
//                                                     _id        : req.body.bankID,
//                                                 }
//                                             }
//                                         }
//                                     )
//                                     .exec()
//                                     .then(data=>{
//                                         if(data.nModified == 1){
//                                             res.status(200).json("Company Bank Details removed");
//                                         }else{
//                                             res.status(404).json("Company Not found");
//                                         }
//                                     })
//                                     .catch(err =>{
//                                         console.log(err);
//                                         res.status(500).json({
//                                             error: err
//                                         });
//                                     });  
//                     break;
//                 default :
//                     res.status(404).json('This Information is not captured yet.')
//             };
//             break;
//         case 'edit' :
//             switch(info){
//                 case 'location':
//                     Companysettings.updateOne(
//                         { "companyId" : req.body.companyId, "companyLocationsInfo._id":req.body.locationID},  
//                         {
//                             $set:{
//                                 "companyLocationsInfo.$.location"          : req.body.location,
//                                 "companyLocationsInfo.$.companyAddress"    : req.body.companyAddress,
//                                 "companyLocationsInfo.$.companyPincode"    : req.body.companyPincode,
//                                 "companyLocationsInfo.$.companyCity"       : req.body.companyCity,
//                                 "companyLocationsInfo.$.companyState"      : req.body.companyState,
//                                 "companyLocationsInfo.$.companyCountry"    : req.body.companyCountry,  
                                
//                             }
//                         }
//                     )
//                     // Companysettings.updateOne(
//                     //                     { "companyId" : req.body.companyID, "companyLocationsInfo._id":req.body.locationID},  
//                     //                     {
//                     //                         $set:{
//                     //                             "companyLocationsInfo.$.location"          : req.body.location,
//                     //                             "companyLocationsInfo.$.companyAddress"    : req.body.companyAddress,
//                     //                             "companyLocationsInfo.$.companyPincode"    : req.body.companyPincode,
//                     //                             "companyLocationsInfo.$.companyCity"       : req.body.companyCity,
//                     //                             "companyLocationsInfo.$.companyState"      : req.body.companyState,
//                     //                             "companyLocationsInfo.$.companyCountry"    : req.body.companyCountry,                                                
//                     //                         }
//                     //                     }
//                     //                 )
//                                     .exec()
//                                     .then(data=>{
//                                         if(data.nModified == 1){
//                                             res.status(200).json("Company Location updated");
//                                         }else{
//                                             res.status(404).json("Company Location Not found");
//                                         }
//                                     })
//                                     .catch(err =>{
//                                         console.log(err);
//                                         res.status(500).json({
//                                             error: err
//                                         });
//                                     });  
//                     break;
//                 case 'tax' :
//                     Companysettings.updateOne(
//                                         { "companyId" : req.body.companyID, "taxSettings._id":req.body.taxID},  
//                                         {
//                                             $set:{
//                                                 "taxSettings.$.taxType"          : req.body.taxType,
//                                                 "taxSettings.$.taxRating"        : req.body.taxRating,
//                                                 "taxSettings.$.effectiveFrom"    : req.body.effectiveFrom,
//                                                 // "taxSettings.$.effectiveTo"      : req.body.effectiveTo
//                                             }
//                                         }
//                                     )
//                                     .exec()
//                                     .then(data=>{
//                                         if(data.nModified == 1){
//                                             res.status(200).json("Company Tax updated");
//                                         }else{
//                                             res.status(404).json("Company Tax Not found");
//                                         }
//                                     })
//                                     .catch(err =>{
//                                         console.log(err);
//                                         res.status(500).json({
//                                             error: err
//                                         });
//                                     });  
//                     break;
//                 case 'bank' :
//                     Companysettings.updateOne(
//                                         { "companyId" : req.body.companyID, "bankDetails._id":req.body.bankID},  
//                                         {
//                                             $set:{
//                                                 "bankDetails.$.accHolderName" : req.body.accHolderName,
//                                                 "bankDetails.$.bankName"      : req.body.bankName,
//                                                 "bankDetails.$.branchName"    : req.body.branchName,
//                                                 "bankDetails.$.accNumber"     : req.body.accNumber,
//                                                 "bankDetails.$.ifscCode"      : req.body.ifscCode,
//                                             }
//                                         }
//                                     )
//                                     .exec()
//                                     .then(data=>{
//                                         if(data.nModified == 1){
//                                             res.status(200).json("Company Bank Details updated");
//                                         }else{
//                                             res.status(404).json("Company Bank Not found");
//                                         }
//                                     })
//                                     .catch(err =>{
//                                         console.log(err);
//                                         res.status(500).json({
//                                             error: err
//                                         });
//                                     });  
//                     break;
//                 default :
//                     res.status(404).json('This Information is not captured yet.')
//             };
//         break;
//         default :
//             res.status(404).json('Action Not found');
//             break;
//     }
// }

// exports.update_companysettinginfo = (req,res,next)=>{
//     // var roleData = req.body.role;
//     Companysettings.updateOne(
//         { companyId : req.body.companyId},    
//             {
//                 $set:{
           
//                     "companyName"            : req.body.companyName,
//                     "companyContactNumber"   : req.body.companyContactNumber,
//                     "companyMobileNumber"    : req.body.companyMobileNumber,
//                     "companyEmail"           : req.body.companyEmail,
//                     "companyAltEmail"        : req.body.companyAltEmail,
//                     "companywebsite"         : req.body.companywebsite,
//                     "companyaddress"         : req.body.companyaddress,
//                     "city"                   : req.body.city, 
//                     "country"                : req.body.country,
//                     "state"                  : req.body.state,
//                     "district"               : req.body.district,
//                     "pincode"                : req.body.pincode,
//                     "taluka"                 : req.body.taluka,
                
//                 }
//             }
//         )
//         .exec()
//         .then(data=>{
//             if(data.nModified == 1){
//                 res.status(200).json("Company Setting Updated");
//             }else{
//                 res.status(401).json("Company Setting Not Found");
//             }
//         })
//         .catch(err =>{
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
// }


exports.delete_companysettings = (req,res,next)=>{
    Companysettings.deleteOne({_id:req.params.companysettingsID})
        .exec()
        .then(data=>{
            res.status(200).json("Company Settings deleted");
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
