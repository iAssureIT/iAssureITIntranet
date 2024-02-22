const mongoose = require('mongoose');

const blocksSchema = mongoose.Schema({
	_id					: mongoose.Schema.Types.ObjectId,
	blockTitle 			: String,
	blockSubTitle		: String,
	blockDescription	: String,
	blockComponentName	: String,
	blockType 			: String,
	bgImage				: String,
	bgVideo				: String,
	fgImage				: String,
	fgVideo				: String,
	blockGroup 			: String,
	blockAppearOnPage	: { type: mongoose.Schema.Types.ObjectId, ref: 'pages' },
	repeatedBlocks		: [
								{
									Title 		: String,
								    SubTitle		: String,
								    Description	: String,
								    Image			: String,
								    Video			: String,
								    Link			: String,
								    createdAt 	: Date,
								}
						  ],
    createdBy   		: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt   		: Date,
});

module.exports = mongoose.model('blocks',blocksSchema);
