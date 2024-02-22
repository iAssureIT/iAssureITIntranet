const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    galleryImage              : String,
    createdBy                 : String,
    createdAt                 : Date
});

module.exports = mongoose.model('gallery' ,gallerySchema);