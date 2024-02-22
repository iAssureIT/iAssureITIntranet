const mongoose = require('mongoose');

const accessMasterSchema = mongoose.Schema({
	_id			                : mongoose.Schema.Types.ObjectId,
    role                        : String,
    module                      : [{
                                    module      : String,
                                    facility    : String
                                }],
    createdBy                   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                   : Date,
    updateLog                   : [{
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }]
});

module.exports = mongoose.model('accessmasters',accessMasterSchema);
