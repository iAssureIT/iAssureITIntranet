const mongoose = require('mongoose');

const adminPurOrderSchema = mongoose.Schema({
    _id			              : mongoose.Schema.Types.ObjectId,
    orderDate             : String,
    orderItems            : Array,
    createdBy             : String,
    createdAt             : Date,
    updateLog             : Array,
});

module.exports = mongoose.model('adminPurOrder',adminPurOrderSchema);