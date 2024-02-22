const mongoose = require('mongoose');

const warehouseSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    warehouse                : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
   /* fileName                  : String,*/
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('warehousemasters',warehouseSchema);