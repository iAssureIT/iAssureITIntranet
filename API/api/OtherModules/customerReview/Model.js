const mongoose = require('mongoose');

const customerReviewSchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    customerID                : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    customerName              : String,
    orderID                   : { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    productID                 : { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    rating                    : Number,
    customerReview            : String,
    status                    : String,
    adminComment              : String,
    createdAt                 : Date
});

module.exports = mongoose.model('customerReview' ,customerReviewSchema);