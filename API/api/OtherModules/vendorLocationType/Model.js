const mongoose = require('mongoose');

const vendorLocationTypeSchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    locationType              : String,
    createdAt                 : Date
});

module.exports = mongoose.model('vendorLocationType',vendorLocationTypeSchema);