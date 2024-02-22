const mongoose = require('mongoose');

const shippingSchema = mongoose.Schema({
	_id			          	: mongoose.Schema.Types.ObjectId,
    shippingcosting              : String,
    // fromamount              : String,
    // toamount           	    : String,
    // shippingcost            : String,
    // shippingallow           : Boolean,
    createdBy               : String,
    createdAt               : Date
    });

module.exports = mongoose.model('shipping',shippingSchema);