const mongoose = require('mongoose');

const creditPointsSchema = mongoose.Schema({
	_id			                : mongoose.Schema.Types.ObjectId,    
	user_id                     : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	totalPoints                 : Number,
	transactions                : [{
									order_id            : { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
									transactionDate     : Date,
									expiryDate     	  : Date,
									purchaseAmount      : Number,
									shippingCharges     : Number,
									totalAmount         : Number,
									earnedPoints        : Number,
									typeOfTransaction   : String,
									status  				  : String
								}],
	createdAt                   : Date
});

module.exports = mongoose.model('creditpoints',creditPointsSchema);
