const mongoose = require('mongoose');

const Policy = mongoose.Schema({
    _id             : mongoose.Schema.Types.ObjectId,
    policy_name     : String,
    policy_category : String,
    policy_summary  : String,
    policy_doc    : String,
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt       : Date,
});

module.exports = mongoose.model('policy',Policy);