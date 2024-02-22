const mongoose = require('mongoose');

const masternotificationSchema = mongoose.Schema({
	_id			 : mongoose.Schema.Types.ObjectId,
    templateType : String,	
    event        : String,	
	role		 : String,
	company 	 : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
	subject      : String,
	content      : String,	
	status       : String,	
	createdAt    : Date,
	createdBy	 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

module.exports = mongoose.model('masternotifications',masternotificationSchema);
