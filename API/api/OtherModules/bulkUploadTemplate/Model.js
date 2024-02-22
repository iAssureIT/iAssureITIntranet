const mongoose = require('mongoose');

const BulkUploadTemplateSchema = mongoose.Schema({
	_id			        : mongoose.Schema.Types.ObjectId, 
	section_ID 			: { type: mongoose.Schema.Types.ObjectId, ref: 'sections' },
	section 			: String,
	category_ID         : { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    category       		: String,
    templateUrl 		: String,
   	createdAt 			: Date
});

module.exports = mongoose.model('bulkUploadTemplate',BulkUploadTemplateSchema);

