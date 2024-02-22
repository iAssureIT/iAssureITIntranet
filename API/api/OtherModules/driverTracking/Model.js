const mongoose = require('mongoose');

const DriverTracking = mongoose.Schema({
	_id			        : mongoose.Schema.Types.ObjectId, 
    user_id             : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    currentDate         : Date,
	currentDateStr      : String,
    status              : String,
	onlineActivities    : [
        {
            activity    : String, 
            timestamp   : Date , 
            lat         : Number, 
            long        : Number
        },
	],
	currentLocations : [
		{
            timestamp   : Date, 
            lat         : Number, 
            long        : Number
        },
    ]
});

module.exports = mongoose.model('driverTracking',DriverTracking);

