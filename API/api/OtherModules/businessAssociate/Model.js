const mongoose = require('mongoose');

const baSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    companyName               : String,
    emailID                   : String,
    mobileNo                  : String,
    pan                       : String,
    website                   : String,
    gstno                     : String,
    logo                      : String,
    documents                 : Array,  
    locationDetails           : [
                                {
                                    addressLine1        : String,
                                    addressLine2        : String,
                                    countryCode         : String,
                                    stateCode           : String,
                                    district            : String,
                                    city                : String,
                                    area                : String,
                                    pincode             : String
                                }
                                ],
    contactDetails            : [
                                {
                                    name                : String,
                                    mobileNo            : String,
                                    email               : String,
                                    altMobileno         : String,
                                    officeLandlineNo    : String
                                }
                                ],
    createdBy                 : String,
    createdAt                 : Date,
    updatedBy                 : String,
    updatedAt                 : Date,
    userID                    : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
    
});

module.exports = mongoose.model('businessAssociate',baSchema);