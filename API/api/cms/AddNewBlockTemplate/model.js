const mongoose =  require('mongoose');

const blocktemplateMasterSchema = mongoose.Schema({
			_id 			 	: mongoose.Schema.Types.ObjectId,
			blocktemplateId  	: Number,
			compName 			: String,
			blockType   		: String,
			compImage         	: String,
			blockTitle        	: String,
			blockSubTitle     	: String,
			blockDescription    : String,
			BlockType         	: String,
			blockLink         	: String,
			bgImage         	: String,
			bgVideo         	: String,
			fgVideo         	: String,
			fgImage1         	: String,
			fgImage2         	: String,
			repBlockTitle     	: String,
			repBlockSubTitle  	: String,
			repBlockDescription : String,
			repBlockImage1     	: String,
			repBlockImage2     	: String,
			repBlockBackImage   : String,
			repBlockVideo     	: String,
			repBlockLink      	: String,
			
});

module.exports = mongoose.model("blocktemplates", blocktemplateMasterSchema);