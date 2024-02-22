const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
	_id			          : mongoose.Schema.Types.ObjectId,
    user_ID               : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    cartItems             : [
        {
            product_ID          : { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
            quantity            : Number,
            totalWeight         : String,
            rate                : Number,
            discountPercent     : Number,
            discountedPrice     : Number,
            SGST                : Number,
            CGST                : Number,
            CGSTAmt             : Number,
            SGSTAmt             : Number
        }
    ],
    cartTotal             : Number,
    deliveryAddress       : {
        "name"            : String,
        "email"           : String,
        "addressLine1"    : String,
        "addressLine2"    : String,
        "pincode"         : String,
        "city"            : String,
        "district"        : String,
        "stateCode"       : String,
        "state"           : String,
        "mobileNumber"    : String,
        "countryCode"     : String,
        "country"         : String,
        "addType"         : String,
        "latitude"        : Number,
        "longitude"       : Number,
    },
    paymentMethod         : String,
    createdBy             : String,
    createdAt             : Date,
    coupen                : { type: mongoose.Schema.Types.ObjectId, ref: 'coupen' },
});

module.exports = mongoose.model('carts',cartSchema);