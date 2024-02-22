const mongoose = require('mongoose');

const modelSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    moduleId                  : { type: mongoose.Schema.Types.ObjectId, ref: 'modulemasters' },
    facility                  : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('facilitymasters',modelSchema);