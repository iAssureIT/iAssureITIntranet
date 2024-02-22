const mongoose = require('mongoose');

const returnedProductsSchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    orderID                   : { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    altOrderID                : Number,
    user_ID                   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    product_ID                : { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    reasonForReturn           : String,      
    Item_ID                   : String ,
    originalPrice             : Number,
    discountPercent           : Number,
    discountedPrice           : Number,
    dateofPurchase            : Date,
    modeofPayment             : String, 
    dateofReturn              : Date,
    pickedupBy                : String,  
    returnStatus              : [
                                    {
                                        status:String,
                                        date : Date
                                    }
                                ],
    refund                    : [
                                    {
                                        bankName        : String,
                                        bankAccountNo   : String,
                                        IFSCCode        : String,
                                        amount          : Number
                                    }
                                ],
    createdBy                 : String,
    createdAt                 : Date
});

module.exports = mongoose.model('returnedProducts',returnedProductsSchema);