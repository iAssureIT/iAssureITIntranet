const mongoose = require('mongoose');

const creditPointsPolicySchema = mongoose.Schema({
	_id			                : mongoose.Schema.Types.ObjectId,    
    purchaseAmount              : Number,
    creditPoint                 : Number,
    creditPointValue            : Number,
    expiryLimitInDays           : Number,
    createdAt                   : Date
});

module.exports = mongoose.model('creditpointspolicy',creditPointsPolicySchema);
