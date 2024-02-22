const mongoose = require('mongoose');

const globalmasterSchema = mongoose.Schema({
    _id             : mongoose.Schema.Types.ObjectId,
    type            : String,
    taxType         : String,
    taxRating       : String,
    effectiveFrom   : Date,
    effectiveTo     : Date,
    status          : String,
    authID          : String,
    authToken       : String,
    sourceMobile    : String,
    user            : String,
    password        : String,
    port            : Number,
    emailHost       : String,
    projectName     : String,
    createdAt       : Date,
    updateLog       : [{
                        updatedAt           : Date,
                        updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                    }]
                                                 
}); 

module.exports = mongoose.model('globalmaster',globalmasterSchema);
