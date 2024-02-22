const mongoose = require('mongoose');

const entitySchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    contractDate              : Date,
    effectiveUpto             : Date,
    companyId                 : { type: mongoose.Schema.Types.ObjectId, ref: 'companysettings' },
    companyLocationId         : String,
    entityType                : String,
    entityId                  : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
    entityLocationId          : Array,
    conditions                : String,
    contractDuration          : Number,
    status                    : String,
    
    packages :  [
                    {
                        packageId                   : { type: mongoose.Schema.Types.ObjectId, ref: 'packagemasters' },
                        packageName                 : String,
                        MaxKm                       : Number,
                        MaxHrs                      : Number,
                        fixCharges                  : Number,
                        nightChargesFromTime        : String,
                        nightChargesToTime          : String,
                        earlyMorningChargesFromTime : String,
                        earlyMorningChargesToTime   : String,
                        extras : [
                            {
                                categoryId                  : { type: mongoose.Schema.Types.ObjectId, ref: 'categorymasters' },
                                category                    : String,
                                extraHours                  : Number,
                                extraKM                     : Number,
                                graceHours                  : Number,
                                graceKM                     : Number,
                                driverAllowance             : Number,
                                nightChargesLocal           : Number,
                                nightChargesOutstation      : Number,
                                nightChargesDay             : String,
                                earlyMorningCharges         : Number,
                                
                            }
                        ]
                    }
                ], 
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('contracts',entitySchema);