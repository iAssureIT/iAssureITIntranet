const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    category                  : String,
    iconUrl                   : String,  
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('categorymasters',categorySchema);