const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    category                  : String,
    categoryNameRlang         : String,
    categoryUrl               : String,
    categoryRank              : Number,
    subCategory               : [
	    {
	    	index 			  : Number,
            subCategoryRank   : Number,
            subCategoryCode   : String,
            subCategoryTitle  : String,
            subCategoryUrl    : String,
            subCategoryImage  : String,
            status            : String
	    }
    ],
    categoryDescription       : String,
    categoryImage             : String,
    categoryIcon              : String,
    section                   : String,
    section_ID                : { type: mongoose.Schema.Types.ObjectId, ref: 'sections' },
    status                    : String, 
    createdBy                 : String,
    createdAt                 : Date
});

module.exports = mongoose.model('categories' ,categorySchema);