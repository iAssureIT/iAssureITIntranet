const mongoose = require('mongoose');

const packageTypeSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    packageType               : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('packagetypemasters',packageTypeSchema);