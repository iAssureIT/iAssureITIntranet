const mongoose = require('mongoose');

const franchisePurOrderSchema = mongoose.Schema({
    _id			              : mongoose.Schema.Types.ObjectId,
    franchise_id          : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
    companyID             : Number,
    orderNo               : Number,
    franchiseName         : String,
    orderDate             : Date,
    orderItems            : Array,
    createdBy             : String,
    createdAt             : Date,
    updateLog             : Array,
});

module.exports = mongoose.model('franchisePurOrder',franchisePurOrderSchema);