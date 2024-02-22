const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
	_id				: mongoose.Schema.Types.ObjectId,
	invoiceNum		: Number,
	user_ID			: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
	userName		: String,
	userEmail		: String,
	userMobile 		: String,
	itemName		: String,
	qty				: Number,
	price			: Number,
	total			: Number,
	features 		: [String],	
	subTotal 		: Number,
	tax				: Number,
	grandTotal		: Number,
	createdAt 		: Date,
	createdBy		: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
});

module.exports = mongoose.model('invoice',invoiceSchema);
