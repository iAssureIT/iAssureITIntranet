

const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema({
  _id             : mongoose.Schema.Types.ObjectId,
  businessCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'businessCategoryMaster' },
  businessSubCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'businessSubCategoryMaster'},
  selectedProduct : { type: mongoose.Schema.Types.ObjectId, ref: 'products'},
  orderDate: { type: Date, required: true },
  unitPackSize: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  expectedDeliveryDate: { type: Date, required: true },
  trackingNumber: { type: String, required: true },
  deliveryStatus: { type: String, enum: ["Dispatch", "In transit", "Delivered"], default: "Dispatch" },
  // userName: { type: String, required: true },
  userName : { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  
});

// Use a singular name for the model, not the schema name
module.exports = mongoose.model("order-product", orderProductSchema);

