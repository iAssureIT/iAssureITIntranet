const mongoose = require('mongoose');

const pagesSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
    pageTitle   : String,
	pageURL 	: String, //small case, replace space by _, unique, should not accept special symbols
	pageHead	: 	{
						pageWords 			: [String],
						pageDescription		: String,
						pageAuthor			: String,
					},
    pageType    : String,
    pageBlocks	: 	[{
    					block_id		: { type: mongoose.Schema.Types.ObjectId, ref: 'blocks' },
    					blockTitle		: String,
    					seqNumOfPage	: Number
    				}],
    createdAt   : Date,
    createdBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

module.exports = mongoose.model('pages',pagesSchema);
