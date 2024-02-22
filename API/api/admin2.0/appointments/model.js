const mongoose = require('mongoose');

const appointments = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    consultant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    tokenNumber: Number,
    fees: Number,
    consultantEntpName: String,
    userEntpName: String,
    isoAppointmentDate: String,
    appointmentDateFormat: Date,
    appointmentDate: String,
    appointmentTime: String,
    appointmentEnd : String,
    appointmentDuration : Number,
    status: String,
    cancelDetails : {
        cancelledBy_id       : String,
        cancelledByName      : String,
        cancelledByRole      : String,
        reasonForCancel      : String,
        cancelledOn          : Date,
        returnPercent        : Number,
        refundAmount         : Number,
        chargeableAmount     : Number,
        cancelBeforeHours    : Number
    },
    reviewSubmitted: Boolean,
    meetingRoomDetails: {
        room_id: String,
        name: String,
        owner_ref: String,
        service_id: String,
        scheduledTime: String,
    },
    videoConferenceDetails: [{
        cdr_id: String,
        trans_date: Date,
        room: {
            room_id: String,
            connect_dt: Date,
            disconnect_dt: Date,
            duration: Number,
            sip: Boolean
        },
        usage: {
            subscribed_minutes: Number,
            published_minutes: Number,
            screen_minutes: Number,
            connect_minutes: Number,
            room_connect_minutes: Number,
            connect_minutes_cal: Number,
        },
        user: {
            name: String,
            role: String,
            ref: String,
        },
        price: {
            connect_duration: Number
        },
    }],
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    orderNum: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    createdAt: Date,
});

module.exports = mongoose.model('appointments', appointments);