const mongoose = require('mongoose');

const companysettingsSchema = mongoose.Schema({
    _id          : mongoose.Schema.Types.ObjectId,
    companyName            : String,
    companyContactNumber   : String,
    companyAltContactNumber    : String,
    companyEmail           : String,
    companyAltEmail        : String,
    companywebsite         : String,
    companyaddress         : String,
    countryCode            : String,
    country                : String,
    stateCode              : String,
    state                  : String,
    district               : String,
    taluka                 : String,
    city                   : String,
    pincode                : String,
    companyLogo            : String,
    companyLocationsInfo   : [
                                {
                                    locationType    : String,
                                    contactNumber   : String,
                                    blockName       : String,
                                    area            : String, 
                                    landmark        : String,   
                                    countryCode     : String,
                                    country         : String,
                                    stateCode       : String,
                                    state           : String,
                                    district        : String,
                                    taluka          : String,
                                    city            : String,
                                    pincode         : String,
                                    GST             : String,
                                    PAN             : String,
                                }
                            ],
    bankDetails             : [
                                {
                                    accHolderName : String,
                                    accNickName   : String,
                                    bankName      : String,
                                    accType       : String,
                                    branchName    : String,
                                    accNumber     : String, 
                                    ifscCode      : String,
                                }
                            ],
    taxSettings             : [
                                {
                                    taxType         : String,
                                    taxRating       : String,
                                    effectiveFrom   : Date,
                                    effectiveTo   : Date,
                                    createdAt       : Date,
                                }
                            ],
    paymentInfo             : [
                                {
                                    cashOnDelivery  : Boolean,
                                    paytm           : Boolean,
                                    UPI             : Boolean,
                                    bankTransfer    : Boolean
                                }
                            ]                        
}); 

module.exports = mongoose.model('companysettings',companysettingsSchema);
