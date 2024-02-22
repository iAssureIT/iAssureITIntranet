const mongoose = require('mongoose');

const locationTypeSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    companyID                 : String,
    locationType              : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('locationtypemasters',locationTypeSchema);