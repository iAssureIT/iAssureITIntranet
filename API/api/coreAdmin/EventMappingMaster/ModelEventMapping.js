const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    event                     : String,
    role                      : String,
    mode                      : String,
    templateName              : String,
    status                    : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    mapDate                   : Date,
    unmapDate                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('eventmapping',categorySchema);