const mongoose = require('mongoose');

const modelSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    expenseTypeId             : { type: mongoose.Schema.Types.ObjectId, ref: 'expensetypemasters' },
    expenseItem               : String,  
    HSN                       : Number,  
    billingCode               : Number,  
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                    {
                                        updatedAt           : Date,
                                        updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                    }
                                ]
});

module.exports = mongoose.model('expenseitemmaster',modelSchema);