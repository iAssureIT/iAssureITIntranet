const mongoose = require('mongoose');

const Query = mongoose.Schema({
    _id             : mongoose.Schema.Types.ObjectId,
    user_id         : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    consultant_id   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    userName        : String,
    consultantName  : String,
    tokenNumber     : Number,
    callDate        : Date,
    raisedQuery     : String,
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt       : Date,
});

module.exports = mongoose.model('queries',Query);