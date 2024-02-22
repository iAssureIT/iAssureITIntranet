const mongoose = require('mongoose');

const cityNameSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    cityTypeId                : { type: mongoose.Schema.Types.ObjectId, ref: 'cityTypeMaster' },
    cityName                  : String,  
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    fileName                  :String,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('cityNameMaster',cityNameSchema);