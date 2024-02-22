const mongoose = require('mongoose');

const storePreferenceSchema = mongoose.Schema({
	_id			                : mongoose.Schema.Types.ObjectId,    
    maxRadius                   : Number,
    minOrderValue               : Number,
    maxServiceCharges           : Number,
    maxNumberOfVendors          : Number,
    serviseChargesByDistance    : [
                                    {
                                        minDistance     : Number,
                                        maxDistance     : Number,
                                        serviceCharges  : Number
                                    }
    ],
    createdAt                   : Date
});

module.exports = mongoose.model('storepreference',storePreferenceSchema);
