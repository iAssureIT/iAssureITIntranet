const mongoose = require('mongoose');

const fuelTypeSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    fuelType                  : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('fueltypemasters',fuelTypeSchema);