const mongoose					= require("mongoose");
const ReturnedProducts 		= require('./ModelMVMP');
const User 						= require('../../coreAdmin/userManagementnew/ModelUsers.js');
const Products 				= require('../products/Model');
const Orders 					= require('../orders/ModelMVMP');
const CreditPoints 			= require('../CreditPoints/Model.js');
const moment           		= require('moment-timezone');
var ObjectId            	= require('mongodb').ObjectID;
const ProductInventory 		= require('../ProductInventory/Model.js');
const CreditPointsPolicy 	= require('../CreditPointsPolicy/Model.js');
const sendNotification 			= require("../../coreAdmin/notificationManagement/SendNotification.js");


exports.get_returned_products = (req,res,next)=>{
	console.log("req.body => ",req.body)
	var selector        = {};
	selector['$and']    = [];

	if(req.body.vendor !== "" && req.body.vendor !== undefined){
		selector["$and"].push(
			{"vendor_id" : ObjectId(req.body.vendor)}
		)
	}
	if(req.body.section !== "" && req.body.section !== undefined){
		selector["$and"].push(
			{"section_id" : ObjectId(req.body.section)}
		)
	}
	if(req.body.category !== "" && req.body.category !== undefined){
		selector["$and"].push(
			{"category_id" : ObjectId(req.body.category)}
		)
	}
	if(req.body.subCategory !== "" && req.body.subCategory !== undefined){
		selector["$and"].push(
			{"subCategory_id" : ObjectId(req.body.subCategory)}
		)
	}
	if(req.body.returnStatus !== "" && req.body.returnStatus !== undefined){
		selector["$and"].push(
			{"returnStatus" : req.body.returnStatus}
		)
	}else{
		selector["$and"].push(
			{"returnStatus" : {$ne : ""}}
		)
	}

	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push({ "$vendorDetails.companyName" : {'$regex' : req.body.searchText , $options: "i" } });
		selector["$and"].push({ 
			"$or" : [
						{ "orderID" 												: parseInt(req.body.searchText) },
						{ "vendorDetails.companyName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "userDetails.profile.fullName" 					: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productDetails.productName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "sectionDetails.section" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.category" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.subCategory.subCategoryTitle": {'$regex' : req.body.searchText , $options: "i" } },
						{ "productDetails.productCode"						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productDetails.itemCode"							: {'$regex' : req.body.searchText , $options: "i" } },
					]
		})
	}
	// console.log("selector => ",selector)

	ReturnedProducts.aggregate([
		
		{ $lookup:
			{
				from 				: 'products',
				localField 		: 'product_id',
				foreignField 	: '_id',
				as 				: 'productDetails'
			} 
		},
		{ $lookup : 
			{
				from 					: 'entitymasters',
				localField 			: 'vendor_id',
				foreignField 		: '_id',
				as 					: 'vendorDetails'
			}
		},
		{ $lookup : {
				from 					: 'users',
				localField 			: 'user_id',
				foreignField 		: '_id',
				as 					: 'userDetails'
			}
		},		
		{ $lookup : {
				from 					: 'sections',
				localField 			: 'section_id',
				foreignField 		: '_id',
				as 					: 'sectionDetails'
			}
		},
		{ $lookup : {
				from 					: 'categories',
				localField 			: 'category_id',
				foreignField 		: '_id',
				as 					: 'categoryDetails'
			}
		},
		{$match : selector},		
		{$sort: 
			{
				"createdAt": -1
			}
		}
	])
	// .skip(parseInt(req.body.startRange))
	// .limit(parseInt(req.body.limitRange))
	.then(data=>{
		// console.log("data = > ",data)
		res.status(200).json({
			dataCount 	: data.length,
			data 			: data.slice(parseInt(req.body.startRange), (parseInt(req.body.limitRange) + parseInt(req.body.startRange)))
		});
	})
	.catch(err =>{
		res.status(500).json({error: err});
	});
};

/*=========== Get Single Returned Product ===========*/
exports.get_single_returned_product = (req,res,next)=>{
	// console.log("req.params.return_id => ",req.params.return_id)
	ReturnedProducts.findOne({"_id" : ObjectId(req.params.return_id)})
	.populate("product_id")
	.populate("vendor_id")
	.populate("user_id")
	.exec()
	.then(async(data)=>{
		// console.log("data => ",data)
		if(data && data !== undefined){
			if (data.vendor_id && data.vendor_id !== null) {
				var vendorLocation 	= await data.vendor_id.locations.find(location => String(location._id) === String(data.vendorLocation_id));
				var vendorContact 	= vendorLocation && vendorLocation !== undefined 
											  ?
											  		data.vendor_id.contactPersons.find(contactPerson => contactPerson.branchCode === vendorLocation.branchCode)
											  :
											  		null
			}

			var returnData = {
				orderID 						: data.orderID,
				product_id 					: data.product_id && data.product_id !== null ? data.product_id._id : "",
				productName 				: data.product_id && data.product_id !== null ? data.product_id.productName : "",
				productCode 				: data.product_id && data.product_id !== null ? data.product_id.productCode : "",
				itemCode 					: data.product_id && data.product_id !== null ? data.product_id.itemCode : "",
				section 						: data.product_id && data.product_id !== null ? data.product_id.section : "",
				category 					: data.product_id && data.product_id !== null ? data.product_id.category : "",
				subCategory 				: data.product_id && data.product_id !== null ? data.product_id.subCategory : "",
				size 							: data.product_id && data.product_id !== null ? data.product_id.size : "",
				color 						: data.product_id && data.product_id !== null ? data.product_id.color : "",
				unit 							: data.product_id && data.product_id !== null ? data.product_id.unit : "",
				vendor_id 					: data.vendor_id && data.vendor_id !== null ? data.vendor_id._id : "",
				vendorName 					: data.vendor_id && data.vendor_id !== null ? data.vendor_id.companyName : "",
				vendorLocation_id 		: data.vendorLocation_id,
				vendorLocation 			: vendorLocation ? vendorLocation : {},
				vendorContact  			: vendorContact ? vendorContact : "",
				dateOfPurchase 			: data.dateOfPurchase, 
				dateOfReturnRequested 	: data.createdAt,
				adminComments 				: data.adminComments,
				vendorComment 				: data.vendorComment,
				user_id 						: data.user_id && data.user_id !== null ? data.user_id._id : "",
				customerName 				: data.user_id && data.user_id !== null ? data.user_id.profile.fullName : "",
				customerEmail 				: data.user_id && data.user_id !== null ? data.user_id.profile.email : "",
				customerMobile 			: data.user_id && data.user_id !== null ? data.user_id.profile.mobile : "",
				customerComment     		: data.customerComment,
				reasonForReturn 			: data.reasonForReturn,
				returnProductImages 		: data.returnProductImages,
				returnStatus 				: data.returnStatus,
				returnStatusLog 			: data.returnStatusLog
			}
			res.status(200).json(returnData);
		}else{
			res.status(200).json(data);
		}	
		// console.log("returnData => ",returnData)	
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

/*=========== Change Review Status ===========*/
exports.return_status_update = (req, res, next) => {	
	console.log("req.body => ",req.body);
	/*
		1. Return Approved
		2. Return Rejected
			|-> First time Reject
			|-> First Approved and then Rejected
		3. Return Completed
	*/
	/**--- 1. Update return status of product ---*/
	ReturnedProducts.updateOne(
		{ _id : ObjectId(req.body.return_id)},
		{
			$set 	: { returnStatus : req.body.returnStatus },
			$push : 
				{returnStatusLog :
					{
						status 		: req.body.returnStatus,
						statusBy 	: req.body.user_id,
						date 			: new Date()
					},
				'adminComments' : 
					{
						comment 		: req.body.comment,
						commentBy 	: req.body.commentBy,
						commentedOn : new Date()
					}
				}			
		}
	)
	.exec()
	.then(async(data) => {
		// console.log("data => ",data)
		if(data.nModified === 1){
			if(req.body.returnStatus === "Return Request Approved"){
				/**--- 2. Find Product in Return Collection ---*/
				var returnProductData = await ReturnedProducts.findOne({"_id" : ObjectId(req.body.return_id)},{order_id : 1, product_id : 1, vendor_id : 1, user_id : 1, refundMode : 1});            
				console.log("returnProductData => ",returnProductData)
				
				/**--- 3. Find Order in Order Collection ---*/
				Orders.findOne({ _id: ObjectId(returnProductData.order_id)})
				.then(async(orderdata) => {	

					var order_beforeDiscountTotal   	= orderdata.paymentDetails.beforeDiscountTotal;
					var order_afterDiscountTotal    	= orderdata.paymentDetails.afterDiscountTotal;
					var order_discountAmount        	= orderdata.paymentDetails.discountAmount;
					var order_taxAmount             	= orderdata.paymentDetails.taxAmount;
					var order_numberOfProducts 		= orderdata.order_numberOfProducts;
					var order_quantityOfProducts 		= orderdata.order_quantityOfProducts;
					var afterDiscountCouponAmount 	= orderdata.paymentDetails.afterDiscountCouponAmount;
					var order_shippingCharges       	= 0;
					var maxServiceCharges           	= 0; 
					var netPayableAmount 				= orderdata.paymentDetails.netPayableAmount;
					var couponCancelMessage 			= "";
					
					// var maxServiceChargesData = await StorePreferences.findOne({},{maxServiceCharges : 1});            
					// if(maxServiceChargesData !== null){
					// 	maxServiceCharges = maxServiceChargesData.maxServiceCharges;
					// }
					
					/**--- 4. Calculate order amount again ---*/
					for (var i = 0; i < orderdata.vendorOrders.length; i++) {				
						order_shippingCharges = order_shippingCharges + orderdata.vendorOrders[i].vendor_shippingCharges;
						
						if(String(orderdata.vendorOrders[i].vendor_id) === String(returnProductData.vendor_id)){
							var vendor_numberOfProducts 		= orderdata.vendorOrders[i].vendor_numberOfProducts;
							var vendor_quantityOfProducts 	= orderdata.vendorOrders[i].vendor_quantityOfProducts;
							var vendor_beforeDiscountTotal 	= orderdata.vendorOrders[i].vendor_beforeDiscountTotal;
							var vendor_afterDiscountTotal 	= orderdata.vendorOrders[i].vendor_afterDiscountTotal;
							var vendor_discountAmount 			= orderdata.vendorOrders[i].vendor_discountAmount;
							var vendor_taxAmount 				= orderdata.vendorOrders[i].vendor_taxAmount;


							console.log("before order_beforeDiscountTotal => ", order_beforeDiscountTotal)
							console.log("before order_afterDiscountTotal => ", order_afterDiscountTotal)
							console.log("before order_discountAmount => ", order_discountAmount)
							console.log("before order_taxAmount => ", order_taxAmount)
							console.log("before order_quantityOfProducts => ", order_quantityOfProducts)
							console.log("before order_numberOfProducts => ", order_numberOfProducts)
							console.log("before netPayableAmount => ", netPayableAmount)

							for (let j = 0; j < orderdata.vendorOrders[i].products.length; j++) {
								if(String(orderdata.vendorOrders[i].products[j].product_ID) === String(returnProductData.product_id)){
									order_beforeDiscountTotal   	-= (orderdata.vendorOrders[i].products[j].originalPrice * orderdata.vendorOrders[i].products[j].quantity);
									order_afterDiscountTotal    	-= (orderdata.vendorOrders[i].products[j].discountedPrice * orderdata.vendorOrders[i].products[j].quantity);
									order_discountAmount        	-= (orderdata.vendorOrders[i].products[j].originalPrice - orderdata.vendorOrders[i].products[j].discountedPrice) * orderdata.vendorOrders[i].products[j].quantity;
									order_taxAmount             	-= orderdata.vendorOrders[i].products[j].taxAmount ? (orderdata.vendorOrders[i].products[j].taxAmount * orderdata.vendorOrders[i].products[j].quantity) : 0;
									order_shippingCharges 			-= 0;
									order_numberOfProducts 			-= 1;
									order_quantityOfProducts 		-= orderdata.vendorOrders[i].products[j].quantity;
									netPayableAmount 					-= (orderdata.vendorOrders[i].products[j].discountedPrice * orderdata.vendorOrders[i].products[j].quantity);
									
									if(orderdata.vendorOrders[i].products.length > 1){
										vendor_numberOfProducts 		-= 1;
										vendor_quantityOfProducts 		-= orderdata.vendorOrders[i].products[j].quantity;
										vendor_beforeDiscountTotal 	-= (orderdata.vendorOrders[i].products[j].originalPrice * orderdata.vendorOrders[i].products[j].quantity);
										vendor_afterDiscountTotal 		-= (orderdata.vendorOrders[i].products[j].discountedPrice * orderdata.vendorOrders[i].products[j].quantity);
										vendor_discountAmount 			-= (orderdata.vendorOrders[i].products[j].originalPrice - orderdata.vendorOrders[i].products[j].discountedPrice) * orderdata.vendorOrders[i].products[j].quantity;
										vendor_taxAmount 					-= orderdata.vendorOrders[i].products[j].taxAmount ? (orderdata.vendorOrders[i].products[j].taxAmount * orderdata.vendorOrders[i].products[j].quantity) : 0;													
									}		

									console.log("After order_beforeDiscountTotal => ", order_beforeDiscountTotal)
									console.log("After order_afterDiscountTotal => ", order_afterDiscountTotal)
									console.log("After order_discountAmount => ", order_discountAmount)
									console.log("After order_taxAmount => ", order_taxAmount)
									console.log("After order_quantityOfProducts => ", order_quantityOfProducts)
									console.log("After order_numberOfProducts => ", order_numberOfProducts)
									console.log("After netPayableAmount => ", netPayableAmount)

								}
							}
							// order_beforeDiscountTotal   -=  orderdata.vendorOrders[i].vendor_beforeDiscountTotal;
							// order_afterDiscountTotal    -=  orderdata.vendorOrders[i].vendor_afterDiscountTotal;
							// order_discountAmount        -=  orderdata.vendorOrders[i].vendor_discountAmount;
							// order_taxAmount             -=  orderdata.vendorOrders[i].vendor_taxAmount;
							// order_shippingCharges 		-= (orderdata.vendorOrders[i].vendor_shippingCharges).toFixed(2);
							// order_numberOfProducts 		-= (orderdata.vendorOrders[i].vendor_numberOfProducts).toFixed(2);
							// order_quantityOfProducts 	-= (orderdata.vendorOrders[i].vendor_quantityOfProducts).toFixed(2);

							// var vendor_order_afterDiscountTotal = orderdata.vendorOrders[i].vendor_afterDiscountTotal;
							// var vendor_order_shippingCharges 	= orderdata.vendorOrders[i].vendor_shippingCharges;
							// var vendor_netPayableAmount 		= orderdata.vendorOrders[i].vendor_afterDiscountTotal;					
						}				
					}
					// if(i >= orderdata.vendorOrders.length){
					// 	/*----------- Apply Shipping charges not greter than max Shipping Charges -----------*/
					// 	order_shippingCharges   = (maxServiceCharges && maxServiceCharges > 0 
					// 								? 
					// 									maxServiceCharges > order_shippingCharges 
					// 									? 
					// 										order_shippingCharges
					// 									: 
					// 										maxServiceCharges 
					// 								: 
					// 									order_shippingCharges);
						
					// 	if (orderdata.paymentDetails.disocuntCoupon_id && orderdata.paymentDetails.disocuntCoupon_id !== undefined) {
							
					// 		var isCouponValid  	= await fetchCouponData(orderdata.paymentDetails.disocuntCoupon_id); 
					// 		// console.log("isCouponValid => ",isCouponValid)                   
							
					// 		if (isCouponValid.code === "FAILED") {
					// 			couponCancelMessage         = isCouponValid.message;
					// 			netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + order_shippingCharges).toFixed(2);			
					// 			afterDiscountCouponAmount   = 0;
					// 		}else{ 
					// 			/*---- Check for Min Puchase amount for Coupon to be applied ----*/
					// 			if(parseFloat(order_afterDiscountTotal) > parseFloat(isCouponValid.dataObj.minPurchaseAmount)){
			
					// 				if ((isCouponValid.dataObj.couponin).toLowerCase() === "percent") {
					// 					var discountInPercent   = (order_afterDiscountTotal * isCouponValid.dataObj.couponvalue) / 100;								
										
					// 					/*------  Check for Applicable Maximum Discount Amount -------*/
					// 					var discoutAfterCouponApply     =   isCouponValid.dataObj.maxDiscountAmount 
					// 														? 
					// 															discountInPercent < isCouponValid.dataObj.maxDiscountAmount 
					// 															? 
					// 																discountInPercent 
					// 															:   
					// 																isCouponValid.dataObj.maxDiscountAmount 
					// 														: 
					// 															discountInPercent;
					// 					afterDiscountCouponAmount   	= (discoutAfterCouponApply).toFixed(2);
					// 					netPayableAmount            	= ((order_afterDiscountTotal - discoutAfterCouponApply) + order_taxAmount + order_shippingCharges).toFixed(2);                       
			
					// 				}else if((isCouponValid.dataObj.couponin).toLowerCase() === "amount"){
										
					// 					/*------  Check for Applicable Maximum Discount Amount -------*/
					// 					var discoutAfterCouponApply     =   isCouponValid.dataObj.maxDiscountAmount 
					// 														? 
					// 															isCouponValid.dataObj.couponvalue < isCouponValid.dataObj.maxDiscountAmount 
					// 															? 
					// 																(isCouponValid.dataObj.couponvalue).toFixed(2) 
					// 															: 
					// 																isCouponValid.dataObj.maxDiscountAmount 
					// 														: 
					// 															(isCouponValid.dataObj.couponvalue).toFixed(2);
								
					// 					afterDiscountCouponAmount   	= (discoutAfterCouponApply).toFixed(2);
					// 					netPayableAmount    			= ((order_afterDiscountTotal - discoutAfterCouponApply) + order_taxAmount + order_shippingCharges).toFixed(2);	
					// 				}    
					// 			}else{
					// 				netPayableAmount            = (order_afterDiscountTotal + order_taxAmount + order_shippingCharges).toFixed(2);							
					// 				afterDiscountCouponAmount   = 0;
					// 				couponCancelMessage 		= "This Coupon Code is Only Applicable if Minimum Cart Amount is "+ isCouponValid.dataObj.minPurchaseAmount	
					// 			}	
					// 		}			
					// 	}else{
					// 		netPayableAmount = (order_afterDiscountTotal + order_taxAmount + order_shippingCharges).toFixed(2);						
					// 	}
					// }			
					// console.log("order_beforeDiscountTotal => ",order_beforeDiscountTotal);
					// console.log("order_afterDiscountTotal => ",order_afterDiscountTotal);
					// console.log("order_discountAmount => ",order_discountAmount);
					// console.log("order_taxAmount => ",order_taxAmount);
					// console.log("netPayableAmount => ",netPayableAmount);		
					// console.log("afterDiscountCouponAmount => ",afterDiscountCouponAmount);
					// console.log("order_shippingCharges => ",order_shippingCharges);
					// console.log("maxServiceCharges => ",maxServiceCharges);
					// console.log("order_numberOfProducts => ",order_numberOfProducts);
					// console.log("order_quantityOfProducts => ",order_quantityOfProducts);
					// console.log("couponCancelMessage => ",couponCancelMessage);			
					
					// console.log("vendor_numberOfProducts => ",vendor_numberOfProducts);			
					// console.log("vendor_quantityOfProducts => ",vendor_quantityOfProducts);			
					// console.log("vendor_beforeDiscountTotal => ",vendor_beforeDiscountTotal);			
					// console.log("vendor_afterDiscountTotal => ",vendor_afterDiscountTotal);			
					// console.log("vendor_discountAmount => ",vendor_discountAmount);			
					// console.log("vendor_taxAmount => ",vendor_taxAmount);

					/**--- 5. Update newly calculated order amount ---*/

					console.log("3 order_beforeDiscountTotal => ", order_beforeDiscountTotal)
					console.log("3 order_afterDiscountTotal => ", order_afterDiscountTotal)
					console.log("3 order_discountAmount => ", order_discountAmount)
					console.log("3 order_taxAmount => ", order_taxAmount)
					console.log("3 order_quantityOfProducts => ", order_quantityOfProducts)
					console.log("3 order_numberOfProducts => ", order_numberOfProducts)
					console.log("3 netPayableAmount => ", netPayableAmount)

					Orders.updateOne(
						{ _id: ObjectId(returnProductData.order_id), 'vendorOrders.vendor_id' : ObjectId(returnProductData.vendor_id)},		
						{$set:
							{						
								"paymentDetails.beforeDiscountTotal" 							: order_beforeDiscountTotal.toFixed(2),
								"paymentDetails.discountAmount" 									: order_discountAmount.toFixed(2),
								"paymentDetails.afterDiscountTotal" 							: order_afterDiscountTotal.toFixed(2),
								"paymentDetails.taxAmount" 										: order_taxAmount.toFixed(2),
								"paymentDetails.afterDiscountCouponAmount" 					: afterDiscountCouponAmount.toFixed(2),
								"paymentDetails.netPayableAmount" 								: netPayableAmount.toFixed(2),
								"vendorOrders.$.order_numberOfProducts" 						: order_numberOfProducts,
								"vendorOrders.$.order_quantityOfProducts" 					: order_quantityOfProducts,
								"vendorOrders.$.vendor_numberOfProducts" 						: vendor_numberOfProducts,
								"vendorOrders.$.vendor_quantityOfProducts" 					: vendor_quantityOfProducts,
								"vendorOrders.$.vendor_beforeDiscountTotal" 					: vendor_beforeDiscountTotal.toFixed(2),
								"vendorOrders.$.vendor_afterDiscountTotal"  					: vendor_afterDiscountTotal.toFixed(2),
								"vendorOrders.$.vendor_discountAmount" 						: vendor_discountAmount.toFixed(2),
								"vendorOrders.$.vendor_taxAmount" 								: vendor_taxAmount.toFixed(2),
								// 'vendorOrders.$[outer].products.$[inner].productStatus' 	: req.body.returnStatus,						
							},
						},
						{arrayFilters: [
							{ 'outer.vendor_id' : returnProductData.vendor_id }, 
							{ 'inner.product_ID': returnProductData.product_id }
						]}
					)
					.then(async(updatedata) => {
						console.log("updatedata => ",updatedata);
						if (updatedata.nModified === 1) {
							// console.log(" => ",req.body.order_id, " ",orderdata.user_ID," ",orderdata.createdAt," ",vendor_order_afterDiscountTotal," ",vendor_order_shippingCharges," ", vendor_netPayableAmount," ")
							// console.log("returnProductData.order_id *=> ",returnProductData.order_id);
							// console.log("returnProductData.user_id *=> ",returnProductData.user_id);
							// console.log("returnProductData.vendor_id *=> ",returnProductData.vendor_id);
							// console.log("returnProductData.product_id *=> ",returnProductData.product_id);
							
							Orders.updateOne({'_id' : ObjectId(returnProductData.order_id), 'vendorOrders.vendor_id' : ObjectId(returnProductData.vendor_id)},
								{$set:
									{
										'vendorOrders.$[outer].products.$[inner].productStatus' : req.body.returnStatus,
										'vendorOrders.$[outer].products.$[inner].returnedDate'	: new Date(),
									}
								},
								{arrayFilters: [
									{ 'outer.vendor_id' : ObjectId(returnProductData.vendor_id)}, 
									{ 'inner.product_ID': ObjectId(returnProductData.product_id) }
								]}
							)
							.exec()
							.then(updateorderdata => {
								console.log("updateorderdata => ",updateorderdata);
							})
							.catch(err =>{
								console.log("Error While Updating Return Product Status")
								// res.status(500).json({
								// 	error 	: err,
								// 	message : 'Error While Updating Inventory'
								// });
							}); 

							if(req.body.returnStatus === "Return Request Approved"){
								var isOrderCreditAvailable = await CreditPoints.findOne({user_id : ObjectId(returnProductData.user_id), 'transactions.order_id' : ObjectId(returnProductData.order_id), "transactions.typeOfTransaction" : "Original Order"},{'transactions.$' : 1});
								// var isOrderCreditAvailable = await CreditPoints.findOne({"user_id" : ObjectId(returnProductData.user_id), "transactions.order_id" : ObjectId(returnProductData.order_id), "transactions.order_id" });
								// console.log("isOrderCreditAvailable => ",isOrderCreditAvailable)

								var vendorOrder = await orderdata.vendorOrders.filter(vendorOrder => String(vendorOrder.vendor_id) === String(returnProductData.vendor_id));
								// console.log("vendorOrder => ", vendorOrder);
								var returnProduct = await vendorOrder[0].products.filter(product => String(product.product_ID) === String(returnProductData.product_id));
								// console.log("returnProduct => ",returnProduct);

								if(isOrderCreditAvailable !== null){
									await addCreditPoints(returnProductData.order_id, returnProductData.user_id, (returnProduct[0].discountedPrice * returnProduct[0].quantity), 0, (returnProduct[0].discountedPrice * returnProduct[0].quantity), "Return Product Credit", "minus");
								}
								// console.log("returnProductData.refundMode => ",returnProductData.refundMode)
								if(returnProductData.refundMode === "credit"){
									await addCreditPoints(returnProductData.order_id, returnProductData.user_id, (returnProduct[0].discountedPrice * returnProduct[0].quantity), 0, (returnProduct[0].discountedPrice * returnProduct[0].quantity), "Return Product Refund", "add");
								}	
								// console.log("returnProductData.vendor_id => ",returnProductData.vendor_id)
								// console.log("returnProduct[0].productCode => ",returnProduct[0].productCode)
								// console.log("returnProduct[0].itemCode => ",returnProduct[0].itemCode)
								await ProductInventory.updateOne(
									{ vendor_ID : ObjectId(returnProductData.vendor_id), productCode : returnProduct[0].productCode, itemCode : returnProduct[0].itemCode },
									{ $inc :
										{
											currentQuantity   : - returnProduct[0].quantity
										}
									},
									{	$push : {								
											updateLog       : {
												date        : new Date(),
												updatedBy   : ObjectId(req.body.user_id),
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

								var userDetails 		= await User.findOne({"_id" : ObjectId(returnProductData.user_id)});
								var productDetails 	= await Products.findOne({"_id" : ObjectId(returnProductData.product_id)});
								
								if (userDetails && userDetails !== null) {
									var userNotificationValues = {
										"event"			: "ReturnedProductStatus",
										"toUser_id"		: returnProductData.user_id,
										"toUserRole"	: "user",								
										"variables" 	: {
															"userRole" 					: "user",
															"firstName" 				: userDetails.profile.firstName,
															"lastName" 					: userDetails.profile.lastName,
															"fullName" 					: userDetails.profile.fullName,
															"emailId" 					: userDetails.profile.email,
															"mobileNumber"				: userDetails.profile.mobile,
															"productName" 				: productDetails.productName + "( ProductId : " + productDetails.productCode + " ItemId : " + productDetails.itemCode + " )",
															"returnStatus" 			: req.body.returnStatus,
															"returnRequestedDate" 	: moment(new Date).format('MMMM Do YYYY, h:mm:ss a'),
															"statusChangeDate" 		: moment(new Date).format('MMMM Do YYYY, h:mm:ss a')
										}
									}
									// console.log("userNotificationValues => ",userNotificationValues);
									var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);
								}
								res.status(200).json({
									"message" : req.body.returnStatus + ' Successfully.'
								});
							}else{
								res.status(200).json({
									"message" : req.body.returnStatus + ' Successfully.'
								});
							}
						} else {
							console.log("Failed to update Order")
							// res.status(200).json({
							// 	"message": "Order Not Found"
							// });
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
				// ==============

				// res.status(200).json({
				// 	message : req.body.returnStatus + ' Successfully.'
				// });
			}else{
				res.status(200).json({
					message : "Status changed Successfully!"
				});				
			}
		}else{
			res.status(200).json({
				message : req.body.returnStatus + ' Already '
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


/*========== Add Credit Points ==========*/
function addCreditPoints(order_id, user_id, purchaseAmount, shippingCharges, totalAmount, transactionType, method) {
	console.log("user_id=> ",user_id)
	var currDate = new Date();

	return new Promise((resolve,reject)=>{
		CreditPoints.findOne({"user_id" : ObjectId(user_id)})
		.then(async(data)=>{
			// console.log("data => ",data)
			// console.log("data vars => ", order_id, " ", user_id, " ", purchaseAmount, " ", shippingCharges, " ", totalAmount, " ", transactionType, " ", method);
			var creditPolicyData = await CreditPointsPolicy.findOne();
			var expiryLimitInDays = creditPolicyData.expiryLimitInDays;

			// console.log("creditPolicyData => ",creditPolicyData);
			if(transactionType === "Return Product Refund"){
				var earnedCreditPoints = Math.round(((purchaseAmount / creditPolicyData.creditPointValue) * creditPolicyData.creditPoint));
				var expiryDate = moment(currDate, "MM/DD/YYYY").add(100, 'years') ;
			}else{
				var earnedCreditPoints = Math.round(((purchaseAmount / creditPolicyData.purchaseAmount) * creditPolicyData.creditPoint));
				var expiryDate = moment(currDate, "MM/DD/YYYY").add(expiryLimitInDays, 'days') ;
			}
			console.log("earnedCreditPoints => ",earnedCreditPoints);
			if(earnedCreditPoints > 0){
				if (data && data !== null ) { 
					if(method === "minus"){
						var totalEarnedPoints = Math.round(data.totalPoints - earnedCreditPoints);
					}else{
						var totalEarnedPoints = Math.round(data.totalPoints + earnedCreditPoints);
					}

					console.log("totalEarnedPoints => ",totalEarnedPoints)
					CreditPoints.updateOne(
						{ "_id": ObjectId(data._id)},		
						{$push: {
								transactions : {
									order_id            : order_id,
									transactionDate     : new Date(),
									expiryDate     	  : expiryDate,
									purchaseAmount      : purchaseAmount,
									shippingCharges     : shippingCharges,
									totalAmount         : totalAmount,
									earnedPoints        : (method === "minus" ? -1 * earnedCreditPoints  : earnedCreditPoints),
									typeOfTransaction   : transactionType,
									status              : "active"
								}
							},
							$set:{
								totalPoints : totalEarnedPoints
							}	
						})
						.exec()
						.then(updateddata => {
							// console.log("Data => ",updateddata)
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
						user_id              : user_id,
						totalPoints          : earnedCreditPoints,
						transactions 				: {
														order_id            : order_id,
														transactionDate     : currDate,
														expiryDate     	  : currDate.setDate(currDate.getDate() + expiryLimitInDays),
														purchaseAmount      : purchaseAmount,
														shippingCharges     : shippingCharges,
														totalAmount         : totalAmount,
														earnedPoints        : earnedCreditPoints,
														typeOfTransaction   : transactionType,
													   status              : "active"
						},		
						createdAt 					: new Date(),
						createdBy 					: user_id
					});
		
					creditPoints.save()
					.then(async(creditData) => {
						// console.log("creditData => ",creditData)	
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
	});
}


/*=========== Add admin or vendor comment ===========*/
exports.add_admin_or_vendor_comment = (req, res, next) => {
	// console.log("req.body => ",req.body);
	// console.log("req.body => ",req.body.vendorComment);
	// if(req.body.adminComment && req.body.adminComment !== undefined){
	// 	var comment = {adminComment : req.body.adminComment}
	// }else if(req.body.vendorComment && req.body.vendorComment !== undefined){
	// 	var comment = {vendorComment : req.body.vendorComment}
	// }
	// console.log("comment => ",comment);
	ReturnedProducts.updateOne(
		{ _id: req.body.return_id},
		{$push: 
			{'adminComments' : 
				{
					comment 		: req.body.comment,
					commentBy 	: req.body.commentBy,
					commentedOn : new Date()
				}
			}
		}
	)
	.exec()
	.then(data => {
		res.status(200).json({
			message : 'Comment added successfully.'
		});
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};


exports.returnStatusUpdate = (req,res,next)=>{
	ReturnedProducts.updateOne(
		{ _id: req.body.id},  
		{
			$push:  { 'returnStatus' : {status : req.body.status, date: new Date()} }
		}
	)
	.exec()
	.then(data=>{
		res.status(200).json({"message":req.body.status+" Successfully!"});
	})
	.catch(err =>{
		res.status(500).json({error: err});
	});
};

exports.returnPickeupInitiated = (req,res,next)=>{
	ReturnedProducts.updateOne({ _id: req.body.id}, 
						{ $push:  { 'returnStatus' : {status : "Return Pickup Initiated", date: new Date()} } ,    
						  $set : { pickedupBy : req.body.pickupby } 
						})
	.exec()
	.then(data=>{
		res.status(200).json({"message":"Return Initiated Successfully!"});
	})
	.catch(err =>{
		res.status(500).json({error: err});
	});
};

exports.returnedCount = (req,res,next)=>{
	ReturnedProducts.find({}).count()
	.exec()
	.then(data=>{
		res.status(200).json({ "dataCount": data });
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.PendingCount = (req,res,next)=>{
	ReturnedProducts.aggregate([
	{ "$match": { 
			"returnStatus.status" :  "Return Approval Pending" 
		}
	},
	{ "$redact":
		{
			"$cond": {
			   "if": { "$eq": [ { "$arrayElemAt": [ "$returnStatus.status", -1 ] }, "Return Approval Pending" ] },
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
		.then(data=>{
		  if (data.length==0) {
			res.status(200).json({ "dataCount": 0 });
		  }else{
			res.status(200).json({ "dataCount": data[0].count });
		  }
		  
		  
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};