const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
			_id			        : mongoose.Schema.Types.ObjectId,
			section 			: String,
			category 			: String,
			subCategory 		: String,
       		coupontitle  		: String,
       		couponcode  		: String,
			couponin  			: String,
			couponvalue  		: Number,
			minPurchaseAmount 	: Number,
			maxDiscountAmount 	: Number,
			status  			: String,
			startdate      		: Date,
			enddate        		: Date,
			couponLimit 		: Number,
			couponImage        	: String,
			createdBy  			: String,
			createdAt 			: Date,
			updateLog 			: [{
									updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
									updatedAt : Date
			}]
			// availablefor  		:  String,
			//    couponcodeusage  	:  Number,
			//    maxdiscountvalue  	:  Number,
			//    selectedCategory    :  Array,
			//    selectedBrand       :  Array,
			//    selectedProducts    :  Array,
			//    description       	:  String ,
			//    termscondition      :  String,
			//    coupontype  		:  String,
    });

module.exports = mongoose.model('coupon',couponSchema);