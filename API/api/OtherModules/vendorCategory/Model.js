const mongoose = require('mongoose');

const vendorsCategorySchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    categoryName              : String,
    createdAt                 : Date
});

module.exports = mongoose.model('vendorCategory',vendorsCategorySchema);