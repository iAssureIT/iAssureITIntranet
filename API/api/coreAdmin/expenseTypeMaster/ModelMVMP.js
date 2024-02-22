const mongoose = require('mongoose');

const expensetypemasterSchema = mongoose.Schema({
    _id             	: mongoose.Schema.Types.ObjectId,
    type            	: String,
    taxRate         	: Number,
    VAT        		: Number,
    otherTax        	: Number,
    createdAt       	: Date,
                                                 
}); 

module.exports = mongoose.model('taxMaster',expensetypemasterSchema);
