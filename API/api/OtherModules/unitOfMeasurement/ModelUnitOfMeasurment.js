const mongoose = require('mongoose');

const unitOfMeasurmentSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    unitOfMeasurment          : String,
    companyID                 : String,
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

module.exports = mongoose.model('unitOfMeasurmentMasters',unitOfMeasurmentSchema);