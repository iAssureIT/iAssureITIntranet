const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
	_id			          	: mongoose.Schema.Types.ObjectId,
    discounttype            : String,
    discountin              : String,
	discountamount 			: String,
	discountquantity 		: String,
	discountparameters 		: String,
    discountvalue           : Number,
    startdate               : Date,
    enddate                 : Date,
    createdAt               : Date,
    });

module.exports = mongoose.model('discounts',discountSchema);