const mongoose = require('mongoose');

const allowablePincodeSchema = mongoose.Schema({
	_id			       : mongoose.Schema.Types.ObjectId,    
    "franchiseID"      : String,
    "companyID"        : String,
    "allowablePincodes": Array,
    createdAt          : Date
});

module.exports = mongoose.model('allowablePincode',allowablePincodeSchema);
