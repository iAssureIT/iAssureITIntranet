const mongoose = require('mongoose');

const taxNameSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    taxName              : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('taxnameemasters',taxNameSchema);