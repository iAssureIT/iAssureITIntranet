const mongoose = require('mongoose');

const orgLevelSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    orgLevel                  : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,         
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('orgLevel',orgLevelSchema);