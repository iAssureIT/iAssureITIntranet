const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    vehicleID                 : { type: mongoose.Schema.Types.ObjectId, ref: 'vehiclemasters' },
    driverID                  : { type: mongoose.Schema.Types.ObjectId, ref: 'personmasters' },
    driverName                : String,
    company_Id                : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
    mapDate                   : Date,
    unmapDate                 : Date,
    status                    : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('vehicledrivermapping',categorySchema);