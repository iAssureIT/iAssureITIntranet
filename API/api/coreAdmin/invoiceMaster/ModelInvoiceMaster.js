const mongoose = require('mongoose');

const invoicemasterSchema = mongoose.Schema({
    _id                         : mongoose.Schema.Types.ObjectId,
    bookingId                   : Number,
    invoiceNo                   : Number,
    tripType                    : String,
    from                        : {
                                        address     : String,
                                        area        : String,
                                        city        : String,
                                        state       : String,
                                        country     : String,
                                        pincode     : String,
                                        latitude    : Number,
                                        longitude   : Number,
                                },
    to                          : {
                                        address     : String,
                                        area        : String,
                                        city        : String,
                                        state       : String,
                                        country     : String,
                                        pincode     : String,
                                        latitude    : Number,
                                        longitude   : Number,
                                },                                 
    pickupDate                  : Date,
    pickupTime                  : String,
    returnDate                  : Date,
    returnTime                  : String,
    employeeId                  : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    departmentId                : {type: mongoose.Schema.Types.ObjectId, ref:'departmentmasters'},
    corporateId                 : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
    intermediateStops           : Array,
    status                      : String,                                                           
    tripExpenses                : Array,
    notes 						: String,
    terms						: String,
    createdBy                   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                   : Date,
    updateLog                   : [{
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }]

                                                 
}); 

module.exports = mongoose.model('invoicemaster',invoicemasterSchema);
