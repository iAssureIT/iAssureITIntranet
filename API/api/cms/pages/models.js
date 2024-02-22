const mongoose = require('mongoose');

const pagesSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
    pageTitle   : String,
	pageURL 	: String, //small case, replace space by _, unique, should not accept special symbols
	pageHead	: 	{
						pageWords 			: [String],
						pageDescription		: String,
						pageAuthor			: String,
                        pageHeadRobots          : String,
                        pageHeadCanonical          : String,
					},
    pageType    : String,
    pageBlocks	: 	[{
    					block_id		    : { type: mongoose.Schema.Types.ObjectId, ref: 'blocks' },
    					blockTitle		    : String,
    					seqNumOfPage	    : Number,
                        blockType           : String,
                        blockComponentName  : String,
                        blockFolderName     : String,
                        blocktempId         : String,
                        parsed  : {
                             blockType           : String,
                             blockTitle          : String,
                             blocksubTitle       : String,
                             blockDescription    : String,
                             blockLink           : String,
                             bgImage             : String,
                             bgVideo             : String,
                             fgImage             : String,
                             rBlocksTitle        : String,
                             rBlocksSubTitle     : String,
                             rBlocksDescription  : String,
                             rBlocksImage        : String,
                             rBlocksVideo        : String,
                             rBlocksLink         : String,
                             RepetedBlock        : String,
                             blockType           : String,
                        },
                        blockComponentName  : String,

    				}],
    createdAt   : Date,
    createdBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

module.exports = mongoose.model('pages',pagesSchema);
