const mongoose = require('mongoose');

const leaveMasterSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    casualLeave               : Number,
    priviledgedLeave          : Number,
    sickLeave                 : Number,
    createdAt                 : Date,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('leaveMaster',leaveMasterSchema);