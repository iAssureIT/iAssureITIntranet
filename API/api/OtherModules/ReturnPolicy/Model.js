const mongoose = require('mongoose');

const returnProductPolicySchema = mongoose.Schema({
	_id			      : mongoose.Schema.Types.ObjectId,    
    maxDaysToReturn   : Number,
    createdAt         : Date
});

module.exports = mongoose.model('returnpolicy',returnProductPolicySchema);
