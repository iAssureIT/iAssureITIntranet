const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
	_id			            : mongoose.Schema.Types.ObjectId,
    user_ID                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    userDelLocation         : {
        lat                 : Number, 
        long                : Number,
        delLocation         : String,
    },
    vendor_id               : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters'},
    vendorLocation_id       : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters'},
    product_ID              : { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    createdBy               : String,
    createdAt               : Date
});

module.exports = mongoose.model('wishlist',wishlistSchema);