const mongoose = require('mongoose');

const subscriptionordersSchema = mongoose.Schema({
	_id				: mongoose.Schema.Types.ObjectId,
	plan_ID 		: String,
	userID 			: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    planName		: String,
	planAmount  	: Number,  
	invoiceNum  	: Number,   
	validityPeriod 	: String, //1 month or 1 year
	purchaseDate	: String, //"YYYY-MM-DD"
	startDate 		: String, //"YYYY-MM-DD"
	endDate 		: String, //"YYYY-MM-DD"
	planStatus 		: String, //"Active" or "Inactive"
	offeringDetails : [{
							"offering_ID" 		: {type: mongoose.Schema.Types.ObjectId, ref: 'offerings'},
							"startDate"			: String,
							"endDate"			: String,
							"offeringStatus"	: String, //"Active" or "Inactive"
						}],
	transactionId 	: String,
	paymentOrderId 	: String,
	amountPaid		: Number,
	paymentStatus	: String, //Paid or Failed
	listofBlogs		: [{
							blog_ID 	: {type: mongoose.Schema.Types.ObjectId, ref: 'blogs'},
							accessDate	: Date,
					  }],
	statements 		: [{
							path  		: String,
							name		: String,
							size		: String,
							extension 	: String,
							uploadDate	: String, //"YYYY-MM-DD"

					  }],
	createdAt 		: Date,
	createdBy		: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
});

module.exports = mongoose.model('subscriptionorders',subscriptionordersSchema);
