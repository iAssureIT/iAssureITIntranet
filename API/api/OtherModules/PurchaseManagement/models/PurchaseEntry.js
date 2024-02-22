const mongoose = require('mongoose');

const PurchaseEntrySchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    purchaseDate              : Date,
    purchaseStaff             : String,
    purchaseLocation          : String,
    productId                 : String,/*_id from productMaster*/
    itemId                    : String,/*itemID from productMaster*/
    itemCode                  : String,
    productCode               : String,
    productName               : String,
    quantity                  : Number,
    unit                      : String,
    amount                    : Number,
    unitRate                  : Number,
    unitOfMeasurement         : String,
    Details                   : String,
    purchaseNumber            : String,
    fileName                  : String,
    finishedGoodsArray        : Array, 
    balance                   : Number,
    balanceUnit               : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
});

module.exports = mongoose.model('PurchaseEntry' ,PurchaseEntrySchema);