const mongoose = require('mongoose');

const packageMasterSchema = mongoose.Schema({
	_id			                : mongoose.Schema.Types.ObjectId,
    packageTypeId               : { type: mongoose.Schema.Types.ObjectId, ref: 'packagetypemasters' },
    packageName                 : String,
    fixCharges                  : Number,
    maxHours                    : Number,
    maxKm                       : Number,
    way                         : String,
    cityTypeId                  : { type: mongoose.Schema.Types.ObjectId, ref: 'citytypemasters' },
    categoryId                  : { type: mongoose.Schema.Types.ObjectId, ref: 'categorymasters' },
    extraHr                     : Number,
    extraKms                    : Number,
    driverAllow                 : Number,
    nightHalt                   : Number,
    nightCharges                : Number,
    morningCharges              : Number,
    createdBy                   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                   : Date,
    updateLog                   : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('packagemasters',packageMasterSchema);
