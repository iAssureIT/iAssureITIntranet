const mongoose = require('mongoose');

const distanceRangeSchema = mongoose.Schema({
	_id			        : mongoose.Schema.Types.ObjectId,
    distance            : String,
    createdAt           : Date,
    updateLog           : {
                            updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
                            updatedAt : Date
                        }
    });

module.exports = mongoose.model('distancerange',distanceRangeSchema);