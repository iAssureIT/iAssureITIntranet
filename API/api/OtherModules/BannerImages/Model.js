const mongoose = require('mongoose');

const bannerimagesSchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    bannerimages              : String,
    createdBy                 : String,
    createdAt                 : Date
});

module.exports = mongoose.model('bannerimages' ,bannerimagesSchema);