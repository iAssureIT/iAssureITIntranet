const mongoose = require('mongoose');

const FinishedGoodsEntrySchema = mongoose.Schema({
	_id			              : mongoose.Schema.Types.ObjectId,
    Date                      : Date,
    ItemCode                  : String,/*itemID from productMaster*/
    ProductCode               : String,
    productName               : String,
    CurrentStock              : Number,
    OutwardRawMaterial        : Number,
    OutwardUnit               : String,
    fgUnitQty                 : Number,
    fgUnitWt                  : String,
    fgTotalQty                : Number,
    fgInwardQty               : Number,
    fgInwardUnit              : String,
    scrapQty                  : Number,
    scrapUnit                 : String,
    balance                   : Number,
    balanceUnit               : String,
    finishedBy                : String,
    fileName                  : String,
    franchiseDistArray        : Array, 
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
});

module.exports = mongoose.model('FinishedGoodsEntry' ,FinishedGoodsEntrySchema);
