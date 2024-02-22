const mongoose = require('mongoose');

const orderStatusSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    orderStatus               : String,
    statusRank                : Number,
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

module.exports = mongoose.model('orderStatus',orderStatusSchema);