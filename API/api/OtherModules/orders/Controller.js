const mongoose 				= require("mongoose");
const Orders 				= require('./Model');
const Carts 				= require('../cart/Model');
const Masternotifications 	= require('../../coreAdmin/notificationManagement/ModelMasterNotification.js');
const User 					= require('../../coreAdmin/userManagementnew/ModelUsers.js');
const BusinessAssociate 	= require('../businessAssociate/Model');
const ReturnedProducts 		= require('../returnedProducts/Model');
const Products 				= require('../products/Model');
const Adminpreference 		= require('../adminPreference/Model');
const Allowablepincode 		= require('../allowablePincodes/Model');
const Entitymaster 			= require('../../coreAdmin/entityMaster/ModelEntityMaster.js');
const globalVariable 		= require('../../../nodemon');
const moment 				= require('moment-timezone');
const FranchiseGoods 		= require('../distributionManagement/Model');
const axios             	= require('axios');
var ObjectId 				= require('mongodb').ObjectID;
var request 				= require('request-promise');

/*========== Insert Orders ==========*/
exports.insert_orders = (req, res, next) => {
  	// console.log("Inside order post",req.body); 
  	if (req.body.cartItems.length > 0) {
	 	for (k = 0; k < req.body.cartItems.length; k++) {
			Products.updateOne(
			  	{ "_id": req.body.cartItems[k].product_ID },
			  	{$inc : {
						"availableQuantity": -(req.body.cartItems[k].quantity),
					}
		  		}
		  	)
		  	.then()
		  	.catch();
	 	}
  	}

  	User.findOne({ "_id": req.body.user_ID })
	.exec()
	.then(data => {
		Adminpreference.findOne()
		.then(preferenceData => {
			if (preferenceData.websiteModel === "FranchiseModel") {
				// console.log("inside adminpreferences, Address===",autogenerateOrderId);
				var pincode = req.body.deliveryAddress.pincode;
				
				if (pincode) {
				  	Allowablepincode.find()
					.exec()
					.then(franchiseObjects => {
						main();
						async function main() {
						  	// console.log("Allowaable Pincode data ============",franchiseObjects);                 
						  	if (franchiseObjects) {
							 	var franchiseID;
							 	var matchedFranchise = [];
							 	// console.log("Pincode Length : ",franchiseObjects.length);
							 	
							 	for (var franchiseObj of franchiseObjects) {
									// console.log("Pincodes:",franchiseObj.allowablePincodes.includes(pincode));
									if (franchiseObj.allowablePincodes.includes(pincode)) {
									  	franchiseID = req.body.franchise_id ? req.body.franchise_id : franchiseObj.franchiseID; //code by madhuri
									  
									  	if (franchiseID !== undefined) {
										 	matchedFranchise.push({ franchiseID: franchiseID });
										 	// console.log("matchedFranchise ===", matchedFranchise);
									  	}
									}
							 	}//end for loop 

							 	if (matchedFranchise) {
									if (matchedFranchise.length > 1) {
									  	var franchiseDistance 		= 9999999999;
									  	var allocatedToFranchise 	= 0;
									  	var distance 					= 0 ;

									  	for(var i = 0 ; i < matchedFranchise.length; i++){
										 	distance = await allocatefranchisebeforesave(matchedFranchise[i].franchiseID);
										 	if(distance < franchiseDistance){
											  	franchiseDistance = distance;
											  	allocatedToFranchise = matchedFranchise[i].franchiseID;
											  	// console.log("franchiseDistance ==========>", franchiseDistance);
										 	}
									  	}
									  	// console.log("allocatedToFranchise available==========>", allocatedToFranchise);
								  		saveOrderdata(allocatedToFranchise);
									} else {
								  		// console.log("single franchise available==========");
								  		var allocatedToFranchise = franchiseID;
								  		saveOrderdata(allocatedToFranchise);
									}

									//insert into franchise goods
									for (var i = 0; i <= req.body.cartItems.length; i++) {
									  	//console.log("inside for cartitems",req.body.cartItems[i]);
									  	var productId 				= req.body.cartItems[i].product_ID;
									  	var status 					= req.body.status == 'Paid' ? "Paid" : "UnPaid";
									  	var obj 						= { 
										  									"orderNum" 				: Math.round(new Date().getTime() / 1000), 
										  									"orderDate" 			: new Date(), 
										  									"orderQty" 				: req.body.cartItems[i].quantity, 
										  									"Unit" 					: req.body.cartItems[i].unit, 
										  									"orderDeliveryStatus": status 
										  								}
									  	var franchise_id 			= req.body.franchise_id ?  req.body.franchise_id  : allocatedToFranchise;
									  	var franchiseGoodsOrder = await addOrderToFranchiseGoods(productId, obj, req.body.franchise_id);
									}


									// insert orders details and allocate franchise ID to orders
									function saveOrderdata(allocatedToFranchise) {
									  	// console.log("allocatedToFranchise==========",allocatedToFranchise);
									  	// console.log("inside saveOrderData allocate franchise Id - saveOrderData function");  
									  	var status 			= req.body.status == 'Paid' ? "Paid" : "UnPaid";
									  	//for franchise instore bill
									  	var billFranchise = req.body.franchise_id ? req.body.franchise_id : '';
									 	var BillNumber 	= req.body.billNumber ? req.body.billNumber : 0;
									  	
									  	const order 		= new Orders({
										 	_id 							: new mongoose.Types.ObjectId(),
										 	"orderID" 					: Math.round(new Date().getTime() / 1000),
										 	"billNumber" 				: BillNumber,
										 	"user_ID" 					: req.body.user_ID,
										 	"franchiseCustId" 			: req.body.franchiseCustId ? req.body.franchiseCustId : null,
										 	"allocatedToFranchise" 		: allocatedToFranchise ? allocatedToFranchise : billFranchise,
										 	"userName" 					: data.profile.email,
										 	"userFullName" 				: data.profile.fullName,
										 	"total" 					: req.body.total,
										 	"currency" 					: 'inr',
										 	"cartTotal" 				: req.body.cartTotal,
										 	"discount" 					: req.body.discount,
										 	"subTotal" 					: req.body.subTotal ? req.body.subTotal : 0,
										 	"gstTax" 					: req.body.gstTax ? req.body.gstTax : 0,
										 	"amountPayable" 			: req.body.amountPayable ? req.body.amountPayable : 0,
										 	"status" 					: status,
										 	"createdAt" 				: new Date(),
										 	"products" 					: req.body.cartItems,
										 	"paymentMethod" 			: req.body.paymentMethod,
										 	"shippingtime" 				: req.body.shippingtime,
										 	"productLength" 			: req.body.cartItems.length,
										 	"cartQuantity" 				: req.body.cartQuantity,
										 	'deliveryAddress' 		: {
																				"name" 			: req.body.deliveryAddress.name,
																				"email" 			: req.body.deliveryAddress.email,
																				"addressLine1" : req.body.deliveryAddress.addressLine1,
																				"addressLine2" : req.body.deliveryAddress.addressLine2,
																				"pincode" 		: req.body.deliveryAddress.pincode,
																				"city" 			: req.body.deliveryAddress.city,
																				"state" 			: req.body.deliveryAddress.state,
																				"stateCode" 	: req.body.deliveryAddress.stateCode,
																				"mobileNumber" : req.body.deliveryAddress.mobileNumber,
																				"district" 		: req.body.deliveryAddress.district,
																				"country" 		: req.body.deliveryAddress.country,
																				"countryCode" 	: req.body.deliveryAddress.countryCode,
																				"addType" 		: req.body.deliveryAddress.addType,
																				"latitude" 		: req.body.deliveryAddress.latitude,
																				"longitude" 	: req.body.deliveryAddress.longitude,
											},
											"deliveryStatus" 			: [
																				{
																					"status": req.body.deliveryStatus ? req.body.deliveryStatus : "New Order",
																					"Date": new Date(),
																					"Userid": req.body.user_ID,
																				}
											],
									  	});
									  	//save order and send notifications to customer 
									  	order.save()
										.then(orderdata => {                              
											// console.log("1.Inside order response",orderdata);
											var header  = "<table><tbody><tr><td align='center' width='100%'><a><img src='http://http://anashandicrafts.iassureit.com/images/anasLogo.png' style='width:25%'></a></td></tr></table>";
											var body 	= "";
											var footer 	= "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
											footer 		+= "<span style='color:#fff'>AnasHandicraft Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
											footer 		+= "<span style='float:right;color:#fff'>anashandicraft@gmail.com</span></td></tr></tbody></table>"

											var mailSubject, mailText, smsText;
											Masternotifications.findOne({ "templateType": "Email", "templateName": "Order Placed Successfully" })
											.exec()
											.then((maildata) => {
												if (maildata) {
													mailSubject 	= maildata.subject != '' ? maildata.subject : "Your order is placed successfully.";
													var variables 	= {
													  	"username" 	: data.profile.fullName
													}

													var content = maildata.content;
													if (content.indexOf('[') > -1) {
													  	var wordsplit = content.split('[');
													}

													var tokens 	= [];
													var n  		= 0;
													for (i = 0; i < wordsplit.length; i++) {
													  	if (wordsplit[i].indexOf(']') > -1) {
														 	tokensArr = wordsplit[i].split(']');
														 	tokens[n] = tokensArr[0];
														 	n++;
													  	}
													}
													var numOfVar = Object.keys(variables).length;

													for (i = 0; i < numOfVar; i++) {
													  	var tokVar 	= tokens[i].substr(1, tokens[i].length - 2);
													  	content 		= content.replace(tokens[i], variables[tokens[i]]);
													}
													content 	= content.split("[").join(" ");
													content 	= content.split("]").join(" ");
													body 		+= "<table><tr><td>" + content + "</td></tr></table>";
													body 		+= "<tr><b><p>Your order will be sent to:</p></b>";
													body 		+= "<p style='margin:0'>" + orderdata.deliveryAddress.name + "</p>";
													body 		+= "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine1 + "</p>";
													
													if (orderdata.deliveryAddress.addressLine2) {
													  body += "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine2 + "</p>";
													}

													body += "<p style='margin:0'>" + orderdata.deliveryAddress.city + " " + orderdata.deliveryAddress.district + " " + orderdata.deliveryAddress.state + " " + orderdata.deliveryAddress.pincode + "</p>";
													body += "<p style='margin:0'>" + orderdata.deliveryAddress.country + "</p></tr>";
													body += "</tbody></table>";
													body += "<h3>Order Details</h3>";
													body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

													cartArray.map((productdata, index) => {
													  	body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.total + "</td></tr>";
													})

													body += "</tbody></table><br>";

												} else {
													mailSubject = "Your order is placed successfully.";
													body 			+= "<table><tr><td><h3>Dear " + data.profile.fullName + ", </h3>\n";
													body 			+= "<p>Thank you for your order. We’ll send a confirmation when your order ships.</p></tr>";
													body 			+= "<tr><b><p>Your order will be sent to:</p></b>";
													body 			+= "<p style='margin:0'>" + orderdata.deliveryAddress.name + "</p>";
													body 			+= "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine1 + "</p>";
													
													if (orderdata.deliveryAddress.addressLine2) {
													  	body += "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine2 + "</p>";
													}

													body += "<p style='margin:0'>" + orderdata.deliveryAddress.city + " " + orderdata.deliveryAddress.district + " " + orderdata.deliveryAddress.state + " " + orderdata.deliveryAddress.pincode + "</p>";
													body += "<p style='margin:0'>" + orderdata.deliveryAddress.country + "</p></tr>";
													body += "</tbody></table>";
													body += "<h3>Order Details</h3>";
													body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

													req.body.cartItems.map((productdata, index) => {
													  	body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.subTotal + "</td></tr>";
													})

													body += "</tbody></table><br>";
												}
											})
											.catch({})

											Carts.findOne({ "user_ID": req.body.user_ID })
											.exec()
											.then(userCart => {
												if (userCart) {
													Carts.updateOne(
														{ "_id": userCart._id },
													  	{$set: {
															"cartItems": [],
															"cartTotal": 0
														}
													})
													.exec()
													.catch(error => {
														res.status(500).json({
															error1: error
														});
													})
												}
											})
										  	.catch(error => {
											 	console.log('error', error);
											 	res.status(500).json({
													error2: error
											 	});
										  	})
											res.status(200).json({
											  	"message" 	: "Order Placed Successfully.",
											  	"order_ID" 	: orderdata._id
											});
										})
									}//end saveOrderData
								}//end if franchiseID
							}
						}
						function allocatefranchisebeforesave(franchiseid) {
						  	// console.log("franchiseID=====>", franchiseid);
						  	return new Promise(function (resolve, reject) {
								Entitymaster.findOne({ _id: franchiseid })
								.then(franchiseData => {
									if (franchiseData) {
										var distance 	= 0
										var Flatitude 	= franchiseData.locations[0].latitude;
										var Flongitude = franchiseData.locations[0].longitude;
										
										if (Flatitude && Flongitude) {
										  	distance = findDistance(Flatitude, Flongitude, req.body.deliveryAddress.latitude, req.body.deliveryAddress.longitude, 'K');
										  	// console.log("franchiseid = ", franchiseid,  " | distance = ",distance);
										  	resolve(distance);
										}
									}
								})
							})
						}
					})
				}// end if pincode
			} else {
				// console.log("discount===",req.body.discount);
				var status 	= req.body.status == 'Paid' ? "Paid" : "UnPaid";
				const order = new Orders({
				  	_id 					: new mongoose.Types.ObjectId(),
				  	"orderID" 			: Math.round(new Date().getTime() / 1000),
				  	"user_ID" 			: req.body.user_ID,
				  	"userName" 			: data.profile.emailId,
				  	"userFullName" 		: data.profile.fullName,
				  	"total" 			: req.body.total,
				  	"currency" 			: 'inr',
				  	"cartTotal" 		: req.body.cartTotal,
				  	"discount" 			: req.body.discount,
				  	"gstTax"  			: req.body.gstTax,
				  	"status" 			: status,
				  	"createdAt" 		: new Date(),
				  	"products" 			: req.body.cartItems,
				  	"paymentMethod" 	: req.body.paymentMethod,
				  	"shippingtime" 	: req.body.shippingtime,
				  	"productLength" 	: req.body.cartItems.length,
				  	"cartQuantity" 	: req.body.cartQuantity,
				  	'deliveryAddress'	: {
											 	"name"			: req.body.deliveryAddress.name,
											 	"email"			: req.body.deliveryAddress.email,
											 	"addressLine1"	: req.body.deliveryAddress.addressLine1,
											 	"addressLine2"	: req.body.deliveryAddress.addressLine2,
											 	"pincode"		: req.body.deliveryAddress.pincode,
											 	"city"			: req.body.deliveryAddress.city,
											 	"state"			: req.body.deliveryAddress.state,
											 	"stateCode"		: req.body.deliveryAddress.stateCode,
											 	"mobileNumber"	: req.body.deliveryAddress.mobileNumber,
											 	"district"		: req.body.deliveryAddress.district,
											 	"country"		: req.body.deliveryAddress.country,
											 	"countryCode"	: req.body.deliveryAddress.countryCode,
											 	"addType"		: req.body.deliveryAddress.addType
				  	},
				  	"deliveryStatus": [
					 	{
							"status": "New Order",
							"Date": new Date(),
							"Userid": req.body.user_ID,
					 	}
				  	],
				});

				order.save()
				.then(orderdata => {
					// console.log("orderdata =====> ",orderdata);
					processData();
					async function processData(){
						if (preferenceData.websiteModel === "MarketPlace") {
							var splitVendorOrders = await addSplitVendorOrders(orderdata._id);
							// console.log("splitVendorOrders => ",splitVendorOrders)
						}
						var header 	= "<table><tbody><tr><td align='center' width='100%'><a><img src='http://http://anashandicrafts.iassureit.com/images/anasLogo.png' style='width:25%'></a></td></tr></table>";
						var body  	= "";
						var footer 	= "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
						footer 		+= "<span style='color:#fff'>AnasHandicraft Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
						footer 		+= "<span style='float:right;color:#fff'>anashandicraft@gmail.com</span></td></tr></tbody></table>"

						var mailSubject, mailText, smsText;
						Masternotifications.findOne({ "templateType": "Email", "templateName": "Order Placed Successfully" })
						.exec()
						.then((maildata) => {

						  	if (maildata) {
							 	mailSubject 	= maildata.subject != '' ? maildata.subject : "Your order is placed successfully.";
							 	var variables 	= {
									"username"	: data.profile.fullName
							 	}

							 	var content = maildata.content;
							 	if (content.indexOf('[') > -1) {
									var wordsplit = content.split('[');
							 	}

							 	var tokens 	= [];
							 	var n 		= 0;
							 	for (i = 0; i < wordsplit.length; i++) {
									if (wordsplit[i].indexOf(']') > -1) {
								  		tokensArr = wordsplit[i].split(']');
								  		tokens[n] = tokensArr[0];
								  		n++;
									}
							 	}
							 	var numOfVar = Object.keys(variables).length;

								for (i = 0; i < numOfVar; i++) {
									var tokVar 	= tokens[i].substr(1, tokens[i].length - 2);
									content 		= content.replace(tokens[i], variables[tokens[i]]);
								}

							 	content = content.split("[").join(" ");
							 	content = content.split("]").join(" ");
							 	body += "<table><tr><td>" + content + "</td></tr></table>";
							 	body += "<tr><b><p>Your order will be sent to:</p></b>";
							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.name + "</p>";
							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine1 + "</p>";
							 	
							 	if (orderdata.deliveryAddress.addressLine2) {
									body += "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine2 + "</p>";
							 	}

							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.city + " " + orderdata.deliveryAddress.district + " " + orderdata.deliveryAddress.state + " " + orderdata.deliveryAddress.pincode + "</p>";
							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.country + "</p></tr>";
							 	body += "</tbody></table>";
							 	body += "<h3>Order Details</h3>";
							 	body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

							 	cartArray.map((productdata, index) => {
									body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.total + "</td></tr>";
							 	})

							 	body += "</tbody></table><br>";

						  	} else {
							 	mailSubject = "Your order is placed successfully.";
							 	body += "<table><tr><td><h3>Dear " + data.profile.fullName + ", </h3>\n";
							 	body += "<p>Thank you for your order. We’ll send a confirmation when your order ships.</p></tr>";

							 	body += "<tr><b><p>Your order will be sent to:</p></b>";
							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.name + "</p>";
							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine1 + "</p>";
							 	
							 	if (orderdata.deliveryAddress.addressLine2) {
									body += "<p style='margin:0'>" + orderdata.deliveryAddress.addressLine2 + "</p>";
							 	}

							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.city + " " + orderdata.deliveryAddress.district + " " + orderdata.deliveryAddress.state + " " + orderdata.deliveryAddress.pincode + "</p>";
							 	body += "<p style='margin:0'>" + orderdata.deliveryAddress.country + "</p></tr>";
							 	body += "</tbody></table>";
							 	body += "<h3>Order Details</h3>";
							 	body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";

							 	req.body.cartItems.map((productdata, index) => {
									body += "<tr><td>" + productdata.productName + "</td><td>" + productdata.discountedPrice + "</td><td>" + productdata.quantity + "</td><td>" + productdata.subTotal + "</td></tr>";
							 	})

							 	body += "</tbody></table><br>";
						  	}
						  	//body += footer;
						  	// console.log('body',body)
						  	// request({
						  	//     "method"    : "POST",
						  	//     "url"       : "http://localhost:" + globalVariable.PORT + "/send-email",
						  	//     "body"      :   {
						  	//                         "email"     : data.profile.emailId,
						  	//                         "subject"   : mailSubject,
						  	//                         "text"      : mailSubject,
						  	//                         "mail"      : body 
						  	//                         //"mail"      : 'Hello '+data.profile.fullName+','+'\n'+mailText,
						  	//                         // "mail"      : 'Hello '+data.profile.fullName+','+'\n'+"\n <br><br>Your Order has been placed successfully and will be dispached soon."+"<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team GangaExpress',
						  	//                     },
						  	//     "json"      : true,
						  	//     "headers"   : { "User-Agent": "Test App" }
						  	//   })
						  	//   .then((sentemail)=>{
						  	//       res.header("Access-Control-Allow-Origin","*");
						  	//       res.status(200).json({ "message": 'Order placed successfully' });
						  	//   })
						  	//   .catch((err) =>{
						  	//     console.log('e', error);
						  	//       res.status(500).json({
						  	//           error: err
						  	//       });
						  	//   }); 
						})
						.catch()

					 	// request({
					 	//   "method"    : "POST",
					 	//   "url"       : "http://localhost:"+globalVariable.PORT+"/send-email",
					 	//   "body"      :  {
					 	//                       "email"     : "iassureitmail@gmail.com",
					 	//                       "subject"   : 'Order Placed Successfully',
					 	//                       "text"      : "WOW Its done",
					 	//                       "mail"      : 'Hello '+'Admin'+','+'\n'+"\n <br><br>You have an order placed by "+data.profile.fullName+"."+"<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team AnasHandicraft',
					 	//                 },
					 	//   "json"      : true,
					 	//   "headers"   : {
					 	//                   "User-Agent": "Test App"
					 	//               }
					 	// })
					 	// .then((sentemail)=>{
					 	//     res.header("Access-Control-Allow-Origin","*");
					 	//     res.status(200).json({message:"Mail Sent successfully"});
					 	// })
					 	// .catch((err) =>{
					 	//     res.status(500).json({
					 	//         error: err
					 	//     });
					 	// });
					 	Carts.findOne({ "user_ID": req.body.user_ID })
						.exec()
						.then(userCart => {
						  	if (userCart) {
							 	Carts.updateOne(
								{"_id" : userCart._id },
								{$set : {
										"cartItems" : [],
										"cartTotal"	: 0
								  	}
								})
								.exec()
								.catch(error => {
								  	res.status(500).json({
									 	error1: error
								  	});
								})
						  	}
						})
						.catch(error => {
						  	console.log('error', error);
						  	res.status(500).json({
							 	error2: error
						  	});
						})
					 	res.status(200).json({
							"message" 	: "Order Placed Successfully.",
							"order_ID" 	: orderdata._id
					 	});
					}
			  	})
			  	.catch(error => {
				 	console.log('e1', error);
				 	res.status(500).json({
						error1 : error
				 	});
			  	})
			}//end else preference
		})//end preference .then()

	  	.catch(error => {
		 	console.log('error while getting preferences:', error);
		 	res.status(500).json({
				error: error
			});
		})
 	})
 	.catch(err => {
		console.log('e3', error);
		res.status(500).json({
	  		error3: err
		});
 	});

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
};

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
		console.log("data in order ==>", data);
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
  Orders.findOne({ _id: req.params.orderID }).sort({ createdAt: -1 })
	 .populate('franchiseCustId')
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
  Orders.aggregate([{
	 $lookup:
	 {
		from: 'returnedproducts',
		localField: '_id',
		foreignField: 'orderID',
		as: 'returnProducts'
	 }
  },
  {
	 $sort: {
		"createdAt": -1
	 }
  },
  {
	 $match: { "user_ID": ObjectId(req.params.userID) }
  }
  ])
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
exports.cancelOrder = (req, res, next) => {
  //console.log("Order cancelled");
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

exports.returnOrder = (req, res, next) => {
  // console.log(req.body.orderID)
  // console.log(req.body.productID)
  /*Orders.findOne(
		  { _id : req.body.orderID, "products.product_ID":req.body.productID}
		  )
		  .exec()
				.then(data=>{
				  console.log(data);
				})*/
  Orders.updateOne(
	 { _id: ObjectId(req.body.orderID), "products.product_ID": ObjectId(req.body.productID) },
	 {
		$set:
		{
		  'products.$.status': 'Returned',
		  'products.$.returnedDate': new Date(),
		}
	 }
  )
	 .exec()
	 .then(data => {
		// console.log(data);
		if (data.nModified == 1) {

		  Orders.findOne({ _id: req.body.orderID, "products.product_ID": req.body.productID })
			 .exec()
			 .then(orders => {
				const returnedproducts = new ReturnedProducts({
				  _id: new mongoose.Types.ObjectId(),
				  orderID: req.body.orderID,
				  altOrderID: req.body.altorderid,
				  user_ID: req.body.userid,
				  product_ID: req.body.productID,
				  reasonForReturn: req.body.reasonForReturn,
				  originalPrice: orders.originalPrice,
				  discountedPrice: orders.discountedPrice,
				  discountPercent: orders.discountPercent,
				  dateofPurchase: orders.createdAt,
				  modeofPayment: orders.paymentMethod,
				  dateofReturn: new Date(),
				  returnStatus: [{
					 status: "Return Approval Pending",
					 date: new Date()
				  }],
				  refund: [{
					 bankName: req.body.bankname,
					 bankAccountNo: req.body.bankacctno,
					 IFSCCode: req.body.ifsccode,
					 amount: orders.products[0].discountedPrice
				  }],
				  createdBy: req.body.userid,
				  createdAt: new Date()
				})
				returnedproducts.save()
				  .then(data => {
					 res.status(200).json({ "message": "Product is returned. Return process will start soon!" });
				  })
				  .catch(err => {
					 res.status(500).json({ error: err });
				  });
			 })
			 .catch(err => {
				res.status(500).json({ error: err });
			 });

		} else {
		  res.status(401).json({
			 "message": "Product Not Found"
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
  console.log("get reports data", req.body.startDate, req.body.endDate);
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
		"$match": { "deliveryStatus.status": "New Order" }
	 },
	 {
		"$redact":
		{
		  "$cond": {
			 "if": { "$eq": [{ "$arrayElemAt": ["$deliveryStatus.status", -1] }, "New Order"] },
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
				"if": { "$eq": [{ "$arrayElemAt": ["$deliveryStatus.status", -1] }, req.body.status] },
				"then": "$$KEEP",
				"else": "$$PRUNE"
			 }
		  }
		}])
		.sort({ createdAt: -1 })
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
  } else {
	 Orders.find(selector)
		.populate("allocatedToFranchise")
		.sort({ createdAt: -1 })
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
				totalCost: {$sum: "$total"}, 
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
		console.log("datatatatta",data);
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
		console.log('paymentdetails ===> ', paymentdetails);
		axios.post(redirecturl,paymentdetails,config)
			 .then(result => {
				  console.log('getpaymentgateway Response===> ', result.data);
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
		console.log('getpaymentgateway UPdate order Response===> ', data);

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
