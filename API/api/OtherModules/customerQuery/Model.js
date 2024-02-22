const mongoose = require('mongoose');

const customerQuerySchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    customerID                : String,
    customerName              : String,
    customerMobile            : String,
    customerQuery             : String,
    createdAt                 : Date
});

module.exports = mongoose.model('customerQuery' ,customerQuerySchema);