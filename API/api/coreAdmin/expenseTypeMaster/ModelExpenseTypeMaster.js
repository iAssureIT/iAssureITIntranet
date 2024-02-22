const mongoose = require('mongoose');

const expensetypemasterSchema = mongoose.Schema({
    _id             : mongoose.Schema.Types.ObjectId,
    type            : String,
    GSTRate         : Number,
    CGSTRate        : Number,
    SGSTRate        : Number,
    IGSTRate        : Number,
    createdAt       : Date,
                                                 
}); 

module.exports = mongoose.model('expensetypemaster',expensetypemasterSchema);
