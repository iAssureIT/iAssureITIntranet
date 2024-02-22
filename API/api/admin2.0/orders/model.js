const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  orderNum: Number,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  consultant_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  paymentMadeBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  type: String, // "call booking", "plan subscription", "fees"
  lineItemDesc: String, // Invoice line item description
  quantity: Number,
  qtyUnit: String,
  unitPrice: Number,
  currency: String,
  totalCost: Number, // totalCost = quantity x unitPrice
  discountType: String, // Some Scheme name like "25% Off"
  discountPercent: Number,
  discountValue: Number,
  totalCostAfterDiscount: Number, // totalCost - discountValue
  taxName: String,
  taxPercent: Number,
  taxValue: Number,
  walletAmount: Number, // Used wallet amount, if any
  netAmountPayable: Number, // totalCostAfterDiscount + taxValue
  paymentDate: Date,
  transactionID: String, // returned by Payment Gateway
  status: String, // "success", "failed", "cancelled",
  paymentDetail: {
    transactionId: String,
    paymentOrderId:String,
    transactionDate: Date,
    currency: String,
    transactionAmount: mongoose.Schema.Types.Decimal128,
    paymentMode: String,
    refundId: String,
    refundStatus: String,
    refundMessage: String,
    refundAmount: mongoose.Schema.Types.Decimal128,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdAt: Date,
});

module.exports = mongoose.model("orders", orderSchema);
