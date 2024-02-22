const mongoose = require('mongoose');

const dealsSchema = mongoose.Schema({
	_id			          : mongoose.Schema.Types.ObjectId,
    section               : String,
    category              : String, 
    subCategory           : String,
    sectionID             : String,
    categoryID            : String,
    subCategoryID         : String,
    dealInPercentage      : Number,
    updateAllProductPrice : String,
    updateLimittedProducts: String,
    dealImg               : String,
    startdate             : Date,
    enddate               : Date,
    createdAt             : Date,
    });

module.exports = mongoose.model('deals',dealsSchema);