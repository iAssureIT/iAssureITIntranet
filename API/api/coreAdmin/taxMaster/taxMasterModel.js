const mongoose = require('mongoose');

const taxSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    taxName                   : String,
    taxValue                  : Number, 
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('taxMaster',taxSchema);