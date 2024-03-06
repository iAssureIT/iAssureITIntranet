const mongoose = require('mongoose');

const leaveApplicationSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    manager_id                : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    leaveType                 : String,
    leaveSubject              : String,
    leaveSummary              : String,
    createdAt                 : Date,
    status                    : String,
    remark                    : String,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('leaveApplication',leaveApplicationSchema);