const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    brand                     : { type: String, index: true, unique: true  },
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

module.exports = mongoose.model('brandMaster',brandSchema);