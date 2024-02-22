const mongoose = require('mongoose');

const Review = mongoose.Schema({
    _id             : mongoose.Schema.Types.ObjectId,
    user_id         : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    consultant_id   : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    appointment_id  : { type: mongoose.Schema.Types.ObjectId, ref: 'appointments' },
    tokenNumber     : Number,
    consultantName  : String,
    introCallDate   : Date,
    introCallTime   : String,
    entrName        : String,
    consultantId    : String,
    company_id      : String,
    rating          : Number,
    recommend       : Boolean,
    fbKeyWordsArr   : Array,
    reviewComment   : String,
    reviewReply     : String,
    userReply       : String,
    reviewSubmitted : Boolean,
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    createdAt       : Date,
});

module.exports = mongoose.model('reviews',Review);


/*
    recommend = true        // recommendUp : true  
    recommend = false       // recommendDown : true  

*/