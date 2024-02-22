const mongoose = require('mongoose');

const entitySchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    corporateId               : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
    corporateLocationId       : String,
    vendor                    : [
                                {
                                    vendorID          : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
                                    assignedPercent   : Number
                                }
    ],
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('entitymapping',entitySchema);