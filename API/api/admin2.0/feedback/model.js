const mongoose = require('mongoose');

const Feedback = mongoose.Schema({
    _id           : mongoose.Schema.Types.ObjectId,
    user_id       : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    name          : String,
    email         : String,
    mobile        : String,
    feedback      : String,
    createdBy     : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt     : Date,
});

module.exports = mongoose.model('feedbacks',Feedback);