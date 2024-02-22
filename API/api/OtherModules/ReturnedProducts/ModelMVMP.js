const mongoose = require('mongoose');

const returnedProductSchema = mongoose.Schema({
	_id			       		: mongoose.Schema.Types.ObjectId,
	order_id                : { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
	orderID                	: Number,
	user_id                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	vendor_id 					: { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
	vendorLocation_id 		: { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
	product_id              : { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
	section_id              : { type: mongoose.Schema.Types.ObjectId, ref: 'sections' },
	category_id             : { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },	
	subCategory_id          : { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },	
	productCode 				: String,
	itemCode                : String ,
	reasonForReturn         : String, 
	customerComment 			: String,
	returnProductImages 		: Array,
	adminComments 				: [{
											comment 		: String,
											commentBy 	: String,
											commentedOn : Date
	}],
	vendorComment 				: String,     
	originalPrice           : Number,
	discountPercent         : Number,
	discountedPrice         : Number,
	productQuantity 			: Number,
	modeOfPayment           : String, 
	dateOfPurchase          : Date,
	dateOfReturn            : Date,
	pickedupBy              : String, 
	returnStatus 				: String, 
	returnStatusLog         : [{
		status 					: String,
		statusBy 				: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
		date 						: Date
	}],
	refundMode 					: String,
	refundDetails           : [{
										bankName        : String,
										bankAccountNo   : String,
										IFSCCode        : String,
										amount          : Number
									}],
	createdBy               : String,
	createdAt               : Date
});

module.exports = mongoose.model('returnedproducts',returnedProductSchema);