const mongoose = require('mongoose');

const mappingMasterSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    designation_id            : String,
    designation               : String,
    vehCatg                   
                              : [
                                {
                                    vehCatg_id    : String,
                                    vehCatgName   : String
                                }
                                ],
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 :  Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('mappingMaster',mappingMasterSchema);