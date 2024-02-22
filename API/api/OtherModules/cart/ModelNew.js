const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
	_id			          : mongoose.Schema.Types.ObjectId,
    user_ID               : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    userDelLocation       : {lat: Number, long: Number},
    minOrderAmount        : Number,
    vendorOrders          : [
        {
            vendor_id           : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
            vendorLocation_id   : String,
            vendorName          : String,
            cartItems           : [
                {
                    product_ID          : { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
                    quantity            : Number,
                    totalWeight         : String,
                    productRate         : Number,
                    discountPercent     : Number,
                    discountedPrice     : Number,
                    SGST                : Number,
                    CGST                : Number,
                    CGSTAmt             : Number,
                    SGSTAmt             : Number
                }
            ],
            vendor_numberOfProducts   : Number,  //Number of products. 
            vendor_quantityOfProducts : Number,  //Quantity in each product. 1 product may have 5 quantity                
            vendor_beforeDiscountTotal: Number,
            vendor_discountAmount     : Number,
            vendor_afterDiscountTotal : Number,
            vendor_netPayableAmount   : Number,  //vendor_netPayableAmount = vendor_afterDiscountTotal + vendor_taxAmount + vendor_shippingCharges
            vendor_taxAmount          : Number,
            vendor_shippingChargesAfterDiscount    : Number,
            vendor_shippingCharges    : Number,
        }                         
    ],
    paymentDetails            :{
        beforeDiscountTotal       : Number,
        discountAmount            : Number,
        afterDiscountTotal        : Number,
        disocuntCoupon_id         : { type: mongoose.Schema.Types.ObjectId, ref: 'coupon' }, 
        discountCouponPercent     : Number,
        discountCouponAmount      : Number,
        afterDiscountCouponAmount : Number,
        creditPointsUsed          : Number,
        creditPointsValueUsed     : Number,
        taxAmount                 : Number,
        shippingChargesBeforeDiscount           : Number,
        shippingCharges           : Number,
        netPayableAmount          : Number,  //NetPayableAmount = afterDiscountCouponAmount + taxAmount + shippingCharges
        currency                  : String,
        paymentMethod             : String,
    },
    order_numberOfProducts    : Number, //Sum of all number of products in all vendors
    order_quantityOfProducts  : Number, //Sum of total quantity of items in each vendor
    totalCreditPoints         : Number,
    totalCreditPointsValue    : Number,
    deliveryAddress           : {
        "name"            : String,
        "email"           : String,
        "addressLine1"    : String,
        "addressLine2"    : String,
        "pincode"         : String,
        "city"            : String,
        "district"        : String,
        "stateCode"       : String,
        "state"           : String,
        "mobileNumber"    : String,
        "countryCode"     : String,
        "country"         : String,
        "addType"         : String,
        "latitude"        : Number,
        "longitude"       : Number,
    },
    createdBy             : String,
    createdAt             : Date,
});

module.exports = mongoose.model('cart',cartSchema);