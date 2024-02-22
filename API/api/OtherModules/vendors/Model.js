const mongoose = require('mongoose');

const vendorsSchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    typeOptions               : String,
    companyName               : String,
    emailId                   : String,
    pan                       : String,
    tin                       : String,
    website                   : String,
    mobileNumber              : String,
    gstno                     : String,
    category                  : String,
    coino                     : String,
    mfg                       : String,
    score                     : String,
    Evaluation                : String,
    logo                      : String,
    attachedDocuments         : Array,
    locationDetails           : [
        {
        "locationType"        : String,
        "addressLineone"      : String,
        "city"                : String,
        "states"              : String,
        "district"            : String,
        "area"                : String,
        "addressLinetwo"      : String,
        "pincode"             : String,
        "country"             : String,
        }
    ],
    contactDetails            : [
        {
            "Location"          : String,
            "Designation"       : String,
            "ContactLevel"      : String,
            "Phone"             : String,
            "Email"             : String,
            "Name"              : String,
            "Reportinmanager"   : String,
            "AltPhone"          : String,
            "Landing"           : String,
        }, 
    ],
    productsServices          : Array,
    vendorID                  : Number,
    user_ID                 : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    owner_ID                  : String,
    createdBy                 : String,
    createdAt                 : Date
});

module.exports = mongoose.model('vendors',vendorsSchema);