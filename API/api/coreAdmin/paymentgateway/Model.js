const mongoose = require('mongoose');

const paymentgatewaySchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
    namepayg    : String,
    environment : String,
    status      : String,
    secretkey   : String,
    partnerid   : String,
    createdBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt   : { type: Date, default: Date.now() },
});

module.exports = mongoose.model('paymentgateway',paymentgatewaySchema);
