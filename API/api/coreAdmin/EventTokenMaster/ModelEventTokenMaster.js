const mongoose = require('mongoose');

const eventTokenmasterSchema = mongoose.Schema({
    _id             : mongoose.Schema.Types.ObjectId,
    event     : String,
    templateName     : String,
    tokens     : String,
    createdBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt       : Date,
    updateLog                   : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                            ]
                                                 
}); 

module.exports = mongoose.model('eventTokenmaster',eventTokenmasterSchema);
