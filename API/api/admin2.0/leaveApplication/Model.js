const mongoose = require('mongoose');

const leaveApplicationSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    user_id                   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    user_name                 : String,
    manager_id                : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    manager_name              : String,
    leaveType                 : String,
    leaveSubject              : String,
    leaveSummary              : String,
    createdAt                 : Date,
    fromDate                  : Date,
    toDate                    : Date,
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