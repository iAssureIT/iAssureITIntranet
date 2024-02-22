const mongoose = require('mongoose');

const appointmentSlots = mongoose.Schema({
    _id          :   mongoose.Schema.Types.ObjectId,
    user_id      :   { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    dayWiseSlots :   Object,
    calendarDays : [
        {date: String,day: String, from: String, to: String, duration: String, status: String}
    ],
    createdBy    :   { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt    :   Date,
    updateLog    :   [
                        {
                            updatedAt   : Date,
                            updatedBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                        }
                    ]
});

module.exports = mongoose.model('AppointmentSlots',appointmentSlots);