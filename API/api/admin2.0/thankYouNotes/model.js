const mongoose = require('mongoose');

const ThankYouNotes = mongoose.Schema({
	_id 		: mongoose.Schema.Types.ObjectId,
	from 		: String,
	to 			:  String,
	referralAmount :  Number,
	createdAt 	: Date,
	createdBy 	: String
});


module.exports = mongoose.model("thankYouNotes", ThankYouNotes);