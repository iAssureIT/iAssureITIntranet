//MVMP = Multivendor Market Place

const mongoose 					= require("mongoose");
const Orders 			    	= require('./ModelMVMP');
const Carts 					= require('../cart/ModelNew');
const Masternotifications 		= require('../../coreAdmin/notificationManagement/ModelMasterNotification.js');
const User 						= require('../../coreAdmin/userManagementnew/ModelUsers.js');
const ProductInventory 			= require('../ProductInventory/Model.js');
const BusinessAssociate 		= require('../businessAssociate/Model');
const ReturnedProducts 			= require('../ReturnedProducts/ModelMVMP');
const Products 					= require('../products/Model');
const Adminpreference 			= require('../adminPreference/Model');
const StorePreferences  		= require('../StorePreferences/Model.js');
const OrderCancellationPolicy   = require('../../Ecommerce/OrderCancellationPolicy/Model.js');
const OrderStatusMaster     	= require('../orderStatusMaster/Model.js');
const CreditPointsPolicy 		= require('../CreditPointsPolicy/Model.js');
const CreditPoints 				= require('../CreditPoints/Model.js');
const CustomerReview 			= require('../customerReview/ModelMVMP.js');
const Coupon            		= require('../CouponManagement/Model');
const Allowablepincode 			= require('../allowablePincodes/Model');
const Entitymaster 				= require('../../coreAdmin/entityMaster/ModelEntityMaster.js');
const globalVariable 			= require('../../../nodemon');
const moment 					= require('moment-timezone');
const FranchiseGoods 			= require('../distributionManagement/Model');
const axios             		= require('axios');
var ObjectId 					= require('mongodb').ObjectID;
var request 					= require('request-promise');
const sendNotification 			= require("../../coreAdmin/notificationManagement/SendNotification.js");
const haversine         = require('haversine-distance')
const AdminPreferences  = require('../../Ecommerce/adminPreference/Model.js');
const DriverTracking 		= require('../driverTracking/Model.js')

/*========== Insert Orders ==========*/
exports.insert_orders = (req, res, next) => {
	// console.log("Inside order post",req.body); 

	if (req.body.vendorOrders && req.body.vendorOrders.length > 0) {
		processOrders();
		async function processOrders(){
			var nextOrderId = await getNextSequenceOrderId();
			// console.log("nextOrderId => ",nextOrderId)

			const order = new Orders({
				_id 						: new mongoose.Types.ObjectId(),
				orderID 					: nextOrderId,
				user_ID 					: req.body.user_ID,
				userName 					: req.body.userEmail,
				userFullName 				: req.body.userFullName,
				paymentDetails            	: req.body.paymentDetails,
				customerShippingTime      	: req.body.customerShippingTime,
				order_numberOfProducts    	: req.body.order_numberOfProducts, 
				order_quantityOfProducts  	: req.body.order_quantityOfProducts, 
				orderStatus 				: "New",
				vendorOrders 				: req.body.vendorOrders,
				deliveryAddress				: req.body.deliveryAddress,			
				createdAt 					: new Date(),
				createdBy 					: req.body.user_ID
			});

			order.save()
			.then(async(orderdata) => {			         		
				/*======================== Remove Cart Items =============================*/
				// console.log("orderdata => ",orderdata);
				Carts.deleteOne({ "user_ID" : ObjectId(req.body.user_ID) })
				.exec()
				.then(userCartDeleted => {
					// console.log("userCartDeleted => ",userCartDeleted)

					//=============================================================
					//         		Update Product Inventory
					//=============================================================
					if(userCartDeleted.deletedCount === 1){
						// console.log("Inside if => ", req.body.vendorOrders)
						for (var l = 0; l < req.body.vendorOrders.length; l++) {		
							// console.log("req.body.vendorOrders[l] => ",req.body.vendorOrders[l])
							for (let m = 0; m < req.body.vendorOrders[l].products.length; m++) {
								var productQuantity = req.body.vendorOrders[l].products[m].quantity;
								// console.log("req.body.vendorOrders[l].products[m].quantity = ",req.body.vendorOrders[l].products[m].quantity);
								// console.log("req.body.vendorOrders[l].vendor_id._id => ", req.body.vendorOrders[l].vendor_id._id)
								// console.log("req.body.vendorOrders[l].products[m].productCode => ", req.body.vendorOrders[l].products[m].productCode)
								// console.log("req.body.vendorOrders[l].products[m].itemCode => ", req.body.vendorOrders[l].products[m].itemCode)

								// ProductInventory
								// .findOne(
								// 	{ 
								// 		vendor_ID            : ObjectId(req.body.vendorOrders[l].vendor_id._id),
								// 		productCode 		 : req.body.vendorOrders[l].products[m].productCode,
								// 		itemCode 		 	 : req.body.vendorOrders[l].products[m].itemCode,
								// 	},
								// )
								// .then(productInventoryData=>{
									// console.log("Product Inventory data = ",productInventoryData);
									// res.status(200);
									// console.log("productInventoryData._id = ",productInventoryData._id);
									// console.log("productInventoryData.currentQuantity = ",productInventoryData.currentQuantity);
									// var newQuantity = parseInt(productInventoryData.currentQuantity) - parseInt(productQuantity);
									// console.log("newQuantity = ",newQuantity);

									ProductInventory.updateOne(
										{ 
											vendor_ID            : ObjectId(req.body.vendorOrders[l].vendor_id._id),
											productCode 		 : req.body.vendorOrders[l].products[m].productCode,
											itemCode 		 	 : req.body.vendorOrders[l].products[m].itemCode,
										},
										{ $inc :{
												currentQuantity   : -productQuantity
											},
											$push : {								
												updateLog       : {
													date        : new Date(),
													updatedBy   : ObjectId(req.body.user_ID),
													// order_id    : ObjectId(orderdata._id),
												}
											}
										}
									)		 
									.then(inventoryupdateData=>{
										console.log("inventoryupdateData = ",inventoryupdateData);
										// console.log("Product Inventory Updated successfully for productCode = "+req.body.vendorOrders[l].products[m].productCode+" & ItemCode="+req.body.vendorOrders[l].products[m].itemCode);
									})
									.catch(err =>{
										console.log("Error While Updating Inventory")
										// res.status(500).json({
										// 	error 	: err,
										// 	message : 'Error While Updating Inventory'
										// });
									}); 							
								// })
								// .catch(err =>{
								// 	console.log("Error Finding Inventory Data")
								// 	// res.status(500).json({
								// 	// 	error : error,
								// 	// 	message : 'Error Finding Inventory Data'
								// 	// });
								// }); 
							} //for m
						}//for l
						if(l >= req.body.vendorOrders.length){
							processData();
							async function processData(){

								//send Notification, email, sms to customer
								// console.log("send_notification_to_user => ",send_notification_to_user);
								
								//send Notification, email, sms to admin
								// var userData 	 = await User.findOne({"_id" : ObjectId(req.body.user_id)}); 
								var adminNotificationValues = {
									"event"			: "NewOrder",
									// "toUser_id"		: req.body.user_ID,
									"toUserRole"	: "admin",								
									"variables" 	: {
														"customerName" 			: req.body.userFullName,
														"customerEmail" 		: req.body.userEmail,
														"mobileNumber"			: orderdata.deliveryAddress.mobileNumber,
														"orderID"  				: orderdata.orderID,
														"deliveryAddress" 		: orderdata.deliveryAddress
									}
								}
								var send_notification_to_admin = await sendNotification.send_notification_function(adminNotificationValues);
								// console.log("send_notification_to_admin => ",send_notification_to_admin);

								//send Notification, email, sms to vendor
								// var vendorOrders = orderdata.vendorOrders;
								// console.log("vendorOrdes => ", vendorOrders);
								// for(var i=0; i<vendorOrders.length ; i++){
								// 	var vendor_id 			= vendorOrders[i].vendor_id;
								// 	var vendorLocation_id 	= vendorOrders[i].vendorLocation_id;
								// 	var vendorDetails 		= await Entitymaster.findOne({"_id" : ObjectId(vendor_id)},{maxServiceCharges : 1}); 
								// }

								// Add credit points earned on purchase
								if(orderdata.paymentDetails.creditPointsUsed && orderdata.paymentDetails.creditPointsValueUsed){
									var useCreditPoint 	= await useCreditPoints(orderdata._id, orderdata.user_ID, orderdata.paymentDetails.afterDiscountTotal, orderdata.paymentDetails.shippingCharges, orderdata.paymentDetails.netPayableAmount, "Credit Points Used", orderdata.paymentDetails.creditPointsUsed);
								}
								var addCreditPoint 	= await addCreditPoints(orderdata._id, orderdata.user_ID, orderdata.paymentDetails.afterDiscountTotal, orderdata.paymentDetails.shippingCharges, orderdata.paymentDetails.netPayableAmount, "Original Order", "add");
								
								res.status(200).json({ 
									order_id : orderdata._id,
									message  : 'Order placed successfully' 
								});
							}
						}
					}
				})
				.catch(error => {							
					res.status(500).json({
						error 	: error,
						message : 'Error While Clearing CartItems '
					});
				})							
			})
			.catch(error => {
				console.log('Error 500 While Placing Order => ', error);
				res.status(500).json({
					error   : error,
					message : 'Error While Placing Order'
				});
			})
		}
	} //if vendorOrders
}

/*========== get Next Order Number ==========*/
function getNextSequenceOrderId() {
	return new Promise((resolve,reject)=>{
	Orders.findOne()    
		.sort({orderID : -1})   
		.exec()
		.then(data=>{
			// console.log("data => ", data);
			if (data) { 
				var sequenceOrderNumber = data.orderID;
				sequenceOrderNumber = sequenceOrderNumber + 1;
				resolve(sequenceOrderNumber) 
			}else{
			   resolve(1)
			}
			
		})
		.catch(err =>{
			reject(0)
		});
	});
}

/*========== Add Credit Points ==========*/
function addCreditPoints(order_id, user_id, purchaseAmount, shippingCharges, totalAmount, transactionType, method) {
	var currDate = new Date();

	return new Promise((resolve,reject)=>{
		User.findOne({_id: ObjectId(user_id)})
			.then(userDetail => {
				if(!userDetail.authService || (userDetail.authService && userDetail.authService !== "guest")){					
					CreditPoints.findOne({"user_id" : ObjectId(user_id)})
					.then(async(data)=>{
						var creditPolicyData = await CreditPointsPolicy.findOne();
						console.log("creditPolicyData => ", creditPolicyData);
						
						var expiryLimitInDays = creditPolicyData.expiryLimitInDays;

						var earnedCreditPoints = Math.round(((purchaseAmount / creditPolicyData.purchaseAmount) * creditPolicyData.creditPoint));
						var expiryDate = moment(currDate, "MM/DD/YYYY").add(expiryLimitInDays, 'days') ;
						var transactions = {
												order_id            : order_id,
												transactionDate     : new Date(),
												expiryDate     	  : expiryDate,
												purchaseAmount      : purchaseAmount,
												shippingCharges     : shippingCharges,
												totalAmount         : totalAmount,
												earnedPoints        : (method === "minus" ? "-" : "") + earnedCreditPoints,
												typeOfTransaction   : transactionType,
												status 				  : "active"
											};

						console.log("transactions =", transactions);

						if(earnedCreditPoints > 0){
							if (data && data !== null ) { 
								var totalEarnedPoints = data.totalPoints + earnedCreditPoints;
								CreditPoints.updateOne(
									{ "_id": ObjectId(data._id)},		
									{$push:  {
													transactions : transactions
												},
												$set:{
													totalPoints : totalEarnedPoints
												}	
									})
									.exec()
									.then(updateddata => {
										console.log("credit updateddata => ",updateddata)
										if (updateddata.nModified === 1) {
											resolve({
												"message"	: "Credit Points added successfully in wallet."
											});
										} else {
											resolve({
												"message": "Oops, something went wrong credit points not added"
											});
										}
									})
									.catch(err => {
										console.log(err);
										reject({
											error: err
										});
									});
							}else{
								const creditPoints = new CreditPoints({
									_id 						: new mongoose.Types.ObjectId(),
									user_id                     : user_id,
									totalPoints                 : earnedCreditPoints,
									transactions 				: {
																	order_id            : order_id,
																	transactionDate     : currDate,
																	expiryDate     	  : expiryDate,
																	purchaseAmount      : purchaseAmount,
																	shippingCharges     : shippingCharges,
																	totalAmount         : totalAmount,
																	earnedPoints        : earnedCreditPoints,
																	typeOfTransaction   : transactionType,
																	status 				  : "active"
									},		
									createdAt 					: new Date(),
									createdBy 					: user_id
								});
					
								creditPoints.save()
								.then(async(creditData) => {
									console.log("saved creditData => ",creditData)	
									resolve({
										"message"	: "Credit Points added successfully in wallet."
									})
								})
								.catch(err =>{
									reject(0)
								});
							}     
						}else{
							resolve("No credit points earned")
						}      
					})
					.catch(err =>{
						reject(0)
					});
				}else{
					resolve({message : "Guest User doesn't get Credit Points!"});
				}

			})
			.catch(err =>{
				reject(0)
			});

	});
}

/*========== Use Credit Points ==========*/
function useCreditPoints(order_id, user_id, purchaseAmount, shippingCharges, totalAmount, transactionType, usedCreditPoints) {
	return new Promise((resolve,reject)=>{
		CreditPoints.findOne({"user_id" : ObjectId(user_id)})
		.then(async(data)=>{
			// console.log("data => ", data);
			
			if(data !== null){
				if (data && data !== null ) { 
					var totalEarnedPoints = Math.round(data.totalPoints + (-usedCreditPoints));
					// console.log("totalEarnedPoints => ",totalEarnedPoints)
					CreditPoints.updateOne(
						{ "_id": ObjectId(data._id)},		
						{$push: {
								transactions : {
									order_id            : order_id,
									transactionDate     : new Date(),
									purchaseAmount      : purchaseAmount,
									shippingCharges     : shippingCharges,
									totalAmount         : totalAmount,
									earnedPoints        : -usedCreditPoints,
									typeOfTransaction   : transactionType,
									status              : "active"
								}
							},
							$set:{
								totalPoints : totalEarnedPoints
							}	
						})
						.then(updateddata => {
							if (updateddata.nModified === 1) {
								resolve({
									"message"	: "Credit Points Redeemed successfully."
								});
							} else {
								resolve({
									"message": "Oops, something went wrong while redumption of credit points"
								});
							}
						})
						.catch(err => {
							console.log(err);
							reject({
								error: err
							});
						});
				}  
			}else{
				resolve("No credit points available for redumption")
			}      
		})
		.catch(err =>{
			reject(0)
		});
	});
}

