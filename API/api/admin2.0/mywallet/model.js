const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    walletAmount: Number,
    transactions: [{
        order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
        transactionType: String,//type=> earned or paid
        transactionEvent: String,//event => Plans, calls etc
        description: String,//event => Plans, calls etc
        transactionAmount: Number,
        transactionDate: Date,
        cashback: Number
    }],
    createdAt: Date,
});

module.exports = mongoose.model('wallets', walletSchema);