const mongoose = require('mongoose');

const FranchiseDeliverySchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    franchise_id              : String,
    franchisePO_id            : String,
    deliveryDate              : Date,
    deliveryChallanNum        : String,
    deliveredBy               : String,
    deliveredAt               : Date,
    supply                    : [],
    orderedDate               : Date,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : []
});

module.exports = mongoose.model('FranchiseDelivery' ,FranchiseDeliverySchema);
