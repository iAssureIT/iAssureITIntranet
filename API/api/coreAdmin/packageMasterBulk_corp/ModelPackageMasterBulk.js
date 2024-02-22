const mongoose = require('mongoose');

const packageMasterbulkSchema = mongoose.Schema({
	_id			                : mongoose.Schema.Types.ObjectId,
    Location               :String,
    CarCategory            :String,
    PackageType            : String, 
    PackageName            : String, 
    Way                    : String,
    MinKmDay               : String,
    MinHrsDay              : String,
    Rate                   : String,
    ExtKm                  : String,
    ExtHr                  : String,
    DriverAllowance        : String,
    NightHalt              : String,
    NightCharges           : String,
    EarlyMorningCharges    : String,
    createdBy                   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                   : Date,
    updateLog                   : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('packagemastersbulk',packageMasterbulkSchema);
