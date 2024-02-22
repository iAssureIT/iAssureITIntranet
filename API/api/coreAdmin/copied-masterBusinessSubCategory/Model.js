const mongoose = require('mongoose');

const businessSubCategorySchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    businessCategoryId        : { type: mongoose.Schema.Types.ObjectId, ref: 'businesscategorymasters' },
    businessSubCategory       : String,  
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    fileName                  : String,
    updateLog                 : [
                                    {
                                        updatedAt           : Date,
                                        updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                    }
                                ]
});

module.exports = mongoose.model('businessSubCategoryMaster',businessSubCategorySchema);