/**=========== Cancel Order  ===========*/
exports.cancel_order = (req, res, next) => {
	if((req.body.type).toLowerCase() === "vendororder" && req.body.vendor_id){
		
		Orders.findOne({ _id: ObjectId(req.body.order_id)})
		.then(async(orderdata) => {			
			var order_beforeDiscountTotal   = orderdata.paymentDetails.beforeDiscountTotal;
			var order_afterDiscountTotal    = orderdata.paymentDetails.afterDiscountTotal;
			var order_discountAmount        = orderdata.paymentDetails.discountAmount;
			var order_taxAmount             = orderdata.paymentDetails.taxAmount;
			var order_numberOfProducts 		= orderdata.order_numberOfProducts;
			var order_quantityOfProducts 	= orderdata.order_quantityOfProducts;
			var afterDiscountCouponAmount 	= orderdata.paymentDetails.afterDiscountCouponAmount;
			var order_shippingCharges       = 0;
			var maxServiceCharges           = 0; 
			var netPayableAmount 			= 0;
			var couponCancelMessage 		= "";
			
			var maxServiceChargesData   = await StorePreferences.findOne({},{maxServiceCharges : 1});            
			if(maxServiceChargesData !== null){
				maxServiceCharges = maxServiceChargesData.maxServiceCharges;
			}
			
			for (var i = 0; i < orderdata.vendorOrders.length; i++) {				
				order_shippingCharges = order_shippingCharges + orderdata.vendorOrders[i].vendor_shippingCharges;
				
				if(String(orderdata.vendorOrders[i].vendor_id) === String(req.body.vendor_id)){
					order_beforeDiscountTotal   -=  orderdata.vendorOrders[i].vendor_beforeDiscountTotal;
					order_afterDiscountTotal    -=  orderdata.vendorOrders[i].vendor_afterDiscountTotal;
					order_discountAmount        -=  orderdata.vendorOrders[i].vendor_discountAmount;
					order_taxAmount             -=  orderdata.vendorOrders[i].vendor_taxAmount;
					order_shippingCharges 		-= (orderdata.vendorOrders[i].vendor_shippingCharges).toFixed(2);
					order_numberOfProducts 		-= (orderdata.vendorOrders[i].vendor_numberOfProducts).toFixed(2);
					order_quantityOfProducts 	-= (orderdata.vendorOrders[i].vendor_quantityOfProducts).toFixed(2);

					var vendor_order_afterDiscountTotal = orderdata.vendorOrders[i].vendor_afterDiscountTotal;
					var vendor_order_shippingCharges 	= orderdata.vendorOrders[i].vendor_shippingCharges;
					var vendor_netPayableAmount 		= orderdata.vendorOrders[i].vendor_afterDiscountTotal;					
				}				
			}
			if(i >= orderdata.vendorOrders.length){
				/*----------- Apply Shipping charges not greter than max Shipping Charges -----------*/
				order_shippingCharges     = (maxServiceCharges && maxServiceCharges > 0 
											? 
												maxServiceCharges > order_shippingCharges 
												? 
													order_shippingCharges
												: 
													maxServiceCharges 
											: 
												order_shippingCharges);

				
				if (orderdata.paymentDetails.disocuntCoupon_id && orderdata.paymentDetails.disocuntCoupon_id !== undefined) {
					
					var isCouponValid           = await fetchCouponData(orderdata.paymentDetails.disocuntCoupon_id); 
					// console.log("isCouponValid => ",isCouponValid)                   
					
					if (isCouponValid.code === "FAILED") {
						couponCancelMessage         = isCouponValid.message;
						netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + order_shippingCharges).toFixed(2);			
						afterDiscountCouponAmount   = 0;
					}else{ 
						/*---- Check for Min Puchase amount for Coupon to be applied ----*/
						if(parseFloat(order_afterDiscountTotal) > parseFloat(isCouponValid.dataObj.minPurchaseAmount)){
	
							if ((isCouponValid.dataObj.couponin).toLowerCase() === "percent") {
								var discountInPercent   = (order_afterDiscountTotal * isCouponValid.dataObj.couponvalue) / 100;								
								
								/*------  Check for Applicable Maximum Discount Amount -------*/
								var discoutAfterCouponApply     =   isCouponValid.dataObj.maxDiscountAmount 
																	? 
																		discountInPercent < isCouponValid.dataObj.maxDiscountAmount 
																		? 
																			discountInPercent 
																		:   
																			isCouponValid.dataObj.maxDiscountAmount 
																	: 
																		discountInPercent;
								afterDiscountCouponAmount   	= (discoutAfterCouponApply).toFixed(2);
								netPayableAmount            	= ((order_afterDiscountTotal - discoutAfterCouponApply) + order_taxAmount + order_shippingCharges).toFixed(2);                       
	
							}else if((isCouponValid.dataObj.couponin).toLowerCase() === "amount"){
								
								/*------  Check for Applicable Maximum Discount Amount -------*/
								var discoutAfterCouponApply     =   isCouponValid.dataObj.maxDiscountAmount 
																	? 
																		isCouponValid.dataObj.couponvalue < isCouponValid.dataObj.maxDiscountAmount 
																		? 
																			(isCouponValid.dataObj.couponvalue).toFixed(2) 
																		: 
																			isCouponValid.dataObj.maxDiscountAmount 
																	: 
																		(isCouponValid.dataObj.couponvalue).toFixed(2);
						
								afterDiscountCouponAmount   	= (discoutAfterCouponApply).toFixed(2);
								netPayableAmount    			= ((order_afterDiscountTotal - discoutAfterCouponApply) + order_taxAmount + order_shippingCharges).toFixed(2);	
							}    
						}else{
							netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + order_shippingCharges).toFixed(2);							
							afterDiscountCouponAmount   = 0;
							couponCancelMessage 		= "This Coupon Code is Only Applicable if Minimum Cart Amount is "+ isCouponValid.dataObj.minPurchaseAmount	
						}	
					}			
				}else{
					netPayableAmount = (order_afterDiscountTotal + order_taxAmount + order_shippingCharges).toFixed(2);						
				}
			}			
			// console.log("order_beforeDiscountTotal => ",order_beforeDiscountTotal);
			// console.log("order_afterDiscountTotal => ",order_afterDiscountTotal);
			// console.log("order_taxAmount => ",order_taxAmount);
			// console.log("afterDiscountCouponAmount => ",afterDiscountCouponAmount);
			// console.log("order_shippingCharges => ",order_shippingCharges);
			// console.log("maxServiceCharges => ",maxServiceCharges);
			// console.log("netPayableAmount => ",netPayableAmount);		
			// console.log("order_numberOfProducts => ",order_numberOfProducts);
			// console.log("order_quantityOfProducts => ",order_quantityOfProducts);
			// console.log("couponCancelMessage => ",couponCancelMessage);			
			Orders.updateOne(
			{ _id: ObjectId(req.body.order_id), 'vendorOrders.vendor_id' : ObjectId(req.body.vendor_id)},		
			{
				$set:{
					"vendorOrders.$.orderStatus"    			: "Cancelled",
					"paymentDetails.beforeDiscountTotal" 		: order_beforeDiscountTotal,
					"paymentDetails.discountAmount" 			: order_discountAmount,
					"paymentDetails.afterDiscountTotal" 		: order_afterDiscountTotal,
					"paymentDetails.taxAmount" 					: order_taxAmount,
					"paymentDetails.shippingCharges" 			: order_shippingCharges,
					"paymentDetails.afterDiscountCouponAmount" 	: afterDiscountCouponAmount,
					"paymentDetails.netPayableAmount" 			: netPayableAmount,
					"order_numberOfProducts" 					: order_numberOfProducts,
					"order_quantityOfProducts" 					: order_quantityOfProducts,
					"paymentDetails.couponCancelMessage" 		: couponCancelMessage
				},
				$push: {	
					"vendorOrders.$.deliveryStatus" : {
						status 				: 'Cancelled',
						timestamp 			: new Date(),
						statusUpdatedBy 	: req.body.userid
					}
				}
			})
			.then(async(updatedata) => {
				// console.log("updatedata => ",updatedata);
				if (updatedata.nModified === 1) {
					// console.log(" => ",req.body.order_id, " ",orderdata.user_ID," ",orderdata.createdAt," ",vendor_order_afterDiscountTotal," ",vendor_order_shippingCharges," ", vendor_netPayableAmount," ")
					var addCreditPoint = await addCreditPoints(orderdata._id, orderdata.user_ID, vendor_order_afterDiscountTotal, vendor_order_shippingCharges, vendor_netPayableAmount, "Vendor Order Cancelled", "minus");
					// console.log("addCreditPoint => ",addCreditPoint)		

					var vendorOrders = await Orders.findOne({"_id" : ObjectId(req.body.order_id), "vendorOrders.vendor_id" : ObjectId(req.body.vendor_id)},{'vendorOrders.$' : 1})
					// console.log("vendorOrders => ",vendorOrders);
					// console.log("condition => ",(vendorOrders && vendorOrders !== null && vendorOrders.vendorOrders && vendorOrders.vendorOrders.length > 0 && vendorOrders.vendorOrders[0].products && vendorOrders.vendorOrders[0].products.length > 0))
					if(vendorOrders && vendorOrders !== null && vendorOrders.vendorOrders && vendorOrders.vendorOrders.length > 0 && vendorOrders.vendorOrders[0].products && vendorOrders.vendorOrders[0].products.length > 0){
						var singleVendorOrder = vendorOrders.vendorOrders[0];
						// console.log("vendorOrders => ",vendorOrders);
						for (let i = 0; i < singleVendorOrder.products.length; i++) {
							// console.log("singleVendorOrder.products[i] => ,",singleVendorOrder.products[i])
							console.log(" => ",req.body.vendor_id ," ",singleVendorOrder.products[i].productCode, " ",singleVendorOrder.products[i].itemCode)
							await ProductInventory.updateOne(
								{ 
									vendor_ID            : ObjectId(req.body.vendor_id),
									productCode 		 : singleVendorOrder.products[i].productCode,
									itemCode 		 	 : singleVendorOrder.products[i].itemCode,
								},
								{ $inc : {
										currentQuantity   : -singleVendorOrder.products[i].quantity
									}
								}
							)		 
							.then(inventoryupdateData=>{
								console.log("inventoryupdateData = ",inventoryupdateData);
								// console.log("Product Inventory Updated successfully for productCode = "+req.body.vendorOrders[l].products[m].productCode+" & ItemCode="+req.body.vendorOrders[l].products[m].itemCode);
							})
							.catch(err =>{
								console.log("Error While Updating Inventory")
								// res.status(500).json({
								// 	error 	: err,
								// 	message : 'Error While Updating Inventory'
								// });
							});
							
						}
					}					
					res.status(200).json({
						"message"	: "Order cancelled successfully."
					});
				} else {
					res.status(200).json({
						"message": "Order Not Found"
					});
				}
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({
					error: err
				});
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}else{
		Orders.updateOne(
		{ _id: ObjectId(req.body.order_id)},		
		{
			$set:{
				"orderStatus"    				: "Cancelled",
				"vendorOrders.$[].orderStatus"  : "Cancelled"
			},			
			$push: {
				"vendorOrders.$[].deliveryStatus" : {
					status 				: 'Cancelled',
					timestamp 			: new Date(),
					statusUpdatedBy 	: req.body.userid
				}
			}		
		})
		.exec()
		.then(async(data) => {
			if (data.nModified === 1) {
				var orderdata 		= await Orders.findOne({_id: ObjectId(req.body.order_id)})
				// console.log("orderdata=> ",orderdata)
				var addCreditPoint 	= await addCreditPoints(orderdata._id, orderdata.user_ID, orderdata.paymentDetails.afterDiscountTotal, orderdata.paymentDetails.shippingCharges, orderdata.paymentDetails.netPayableAmount, "Whole Order Cancelled", "minus");
				// console.log("else addCreditPoint => ",addCreditPoint)
				var vendorOrders = await Orders.findOne({"_id" : ObjectId(req.body.order_id)},{'vendorOrders' : 1})
					// console.log("vendorOrders => ",vendorOrders);
					// console.log("condition => ",(vendorOrders && vendorOrders !== null && vendorOrders.vendorOrders && vendorOrders.vendorOrders.length > 0 && vendorOrders.vendorOrders[0].products && vendorOrders.vendorOrders[0].products.length > 0))
				if(vendorOrders && vendorOrders !== null && vendorOrders.vendorOrders && vendorOrders.vendorOrders.length > 0){
					// console.log("vendorOrders => ",vendorOrders);
					for (var i = 0; i < vendorOrders.length; i++) {
						var vendorOrdersArray = vendorOrders.vendorOrders;
					
						for (let j = 0; j < vendorOrdersArray.products.length; j++) {
							// console.log("singleVendorOrder.products[i] => ,",singleVendorOrder.products[i])
							// console.log(" => ",req.body.vendor_id ," ",vendorOrdersArray.products[i].productCode, " ",vendorOrdersArray.products[i].itemCode)
							await ProductInventory.updateOne(
								{ 
									vendor_ID            : ObjectId(vendorOrdersArray[i].vendor_id),
									productCode 		 : vendorOrdersArray[i].products[j].productCode,
									itemCode 		 	 : vendorOrdersArray[i].products[j].itemCode,
								},
								{ $inc : {
										currentQuantity   : -vendorOrdersArray[i].products[j].quantity
									}
								}
							)		 
							.then(inventoryupdateData=>{
								console.log("inventoryupdateData = ",inventoryupdateData);
								// console.log("Product Inventory Updated successfully for productCode = "+req.body.vendorOrders[l].products[m].productCode+" & ItemCode="+req.body.vendorOrders[l].products[m].itemCode);
							})
							.catch(err =>{
								console.log("Error While Updating Inventory")
								// res.status(500).json({
								// 	error 	: err,
								// 	message : 'Error While Updating Inventory'
								// });
							});
							
						}
					}
				}	
				res.status(200).json({
					"message"	: "Order cancelled successfully."
				});
			} else {
				res.status(200).json({
					"message": "Oops, something went wrong Order not cancelled"
				});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}
}

/*========== Fetch Coupon Data ==========*/
function fetchCouponData(coupon_id) {     
	return new Promise(function (resolve, reject) {
		Coupon.findOne({"_id" : ObjectId(coupon_id)})
		.then(coupondata => {
			if(coupondata !== null){  
				resolve({code: "SUCCESS", dataObj: coupondata});                
			}else{
				resolve({code: "FAILED", message: "Such Coupon Code Doesn't exist!"});
			}
		})
		.catch(error=>{
			reject({code: "FAILED", message: "Some error in finding Coupon"});
		})
	})
}

/**=========== getDistanceWiseShippinCharges() ===========*/
function getDistanceWiseShippinCharges(){
	return new Promise(function(resolve,reject){
		StorePreferences.findOne()
		.then(storePreferences=>{
			// console.log("storePreferences => ",storePreferences)
			// console.log("Condition => ",(storePreferences && storePreferences.serviseChargesByDistance && storePreferences.serviseChargesByDistance.length > 0))
			if(storePreferences && storePreferences.serviseChargesByDistance){
				// console.log("storePreferences.serviseChargesByDistance => ",storePreferences.serviseChargesByDistance)
				resolve(storePreferences.serviseChargesByDistance);
			}else{
				resolve([]);
			}            
		})
		.catch(err =>{
			console.log("Error => ",err);
			reject(err)
		});
	});
}

/*========== List Status Wise Orders ==========*/
exports.list_orders_by_status = (req, res, next) => {
	// console.log("list_orders_by_status => ",req.body);
	var selector        = {};
	selector['$and']    = [];
	
	/**----------- Find Status wise Orders ------------ */		
	if(req.body.status.toLowerCase() !== "all"){       
		selector["$and"].push({
			vendorOrders : { 
				$elemMatch: { orderStatus: req.body.status } 
			} 
		})
	}else{
		selector["$and"].push({
			vendorOrders : { 
				$elemMatch: { orderStatus:{"$ne" : ""} }
			} 
		})
	}

	/**----------- Seach Orders by OrderID, VendorName, User Name etc. ------------ */
	if(req.body.searchText && req.body.searchText !== ""){
		selector["$and"].push({ 
			"$or" : [
						{ "orderID" 										: isNaN(req.body.searchText) ? 0 : parseInt(req.body.searchText) },
						{ "userFullName" 									: {'$regex' : req.body.searchText , $options: "i" } },
						{ "deliveryAddress.name" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorOrders.vendor_id.companyName" 	: {'$regex' : req.body.searchText , $options: "i" } } 
					]
		})
	}
	// console.log("selector",isNaN(req.body.searchText));
	// console.log("selector",selector.$and[1].$or[3].vendorOrders);
	// console.log("selector => ",selector[0])
	Orders.find(selector)
	// aggregate([
	// 	// {$match : { 
	// 	// 	vendorOrders: { 
	// 	// 		$elemMatch: { orderStatus: req.body.status } 
	// 	// 	}
	// 	// }}
	// 	{$match : selector}
	// ])
	.populate('vendorOrders.vendor_id')
	.sort({ createdAt: -1 })
	// .skip(parseInt(req.body.startRange))
	// .limit(parseInt(req.body.limitRange))
	.then(data => {
		// console.log("data===>>>",data[0].vendorOrders);
		console.log("data.length===>>>",data.length);

		res.status(200).json({
			dataCount 	: data.length,
			data 			: data.slice(req.body.startRange, req.body.startRange + req.body.limitRange)
		});

		// res.status(200).json(data);
	})
	.catch(err => {
		console.log("Error while finding order => ",err);
		res.status(500).json({
			error: err
		});
	});
};

/**============ Return Product ===========*/
exports.returnProduct = (req, res, next) => {
	// console.log("Return Products body => ", req.body);
  	Orders.updateOne(
		{'_id' : ObjectId(req.body.order_id), 'vendorOrders.vendor_id' : req.body.vendor_id},
		{$set:
			{
				'vendorOrders.$[outer].products.$[inner].productStatus' : "Return Requested",
				'vendorOrders.$[outer].products.$[inner].returnedDate'	: new Date(),
			}
		},
		{arrayFilters: [
			{ 'outer.vendor_id' : req.body.vendor_id}, 
			{ 'inner.product_ID': req.body.product_id }
		]}
	)
	.exec()
	.then(data => {
		if (data.nModified == 1) {
			// Orders.findOne({ "_id": ObjectId(req.body.order_id), 'vendorOrders.vendor_id' : req.body.vendor_id, 'vendorOrders.products.product_ID' : req.body.product_id })
			Orders.findOne({ "_id": ObjectId(req.body.order_id)})
			.exec()
			.then(orderdata => {
				// console.log("orderdata => ",orderdata);
				var vendor = orderdata.vendorOrders.filter(vendorObject => String(vendorObject.vendor_id) === String(req.body.vendor_id));
				// console.log("vendor",vendor);
				if(vendor && vendor.length > 0 && vendor[0].products && vendor[0].products.length > 0){
					// console.log("vendor[0].products => ",vendor[0].products);
					// console.log("vendor[0].vendor_numberOfProducts => ",vendor[0].vendor_numberOfProducts);
					if(vendor[0].products.length > 0){
						var returnedProduct  = vendor[0].products.filter(product => String(product.product_ID) === String(req.body.product_id));
					}else{
						var returnedProduct  = [];
					}
					// console.log("returnedProduct => ",returnedProduct);
					// console.log("orderdata.orderID => ",orderdata.orderID);
					if(returnedProduct && returnedProduct.length > 0){
						const returnedproducts = new ReturnedProducts({
							_id 					: new mongoose.Types.ObjectId(),
							order_id                : req.body.order_id,
							orderID                	: orderdata.orderID,
							user_id                 : req.body.user_id,
							vendor_id 				: req.body.vendor_id,
							vendorLocation_id 		: req.body.vendorLocation_id,
							product_id              : req.body.product_id,
							reasonForReturn         : req.body.reasonForReturn,
							customerComment 		: req.body.customerComment,
							refundMode 				: req.body.refund,
							returnProductImages 	: req.body.returnProductImages,
							section_id 				: returnedProduct[0].section_ID,
							category_id 			: returnedProduct[0].category_ID,
							subCategory_id 		: returnedProduct[0].subCategory_ID,
							originalPrice           : returnedProduct[0].originalPrice,
							discountPercent         : returnedProduct[0].discountPercent,
							discountedPrice         : returnedProduct[0].discountedPrice,
							productQuantity 		: returnedProduct[0].quantity,
							modeOfPayment           : orderdata.paymentDetails.paymentMethod,
							dateOfPurchase          : orderdata.createdAt,
							dateOfReturn            : new Date(),
							returnStatus 			: "Return Requested",
							returnStatusLog 		: [{
														status 	: "Return Requested",
														date 	: new Date()
							}],
							// refund 				: [{
							// 						bankName 		: req.body.bankname,
							// 						bankAccountNo 	: req.body.bankacctno,
							// 						IFSCCode 		: req.body.ifsccode,
							// 						amount 			: orderdata.products[0].discountedPrice
							// }],
							createdBy 			: req.body.user_id,
							createdAt 			: new Date()
						})
						returnedproducts.save()
						.then(async(returndata) => {
							// var isOrderCreditAvailable = await CreditPoints.findOne({"user_id" : ObjectId(req.body.user_id), "transactions.order_id" : ObjectId(req.body.order_id)});
							
							// if(isOrderCreditAvailable !== null){
							// 	await addCreditPoints(req.body.order_id, req.body.user_id, (returndata.discountedPrice * returndata.productQuantity), 0, (returndata.discountedPrice * returndata.productQuantity), "Return Product Credit", "minus");

								var userData 	 = await User.findOne({"_id" : ObjectId(req.body.user_id)}); 
								
								//send Notification, email, sms to admin
								var adminNotificationValues = {
									"event"			: "ProductReturn",
									// "toUser_id"		: req.body.user_ID,
									"toUserRole"	: "admin",								
									"variables" 	: {
														"customerName" 			: userData.profile.fullName,
														"customerEmail" 		: userData.profile.email,
														"mobileNumber"			: userData.profile.mobile,
														"orderID"  				: orderdata.orderID,
														"product" 				: returnedProduct[0].productName + "-" + (returnedProduct[0].itemCode),
														"orderDate"  			: moment(orderdata.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
														"returnDate"  			: moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'),
														"deliveryAddress" 		: orderdata.deliveryAddress
									}
								}
								var send_notification_to_admin = await sendNotification.send_notification_function(adminNotificationValues);

								//send Notification, email, sms to vendor
								var vendorNotificationValues = {
									"event"			: "ProductReturn",
									// "toUser_id"		: req.body.user_ID,
									"toUserRole"	: "vendor",
									"company_id"	: req.body.vendor_id,	
									"otherAdminRole"	: "vendor",								
									"variables" 	: {
														"customerName" 			: userData.profile.fullName,
														"customerEmail" 		: userData.profile.email,
														"mobileNumber"			: userData.profile.mobile,
														"orderID"  				: orderdata.orderID,
														"product" 				: returnedProduct[0].productName + "-" + (returnedProduct[0].itemCode),
														"orderDate"  			: moment(orderdata.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
														"returnDate"  			: moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'),
														"deliveryAddress" 		: orderdata.deliveryAddress
									}
								}
								var send_notification_to_vendor = await sendNotification.send_notification_function(vendorNotificationValues);
							// }
								res.status(200).json({ 
									message : "Return requested ! We will get back to you soon" 
								});
						})
						.catch(err => {
							console.log("err => ",err);
							res.status(500).json({ 
								message 	: "Failed to return product." ,
								error 		: err 
							});
						});
					}
				}else{
					console.log("No vendor found")
				}
			})
			.catch(err => {
				console.log("Error While finding order => ",err)
				res.status(500).json({
					message : "Error While finding order",
					error 	: err 
				});
			});
		} else {
			res.status(200).json({
				"message": "Failed to return product"
			});
		}
	})
	.catch(err => {
		console.log("Error while returning product => ", err);
		res.status(500).json({
			message : "Error while returning product",
			error 	: err
		});
	});
}


/*========== Split VendorWise Orders ==========*/
function addSplitVendorOrders(orderID) {
	return new Promise(function (resolve, reject) {
		Orders.findOne({"_id" : ObjectId(orderID)})
		.exec()
		.then(data => {
			// console.log("data => ", data);
			processData();
			async function processData(){
				if (data && data.products && data.products.length > 0) {
					const uniqueVendorArray = [...new Set(data.products.map(item => String(item.vendor_ID)))];
					// console.log("uniqueVendorArray => ",uniqueVendorArray);

					for (var i = 0; i < uniqueVendorArray.length; i++) {
						// console.log("uniqueVendorArray[i] => ",uniqueVendorArray[i]);
						var filteredVendorProducts = data.products.filter(function(product){
							return String(product.vendor_ID) === String(uniqueVendorArray[i]);
						});
						// console.log("filteredVendorProducts => ",filteredVendorProducts);
						var vendorData = await getVendorData(uniqueVendorArray[i]);
						// console.log("vendorData => ",vendorData);
						var formValues = {
							orderID                   	: data.orderID,
							order_ID                   	: data._id,
							vendorOrderID             	: data.orderID + "-" + vendorData.vendorID,
							user_ID                   	: data.user_ID,
							emailID                   	: data.emailID,
							userFullName              	: data.userFullName,
							userName                  	: data.userName,
							status                    	: data.status,
							RESPOSE_CODE              	: data.RESPOSE_CODE,
							RESPOSE_MESSAGE           	: data.RESPOSE_MESSAGE,
							REFERENCE_NO              	: data.REFERENCE_NO,
							products                  	: filteredVendorProducts,
							returnedProduct           	: data.returnedProduct,
							paymentMethod             	: data.paymentMethod,
							shippingtime              	: data.shippingtime,
							productLength             	: filteredVendorProducts.length,
							deliveryAddress           	: data.deliveryAddress,
							deliveryStatus            	: data.deliveryStatus,
							vendorID 					: vendorData.vendorID,
							vendor_ID 					: uniqueVendorArray[i],
							createdBy                 	: data.createdBy,
							createdAt                 	: new Date()
						}
						// console.log("formValues => ",formValues);
						await axios.post('http://localhost:'+globalVariable.port+'/api/vendororders/post', formValues)
					.then((response) => {
					//    console.log("response => ",response);
					})
					.catch(error=>{
						console.log("error => ",error);
					})
					}
				}
			}
			// resolve(data.length);
		})
	})
}

/** =========== Change Vendor Order Status =========== */
exports.change_vendor_orders_status = (req, res, next) => {
	// console.log("req.body => ",req.body)
	var statusObj = {
		status 				: req.body.changeStatus,
		timestamp 			: new Date(),
		statusUpdatedBy 	: req.body.userid
	}
	if(req.body.allocationRejectReason && req.body.allocationRejectReason !== undefined && req.body.allocationRejectReason !== ""){
		statusObj.allocationRejectReason = req.body.allocationRejectReason;
	}
	if(req.body.allocationRejectDesc && req.body.allocationRejectDesc !== undefined && req.body.allocationRejectDesc !== ""){
		statusObj.allocationRejectDesc = req.body.allocationRejectDesc;
	}
	Orders.updateOne(
	{ _id: ObjectId(req.body.order_id), 'vendorOrders.vendor_id' : ObjectId(req.body.vendor_id)},		
	{
		$set:{
			"vendorOrders.$.orderStatus"  : req.body.changeStatus
		},
		$push: {	
			"vendorOrders.$.deliveryStatus" : statusObj
		}
	})
	.then(async(updatedata) => {
		// console.log("updatedata => ",updatedata);
		if (updatedata.nModified === 1) {
			var vendorOrders 	= await Orders.findOne({ _id : ObjectId(req.body.order_id) }, {vendorOrders : 1});
			// console.log("OrderStatuses => ",OrderStatuses);
			// console.log("vendorOrders => ",vendorOrders);
			var count = 0;
			for(var i=0; i < vendorOrders.vendorOrders.length; i++){
				// console.log("vendorOrders.vendorOrders.orderStatus => ",vendorOrders.vendorOrders[i].orderStatus)
				if(vendorOrders.vendorOrders[i].orderStatus === "Delivered" || vendorOrders.vendorOrders[i].orderStatus === "Cancelled"){
					count += 1;
					// console.log("count 1 => ",count)
				}
			}
			if(i >= vendorOrders.vendorOrders.length){
				// console.log("count => ",(count === vendorOrders.vendorOrders.length));
				if(count === vendorOrders.vendorOrders.length){
					Orders.updateOne(
						{ _id: ObjectId(req.body.order_id)},		
						{
							$set:{
								"orderStatus"  : req.body.changeStatus
							}
						}
					)
					.then(async(updateorderdata) => {
						// console.log("updateorderdata => ",updateorderdata)
					
						var orderdata 	= await Orders.findOne({ _id : ObjectId(req.body.order_id) }, {user_ID : 1, deliveryAddress : 1, orderID : 1});
						var userData 	= await User.findOne({"_id" : ObjectId(orderdata.user_ID)}); 
						// console.log("userData => ",userData)
						
						var userNotificationValues = {
							"event"				: "OrderStatusChange",
							"toUser_id"			: orderdata.user_ID,
							"toUserRole"		: "user",
							"toMobileNumber"	: orderdata.deliveryAddress.mobileNumber,								
							"variables" 		: {
													"customerName" 			: userData.profile.fullName,
													"customerEmail" 		: userData.profile.email,
													"mobileNumber"			: orderdata.deliveryAddress.mobileNumber,
													"orderID"  				: orderdata.orderID,
													"deliveryAddress" 		: orderdata.deliveryAddress
							}
						}
						var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);	
					})
					.catch(err => {
						console.log("Error => Failed to Update Complete Order Status")
					})					
				}
			}
			res.status(200).json({
				"message"	: "Vendor Order Status Updated Successfully."
			});
		} else {
			res.status(200).json({
				"message" : "Failed to Update Vendor Order Status"
			});
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error : err
		});
	});
}

/*========== Return Vendor Id ==========*/
function getVendorData(vendor_ID) {
	return new Promise(function (resolve, reject) {
		Entitymaster.findOne({"_id" : ObjectId(vendor_ID)})
		.exec()
		.then(data => {
			// console.log("vendor Id data => ", data);				
			resolve({
				vendorID : data.companyID
			});
		})
	})
}

/*========== Return Unique Values from Array of Objests ==========*/
function onlyUnique(value, index, self) { 
	return self.indexOf(value) === index;
}

function findDistance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}else {
		var radlat1 	= Math.PI * lat1 / 180;
		var radlat2 	= Math.PI * lat2 / 180;
		var theta 		= lon1 - lon2;
		var radtheta 	= Math.PI * theta / 180;
		var dist 		= Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		
		if (dist > 1) {
			dist = 1;
		}

		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;

		if (unit == "K") { dist = dist * 1.609344 }
		if (unit == "N") { dist = dist * 0.8684 }
		// console.log("distance========",dist);
		return dist;
	}
}


exports.update_order = (req, res, next) => {
  Orders.updateOne(
	 { _id: req.body.order_ID },
	 {
		$set: {
		  user_ID: req.body.user_ID,
		  emailID: req.body.emailID,
		  userFullName: req.body.userFullName,
		  numericOrderID: req.body.numericOrderID,
		  cartTotal: req.body.cartTotal,
		  currency: req.body.currency,
		  totalAmount: req.body.totalAmount,
		  transactionID: req.body.transactionID,
		  status: req.body.status,
		  products: req.body.products,
		  paymentMethod: req.body.paymentMethod,
		  shippingtime: req.body.shippingtime,
		  productLength: req.body.productLength,
		  totalQuantity: req.body.totalQuantity,
		  deliveryAddress: req.body.deliveryAddress,
		  deliveryStatus: req.body.deliveryStatus,
		  createdAt: new Date()
		}
	 }
  )
	 .exec()
	 .then(data => {
		if (data.nModified == 1) {
		  res.status(200).json({
			 "message": "Order Updated Successfully."
		  });
		} else {
		  res.status(401).json({
			 "message": "Order Not Found"
		  });
		}
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.list_franchise_order = (req, res, next) => {
  // console.log("list_franchise_order===>>>",req.params);

  Orders.find({ allocatedToFranchise: ObjectId(req.params.franchiseID) })
	 // .populate("franchiseCustId")
	 .populate("allocatedToFranchise")
	 .sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		// console.log("allocatedToFranchise===>>>",data);
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.list_order = (req, res, next) => {
  Orders.find({})
	 .populate("allocatedToFranchise")
	 .sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		// console.log("allocatedToFranchise===>>>",data);
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.list_order_for_dashboard = (req, res, next) => {
  Orders.find({})
	 .populate("allocatedToFranchise")
	 .sort({ createdAt: -1 })
	 .limit(10)
	 .then(data => {
		// console.log("allocatedToFranchise===>>>",data);
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.vendor_order_list = (req, res, next) => {
  Orders.aggregate([
	 { "$unwind": "$products" },
	 {
		"$lookup": {
		  "from": "products",
		  "as": "products.productDetail",
		  "localField": "products.product_ID",
		  "foreignField": "_id"
		}
	 },
	 { "$unwind": "$products.productDetail" },
	 { "$match": { "products.vendor_ID": ObjectId(req.params.vendorID) } },
	 {
		"$group": {
		  "_id": "$_id",
		  "orderID": { "$first": "$orderID" },
		  "userFullName": { "$first": "$userFullName" },
		  "products": { "$push": "$products" },
		  "cartQuantity": { "$first": "$cartQuantity" },
		  "status": { "$first": "$status" },
		}
	 },
  ])
	 .skip(parseInt(req.body.startRange))
	 .limit(parseInt(req.body.limitRange))
	 .exec()
	 .then(data => {
		var tableData = data.map((a, i) => {
		  return {
			 "orderID": a.orderID,
			 "userFullName": a.userFullName,
			 "products": ((a.products.map((b, j) => { return '<div><p>Product Name: ' + b.productName + '</p><p>Product Code: ' + b.productDetail.productCode + '-' + b.productDetail.itemCode + '</p><p>Sell Quantity: ' + b.quantity + '</p><p>Price: <span class="ororiginalPrice">' + (b.discountPercent > 0 ? b.originalPrice : '') + '</span>  <span>' + b.discountedPrice + '</span>  <span class="orPercent">' + (b.discountPercent > 0 ? b.discountPercent + '%' : '') + '</span>  </p>' + '</div><br/>' })).toString()).replace(/,/g, " "),
			 "cartQuantity": a.cartQuantity,
			 "status": a.status
		  }
		})
		res.status(200).json(tableData);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.vendor_order_count = (req, res, next) => {
  Orders.aggregate([
	 { "$unwind": "$products" },
	 {
		"$lookup": {
		  "from": "products",
		  "as": "products.productDetail",
		  "localField": "products.product_ID",
		  "foreignField": "_id"
		}
	 },
	 { "$unwind": "$products.productDetail" },
	 { "$match": { "products.vendor_ID": ObjectId(req.params.vendorID) } },
	 {
		"$group": {
		  "_id": "$_id",
		  "products": { "$push": "$products" },

		}
	 },
	 {
		"$count": "dataCount"
	 },
  ])
	 .exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.list_orderby_status_franchisewise = (req, res, next) => {
  Orders.find({ "deliveryStatus.status": req.params.status, allocatedToFranchise: ObjectId(req.params.franchiseID) })
	 .populate("allocatedToFranchise")
	 .sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		// console.log("allocatedToFranchise===>>>",data);
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.list_orderby_status = (req, res, next) => {
  // Orders.aggregate([
  // { "$match": { "deliveryStatus.status" :  req.params.status} },
  // { "$redact":
  //     {
  //         "$cond": {
  //            "if": { "$eq": [ { "$arrayElemAt": [ "$deliveryStatus.status", -1 ] }, req.params.status ] },
  //            "then": "$$KEEP",
  //            "else": "$$PRUNE"
  //         }
  //     }
  // }
  // ])
  Orders.find({ "deliveryStatus.status": req.params.status })
	 .populate("allocatedToFranchise")
	 .sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		// console.log("allocatedToFranchise===>>>",data);
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.vendor_orderlistby_status = (req, res, next) => {
  Orders.aggregate([
	 { "$unwind": "$products" },
	 {
		"$lookup": {
		  "from": "products",
		  "as": "products.productDetail",
		  "localField": "products.product_ID",
		  "foreignField": "_id"
		}
	 },
	 { "$unwind": "$products.productDetail" },
	 { "$match": { "products.vendor_ID": ObjectId(req.params.vendorID) } },
	 {
		"$group": {
		  "_id": "$_id",
		  "orderID": { "$first": "$orderID" },
		  "userFullName": { "$first": "$userFullName" },
		  "products": { "$push": "$products" },
		  "cartQuantity": { "$first": "$cartQuantity" },
		  "status": { "$first": "$status" },
		  "deliveryStatus": { "$first": "$deliveryStatus" }
		}
	 },
	 { "$match": { "deliveryStatus.status": req.body.status } },
	 {
		"$redact":
		{
		  "$cond": {
			 "if": { "$eq": [{ "$arrayElemAt": ["$deliveryStatus.status", -1] }, req.body.status] },
			 "then": "$$KEEP",
			 "else": "$$PRUNE"
		  }
		}
	 }
  ])
	 .sort({ createdAt: -1 })
	 .skip(parseInt(req.body.startRange))
	 .limit(parseInt(req.body.limitRange))
	 .exec()
	 .then(data => {
		var tableData = data.map((a, i) => {
		  return {
			 "orderID": a.orderID,
			 "userFullName": a.userFullName,
			 "products": ((a.products.map((b, j) => { return '<div><p>Product Name: ' + b.productName + '</p><p>Product Code: ' + b.productDetail.productCode + '-' + b.productDetail.itemCode + '</p><p>Sell Quantity: ' + b.quantity + '</p><p>Price: <span class="ororiginalPrice">' + (b.discountPercent > 0 ? b.originalPrice : '') + '</span>  <span>' + b.discountedPrice + '</span>  <span class="orPercent">' + (b.discountPercent > 0 ? b.discountPercent + '%' : '') + '</span>  </p>' + '</div><br/>' })).toString()).replace(/,/g, " "),
			 "cartQuantity": a.cartQuantity,
			 "status": a.status
		  }
		})
		res.status(200).json(tableData);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.list_order_by_ba = (req, res, next) => {

  Orders.find({ businessAssociate: req.params.ba_ID }).sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.list_order_with_limits = (req, res, next) => {
  Orders.find({})
	 .sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		// console.log("data in order ==>", data);
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.count_order = (req, res, next) => {
  Orders.find({})
	 .exec()
	 .then(data => {
		res.status(200).json({ "dataCount": data.length });
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.fetch_order = (req, res, next) => {
  	Orders.findOne({ _id: req.params.orderID })
	.populate('vendorOrders.vendor_id')
	.exec()
	.then(async(data) => {
		// console.log('data', data);
		// for(var i=0;i<data.length;i++){
			// for(var j=0;j<data[i].vendorOrders.length;j++){
				// console.log("data[i].vendorOrders",data[i].vendorOrders);
				var maxDurationForCancelOrderData = await OrderCancellationPolicy.findOne({},{maxDurationForCancelOrder : 1})
				if(maxDurationForCancelOrderData !== null && maxDurationForCancelOrderData.maxDurationForCancelOrder > 0){
					var maxDurationForCancelOrder = maxDurationForCancelOrderData.maxDurationForCancelOrder;
				}else{
					var maxDurationForCancelOrder = 0;
				}

				if(data !== null){
					for(var j=0;j<data.vendorOrders.length;j++){
						var vendor = await Entitymaster.findOne({_id:data.vendorOrders[j].vendor_id},{companyName:1,_id:0})
						data.vendorOrders[j].vendorName = vendor.companyName;
						// console.log("data.vendorOrders[j] => ",data.vendorOrders[j].products)
						for (var k = 0; k < data.vendorOrders[j].products.length; k++) {
							var review = await CustomerReview.findOne({"customer_id" : ObjectId(data.user_ID), "product_id" : ObjectId(data.vendorOrders[j].products[k].product_ID), "order_id" : ObjectId(data._id) })				
							if(review && review !== null){
								data.vendorOrders[j].products[k].isReview	= true;	
							}
						}
					}
					if(j>=data.vendorOrders.length){
						var returnData = data;
						returnData.maxDurationForCancelOrder = maxDurationForCancelOrder;
						// var creditPointsData = await CreditPoints.findOne({
						// 								user_id 		: ObjectId(returnData.user_ID), 
						// 								transactions: { 
						// 									$elemMatch: { 
						// 										typeOfTransaction : 'Original Order', 
						// 										order_id : ObjectId(req.params.orderID) 
						// 									} 
						// 								}
						// 							},
						// 							{'transactions.$' : 1});
						
						var creditPointsData = await CreditPoints.aggregate([
																		{$match : {user_id : ObjectId(returnData.user_ID) },},
																		{$unwind : "$transactions"},
																		{$match : {"transactions.order_id" : ObjectId(req.params.orderID)},},
																		{$group : {_id : "$transactions.order_id", totalCreditPoints : {$sum : "$transactions.earnedPoints"}}}
																]);


						if(creditPointsData && creditPointsData.length > 0 && creditPointsData[0].totalCreditPoints ){
							var creditPolicyData = await CreditPointsPolicy.findOne();
		
							returnData.paymentDetails.creditPointsEarned 		= creditPointsData[0].totalCreditPoints.toFixed(2);
							returnData.paymentDetails.creditPointsValueEarned 	= (creditPointsData[0].totalCreditPoints * creditPolicyData.creditPointValue).toFixed(2);
							
							res.status(200).json(returnData);
						}else{
							returnData.paymentDetails.creditPointsEarned 		= 0;
							returnData.paymentDetails.creditPointsValueEarned 	= 0;
							
							res.status(200).json(returnData);
						}
						// console.log("data => ",data)
						
					}
				}else{
					res.status(200).json(data);
				}
		// 	}
		// }
		// if(i>=data.length){
			
		// }
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error : err
		});
	});
};

exports.fetch_one_order = (req, res, next) => {

	// console.log("orderID in")
	Orders.findOne({ _id: req.params.orderID })
  	.then(async(data) => {
	  	// console.log('data', data);
		res.status(200).json(data);
  	})
  	.catch(err => {
	  	console.log(err);
	  	res.status(500).json({
		  	error : err
	  	});
  	});
};

exports.delete_order = (req, res, next) => {
  Orders.deleteOne({ _id: ObjectId(req.params.orderID) })
	 .exec()
	 .then(data => {
		res.status(200).json({
		  "message": "Order Deleted Successfully."
		});
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.updateDeliveryStatus = (req, res, next) => {
  var status = req.body.status == "Delivered & Paid" ? "Paid" : "UnPaid";
  // console.log(req.body.status);

  Orders.updateOne(
	 { _id: req.body.orderID },
	 {
		$push: {
		  deliveryStatus: [
			 {
				status: req.body.status,
				Date: new Date(),
				userid: req.body.userid
			 }
		  ]
		},
		status: status
	 }
  )
	 .exec()
	 .then(data => {
		// console.log(data);
		if (data.nModified == 1) {
		  if (status == 'Paid') {


			 Orders.findOne({ _id: req.body.orderID })
				.exec()
				.then(orderData => {
				  User.findOne({ _id: orderData.user_ID })
					 .exec()
					 .then(customerData => {
						var header = "<table><tbody><tr><td align='center' width='100%'><a><img src='http://qagangaexpress.iassureit.com/images/GangaExpress.png' style='width:25%'></a></td></tr></table>";
						var body = "";
						var footer = "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
						footer += "<span style='color:#fff'>GangaExpress Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
						footer += "<span style='float:right;color:#fff'>gangaexpress@gmail.com</span></td></tr></tbody></table>"

						var mailSubject, mailText, smsText;

						if (customerData) {
						  Masternotifications.findOne({ "templateType": "Email", "templateName": "Order Delivered" })
							 .exec()
							 .then((maildata) => {
								if (maildata) {
								  mailSubject = maildata.subject != '' ? maildata.subject : "Your order is delivered successfully.";
								  var variables = {
									 "username": customerData.profile.fullName
								  }

								  var content = maildata.content;
								  if (content.indexOf('[') > -1) {
									 var wordsplit = content.split('[');
								  }

								  var tokens = [];
								  var n = 0;
								  for (i = 0; i < wordsplit.length; i++) {
									 if (wordsplit[i].indexOf(']') > -1) {
										tokensArr = wordsplit[i].split(']');
										tokens[n] = tokensArr[0];
										n++;
									 }
								  }
								  var numOfVar = Object.keys(variables).length;

								  for (i = 0; i < numOfVar; i++) {
									 var tokVar = tokens[i].substr(1, tokens[i].length - 2);
									 content = content.replace(tokens[i], variables[tokens[i]]);
								  }
								  content = content.split("[").join(" ");
								  content = content.split("]").join(" ");

								  body += "<table><tr><td>" + content + "</td></tr></table>";
								  body += "<tr><b><p>Your order is delivered to:</p></b>";

								  body += "<p style='margin:0'>" + orderData.deliveryAddress.name + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine1 + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine2 + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.city + " " + orderData.deliveryAddress.state + " " + orderData.deliveryAddress.pincode + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.country + "</p></tr>";
								  body += "</tbody></table>";

								  body += "<h3>Order Details</h3>";
								  body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

								  orderData.products.map((productdata, index) => {

									 body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.total + "</td></tr>";
								  })

								  body += "</tbody></table><br>";

								} else {
								  mailSubject = "Your order is delivered successfully.";
								  body += "<table><tr><td><h3>Dear " + customerData.profile.fullName + ", </h3>\n";
								  body += "<p>Thank you for your order. Your order is delivered successfully.</p></tr>";

								  body += "<tr><b><p>Your order is delivered to:</p></b>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.name + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine1 + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine2 + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.city + " " + orderData.deliveryAddress.state + " " + orderData.deliveryAddress.pincode + "</p>";
								  body += "<p style='margin:0'>" + orderData.deliveryAddress.country + "</p></tr>";
								  body += "</tbody></table>";

								  body += "<h3>Order Details</h3>";
								  body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

								  orderData.products.map((productdata, index) => {

									 body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.total + "</td></tr>";
								  })


								  body += "</tbody></table><br>";

								}
								//body += footer;
								request({
								  "method": "POST",
								  "url": "http://localhost:" + globalVariable.PORT + "/send-email",
								  "body": {
									 "email": customerData.profile.emailId,
									 "subject": mailSubject,
									 "text": mailSubject,
									 "mail": body
									 //"mail"      : 'Hello '+customerData.profile.fullName+','+'\n'+"\n <br><br>"+DeliveryMailText+"<b></b>"+'\n'+'\n'+'<br><br>\nRegards,<br>Team GangaExpress',
								  },
								  "json": true,
								  "headers": {
									 "User-Agent": "Test App"
								  }
								})
								  .then((sentemail) => {
									 res.header("Access-Control-Allow-Origin", "*");
									 res.status(200).json({ message: "Mail Sent successfully" });
								  })
								  .catch((err) => {
									 res.status(500).json({
										error: err
									 });
								  });

								/*const client4 = new plivo.Client('MAMZU2MWNHNGYWY2I2MZ', 'MWM1MDc4NzVkYzA0ZmE0NzRjMzU2ZTRkNTRjOTcz');
								const sourceMobile4 = "+919923393733";
								var text4 = DeliverySmsText;
							  
								client4.messages.create(
								 src=sourceMobile4,
								 dst= '+91'+customerData.profile.mobileNumber,
								 text=text4
								).then((result)=> {
									 // console.log("src = ",src," | DST = ", dst, " | result = ", result);
									 res.status(200).json({
										  message:"Order dilivered Successfully"
									 });
								})
								.catch(otpError=>{
									 return res.status(501).json({
											message: "Some Issue Occured While Delivering Your Order",
											error: otpError
									 });
								});*/

							 })
							 .catch()

						}

					 })
					 .catch(err => {
						res.status(500).json({
						  error: err
						});
					 });

				})
				.catch(err => {
				  res.status(500).json({
					 error: err
				  });
				});

		  }

		  res.status(200).json({
			 "message": "Order Status is updated Successfully."
		  });
		} else {
		  res.status(401).json({
			 "message": "Order Not Found"
		  });
		}
	 })
	 .catch(err => {
		// console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.changeToPreviousStatus = (req, res, next) => {
  Orders.updateOne(
	 { _id: ObjectId(req.body.orderID) },
	 { $pop: { deliveryStatus: 1 } }
  )
	 .exec()
	 .then(data => {
		res.status(200).json({
		  "message": "Order Status is updated Successfully."
		});
	 })
	 .catch(err => {
		res.status(500).json({ error: err });
	 });
};

exports.dispatchOrder = (req, res, next) => {

  /*Masternotifications.findOne({"templateType":"SMS","templateName":"Order Dispatched"})
						  .exec()
						  .then((smsdata)=>{ 
								var textcontent = smsdata.content;                              
								var regex = new RegExp(/(<([^>]+)>)/ig);
								var textcontent = smsdata.content.replace(regex, '');
								textcontent   = textcontent.replace(/\&nbsp;/g, '');                                                
								dispatchSmsText = textcontent
						  })
						  .catch()*/
  // console.log(req.body.orderID);
  // console.log('businessAssociateId',req.body.businessAssociateId);
  Orders.updateOne(
	 { _id: req.body.orderID },
	 {
		$push: {
		  deliveryStatus: [
			 {
				status: "Dispatch",
				Date: new Date(),
				userid: req.body.userid
			 }
		  ]
		},
		businessAssociate: req.body.businessAssociateId
	 }
  )
	 .exec()
	 .then(data => {

		BusinessAssociate.findOne({ userID: req.body.businessAssociateId })
		  .exec()
		  .then(ba => {
			 if (ba) {
				request({
				  "method": "POST",
				  "url": "http://localhost:" + globalVariable.PORT + "/send-email",
				  "body": {
					 "email": ba.emailID,
					 "subject": "You have a order to be delivered.",
					 "text": "You have a order to be delivered.",
					 "mail": 'Hello ' + ba.companyName + ',' + '\n' + "\n <br><br>You have a order to be delivered.<b></b>" + '\n' + '\n' + ' </b><br><br>\nRegards,<br>Team GangaExpress',
				  },
				  "json": true,
				  "headers": {
					 "User-Agent": "Test App"
				  }
				})
				  .then((sentemail) => {
					 res.header("Access-Control-Allow-Origin", "*");
					 res.status(200).json({ message: "Mail Sent successfully" });
				  })
				  .catch((err) => {
					 res.status(500).json({
						error: err
					 });
				  });

				/*const client3 = new plivo.Client('MAMZU2MWNHNGYWY2I2MZ', 'MWM1MDc4NzVkYzA0ZmE0NzRjMzU2ZTRkNTRjOTcz');
				const sourceMobile3 = "+919923393733";
				var text3 = "Dear ba, "+'\n'+"You have a order to be delivered.\n";
			  
				client3.messages.create(
				 src=sourceMobile3,
				 dst= '+91'+ba.mobileNo,
				 text=text3
				).then((result)=> {
					 // console.log("src = ",src," | DST = ", dst, " | result = ", result);
					 res.status(200).json({
						  message:"Order dispached Successfully"
					 });
				})
				.catch(otpError=>{
					 // console.log("otpError",otpError);
					 return res.status(501).json({
							message: "Some Issue Occured While Placing Your Order",
							error: otpError
					 });
				});*/
			 }


		  })
		  .catch(err => {
			 console.log(err);
			 res.status(500).json({
				error: err
			 });
		  });
		if (data.nModified == 1) {

		  // send notification to customer
		  Orders.findOne({ _id: req.body.orderID })
			 .exec()
			 .then(orderData => {
				User.findOne({ _id: orderData.user_ID })
				  .exec()
				  .then(customerData => {

					 var header = "<table><tbody><tr><td align='center' width='100%'><a><img src='http://qagangaexpress.iassureit.com/images/GangaExpress.png' style='width:25%'></a></td></tr></table>";
					 var body = "";
					 var footer = "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
					 footer += "<span style='color:#fff'>GangaExpress Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
					 footer += "<span style='float:right;color:#fff'>gangaexpress@gmail.com</span></td></tr></tbody></table>"

					 var mailSubject, mailText, smsText;

					 if (customerData) {
						var mailSubject, dispatchSmsText;
						Masternotifications.findOne({ "templateType": "Email", "templateName": "Order Dispatched" })
						  .exec()
						  .then((maildata) => {

							 if (maildata) {
								mailSubject = maildata.subject != '' ? maildata.subject : "Your order is dispatched successfully.";
								var variables = {
								  "username": customerData.profile.fullName
								}

								var content = maildata.content;
								if (content.indexOf('[') > -1) {
								  var wordsplit = content.split('[');
								}

								var tokens = [];
								var n = 0;
								for (i = 0; i < wordsplit.length; i++) {
								  if (wordsplit[i].indexOf(']') > -1) {
									 tokensArr = wordsplit[i].split(']');
									 tokens[n] = tokensArr[0];
									 n++;
								  }
								}
								var numOfVar = Object.keys(variables).length;

								for (i = 0; i < numOfVar; i++) {
								  var tokVar = tokens[i].substr(1, tokens[i].length - 2);
								  content = content.replace(tokens[i], variables[tokens[i]]);
								}
								content = content.split("[").join(" ");
								content = content.split("]").join(" ");

								body += "<table><tr><td>" + content + "</td></tr></table>";
								body += "<tr><b><p>Your order will be sent to:</p></b>";

								body += "<p style='margin:0'>" + orderData.deliveryAddress.name + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine1 + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine2 + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.city + " " + orderData.deliveryAddress.state + " " + orderData.deliveryAddress.pincode + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.country + "</p></tr>";
								body += "</tbody></table>";

								body += "<h3>Order Details</h3>";
								body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

								orderData.products.map((productdata, index) => {

								  body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.total + "</td></tr>";
								})

								body += "</tbody></table><br>";

							 } else {
								mailSubject = "Your order is dispatched successfully.";
								body += "<table><tr><td><h3>Dear " + customerData.profile.fullName + ", </h3>\n";
								body += "<p>Thank you for your order. Your order will be delivered soon.</p></tr>";

								body += "<tr><b><p>Your order will be sent to:</p></b>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.name + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine1 + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.addressLine2 + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.city + " " + orderData.deliveryAddress.state + " " + orderData.deliveryAddress.pincode + "</p>";
								body += "<p style='margin:0'>" + orderData.deliveryAddress.country + "</p></tr>";
								body += "</tbody></table>";

								body += "<h3>Order Details</h3>";
								body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

								orderData.products.map((productdata, index) => {

								  body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.total + "</td></tr>";
								})


								body += "</tbody></table><br>";

							 }
							 //body += footer;
							 request({
								"method": "POST",
								"url": "http://localhost:" + globalVariable.PORT + "/send-email",
								"body": {
								  "email": customerData.profile.emailId,
								  "subject": mailSubject,
								  "text": mailSubject,
								  "mail": body
								  //"mail"      : 'Hello '+customerData.profile.fullName+','+'\n'+"\n <br><br>"+dispatchMailText+"<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team GangaExpress',
								},
								"json": true,
								"headers": {
								  "User-Agent": "Test App"
								}
							 })
								.then((sentemail) => {
								  res.header("Access-Control-Allow-Origin", "*");
								  res.status(200).json({ message: "Mail Sent successfully" });
								})
								.catch((err) => {
								  res.status(500).json({
									 error: err
								  });
								});

						  })
						  .catch()



						/*const client4 = new plivo.Client('MAMZU2MWNHNGYWY2I2MZ', 'MWM1MDc4NzVkYzA0ZmE0NzRjMzU2ZTRkNTRjOTcz');
						const sourceMobile4 = "+919923393733";
						var text4 = dispatchSmsText;
						client4.messages.create(
						 src=sourceMobile4,
						 dst= '+91'+customerData.profile.mobileNumber,
						 text=text4
						).then((result)=> {
							 // console.log("src = ",src," | DST = ", dst, " | result = ", result);
							 res.status(200).json({
								  message:"Order dispached Successfully"
							 });
						})
						.catch(otpError=>{
							 return res.status(501).json({
									message: "Some Issue Occured While Placing Your Order",
									error: otpError
							 });
						}); */
					 }

				  })
				  .catch(err => {
					 res.status(500).json({
						error: err
					 });
				  });

			 })
			 .catch(err => {
				res.status(500).json({
				  error: err
				});
			 });
		  res.status(200).json({
			 "message": "Order is dispatched successfully."
		  });
		} else {
		  res.status(401).json({
			 "message": "Order Not Found"
		  });
		}



	 })
	 .catch(err => {
		// console.log('err2');
		res.status(500).json({
		  error: err
		});
	 });
};
exports.list_order_by_user = (req, res, next) => {
  //  console.log('user_ID',req.params.userID);

  /*Orders.find({
		"user_ID": ObjectId(req.params.userID)
	 })*/
	Orders.aggregate([
		{$lookup:
			{
				from 			: 'returnedproducts',
				localField 		: '_id',
				foreignField 	: 'orderID',
				as 				: 'returnProducts'
			}
		},
		{$sort: 
			{
				"createdAt": -1
			}
		},
		{
			$match: { "user_ID": ObjectId(req.params.userID) }
		}
	])
	 .exec()
	 .then(async(data) => {
		// console.log('data', data);
		var maxDurationForCancelOrderData = await OrderCancellationPolicy.findOne({},{maxDurationForCancelOrder : 1})
		
		if(maxDurationForCancelOrderData !== null && maxDurationForCancelOrderData.maxDurationForCancelOrder > 0){
			var maxDurationForCancelOrder = maxDurationForCancelOrderData.maxDurationForCancelOrder;
		}else{
			var maxDurationForCancelOrder = 0;
		}

		for(var i=0;i<data.length;i++){
			// var creditPointsData = await CreditPoints.findOne({user_id : ObjectId(req.params.userID), 'transactions.order_id' : ObjectId(data[i]._id), "transactions.typeOfTransaction" : "Original Order"},{'transactions.$' : 1});
			// var creditPointsData = await CreditPoints.findOne(
			// 									{user_id : ObjectId(req.params.userID)},
			// 									{transactions: {$elemMatch: 
			// 															{order_id : ObjectId(data[i]._id), typeOfTransaction : "Original Order"}
			// 														}
			// 									});


			var creditPointsData = await CreditPoints.aggregate([
															{$match : {user_id : ObjectId(req.params.userID) },},
															{$unwind : "$transactions"},
															{$match : {"transactions.order_id" : ObjectId(data[i]._id)},},
															{$group : {_id : "$transactions.order_id", totalCreditPoints : {$sum : "$transactions.earnedPoints"}}}
													]);



			// console.log("creditPointsData => ",creditPointsData)
			
			for(var j=0;j<data[i].vendorOrders.length;j++){
				var vendor = await Entitymaster.findOne({_id:data[i].vendorOrders[j].vendor_id},{companyName:1,_id:0})
				if(vendor && vendor.companyName){
					data[i].vendorOrders[j].vendorName = vendor.companyName;
				}
			}
			if(j >= data[i].vendorOrders.length){
				data[i].maxDurationForCancelOrder = maxDurationForCancelOrder;
				if(creditPointsData && creditPointsData.length > 0 && creditPointsData[0].totalCreditPoints ){
					var creditPolicyData = await CreditPointsPolicy.findOne();

					data[i].paymentDetails.creditPointsEarned 		= creditPointsData[0].totalCreditPoints.toFixed(2);
					data[i].paymentDetails.creditPointsValueEarned 	= (creditPointsData[0].totalCreditPoints * creditPolicyData.creditPointValue).toFixed(2);
				}else{
					data[i].paymentDetails.creditPointsEarned 		= 0;
					data[i].paymentDetails.creditPointsValueEarned 	= 0;
				}
			}
		}
		if(i>=data.length){			
			res.status(200).json(data);
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
		  	error: err
		});
	});
};

exports.cancelOrder = (req, res, next) => {
//   console.log("Order cancelled");
  Orders.updateOne(
	 { _id: req.body.orderID },
	 {
		$push: {
		  deliveryStatus: [
			 {
				status: 'Cancelled',
				Date: new Date(),
				userid: req.body.userid
			 }
		  ]
		}
	 }
  )
	 .exec()
	 .then(data => {
		// console.log(data);
		if (data.nModified == 1) {
		  res.status(200).json({
			 "message": "Order is cancelled Successfully.",
			 "orderId": req.body.orderID, 
		  });
		} else {
		  res.status(401).json({
			 "message": "Order Not Found"
		  });
		}
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
}

exports.get_reports_count = (req, res, next) => {

  Orders.find({
	 createdAt: {
		$gte: moment(req.body.startDate).startOf('day').toDate(),
		$lte: moment(req.body.endDate).endOf('day').toDate()
	 }
  }).sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		res.status(200).json({ "dataCount": data.length });
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.get_reports_franchise = (req, res, next) => {
  // console.log("req.body.franchiseID==>",req.body.franchiseID)
  Orders.find({
	 allocatedToFranchise: ObjectId(req.params.franchiseID),
	 createdAt: {
		$gte: moment(req.body.startDate).tz('Asia/Kolkata').startOf('day').toDate(),
		$lte: moment(req.body.endDate).tz('Asia/Kolkata').endOf('day').toDate()
	 }
  })
	 .populate("allocatedToFranchise")
	 .sort({ createdAt: -1 })
	 .exec()
	 .then(data => {

		// var allData = data.map((x, i)=>{
		//   //console.log(x)
		//   return {
		//       "_id"                   : x._id,
		//       "orderID"               : (x.orderID).toString(),
		//       "cratedAt"              : moment(x.createdAt).format("DD/MM/YYYY hh:mm a"),
		//       "userFullName"          : x.userFullName,
		//       "totalAmount"           : (x.total).toString(),
		//       "deliveryStatus"        : x.deliveryStatus[x.deliveryStatus.length-1].status
		//   }
		// })
		// res.status(200).json(allData.slice(req.params.startRange, req.params.limitRange));
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.get_reports = (req, res, next) => {
//   console.log("get reports data", req.body.startDate, req.body.endDate);
  Orders.find({
	 createdAt: {
		$gte: moment(req.body.startDate).tz('Asia/Kolkata').startOf('day').toDate(),
		$lte: moment(req.body.endDate).tz('Asia/Kolkata').endOf('day').toDate()
	 }
  })
	 .populate("allocatedToFranchise")
	 .sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		// var allData = data.map((x, i)=>{
		//   // return {
		//   //     "_id"                   : x._id,
		//   //     "orderID"               : (x.orderID).toString(),
		//   //     "cratedAt"              : moment(x.createdAt).format("DD/MM/YYYY hh:mm a"),
		//   //     "userFullName"          : x.userFullName,
		//   //     "totalAmount"           : (x.total).toString(),
		//   //     "status"        : x.deliveryStatus[x.deliveryStatus.length-1].status
		//   // }
		// })
		// console.log("get reports data",data);
		// res.status(200).json(allData.slice(req.params.startRange, req.params.limitRange));
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.get_category_reports_count = (req, res, next) => {
  var selector = {};
  if (req.body.section && req.body.category && req.body.subcategory) {
	 selector = {
		createdAt: { $gte: moment(req.body.startTime).startOf('day').toDate() },
		createdAt: { $lte: moment(req.body.endTime).endOf('day').toDate() },
		"products.section_ID": req.body.section,
		"products.category_ID": req.body.category,
		"products.subCategory_ID": req.body.subcategory
	 }
  }
  else if (req.body.section && req.body.category) {
	 selector = {
		createdAt: { $gte: moment(req.body.startTime).startOf('day').toDate() },
		createdAt: { $lte: moment(req.body.endTime).endOf('day').toDate() },
		"products.section_ID": req.body.section,
		"products.category_ID": req.body.category,
	 }
  }
  else if (req.body.category) {
	 selector = {
		createdAt: { $gte: moment(req.body.startTime).startOf('day').toDate() },
		createdAt: { $lte: moment(req.body.endTime).endOf('day').toDate() },
		"products.category_ID": req.body.category
	 }
  }
  else {
	 selector = {
		createdAt: {
		  $gte: moment(req.body.startTime).startOf('day').toDate(),
		  $lte: moment(req.body.endTime).endOf('day').toDate()
		}
	 }
  }

  Orders.find(selector).sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		res.status(200).json({ "dataCount": data.length });
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.get_category_reports = (req, res, next) => {
  var selector = {};
  if (req.body.section && req.body.category && req.body.subcategory) {
	 selector = {
		createdAt: { $gte: moment(req.body.startTime).startOf('day').toDate() },
		createdAt: { $lte: moment(req.body.endTime).endOf('day').toDate() },
		"products.section_ID": req.body.section,
		"products.category_ID": req.body.category,
		"products.subCategory_ID": req.body.subcategory
	 }
  }
  else if (req.body.section && req.body.category) {
	 selector = {
		createdAt: { $gte: moment(req.body.startTime).startOf('day').toDate() },
		createdAt: { $lte: moment(req.body.endTime).endOf('day').toDate() },
		"products.section_ID": req.body.section,
		"products.category_ID": req.body.category,
	 }
  }
  else if (req.body.category) {
	 selector = {
		createdAt: { $gte: moment(req.body.startTime).startOf('day').toDate() },
		createdAt: { $lte: moment(req.body.endTime).endOf('day').toDate() },
		"products.category_ID": req.body.category
	 }
  }
  else {
	 selector = {
		createdAt: {
		  $gte: moment(req.body.startTime).startOf('day').toDate(),
		  $lte: moment(req.body.endTime).endOf('day').toDate()
		}
	 }
  }
  //console.log(selector)
  Orders.find(selector).sort({ createdAt: -1 })
	 .exec()
	 .then(data => {
		var allData = data.map((x, i) => {
		  return {
			 "_id": x._id,
			 "orderID": (x.orderID).toString(),
			 "cratedAt": moment(x.createdAt).format("DD/MM/YYYY hh:mm a"),
			 "userFullName": x.userFullName,
			 "totalAmount": (x.total).toString(),
			 "deliveryStatus": x.deliveryStatus[x.deliveryStatus.length - 1].status
		  }
		})
		res.status(200).json(allData.slice(req.params.startRange, req.params.limitRange));
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.ytdorders = (req, res, next) => {
  //console.log('year',moment().tz('Asia/Kolkata').startOf('year'));
  //console.log('day',moment().tz('Asia/Kolkata').endOf('day'));

  Orders.find({
	 createdAt: {
		$gte: moment().tz('Asia/Kolkata').startOf('year'),
		$lte: moment().tz('Asia/Kolkata').endOf('day')
	 }
  }).count()
	 .exec()
	 .then(data => {
		res.status(200).json({ "dataCount": data });
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.mtdorders = (req, res, next) => {

  Orders.find({
	 createdAt: {
		$gte: moment().tz('Asia/Kolkata').startOf('month'),
		$lte: moment().tz('Asia/Kolkata').endOf('day')
	 }
  }).count()
	 .exec()
	 .then(data => {
		res.status(200).json({ "dataCount": data });
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.todaysorders = (req, res, next) => {
  Orders.aggregate([
	 {
		"$match": { "createdAt": { $gte: moment().tz('Asia/Kolkata').startOf('day') } }
	 },
	 { $count: "count" }
  ])
	 .exec()
	 .then(data => {
		if (data.length == 0) {
		  res.status(200).json({ "dataCount": 0 });
		} else {
		  res.status(200).json({ "dataCount": data[0].count });
		}
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.neworderscount = (req, res, next) => {
  Orders.aggregate([
	 {
		"$match": { "deliveryStatus.status": "New" }
	 },
	 {
		"$redact":
		{
		  "$cond": {
			 "if": { "$eq": [{ "$arrayElemAt": ["$deliveryStatus.status", -1] }, "New"] },
			 "then": "$$KEEP",
			 "else": "$$PRUNE"
		  }
		}
	 },
	 {
		$count: "count"
	 }
  ])
	 .exec()
	 .then(data => {
		if (data.length == 0) {
		  res.status(200).json({ "dataCount": 0 });
		} else {
		  res.status(200).json({ "dataCount": data[0].count });
		}


	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};


exports.totalOrdersByPeriod = (req, res, next) => {
//   console.log('sdash', moment(req.params.startTime).tz('Asia/Kolkata').startOf('day').toDate())
  Orders.aggregate([
	 {
		$match: {
		  createdAt: {
			 $gte: moment(req.params.startTime).tz('Asia/Kolkata').startOf('day').toDate()
			 //$lte:  moment().tz('Asia/Kolkata').endOf('day')
		  }
		}
	 },
	 {
		$unwind: "$products"
	 },
	 {
		$group: {
		  "_id": "$products.category",
		  "count": { $sum: 1 }
		}
	 }
  ])
	 .exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.totalOrdersByState = (req, res, next) => {
  //console.log('sdash',moment(req.params.startTime).tz('Asia/Kolkata').startOf('day').toDate())
  Orders.aggregate([
	 {
		$unwind: "$products"
	 },
	 {
		$group: {
		  "_id": "$deliveryAddress.state",
		  "count": { $sum: 1 }
		}
	 },
	 { $sort: { "count": -1 } },
	 { $limit: 10 }
  ])
	 .exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.sectionRevenue = (req, res, next) => {
  Orders.aggregate([
	 {
		$unwind: "$products"
	 },
	 {
		$group: {
		  "_id": "$products.section",
		  "revenue": { "$sum": { $multiply: ["$products.quantity", "$products.discountedPrice"] } }
		}
	 },
	 { $limit: 5 }
  ]).exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};


exports.sectionRevenueVendorOrders = (req, res, next) => {
  Orders.aggregate([  
		{$unwind: "$vendorOrders"}, 
		{$unwind: "$vendorOrders.products"},
		{$group: {
						"_id": "$vendorOrders.products.section",
						"revenue" : {"$sum" : {$round:[{$multiply: ["$vendorOrders.products.discountedPrice", "$vendorOrders.products.discountedPrice"]},0]} } 
					}
		},
		{$sort : {"revenue" : -1} }
	])
  .exec()
	 .then(data => {
	 	if(data.length > 0){
	 		data.map( (value,index)=>{
	 			return value.revenue.toFixed(0);
	 		})
	 		// console.log("data = ",data);
			res.status(200).json(data);
	 	}else{
			res.status(200).json({});
	 	}
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};



exports.categoryRevenue = (req, res, next) => {
  Orders.aggregate([
	 {
		$unwind: "$products"
	 },
	 {
		$group: {
		  "_id": "$products.category",
		  "revenue": { "$sum": { $multiply: ["$products.quantity", "$products.discountedPrice"] } }
		}
	 },
	 { $limit: 5 }
  ]).exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.subCategoryRevenue = (req, res, next) => {
  Orders.aggregate([
	 {
		$unwind: "$products"
	 },
	 {
		$group: {
		  "_id": "$products.subCategory",
		  "revenue": { "$sum": { $multiply: ["$products.quantity", "$products.discountedPrice"] } }
		}
	 },
	 { $limit: 5 }
  ]).exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.vendorWiseOrder = (req, res, next) => {
  Orders.aggregate([
	 { "$unwind": "$products" },
	 {
		"$lookup": {
		  "from": "products",
		  "as": "products.productDetail",
		  "localField": "products.product_ID",
		  "foreignField": "_id"
		}
	 },
	 { "$unwind": "$products.productDetail" },
	 {
		"$group": {
		  "_id": "$_id",

		  "products": { "$push": "$products" },
		}
	 },
	 {
		"$project": {
		  "_id": 1,
		  "products.product_ID": 1,
		  "products.productName": 1,
		  "products.discountPercent": 1,
		  "products.discountedPrice": 1,
		  "products.originalPrice": 1,
		  "products.currency": 1,
		  "products.quantity": 1,
		  "products.subTotal": 1,
		  "products.saving": 1,
		  "products.productDetail.vendor_ID": 1,
		}
	 }
  ]).exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

function addOrderToFranchiseGoods(productId, obj, franchise_id) {
  return new Promise(function (resolve, reject) {
	 FranchiseGoods.find({ productId: productId, balance: { $gt: 0 }, franchise_id: franchise_id })
		.sort({ createdAt: 1 })
		.limit(1)
		.then(fgdata => {
		  //console.log("fgdata",fgdata);
		  if (fgdata[0].unit.toLowerCase() == obj.Unit.toLowerCase()) {
			 var remainingBalance = fgdata[0].balance - obj.orderQty;
		  } else {
			 //if units are different
			 if ((fgdata[0].unit.toLowerCase() == 'kg' || fgdata[0].unit.toLowerCase() == 'kilogram') && (obj.Unit.toLowerCase() == "gm" || obj.Unit.toLowerCase() == "gram")) {
				//convert raw material gram to kg formula kg=gm/1000
				var convertToKg = obj.orderQty / 1000;
				obj.orderQty = convertToKg;
				obj.Unit = fgdata[0].unit
				var remainingBalance = fgdata[0].balance - convertToKg;
			 }
			 if ((fgdata[0].unit.toLowerCase() == 'gm' || fgdata[0].unit.toLowerCase() == 'gram') && (obj.Unit.toLowerCase() == "kg" || obj.Unit.toLowerCase() == "kilogram")) {
				//convert raw material kg to gram formula g=kg*1000
				var convertToGram = obj.orderQty * 1000;
				obj.orderQty = convertToGram;
				obj.Unit = fgdata[0].unit
				var remainingBalance = fgdata[0].balance - convertToGram;
			 }
			 if (fgdata[0].unit.toLowerCase() == "kg" && obj.Unit.toLowerCase() == "kilogram") {
				var remainingBalance = fgdata[0].balance - obj.orderQty;
			 }

			 if (fgdata[0].Unit.toLowerCase() == "gm" && obj.Unit.toLowerCase() == "gram") {
				var remainingBalance = fgdata[0].balance - obj.orderQty;
			 }

			 if (fgdata[0].unit.toLowerCase() !== "kg" || obj.Unit.toLowerCase() !== "gram") {
				var remainingBalance = fgdata[0].balance - obj.orderQty;
			 }
		  }

		  // compare and update raw material stock
		  if (fgdata[0].balance >= obj.orderQty) {
			 // var remainingBalance = fgdata[0].balance - obj.Quantity;
			 obj.finishedGoods = obj;
			 obj.balance = remainingBalance;

			 orders = { "orderNum": obj.orderNum, "orderDate": obj.orderDate, "ProductId": productId, "orderQty": obj.orderQty, "Unit": obj.Unit };
			 FranchiseGoods.update(
				{ _id: fgdata[0]._id },
				{
				  $set: { 'balance': remainingBalance },
				  $push: { 'orders': orders }
				})
				.then(data => {
				  if (data.nModified == 1) {
					 resolve(data);
				  } else {
					 resolve(data);
				  }
				})
				.catch(err => { reject(err); });
		  } else {
			 var remainFcQty = obj.orderQty - fgdata[0].balance;
			 var remainingBalance = 0;
			 orders = { "orderNum": obj.orderNum, "orderDate": obj.orderDate, "ProductId": productId, "orderQty": fgdata[0].balance, "Unit": obj.Unit };
			 FranchiseGoods.updateOne(
				{ _id: fgdata[0]._id },
				{
				  $set: { 'balance': remainingBalance },
				  $push: { 'orders': orders }
				})
				.then(data => {
				  PoUpObj = { "orderNum": obj.orderNum, "orderDate": obj.orderDate, "ProductId": productId, "orderQty": remainFcQty, "Unit": obj.Unit };
				  if (data.nModified == 1) {
					 if (remainFcQty != 0) {
						var updateOtherPoObj = updateOtherFranchiseGoods(itemCode, PoUpObj);
						if (updateOtherPoObj) {

						} else {
						  console.log("err");
						}
					 }
					 resolve(data);
				  } else {
					 resolve(data);
				  }
				})
				.catch(err => { reject(err); });
			 resolve(0);
		  }


		})
		.catch(err => {
		  reject(err);
		});
  });
}
var updateOtherFranchiseGoods = async (itemCode, obj) => {
  // console.log('Data',data);
  return new Promise(function (resolve, reject) {
	 updateOtherfgControl();
	 async function updateOtherfgControl() {
		addOrderToFranchiseGoods(itemCode, obj)
	 }
  })
}
exports.list_bill_by_user = (req, res, next) => {
  //console.log('user_ID',req.body.userid);
  Orders.find(
	 {
		"user_ID": ObjectId(req.body.userid), orderID: { $ne: null }
	 })
	 .exec()
	 .then(data => {
		//console.log('data', data);
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.get_orders_with_filters = (req, res, next) => {
	// console.log("req.body => ",req.body)
  let selector = {};
  let status = req.body.status ? req.body.status : '';
  let franchiseID = req.body.franchiseID ? req.body.franchiseID : '';
  let startDate = req.body.startDate ? moment(req.body.startDate).tz('Asia/Kolkata').startOf('day').toDate() : '';
  let endDate = req.body.endDate ? moment(req.body.endDate).tz('Asia/Kolkata').endOf('day').toDate() : '';

  if (status !== "" && franchiseID !== "" && startDate !== "" && endDate !== "") {
	 selector = {
		"deliveryStatus.status": req.body.status,
		allocatedToFranchise: ObjectId(req.body.franchiseID),
		createdAt: {
		  $gte: moment(req.body.startDate).tz('Asia/Kolkata').startOf('day').toDate(),
		  $lte: moment(req.body.endDate).tz('Asia/Kolkata').endOf('day').toDate()
		}
	 }
  } else {
	 if (status) {
		selector["deliveryStatus.status"] = req.body.status;
	 }
	 if (franchiseID) {
		selector["allocatedToFranchise"] = ObjectId(req.body.franchiseID);
	 }
	 if (req.body.startDate && req.body.endDate) {
		selector["createdAt"] = {
		  $gte: moment(req.body.startDate).tz('Asia/Kolkata').startOf('day').toDate(),
		  $lte: moment(req.body.endDate).tz('Asia/Kolkata').endOf('day').toDate()
		}
	 }
  }

  if (status !== '') {
	 Orders.aggregate([
		{ "$match": selector },
		{
		  "$redact":
		  {
			 "$cond": {
				"if": { "$eq": [{ "$arrayElemAt": ["$vendorOrders.deliveryStatus.status", -1] }, req.body.status] },
				"then": "$$KEEP",
				"else": "$$PRUNE"
			 }
		  }		  
		},
		{
			$lookup: {
				from: "entitymaster",
				let: { client_id: "$vendorOrders.vendor_id" },    
				pipeline : [
					{ $match: { $expr: { $eq: [ "$_id", "$$client_id" ] } }, },
					{ $project : { _id:1, companyName:1 } }
				],
				as: "vendorOrders.vendorName"
			}
		}
	])
		.sort({ createdAt: -1 })
		.exec()
		.then(async(data) => {
			// console.log('+++++ data +++++', data);
			for(var i=0;i<data.length;i++){
				for(var j=0;j<data[i].vendorOrders.length;j++){
					// console.log("data[i].vendorOrders",data[i].vendorOrders);
					var vendor = await Entitymaster.findOne({_id:data[i].vendorOrders[j].vendor_id},{companyName:1,_id:0})
					// console.log("vendor => ",vendor);
					data[i].vendorOrders[j].vendorName = vendor.companyName;
				}
			}
			if(i>=data.length){
				res.status(200).json(data);
			}
		})
		.catch(err => {
		  console.log(err);
		  res.status(500).json({
			 error: err
		  });
		});
  } else {
	 Orders.find(selector)
		.populate("allocatedToFranchise")
		.sort({ createdAt: -1 })
		.exec()
		.then(async(data) => {
			// console.log('+++++ data +++++', data);
			for(var i=0;i<data.length;i++){
				for(var j=0;j<data[i].vendorOrders.length;j++){
					// console.log("data[i].vendorOrders",data[i].vendorOrders);
					var vendor = await Entitymaster.findOne({_id:data[i].vendorOrders[j].vendor_id},{companyName:1,_id:0})
					// console.log("vendor => ",vendor);
					data[i].vendorOrders[j].vendorName = vendor.companyName;
				}
			}
			if(i>=data.length){
				res.status(200).json(data);
			}
		})
		.catch(err => {
		  console.log(err);
		  res.status(500).json({
			 error: err
		  });
		});
  }

};
exports.allocateOrderToFranchise = (req, res, next) => {
  Orders.updateOne(
	 { orderID: req.body.orderID },
	 {
		$set: {
		  "allocatedToFranchise": ObjectId(req.body.allocatedToFranchise)
		}
	 }
  )
	 .exec()
	 .then(data => {
		if (data.nModified == 1) {
		  res.status(200).json({
			 "message": "Order allocated to franchise Successfully."
		  });
		} else {
		  res.status(401).json({
			 "message": "Order Not Found"
		  });
		}
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
function franchisewise_order_count(franchiseid) {
		return new Promise(function (resolve, reject) {
			 Orders.find(
				{
				  "allocatedToFranchise": ObjectId(franchiseid), orderID: { $ne: null }
				})
				.exec()
				.then(data => {
				  resolve(data.length);
				})
		  })
}
exports.franchise_order_count = (req, res, next) => {
  Entitymaster.find({entityType:'franchise'})
  .exec()
	 .then(data => {
		getData();
		async function getData(){
			var franchiseOrderCount = [];
		  for(k = 0 ; k < data.length ; k++){
				var franchiseCount = await franchisewise_order_count(data[k]._id);
				  if(franchiseCount > 0){
					  franchiseOrderCount.push({
						"franchiseName": data[k].companyName ? data[k].companyName : '',
						"companyId": data[k].companyID ? data[k].companyID : '',
						"orderCount": franchiseCount
					  })
				 }
		  }

		  var count = franchiseOrderCount.sort(function(a, b){return b.orderCount-a.orderCount});    
		  res.status(200).json(franchiseOrderCount);  
		}
		
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
  };

function franchisewise_order_sale(franchiseid) {
		return new Promise(function (resolve, reject) {
			 Orders.aggregate([
				{"$match": { "allocatedToFranchise":franchiseid}},
				{"$group": {
						  "_id": null,
						  "TotalSale": { "$sum": "$total"},

						}
			 }])
				.exec()
				.then(data => {
				  //console.log("franchisewise_order_sale",data)
				  if(data.length > 0){
					 resolve(data[0].TotalSale);
				  }else{
					 resolve(0);
				  }
				  
				})
		  })
}
exports.top_franchise_sale = (req, res, next) => {
  Entitymaster.find({entityType:'franchise'})
  .exec()
	 .then(data => {
		getData();
		async function getData(){
		  var franchiseOrderSale = [];
			  for(k = 0 ; k < data.length ; k++){
				var franchiseCount = await franchisewise_order_sale(data[k]._id);
				  //console.log("top_franchise_sale",franchiseCount);
				if(franchiseCount > 0){
				  franchiseOrderSale.push({
					"franchiseName": data[k].companyName ? data[k].companyName : '',
					"totalSale": franchiseCount
				  })
				}
			  
			  }
		 
		  var count = franchiseOrderSale.sort(function(a, b){return b.totalSale-a.totalSale});  
		  res.status(200).json(franchiseOrderSale.slice(0,5));  
		}
		
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
  
};
exports.franchiseCategoryRevenue = (req, res, next) => {
  Orders.aggregate([
	 {
		$unwind: "$products"
	 },
	 { "$match": { "allocatedToFranchise": ObjectId(req.params.franchiseID) } },
	 {
		$group: {
		  "_id": "$products.category",
		  "revenue": { "$sum": { $multiply: ["$products.quantity", "$products.discountedPrice"] } }
		}
	 },
	 { $limit: 5 }
  ]).exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.franchiseSectionRevenue = (req, res, next) => {
  Orders.aggregate([
	 {
		$unwind: "$products"
	 },
	 { "$match": { "allocatedToFranchise": ObjectId(req.params.franchiseID) } },
	 {
		$group: {
		  "_id": "$products.section",
		  "revenue": { "$sum": { $multiply: ["$products.quantity", "$products.discountedPrice"] } }
		}
	 },
	 { $limit: 5 }
  ]).exec()
	 .then(data => {
		res.status(200).json(data);
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.getMonthwiseOrders = (req,res,next)=>{
	
	console.log("getMonthwiseOrders => ",req.body );

	 let selector = {};
	 let franchiseID = req.body.franchiseID ? req.body.franchiseID : '';
	 if(franchiseID){
		 selector = {'createdAt':{$gte : new Date(req.body.startDate), $lt : new Date(req.body.endDate) },allocatedToFranchise:ObjectId(req.body.franchiseID)}
	 }else{
		  selector = {'createdAt':{$gte : new Date(req.body.startDate), $lt : new Date(req.body.endDate) }}
	 }
	 Orders.aggregate([
		  {$match:selector},
		  {$group: {
				_id: {$month: "$createdAt"}, 
				totalCost: {$sum: "$paymentDetails.netPayableAmount"}, 
				numberoforders: {$sum: 1} 
		  }}
	 ])
	 .exec()
	 .then(orderDetails=>{
		console.log("orderDetails",orderDetails);
		  var returnData = []
		  var totalCost = "" ;
		  var totalOrders = "" ;
		  var dataArray = {};
		  var month = "";
		  var allMonths = [{"name":"Jan"}, 
								 {"name":"Feb"},
								 {"name":"Mar"},
								 {"name":"Apr"},
								 {"name":"May"},
								 {"name":"Jun"},
								 {"name":"Jul"},
								 {"name":"Aug"},
								 {"name":"Sep"},
								 {"name":"Oct"},
								 {"name":"Nov"},
								 {"name":"Dec"}];
		  for(var i=0 ; i<orderDetails.length ; i++){
				totalCost = orderDetails[i].totalCost;
				month = moment(orderDetails[i]._id, 'M').format('MMM');
				totalOrders = orderDetails[i].numberoforders;
				dataArray={
					 name : month,
					 totalOrders : totalOrders,
					 totalCost : totalCost
				}
				returnData.push(dataArray)

				allMonths.map(function(data,index){
				  if(data.name == month){
						allMonths[index].totalOrders = totalOrders;
						allMonths[index].totalCost = totalCost
				  }
				});            
		  }

		  res.status(200).json(allMonths);
	 })
	 .catch(err =>{
		  res.status(500).json({ error: err });
	 });
}
exports.franchise_bill_counts = (req, res, next) => {
  Orders.find({"allocatedToFranchise":ObjectId(req.params.franchiseID),"billNumber":{$exists: true}})
	 .exec()
	 .then(data => {
		res.status(200).json({ "dataCount": data.length });
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.total_sale_cost = (req, res, next) => {
Orders.aggregate([
		  {$group: {
				_id: null, 
				totalCost: {$sum: "$total"}, 
		  }}
	 ])
	 .exec()
	 .then(orderDetails=>{
		  res.status(200).json(orderDetails[0].totalCost);
	 })
	 .catch(err =>{
		  res.status(500).json({ error: err });
	 });
}
exports.franchiseTopProductsSale = (req, res, next) => {
  Orders.find({
	 "allocatedToFranchise":req.params.franchiseID,
	 createdAt: {
		  $gte: moment(req.params.startDate).tz('Asia/Kolkata').startOf('day').toDate(),
		  $lte: moment(req.params.endDate).tz('Asia/Kolkata').endOf('day').toDate()
	 }
  })
  .exec()
	 .then(data => {
		getData();
		async function getData(){
		  var Products = [];
			  for(k = 0 ; k < data.length ; k++){
				for(j = 0 ; j < data[k].products.length ; j++){
				  let obj = Products.find(p => p.productName === data[k].products[j].productName);
				  if(obj){
					 obj.saleCount = obj.saleCount + data[k].products[j].quantity;
				  }else{
					  var productObj = {
								"productName" : data[k].products[j].productName,
								"saleCount"   : data[k].products[j].quantity
					  }
					  Products.push(productObj);
				  }             
				}
			  }
		 
		  var count = Products.sort(function(a, b){return b.saleCount-a.saleCount})
		  res.status(200).json(Products.slice(0, 10));  
		}
		
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
  
};
exports.franchise_daily_orders_count = (req, res, next) => {
	 Orders.aggregate([
		{
		  "$match": {
				"allocatedToFranchise": ObjectId(req.params.franchiseID),
				createdAt: {
					 $gte: moment(req.params.startDate).tz('Asia/Kolkata').startOf('day').toDate(),
					 $lte: moment(req.params.endDate).tz('Asia/Kolkata').endOf('day').toDate()
				}
		  }
		},
	 ])
	 .exec()
	 .then(data => {
		// console.log("datatatatta",data);
		var count = data.length > 0 ?  data.length : 0;
		if(count == undefined){
			  res.status(200).json({ "dataCount": 0 });
		}else{
			  res.status(200).json({ "dataCount": count });
		}
	  
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};
exports.franchise_digital_order_counts = (req, res, next) => {
  Orders.find({
	 allocatedToFranchise : req.params.franchiseID,
	 createdAt: {
		$gte: moment().tz('Asia/Kolkata').startOf('year'),
		$lte: moment().tz('Asia/Kolkata').endOf('day')
	 }
  }).count()
	 .exec()
	 .then(data => {
		res.status(200).json({ "dataCount": data });
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};


// =============== Payment gateway ==========
exports.paymentgatewaycall = (req, res, next) => {
  // console.log('IN Credit Card ===>',req.body.AMOUNT);
		const redirecturl = 'https://uat.pinepg.in/api/PaymentURL/CreatePaymentURL';
		const paymentdetails = 'MERCHANT_ID='+req.body.MERCHANT_ID+'&MERCHANT_ACCESS_CODE='+req.body.MERCHANT_ACCESS_CODE+'&REFERENCE_NO='+req.body.REFERENCE_NO+'&AMOUNT='+req.body.AMOUNT+'&CUSTOMER_MOBILE_NO='+req.body.CUSTOMER_MOBILE_NO+'&CUSTOMER_EMAIL_ID='+req.body.CUSTOMER_EMAIL_ID+'&PRODUCT_CODE=testing'+'&merchant_return_URL=https://www.google.com/';
		// const paymentdetails = 'MERCHANT_ID=9445&MERCHANT_ACCESS_CODE=MERCHANT_ACCESS_CODE:dc53e787-3e81-427d-9e94-19220eec39ef&REFERENCE_NO='+Math.round(new Date().getTime() / 1000)+'&AMOUNT=2000&CUSTOMER_MOBILE_NO=8087679825&CUSTOMER_EMAIL_ID=&PRODUCT_CODE=testing';
		const config = {
			 headers: {
				  'Access-Control-Allow-Origin' : '*',
				  'Accept'                      : 'application/json',
				  "Content-Type"                : "application/x-www-form-urlencoded",
			 }
		} 
		// console.log('paymentdetails ===> ', paymentdetails);
		axios.post(redirecturl,paymentdetails,config)
			 .then(result => {
				//   console.log('getpaymentgateway Response===> ', result.data);
				  res.status(200).json({
					 "message": "Payment gateway Successfully Got URL.",
					 "result": result.data
				  });
				  // window.location.replace(result.data.PAYMENT_URL);
			 })
			 .catch(err => {
				  console.log('Errr', err);
				  res.status(500).json({
					 "message": "Payment gateway URL Not Got.",
				  });
			 })
};

exports.update_order_payment = (req, res, next) => {
  Orders.updateOne(
	 { _id: req.params.order_ID },
	 {
		$set: {
			 status : req.body.status,
			 RESPOSE_CODE : req.body.RESPOSE_CODE,
			 RESPOSE_MESSAGE :req.body.RESPOSE_MESSAGE,
			 REFERENCE_NO :req.body.REFERENCE_NO,
		  createdAt: new Date()
		}
	 }
  )
	 .exec()
	 .then(data => {
		// console.log('getpaymentgateway UPdate order Response===> ', data);

		if (data.nModified == 1) {
		  res.status(200).json({
			 "message": "Order Updated Successfully."
		  });
		} else {
		  res.status(401).json({
			 "message": "Order Not Found"
		  });
		}
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};

exports.deleteAllOrders = (req, res, next) => {
  Orders.remove({})
	 .exec()
	 .then(data => {
		res.status(200).json({
		  "message": "Orders Deleted Successfully."
		});
	 })
	 .catch(err => {
		console.log(err);
		res.status(500).json({
		  error: err
		});
	 });
};



/**=========== calcUserVendorDist() ===========*/
function calcUserVendorDist(vendorLat,vendorLong, userLat, userLong){
	// console.log("vendorLat => ",vendorLat)
	// console.log("vendorLong => ",vendorLong)
    return new Promise(function(resolve,reject){
        processDistance()

        async function processDistance(){
            //First point User Location
            var userLocation = { lat: userLat, lng: userLong }

            //Second point Vendor Location
            var vendorLocation = { lat: vendorLat, lng: vendorLong }        
            
            //Distance in meters (default)
            var distance_m = haversine(userLocation, vendorLocation);

            //Distance in miles
            var distance_miles = distance_m * 0.00062137119;

            //Distance in kilometers
            var distance_km = distance_m /1000; 
            
            //get unit of distance
            var unitOfDistance = await getAdminPreferences();
            if(unitOfDistance.toLowerCase() === "mile"){
                resolve(distance_miles);
            }else{
                resolve(distance_km);
            }            
        }
    });
}


/**=========== getAdminPreferences() ===========*/
function getAdminPreferences(){
    return new Promise(function(resolve,reject){
        AdminPreferences.findOne()
        .exec()
        .then(adminPreferences=>{
            if(adminPreferences !== null){
                resolve(adminPreferences.unitOfDistance);
            }else{
                resolve(adminPreferences);
            }            
        })
        .catch(err =>{
            console.log("Error while fetching admin preferences => ",err);
            reject(err)
        });
    });
 }


 /**=========== getDistanceLimit() ===========*/
function getDistanceLimit(){
    return new Promise(function(resolve,reject){
        StorePreferences.findOne({},{"maxRadius" : 1})
        .exec()
        .then(storePreferences=>{
            if(storePreferences && storePreferences.maxRadius){
                resolve(parseInt(storePreferences.maxRadius));
            }else{
                resolve(0);
            }            
        })
        .catch(err =>{
            console.log("Error => ",err);
            reject(err)
        });
    });
 }

/*################## API's for Driver APP ##################*/

/*================= Get Nearest Ready to Dispatch Vendor Orders =================*/
exports.nearest_vendor_orders= (req, res, next) => {
	// console.log("req.body => ",req.body)
	const {status} = req.body;
	Orders.aggregate([
		{ "$unwind" : "$vendorOrders"},
		{ "$lookup" : 
			{
				"from"			: "entitymasters",
				"as"			: "vendorDetails",
				"localField"	: "vendorOrders.vendor_id",
				"foreignField"	: "_id"
			}
		},
		{ "$unwind" : "$vendorDetails" },
		{ $match :
			{ 
				"vendorOrders.orderStatus" : status 
			}
		},
		{ "$project" : 
			{
			  	"_id"										: 1,
				"orderID"								: 1,
				"user_ID"								: 1,
				"userName"								: 1,
				"createdAt"                      : 1,
				"vendorOrders.vendor_id"			: 1,
				"vendorOrders.vendorLocation_id"	: 1,
				"vendorOrders.orderStatus"			: 1,
				"deliveryAddress"						: 1,
				"vendorDetails.companyName"		: 1,
				"vendorDetails.companyLogo"		: 1,
				"vendorDetails.locations"			: 1,
				"vendorDetails.createdAt"			: 1,
			}
		}	
	])
	.then(async(data) => {
		// console.log("data => ",data);
		if(data && data.length > 0){			
			var location 		= await DriverTracking.aggregate([				
										{$match : 
											{
												user_id 		: ObjectId(req.body.user_id),
												currentDateStr 	: moment().format("YYYY-MM-DD"),
												status 			: "online"
											}
										},
										{$project : 
											{
												lat : {$arrayElemAt : ["$currentLocations.lat",-1]},
												lng : {$arrayElemAt : ["$currentLocations.lat",-1]}
											}
										}
									])
			// console.log("location => ",location)
			var latitude 	= location[0].lat;
			var longitude	= location[0].lng;

			if(latitude !== "" && longitude !== undefined && latitude !== "" && longitude !== undefined){
				for(var i = 0; i < data.length; i++){
					if(data[i].vendorDetails && data[i].vendorDetails.locations && data[i].vendorDetails.locations.length > 0){
						var vendorLocation = data[i].vendorDetails.locations.filter(location => String(location._id) === String(data[i].vendorOrders.vendorLocation_id))
						// console.log("vendorLocation => ",vendorLocation)
						
						if(vendorLocation && vendorLocation.length > 0){
							var vendor_id           = data[i].vendorDetails._id;
							var vendorLogo          = data[i].vendorDetails.companyLogo[0];
							var vendorName          = data[i].vendorDetails.companyName;
							var address             = vendorLocation[0].addressLine1;
							var vendorLocation_id   = vendorLocation[0]._id;
							var vendorLat           = vendorLocation[0].latitude;
							var vendorLong          = vendorLocation[0].longitude;
							var custLat            	= data[i].deliveryAddress.latitude;
							var custLng            	= data[i].deliveryAddress.longitude;
							
							// var latitude = await DriverTracking.findOne({user_id:ObjectID(req.body.user_id),currentDateStr:moment().format("YYYY-MM-DD")})
							
							
							var vendorDist  		= await calcUserVendorDist(vendorLat,vendorLong, latitude, longitude);
							var vendorToCustDist 	= await calcUserVendorDist(vendorLat,vendorLong, custLat, custLng);

							data[i].vendorOrders.vendorDistance 		= vendorDist ? vendorDist.toFixed(2) : '';
							data[i].vendorOrders.vendorToCustDist 		= vendorToCustDist ? vendorToCustDist.toFixed(2) : '';
							data[i].vendorOrders.expectedReachedTime 	= (parseInt((60/20) * vendorDist));
						}
					}
				}//for end
				if(i >= data.length){
					var distanceLimit = await getDistanceLimit();	
					// console.log("distanceLimit => ",distanceLimit)
					// if(distanceLimit){
					// 	var FinalVendorOrders = data.filter(vendor => vendor.vendorOrders.vendorDistance <= distanceLimit).sort(function (a, b) {
					// 		return (a.vendorOrders.vendorDistance - b.vendorOrders.vendorDistance);
					// 	});
					// 	// console.log("FinalVendorOrders 1 =>",FinalVendorOrders)
					// }else{                                            
					// 	var FinalVendorOrders = data.filter(vendor => vendor.vendorOrders.vendorDistance <= distanceLimit).sort(function (a, b) {
					// 		return (a.vendorOrders.vendorDistance - b.vendorOrders.vendorDistance);
					// 	});
					// 	// console.log("FinalVendorOrders 2 =>",FinalVendorOrders)
					// }	

					var FinalVendorOrders = data.sort(function (a, b) {
						return (a.vendorOrders.vendorDistance - b.vendorOrders.vendorDistance);
					});				
					res.status(200).json(FinalVendorOrders);
				}
			}else{
				res.status(200).json({
					message : "Unable to get latitude and longitude"
				});
			}
		}else{
			res.status(200).json({
				message : "No Orders Found"
			});
		}			
	})
	.catch(err => {
	   console.log(err);
	   res.status(500).json({
		 error: err
	   });
	});
};

// ---------------- Get Single Vendor Order ----------------
exports.get_single_vendor_order = (req, res, next) => {
	Orders.findOne(
		{
			"_id" 						: ObjectId(req.body.order_id), 
			"vendorOrders.vendor_id" 	: ObjectId(req.body.vendor_id)
		},
		{
			'orderID' 				: 1,
			'userFullName'      	: 1,
			'customerShippingTime' 	: 1,
			'deliveryAddress' 		: 1,
			'paymentDetails' 		: 1,
			'createdAt' 			: 1,
			'vendorOrders.$'   		: 1
		}
	)
	.exec()
	.then(data => {
		res.status(200).json(data);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error : err
		});
	});
};
  
// ---------------- Deliver Single Vendor Order ----------------
exports.deliver_single_vendor_order = (req, res, next) => {
	// console.log("body => ",req.body)
	Orders.updateOne(
		{ _id: ObjectId(req.body.order_id), 'vendorOrders.vendor_id' : ObjectId(req.body.vendor_id)},		
		{
			$set:{
				"vendorOrders.$.orderStatus"  		: "Delivered",
				"vendorOrders.$.deliveryPerson_id" 	: req.body.user_id,
				"vendorOrders.$.paymentDetails" 	: req.body.paymentDetails
			},
			$push: {	
				"vendorOrders.$.deliveryStatus" : {
					status 				: "Delivered",
					timestamp 			: new Date(),
					statusUpdatedBy 	: req.body.user_id
				}
			}
		}
	)
	.exec()
	.then(async(updatedata) => {
		if (updatedata.nModified === 1) {
			var vendorOrders 	= await Orders.findOne({ _id : ObjectId(req.body.order_id) }, {vendorOrders : 1});
			// console.log("OrderStatuses => ",OrderStatuses);
			// console.log("vendorOrders => ",vendorOrders);
			var count = 0;
			for(var i=0; i < vendorOrders.vendorOrders.length; i++){
				// console.log("vendorOrders.vendorOrders.orderStatus => ",vendorOrders.vendorOrders[i].orderStatus)
				if(vendorOrders.vendorOrders[i].orderStatus === "Delivered" || vendorOrders.vendorOrders[i].orderStatus === "Cancelled"){
					count += 1;
					// console.log("count 1 => ",count)
				}
			}
			if(i >= vendorOrders.vendorOrders.length){
				// console.log("count => ",(count === vendorOrders.vendorOrders.length));
				if(count === vendorOrders.vendorOrders.length){
					Orders.updateOne(
						{ _id: ObjectId(req.body.order_id)},		
						{
							$set:{
								"orderStatus"  : "Delivered"								
							}
						}
					)
					.then(async(updateorderdata) => {
						// console.log("updateorderdata => ",updateorderdata)
					
						var orderdata 	= await Orders.findOne({ _id : ObjectId(req.body.order_id) }, {user_ID : 1, deliveryAddress : 1, orderID : 1});
						var userData 	= await User.findOne({"_id" : ObjectId(orderdata.user_ID)}); 
						// console.log("userData => ",userData)
						
						var userNotificationValues = {
							"event"				: "OrderStatusChange",
							"toUser_id"			: orderdata.user_ID,
							"toUserRole"		: "user",
							"toMobileNumber"	: orderdata.deliveryAddress.mobileNumber,								
							"variables" 		: {
													"customerName" 			: userData.profile.fullName,
													"customerEmail" 		: userData.profile.email,
													"mobileNumber"			: orderdata.deliveryAddress.mobileNumber,
													"orderID"  				: orderdata.orderID,
													"deliveryAddress" 		: orderdata.deliveryAddress
							}
						}
						var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);	
					})
					.catch(err => {
						console.log("Error => Failed to Update Complete Order Status")
					})
					
				}
			}
			res.status(200).json({
				"message"	: "Order Delivered Successfully."
			});
		} else {
			res.status(200).json({
				"message" : "Failed to Deliver Order"
			});
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error : err
		});
	});
};

// ---------------- Get Daily Vendor Orders ----------------
// exports.daily_vendor_orders = (req, res, next) => {
// 	console.log("date start => ", moment(new Date(req.body.deliveryDate)).utc().startOf('day').toDate())
// 	console.log("date start => ", moment(new Date(req.body.deliveryDate)).utc().endOf('day').toDate())
// 	Orders.aggregate([
// 		{
// 			"vendorOrders.deliveryPerson_id" 	: ObjectId(req.body.user_id), 
// 			"vendorOrders.orderStatus" 			: req.body.orderStatus,
// 			"vendorOrders.deliveryStatus" 		: 
// 			{"$elementMatch" : {
// 					"statusUpdatedBy" 	: ObjectId(req.body.user_id), 
// 					"status" 			: req.body.orderStatus,
// 					"timestamp" 		: {
// 						$gte 	: moment(new Date(req.body.deliveryDate)).startOf('day').toDate(),
// 						$lte 	: moment(new Date(req.body.deliveryDate)).endOf('day').toDate()
// 					}
// 				}
// 			}
// 		},
// 		// {$project : {
// 		// 	'orderID' 				: 1,
// 		// 	'userFullName'      	: 1,
// 		// 	'customerShippingTime' 	: 1,
// 		// 	'deliveryAddress' 		: 1,
// 		// 	'paymentDetails' 		: 1,
// 		// 	'createdAt' 			: 1,
// 			// "vendorOrders" : {
// 			// 	"$filter" : {
// 			// 	   "input" : "$vendorOrders",
// 			// 	   "as" : "vendorOrders",
// 			// 	   "cond" : {
// 			// 		  "$and" : [
// 			// 			//  { "$eq" 	: [ "$$vendorOrders.deliveryPerson_id", ObjectId(req.body.user_id) ] },
// 			// 			//  { "$eq" 	: [ "$$vendorOrders.orderStatus", req.body.orderStatus ] },
// 			// 			//  { "$eq" 	: [ "$$vendorOrders.deliveryStatus.statusUpdatedBy", ObjectId(req.body.user_id) ] },
// 			// 			 { "$eq" 	: [ "$$vendorOrders.deliveryStatus.status", req.body.orderStatus ] },
// 			// 			//  { "$gte" 	: [ "$$vendorOrders.deliveryStatus.timestamp", moment(new Date(req.body.deliveryDate)).startOf('day').toDate() ] },
// 			// 			//  { "$lte" 	: [ "$$vendorOrders.deliveryStatus.timestamp", moment(new Date(req.body.deliveryDate)).endOf('day').toDate() ] }
// 			// 		  ]
// 			// 	   }
// 			// 	}
// 			//  }
// 			// 'vendorOrders'   		: 1
// 		// }
// 	// }
// 		])
// 	.exec()
// 	.then(data => {	
// 		res.status(200).json(data);
// 	})
// 	.catch(err => {
// 		console.log(err);
// 		res.status(500).json({
// 			error : err
// 		});
// 	});
// };

exports.monthly_vendor_orders = (req, res, next) => {
	const monthyear = req.body.monthyear;
    const monyr     = monthyear.split("-");
    const year      = monyr[0];
    const month     = monyr[1];
	// var startDate = req.body.startDate;
	// var endDate = req.body.endDate;
	var startDate = moment([year, month-1]).format();
	// console.log("startDate => ",startDate);
	var endDate = moment(startDate).endOf('month').format();
	// console.log("endDate => ",new Date(endDate));
	// console.log("Start  => ",moment(startDate).utc().startOf('day').toDate());
	// console.log("End => ",moment(endDate).utc().endOf('day').toDate());
	// console.log("new Start1  => ",moment(new Date(startDate)).startOf('day').toDate());
	// console.log("new End1 => ",moment(new Date(endDate)).endOf('day').toDate());

	Orders.find(
		{
			"vendorOrders.deliveryPerson_id" 	: ObjectId(req.body.user_id), 
			"vendorOrders.orderStatus" 			: req.body.orderStatus,
			"vendorOrders.deliveryStatus" 		: 
			{"$elemMatch" : 
				{
					"statusUpdatedBy" : ObjectId(req.body.user_id), 
					"status" 			: req.body.orderStatus,
					"timestamp" 		: {
						$gte 	: moment(new Date(startDate)).startOf('day').toDate(),
						$lte 	: moment(new Date(endDate)).endOf('day').toDate()
					}
				}
			}
		},
		{
			'orderID' 					: 1,
			'userFullName'      		: 1,
			'customerShippingTime' 	: 1,
			'deliveryAddress' 		: 1,
			'paymentDetails' 			: 1,
			'createdAt' 				: 1,
			'vendorOrders.$'   		: 1
		}
	)
	.exec()
	.then(async(orderdata) => {	
		// console.log("orderdata => ",orderdata);
		allDays  						= await getDaysInMonth(parseInt(month-1),parseInt(year));
		var totalNumberOfOrders 	= 0;
		var totalCashCollected 		= 0;
		var monthDays 					= [];

		for(var i=0; i<allDays.length; i++) {

			var numberOfOrders 	= 0;
			var cashCollected   	= 0;

			for(var j=0; j<orderdata.length; j++){
				// console.log("allDays i => ", moment(allDays[i]).format('L'))
				// console.log("orderData j => ", orderdata[j].vendorOrders[0])
				var statusObj = orderdata[j].vendorOrders[0].deliveryStatus.filter(deliveryStatus => (deliveryStatus.status === req.body.orderStatus && String(deliveryStatus.statusUpdatedBy) === String(req.body.user_id)))
				// console.log("statusObj => ",statusObj)
				if(statusObj && statusObj.length > 0){	
					if(moment(allDays[i]).format('L') === moment(statusObj[0].timestamp).format('L')){
						// console.log("orders count => ",orderdata[j].vendorOrders.length)
						numberOfOrders += orderdata[j].vendorOrders.length;	
						if (orderdata[j].vendorOrders[0].paymentDetails.modeOfPayment.toLowerCase() === "cash on delivery") {
							cashCollected += orderdata[j].vendorOrders[0].paymentDetails.amountPaid;
						}
					}	
				}			
			}
			if(j>=orderdata.length){
				// console.log("day => ",moment(allDays[i]).format('L'))
				totalNumberOfOrders 	+= numberOfOrders;
				totalCashCollected 	+= cashCollected;

				var ordersObj = {
					monthDay 			: allDays[i],
					numberOfOrders 	: numberOfOrders,
					cashCollected 		: (cashCollected).toFixed(2)
				}
				monthDays.push(ordersObj)
				// console.log("monthDays => ",monthDays)
				// console.log("ordersObj => ",ordersObj)
			}			
		}
		if(i>=allDays.length){
			var returnData = {
				monthDays 					: monthDays,
				totalNumberOfOrders 		: totalNumberOfOrders,
				totalCashCollected 		: (totalCashCollected).toFixed(2)
			}
			res.status(200).json(returnData);
		}
		// res.status(200).json(data);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error : err
		});
	});

	function getDaysInMonth(month, year) {
		return new Promise(function(resolve,reject){
			var date = new Date(Date.UTC(year, month, 1));
			var days = [];

			while (date.getUTCMonth() === month) {
				days.push(new Date(date));
				date.setUTCDate(date.getUTCDate() + 1);
			}
			resolve(days);
		})
	}
};

// ---------------- Get Daily Vendor Orders ----------------
exports.daily_vendor_orders = (req, res, next) => {
	// console.log("start => ", moment(new Date(req.body.deliveryDate)).startOf('day').toDate());
	// console.log("end => ", moment(new Date(req.body.deliveryDate)).endOf('day').toDate());
	Orders.aggregate([	   
		{ "$match": 
			{"vendorOrders": 
				{"$elemMatch":
					{
						"orderStatus"		: req.body.orderStatus,
						"deliveryPerson_id" : ObjectId(req.body.user_id),
						"deliveryStatus" 	: {
							"$elemMatch" : {
								"statusUpdatedBy" : ObjectId(req.body.user_id), 
								"status" 			: req.body.orderStatus,
								"timestamp" 		: {
									$gte 	: moment(new Date(req.body.deliveryDate)).startOf('day').toDate(),
									$lte 	: moment(new Date(req.body.deliveryDate)).endOf('day').toDate()
								}
							}
						}
					}
				}
		  	}
		},
		{ "$addFields"	: 
			{ "vendorOrders" : 
				{ "$filter" : 
					{
						"input" : "$vendorOrders",  
						"as"    : "sa",
						"cond"  : {
							"$and" : [
								{ "$eq" : [ "$$sa.orderStatus", req.body.orderStatus ] },
								{ "$eq" : [ "$$sa.deliveryPerson_id", ObjectId(req.body.user_id) ] },
								// {"$$sa.deliveryStatus" 	: 
								// 	// {"$all": 
								// 		{"$elemMatch": 	
								// 			{
								// 				"$$sa.deliveryStatus.statusUpdatedBy" 	: ObjectId(req.body.user_id), 
								// 				"$$sa.deliveryStatus.status" 			: req.body.orderStatus,
								// 				"$$sa.deliveryStatus.timestamp" 		: {
								// 					$gte 	: moment(new Date(req.body.deliveryDate)).startOf('day').toDate(),
								// 					$lte 	: moment(new Date(req.body.deliveryDate)).endOf('day').toDate()
								// 				}
								// 			}
								// 		}
								// 	// }
								// }] },
								// { "$eq" : [ "$$sa.deliveryStatus.statusUpdatedBy", ObjectId(req.body.user_id) ] },
								//  { "$gt": [ { "$size": "$$sa.deliveryStatus" }, 0 ] }
							]
						}
			  		}
				}
		  	}	
		}
	])
	.then(data => {
		// console.log("data => ",data);
		var cashCollected 	= 0;
		var numberOfOrders 	= 0;

		if (data && data.length > 0) {
			for (var i = 0; i < data.length; i++) {
				// console.log("data[i].vendororders => ", data[i].vendorOrders)
				numberOfOrders += data[i].vendorOrders.length;
				if (data[i].vendorOrders[0].paymentDetails.modeOfPayment.toLowerCase() === "cash on delivery") {
					cashCollected += data[i].vendorOrders[0].paymentDetails.amountPaid;
				}
			}if (i >= data.length) {				
				res.status(200).json({
				numberOfOrders : numberOfOrders,
				cashCollected 	: (cashCollected).toFixed(2),
				data 				: data
			});
			}
		}else{
			res.status(200).json({
				numberOfOrders : numberOfOrders,
				cashCollected 	: (cashCollected).toFixed(2),
				data 				: data
			});
		}
		//   var tableData = data.map((a, i) => {
		// 	return {
		// 	   "orderID": a.orderID,
		// 	   "userFullName": a.userFullName,
		// 	   "products": ((a.products.map((b, j) => { return '<div><p>Product Name: ' + b.productName + '</p><p>Product Code: ' + b.productDetail.productCode + '-' + b.productDetail.itemCode + '</p><p>Sell Quantity: ' + b.quantity + '</p><p>Price: <span class="ororiginalPrice">' + (b.discountPercent > 0 ? b.originalPrice : '') + '</span>  <span>' + b.discountedPrice + '</span>  <span class="orPercent">' + (b.discountPercent > 0 ? b.discountPercent + '%' : '') + '</span>  </p>' + '</div><br/>' })).toString()).replace(/,/g, " "),
		// 	   "cartQuantity": a.cartQuantity,
		// 	   "status": a.status
		// 	}
		//   })
		
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
		error: err
		});
	});
};


// ---------------- Get Rejected Vendor Orders By driver ----------------
exports.rejected_orders = (req, res, next) => {
	// console.log("start => ", moment(new Date(req.body.deliveryDate)).startOf('day').toDate());
	// console.log("end => ", moment(new Date(req.body.deliveryDate)).endOf('day').toDate());
	Orders.find(
		{"vendorOrders.deliveryStatus" : 
			{"$elemMatch" : 
				{
					"statusUpdatedBy" : ObjectId(req.body.user_id), 
					"status" 			: "Allocation Rejected",
					"timestamp" 		: {
						$gte 	: moment(new Date(req.body.startDate)).startOf('day').toDate(),
						$lte 	: moment(new Date(req.body.endDate)).endOf('day').toDate()
					}
				}
			}
		},
		{
			'orderID' 					: 1,
			'userFullName'      		: 1,
			'customerShippingTime' 	: 1,
			'deliveryAddress' 		: 1,
			'paymentDetails' 			: 1,
			'createdAt' 				: 1,
			'vendorOrders.$'   		: 1
		}
	)
	.then(data => {
		console.log("data => ",data);
		//   var tableData = data.map((a, i) => {
		// 	return {
		// 	   "orderID": a.orderID,
		// 	   "userFullName": a.userFullName,
		// 	   "products": ((a.products.map((b, j) => { return '<div><p>Product Name: ' + b.productName + '</p><p>Product Code: ' + b.productDetail.productCode + '-' + b.productDetail.itemCode + '</p><p>Sell Quantity: ' + b.quantity + '</p><p>Price: <span class="ororiginalPrice">' + (b.discountPercent > 0 ? b.originalPrice : '') + '</span>  <span>' + b.discountedPrice + '</span>  <span class="orPercent">' + (b.discountPercent > 0 ? b.discountPercent + '%' : '') + '</span>  </p>' + '</div><br/>' })).toString()).replace(/,/g, " "),
		// 	   "cartQuantity": a.cartQuantity,
		// 	   "status": a.status
		// 	}
		//   })
		res.status(200).json(data);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
		error: err
		});
	});
};


// ---------------- Ready to Dispatch Vendor Orders for Dispatch Center ----------------
exports.list_ready_to_dispatch_orders = (req, res, next) => {
		// console.log("req.body => ",req.body)
		const {status} = req.body;
		Orders.aggregate([
			{ "$unwind" : "$vendorOrders"},
			{ "$lookup" : 
				{
					"from"			: "entitymasters",
					"as"			: "vendorDetails",
					"localField"	: "vendorOrders.vendor_id",
					"foreignField"	: "_id"
				}
			},
			{ "$unwind" : "$vendorDetails" },
			{ $match :
				{ 
					"vendorOrders.orderStatus" : {$in :status }
				}
			},
			{ "$project" : 
				{
					"_id"								: 1,
					"orderID"							: 1,
					"user_ID"							: 1,
					"userName"							: 1,
					"userFullName"						: 1,
					"paymentDetails"					: 1,
					"vendorOrders"						: 1,
					// "vendorOrders.vendor_id"			: 1,
					// "vendorOrders.vendorLocation_id"	: 1,
					// "vendorOrders.orderStatus"			: 1,
					"deliveryAddress"					: 1,
					"vendorDetails.companyName"			: 1,
					"vendorDetails.companyLogo"			: 1,
					"vendorDetails.locations"			: 1,
					"vendorDetails.createdAt"			: 1,
					"createdAt" 						: 1
				}
			}	
		])
		// .populate("vendorOrders.vendor_id")
		.then(async(data) => {
			// console.log("data => ",data);
			if(data && data.length > 0){
				for(var i = 0; i < data.length; i++){
					if(data[i].vendorDetails && data[i].vendorDetails !== null && data[i].vendorDetails !== undefined){							
						var vendor_id           = data[i].vendorDetails._id;
						var vendorLogo          = data[i].vendorDetails.companyLogo[0];
						var vendorName          = data[i].vendorDetails.companyName;
					}						
				}//for end
				if(i >= data.length){
					var FinalVendorOrders = data.sort(function (a, b) {
						// console.log("----> ",a.vendorOrders.deliveryStatus[a.vendorOrders.deliveryStatus.length - 1].timestamp)
						return (b.vendorOrders.deliveryStatus[b.vendorOrders.deliveryStatus.length - 1].timestamp - a.vendorOrders.deliveryStatus[a.vendorOrders.deliveryStatus.length - 1].timestamp);
					});
					// console.log("FinalVendorOrders =>",FinalVendorOrders)
									
					res.status(200).json(FinalVendorOrders);
				}
			}else{
				res.status(200).json({
					message : "No Orders Found"
				});
			}			
		})
		.catch(err => {
		   console.log(err);
		   res.status(500).json({
			 error: err
		   });
		});
	};

	// ---------------- Single Vendor Order for Dispatch Center ----------------
	exports.fetch_vendor_order = (req, res, next) => {

		Orders.aggregate([
			{ $match :
				{ 
					"_id" : ObjectId(req.params.orderID) 
				}
			},
			{ "$unwind" : "$vendorOrders"},
			{ "$lookup" : 
				{
					"from"			: "entitymasters",
					"as"			: "vendorDetails",
					"localField"	: "vendorOrders.vendor_id",
					"foreignField"	: "_id"
				}
			},
			{ $match :
				{ 
					"vendorOrders.vendor_id" : ObjectId(req.params.vendor_id) 
				}
			},
			{ "$project" : 
				{
					"_id"								: 1,
					"orderID"							: 1,
					"user_ID"							: 1,
					"userName"							: 1,
					"userFullName"						: 1,
					"vendorOrders"						: 1,
					"deliveryAddress"					: 1,
					"vendorDetails"						: 1,
					"createdAt" 						: 1
				}
			}	
		])
		.then(async(data) => {
			if(data && data.length > 0){
				res.status(200).json(data);				
			}else{
				res.status(200).json({
					message : "No Order Found"
				});
			}			
		})
		.catch(err => {
		   console.log(err);
		   res.status(500).json({
			 error: err
		   });
		});
	};

// ---------------- Nearby Delivery Persons for Dispatch Center ----------------
exports.get_nearby_delivery_persons= (req, res, next) => {
	Orders.aggregate([
		{ $match :
			{ 
				"_id" : ObjectId(req.params.order_id) 
			}
		},
		{ "$unwind" : "$vendorOrders"},
		{ "$lookup" : 
			{
				"from"			: "entitymasters",
				"as"			: "vendorDetails",
				"localField"	: "vendorOrders.vendor_id",
				"foreignField"	: "_id"
			}
		},
		{ "$unwind" : "$vendorDetails" },
		{ $match :
			{ 
				"vendorOrders.vendor_id" : ObjectId(req.params.vendor_id)  
			}
		},
		{ "$project" : 
			{
				"_id"										: 1,
				"orderID"								: 1,
				"user_ID"								: 1,
				"userName"								: 1,
				"vendorOrders.vendor_id"			: 1,
				"vendorOrders.vendorLocation_id"	: 1,
				"vendorOrders.orderStatus"			: 1,
				"deliveryAddress"						: 1,
				"vendorDetails.companyName"		: 1,
				"vendorDetails.companyLogo"		: 1,
				"vendorDetails.locations"			: 1,
				"vendorDetails.createdAt"			: 1,
			}
		}	
	])
	.then(async(data) => {
		// console.log("data => ",data);
		var distanceLimit = await getDistanceLimit();	
		// console.log("distanceLimit => ",distanceLimit)
		if(data && data.length > 0){

			if(data[0].vendorDetails.locations && data[0].vendorDetails.locations.length > 0){
				
				var vendorLocation = data[0].vendorDetails.locations.filter(location => String(location._id) === String(data[0].vendorOrders.vendorLocation_id));
				if(vendorLocation && vendorLocation.length > 0){
					var vendorLat           = vendorLocation[0].latitude;
					var vendorLong          = vendorLocation[0].longitude;
					var custLat            	= data[0].deliveryAddress.latitude;
					var custLng            	= data[0].deliveryAddress.longitude;

					var DeliveryPersons		= await DriverTracking.aggregate([	
						{ "$lookup" : 
							{
								"from"			: "users",
								"as"				: "userDetails",
								"localField"	: "user_id",
								"foreignField"	: "_id"
							}
						},			
						{$match : 
							{
								currentDateStr 	: moment().format("YYYY-MM-DD"),
								// currentDateStr 	: moment("2021-07-11 06:48:05.540Z").format("YYYY-MM-DD"),
								status 			: "online"
							}
						},
						{$project : 
							{	
								userDetails : 1,
								lat 		: {$arrayElemAt : ["$currentLocations.lat",-1]},
								lng 		: {$arrayElemAt : ["$currentLocations.lat",-1]}
							}
						}
					])

					//console.log("DeliveryPersons => ",DeliveryPersons)
					if(vendorLat !== "" && vendorLat !== undefined && vendorLat !== "" && vendorLat !== undefined){
						
						if(DeliveryPersons && DeliveryPersons.length > 0){
						
							for(var i = 0; i < DeliveryPersons.length; i++){
								var latitude 	= DeliveryPersons[0].lat;
								var longitude	= DeliveryPersons[0].lng;	
										
								var vendorToDeliveryPersonDist  = await calcUserVendorDist(vendorLat,vendorLong, latitude, longitude);
								// var vendorToCustDist 			= await calcUserVendorDist(vendorLat,vendorLong, custLat, custLng);
								// console.log("vendorToDeliveryPersonDist => ", vendorToDeliveryPersonDist)
								DeliveryPersons[i].vendorToDeliveryPersonDist 		= vendorToDeliveryPersonDist ? vendorToDeliveryPersonDist.toFixed(2) : 0;									
								
							}//for end
							if(i >= DeliveryPersons.length){									
								if(distanceLimit){
									// console.log("DeliveryPersons => ",DeliveryPersons)
									if(DeliveryPersons && DeliveryPersons.length > 1){
										var FinalDeliveryPersonsList = DeliveryPersons.filter(DeliveryPerson => DeliveryPersons.vendorToDeliveryPersonDist <= distanceLimit).sort(function (a, b) {
											return (a.vendorToDeliveryPersonDist - b.vendorToDeliveryPersonDist);
										});
									}else{
										var FinalDeliveryPersonsList = DeliveryPersons;
									}
									// console.log("FinalDeliveryPersonsList 1 =>",FinalDeliveryPersonsList)
								}else{   
									if(DeliveryPersons && DeliveryPersons.length > 1){                                         
										var FinalDeliveryPersonsList = DeliveryPersons.filter(DeliveryPerson => DeliveryPersons.vendorToDeliveryPersonDist <= distanceLimit).sort(function (a, b) {
											return (a.vendorToDeliveryPersonDist - b.vendorToDeliveryPersonDist);
										});
									}else{
										var FinalDeliveryPersonsList = DeliveryPersons;
									}	
									// console.log("FinalDeliveryPersonsList 2 =>",FinalDeliveryPersonsList)
								}					
								res.status(200).json(FinalDeliveryPersonsList);
							}
						}else{
							res.status(200).json({
								message : "No Delivery Persons found within "+ distanceLimit + " Km Range"
							});
						}
					}else{
						res.status(200).json({
							message : "No Vendor Location Found"
						});
					}
				}else{
					res.status(200).json({
						message : "No Vendor Location Found"
					});
				}
			}else{
				res.status(200).json({
					message : "No Vendor Locations Added"
				});
			}	
			
		}else{
			res.status(200).json({					
				message : "No Order Data Found"
			});
		}			
	})
	.catch(err => {
	   console.log(err);
	   res.status(500).json({
		 error: err
	   });
	});
};

/*###################### Reports Started From Here ######################*/


// ---------------- Revenue Reports ----------------
exports.revenue_reports = (req, res, next) => {
	
	// console.log("revenue_reports => ",req.body);
	// console.log("start => ",moment(req.body.startDate).startOf('day').toDate())
	// console.log("end => ",moment(req.body.endDate).endOf('day').toDate())
	// console.log("start1 => ",moment(req.body.startDate).tz('Asia/Kolkata').startOf('day').toDate())
	// console.log("end1 => ",moment(req.body.endDate).tz('Asia/Kolkata').endOf('day').toDate())
	// console.log("start2 => ",new Date(req.body.startDate))
	// console.log("end2 => ",new Date(req.body.endDate))
	var selector        = {};
	selector['$and']    = [];
	
	/**----------- Date Filter ------------ */		
	if(req.body.startDate && req.body.endDate){       
		selector["$and"].push({
			createdAt : {
				// $gte : moment(req.body.startDate).startOf('day').toDate(),
				// $lte : moment(req.body.endDate).endOf('day').toDate()
				$gte : new Date(req.body.startDate),
				$lte : new Date(req.body.endDate)
			 }
		})
	}
	/**----------- Status Filter ------------ */		
	// if(req.body.status && req.body.status !== "" && req.body.status !== undefined && req.body.status !== null){       
	// 	selector["$and"].push({
	// 		'vendorOrders.orderStatus' : req.body.status			 
	// 	})
	// }
	selector["$and"].push({ "vendorOrders.orderStatus" : 'Delivered' })
	/**----------- Vendor Filter ------------ */		
	if(req.body.vendor && req.body.vendor !== "" && req.body.vendor !== undefined && req.body.vendor !== null){       
		selector["$and"].push({
			'vendorOrders.vendor_id' : ObjectId(req.body.vendor)			 
		})
	}

	/**----------- Seach Orders by OrderID, VendorName, User Name etc. ------------ */
	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push();
		selector["$and"].push({ 
			"$or" : [
						{ "orderID" 							: parseInt(req.body.searchText) },
						{ "vendorDetails.companyName" 	: {'$regex' : req.body.searchText , $options: "i" } }
					]
		})
	}
	// console.log("selector => ",selector);

  	Orders.aggregate([
		{ "$unwind" 	: "$vendorOrders"},
		{ "$lookup" 	: 
			{
				"from"			: "entitymasters",
				"as"				: "vendorDetails",
				"localField"	: "vendorOrders.vendor_id",
				"foreignField"	: "_id"
			}
		},
		{ "$unwind" 	: "$vendorDetails" },
		{ "$match" 		: selector},
		{ "$project" 	: 
			{
				"_id"																: 1,
				"orderID"														: 1,
				"vendorOrders.orderStatus"									: 1,
				"vendorOrders.vendor_afterDiscountTotal"				: 1,
				"vendorOrders.vendor_shippingChargesAfterDiscount"	: 1,
				"vendorOrders.vendor_netPayableAmount"					: 1,
				"vendorDetails.companyName"								: 1,
				"vendorDetails.commisionPercent"							: 1,
				"createdAt"														: 1,
			}
		}	
	])
	.then(async(data) => {
		// console.log("data => ",data);		
		if(data && data.length > 0){
			var returnData = [];
			for (var i = 0; i < data.length; i++) {
				var commisionPercent = 0;
				if (data[i].vendorDetails !== null && data[i].vendorDetails !== undefined) {
					if (data[i].vendorDetails.commisionPercent !== undefined) {
						commisionPercent = data[i].vendorDetails.commisionPercent;
					}
				}
				
				returnData.push({
					_id 						: data[i]._id,
					orderID 					: data[i].orderID,
					orderDate 				: "<div class='whiteSpaceNoWrap'> " + moment(data[i].createdAt).format('MMM Do YYYY') + "</div>" + "<div>" + moment(data[i].createdAt).format('hh:mm a') + "</div>",
					vendorName 				: data[i].vendorDetails.companyName ? data[i].vendorDetails.companyName : "NA",					
					orderAmount       	: "<div class='whiteSpaceNoWrap'> AED " + (data[i].vendorOrders.vendor_afterDiscountTotal ? data[i].vendorOrders.vendor_afterDiscountTotal : 0) + "</div>",
					commissionPercentage : commisionPercent + "%",
					commissionAmount 		: "<div class='whiteSpaceNoWrap'> AED " + (commisionPercent > 0 ? ((data[i].vendorOrders.vendor_afterDiscountTotal * commisionPercent)/100).toFixed(2) : 0) + "</div>",
					deliveryCharges 		: "<div class='whiteSpaceNoWrap'> AED " + (data[i].vendorOrders.vendor_shippingChargesAfterDiscount ? data[i].vendorOrders.vendor_shippingChargesAfterDiscount : 0) + "</div>",
					totalAmount 			: "<div class='whiteSpaceNoWrap'> AED " + (data[i].vendorOrders.vendor_afterDiscountTotal ? ((data[i].vendorOrders.vendor_afterDiscountTotal - (commisionPercent > 0 ? ((data[i].vendorOrders.vendor_afterDiscountTotal * commisionPercent)/100) : 0))).toFixed(2) : 0) + "</div>"
					// totalAmount 			: data[i].vendorOrders.vendor_netPayableAmount ? data[i].vendorOrders.vendor_netPayableAmount : 0
				})	
			}
			if (i >= data.length) {				
				res.status(200).json({					
					data 			: returnData.slice(req.body.startRange, req.body.startRange + req.body.limitRange),
					dataCount 	: data.length
				});
			}
			
		}else{
			res.status(200).json({					
				data 			: data,
				dataCount 	: 0
			});
		}			
	})
	.catch(err => {
	   console.log(err);
	   res.status(500).json({
		 error: err
	   });
	});
};

// ---------------- Delivery Driver Reports ----------------
exports.delivery_drivers_reports = (req, res, next) => {
	
	console.log("delivery_drivers_reports => ",req.body);
	var selector        = {};
	selector['$and']    = [];
	
	/**----------- Date Filter ------------ */	
	// console.log("start => ",moment(new Date(req.body.startDate)).startOf('day').toDate())	
	// console.log("end => ",moment(new Date(req.body.endDate)).endOf('day').toDate())	
	if(req.body.startDate && req.body.endDate){       
		selector["$and"].push({
			"vendorOrders.deliveryStatus" : 
			{"$elemMatch" : 
				{
					"status" 			: "Delivered",
					"timestamp" 		: {
						$gte 	: moment(new Date(req.body.startDate)).startOf('day').toDate(),
						$lte 	: moment(new Date(req.body.endDate)).endOf('day').toDate()
					}
				}
			}		
		})
	}

	/**----------- Vendor Filter ------------ */		
	if(req.body.vendor && req.body.vendor !== "" && req.body.vendor !== undefined && req.body.vendor !== null){       
		selector["$and"].push({
			'vendorOrders.vendor_id' : ObjectId(req.body.vendor)			 
		})
	}

	/**----------- Seach Orders by OrderID, VendorName, User Name etc. ------------ */
	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push({ "$vendorDetails.companyName" : {'$regex' : req.body.searchText , $options: "i" } });
		selector["$and"].push({ 
			"$or" : [
						{ "orderID" 								: parseInt(req.body.searchText) },
						{ "vendorDetails.companyName" 		: {'$regex' : req.body.searchText , $options: "i" } },
						{ "driverDetails.profile.fullName" 	: {'$regex' : req.body.searchText , $options: "i" } },
						{ "deliveryAddress.name" 				: {'$regex' : req.body.searchText , $options: "i" } },
						{ "userFullName" 							: {'$regex' : req.body.searchText , $options: "i" } },
					]
		})
	}
	console.log("selector =>",selector)
	
  	Orders.aggregate([
		{ "$unwind" : "$vendorOrders"},
		{ "$lookup" : 
			{
				"from"			: "users",
				"as"				: "driverDetails",
				"localField"	: "vendorOrders.paymentDetails.deliveryPerson_id",
				"foreignField"	: "_id"
			}
		},
		{ "$unwind" : "$driverDetails" },
		{ "$lookup" : 
			{
				"from"			: "entitymasters",
				"as"				: "vendorDetails",
				"localField"	: "vendorOrders.vendor_id",
				"foreignField"	: "_id"
			}
		},
		{ "$unwind" : "$vendorDetails" },
		{ $match : selector},
		{ $match : {
			"vendorOrders.deliveryStatus" : 
			{"$elemMatch" : 
				{
					"status" 			: "Delivered",
					"timestamp" 		: {
						$gte 	: moment(new Date(req.body.startDate)).startOf('day').toDate(),
						$lte 	: moment(new Date(req.body.endDate)).endOf('day').toDate()
					}
				}
			}		
		}},
		{ "$project" : 
			{
				"_id"																: 1,
				"orderID"														: 1,
				"userFullName"													: 1,
				"deliveryAddress"												: 1,
				"vendorOrders.orderStatus"									: 1,
				"vendorOrders.paymentDetails.amountPaid"				: 1,
				"vendorOrders.paymentDetails.modeOfPayment"			: 1,
				"vendorOrders.paymentDetails.deliveryPerson_id"		: 1,
				"vendorOrders.vendor_netPayableAmount"					: 1,
				"vendorOrders.deliveryStatus"								: 1,
				"driverDetails.profile.employeeID"						: 1,
				"vendorDetails.companyName"								: 1,
				"createdAt"														: 1,
			}
		}	
	])
	.then(async(data) => {
		// console.log("data => ",data);		
		if(data && data.length > 0){
			var returnData = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].vendorOrders.deliveryStatus && data[i].vendorOrders.deliveryStatus.length > 0) {
					// console.log("data[i].vendorOrders.deliveryStatus => ",data[i].vendorOrders.deliveryStatus)
					// console.log("data[i].vendorOrders.paymentDetails.deliveryPerson_id => ",data[i].vendorOrders.paymentDetails.deliveryPerson_id)
					var getPickupDateAndTime = data[i].vendorOrders.deliveryStatus.filter(deliveryStatus => (deliveryStatus.status === 'On the Way' && String(deliveryStatus.statusUpdatedBy) === String(data[i].vendorOrders.paymentDetails.deliveryPerson_id)));
					// console.log("getPickupDateAndTime=> ",getPickupDateAndTime)
					if(getPickupDateAndTime && getPickupDateAndTime.length > 0){
						var pickupDateAndTime = getPickupDateAndTime[0].timestamp
					}else{
						var pickupDateAndTime = "NA";
					}

					var getDeliveryDateAndTime = data[i].vendorOrders.deliveryStatus.filter(deliveryStatus => (deliveryStatus.status === 'Delivered' && String(deliveryStatus.statusUpdatedBy) === String(data[i].vendorOrders.paymentDetails.deliveryPerson_id)));
					// console.log("getDeliveryDateAndTime=> ",getDeliveryDateAndTime)
					if(getDeliveryDateAndTime && getDeliveryDateAndTime.length > 0){
						var deliveryDateAndTime = getDeliveryDateAndTime[0].timestamp
					}else{
						var deliveryDateAndTime = "NA";
					}

					if (pickupDateAndTime && pickupDateAndTime !== "NA" && deliveryDateAndTime && deliveryDateAndTime !== "NA") {
						// var startDateTime 				= moment(pickupDateAndTime, "DD/MM/YYYY HH:mm").format("DD/MM/YYYY HH:mm");
			   //      	var endDateTime   				= moment(deliveryDateAndTime, "DD/MM/YYYY HH:mm").format("DD/MM/YYYY HH:mm");

			   //      	var ms            				= moment(endDateTime,"DD/MM/YYYY HH:mm").diff(moment(startDateTime,"DD/MM/YYYY HH:mm"));
			   //      	var duration      				= moment.duration(ms);
			   //      	var timeDiffrence 				= Math.floor(duration.asHours()) + moment.utc(ms).format(":mm");
						// var timeRequiredForDelivery 	= timeDiffrence + " Hours";
						var diff 	= moment.duration(moment(deliveryDateAndTime).diff(moment(pickupDateAndTime)));

						var days 	= parseInt(diff.asDays()); //84

						var hours 	= parseInt(diff.asHours()); //2039 hours, but it gives total hours in given miliseconds which is not expacted.

						hours 		= hours - days*24;  // 23 hours

						var minutes = parseInt(diff.asMinutes()); //122360 minutes,but it gives total minutes in given miliseconds which is not expacted.

						minutes 		= minutes - (days*24*60 + hours*60); //20 minutes.
						
						var timeRequiredForDelivery 	= (days > 0 ? days + " Days, " : "") + (hours > 0 ? hours + " Hours, " : "") + (minutes + " Minutes");
					}else{
						var timeRequiredForDelivery 	= "NA";
					}
				}
				returnData.push({
					_id 							: data[i]._id,
					driverID    				: data[i].driverDetails.profile.employeeID ? data[i].driverDetails.profile.employeeID : "",
					driverName    				: data[i].driverDetails.profile.fullName &&  data[i].driverDetails.profile.fullName !== undefined && data[i].driverDetails.profile.fullName !== "" ? data[i].driverDetails.profile.fullName : "NA",
					orderID 						: data[i].orderID,
					orderDate 					: "<div class='whiteSpaceNoWrap'> " + moment(data[i].createdAt).format('MMM Do YYYY') + "</div>" + "<div>" + moment(data[i].createdAt).format('hh:mm a') + "</div>",
					vendorName 					: data[i].vendorDetails.companyName ? data[i].vendorDetails.companyName : "NA",					
					customerName    			: data[i].userFullName &&  data[i].userFullName !== "undefined undefined" &&  data[i].userFullName !== undefined &&  data[i].userFullName !== null && data[i].userFullName !== "" 
														? 
															data[i].userFullName 
														: 
															(data[i].deliveryAddress.name &&  data[i].deliveryAddress.name !== undefined &&  data[i].deliveryAddress.name !== null && data[i].deliveryAddress.name !== "" 
															?
															 	data[i].deliveryAddress.name
															:
																"Guest User"),
					pickupDateAndTime    	: pickupDateAndTime !== "NA" ? ( "<div class='whiteSpaceNoWrap'> " + moment(pickupDateAndTime).format('MMM Do YYYY') + "</div>" + "<div>" + moment(pickupDateAndTime).format('hh:mm a') + "</div>" ) : pickupDateAndTime ,
					deliveryDateAndTime  	: deliveryDateAndTime !== "NA" ? ( "<div class='whiteSpaceNoWrap'> " + moment(deliveryDateAndTime).format('MMM Do YYYY') + "</div>" + "<div>" + moment(deliveryDateAndTime).format('hh:mm a') + "</div>" ) : deliveryDateAndTime,
					timeRequiredForDelivery : timeRequiredForDelivery,
					paymentMethod 				: data[i].vendorOrders.paymentDetails && data[i].vendorOrders.paymentDetails !== undefined && data[i].vendorOrders.paymentDetails !== null 
														? 
															data[i].vendorOrders.paymentDetails.modeOfPayment
														:
															"NA",
					cashCollected 				:  "<div class='whiteSpaceNoWrap'> AED " + ( data[i].vendorOrders.paymentDetails && data[i].vendorOrders.paymentDetails !== undefined && data[i].vendorOrders.paymentDetails !== null 
														? 
															( data[i].vendorOrders.paymentDetails.modeOfPayment.toLowerCase() === 'cash on delivery' ? data[i].vendorOrders.paymentDetails.amountPaid : 0 )
														:
															0 ) + "</div>",
					totalAmount 				: "<div class='whiteSpaceNoWrap'> AED " + (data[i].vendorOrders.vendor_netPayableAmount ? data[i].vendorOrders.vendor_netPayableAmount : 0 )  + "</div>"
				})	
			}
			if (i >= data.length) {				
				res.status(200).json({					
					data 			: returnData.slice(req.body.startRange, req.body.limitRange),
					dataCount 	: data.length
				});
			}
			
		}else{
			res.status(200).json({					
				data 			: data,
				dataCount 	: 0
			});
		}			
	})
	.catch(err => {
	   console.log(err);
	   res.status(500).json({
		 error: err
	   });
	});
};
// ---------------- Vendor Sales Reports ----------------
exports.vendor_sales_reports = (req, res, next) => {
	
	console.log("vendor_sales_reports => ",req.body);
	var selector        = {};
	selector['$and']    = [];
	
	/**----------- Date Filter ------------ */		
	if(req.body.startDate && req.body.endDate){       
		selector["$and"].push({
			createdAt: {
				$gte : moment(req.body.startDate).startOf('day').toDate(),
				$lte : moment(req.body.endDate).endOf('day').toDate()
			 }
		})
	}
	/**----------- Section Filter ------------ */		
	if(req.body.section && req.body.section !== "" && req.body.section !== null && req.body.section !== undefined){       
		selector["$and"].push({
			"vendorOrders.products.section_ID" : ObjectId(req.body.section)
		})
	}
	/**----------- Category Filter ------------ */		
	if(req.body.category && req.body.category !== "" && req.body.category !== null && req.body.category !== undefined){       
		selector["$and"].push({
			"vendorOrders.products.category_ID" : ObjectId(req.body.category)
		})
	}
	/**----------- SubCategory Filter ------------ */		
	if(req.body.subCategory && req.body.subCategory !== "" && req.body.subCategory !== null && req.body.subCategory !== undefined){       
		selector["$and"].push({
			"vendorOrders.products.subCategory_ID" : req.body.subCategory
		})
	}
	/**----------- Vendor Filter ------------ */		
	if(req.body.vendor && req.body.vendor !== "" && req.body.vendor !== null && req.body.vendor !== undefined){       
		selector["$and"].push({
			"vendorOrders.vendor_id" : ObjectId(req.body.vendor)
		})
	}

	/**----------- Seach Orders by VendorName, Section, Category, SubCategory etc. ------------ */
	if(req.body.searchText && req.body.searchText !== ""){
		selector["$and"].push({ 
			"$or" : [
				{ "vendorDetails.companyName" 	: {'$regex' : req.body.searchText , $options: "i" } },
				{ "vendorOrders.products.section" : {'$regex' : req.body.searchText , $options: "i" } },
				{ "vendorOrders.products.category" : {'$regex' : req.body.searchText , $options: "i" } },
				{ "vendorOrders.products.subCategory" : {'$regex' : req.body.searchText , $options: "i" } },
				{ "vendorOrders.products.productName" : {'$regex' : req.body.searchText , $options: "i" } }
			]
		})
	}
	
// console.log("selector => ",selector)

  	Orders.aggregate([
		{ "$unwind" 	: "$vendorOrders"},
		{ "$unwind" 	: "$vendorOrders.products" },
		{ "$lookup" 	: 
			{
				"from"			: "entitymasters",
				"as"				: "vendorDetails",
				"localField"	: "vendorOrders.vendor_id",
				"foreignField"	: "_id"
			}
		},
		{ "$unwind" 	: "$vendorDetails" },
		{ "$match" 		: selector},
		{ "$group": 
			{
	        	"_id": {
	            "vendor_id" 	: "$vendorOrders.vendor_id",
	            "product_id"	: "$vendorOrders.products.product_ID",
	            "orderDate"		: "createdAt"
	        	},
	        "numberOfOrders"	: { "$sum" : 1 },
	        "productQuantity"	: { "$sum" : "$vendorOrders.products.quantity" },
	        "totalAmount"		: { "$sum" : "$vendorOrders.products.discountedPrice" },
	        "orderData"    		: { "$push": "$$ROOT" }
	    	}
	   },
		{ "$project" 	: 
			{
				"orderData._id"																: 1,
				"orderData.vendorOrders.vendor_id"										: 1,
				"orderData.vendorOrders.orderStatus"									: 1,
				"orderData.vendorOrders.products"										: 1,
				"numberOfOrders"																: 1,
				"productQuantity"																: 1,
				"totalAmount"																	: 1,
				"orderData.vendorDetails.companyName"									: 1,
				"orderData.createdAt"														: 1,
			}
		}	
	])
	.then(async(data) => {
		// console.log("data => ",data);		
		if(data && data.length > 0){
			var returnData = [];
			for (var i = 0; i < data.length; i++) {
				// console.log("data i => ",i ," - ", data[i].orderData)
				returnData.push({
					_id 						: data[i].orderData[0]._id,
					productName         	: "<div><b>" + data[i].orderData[0].vendorOrders.products.productName + "</b></br>" + 
													"ProductCode : " + data[i].orderData[0].vendorOrders.products.productCode + "</br>" +
													"ItemCode : " + data[i].orderData[0].vendorOrders.products.itemCode + "</br>" +
					 								"</div>", 
					vendorName    			: data[i].orderData[0].vendorDetails.companyName ? data[i].orderData[0].vendorDetails.companyName : "NA",
					section    				: data[i].orderData[0].vendorOrders.products.section,
					category    			: data[i].orderData[0].vendorOrders.products.category ? data[i].orderData[0].vendorOrders.products.category : data[i].orderData[0].vendorOrders.products.category,
					subCategory    		: data[i].orderData[0].vendorOrders.products.subCategory ? data[i].orderData[0].vendorOrders.products.subCategory : "",
					orderDate 				: "<div class='whiteSpaceNoWrap'>" + moment(data[i].orderData[0].createdAt).format('MMM Do YYYY') + "</div>",
					numberOfOrders 		: data[i].numberOfOrders,
					productQuantity 		: data[i].productQuantity,
					totalAmount 			: "<div class='whiteSpaceNoWrap'> AED " + (data[i].totalAmount).toFixed(2) + "</div>"				
				})	
			}
			if (i >= data.length) {	
				// console.log("returnData => ",returnData)			
				res.status(200).json({					
					dataCount 	: returnData.length,
					data 			: returnData.slice(req.body.startRange, req.body.limitRange),
				});
			}
			
		}
		else{
			res.status(200).json({					
				data 			: data,
				dataCount 	: 0
			});
		}			
	})
	.catch(err => {
	   console.log(err);
	   res.status(500).json({
		 error: err
	   });
	});
};