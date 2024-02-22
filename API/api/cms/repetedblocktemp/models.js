const mongoose = require('mongoose');

const repblocksSchema = mongoose.Schema({
	_id					: mongoose.Schema.Types.ObjectId,
	repeatedBlocks		: [
								{
									Title 		    : String,
								    SubTitle        : String,
								    Description	    : String,
								    Image			: String,
									Link			: String,
									BgImage         : String,
									FGImage1     	: String,
									FGImage2     	: String,
									BgVideo     	: String,
									FgVideo     	: String,									
								}
						  ]
	
});

module.exports = mongoose.model('repblocks',repblocksSchema);
