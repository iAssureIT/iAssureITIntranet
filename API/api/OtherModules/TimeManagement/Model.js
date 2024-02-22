const mongoose = require('mongoose');

const timeSchema = mongoose.Schema({
	_id			          	: mongoose.Schema.Types.ObjectId,
    fromtime                : String,
    totime           	    : String,
    createdBy               : String,
    createdAt               : Date
    });

module.exports = mongoose.model('shippingtimings',timeSchema);