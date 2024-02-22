const mongoose             = require("mongoose");
const _                    = require("underscore");
const Products             = require('./Model');
const Category             = require('../categories/Model');
const Sections             = require('../sections/Model');
const FailedRecords        = require('../failedRecords/Model');
const Orders               = require('../orders/Model');
const ProductInventory     = require('../ProductInventory/Model');
const Carts                = require('../cart/Model');
const Wishlists            = require('../wishlist/Model');
const StorePreferences     = require('../../Ecommerce/StorePreferences/Model.js');
const ExpenseTypeMaster    = require('../../coreAdmin/expenseTypeMaster/ModelExpenseTypeMaster');
var ObjectId               = require('mongodb').ObjectID;
var UnitOfMeasurmentMaster = require('../departmentMaster/ModelUnitofmeasurment');
const franchisegoods       = require('../distributionManagement/Model');
const EntityMaster         = require('../../coreAdmin/entityMaster/ModelEntityMaster');
const haversine            = require('haversine-distance')
var subcategoryArray       = [];


exports.insert_product = (req,res,next)=>{
	// console.log("response ===========>",res);
	// console.log("req =>=>=>=>=>=>=>=>=>=> ",req.body);
	Products.find({"itemCode" : req.body.itemCode,"vendor_ID":req.body.vendor_ID})
		.exec()
		.then(data =>{
		if(data && data.length > 0){
			res.status(200).json({
				"message": "Item code for this product code already exists.",
			});
		}else{
			const products = new Products({
				_id                       : new mongoose.Types.ObjectId(), 
				user_ID                   : req.body.user_ID,
				vendor_ID                 : req.body.vendor_ID, 
				vendorName                : req.body.vendorName, 
				section                   : req.body.section, 
				section_ID                : req.body.section_ID,                
				category                  : req.body.category,
				categoryNameRlang         : req.body.categoryNameRlang,
				category_ID               : req.body.category_ID,
				subCategory               : req.body.subCategory,
				subCategory_ID            : req.body.subCategory_ID,
				brand                     : req.body.brand,
				brandNameRlang            : req.body.brandNameRlang,
				productCode               : req.body.productCode,
				itemCode                  : req.body.itemCode,
				productName               : req.body.productName,
				productNameRlang          : req.body.productNameRlang,
				productUrl                : req.body.productUrl,
				productDetails            : req.body.productDetails,
				shortDescription          : req.body.shortDescription,
				productReturnable         : req.body.productReturnable,
				featureList               : req.body.featureList,
				currency                  : req.body.currency,
				discountPercent           : req.body.discountPercent,
				actualPrice               : req.body.actualPrice,
				offeredPrice              : req.body.offeredPrice,
				originalPrice             : req.body.originalPrice,
				discountedPrice           : req.body.discountedPrice,
				// availableQuantity         : req.body.availableQuantity,
				status                    : req.body.status,
				tags                      : req.body.tags,
				offered                   : req.body.offered,
				unit                      : req.body.unit,
				size                      : req.body.size,
				universalProductCode      : req.body.universalProductCode,
				color                     : req.body.color,
				attributes                : req.body.attributes,
				taxName                   : req.body.taxName,
				taxInclude                : req.body.taxInclude,
				taxRate                   : req.body.taxRate, 
				type                      : req.body.type,
				fileName                  : req.body.fileName,
				createdBy 						: req.body.createdBy,
				createdAt                 : new Date()
			});
			products.save()
			.then(data=>{
				const productInventory = new ProductInventory({
						_id                       : new mongoose.Types.ObjectId(), 
						vendor_ID                 : ObjectId(req.body.vendor_ID), 
						universalProductCode      : req.body.universalProductCode ? req.body.universalProductCode : "",
						productCode               : req.body.productCode ? req.body.productCode : "",
						itemCode                  : req.body.itemCode ? req.body.itemCode : "",
						productName               : req.body.productName,
						shortDescription          : req.body.shortDescription ? req.body.shortDescription : "",
						productReturnable         : req.body.productReturnable ? req.body.productReturnable : "",
						currentQuantity           : req.body.availableQuantity ? req.body.availableQuantity : "",
						originalPrice             : req.body.originalPrice,
						discountPercent           : req.body.discountPercent,
						discountedPrice           : req.body.discountedPrice, 
						inwardDetails             : [ 
														{
															date                : new Date(),
															qty                 : req.body.availableQuantity,
															originalPrice       : req.body.originalPrice,
															discountPercent     : req.body.discountPercent,
															discountedPrice     : req.body.discountedPrice, 
															addedBy             : ObjectId(req.body.createdBy),
														}
						],
						createdBy                 : ObjectId(req.body.createdBy),
						createdAt                 : new Date()
					});
					productInventory.save()
					.then(iventoryData=>{
						// console.log("iventoryData---------",iventoryData);
					})
					.catch(err =>{
						console.log("error---------",err);
						reject(err);
					});
				res.status(200).json({
					"message" 		: "Product Submitted Successfully.",
					"product_ID" 	: data._id
				});
			})
			.catch(err =>{
				console.log("err0",err);
				res.status(500).json({
					error: err
				});
			});
		}
	})
	.catch(err =>{
		console.log("err1",err);
		res.status(500).json({
			error: err
		});
	});
};