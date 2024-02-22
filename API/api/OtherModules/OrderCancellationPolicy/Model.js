const mongoose = require('mongoose');

const orderCancellationPolicySchema = mongoose.Schema({
	_id			                : mongoose.Schema.Types.ObjectId,    
    maxDurationForCancelOrder   : Number,
    orderCancellationCharges    : Number,
    createdAt                   : Date
});

module.exports = mongoose.model('ordercancellationpolicy',orderCancellationPolicySchema);
