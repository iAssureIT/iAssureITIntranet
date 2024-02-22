const mongoose = require('mongoose');

const businessCategorySchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    businessCategory          : { type: String, index: true, unique: true  },
    businessExpertise         : Array,
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

module.exports = mongoose.model('businessCategoryMaster',businessCategorySchema);