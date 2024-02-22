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
				vendorBarcode             : req.body.vendorBarcode,
				vendorItemcode            : req.body.vendorItemcode,
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

/*================== Produt Bulk Upload ================== */
exports.bulkUploadProduct = (req,res,next)=>{
	// console.log("req.body => ",req.body);
	var record          = []; 
	var i               = 0;
	var found           = 0;
	var failedRecords   = [];
	var catid;
	var subcatid;
	getData();

	async function getData(){
		var productData     = req.body;
		var TotalCount      = 0;
		var Count           = 0;
		var DuplicateCount  = 0;
		var invalidData     = [];
		var invalidObjects  = [];
		var remark          = ''; 

		// Get All Sections
		var allSectionsData = await fetchAllSections();

		// Get All Vendors
		var allEntityData = await fetchAllEntities("vendor");

		for(k = 0 ; k < productData.length ; k++){

			// console.log("productData K => ",productData[k]);
			if(productData[k].subCategory !== undefined ) {
				var inputSubcategory = productData[k].subCategory;
			}

			if(productData[k].websiteModel === "MarketPlace"){
				var EntityData = allEntityData.filter((vendorData)=>{
					if (vendorData.companyID === productData[k].VendorCompanyID) {
						return vendorData;
					}
				})                
				// console.log("EntityData = ", EntityData );
			}else{
				var EntityData = allEntityData.filter((vendorData)=>{
					if (vendorData.companyID === allEntityData[0].companyID) {
						return vendorData;
					}
				}) 
				// var EntityDataArray = allEntityData[0].companyName;
			}

			if(productData[k].section !== undefined && productData[k].itemCode !== undefined){
				var inputSection = productData[k].section.trim();
				if (inputSection !== '') { 
					
					if (allSectionsData && allSectionsData.length > 0) {
						// console.log("allSectionsData 1 => ",allSectionsData)
						// console.log("inputSection => ",inputSection)

						var sectionExists = allSectionsData.filter(function (e) {
							return e.section.toLowerCase() === inputSection.toLowerCase();
						}); 
						// const sectionExists = allSectionsData.some(sectiondata => sectiondata.section.toLowerCase() === inputSection.toLowerCase());
						// console.log("sectionExists => ",sectionExists)
						// console.log("condition => ",(sectionExists && sectionExists.length === 0))
						if (sectionExists && sectionExists.length === 0) {
							var sectionObject   = await sectionInsert(productData[k].section); 
							var section         = sectionObject;
							allSectionsData.push(sectionObject)
						}else{
							var section = sectionExists[0];
						}
						// else{
						//     var sectionObject = await sectionInsert(productData[k].section);
						//     allSectionsData.push(sectionObject)
						// }
					}else{
						var sectionObject   = await sectionInsert(productData[k].section);
						var section         = sectionObject;
						allSectionsData.push(sectionObject)
					}                   
					
					var inputCategory = productData[k].category.trim();
					// console.log("inputCategory => ",inputCategory)
					// console.log("allSectionsData => ",allSectionsData)
					if (inputCategory !== undefined){  
						// console.log("sectionObject => ",sectionObject)                      
						// var section = sectionObject;
						// console.log("section k => ",productData[k].section,"sectionArr => ",section)
						// console.log("section id => ",section._id)
						var categoryObject  = await categoryInsert(inputCategory, inputSubcategory, inputSection, section._id, productData[k].categoryNameRlang);                        
						var taxObject       = []
						
						// console.log("categoryObject 1 => ",categoryObject);

						if(productData[k].taxName){
							taxObject = await taxInsert(productData[k].taxName,productData[k].taxRate);
						}
						// console.log('taxObject',taxObject)

						if (productData[k].itemCode !== undefined && productData[k].productCode !== undefined) {
							if(typeof(productData[k].discountPercent) === 'number' && productData[k].discountPercent >= 0){
								if(typeof(productData[k].discountedPrice) === 'number' && productData[k].discountedPrice >= 0){
									if(typeof(productData[k].originalPrice) === 'number' && productData[k].originalPrice >= 0 ){
										// console.log("productData[k].websiteModel => ",productData[k].websiteModel)
										// console.log("productData[k].VendorCompanyID => ",productData[k].VendorCompanyID)
										if(productData[k].websiteModel === "MarketPlace"){
											// console.log("EntityData => ",(EntityData && EntityData.length > 0 ))
											if(EntityData && EntityData.length > 0 ){
												var insertProductObject = await insertProduct(section._id, section.section, categoryObject,productData[k],taxObject[0],EntityData);
											}else{
												remark+= "Vendor Company Does Not Exists";
											}
										}else{                                            
											var insertProductObject = await insertProduct(section._id, section.section, categoryObject,productData[k],taxObject[0]);
											if(EntityData  !== "" && EntityData !== undefined ){
												var insertProductObject = await insertProduct(section._id, section.section, categoryObject,productData[k],taxObject[0],EntityData);
											}else{
												remark+= "Vendor Company Does Not Exists";
											}
										} 
										// console.log('insertProductObject',insertProductObject)
										if (insertProductObject != 0) {
											Count++;
										}else{
											// console.log("in else");
											DuplicateCount++;
											remark += "Item code should not be duplicate, ";
										}
									}else{
										remark += "Original Price should be number,"; 
									}
								}else{
									remark += "Discount Price should be number,";
								}  
							}else{
							   remark += "Discount Percent should be number,";
							}                            
						}  
					}else{
						remark += "Category not found,";
					} 
				}else{
					remark += "Section not found,";
				} 
			}
			
			if (productData[k].itemCode !== undefined) {
				TotalCount++;
				if(productData[k].section === undefined){
					remark += "section not found";
				}
				if (productData[k].category === undefined) {
					remark += ", category not found, ";
				}
				// console.log("condition *=> ",(productData[k].productCode === undefined));
				// console.log("productCode *=> ",productData[k].productCode);

				if (productData[k].productCode === undefined) {
					remark += "Product code not found, ";
				}
				if (productData[k].productName === undefined) {
					remark += "Product name not found, ";
				}
				if (productData[k].UPC === undefined) {
					remark += "Universal Product Count not found, ";
				}
				// if (productData[k].brand == undefined) {
				//     remark += "brand not found, ";
				// }
				// if (productData[k].availableQuantity == undefined) {
				//     remark += "product quantity not found, ";
				// }
				if (productData[k].originalPrice == undefined) {
					remark += "Product's original does price not found, ";
				}
			}            

			if (remark != '') {
				invalidObjects          = productData[k];
				invalidObjects.remark   = remark;
				invalidData.push(invalidObjects);
			} 
			remark = '';
		}
		
		failedRecords.FailedRecords = invalidData
		failedRecords.fileName      = productData[0].filename;
		failedRecords.totalRecords  = TotalCount;

		await insertFailedRecords(failedRecords); 
		
		var msgstr  = "";
		var warning = false;

		if (DuplicateCount > 0 && Count > 0) {
			if (DuplicateCount > 1 && Count > 1) {
			   msgstr =  " " + Count+" products are added successfully and "+"\n"+DuplicateCount+" products are duplicate";
			}
			else if(DuplicateCount ==1 && Count == 1 ){
				msgstr =  " " + Count+" product is added successfully and "+"\n"+DuplicateCount+" product is duplicate";
			}
			else if(DuplicateCount > 1 && Count == 1)
			{
				msgstr =  " " + Count+" product is added successfully and "+"\n"+DuplicateCount+" products are duplicate";

			}else if(DuplicateCount == 1 && Count > 1){
				msgstr =  " " + Count+" products are added successfully and "+"\n"+DuplicateCount+" product is duplicate";
			}            
		}
		else if(DuplicateCount > 0 && Count == 0)
		{
			if (DuplicateCount > 1) {
				msgstr  = "Failed to add products as "+DuplicateCount+" products are duplicate";
				warning = true;
			}else{
				msgstr  = "Failed to add products as "+DuplicateCount+" product is duplicate";
				warning = true;
			}            
		}
		else if(DuplicateCount == 0 && Count > 0)
		{ 
			if (Count > 1) {
				msgstr = " " + Count+" products are added successfully";
			}else{
				msgstr = " " + Count+" product is added successfully";
			}            
		}else{
			msgstr  = "Failed to add products";
			warning = true;
		}
		res.status(200).json({
			"message" : msgstr,
			"warning" : warning
		});
	}
};

/**=============== insertFailedRecords() ===============*/
var insertFailedRecords = async (invalidData) => {
	//console.log('invalidData',invalidData);
	return new Promise(function(resolve,reject){ 
		FailedRecords.find({fileName:invalidData.fileName})  
		.exec()
		.then(data=>{
			if(data.length>0){
				// console.log('data',data)   
				if (data[0].failedRecords.length>0) {
					FailedRecords.updateOne(
						{ fileName : invalidData.fileName },  
						{ $set : { 'failedRecords': [] } 
					})
					.then(data=>{
						if(data.nModified == 1){
							FailedRecords.updateOne(
								{fileName : invalidData.fileName},  
								{
									$set :  {'totalRecords'     : invalidData.totalRecords},
									$push:  { 'failedRecords'   : invalidData.FailedRecords } 
								}
							)
							.then(data=>{
								if(data.nModified == 1){
									resolve(data);
								}else{
									resolve(data);
								}
							})
							.catch(err =>{ reject(err); });
						}else{
							resolve(0);
						}
					})
					.catch(err =>{ reject(err); });

				}else{
					FailedRecords.updateOne({ fileName:invalidData.fileName},  
						{   $set:   {'totalRecords': invalidData.totalRecords},
							$push:  { 'failedRecords' : invalidData.FailedRecords } 
						})
					.then(data=>{
						if(data.nModified == 1){
							resolve(data);
						}else{
							resolve(data);
						}
					})
					.catch(err =>{ reject(err); });
				}
			}else{
				const failedRecords = new FailedRecords({
					_id                     : new mongoose.Types.ObjectId(),                    
					failedRecords           : invalidData.FailedRecords,
					fileName                : invalidData.fileName,
					totalRecords            : invalidData.totalRecords,
					createdAt               : new Date()
				});
				
				failedRecords
				.save()
				.then(data=>{
					resolve(data._id);
				})
				.catch(err =>{
					console.log(err);
					reject(err);
				});
			}
		})     
	})            
}

/**=============== sectionInsert() ===============*/
function sectionInsert(sectionName) {
	return new Promise(function(resolve,reject){    
		sectionDuplicateControl();
		async function sectionDuplicateControl(){

			var sectionUrl = sectionName.replace(/\s+/g, '-').toLowerCase();
			
			Sections.find().sort({sectionRank:-1}).limit(1)
			.exec()
			.then(data=>{
				var sectionrank = 1;
				if(data.length > 0){
					sectionrank = data[0].sectionRank + 1;
				}   
				
				const sectionObj = new Sections({
					_id                       : new mongoose.Types.ObjectId(),
					section                   : sectionName,
					sectionUrl                : sectionUrl, 
					sectionRank               : sectionrank,
					status                    : "Published",
					createdAt                 : new Date()
				});

				sectionObj
				.save()
				.then(data=>{
					resolve({ _id : data._id, section: sectionName });
				})
				.catch(err =>{
					console.log(err);
					reject(err);
				});
			})
		}        
	})                   
}

/**=============== categoryInsert() ===============*/
function categoryInsert(catgName,subcatgName,sectionname,section,categoryNameRlang) {
	var addRowLength        = 0;
	var subcategoryArray    = [];
	var obj                 = []; 

	if(subcatgName !== undefined){        
		var subcat      = subcatgName;
		var subcarUrl   = subcat.replace(/\s+/g, '-').toLowerCase();
		subcategoryArray.push(subcatgName);
	}

	addRowLength = subcategoryArray.length;
	// console.log("subcatgName => ",subcatgName);
	// console.log("addRowLength => ",addRowLength);
	var subCategoryRank = 1;
	// if(data.length > 0){
	//     categoryRank = data[0].categoryRank + 1;
	// } 
	if(addRowLength && addRowLength > 0){
		for(var i = 0; i < addRowLength; i++){
			obj = {
				"index"             : i,
				"subCategoryCode"   : 1+'|'+i,
				"subCategoryRank"   : subCategoryRank,
				"subCategoryTitle"  : subcat,
				"subCategoryUrl"    : subcarUrl,
				"status"            : "Published",
			}
		}
	}  

	return new Promise(function(resolve,reject){    
		categoryDuplicateControl();
		async function categoryDuplicateControl(){
			var categoryPresent = await findCategory(catgName, section);
			// console.log("----------- categoryPresent ----------",categoryPresent)
			if(categoryPresent === 0){
				Category.find().sort({categoryRank:-1}).limit(1)
				 .exec()
				 .then(data=>{
					var categoryRank = 1;
					if(data.length > 0){
						categoryRank = data[0].categoryRank + 1;
					}   
					// console.log("-----------obj 1 ----------",obj)
					const categoryObj = new Category({
						_id                       : new mongoose.Types.ObjectId(),                    
						category                  : catgName,
						categoryRank              : categoryRank,
						categoryNameRlang         : categoryNameRlang,
						categoryUrl               : catgName.replace(/\s+/g, '-').toLowerCase(),
						subCategory               : obj,
						categoryDescription       : '',
						categoryImage             : '',
						categoryIcon              : '',
						section                   : sectionname,
						section_ID                : section,
						status                    : "Published",
						createdAt                 : new Date()
					});

					categoryObj
					.save()
					.then(data=>{
						let returnData = {
											_id                 : data._id, 
											category            : catgName, 
											categoryNameRlang   : categoryNameRlang,
											subCategory_ID      : (data.subCategory && data.subCategory.length > 0 ? data.subCategory[0]._id : null) 
										}
						// console.log("1. returnData => ",returnData)
						resolve(returnData);
					})
					.catch(err =>{
						console.log(err);
						reject(err);
					});
				})
			}else{                
				if (categoryPresent.subCategory) {
					var subcatg = categoryPresent.subCategory.find(subcatgObj => subcatgObj.subCategoryTitle === subcatgName);
					
					if(subcatg !== undefined){
						let returnData = {
											_id                 : categoryPresent._id, 
											category            : catgName, 
											categoryNameRlang   : categoryNameRlang,
											subCategory_ID      : subcatg._id 
										}
						// console.log("2. returnData => ",returnData)
						resolve(returnData);
					}else if(subcatgName !== undefined){  
						Category.updateOne(
							{ _id:categoryPresent._id},  
							{
								$push:  { 
									'subCategory' : {
										subCategoryTitle    : subcatgName, 
										subCategoryUrl      : subcarUrl,
										index               : addRowLength,                                        
										status              : "Published", 
										subCategoryCode     : 1+'|'+addRowLength
									}
								}
							}
						)
						.exec()
						.then(addedsubcat=>{
							if (addedsubcat.nModified == 1 ) {
								Category.findOne({ category : catgName})
								.exec()
								.then(categoryObject=>{
									if(categoryObject){  
										let returnData = {
															_id                 : categoryPresent._id, 
															category            : categoryPresent.category,
															categoryNameRlang   : categoryPresent.categoryNameRlang, 
															subCategory_ID      : categoryObject.subCategory[categoryObject.subCategory.length-1]._id
														}
										// console.log("3. returnData => ",returnData)
										resolve(returnData);
									}else{
										resolve(0);
									}
								})
							}
						})
						.catch(err =>{
							console.log(err);
							reject(err);
						});                    
					}else {                          
						Category.findOne({ category : catgName})
						.exec()
						.then(categoryObject=>{
							// console.log("categoryObject.subCategory.length-1 => ",categoryObject.subCategory.length-1)
							if(categoryObject){  
								let returnData = {
													_id                 : categoryPresent._id, 
													category            : categoryPresent.category,
													categoryNameRlang   : categoryPresent.categoryNameRlang, 
													subCategory_ID      : categoryObject.subCategory && categoryObject.subCategory.length > 0 ? categoryObject.subCategory[categoryObject.subCategory.length-1]._id : null
												}                                 
								resolve(returnData);
								// console.log("4. returnData => ",returnData)
							}else{
								resolve(0);
							}
						})                            
					}
				}else{
					let returnData = {
										_id                 : categoryPresent._id, 
										category            : categoryPresent.category,
										categoryNameRlang   : categoryPresent.categoryNameRlang,
										subCategory_ID      : (data.subCategory && data.subCategory.length > 0 ? data.subCategory[0]._id : null) 
									}
					// console.log("5. returnData => ",returnData)
					resolve(returnData);
				}                
			}
		}        
	})                   
} 

function findSection(sectionName) {
	return new Promise(function(resolve,reject){  
	Sections.findOne({ section : { "$regex": sectionName, $options: "i"} })
				.exec()
				.then(sectionObject=>{
					if(sectionObject){
						resolve(sectionObject);
					}else{
						resolve(0);
					}
				})
	})           
}

function findCat(catgName) {
	return new Promise(function(resolve,reject){  
	Category.findOne({ category : { "$regex": catgName, $options: "i"} })
				.exec()
				.then(categoryObject=>{
					if(categoryObject){
						resolve(categoryObject);
					}else{
						resolve(0);
					}
				})
	})
	.catch(err =>{
		console.log(err);
		reject(err);
	});
}


function findCategory(catgName, section_id) {
	return new Promise(function(resolve,reject){  
	Category.findOne({ category : { "$regex": catgName, $options: "i"}, section_ID : ObjectId(section_id) })
				.exec()
				.then(categoryObject=>{
					// console.log("categoryObject=> ", categoryObject);
					if(categoryObject){
						resolve(categoryObject);
					}else{
						resolve(0);
					}
				})
	})
	.catch(err =>{
		console.log(err);
		reject(err);
	});
}

var fetchAllData = async ()=>{
	return new Promise(function(resolve,reject){ 
	ExpenseTypeMaster.find({type : 'NO TAX'})
		.exec()
		.then(data=>{
			// console.log("taxdata")
			resolve( data );
		})
		.catch(err =>{
			reject(err);
		}); 
	});
};

var fetchAllEntities = async (type) => {
	return new Promise(function (resolve, reject) {
		EntityMaster.find({entityType:type})
			.sort({ createdAt: -1 })
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				reject(err);
			});
	});
};

/* ============== Fetch all Sections ============== */
var fetchAllSections = async (type) => {
	return new Promise(function (resolve, reject) {
		Sections.find({},{section : 1})
			.then(data => {
				// console.log("Section Data => ", data);
				resolve(data);
			})
			.catch(err => {
				reject(err);
			});
	});
};

/* ============== Fetch all Categories ============== */
var fetchAllCategories = async (type) => {
	return new Promise(function (resolve, reject) {
		Category.find()
			.sort({ createdAt: -1, })
			.then(data => {
				resolve(data);
			})
			.catch(err => {
				reject(err);
			});
	});
};

function findTax(taxname) {
	return new Promise(function(resolve,reject){  
		ExpenseTypeMaster.findOne({ type : { "$regex": taxname.toUpperCase(), $options: "i"} })
				.exec()
				.then(taxObject=>{
					if(taxObject){
						resolve(taxObject);
					}else{
						resolve(0);
					}
				})
	})
	.catch(err =>{
		console.log(err);
		reject(err);
	});
}


function taxInsert(taxName,taxRate) {
	// console.log("taxName,taxRate",taxName,taxRate)
	return new Promise(function(resolve,reject){  
		maindata()
		async function maindata(){
			var taxPresent = await findTax(taxName);
			// console.log("taxPresent",taxPresent)
				if (taxPresent === 0) {
					const expenseTypeMaster = new ExpenseTypeMaster({
						_id           : new mongoose.Types.ObjectId(),
						type          : taxName ? taxName.toUpperCase() : 'No Tax',
						GSTRate       : taxRate,
						CGSTRate      : taxRate > 0 ? taxRate/2 : 0,
						SGSTRate      : taxRate > 0 ? taxRate/2 : 0,
						IGSTRate      : taxRate,
						createdAt     : new Date(),
					})
					expenseTypeMaster.save()
					.then(data=>{
						// console.log(" insertExpenseType data",data)
						resolve(data);
					})
					.catch(err =>{
						reject(err);
					});

				}else{
					resolve(0);
				}
	
		}        
	 })
}


var insertProduct = async (section_ID, section, categoryObject, data,taxObject,EntityData = []) => {
	// console.log('insertProduct data>>>>>>',data);
	// console.log("EntityData in product insert => ",EntityData)
	// console.log("categoryObject in product => ",categoryObject)
	return new Promise(function(resolve,reject){ 
		productDuplicateControl();
		async function productDuplicateControl(){
			var productPresent = await findProduct(data.productCode, data.itemCode,data.productName);
			// var vendorData = EntityData.map((vendorarr, i)=>{
			//        return vendorarr.companyName;
			//     })
			// var productEntity  = await findVendor(vendorData);
			var productEntity  = EntityData[0];
			var vendor = '';
			// console.log('vendorData',data.vendor);
			// console.log('vendorData',data.vendor);
			// console.log("productEntity",productEntity)
			// console.log("unit from record => ",data.unit)
			// console.log("(data.unit) => ",(data.unit))

			if(data.unit !== undefined){
			   var insertUOM = await insertUnitOfMeasurment(data.unit);
			//    console.log("insertUOM => ",insertUOM)
			}else{
				var insertUOM = await insertUnitOfMeasurment("number");
				// console.log("insertUOM => ",insertUOM)
			}

			if(data.vendor != undefined && data.vendor != ''){
				vendor = data.vendor ? data.vendor.split('|')[1] : null;
			}else{
				vendor =  null;
			}
			if (productPresent === 0) {
				var finalAttrArr = [];
				if(data.attributes){
				var attributeArr = data.attributes.map((arr, i)=>{
					var obj = {};
					obj.index = i;
					obj.attributeName = arr.attributeName,
					obj.attributeValue = arr.attributeValue
					finalAttrArr.push(obj)
				});}
				
					const products = new Products({
						_id                       : new mongoose.Types.ObjectId(),   
						user_ID                   : vendor,  
						vendor_ID                 : ObjectId(productEntity._id), 
						vendorName                : productEntity.companyName,  
						section_ID                : section_ID,           
						section                   : section,      
						category                  : categoryObject.category,
						categoryNameRlang         : categoryObject.categoryNameRlang,
						category_ID               : categoryObject._id,
						subCategory               : data.subCategory,
						subCategory_ID            : categoryObject.subCategory_ID,
						brand                     : data.brand ? data.brand : "",
						brandNameRlang            : data.brandNameRlang ? data.brandNameRlang : "",
						productCode               : data.productCode ? data.productCode : "",
						itemCode                  : data.itemCode ? data.itemCode : "",
						productName               : data.productName,
						productNameRlang          : data.productNameRlang ? data.productNameRlang : "",
						productUrl                : data.productName ? (data.productName).replace(/\s+/g, '-').toLowerCase() : '',
						productDetails            : data.productDetails ? data.productDetails : "",
						shortDescription          : data.shortDescription ? data.shortDescription : "",
						productReturnable          : data.productReturnable ? data.productReturnable : "non-returnable",
						featureList               : data.featureList ? data.featureList : "",
						attributes                : data.attributes ? finalAttrArr : [],
						currency                  : data.currency ? data.currency.toLowerCase() : "inr",
						originalPrice             : data.originalPrice ? data.originalPrice : 0,
						discountPercent           : data.discountPercent ? data.discountPercent : 0,  
						discountedPrice           : data.discountPercent == 0 ? (data.originalPrice ? data.originalPrice : 0) : data.discountedPrice,
						offeredPrice              : data.offeredPrice ? data.offeredPrice : "",
						actualPrice               : data.actualPrice ? data.actualPrice : "",
						availableQuantity         : data.availableQuantity ? data.availableQuantity : "",
						status                    : "Draft",
						offered                   : data.offered,
						unit                      : data.unit ? data.unit : "",
						size                      : data.size ? data.size : "",
						universalProductCode      : data.UPC ? data.UPC : "",
						color                     : data.color ? data.color : "",
						exclusive                 : data.exclusive,
						featured                  : data.featured,
						newProduct                : data.newProduct,
						bestSeller                : data.bestSeller,
						vendorBarcode             : data.vendorBarcode,
						vendorItemcode            : data.vendorItemcode,  
						tags                      : data.tags,
						taxInclude                : data.taxInclude,
						taxName                   : taxObject ? taxObject.taxName : 'No Tax',
						taxRate                   : taxObject ? (taxObject.GSTRate == undefined && taxObject.GSTRate != ''  ? 0 : taxObject.GSTRate ) : 0,
						fileName                  : data.filename,
						createdBy                 : ObjectId(data.createdBy),
						createdAt                 : new Date()
					});
			 
				products
				.save()
				.then(data=>{
					// console.log("product added => ",data);
					const productInventory = new ProductInventory({
						_id                       : new mongoose.Types.ObjectId(), 
						vendor_ID                 : ObjectId(data.vendor_ID), 
						universalProductCode      : data.universalProductCode ? data.universalProductCode : "",
						productCode               : data.productCode ? data.productCode : "",
						itemCode                  : data.itemCode ? data.itemCode : "",
						productName               : data.productName,
						shortDescription          : data.shortDescription ? data.shortDescription : "",
						productReturnable         : data.productReturnable ? data.productReturnable : "",
						currentQuantity           : data.availableQuantity ? data.availableQuantity : "",
						originalPrice             : data.originalPrice,
						discountPercent           : data.discountPercent,
						discountedPrice           : data.discountedPrice, 
						inwardDetails             : [ 
														{
															date                : new Date(),
															qty                 : data.availableQuantity,
															originalPrice       : data.originalPrice,
															discountPercent     : data.discountPercent,
															discountedPrice     : data.discountedPrice, 
															addedBy             : ObjectId(data.createdBy),
														}
						],
						createdBy                 : ObjectId(data.createdBy),
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
					resolve(data._id);
				})
				.catch(err =>{
					console.log("error---------",err);
					reject(err);
				});
			}else{
				resolve(0);
			}
		}
	})
}

function findProduct(productCode, itemCode, productName) {
	return new Promise(function(resolve,reject){  
	Products.findOne({
						"productCode"    : productCode ,
						"itemCode"       : itemCode ,                        
					})
				.exec()
				.then(productObject=>{
					if(productObject){
						resolve(productObject);
					}else{
						resolve(0);
					}
				})
	})           
}
function findVendor(company_Name) {
	return new Promise(function(resolve,reject){  
	EntityMaster.findOne({"companyName"    : company_Name})
		.exec()
		.then(companyName=>{
			// console.log("companyName data in findVendor",companyName);
			if(companyName){
				resolve(companyName);
			}else{
				resolve(0);
			}
		})
	})           
}
exports.filedetails = (req,res,next)=>{
	var finaldata = {};
	Products.find({fileName:req.body.fileName})
	.exec()
	.then(data=>{
		//finaldata.push({goodrecords: data})
		finaldata.goodrecords = data;
		FailedRecords.find({fileName:req.body.fileName})  
			.exec()
			.then(badData=>{
				finaldata.failedRecords = badData[0].failedRecords
				finaldata.totalRecords = badData[0].totalRecords
				res.status(200).json(finaldata);
			})
		
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.inventoryFileDetails = (req,res,next)=>{
	var finaldata = {};
	ProductInventory.find({'inwardDetails.fileName' : req.body.fileName})
	.exec()
	.then(data=>{
		console.log("file good => ",data)
		//finaldata.push({goodrecords: data})
		finaldata.goodrecords = data;
		FailedRecords.find({fileName:req.body.fileName})  
			.exec()
			.then(badData=>{
				console.log("badData => ",badData)
				finaldata.failedRecords = badData[0].failedRecords;
				finaldata.totalRecords = badData[0].totalRecords;
				console.log("finaldata => ",finaldata)
				res.status(200).json(finaldata);
			})
		
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.update_product = (req,res,next)=>{
	Products.find({"itemCode" : req.body.itemCode, _id: { $ne: req.body.product_ID }})
	.exec()
	.then(data =>{
	if(data && data.length > 0){
		res.status(200).json({
			"message": "Item code for this product code already exists.",
		});
	}else{
		Products.updateOne(
			{ _id:req.body.product_ID},  
			{
				$set:{
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
				productNameRlang          : req.body.productNameRlang,
				productName               : req.body.productName,
				productUrl                : req.body.productUrl,
				productDetails            : req.body.productDetails,
				shortDescription          : req.body.shortDescription,
				productReturnable          : req.body.productReturnable,
				featureList               : req.body.featureList,
				attributes                : req.body.attributes,
				currency                  : req.body.currency,
				availableQuantity         : req.body.availableQuantity,
				discountPercent           : req.body.discountPercent,
				discountedPrice           : req.body.discountedPrice,
				originalPrice             : req.body.originalPrice,
				offeredPrice              : req.body.offeredPrice,
				actualPrice               : req.body.actualPrice,
				taxId                     : req.body.taxId,
				taxName                   : req.body.taxName,
				taxInclude                : req.body.taxInclude,
				taxRate                   : req.body.taxRate, 
				status                    : req.body.status,
				tags                      : req.body.tags,
				offered                   : req.body.offered,
				unit                      : req.body.unit,
				vendorBarcode             : req.body.vendorBarcode,
				vendorItemcode            : req.body.vendorItemcode,
				size                      : req.body.size,
				universalProductCode      : req.body.universalProductCode,
				color                     : req.body.color,
				createdAt                 : new Date()
				}
			}
		)
		.exec()
		.then(updatedData=>{
			if(updatedData.nModified === 1){				
				res.status(200).json({
					"message": "Product Updated Successfully.",
					"product_ID" : data._id
				});
			}else{
				res.status(401).json({
					"message": "Product Not Found"
				});
			}
		})
		.catch(err =>{
			console.log(err);
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
exports.update_product_attribute = (req,res,next)=>{
	// console.log("update_product_attribute",req.body);
	Products.updateOne(
			// { _id: req.body.product_ID}, 
			{_id: ObjectId(req.body.product_ID)},
			{
				$set:{
					[req.body.attribute] : req.body.attributeValue,
				}
			}
		)
		.exec()
		.then(data=>{
			if(data.nModified == 1){
				res.status(200).json({
					"message": "Success",
				});
			}else{
				res.status(401).json({
					"message": "Product Not Found"
				});
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};

exports.update_product_status = (req,res,next)=>{
	Products.updateOne(
			{ _id:req.body.product_ID},  
			{
				$set:{
					"status" : req.body.status,
				}
			}
		)
		.exec()
		.then(data=>{
			if(data.nModified == 1){
				res.status(200).json({
					"message": "Success",
				});
			}else{
				res.status(401).json({
					"message": "Product Not Found"
				});
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};
exports.update_product_multiple = (req,res,next)=>{
	Products.updateMany(
			{ _id:{$in : req.body.publishData}},  
			{
				$set:{
					"status" : "Publish",
				}
			}
		)
		.exec()
		.then(data=>{
			if(data.nModified == 1){
				res.status(200).json({
					"message": "Success",
				});
			}else{
				res.status(401).json({
					"message": "Product Not Found"
				});
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};

exports.list_product = (req,res,next)=>{
	// console.log("list_product body = ", req.body);
	// console.log("1222 =======data inside ");
	// Products.find({"status": "Publish"}).sort({'productName': 1})       
	Products.find({"status": "Publish"}).sort({'itemCode': 1})  
	// Products.find().sort({'itemCode': 1})     
	.exec()
	.then(data=>{
		// console.log("1 =======data");
		// if(data.length > 0){
			 res.status(200).json(data);
		// }else{
		//      res.status(200).json("It seems that you don't have any product added or you have added products but not yet published.");
		// }
	   
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};



exports.list_limit_product_data = (req,res,next)=>{

	Products.find({"status": "Publish"}).sort({'itemCode': 1})  
	// .exec()
	.skip(parseInt(req.body.startRange))
	.limit(parseInt(req.body.limitRange))
	.then(data=>{
		// console.log("1222 =======data",data);
		// if(data.length > 0){
			 res.status(200).json(data);
		// }else{
		//      res.status(200).json("It seems that you don't have any product added or you have added products but not yet published.");
		// }
	   
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_product_with_FilterData = (req,res,next)=>{	
	console.log('list_product_with_FilterData = ', req.body);
	var selector        = {};
	selector['$and']    = [];

	if(req.body.vendor !== "" && req.body.vendor !== undefined){
		selector["$and"].push(
			{"vendor_ID" : ObjectId(req.body.vendor)}
		)
	}
	if(req.body.section !== "" && req.body.section !== undefined){
		selector["$and"].push(
			{"section_ID" : ObjectId(req.body.section)}
		)
	}
	if(req.body.category !== "" && req.body.category !== undefined){
		selector["$and"].push(
			{"category_ID" : ObjectId(req.body.category)}
		)
	}
	if(req.body.subCategory !== "" && req.body.subCategory !== undefined){
		selector["$and"].push(
			{"subCategory_ID" : ObjectId(req.body.subCategory)}
		)
	}
	if(req.body.status !== "" && req.body.status !== undefined){
		selector["$and"].push(
			{"status" : req.body.status}
		)
	}else{
		selector["$and"].push(
			{"status" : {$ne : ""}}
		)
	}
	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push({ "$vendorDetails.companyName" : {'$regex' : req.body.searchText , $options: "i" } });
		selector["$and"].push({ 
			"$or" : [
						{ "vendorDetails.companyName" 	: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "brand" 								: {'$regex' : req.body.searchText , $options: "i" } },
						{ "section" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "category" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "subCategory"						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productCode"						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "itemCode"							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorBarcode"						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorItemcode"					: {'$regex' : req.body.searchText , $options: "i" } },
					]
		})
	}
	Products.aggregate([
		{ $lookup : {
				from 				: 'entitymasters',
				localField 			: 'vendor_ID',
				foreignField 		: '_id',
				as 					: 'vendorDetails'
			}
		},	
		{ $lookup : {
				from 				: 'sections',
				localField 			: 'section_ID',
				foreignField 		: '_id',
				as 					: 'sectionDetails'
			}
		},
		{ $lookup : {
				from 				: 'categories',
				localField 			: 'category_ID',
				foreignField 		: '_id',
				as 					: 'categoryDetails'
			}
		},
		{ $match : selector },
		{ $sort: {
				createdAt : -1
			}
		},
		{$project : 
			{
				_id      							: 1,
				vendor_ID 							: 1,
				section_ID 							: 1,
				category_ID 						: 1,
				subCategory_ID 					: 1,
				section 								: 1,
				category 							: 1,
				subCategory							: 1,
				status          					: 1,
				createdAt       					: 1,
				productName							: 1,
				brand									: 1,
				productCode 						: 1,
				itemCode 							: 1,
				vendorBarcode						: 1,
				vendorItemcode						: 1,
				originalPrice 						: 1,
				// "discountPercent" 				: 1,
				// "discountedPrice" 				: 1,
				// "availableQuantity" 				: 1,
				// "featured" 							: 1,
				// "exclusive" 						: 1,
				"vendorDetails.companyName"	: 1,
				"categoryDetails.category"		: 1,
				"categoryDetails.subCategory"	: 1,
				"sectionDetails.section"		: 1,
				productImage 						: 1,
			}
		}
	])
	// .exec()
	.skip(parseInt(req.body.startRange))
	.limit(parseInt(req.body.limitRange))
	.then(async(data)=>{
		var allData 	= [];
		for (var i = 0; i < data.length; i++) {
				var subCategory = "";
				if(data[i].categoryDetails && data[i].categoryDetails.length > 0){
							// console.log("data[i].categoryDetails.subCategory => ",data[i].subCategory_ID)
					if(data[i].subCategory_ID && data[i].subCategory_ID !== undefined && data[i].subCategory_ID !== null){
						var filteredSubcategory = data[i].categoryDetails[0].subCategory.filter(subCategory => String(subCategory._id) === String(data[i].subCategory_ID));
						if(filteredSubcategory && filteredSubcategory.length > 0){
							subCategory = filteredSubcategory[0].subCategoryTitle;
							// console.log("subCategory => ",subCategory)
						}
					}
				}
				var inventoryData 		= await ProductInventory.findOne({productCode : data[i].productCode, itemCode : data[i].itemCode, vendor_ID : ObjectId(data[i].vendor_ID)},{currentQuantity : 1})
				var availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 
				let vendorBarcode 		= data[i].vendorBarcode !== undefined && data[i].vendorBarcode!==''  ? "</span><br><span class='whiteSpaceNoWrap'> Vendor Barcode: " + data[i].vendorBarcode + "</span>" : "</span><br><span class='whiteSpaceNoWrap'> Vendor Barcode: " + "NA" + "</span>"
				let vendorItemcode 		= data[i].vendorItemcode !== undefined && data[i].vendorItemcode !== '' ? "</span><br><span class='whiteSpaceNoWrap'> Vendor Itemcode: " +  data[i].vendorItemcode + "</span>" : "</span><br><span class='whiteSpaceNoWrap'>Vendor Itemcode: " + "NA" + "</span>"
				allData.push({
									"_id"                   : data[i]._id,
									"productName"           : "<div><b>"+(data[i].productName)+"</b><br></div>"+"<span class='whiteSpaceNoWrap'> Product Code: "+data[i].productCode+"</span><br><span class='whiteSpaceNoWrap'> Item Code: " + data[i].itemCode + "</span>" 								
																		+ vendorBarcode +vendorItemcode,
									"productCode"           : data[i].productCode,
									"itemCode"					: data[i].itemCode,
									// +"</span><br><span class='whiteSpaceNoWrap'> Item Code: " + data[i].itemCode + "</span>" 								
																// + vendorBarcode +vendorItemcode, 
									"vendorName"            : data[i].vendorDetails && data[i].vendorDetails.length > 0 ? data[i].vendorDetails[0].companyName : "-",
									"section"               : data[i].sectionDetails && data[i].sectionDetails.length > 0 ? data[i].sectionDetails[0].section : "-",
									"category"              : data[i].categoryDetails && data[i].categoryDetails.length > 0 ? data[i].categoryDetails[0].category : "-",
									"subCategory"           : subCategory,
									"brand"           		: data[i].brand,
									"originalPrice"         : "<span class='textAlignRight whiteSpaceNoWrap'> AED " + data[i].originalPrice.toFixed(2) + "</span>",
									// "discountPercent"       : "<span class='textAlignRight'>" + data[i].discountPercent + "%" + "</span>",
									// "discountedPrice"       : "<span class='textAlignRight'>" + (data[i].discountedPrice).toFixed(2) + "</span>",
									"availableQuantity"     : availableQuantity,
									// "featured"              : data[i].featured,
									// "exclusive"             : data[i].exclusive,
									"status"                : data[i].status,
									"productImage" 			: data[i].productImage
								})
			}
		// })
		if(i >= data.length){
			// console.log(allData)
			res.status(200).json({
				// dataCount 	: data.length,
				data 			: allData
			});
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};


exports.list_productimage_with_vendor = (req,res,next)=>{
	Products.find({"vendor_ID": req.params.vendorID })       
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.list_product_code = (req,res,next)=>{
	Products.find({"productCode": req.params.productCode})       
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.wishlist_product = (req,res,next)=>{
	// console.log('req.body.productIDs', req.body);
	Products.find({ "_id": { $in: req.body } })       
		.exec()
		.then(data=>{
			res.status(200).json(data);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};


exports.list_productby_type_mobile = (req,res,next)=>{
	// console.log("req.params=>",req.params);
	var {productType,user_ID,limit} = req.params;
	// console.log("user_ID",user_ID);
	var selector={};
	if(productType == 'featured'){
		selector={'featured':true,  "status": "Publish"};
	}
	else if(productType == 'exclusive'){
		selector={'exclusive':true,  "status": "Publish"};
	}
	else if(productType == 'discounted'){
		selector={'discountPercent': { $gt:0 } ,  "status": "Publish"};
	}
	else if(productType == 'bestSeller'){
		selector={'bestSeller':true,  "status": "Publish"};
	}
  
	Products.find(selector) 
	.limit(parseInt(limit))      
	.exec()
	.then(products=>{
		if(products){
			for (let k = 0; k < products.length; k++) {
				products[k] = {...products[k]._doc, isWish:false};
			}
			if(user_ID!=='null'){
				Wishlists.find({user_ID:user_ID})
				.then(wish=>{
					if(wish.length > 0){
						for(var i=0; i<wish.length; i++){
							for(var j=0; j<products.length; j++){
								if(String(wish[i].product_ID) === String(products[j]._id)){
									products[j]= {...products[j], isWish:true};
									break;
								}
							}
						}   
						if(i >= wish.length){
							res.status(200).json(products);
						}       
					}else{
						res.status(200).json(products);
					}
				 })
				 .catch(err =>{
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(200).json(products);
			}    
		}else{
			res.status(404).json('Product Details not found');
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_product_bySection = (req,res,next)=>{
	var section = req.params.section;
	// console.log("section: +++++++++++++++++++++++",section);
	selector={'section':section,  "status": "Publish"}   
	// Products.find({"status": "Publish"}).sort({'itemCode': 1})       
	Products.find({'section':section,  "status": "Publish"}).sort({'itemCode': 1}) 
	.exec()
	.then(data=>{
		res.status(200).json(data);       
	   
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_product_bySection_mobile = (req,res,next)=>{
	var section = req.params.section;
	selector={'section':section,  "status": "Publish"}    
	Products.find({'section':section,  "status": "Publish"}).sort({'itemCode': 1}) 
	.limit(6)
	.exec()
	.then(data=>{
		res.status(200).json(data);       
	   
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_related_products = (req,res,next)=>{
	var attribute_id = req.params.attribute_id;  
	Products.find({
		$or : [
			{"section_ID" : ObjectId(attribute_id)}, 
			{"category_ID" : ObjectId(attribute_id)},
			{"suCategory_ID" : ObjectId(attribute_id)}
		]
	}) 
	.exec()
	.then(data=>{
		// console.log("data => ",data);
		if (data && data.length > 0) {
			res.status(200).json(true);       
		}else{
			res.status(200).json(false);
		}	   
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_productby_type = (req,res,next)=>{
	var productType = req.params.productType;
	selector={};
	if(productType == 'featured'){
		selector={'featured':true,  "status": "Publish"};
		Products.find(selector)       
		.exec()
		.then(data=>{
			res.status(200).json(data);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}
	else if(productType == 'exclusive'){
		selector={'exclusive':true,  "status": "Publish"};
		Products.find(selector)       
		.exec()
		.then(data=>{
			
			res.status(200).json(data);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}
	else if(productType == 'discounted'){
		selector={'discountPercent': { $gt:0 } ,  "status": "Publish"};
		Products.find(selector)       
		.exec()
		.then(data=>{
			// console.log('discounted ===>>>', data);
			res.status(200).json(data);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}
	else if(productType == 'bestSeller'){
		selector={'bestSeller':true,  "status": "Publish"};
		Products.find(selector)       
		.exec()
		.then(data=>{
			res.status(200).json(data);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}
	else{
		res.status(200).json([]);
	}
	
};
exports.list_productby_type_category = (req,res,next)=>{
	var productType = req.params.productType;
	var categoryID = req.params.categoryID;
	var selector={};
	if(productType == 'featured'){
		selector={'featured':true, 'category_ID':categoryID, "status": "Publish"};
	} else if(productType == 'exclusive'){
		selector={'exclusive':true,  'category_ID':categoryID,"status": "Publish"}; 
	} else if(productType == 'newProduct'){
		selector={'newProduct':true,  'category_ID':categoryID,"status": "Publish"};
	} else if(productType == 'bestSeller'){
		selector={'bestSeller':true,  'category_ID':categoryID,"status": "Publish"};
	}
	Products.find(selector)       
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_product_with_limits = (req,res,next)=>{	

	// console.log('list_product_with_limits body = ', req.body);

	// console.log('req', req.body);

	var selector        = {};
	selector['$and']    = [];

	if(req.body.vendor !== "" && req.body.vendor !== undefined){
		selector["$and"].push({"vendor_ID" : ObjectId(req.body.vendor)});
	}
	if(req.body.section !== "" && req.body.section !== undefined){
		selector["$and"].push( {"section_ID" : ObjectId(req.body.section)} );
	}
	if(req.body.category !== "" && req.body.category !== undefined){
		selector["$and"].push( {"category_ID" : ObjectId(req.body.category)} ); 
	}
	if(req.body.subCategory !== "" && req.body.subCategory !== undefined){
		selector["$and"].push( {"subCategory_ID" : ObjectId(req.body.subCategory)} );
	}
	if(req.body.status !== "" && req.body.status !== undefined){
		selector["$and"].push( {"status" : req.body.status} );
	}else{
		selector["$and"].push( {"status" : {$ne : ""}} );
	}
	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push({ "$vendorDetails.companyName" : {'$regex' : req.body.searchText , $options: "i" } });
		selector["$and"].push({ 
			"$or" : [
						{ "vendorDetails.companyName"	: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productName" 					: {'$regex' : req.body.searchText , $options: "i" } },
						{ "brand" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "section" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "category" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "subCategory"					: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productCode"					: {'$regex' : req.body.searchText , $options: "i" } },
						{ "itemCode"						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorItemcode"				: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorBarcode"					: {'$regex' : req.body.searchText , $options: "i" } },
					]
		})
	}

						// { "subCategory"											: {'$regex' : req.body.searchText , $options: "i" } },
						// { "sectionDetails.section" 							: {'$regex' : req.body.searchText , $options: "i" } },
						// { "categoryDetails.category" 							: {'$regex' : req.body.searchText , $options: "i" } },
						// { "categoryDetails.subCategory.subCategoryTitle": {'$regex' : req.body.searchText , $options: "i" } },

	Products.aggregate([
		{ $lookup : {
				from 				: 'entitymasters',
				localField 			: 'vendor_ID',
				foreignField 		: '_id',
				as 					: 'vendorDetails'
			}
		},	
		{ $lookup : {
				from 				: 'sections',
				localField 			: 'section_ID',
				foreignField 		: '_id',
				as 					: 'sectionDetails'
			}
		},
		{ $lookup : {
				from 				: 'categories',
				localField 			: 'category_ID',
				foreignField 		: '_id',
				as 					: 'categoryDetails'
			}
		},
		{ $match : selector },
		{ $sort: {
				createdAt : -1
			}
		},
		{$project : 
			{
				_id      							: 1,
				vendor_ID 							: 1,
				section_ID 							: 1,
				category_ID 						: 1,
				subCategory_ID 						: 1,
				status          					: 1,
				createdAt       					: 1,
				"productName"						: 1,
				"brand"								: 1,
				"productCode" 						: 1,
				"itemCode" 							: 1,
				"vendorBarcode"						: 1,
				"vendorItemcode"					: 1,
				"originalPrice" 					: 1,
				"discountPercent" 					: 1,
				"discountedPrice" 					: 1,
				"availableQuantity" 				: 1,
				"featured" 							: 1,
				"exclusive" 						: 1,
				"vendorDetails.companyName"	        : 1,
				"categoryDetails.category"		    : 1,
				"categoryDetails.subCategory"	    : 1,
				"sectionDetails.section"		    : 1
			}
		}
	])
	// .exec()
	.skip(parseInt(req.body.startRange))
	.limit(parseInt(req.body.limitRange))
	.then(async(data)=>{
		var allData = []
		for (var i = 0; i < data.length; i++) {
				var subCategory = "";
				if(data[i].categoryDetails && data[i].categoryDetails.length > 0){
							// console.log("data[i].categoryDetails.subCategory => ",data[i].subCategory_ID)
					if(data[i].subCategory_ID && data[i].subCategory_ID !== undefined && data[i].subCategory_ID !== null){
						var filteredSubcategory = data[i].categoryDetails[0].subCategory.filter(subCategory => String(subCategory._id) === String(data[i].subCategory_ID));
						if(filteredSubcategory && filteredSubcategory.length > 0){
							subCategory = filteredSubcategory[0].subCategoryTitle;
							// console.log("subCategory => ",subCategory)
						}
					}
				}
				var inventoryData 		= await ProductInventory.findOne({productCode : data[i].productCode, itemCode : data[i].itemCode, vendor_ID : ObjectId(data[i].vendor_ID)},{currentQuantity : 1})
				var availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 
				// console.log("availableQuantity => ",availableQuantity)
				let vendorBarcode =  data[i].vendorBarcode !== undefined && data[i].vendorBarcode!==''  ? "</span><br><span class='whiteSpaceNoWrap'> Vendor Barcode: " + data[i].vendorBarcode + "</span>" : "</span><br><span class='whiteSpaceNoWrap'> Vendor Barcode: " + "NA" + "</span>"
				let vendorItemcode = data[i].vendorItemcode !== undefined && data[i].vendorItemcode !== '' ? "</span><br><span class='whiteSpaceNoWrap'> Vendor Itemcode: " +  data[i].vendorItemcode + "</span>" : "</span><br><span class='whiteSpaceNoWrap'>Vendor Itemcode: " + "NA" + "</span>"
				allData.push({
									"_id"                   : data[i]._id,
									// "productNameBasic"      : data[i].productName + "<br>Product Code: "+data[i].productCode+ "<br>Item Code: "+data[i].itemCode,
									// "productNameRlang"      : data[i].productNameRlang,
									"productName"           : "<div><b>"+(data[i].productName)+"</b><br></div>"+"<span class='whiteSpaceNoWrap'> Product Code: "+data[i].productCode+"</span><br><span class='whiteSpaceNoWrap'> Item Code: " + data[i].itemCode + "</span>" 								
																// + "</span><br><span class='whiteSpaceNoWrap'> Vendor Barcode: " + data[i].vendorBarcode !== undefined ? data[i].vendorBarcode : "NA" + "</span>" 
																// + "</span><br><span class='whiteSpaceNoWrap'> Vendor Itemcode: " + data[i].vendorItemcode + "</span>" ,
																+ vendorBarcode +vendorItemcode, 
									"vendorName"            : data[i].vendorDetails && data[i].vendorDetails.length > 0 ? data[i].vendorDetails[0].companyName : "-",
									"section"               : data[i].sectionDetails && data[i].sectionDetails.length > 0 ? data[i].sectionDetails[0].section : "-",
									"category"              : data[i].categoryDetails && data[i].categoryDetails.length > 0 ? data[i].categoryDetails[0].category : "-",
									"subCategory"           : subCategory,
									"brand"           		: data[i].brand,
									"originalPrice"         : "<span class='textAlignRight'>" + (data[i].originalPrice).toFixed(2) + "</span>",
									"discountPercent"       : "<span class='textAlignRight'>" + data[i].discountPercent + "%" + "</span>",
									"discountedPrice"       : "<span class='textAlignRight'>" + (data[i].discountedPrice).toFixed(2) + "</span>",
									"availableQuantity"     : availableQuantity,
									"featured"              : data[i].featured,
									"exclusive"             : data[i].exclusive,
									"status"                : data[i].status
								})
			}
		// })
		if(i >= data.length){
			// console.log(allData)
			res.status(200).json({
				// dataCount 	: allData.length,
				data 			: allData
			});
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.count_all_products = (req,res,next)=>{	
	// console.log('req', req.body);
	var selector        = {};
	selector['$and']    = [];

	if(req.body.vendor !== "" && req.body.vendor !== undefined){
		selector["$and"].push(
			{"vendor_ID" : ObjectId(req.body.vendor)}
		)
	}
	if(req.body.section !== "" && req.body.section !== undefined){
		selector["$and"].push(
			{"section_ID" : ObjectId(req.body.section)}
		)
	}
	if(req.body.category !== "" && req.body.category !== undefined){
		selector["$and"].push(
			{"category_ID" : ObjectId(req.body.category)}
		)
	}
	if(req.body.subCategory !== "" && req.body.subCategory !== undefined){
		selector["$and"].push(
			{"subCategory_ID" : ObjectId(req.body.subCategory)}
		)
	}
	if(req.body.status !== "" && req.body.status !== undefined){
		selector["$and"].push(
			{"status" : req.body.status}
		)
	}else{
		selector["$and"].push(
			{"status" : {$ne : ""}}
		)
	}
	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push({ "$vendorDetails.companyName" : {'$regex' : req.body.searchText , $options: "i" } });
		selector["$and"].push({ 
			"$or" : [
						{ "vendorDetails.companyName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "sectionDetails.section" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.category" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.subCategory.subCategoryTitle": {'$regex' : req.body.searchText , $options: "i" } },
						{ "productCode"						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "itemCode"							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorItemcode"							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "vendorBarcode"							: {'$regex' : req.body.searchText , $options: "i" } },
					]
		})
	}
	Products.aggregate([
		{ $lookup : {
				from 				: 'entitymasters',
				localField 			: 'vendor_ID',
				foreignField 		: '_id',
				as 					: 'vendorDetails'
			}
		},	
		{ $lookup : {
				from 				: 'sections',
				localField 			: 'section_ID',
				foreignField 		: '_id',
				as 					: 'sectionDetails'
			}
		},
		{ $lookup : {
				from 				: 'categories',
				localField 			: 'category_ID',
				foreignField 		: '_id',
				as 					: 'categoryDetails'
			}
		},
		{ $match : selector },
		{ $sort: {
				createdAt : -1
			}
		}
	])
	.exec()
	.then(data=>{		
		res.status(200).json({
			dataCount 	: data.length
		});
		
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_product_with_vendor = (req,res,next)=>{
	// console.log('1503 ====> req', req.body);
	Products.find({"vendor_ID" : req.body.vendor_ID})
	.sort({ "createdAt": -1 })
	.exec()
	.then(data=>{
		var allData = data.map((x, i)=>{
			var productNameRlang = x.productNameRlang ? "<br><span class='RegionalFont'>"+x.productNameRlang+"</span>" : '';
			var categoryNameRlang = x.categoryNameRlang ? "<br><span class='RegionalFont'>"+x.categoryNameRlang+"</span>" : '';

			return {
				"_id"                   : x._id,
				"vendorName"            : x.vendorName,
				"productNameBasic"      : x.productName + "<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				"productNameRlang"      : x.productNameRlang,
				"productName"           : x.productName +productNameRlang+"<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				"section"               : x.section,
				"category"              : x.category +categoryNameRlang,
				"originalPrice"         : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.originalPrice,
				"discountPercent"       : x.discountPercent+"%",
				"discountedPrice"       : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.discountedPrice,
				"availableQuantity"     : x.availableQuantity,
				"featured"              : x.featured,
				"exclusive"             : x.exclusive,
				"status"                : x.status
			}
		})
		res.status(200).json(allData.slice(req.body.startRange, req.body.limitRange));
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.count_product = (req,res,next)=>{
	Products.find({})
	.exec()
	.then(data=>{
		var allData = data.map((x, i)=>{

			return {
				"_id"                   : x._id,
				"productCode"           : x.productCode,
				"itemCode"              : x.itemCode,
				"productName"           : x.productName,
				"featured"              : x.featured,
				"exclusive"             : x.exclusive,
				"newProduct"            : x.newProduct,
				"bestSeller"            : x.bestSeller,
				"status"                : x.status
			}
		})
		res.status(200).json({"dataCount":allData.length});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.new_count_product = (req,res,next)=>{
	Products.count()
	.exec()
	.then(data=>{
		console.log("data count => ", data);
		res.status(200).json({"dataCount":data});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};



exports.count_published_product = (req,res,next)=>{
	Products.find({'status' : 'Publish'})
	.exec()
	.then(data=>{
		var allData = data.map((x, i)=>{
			return {
				"_id"                   : x._id,
				"productCode"           : x.productCode,
				"itemCode"              : x.itemCode,
				"productName"           : x.productName,
				"featured"              : x.featured,
				"exclusive"             : x.exclusive,
				"newProduct"            : x.newProduct,
				"bestSeller"            : x.bestSeller,
				"status"                : x.status
			}
		})
		res.status(200).json({"dataCount":allData.length});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
}; 

exports.count_vendor_product = (req,res,next)=>{
	Products.find({"vendor_ID": req.params.vendorID}).count()
	.exec()
	.then(data=>{
		// console.log(data)
		res.status(200).json({"dataCount":data});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.fetch_product = (req,res,next)=>{
	// console.log("req.body => ",req.body);
	Products.findOne({"_id" : req.body.product_id})
	.then(product=>{
		Products.find({productCode : product.productCode, vendor_ID : ObjectId(req.body.vendor_id)})
		.populate("vendor_ID")
		.then(async(products)=>{
			// console.log("products => ",products)
			if(products && products.length > 0){
				// product = {...product._doc, isWish : false};
				// console.log("user_ID",user_ID);
				var variants = [...products.reduce((product, {size,color}) => {
					if (!product.has(size)) product.set(size, {size,color: []});
					product.get(size).color.push(color);
					return product;
				}, new Map()).values()];

				// console.log("variants => ",variants)

				// const uniqueSizes = [...new Set(products.map(item => String(item.size)))];
				// console.log("uniqueSizes => ",uniqueSizes)
				// const uniqueColors = [...new Set(products.map(item => String(item.color)))];
				// console.log("uniqueColors => ",uniqueColors)

				if(req.body.user_id && req.body.user_id !== 'null' && req.body.user_id !== undefined){
					for (var i = 0; i < products.length; i++) {
						var inventoryData               = await ProductInventory.findOne({productCode : products[i].productCode, itemCode : products[i].itemCode, vendor_ID : ObjectId(products[i].vendor_ID._id)},{currentQuantity : 1})
						// console.log("inventoryData => ",inventoryData)
						products[i]                     = {...products[i]._doc, isWish : false}; 
						products[i].availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 
						products[i].vendorLocation_id   = await products[i].vendor_ID.locations && products[i].vendor_ID.locations.length > 0 
															? 
																products[i].vendor_ID.locations[0]._id 
															: 
																"";
						products[i].vendor_ID = products[i].vendor_ID._id;  
						var wish = await Wishlists.find({user_ID : req.body.user_id})
						// console.log("wish => ",wish)
						if(wish && wish.length > 0){
							
							// console.log("product => ",products[i])
							for(var j=0; j<wish.length; j++){
								if(String(wish[j].product_ID) === String(products[i]._id)){
									products[i] = {...products[i], isWish : true};                                        
									break;
								}
							}   
							// if(j >= wish.length){
														//     res.status(200).json(product);
							// }       
						}else{
							console.log("No wished Products");
							// res.status(200).json(products);
						}                                         
					}
					if(i >= products.length){
						res.status(200).json({
							products    : products,
							variants    : variants
						});
					}
				}else{
					for (var i = 0; i < products.length; i++) {
						var inventoryData               = await ProductInventory.findOne({productCode : products[i].productCode, itemCode : products[i].itemCode, vendor_ID : ObjectId(products[i].vendor_ID._id)},{currentQuantity : 1});
						// console.log("inventoryData => ",inventoryData);
						products[i].availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 
					}
					if(i >= products.length){
						res.status(200).json({
							products    : products,
							variants    : variants
						});
					}                    
				}    
			}else{
				res.status(200).json({
					products    : products,
					variants    : variants
				});
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error : err
			});
		});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error : err
		});
	});
};


// exports.fetch_product = (req,res,next)=>{
//     const {user_ID}=req.params;
//     Products.findOne({_id : req.params.productID})
//     .exec()
//     .then(product=>{
//         if(product){
//             product = {...product._doc, isWish:false};
//             // console.log("user_ID",user_ID);
//             if(user_ID && user_ID!=='null'){
//                 Wishlists.find({user_ID:user_ID})
//                 .then(wish=>{
//                     // console.log("wish",wish);
//                     if(wish.length > 0){
//                         for(var i=0; i<wish.length; i++){
//                             if(String(wish[i].product_ID) === String(product._id)){
//                                 product= {...product, isWish:true};
//                                 break;
//                             }
//                         }   
//                         if(i >= wish.length){
//                             res.status(200).json(product);
//                         }       
//                     }else{
//                         res.status(200).json(product);
//                     }
//                  })
//                  .catch(err =>{
//                     console.log(err);
//                     res.status(500).json({
//                         error: err
//                     });
//                 });
//             }else{
//                 res.status(200).json(product);
//             }    
//         }else{
//             res.status(200).json(product);
//         }
//     })
//     .catch(err =>{
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// };

exports.fetch_One_product = (req,res,next)=>{
	Products.findOne({_id : req.params.productID})
	.exec()
	.then(async(product)=>{
		if(product){
			// console.log("user_ID",user_ID);
			var inventoryData               = await ProductInventory.findOne({productCode : product.productCode, itemCode : product.itemCode, vendor_ID : ObjectId(product.vendor_ID._id)},{currentQuantity : 1});
			// console.log("inventoryData => ",inventoryData);
			product.availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 
			res.status(200).json(product);
			 
		}else{
			res.status(200).json(product);
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.fetch_hot_product = (req,res,next)=>{
	Products.find({ "offered": true})
	.sort({ "createdAt": 1 })
	.limit(4)
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.fetch_file = (req,res,next)=>{
	Products.find()
	.exec()
	.then(data=>{
		var x = _.unique(_.pluck(data, "fileName"));
		var z = [];
		for(var i=0; i<x.length; i++){
			var y = data.filter((a)=> a.fileName == x[i]);
			z.push({
				"fileName": x[i],
				'productCount': y.length,
				"_id" : x[i]
			})
		}
		res.status(200).json(z.slice(req.body.startRange, req.body.limitRange));
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};
exports.search_file = (req,res,next)=>{
	// console.log("search_file ",req.body);
	Products.find(
		{
			"$and" : [
			{ "$or": 
				[{"fileName" : {'$regex' : req.body.filename , $options: "i"} }]
			}]
		})

	// Products.find()
	.exec()
	.then(data=>{
		// res.status(200).json(data);
		var x = _.unique(_.pluck(data, "fileName"));
		var z = [];
		for(var i=0; i<x.length; i++){
			var y = data.filter((a)=> a.fileName == x[i]);
			z.push({
				"fileName": x[i],
				'productCount': y.length,
				"_id" : x[i]
			})
		}
		res.status(200).json(z.slice(req.body.startRange, req.body.limitRange));
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};

exports.fetch_vendor_file = (req,res,next)=>{
	Products.find({"vendor_ID" : req.body.vendor_ID})
	.exec()
	.then(data=>{
		var x = _.unique(_.pluck(data, "fileName"));
		var z = [];
		for(var i=0; i<x.length; i++){
			var y = data.filter((a)=> a.fileName == x[i]);
			z.push({
				"fileName": (x[i] ? x[i].replace(/\s+/, "") : "-").split('.')[0],
				'productCount': y.length != NaN ? "<p>"+y.length+"</p>" : "a",
				"_id" : x[i] != null ? x[i].replace(/\s+/, "")  : "-"
			})
			
		}
		res.status(200).json(z.slice(req.body.startRange, req.body.limitRange));
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};

exports.fetch_file_count = (req,res,next)=>{
	Products.find()
	.exec()
	.then(data=>{
		var x = _.unique(_.pluck(data, "fileName"));
		var z = [];
		for(var i=0; i<x.length; i++){
			var y = data.filter((a)=> a.fileName == x[i]);
			z.push({
				"fileName": x[i],
				'productCount': y.length,
				"_id" : x[i]
			})
		}
		res.status(200).json(z.length);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};
exports.fetch_vendorfile_count = (req,res,next)=>{
	// console.log('req.params.vendorID', req.params.vendorID);
	Products.find({"vendor_ID" : req.params.vendorID})
	.exec()
	.then(data=>{
		var x = _.unique(_.pluck(data, "fileName"));
		var z = [];
		for(var i=0; i<x.length; i++){
			var y = data.filter((a)=> a.fileName == x[i]);
			z.push({
				"fileName": x[i],
				'productCount': y.length,
				"_id" : x[i]
			})
		}
		res.status(200).json(z.length);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};
// changed by madhuri
exports.delete_file = (req,res,next)=>{
	// console.log("inside delete function",req.body.id);
	let filename = (req.params.fileName).toString();
	filename     = filename.replace('/',".");
	filename    = filename.replace('S'," ");
	filename    = filename.replace('%'," ");
	let file = req.body.id ? req.body.id : filename;
	// console.log(filename);

	Products.deleteMany({"fileName" : filename})
	.exec()
	.then(data=>{
		res.status(200).json({
			"message" : "Products of file "+file+" deleted successfully"
		});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};
exports.delete_product = (req,res,next)=>{
	Orders.find({"products.product_ID" : req.params.productID })
		.exec()
		.then(odata=>{
			// console.log('odata',odata);
			if (odata.length > 0) {
				res.status(200).json({
					"message": "You cannot delete this product as orders are related to this product."
				});
			}else{
				Products.deleteOne({_id:req.params.productID})
						.exec()
						.then(data=>{
							res.status(200).json({
								"message": "Product Deleted Successfully."
							});
						})
						.catch(err =>{
							console.log(err);
							res.status(500).json({
								error: err
							});
						});
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	
};
exports.upload_photo = (req,res,next)=>{
	// console.log("input = ",req.body);
	
	Products.findOne({"_id":req.body.product_ID})
	.exec()
	.then( targetProperty =>{
		Products.updateOne(
			{ "_id" : req.body.product_ID},
			{   
				$set:{                            
					"productImage" : req.body.productImage,       
				}
			}
		)
		.exec()
		.then(data=>{
			// console.log('data ',data);        
				res.status(200).json({
					"message": "Images and Video Updated"
				});
			
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});

	})
	.catch(err =>{
	console.log(err);
	res.status(500).json({
		error: err
	});
	});
};
exports.upload_photo_product_code = (req,res,next)=>{
	console.log("req.body",req.body);
	// Products.find({"itemCode" : req.body.itemCode, "productCode" : req.body.productCode, "itemCode" : req.body.itemCode, "productImage": req.body.productImage,"productSmallImage": req.body.productSmallImage})
	Products.aggregate([
		{$lookup:
			{
				from            : 'entitymasters',
				localField      : 'vendor_ID',
				foreignField    : '_id',
				as              : 'vendorDetails'
			}
		},
		{ "$unwind": "$vendorDetails" },
		{$match : {        
				"vendorDetails.companyID"   : parseInt(req.body.vendorID), 
				"productCode"               : req.body.productCode, 
				"itemCode"                  : req.body.itemCode, 
				// "productImage"              : req.body.productImage,
				// "productSmallImage"         : req.body.productSmallImage
			}
		}
	])
	.exec()
	.then(data=>{  
		// console.log("data => ",data[0])  
		if(data && data !== undefined && data !== null && data[0].productImage && data[0].productImage.length > 0 && data[0].productSmallImage && data[0].productSmallImage.length > 0){
			res.status(200).json({
				"message": "Some images are already exist."
			});
		}else{
			Products.updateOne(
				{ 
					"vendor_ID"     : ObjectId(data[0].vendorDetails._id), 
					"productCode"   : req.body.productCode, 
					"itemCode"      : req.body.itemCode,
				},
				{   
					$push:{                            
						"productImage"      : req.body.productImage,   
						"productSmallImage" : req.body.productSmallImage    
					}
				}
			)
			.exec()
			.then(updatedData=>{  
				console.log("updatedData => ",updatedData)
				res.status(200).json({
					"message": "Images uploaded successfully"
				});
			})
			.catch(err =>{
				console.log(err);
				res.status(500).json({
					error: err
				});
			});
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.remove_photo = (req,res,next)=>{
	Products.updateOne(
		{"_id": req.body.product_ID},
		{
			$pull: {
				"productImage"      : req.body.imageLink,
				"productSmallImage" : req.body.smallImageLink
			}
		}
	)
	.exec()
	.then(data=>{    
		res.status(200).json({
			"message": "Images deleted successfully"
		});
	})
	.catch(err =>{
		res.status(500).json({
			error: err
		});
	});
};
exports.list_productby_section = (req,res,next)=>{
	// console.log("inside list product by section===",req.params.sectionID);
	Products.find({section_ID : req.params.sectionID, "status": "Publish"})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.list_productby_category = (req,res,next)=>{
	var {categoryID,user_ID} = req.params;
	// console.log("req.params.categoryID",req.params.categoryID);
	Products.find({category_ID : categoryID, "status": "Publish"})
	.exec()
	.then(products=>{
		if(products){
			for (let k = 0; k < products.length; k++) {
				products[k] = {...products[k]._doc, isWish:false};
			}
			if(user_ID && user_ID!=='null'){
				Wishlists.find({user_ID:user_ID})
				.then(wish=>{
					if(wish.length > 0){
						for(var i=0; i<wish.length; i++){
							for(var j=0; j<products.length; j++){
								if(String(wish[i].product_ID) === String(products[j]._id)){
									products[j]= {...products[j], isWish:true};
									break;
								}
							}
						}   
						if(i >= wish.length){
							res.status(200).json(products);
						}       
					}else{
						res.status(200).json(products);
					}
				 })
				 .catch(err =>{
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(200).json(products);
			}    
		}else{
			res.status(404).json('Product Details not found');
		}
		// res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};


exports.similar_products = (req,res,next)=>{
	// console.log("req.body",req.body);
	var {category_ID,user_ID,vendor_ID,section_ID,subCategory_ID,section_ID,product_ID} = req.body;
	if(subCategory_ID){
		var selector = {"status": "Publish", "vendor_ID": vendor_ID, "category_ID" : category_ID, "subCategory_ID"   : subCategory_ID,"section_ID":section_ID,"_id":{$ne:product_ID}}
	}else{
		var selector = {"status": "Publish", "vendor_ID": vendor_ID, "category_ID" : category_ID,"section_ID":section_ID,"_id":{$ne:product_ID}}
	}
	Products.find(selector)
	.populate('vendor_ID')
	.exec()
	.then(async(products)=>{
		if(products && products.length > 0){
			for (let k = 0; k < products.length; k++) {
				var inventoryData             	= await ProductInventory.findOne({productCode : products[k].productCode, itemCode : products[k].itemCode, vendor_ID : ObjectId(products[k].vendor_ID._id)},{currentQuantity : 1});
				// console.log("inventoryData => ",inventoryData)
				products[k].availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 						
				products[k]                     = {...products[k]._doc, isWish : false};
				products[k].vendorLocation_id 	= await products[k].vendor_ID.locations && products[k].vendor_ID.locations.length > 0 
													? 
														products[k].vendor_ID.locations[0]._id 
													: 
														"";
				products[k].vendor_ID = products[k].vendor_ID._id; 
			}
			if(user_ID && user_ID!=='null'){
				Wishlists.find({user_ID:user_ID})
				.then(wish=>{
					if(wish.length > 0){
						for(var i=0; i<wish.length; i++){
							for(var j=0; j<products.length; j++){
								if(String(wish[i].product_ID) === String(products[j]._id)){
									products[j]= {...products[j], isWish : true};
									break;
								}
							}
						}   
						if(i >= wish.length){
							res.status(200).json(products);
						}       
					}else{
						res.status(200).json(products);
					}
				 })
				 .catch(err =>{
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(200).json(products);
			}    
		}else{
			res.status(200).json(products);
		}
		// res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};


exports.list_productby_categoryUrl = (req,res,next)=>{
	// console.log("categoryID==============",req.params.categoryUrl);
	Category.find({categoryUrl : req.params.categoryUrl})
	.exec()
	.then(data=>{
		Products.find({category_ID : data[0]._id, "status": "Publish"})
		.exec()
		.then(productData=>{
			// console.log("product category data ===:", productData);
			res.status(200).json(productData);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});

	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	}); 
};
exports.list_productby_subcategoryUrl = (req,res,next)=>{
	// var subcategory = req.params.subcategoryUrl;
	var subcategoryStr = req.params.subcategoryUrl;
	const subcategory = subcategoryStr.split("-");
	for (let i = 0; i < subcategory.length; i++) {
		subcategory[i] = subcategory[i][0].toUpperCase() + subcategory[i].substr(1);
	}
	subcategory.join(" ");
	if(subcategory){
		// console.log("subcategory",subcategory);
		Products.find({subCategory : subcategory, "status": "Publish"})
		.exec()
		.then(productData=>{
			// console.log("product subcategory data ===:", productData);
			res.status(200).json(productData);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}

};

exports.list_productby_sectionUrl = (req,res,next)=>{
	// console.log("sectionurl==============",req.params.sectionUrl);
	Sections.find({sectionUrl : req.params.sectionUrl})
	.exec()
	.then(data=>{
		// console.log("section data ===:", data);
		// res.status(200).json(data);
		Products.find({section_ID : data[0]._id, "status": "Publish"})
		.exec()
		.then(productData=>{
			// console.log("product section data ===:", productData);
			res.status(200).json(productData);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});

	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	}); 
};

exports.list_productby_subcategory = (req,res,next)=>{
	// console.log(req.params.categoryID);
	// console.log(req.params.subcategoryID);
	Products.find({category_ID : req.params.categoryID, subCategory_ID:req.params.subcategoryID, "status": "Publish"})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

// exports.search_product = (req,res,next)=>{
//     // console.log("req body in se// localStorage.setItem("pincode", response.data.pincode);arch ==>",req.body);
//     // console.log("req params in search ==>",req.params);
//     Products.find(
//             {
//                 "$and" : [
//                 { "$or": 
//                     [
//                     {"productName"                : {'$regex' : req.params.searchstr , $options: "i"} },
//                     {"brand"                      : {'$regex' : req.params.searchstr , $options: "i"} },
//                     {"section"                    : {'$regex' : req.params.searchstr , $options: "i"} },
//                     {"category"                   : {'$regex' : req.params.searchstr , $options: "i"} },
//                     {"subCategory"                : {'$regex' : req.params.searchstr , $options: "i"} },
//                     {"productDetails"             : {'$regex' : req.params.searchstr , $options: "i"} }, 
//                     {"shortDescription"           : {'$regex' : req.params.searchstr , $options: "i"} }, 
//                     {"featureList.feature"        : {'$regex' : req.params.searchstr , $options: "i"} }, 
//                     {"attributes.attributeName"   : {'$regex' : req.params.searchstr , $options: "i"} },
//                     {"attributes.attributeValue"  : {'$regex' : req.params.searchstr , $options: "i"} } 
//                     ] 
//                 },
//                 { "$or": [{"status":"Publish"}] }
//                 ]
//             }
//         )
//     .limit(parseInt(req.params.limit))
//     .exec()
//     .then(products=>{
//         // console.log("products",products);
//         if(products){
//             for (let k = 0; k < products.length; k++) {
//                 products[k] = {...products[k]._doc, isWish:false};
//             }
//             if(req.params.user_id && req.params.user_id!=='null'){
//                 Wishlists.find({user_ID:req.params.user_id})
//                 .then(wish=>{
//                     if(wish.length > 0){
//                         for(var i=0; i<wish.length; i++){
//                             for(var j=0; j<products.length; j++){
//                                 if(String(wish[i].product_ID) === String(products[j]._id)){
//                                     products[j]= {...products[j], isWish:true};
//                                     break;
//                                 }
//                             }
//                         }   
//                         if(i >= wish.length){
//                             res.status(200).json(products);
//                         }       
//                     }else{
//                         res.status(200).json(products);
//                     }
//                  })
//                  .catch(err =>{
//                     console.log(err);
//                     res.status(500).json({
//                         error: err
//                     });
//                 });
//             }else{
//                 res.status(200).json(products);
//             }    
//         }else{
//             res.status(200).json('Product Details not found');
//         }
//     })
//     .catch(err =>{
//         console.log(err);
//         res.status(500).json({
//             error : err
//         });
//     });
// };

exports.search_product = (req,res,next)=>{
	console.log("search_product req.body => ",req.body);
	// console.log("req body in se// localStorage.setItem("pincode", response.data.pincode);arch ==>",req.body);
	// console.log("req params in search ==>",req.params);
	/*
				"$and" : [
				{ "$or": 
					[
						{"productName"                : {'$regex' : req.body.searchstr , $options: "i"} },
						{"brand"                      : {'$regex' : req.body.searchstr , $options: "i"} },
						{"section"                    : {'$regex' : req.body.searchstr , $options: "i"} },
						{"category"                   : {'$regex' : req.body.searchstr , $options: "i"} },
						{"subCategory"                : {'$regex' : req.body.searchstr , $options: "i"} },
						{"productDetails"             : {'$regex' : req.body.searchstr , $options: "i"} }, 
						{"shortDescription"           : {'$regex' : req.body.searchstr , $options: "i"} }, 
						{"featureList.feature"        : {'$regex' : req.body.searchstr , $options: "i"} }, 
						{"attributes.attributeName"   : {'$regex' : req.body.searchstr , $options: "i"} },
						{"attributes.attributeValue"  : {'$regex' : req.body.searchstr , $options: "i"} } 
					] 
				},
				{ "$or": [{"status":"Publish"}] }
				]

	*/
	Products.find(
			{
				"status":"Publish",
				"$or": 
					[
						{"productName"                : {'$regex' : req.body.searchstr , $options: "i"} },
						{"brand"                      : {'$regex' : req.body.searchstr , $options: "i"} },
						{"section"                    : {'$regex' : req.body.searchstr , $options: "i"} },
						{"category"                   : {'$regex' : req.body.searchstr , $options: "i"} },
						{"subCategory"                : {'$regex' : req.body.searchstr , $options: "i"} },
					] 
			}
		)
	// .limit(parseInt(req.body.limit))
	.populate("vendor_ID")
	.then(async(products)=>{
		// console.log("products => ",products);
		var userLat         = req.body.userLatitude;
		var userLong        = req.body.userLongitude;
		
		if(products && products.length > 0){
			products = await products.filter(product => product.vendor_ID !== null);
			// console.log("products after filter =>",products);
			
			var FinalVendorSequence = [];
			if(userLat !== "" && userLat !== undefined && userLong !== "" && userLong !== undefined){
				const uniqueVendors = [...new Set(products.map(item => String(item.vendor_ID._id)))];
				
				// console.log("uniqueVendors=> ",uniqueVendors);     
				FinalVendorSequence = await getVendorSequence(uniqueVendors, userLat, userLong)          
				
				// console.log("FinalVendorSequence => ",FinalVendorSequence);     

			}
			for (let k = 0; k < products.length; k++) {
				var inventoryData             	= await ProductInventory.findOne({productCode : products[k].productCode, itemCode : products[k].itemCode, vendor_ID : ObjectId(products[k].vendor_ID._id)},{currentQuantity : 1});
				// console.log("inventoryData => ",inventoryData)
				products[k].availableQuantity   	= inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0;
				products[k] 							= {...products[k]._doc, isWish:false};
				products[k].vendorLocation_id 	= await products[k].vendor_ID.locations && products[k].vendor_ID.locations.length > 0 
																? 
																	products[k].vendor_ID.locations[0]._id 
																: 
																	"";
				products[k].vendor_ID 				= products[k].vendor_ID._id;                               
			}
			if(req.body.user_id && req.body.user_id!=='null'){
				Wishlists.find({user_ID:req.body.user_id})
				.then(wish=>{
					if(wish.length > 0){
						for(var i=0; i<wish.length; i++){
							for(var j=0; j<products.length; j++){
								if(String(wish[i].product_ID) === String(products[j]._id)){
									products[j]= {...products[j], isWish:true};
									break;
								}
							}
						}   
						if(i >= wish.length){
							res.status(200).json(
								FinalVendorSequence 
								? 
									products.filter((product) => {
										return FinalVendorSequence.some((vendor) => {
										return String(vendor.vendor_ID) === String(product.vendor_ID._id);
										})
									}).sort((a, b) => (String(a.universalProductCode) <=  String(b.universalProductCode)) ? 1 : -1)
								: 
									products.sort((a, b) => (String(a.universalProductCode) <=  String(b.universalProductCode)) ? 1 : -1)
							);
						}       
					}else{
						res.status(200).json(
							FinalVendorSequence 
							? 
								products.filter((product) => {
									return FinalVendorSequence.some((vendor) => {
									return String(vendor.vendor_ID) === String(product.vendor_ID._id);
									})
								}).sort((a, b) => (String(a.universalProductCode) <=  String(b.universalProductCode)) ? 1 : -1)
							: 
								products.sort((a, b) => (String(a.universalProductCode) <=  String(b.universalProductCode)) ? 1 : -1)                        
						);
					}
				 })
				 .catch(err =>{
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}else{
				res.status(200).json(
					FinalVendorSequence 
					? 
						products.filter((product) => {
							return FinalVendorSequence.some((vendor) => {
							return String(vendor.vendor_ID) === String(product.vendor_ID._id);
							})
						}).sort((a, b) => (String(a.vendor_ID) <=  String(b.vendor_ID)) ? 1 : -1)
					: 
						products.sort((a, b) => (String(a.universalProductCode) <=  String(b.universalProductCode)) ? 1 : -1)                        
				);
			}    
		}else{
			res.status(200).json([]);
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error : err
		});
	});
};

exports.search_product_mobileapp = (req,res,next)=>{
	// console.log("req params in search ==>",req.params);
	var selector = {};
	selector["$and"] = [];
	selector['$or'] = [];
	selector["$and"].push({ "status":"Publish" })
	selector["$or"].push({ "productName" : {'$regex' : req.params.searchstr , $options: "i" } })
	// console.log("selector in search ==>",selector);
	Products.find(selector)
	// Products.find(
	//         {
	//             "$and" : [
	//             { "$or": 
	//                 [
	//                 {"productName"                : {'$regex' : req.params.searchstr , $options: "i"} },
	//                 // {"category"                   : {'$regex' : req.params.searchstr , $options: "i"} },
	//                 ] 
	//             },
	//             { "$or": [{"status":"Publish"}] }
	//             ]
	//         }
	//     )
	.exec()
	.then(data=>{
		// console.log("selector in search ==>",data);
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.admin_search_product = (req,res,next)=>{
	Products.find(
			{
				"$and" : [
				{ "$or": 
					[
					{"productName"    : {'$regex' : req.params.searchstr , $options: "i"} },
					{"itemCode"       : {'$regex' : req.params.searchstr , $options: "i"} },
					{"brand"          : {'$regex' : req.params.searchstr , $options: "i"} },
					{"section"        : {'$regex' : req.params.searchstr , $options: "i"} },
					{"category"       : {'$regex' : req.params.searchstr , $options: "i"} },
					] 
				}
				]
			}
		)
	.exec()
	.then(data=>{
		var allData = data.map((x, i)=>{
			var productNameRlang = x.productNameRlang ? "<br><span class='RegionalFont'>"+x.productNameRlang+"</span>" : '';
			var categoryNameRlang = x.categoryNameRlang ? "<br><span class='RegionalFont'>"+x.categoryNameRlang+"</span>" : '';

			return {
				"_id"                   : x._id,
				"vendor"            		: x.vendorName,
				"productNameBasic"      : x.productName + "<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				"productNameRlang"      : x.productNameRlang,
				"productName"           : x.productName +productNameRlang+"<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				"section"               : x.section,
				"category"              : x.category +categoryNameRlang,
				"subCategory"           : x.subCategory,
				"originalPrice"         : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.originalPrice,
				"discountPercent"       : x.discountPercent+"%",
				"discountedPrice"       : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.discountedPrice,
				"availableQuantity"     : x.availableQuantity,
				"featured"              : x.featured,
				"exclusive"             : x.exclusive,
				"status"                : x.status
			}
		})
		res.status(200).json(allData);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.vendor_search_product = (req,res,next)=>{
	Products.find(
		{"vendor_ID" : req.params.vendorID,
			"$and" : [
			{ "$or": 
				[
				{"productName"    : {'$regex' : req.params.searchstr , $options: "i"} },
				{"itemCode"       : {'$regex' : req.params.searchstr , $options: "i"} },
				{"brand"          : {'$regex' : req.params.searchstr , $options: "i"} },
				{"section"        : {'$regex' : req.params.searchstr , $options: "i"} },
				{"category"       : {'$regex' : req.params.searchstr , $options: "i"} },
				] 
			}
			]
		}
	)
	.exec()
	.then(data=>{
		var allData = data.map((x, i)=>{
			var productNameRlang = x.productNameRlang ? "<br><span class='RegionalFont'>"+x.productNameRlang+"</span>" : '';
			var categoryNameRlang = x.categoryNameRlang ? "<br><span class='RegionalFont'>"+x.categoryNameRlang+"</span>": '';

			return {
				"_id"                   : x._id,
				"vendorName"            : x.vendorName,
				"productNameBasic"      : x.productName + "<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				"productNameRlang"      : x.productNameRlang,
				"productName"           : x.productName +productNameRlang+ "<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				"section"               : x.section,
				"category"              : x.category +categoryNameRlang,
				"originalPrice"         : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.originalPrice,
				"discountPercent"       : x.discountPercent+"%",
				"discountedPrice"       : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.discountedPrice,
				"availableQuantity"     : x.availableQuantity,
				"featured"              : x.featured,
				"exclusive"             : x.exclusive,
				"status"                : x.status
			}
		})
		res.status(200).json(allData);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.vendor_search_count_product = (req,res,next)=>{
	Products.find(
		{"vendor_ID" : req.params.vendorID,
			"$and" : [
			{ "$or": 
				[
				{"productName"    : {'$regex' : req.params.searchstr , $options: "i"} },
				{"itemCode"       : {'$regex' : req.params.searchstr , $options: "i"} },
				{"brand"          : {'$regex' : req.params.searchstr , $options: "i"} },
				{"section"        : {'$regex' : req.params.searchstr , $options: "i"} },
				{"category"       : {'$regex' : req.params.searchstr , $options: "i"} },
				] 
			}
			]
		}
	)
	.count()
	.exec()
	.then(data=>{
		//console.log(data);
		// res.status(200).json({"dataCount" :data});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.searchINCategory = (req,res,next)=>{
	
	var catArray = []
	req.body.catArray.map((data,index)=>{
		catArray.push(data.category)
	})
	var selector = {};
	if (req.body.searchstr) {
		selector = {
		"category" : {$in : catArray},
		"$and" : [
		{   "$or": [ 
				{"productName"    : {'$regex' : req.body.searchstr , $options: "i"} },
				{"brand"          : {'$regex' : req.body.searchstr , $options: "i"} },
				{"section"        : {'$regex' : req.body.searchstr , $options: "i"} },
				{"category"       : {'$regex' : req.body.searchstr , $options: "i"} },
				{"subCategory"    : {'$regex' : req.body.searchstr , $options: "i"} },
				{"productDetails" : {'$regex' : req.body.searchstr , $options: "i"} }, 
				{"shortDescription" : {'$regex' : req.body.searchstr , $options: "i"} }, 
				{"featureList.feature" : {'$regex' : req.body.searchstr , $options: "i"} },
				{"attributes.attributeName" : {'$regex' : req.params.searchstr , $options: "i"} },
				{"attributes.attributeValue" : {'$regex' : req.params.searchstr , $options: "i"} }  
			]
		}, 
		{ "$or": [{"status":"Publish"}] }
		]}
		;
	}else{
		selector = { "category" : {$in : catArray}, "status":"Publish" };
	}
	
	Products.find(selector)
	.exec()
	.then(data=>{

		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_brand = (req,res,next)=>{
	// console.log("req.params.sectionUrl===",req.params.sectionUrl);
	Products.distinct("brand", { "sectionUrl": req.params.sectionUrl })
	.exec()
	.then(data=>{ 
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.listBrandByCategories = (req,res,next)=>{
	// console.log("listBrandByCategories req=====",req.body.filterUrlArray[0]);
	Category.find({"categoryUrl":req.body.filterUrlArray[0]})
	.exec()
	.then(data=>{ 
		// console.log("category brand data========",data);
		var catArray= [];
		catArray.push(data._id);
		Products.distinct("brand", {"category_ID": { $in : data._id } })
		// Products.distinct("brand", {"categoryUrl": { $in : req.body.filterUrlArray } })
		// Products.distinct("brand", { "categoryUrl": req.body.categoryUrl })
		.exec()
		.then(data=>{ 
			// console.log("brand data========",data);
			res.status(200).json(data);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	})
		
};

exports.listBrandBySubcategories = (req,res,next)=>{
	// console.log("listBrandBySubcategories req=====",req.body);
	
	Products.distinct("brand", {"subCategoryUrl": { $in : req.body.subCategoryUrl } })
	.exec()
	.then(data=>{ 
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.list_size = (req,res,next)=>{
	
	Products.distinct("size", {"section_ID": req.params.sectionID})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.listSizeByCategory = (req,res,next)=>{
	
	Products.distinct("size", {"category_ID": req.params.categoryID})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.listSizeBySubcategory = (req,res,next)=>{
	
	Products.distinct("size", {"subCategory_ID": req.params.subcategoryID})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_color = (req,res,next)=>{
	Products.distinct("color", {"section_ID": req.params.sectionID})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.listColorByCategory = (req,res,next)=>{
	Products.distinct("color", {"category_ID": req.params.categoryID})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.listColorBySubcategory = (req,res,next)=>{
	Products.distinct("color", {"subCategory_ID": req.params.subcategoryID})
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.list_grocerybrand = (req,res,next)=>{
	
	Products.distinct("brand", {"section":"Grocery"})
	.exec()
	.then(data=>{

		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};


exports.admin_filter_products = (req,res,next)=>{
	var selector = {};
	//console.log(req.body)
	for (var key in req.body) {
		if (key=='vendorIds' && req.body.vendorIds.length > 0 ) {
			//let objectIdArray = req.body.vendorIds.map(s => mongoose.Types.ObjectId(s));
			selector.vendor_ID =  { $in: req.body.vendorIds } 
		}
		if (key=='sectionIds' && req.body.sectionIds.length > 0) {
			//let objectIdArray = req.body.vendorIds.map(s => mongoose.Types.ObjectId(s));
			selector.section_ID =  { $in: req.body.sectionIds } 
		}
		if (key=='categoryIds' && req.body.categoryIds.length > 0) {
			selector.category_ID =  { $in: req.body.categoryIds } 
		}
		if (key=='statusArray' && req.body.statusArray.length > 0) {
			selector.status =  { $in: req.body.statusArray } 
		}
	}
	
	Products.find(selector)
	.exec()
	.then(data=>{
		//console.log(data);
		var allData = data.map((x, i)=>{
			var productNameRlang = x.productNameRlang ? "<br><span class='RegionalFont'>"+x.productNameRlang+"</span>" : '';
			var categoryNameRlang = x.categoryNameRlang ? "<br><span class='RegionalFont'>"+x.categoryNameRlang+"</span>" : '';

			return {
				"_id"                   : x._id,
				"productName"           : x.productName +productNameRlang+"<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				"section"               : x.section,
				"category"              : x.category +categoryNameRlang,
				"vendorName"            : x.vendorName,
				// "productNameBasic"      : x.productName + "<br>Product Code: "+x.productCode+ "<br>Item Code: "+x.itemCode,
				// "productNameRlang"      : x.productNameRlang,
				
				"originalPrice"         : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.originalPrice,
				"discountPercent"       : x.discountPercent+"%",
				"discountedPrice"       : "<i class='fa fa-"+x.currency+"'></i>&nbsp;"+x.discountedPrice,
				// "availableQuantity"     : x.availableQuantity,
				"status"                : x.status,
				"featured"              : x.featured,
				"exclusive"             : x.exclusive,
			  
			}

			  
		})
		res.status(200).json(allData.slice(req.body.startRange, req.body.limitRange));
		//res.status(200).json(allData);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.admin_filter_productsCount = (req,res,next)=>{
	var selector = {};
	for (var key in req.body) {
		if (key=='vendorIds' && req.body.vendorIds.length > 0 ) {
			//let objectIdArray = req.body.vendorIds.map(s => mongoose.Types.ObjectId(s));
			selector.vendor_ID =  { $in: req.body.vendorIds } 
		}
		if (key=='sectionIds' && req.body.sectionIds.length > 0) {
			//let objectIdArray = req.body.vendorIds.map(s => mongoose.Types.ObjectId(s));
			selector.section_ID =  { $in: req.body.sectionIds } 
		}
		if (key=='categoryIds' && req.body.categoryIds.length > 0) {
			selector.category_ID =  { $in: req.body.categoryIds } 
		}
		if (key=='statusArray' && req.body.statusArray.length > 0) {
			selector.status =  { $in: req.body.statusArray } 
		}
	}
	//console.log(selector)
	Products.find(selector)
	.exec()
	.then(data=>{
		//console.log(data);
		return res.status(200).json({ "dataCount": data.length });
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.filter_products_ByCategory = (req,res,next)=>{
	var selector = {};
	var attributeSelector = [];
	var finalselector = {};
	// console.log(req.body)
	// main();
	// async function main(){
	if(req.body.categoryUrl){
		Category.find({"categoryUrl":req.body.categoryUrl})
		.exec()
		.then(categorydata=>{
			// console.log("1.categorydata---",categorydata);
			finalselector.category = categorydata[0].category;
			main();
			async function main(){
			// console.log("2.inside category async");
			await getProducts(finalselector);
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}else{
		Sections.find({"sectionUrl":req.body.sectionUrl})
		.exec()
		.then(sectiondata=>{
			// console.log("sectiondata====",sectiondata);
			finalselector.section = sectiondata[0].section;
			main();
			async function main(){
			await getProducts(finalselector);
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}

	var getProducts = async(finalselector) =>{
		// console.log('3 .finalselector-----------',finalselector)
		Products.find(finalselector).limit(Number(req.body.limit))
		// Products.find(finalselector)
		.exec()
		.then(data=>{
			// console.log("4. ProductData===",data);
			res.status(200).json(data);
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}
	// if(req.body.category){
	//     finalselector.category = req.body.category.split('-').join(' ');
	//     finalselector.category = finalselector.category.charAt(0).toUpperCase() + finalselector.category.slice(1);
	// }   
};

exports.filter_products = (req,res,next)=>{
	var selector = {};
	var attributeSelector = [];
	var finalselector = {};

	//console.log(req.body)
	for (var key in req.body) {
		if (key != 'limit') {
			if (key == 'price') {
			selector.discountedPrice  = { $gte : req.body.price.min, $lte : req.body.price.max }
			}
			if (key == 'brands') {
				if (req.body.brands.length>0) {
					selector.brand = { $in: req.body.brands } 
				}
			}
			if (key != 'price' && key != 'brands' && key != 'attributes') {
				selector[key] = req.body[key];
			}
			if (key == 'attributes') {
				req.body.attributes
				for (var attrkey in req.body.attributes) {
					// console.log('dsmf',req.body.attributes[attrkey])
					var elemMatch = {};
					elemMatch.attributeName = { $eq: req.body.attributes[attrkey].attributeName };
					elemMatch.attributeValue = { $eq: req.body.attributes[attrkey].attributeValue };
					//console.log('elemMatch',elemMatch);
					attributeSelector.push({ 
						attributes: { $elemMatch: elemMatch }
					})
				}
			}
		}
	}
	// console.log('selector',selector)
	// console.log('attributeSelector',JSON.stringify(attributeSelector))
	// console.log('len',attributeSelector.length)
	if (attributeSelector.length > 0) {
		finalselector.$and = [{ "$or" : [selector] }, { "$or" : attributeSelector }] 
	}else{
		finalselector.$and = [{ "$or" : [selector] }] 
	}
	//console.log(finalselector,'finalselector')
	Products.find(finalselector).limit(Number(req.body.limit))
	.exec()
	.then(data=>{
		//console.log(data);
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.get_menu_list = (req,res,next)=>{
   
	Category.aggregate([
	{ $lookup:
	   {
		 from: 'products',
		 localField: '_id',
		 foreignField: 'category_ID',
		 as: 'orderdetails'
	   }
	 },
	 {
		$match: {
		  "orderdetails.featured": true
		}
	 },
	 {
		$sort: {
		  "orderdetails.createdAt": -1
		}
	 }
	])
	.exec()
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		res.status(500).json({
			error: err
		});
	});
};

exports.get_minmaxprice = (req,res,next)=>{
	var priceArray = {}
	Products.find({"section_ID": req.params.sectionID},{discountedPrice:1}).sort({discountedPrice:1}).limit(1)
	.exec()
	.then(data=>{
		priceArray.min =  data[0].discountedPrice ;
		
			Products.find({"section_ID": req.params.sectionID},{discountedPrice:1}).sort({discountedPrice:-1}).limit(1)
			.exec()
			.then(data1=>{
				priceArray.max =  data1[0].discountedPrice ;
				res.status(200).json(priceArray);
			})
			.catch(err =>{
				console.log(err);
				res.status(500).json({
					error: err
				});
			});
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.update_availablequantity = (req,res,next)=>{
	Products.updateOne(
		{"_id": req.body.product_ID},
		{ $inc: {
			"availableQuantity" : -(req.body.quantity),
		}
	})
	.then()
	.catch();
}
exports.outofstockproducts = (req,res,next)=>{
	Products.find({ "availableQuantity" : 0 }).count()
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


exports.productCountByStatus = (req,res,next)=>{

	Products.aggregate([
	{ '$group': {
		'_id': null,
		'total':  { $sum : 1},
		'totalDraft': { 
			'$sum': {
				'$cond': [
					{ '$eq': ['$status', 'Draft']}, 
				   1,
				   0
				]
			}
		},
		'totalPublish': { 
			'$sum': {
				'$cond': [
					{ '$eq': ['$status', 'Publish']}, 
					1, 
					0
				]
			}
		},
		'totalUnpublish': { 
			'$sum': {
				'$cond': [
					{ '$eq': ['$status', 'Unpublish']}, 
				   1,
				   0
				]
			}
		},
		}
	}
	])
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({  
			error: err
		});
	});
};
exports.vendorProductCount = (req,res,next)=>{

	Products.aggregate([
	{"$match" : {"vendor_ID": ObjectId(req.params.vendorID)}},
	{ '$group': {
		'_id': null,
		'total':  { $sum : 1},
		'totalDraft': { 
			'$sum': {
				'$cond': [
					{ '$eq': ['$status', 'Draft']}, 
				   1,
				   0
				]
			}
		},
		'totalPublish': { 
			'$sum': {
				'$cond': [
					{ '$eq': ['$status', 'Publish']}, 
					1, 
					0
				]
			}
		},
		'totalUnpublish': { 
			'$sum': {
				'$cond': [
					{ '$eq': ['$status', 'Unpublish']}, 
				   1,
				   0
				]
			}
		},
		}
	}
	])
	.then(data=>{
		res.status(200).json(data);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({  
			error: err
		});
	});
};

exports.productBulkAction = (req, res, next) => {
	var field = req.body.selectedAction;
	// console.log('req.body', req.body);
	switch (field) {
		case 'Draft':
			Products.updateMany(
				{"_id": { "$in": req.body.selectedProducts}},
				{$set:{"status":"Draft"}}
				)
			.exec()
			.then(data => {
				return res.status(200).json({
					"msg": 'Selected products are drafted successfully..',
				});
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
		break;
		case 'Publish':
			Products.updateMany(
				{"_id": { "$in": req.body.selectedProducts}},
				{$set:{"status":"Publish"}}
			)
			.exec()
			.then(data => {
				return res.status(200).json({
					"msg": 'Selected products are published successfully..',
				});
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
		break ;
		case 'Unpublish':
			Products.updateMany(
				{"_id": { "$in": req.body.selectedProducts}},
				{$set:{"status":"Unpublish"}}
			)
			.exec()
			.then(data => {
				main();
				async function main() {
					for(let i=0;i<=req.body.selectedProducts.length;i++){
						// console.log("req.body.selectedProducts===",req.body.selectedProducts[i]);
						await remove_product_from_cart(req.body.selectedProducts[i]);
						await remove_product_from_wishlist(req.body.selectedProducts[i]);
					}
				}

				return res.status(200).json({
					"msg": 'Selected products are unpublished successfully..',
				});

			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
		break ;
		case 'Delete':
			Products.deleteMany(
				{"_id": { "$in": req.body.selectedProducts}}
				)
			.exec()
			.then(data => {
				return res.status(200).json({
					"msg": 'Selected products are deleted successfully..',
				});
			})
			.catch(err => {
				res.status(500).json({
					error: err
				});
			});
	}
};
 
//if product is unpublish by admin and that product is available in cart collection then it should be removed from cart collection 
var remove_product_from_cart = async(productId) =>{
	// console.log("selected products=",productId);
	Carts.update(        
		{},
		{
			'$pull':{ 'cartItems':{'product_ID': productId }},            
			
		},
		{new:true,multi:true},
	)
	.exec()
	.then(data=>{
		if(data.nModified == 1){
			resolve(data);
		}
	})
	.catch(err =>{
		resolve(0);
	});
}
//if product is unpublish by admin and that product is available in wishlist collection then it should be removed from wishlist collection 
var remove_product_from_wishlist = async(productId) =>{
	// console.log("selected products to remove=",productId);      
	Wishlists.deleteMany({ 'product_ID': productId})
	.exec()
	.then(data=>{
		if(data.nModified == 1){
			resolve(data);
		}
	})
	.catch(err =>{
		resolve(0);
	});
}

exports.getattributes = (req,res,next)=>{
	Products.distinct("attributes",{ "section_ID": req.params.sectionID })
	.exec()
	.then(data=>{ 
		// console.log(data);
		var Results = [];
		Results = _.groupBy(data, 'attributeName')
		res.status(200).json(Results);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};

exports.getattributesbycategory = (req,res,next)=>{
	Products.distinct("attributes",{ "category_ID": req.params.categoryID })
	.exec()
	.then(data=>{ 
		// console.log(data);
		var Results = [];
		Results = _.groupBy(data, 'attributeName')
		res.status(200).json(Results);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};
exports.getattributesbycategory = (req,res,next)=>{
	Products.distinct("attributes",{ "subCategory_ID": req.params.subCategoryID })
	.exec()
	.then(data=>{ 
		// console.log(data);
		var Results = [];
		Results = _.groupBy(data, 'attributeName')
		res.status(200).json(Results);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};


exports.getattributesbysubcategory = (req,res,next)=>{
	Products.distinct("attributes",{ "subCategory_ID": req.params.subCategoryID })
	.exec()
	.then(data=>{ 
		// console.log(data);
		var Results = [];
		Results = _.groupBy(data, 'attributeName')
		res.status(200).json(Results);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};


var insertUnitOfMeasurment = async(unit, created) =>{
	// console.log("insertUnitOfMeasurment",unit);
	return new Promise(function(resolve,reject){ 
		UnitOfMeasurmentMaster.find({})
		.exec()
		.then(data=>{
			// console.log("UnitOfMeasurmentMaster",data);
			// console.log("unit => ",unit)
			// console.log("isNaN(data.unit) => ",isNaN(parseInt(unit)))
			if(isNaN(unit)){
				var departmentExists = data.filter((data)=>{
					if ((data.unit).toLowerCase() === (unit).toLowerCase()) {
						return data;
					}
				})
			}else{
				var departmentExists = data.filter((data)=>{
					// console.log("data.unit => ",unit)
					if ((data.unit).toLowerCase() === "number") {
						return data;                                           
					}
				})
			}

			// console.log("department Exists",departmentExists);
			if (departmentExists && departmentExists.length > 0) {
				// console.log("departmentExists length > 0")
				departmentId = departmentExists[0]._id;
				resolve( departmentId );
			}else{
					unitOfMeasurmentMaster = new UnitOfMeasurmentMaster({
					_id             : new mongoose.Types.ObjectId(),
					// companyID      : req.body.companyID,
					unit            : unit,
					createdBy       : created,
					createdAt       : new Date()
				})
				unitOfMeasurmentMaster.save()
				.then(insertdata=>{
					// console.log("saved");
					resolve( insertdata._id );
				})
				.catch(err =>{
					reject(err); 
				});
			}
		})
		.catch(err =>{
			reject(err);
		});          
	});
}

/*============= Product Inventory Update =============*/
exports.bulkProductUpdate = (req,res,next)=>{
	// console.log("req.body bulkProductUpdate => ",req.body);
	
	var record          = []; 
	var failedRecords   = [];
	var i               = 0;
	var found           = 0;
	var catid;
	var subcatid;
	getData();

	async function getData(){
		var productData     = req.body;
		var TotalCount      = 0;
		var Count           = 0;
		var DuplicateCount  = 0;
		var invalidData     = [];
		var invalidObjects  = [];
		var remark          = ''; 

		for(k = 0 ; k < productData.length ; k++){
			// console.log("productData[k] => ",productData[k])
			
			if (productData[k].VendorCompanyID !== undefined && productData[k].VendorCompanyID !== null) {
				var vendorData = await EntityMaster.findOne({companyID : productData[k].VendorCompanyID});

				if(vendorData !== null && vendorData !== undefined){
					productData[k].vendor_id = vendorData._id;
					if (productData[k].UPC !== undefined) {

						if(productData[k].productCode !== undefined){

							if(productData[k].itemCode !== undefined){

								if(productData[k].originalPrice === undefined || productData[k].originalPrice === null || productData[k].originalPrice === ""){
									remark+= "originalPrice is missing in file record. "
								}
								if(isNaN(productData[k].originalPrice)){
									remark+= "originalPrice should be number. "
								}
								if(productData[k].discountedPrice === undefined || productData[k].discountedPrice === null || productData[k].discountedPrice === ""){
									remark+= "discountedPrice is missing in file record. "
								}
								if(isNaN(productData[k].discountedPrice)){
									remark+= "discountedPrice should be number. "
								}
								if(productData[k].discountPercent === undefined || productData[k].discountPercent === null || productData[k].discountPercent === ""){
									remark+= "discountPercent is missing in file record. "
								}
								if(isNaN(productData[k].discountPercent)){
									remark+= "discountPercent should be number. "
								}
								if(productData[k].qty === undefined || productData[k].qty === null || productData[k].qty === ""){
									remark+= "qty is missing in file record. "
								}
								if(isNaN(productData[k].discountPercent)){
									remark+= "qty should be number. "
								}
								if (remark === "") {
									var updateProductObject = await updateProductBulkRecords(productData[k]);	
								}									
							}else{
								remark+= "itemCode is missing in file record. "
							}
						}else{
							remark+= "productCode is missing in file record. "
						}
					}else{
						remark+= "UPC is missing in file record. "
					}
				}else{
					remark+= "Vendor not found. "
				}
			}else{
				remark+= "VendorCompanyID is missing in file record. "
			}

			if (updateProductObject !== null && updateProductObject !== undefined) {				// console.log("updateProductObject.nModified => ",updateProductObject.nModified);
				if(updateProductObject.statusCode === "Success"){
					Count++;
				}else{
					remark += updateProductObject.remark;
				}
			}else{
				DuplicateCount++;
				remark += "Product Not Found ";
			}
			if (remark !== '') {
				invalidObjects          = productData[k];
				invalidObjects.remark   = remark;
				invalidData.push(invalidObjects);
			} 
			remark = '';
		}
		if (k >= productData.length) {
		
			failedRecords.FailedRecords = invalidData
			failedRecords.fileName      = productData[0].filename;
			failedRecords.totalRecords  = productData.length;
			// failedRecords.totalRecords  = TotalCount;

			await insertFailedRecords(failedRecords); 
			
			var msgstr  = "";
			var warning = false;

			if (DuplicateCount > 0 && Count > 0) {				
				msgstr =  " " + Count +  (Count > 1 ? " inventory records are" : " inventory record is") + " updated successfully and "+"\n" + DuplicateCount + (DuplicateCount > 1 ? " inventory records are" : " inventory record is") + " failed to update";	        
			}else if(DuplicateCount > 0 && Count == 0){
				msgstr 	= " " + DuplicateCount + " Failed to update " + (DuplicateCount > 1 ? " inventory records as" : " inventory record as") + DuplicateCount + (DuplicateCount > 1 ? " inventory records are" : " inventory record is") + " failed to update";
				warning 	= true;								
			}
			else if(DuplicateCount === 0 && Count > 0){ 
				msgstr = " " + Count + (Count > 1 ? " inventory records are" : " inventory record is") + " updated successfully";
			}else{
				msgstr  = "Failed to update inventory records";
				warning = true;
			}

			// console.log("msgstr",msgstr);
			res.status(200).json({
				"message" : msgstr,
				"warning" : warning
			});
		}
	}
};


// bulk update 
exports.bulkUploadProductUpdate = (req,res,next)=>{
	// console.log("req.body => ",req.body);
	var record          = []; 
	var failedRecords   = [];
	var i               = 0;
	var found           = 0;
	var catid;
	var subcatid;
	getData();

	async function getData(){
		var productData     = req.body;
		var TotalCount      = 0;
		var Count           = 0;
		var DuplicateCount  = 0;
		var invalidData     = [];
		var invalidObjects  = [];
		var remark          = ''; 

		for(k = 0 ; k < productData.length ; k++){
			var allEntityData = await fetchAllEntities("vendor");
			if(productData[k].websiteModel === "MarketPlace"){
			  var EntityData = allEntityData.filter((data)=>{
				// console.log("data.companyName == productData[k].CompanyName",data.companyName == productData[k].CompanyName);
				  if (data.companyName == productData[k].CompanyName) {
					return data;
					}
				  }) 
				 var EntityDataArray = EntityData.map((entityArr, i)=>{
					return entityArr.companyName;
				  })
			  }else{
				var EntityData = allEntityData.filter((data)=>{
					// console.log("data.companyName == productData[k].CompanyName",data.companyName == productData[k].CompanyName);
					  if (data.companyName == allEntityData[0].companyName) {
						return data;
						}
				}) 
	
				var EntityDataArray = allEntityData[0].companyName;
			  }
			if(productData[k].section !== undefined && productData[k].itemCode !== undefined && productData[k].productName !== undefined){
				if (productData[k].section.trim() != '') {
					var sectionObject = await sectionInsert(productData[k].section)
				   
					if (productData[k].category != undefined) {
						var categoryObject = await categoryInsert(productData[k].category,productData[k].subCategory,productData[k].section,sectionObject.section_ID,productData[k].categoryNameRlang);
						var taxObject = []
						if(productData[k].taxName){
							taxObject = await taxInsert(productData[k].taxName,productData[k].taxRate);
							// console.log("taxObject in main---",taxObject)
						}
						if (productData[k].itemCode != undefined) {
							if(typeof(productData[k].discountPercent) === 'number' && productData[k].discountPercent >= 0){
								 if(typeof(productData[k].discountedPrice) === 'number' && productData[k].discountedPrice >= 0){
									if(typeof(productData[k].originalPrice) === 'number' && productData[k].originalPrice >= 0 ){

									//     if(productData[k].websiteModel === "MarketPlace"){
									//        if(EntityDataArray  != "" && EntityDataArray != undefined ){
									//         var updateProductObject = await updateProductBulk(sectionObject.section_ID, sectionObject.section, categoryObject,productData[k],taxObject[0],EntityData);
									//        }else{
									//         remark+= "Company Name not found"
									//        }
									//    }else{
									//     var updateProductObject = await updateProductBulk(sectionObject.section_ID, sectionObject.section, categoryObject,productData[k],taxObject[0]);
									//    } 
									   if(productData[k].websiteModel === "MarketPlace"){
										if(EntityDataArray  != "" && EntityDataArray != undefined ){
											var updateProductObject = await updateProductBulk(sectionObject.section_ID, sectionObject.section, categoryObject,productData[k],taxObject[0],EntityData);
										   }else{
											remark+= "Company Name not found"

										   }
									   }else{
										//  var insertProductObject = await insertProduct(sectionObject.section_ID, sectionObject.section, categoryObject,productData[k],taxObject[0]);
										if(EntityDataArray  != "" && EntityDataArray != undefined ){
											var updateProductObject = await updateProductBulk(sectionObject.section_ID, sectionObject.section, categoryObject,productData[k],taxObject[0],EntityData);
										}else{
											remark+= "Vendor not found"
										}

									   } 

										//  console.log('updateProductBulk => ',updateProductObject)

										if (updateProductObject !== 0) {
											if(updateProductObject.nModified !== 0){
												Count++;
											}
										}else{
											// console.log('else updateProductBulk',updateProductObject)

											DuplicateCount++;
											remark += "Item code should not be duplicate, ";
										}
									}else{
									   remark += "Original Price should be number"; 
									}
								 }else{
									remark += "Discount Price should be number";
								 }  
							}else{
							   remark += "Discount Percent should be number";
							} 
							
						}  
					}
				}
			}
			
		if (productData[k].itemCode != undefined) {
			TotalCount++;
			if(productData[k].section == undefined){
				 remark += "section not found";
			}
			if (productData[k].category == undefined) {
				remark += ", category not found, ";
			}
			if (productData[k].productCode == undefined) {
				remark += "Product code not found, ";
			}
			if (productData[k].productName == undefined) {
				remark += "Product name not found, ";
			}
			// if (productData[k].brand == undefined) {
			//     remark += "brand not found, ";
			// }
			if (productData[k].availableQuantity == undefined) {
				remark += "product quantity not found, ";
			}
			if (productData[k].originalPrice == undefined) {
				remark += "product price not found, ";
			}

		}
			

			if (remark != '') {
				invalidObjects          = productData[k];
				invalidObjects.remark   = remark;
				invalidData.push(invalidObjects);
			} 
			remark = '';
		}
		
		failedRecords.FailedRecords = invalidData
		failedRecords.fileName      = productData[0].filename;
		failedRecords.totalRecords  = TotalCount;

		await insertFailedRecords(failedRecords); 
		
		var msgstr  = "";
		var warning = false;
		if (DuplicateCount > 0 && Count > 0) {
			if (DuplicateCount > 1 && Count > 1) {
			   msgstr =  " " + Count+" products are updated successfully and "+"\n"+DuplicateCount+" products are duplicate";
			}
			else if(DuplicateCount ==1 && Count == 1 ){
				msgstr =  " " + Count+" product is updated successfully and "+"\n"+DuplicateCount+" product is duplicate";
			}
			else if(DuplicateCount > 1 && Count == 1)
			{
				msgstr =  " " + Count+" product is updated successfully and "+"\n"+DuplicateCount+" products are duplicate";
			}else if(DuplicateCount == 1 && Count > 1){
				msgstr =  " " + Count+" products are updated successfully and "+"\n"+DuplicateCount+" product is duplicate";
			}
			
		}
		else if(DuplicateCount > 0 && Count == 0)
		{
			if (DuplicateCount > 1) {
				msgstr = "Failed to update products as "+DuplicateCount+" products are duplicate";
				warning = true;
			}else{
				msgstr = "Failed to update products as "+DuplicateCount+" product is duplicate";
				warning = true;
			}
			
		}
		else if(DuplicateCount == 0 && Count > 0)
		{ 
			if (Count > 1) {
				msgstr = " " + Count+" products are updated successfully";
			}else{
				msgstr = " " + Count+" product is updated successfully";
			}            
		}else{
			msgstr = "Failed to update products";
			warning = true;
		}

		// console.log("msgstr",msgstr);
		res.status(200).json({
			"message": msgstr,
			"warning": warning
		});
	}
};

var updateProductBulk = async (section_ID, section, categoryObject,data,taxObject=[],EntityData=[]) => {
	// console.log("taxObject--",taxObject);
	
		var vendorData = EntityData.map((vendorarr, i)=>{
			return vendorarr.companyName;
		})
		var productEntity  = await findVendor(vendorData);
		var vendor = '';
		return new Promise(function(resolve,reject){ 
			if(data.vendor != undefined && data.vendor != ''){
				vendor = data.vendor ? data.vendor.split('|')[1] : null;
			}else{
				vendor =  null;
			}
		   
			Products.updateOne(
				{ itemCode:data.itemCode},  
				{
					$set:{
						user_ID                   : vendor,  
						vendor_ID                 : productEntity._id, 
						vendorName                : productEntity.companyName, 
						section_ID                : section_ID,           
						section                   : section,      
						category                  : categoryObject.category,
						category_ID               : categoryObject.category_ID,
						subCategory               : data.subCategory,
						subCategory_ID            : categoryObject.subCategory_ID ? categoryObject.subCategory_ID : null,
						brand                     : data.brand ? data.brand : "",
						brandNameRlang            : data.brandNameRlang ? data.brandNameRlang : "",
						// productCode               : data.productCode ? data.productCode : "",
						// itemCode                  : data.itemCode ? data.itemCode : "",
						productName               : data.productName,
						productNameRlang          : data.productNameRlang ? data.productNameRlang : "",
						productUrl                : !isNaN(data.productName) ? data.productName.replace(/\s+/g, '-').toLowerCase() : null,
						productDetails            : data.productDetails ? data.productDetails : "",
						shortDescription          : data.shortDescription ? data.shortDescription : "",
						productReturnable         : data.productReturnable ? data.productReturnable : "",
						featureList               : data.featureList ? data.featureList : "",
						attributes                : data.attributes ? data.attributes : [],
						currency                  : data.currency ? data.currency.toLowerCase() : "inr",
						originalPrice             : data.originalPrice ? data.originalPrice : 0,
						discountPercent           : data.discountPercent ? data.discountPercent : 0,  
						discountedPrice           : data.discountPercent == 0 ? (data.originalPrice ? data.originalPrice : 0) : data.discountedPrice,
						offeredPrice              : data.offeredPrice ? data.offeredPrice : "",
						actualPrice               : data.actualPrice ? data.actualPrice : "",
						availableQuantity         : data.availableQuantity ? data.availableQuantity : "",
						status                    : "Draft",
						offered                   : data.offered,
						unit                      : data.unit ? data.unit : "",
						vendorBarcode             : data.vendorBarcode ? data.vendorBarcode: "",
						vendorItemcode            : data.vendorItemcode ? data.vendorItemcode: "",
						size                      : data.size ? data.size : "",
						color                     : data.color ? data.color : "",
						exclusive                 : data.exclusive,
						featured                  : data.featured,
						newProduct                : data.newProduct,
						bestSeller                : data.bestSeller,  
						tags                      : data.tags,
						taxInclude                : data.taxInclude,
						taxName                   : taxObject ? taxObject.taxName : 'No Tax',
						taxRate                   : taxObject ? (taxObject.GSTRate == undefined && taxObject.GSTRate != ''  ? 0 : taxObject.GSTRate ) : 0,
						fileName                  : data.filename,
						updatedBy                 : data.createdBy,
						updatedAt                 : new Date()
					}
				}
			)
			.exec()
			.then(data=>{                
				resolve(data);
			})
			.catch(err =>{
				reject(err);
			});
	   
	});
}

/**======= updateProductBulkRecords() =======*/
var updateProductBulkRecords = async (data) => {
	// console.log("data--",data);
	
	return new Promise(function(resolve,reject){ 
		processData();
		async function processData(){

			var inventoryData = await ProductInventory.findOne({ 
				universalProductCode : data.UPC,  
				vendor_ID            : ObjectId(data.vendor_id),
				productCode 			: data.productCode,  
				itemCode 				: data.itemCode, 
			});
			// console.log("inventoryData => ",inventoryData)
			if (inventoryData !== null) {
				var updateinventory = await ProductInventory.updateOne(
					{ 
						universalProductCode : data.UPC,  
						vendor_ID            : ObjectId(data.vendor_id),
						productCode 			: data.productCode,  
						itemCode 				: data.itemCode,  
					},  
					{
						$set:{
							currentQuantity           : data.qty ? (data.action !== undefined && data.action.toLowerCase() === "add" ? inventoryData.currentQuantity + data.qty : data.qty)  : "",
							originalPrice             : data.originalPrice,
							discountPercent           : data.discountPercent,
							discountedPrice           : data.discountedPrice, 
						},
						$push:{ 
							inwardDetails  : {
												date            	: new Date(),
												qty             	: data.qty ? (data.action !== undefined && data.action.toLowerCase() === "add" ? inventoryData.currentQuantity + data.qty : data.qty)  : "",
												originalPrice   	: data.originalPrice,
												discountPercent 	: data.discountPercent,
												discountedPrice 	: data.discountedPrice,
												addedBy         	: ObjectId(data.createdBy),
												fileName 			: data.filename
							},
							updateLog       : {
												date        : new Date(),
												updatedBy   : ObjectId(data.createdBy),
							}
						}
					}
				)
				.then(inventoryupdateData=>{					
					resolve({
						statusCode 	: "Success",
						data 			: inventoryupdateData
					});
				})
				.catch(err =>{
					resolve({
						statusCode 	: "Failed",
						remark 		: "No inventory record found"
					});	
				});

				// console.log("Update Inventory => ",updateinventory)
				if (updateinventory !== undefined && updateinventory !== null) {
					if (updateinventory.statusCode === "Success") {						  
						Products.updateOne(
							{ 
								universalProductCode    : data.UPC,
								vendor_ID               : ObjectId(data.vendor_id),
								productCode 				: data.productCode,  
								itemCode 					: data.itemCode 
							},  
							{
								$set:{
									originalPrice             : data.originalPrice ? data.originalPrice : 0,
									discountPercent           : data.discountPercent ? data.discountPercent : 0,  
									discountedPrice           : data.discountPercent === 0 ? (data.originalPrice ? data.originalPrice : 0) : data.discountedPrice,
									// availableQuantity         : data.qty ? (data.action.toLowerCase() === "add" ? productdata.availableQuantity + data.qty : data.qty)  : "",
									// fileName                  : data.filename,
									updatedBy                 : data.createdBy,
									updatedAt                 : new Date()
								}
							}
						)
						.exec()
						.then(updatedproductdata=>{   
							resolve({
								statusCode : "Success"
							});												
						})
						.catch(err =>{
							resolve({
								statusCode 	: "Failed",
								remark 		: "Product not found. "
							});
						});

					}else{
						resolve({
							statusCode 	: "Failed",
							remark 		: "Failed to update inventory record. "
						})
					}
				}else{
					resolve({
						statusCode 	: "Failed",
						remark 		: "Failed to update inventory record. "
					})
				}
			}else{
				resolve({
					statusCode 	: "Failed",
					remark 		: "No inventory record found for this product. "
				})
			}
			// ProductInventory.findOne(
			// 	{ 
			// 		universalProductCode : data.UPC,  
			// 		vendor_ID            : ObjectId(data.vendor_id),
			// 		productCode 			: data.productCode,  
			// 		itemCode 				: data.itemCode, 
			// 	},
			// )
			// .then(inventoryData=>{
				// ProductInventory.updateOne(
				// 	{ 
				// 		universalProductCode : data.UPC,  
				// 		vendor_ID            : ObjectId(data.vendor_id),
				// 		productCode 			: data.productCode,  
				// 		itemCode 				: data.itemCode,  
				// 	},  
				// 	{
				// 		$set:{
				// 			currentQuantity           : data.qty ? (data.action !== undefined && data.action.toLowerCase() === "add" ? inventoryData.currentQuantity + data.qty : data.qty)  : "",
				// 			originalPrice             : data.originalPrice,
				// 			discountPercent           : data.discountPercent,
				// 			discountedPrice           : data.discountedPrice, 
				// 		},
				// 		$push:{ 
				// 			inwardDetails  : {
				// 								date            	: new Date(),
				// 								qty             	: data.qty ? (data.action !== undefined && data.action.toLowerCase() === "add" ? inventoryData.currentQuantity + data.qty : data.qty)  : "",
				// 								originalPrice   	: data.originalPrice,
				// 								discountPercent 	: data.discountPercent,
				// 								discountedPrice 	: data.discountedPrice,
				// 								addedBy         	: ObjectId(data.createdBy),
				// 								filename 			: data.filename
				// 			},
				// 			updateLog       : {
				// 								date        : new Date(),
				// 								updatedBy   : ObjectId(data.createdBy),
				// 			}
				// 		}
				// 	}
				// )
				// .then(inventoryupdateData=>{
				// 	// console.log("inventoryupdateData---------",inventoryupdateData);
				// 	// console.log("data.UPC---------",data.UPC);
				// 	// console.log("data.vendor_id---------",data.vendor_id);
				// 	Products.findOne(
				// 		{ 
				// 			universalProductCode    : data.UPC,
				// 			vendor_ID               : ObjectId(data.vendor_id),
				// 			productCode 				: data.productCode,  
				// 			itemCode 					: data.itemCode 
				// 		} 
				// 	)
				// 	.exec()
				// 	.then(productdata=>{
				// 		// console.log("productData => ",productdata);              
				// 		if(productdata !== null && productdata !== undefined){     
				// 			Products.updateOne(
				// 				{ 
				// 					universalProductCode    : data.UPC,
				// 					vendor_ID               : ObjectId(data.vendor_id),
				// 					productCode 				: data.productCode,  
				// 					itemCode 					: data.itemCode 
				// 				},  
				// 				{
				// 					$set:{
				// 						originalPrice             : data.originalPrice ? data.originalPrice : 0,
				// 						discountPercent           : data.discountPercent ? data.discountPercent : 0,  
				// 						discountedPrice           : data.discountPercent === 0 ? (data.originalPrice ? data.originalPrice : 0) : data.discountedPrice,
				// 						// availableQuantity         : data.qty ? (data.action.toLowerCase() === "add" ? productdata.availableQuantity + data.qty : data.qty)  : "",
				// 						// fileName                  : data.filename,
				// 						updatedBy                 : data.createdBy,
				// 						updatedAt                 : new Date()
				// 					}
				// 				}
				// 			)
				// 			.exec()
				// 			.then(updatedproductdata=>{                        
								
				// 				// var inventoryUpdate = await updateProductInventory(data.itemCode, data.productCode, data.vendor_id);
				// 				resolve(updatedproductdata);
													
				// 			})
				// 			.catch(err =>{
				// 				reject(err);
				// 			});
						
				// 		}else{
				// 			resolve(productdata);
				// 		}
				// 	})
				// 	.catch(err =>{
				// 		reject(err);
				// 	});
				// })
				// .catch(err =>{
				// 	console.log("error---------",err);
				// 	reject(err);
				// }); 
			// })
			// .catch(err =>{
			// 	console.log("error---------",err);
			// 	reject(err);
			// });  
		}        
	});
}

exports.checkItemCodeExists = (req,res,next)=>{
	Products.find({"itemCode" : req.params.itemcode})
	.then(data =>{
		if(data && data.length > 0){
			res.status(200).json({
			"message": "Item code already exists.",
			"exists" : true
			});
		}else{
			res.status(200).json({
				"message": "Item code not exists.",
				"exists" : false

			});
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({  
			error: err
		});
	});
}


exports.search_suggestion = async(req,res,next)=>{
	// console.log("req.body=>",req.body);
	var section     = await getSection(req.body.searchText);
	var category    = await getCategory(req.body.searchText);
	var subCategory = await getSubCat(req.body.searchText);
	var brand       = await getBrand(req.body.searchText);
	var product     = await getProduct(req.body.searchText);
	// var vendors     = await getVendors(req.body.searchText);
	var all         = await getAll(req.body.searchText);
	var result      = section.concat(category).concat(subCategory).concat(brand).concat(product);
	// var result      = all;
	result          = result.filter(item => item !== undefined) 
	result          = [...new Set(result)]
	// var result = [];
	// result.push({
	//     type            : "category",
	//     suggestionArray : [...new Set(category.filter(item => item !== undefined))] 
	// })
	// result.push({
	//     type            : "section",
	//     suggestionArray : [...new Set(section.filter(item => item !== undefined))] 
	// })
	// result.push({
	//     type            : "brand",
	//     suggestionArray : [...new Set(brand.filter(item => item !== undefined))] 
	// })
	// console.log("result => ",result);
	res.status(200).json(result);
}

// function getVendors(searchText) {
//     return new Promise(function(resolve,reject){  
//         // Products.find({"section" : { $regex:new RegExp('^'+searchText+'.*', "i")}},{section:1})
//         Products.find({"section" : {'$regex' : searchText , $options: "i"}},{section:1})
//         .limit(10)
//         .then(data =>{
//             var section = data.map(a=>a.section);
//             // console.log("section => ",section)
//             resolve(section);
//         })
//         .catch(err =>{
//             console.log(err);
//             reject(err);
//         });
//     });
// }
function getSection(searchText) {
	return new Promise(function(resolve,reject){  
		// Products.find({"section" : { $regex:new RegExp('^'+searchText+'.*', "i")}},{section:1})
		Products.find({"section" : {'$regex' : searchText , $options: "i"}},{section:1})
		.limit(10)
		.then(data =>{
			var section = data.map(a=>a.section);
			// console.log("section => ",section)
			resolve(section);
		})
		.catch(err =>{
			console.log(err);
			reject(err);
		});
	});
}
function getCategory(searchText) {
	return new Promise(function(resolve,reject){  
		Products.find({"category" : {'$regex' : searchText , $options: "i"}},{category:1})
		.limit(10)
		.then(data =>{
			var category = data.map(a=>a.category);
			// console.log("category => ",category)            
			resolve(category);
		})
		.catch(err =>{
			console.log(err);
			reject(err);
		});
	});
}

function getBrand(searchText) {
	return new Promise(function(resolve,reject){  
		Products.find({"brand" : {'$regex' : searchText , $options: "i"}},{brand:1})
		.limit(10)
		.then(data =>{
			var brand = data.map(a=>a.brand);
			// console.log("brand => ",brand)
			resolve(brand);
		})
		.catch(err =>{
			console.log(err);
			reject(err);
		});
	});
}
function getProduct(searchText) {
	return new Promise(function(resolve,reject){  
		Products.find({"productName" : {'$regex' : searchText , $options: "i"}},{productName:1})
		.limit(10)
		.then(data =>{
			var productName = data.map(a=>a.productName);
			productName= [...new Set(productName)]
			// console.log("productName => ",productName)
			resolve(productName);
		})
		.catch(err =>{
			console.log(err);
			reject(err);
		});
	});
}

function getSubCat(searchText) {
	return new Promise(function(resolve,reject){  
		Products.find({"subCategory" : {'$regex' : searchText , $options: "i"}},{subCategory:1})
		.limit(10)
		.then(data =>{
			var subCategory = data.map(a=>a.subCategory);
			// console.log("subCategory => ",subCategory)
			resolve(subCategory);
		})
		.catch(err =>{
			console.log(err);
			reject(err);
		});
	});
}


function getAll(searchText) {
	return new Promise(function(resolve,reject){  
		Products.find(
			{
				"$and" : [
				{ "$or": 
					[
					{"brand"                      : {'$regex' : searchText , $options: "i"} },
					{"section"                    : {'$regex' : searchText , $options: "i"} },
					{"category"                   : {'$regex' : searchText , $options: "i"} },
					{"subCategory"                : {'$regex' : searchText , $options: "i"} },
					{"productName"                : {'$regex' : searchText , $options: "i"} },
					] 
				},
				{ "$or": [{"status":"Publish"}] }
				]
			},
			{brand:1,section:1,category:1,subCategory:1,productName:1}
		)
		.limit(10)
		.then(data =>{
			// console.log("data => ",data)
			var brand       = data.map(a=>a.brand);
			var section     = data.map(a=>a.section);
			var category    = data.map(a=>a.category);
			var subCategory = data.map(a=>a.subCategory);
			var product     = data.map(a=>a.productName);
			var result      = product.concat(category).concat(subCategory).concat(section).concat(brand);
			// console.log("result",result);
			resolve(result);
		})
		.catch(err =>{
			console.log(err);
			reject(err);
		});
	});
}



/**=========== products_by_lowest_price() =========== */
exports.products_by_lowest_price = (req,res,next)=>{

	main();
	async function main(){
		console.log("req.body => ",req.body);
		var userLat         = req.body.userLatitude;
		var userLong        = req.body.userLongitude;
		var selector        = {};
		selector['$and']    = [];


		selector["$and"].push({"status": "Publish"});
		/**----------- Find Vendorwise Products ------------ */
		if(req.body.vendor_ID && req.body.vendor_ID !== '' && req.body.vendor_ID !== undefined){
			selector["$and"].push({"vendor_ID": ObjectId(req.body.vendor_ID) })
		}
		/**----------- Find Products for particular Section ------------ */
		if(req.body.sectionUrl && req.body.sectionUrl !== '' && req.body.sectionUrl !== undefined){
			var section_ID = await getSectionData(req.body.sectionUrl); 
			if(section_ID && section_ID !== '' && section_ID !== undefined){
				selector["$and"].push({"section_ID": ObjectId(section_ID) })
			}           
		}
		/**----------- Find Products for selected category in particular Section ------------ */
		if(req.body.categoryUrl && req.body.categoryUrl !== '' && req.body.categoryUrl !== 'all' && req.body.categoryUrl !== undefined){
			var categoryData = await getCategoryData(req.body.categoryUrl); 
			if(categoryData && categoryData !== '' && categoryData !== undefined){
				selector["$and"].push({"category_ID": ObjectId(categoryData._id) })
				// var subCategory = await getSubCategoryData(categoryData._id, req.body.subCategoryUrl); 
				// console.log("subCategory",subCategory)
				// if(subCategory && subCategory.length > 0){
				//     selector["$and"].push({"subCategory_ID": { $in : subCategory}})
				// }  
				/**----------- Find Products for selected subcategory in particular Section and Category ------------ */
				if(req.body.subCategoryUrl && req.body.subCategoryUrl !== "all" && req.body.subCategoryUrl.length > 0){
					if(categoryData.subCategory && categoryData.subCategory.length > 0){                        
						var subCategory    = filterByKey(req.body.subCategoryUrl, categoryData.subCategory).map((subCatg, i)=>{
												return subCatg._id;
											});
						if(subCategory && subCategory.length > 0){
							selector["$and"].push({"subCategory_ID": { $in : subCategory}})
						}                        
					}
				}
			}
		}
		/**----------- Filter Products By it's Brand ------------ */
		if(req.body.brand && req.body.brand.length >0){
			selector["$and"].push({"brand": {$in:req.body.brand}})
		}

		// if(req.body.subcategoryID && req.body.subcategoryID !== '' && req.body.subcategoryID !== undefined){
		//     selector["$and"].push({"subCategory_ID": ObjectId(req.body.subcategoryID) })
		// }

		/**----------- Sorting Products ------------ */
		if(req.body.sortProductBy && req.body.sortProductBy !== undefined){
			if((req.body.sortProductBy).toLowerCase() === "az"){  
				/**----------- Sorting Product A to Z ------------ */              
				var returnFunction = function (firstProduct, secondProduct) {
					if (firstProduct.productName < secondProduct.productName) {
						return -1;
					}
					else if (firstProduct.productName > secondProduct.productName) {
						return 1;
					}
					else {
						return 0;
					}
				}
			}else if((req.body.sortProductBy).toLowerCase() === "za"){
				/**----------- Sorting Product Z to A ------------ */   
				var returnFunction = function (firstProduct, secondProduct) {
					if (firstProduct.productName > secondProduct.productName) {
						return -1;
					}
					else if (firstProduct.productName < secondProduct.productName) {
						return 1;
					}
					else {
						return 0;
					}
				}
			}else if((req.body.sortProductBy).toLowerCase() === "ph"){
				/**----------- Sorting Product by Price High to Low ------------ */   
				var returnFunction = function(a, b) {
					return b.discountedPrice - a.discountedPrice;
				}
			}else if((req.body.sortProductBy).toLowerCase() === "pl"){
				/**----------- Sorting Product by Price Low to High ------------ */   
				var returnFunction = function(a, b) {
					return a.discountedPrice - b.discountedPrice;
				}
			}
		}
		// console.log("selector => ",selector);

		Products.aggregate([ 
			{$match : selector},
			{$sort  : { 
							"universalProductCode"  : 1, 
							"discountedPrice"       : 1 
					} 
			}, 
			{$group : {
						_id : '$universalProductCode',
						doc : {"$first" : "$$ROOT"}
				
					}
			},
			{$replaceRoot : {"newRoot" : "$doc"}}  
		])
		.exec()
		.then(products=>{
			// console.log("products_by_lowest_price products => ",products);
			processData();
			async function processData(){
				var FinalVendorSequence = [];
				if(userLat !== "" && userLat !== undefined && userLong !== "" && userLong !== undefined){
					const uniqueVendors = [...new Set(products.map(item => String(item.vendor_ID)))];
					
					FinalVendorSequence = await getVendorSequence(uniqueVendors, userLat, userLong);
					FinalVendorSequence = FinalVendorSequence.map(vendor => vendor.vendor_ID);
				}

				if(products && products.length > 0){ 
					// var ordered_array = mapOrder(products, FinalVendorLocations, 'vendor_ID');
					for (let k = 0; k < products.length; k++) {
						// console.log("products_by_lowest_price products => ",products[k]);
						var inventoryData             	= await ProductInventory.findOne({productCode : products[k].productCode, itemCode : products[k].itemCode, vendor_ID : ObjectId(products[k].vendor_ID)},{currentQuantity : 1});
						// console.log("inventoryData => ",inventoryData)
						products[k].availableQuantity   = inventoryData  && inventoryData !== null ? inventoryData.currentQuantity : 0; 						
						products[k] 					= {...products[k], isWish : false};
						// console.log("products_by_lowest_price products => ",products[k]);
					}
					if(req.body.user_id && req.body.user_id !== 'null'){
						Wishlists.find({user_ID : req.body.user_id})
						.then(wish=>{
							if(wish.length > 0){
								for(var i = 0; i < wish.length; i++){
									for(var j = 0; j < products.length; j++){
										if(String(wish[i].product_ID) === String(products[j]._id)){
											products[j] = {...products[j], isWish : true};
											break;
										}
									}
								}   
								if(i >= wish.length){
									if(FinalVendorSequence && FinalVendorSequence.length > 0){                                        
										// res.status(200).json(mapOrder(products, FinalVendorSequence, 'vendor_ID').slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
										res.status(200).json(products.filter((product) => FinalVendorSequence.toString().includes(product.vendor_ID)).slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
									}else{
										res.status(200).json(products.slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
									}                            
								}       
							}else{
								if(FinalVendorSequence && FinalVendorSequence.length > 0){
									// res.status(200).json(mapOrder(products, FinalVendorSequence, 'vendor_ID').slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
									res.status(200).json(products.filter((product) => FinalVendorSequence.toString().includes(product.vendor_ID)).slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
								}else{
									res.status(200).json(products.slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
								} 
							}
						})
						.catch(err =>{
							console.log(err);
							res.status(500).json({
								message : "Wish List Data Not Found",
								error   : err
							});
						});
					}else{
						if(FinalVendorSequence && FinalVendorSequence.length > 0){
							// res.status(200).json(mapOrder(products, FinalVendorSequence, 'vendor_ID').slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
							res.status(200).json(products.filter((product) => FinalVendorSequence.toString().includes(String(product.vendor_ID))).slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
							
						}else{
							res.status(200).json(products.slice(req.body.startRange, req.body.limitRange).sort(returnFunction));
						} 
					}    
				}else{
					res.status(200).json(products);
				}
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	}
};

// function sortProducts(sortMethod){
//         switch (sortMethod.toLowerCase()) {
//           case "pl":
//             {
//               this.ProdData = this.ProdData.sort((low, high) => low.Price - high.Price);
//               break;
//             }
	
//           case "High":
//             {
//               this.ProdData = this.ProdData.sort((low, high) => high.Price - low.Price);
//               break;
//             }
	
//           case "Name":
//             {
//               this.ProdData = this.ProdData.sort(function (low, high) {
//                 if (low.Name < high.Name) {
//                   return -1;
//                 }
//                 else if (low.Name > high.Name) {
//                   return 1;
//                 }
//                 else {
//                   return 0;
//                 }
//               })
//               break;
//             }
	
//           default: {
//             this.ProdData = this.ProdData.sort((low, high) => low.Price - high.Price);
//             break;
//           }
	
//         }
//         return this.ProdData;
	
//       }
// }

/**=========== getSectionData() ===========*/
function getSectionData(sectionUrl){
	return new Promise(function(resolve,reject){
		Sections.findOne({"sectionUrl" : sectionUrl})
		.exec()
		.then(sectiondata=>{ 
			if(sectiondata && sectiondata !== undefined){
				resolve(sectiondata._id)
			}            
		})
		.catch(err =>{
			console.log("Section not found => ",err);
			reject(err)
		});
	});
}

/**=========== getCategoryData() ===========*/
function getCategoryData(categoryUrl){
	return new Promise(function(resolve,reject){
		Category.findOne({"categoryUrl" : categoryUrl}, {subCategory : 1})
		.exec()
		.then(categorydata=>{
			if(categorydata && categorydata !== undefined){
				resolve(categorydata)
			}            
		})
		.catch(err =>{
			console.log("Category not found => ",err);
			reject(err)
		});
	});
}
/**=========== getSubCategoryData() ===========*/
// function getSubCategoryData(categoryID, subCategoryUrl){
//     console.log("In getSubCategoryData ", categoryID, subCategoryUrl)
//     return new Promise(function(resolve,reject){
//         Category.find({"_id": ObjectId(categoryID), subCategory: { $elemMatch: {subCategoryUrl : { $in : subCategoryUrl }}  } })
//         .exec()
//         .then(categorydata=>{
//             console.log("categorydata => ",categorydata)
//             if(categorydata && categorydata !== undefined){
//                 resolve(categorydata)
//             }            
//         })
//         .catch(err =>{
//             console.log("Category not found => ",err);
//             reject(err)
//         });
//     });
// }


/**========== mapOrder ===========*/
function mapOrder (array, order, key) {
	array.sort( function (a, b) {
		var A = a[key], B = b[key];
		if (String(A) === String(B)) {
			return 1;
		} else {
			return -1;
		}      
	}); 
	return array;
}; 

/** =============== filterByKey() =============== */
const filterByKey = (arr1 = [], arr2 = []) => {
	let res = [];
	res = arr2.filter(el => {
		const index = arr1.indexOf(String(el.subCategoryUrl));
		return index !== -1;
	});
	return res;
}; 

/**========== product_list_by_section ===========*/
exports.product_list_by_section = (req,res,next)=>{    
	Products.find({section_ID : req.body.section_ID, "status": "Publish"})
	.exec()
	.then(productData=>{
		// console.log("productData => ", productData);
		res.status(200).json(productData);
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error   : err,
			message : "Products not found for the Section"
		});
	});
};

/**=========== calcUserVendorDist() ===========*/
function calcUserVendorDist(vendorLat,vendorLong, userLat, userLong){
	return new Promise(function(resolve,reject){
		//First point User Location
		var userLocation = { lat: userLat, lng: userLong }

		//Second point Vendor Location
		var vendorLocation = { lat: vendorLat, lng: vendorLong }        
		
		//Distance in meters (default)
		var distance_m = haversine(userLocation, vendorLocation);

		//Distance in kilometers
		var distance_km = distance_m /1000; 
		
		resolve(distance_km);
	});
}

/**=========== getVendorSequence() ===========*/
function getVendorSequence(uniqueVendors, userLat, userLong) {
	return new Promise(function(resolve,reject){  
		EntityMaster.find({"_id" : {$in : uniqueVendors} }, {locations:1})              
		.exec()
		.then(vendorDetails=>{

			if(vendorDetails && vendorDetails.length > 0){
				var vendorLocations = [];

				getVendorDistArray();
				async function getVendorDistArray() {
					for(var i = 0; i < vendorDetails.length; i++){
						// console.log("vendorDetails => ",vendorDetails[i])
						if(vendorDetails[i].locations && vendorDetails[i].locations.length > 0){
							
							for(let j = 0; j < vendorDetails[i].locations.length; j++){
								var vendor_ID   = vendorDetails[i]._id;
								var vendorLat   = vendorDetails[i].locations[j].latitude;
								var vendorLong  = vendorDetails[i].locations[j].longitude;
								
								var vendorDist = await calcUserVendorDist(vendorLat,vendorLong, userLat, userLong);
								
								console.log("vendorDist => ", vendorDist);

								vendorDetails[i].locationsj =   {
																	"vendor_ID"         : vendor_ID, 
																	"vendorDistance"    : vendorDist >=0 ? vendorDist.toFixed(2) : '',
																	"vendorLocation_id" : vendorDetails[i].locations[j]._id
																};
								vendorLocations.push(vendorDetails[i].locationsj);
							}
						}
					}
					if(i >= vendorDetails.length){
						const key           = 'vendor_ID';
						var distanceLimit   = await getDistanceLimit();

						if(vendorLocations && vendorLocations.length > 0){
							// console.log("distanceLimit => ",distanceLimit);
							console.log("vendorLocations => ",vendorLocations);
							// FinalVendorSequence           = [...new Set(vendorLocations.sort((a, b) => parseInt(a.vendorDistance) - parseInt(b.vendorDistance)).map(item => String(item.vendor_ID)))] 
							if(distanceLimit){
								var FinalVendorSequence = [...new Map(vendorLocations.filter(vendorLocation => parseFloat(vendorLocation.vendorDistance) <= parseFloat(distanceLimit)).sort((b, a) => parseFloat(a.vendorDistance) - parseFloat(b.vendorDistance)).map(item =>[item[key], item])).values()];
								// var FinalVendorSequence = [...new Set(vendorLocations.sort((a, b) => parseInt(a.vendorDistance) - parseInt(b.vendorDistance)).map(item => String(item.vendor_ID)))];
								// console.log("FinalVendorSequence 1 =>",FinalVendorSequence.sort((a, b) => (parseFloat(a.vendorDistance) > parseFloat(b.vendorDistance)) ? 1 : -1))
							}else{
								var FinalVendorSequence  = [...new Map(vendorLocations.sort((b, a) => parseFloat(a.vendorDistance) - parseFloat(b.vendorDistance)).map(item =>[item[key], item])).values()] 
								// var FinalVendorSequence  = [...new Set(vendorLocations.sort((a, b) => parseInt(a.vendorDistance) - parseInt(b.vendorDistance)).map(item => String(item.vendor_ID)))];
								// console.log("FinalVendorSequence => 2 ",FinalVendorSequence.sort((a, b) => (parseFloat(a.vendorDistance) > parseFloat(b.vendorDistance)) ? 1 : -1));
							}
							resolve(FinalVendorSequence.sort((a, b) => (parseFloat(a.vendorDistance) > parseFloat(b.vendorDistance)) ? 1 : -1))
						}                            
					}
				}
			}else{                    
				console.log("Success Code - 200 : Vendors Locations not found for Vendors of section")
				resolve([]);
			}
		})
		.catch(err =>{
			console.log("Error Code - 500  => ",err);
			reject(err)
		});
	})
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

/*=============== Product inventory List ==============*/

exports.product_inventory_list = (req,res,next)=>{
	console.log('req', req.body);
	var selector        = {};
	selector['$and']    = [];

	// selector["$and"].push({"status": {$ne : ""}});
	/**----------- Find Vendorwise Products ------------ */
	if(req.body.vendor && req.body.vendor !== '' && req.body.vendor !== undefined){
		selector["$and"].push({"vendor_ID": ObjectId(req.body.vendor) })
	}
	/**----------- Find Sectionwise Products ------------ */
	if(req.body.section && req.body.section !== '' && req.body.section !== undefined){
		selector["$and"].push({"section_ID": ObjectId(req.body.section) })
	}
	/**----------- Find Categorywise Products ------------ */
	if(req.body.category && req.body.category !== '' && req.body.category !== undefined){
		selector["$and"].push({"category_ID": ObjectId(req.body.category) })
	}
	/**----------- Find SubCategorywise Products ------------ */
	if(req.body.subCategory && req.body.subCategory !== '' && req.body.subCategory !== undefined){
		selector["$and"].push({"subCategory_ID": ObjectId(req.body.subCategory) })
	}
	// if(req.body.status !== "" && req.body.status !== undefined){
	// 	selector["$and"].push( {"status" : req.body.status} );
	// }else{
		selector["$and"].push( {"status" : {$ne : ""}} );
	// }
	if(req.body.searchText && req.body.searchText !== ""){
		// selector["$or"].push({ "$vendorDetails.companyName" : {'$regex' : req.body.searchText , $options: "i" } });
		selector["$and"].push({ 
			"$or" : [
						{ "vendorDetails.companyName" 						: {'$regex' : req.body.searchText , $options: "i" } },
						{ "productName" 											: {'$regex' : req.body.searchText , $options: "i" } },
						{ "brand" 													: {'$regex' : req.body.searchText , $options: "i" } },
						{ "subCategory"											: {'$regex' : req.body.searchText , $options: "i" } },
						{ "sectionDetails.section" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.category" 							: {'$regex' : req.body.searchText , $options: "i" } },
						{ "categoryDetails.subCategory.subCategoryTitle": {'$regex' : req.body.searchText , $options: "i" } },
						{ "productCode"											: {'$regex' : req.body.searchText , $options: "i" } },
						{ "itemCode"												: {'$regex' : req.body.searchText , $options: "i" } },
					]
		})
	}
	console.log("selector => ",selector)

	Products.aggregate([
		{ $lookup : {
				from 				: 'entitymasters',
				localField 			: 'vendor_ID',
				foreignField 		: '_id',
				as 					: 'vendorDetails'
			}
		},	
		{ $lookup : {
				from 				: 'sections',
				localField 			: 'section_ID',
				foreignField 		: '_id',
				as 					: 'sectionDetails'
			}
		},
		{ $lookup : {
				from 				: 'categories',
				localField 			: 'category_ID',
				foreignField 		: '_id',
				as 					: 'categoryDetails'
			}
		},
		{ $match : selector },
		{ $sort: {
				createdAt : -1
			}
		},
		{$project : 
			{
				_id      							: 1,
				vendor_ID 							: 1,
				section_ID 							: 1,
				category_ID 						: 1,
				subCategory_ID 					: 1,
				status          					: 1,
				createdAt       					: 1,
				"productName"						: 1,
				"brand"								: 1,
				"productCode" 						: 1,
				"itemCode" 							: 1,
				"vendorBarcode"					: 1,
				"vendorItemcode"					: 1,
				"originalPrice" 					: 1,
				"discountPercent" 				: 1,
				"discountedPrice" 				: 1,
				"availableQuantity" 				: 1,
				"universalProductCode" 			: 1,
				// "exclusive" 					: 1,
				"vendorDetails.companyName"	: 1,
				"categoryDetails.category"		: 1,
				"categoryDetails.subCategory"	: 1,
				"sectionDetails.section"		: 1,
				"productImage" 					: 1,
			}
		}
	])
	.then(async(data)=>{
		var allData 	= [];
		var dataCount 	= await data.length;
		data 				= data.slice(parseInt(req.body.startRange), parseInt(req.body.startRange) + parseInt(req.body.limitRange));

		for (var i = 0; i < data.length; i++) {			
			// processData();
			// async function processData(){
			var inventoryData = await ProductInventory.findOne({
				universalProductCode : data[i].universalProductCode,  
				// vendor_ID            : ObjectId(data[i].vendor_ID),
				productCode 			: data[i].productCode,  
				itemCode 				: data[i].itemCode  
			},{currentQuantity : 1});

			allData.push({
				"_id"                   : data[i]._id,
				"vendorName"            : data[i].vendorDetails && data[i].vendorDetails.length > 0 ? data[i].vendorDetails[0].companyName : "NA",
				"productName"           : "<span class='whiteSpaceNormal'><b>"+(data[i].productName)+"</b><br></span>"+"<span class='whiteSpaceNoWrap'>Product Code: "+data[i].productCode+ "</span></br><span class='whiteSpaceNoWrap'>Item Code: "+data[i].itemCode+ "</span></br><span class='whiteSpaceNoWrap'>UPC: "+data[i].universalProductCode + "</span>",
				"section"               : data[i].sectionDetails && data[i].sectionDetails.length > 0 ? data[i].sectionDetails[0].section : "",
				"category"              : data[i].categoryDetails && data[i].categoryDetails.length > 0 ? data[i].categoryDetails[0].category : "",
				"subCategory"           : data[i].subCategory_ID && data[i].subCategory_ID !== undefined 
													?
														data[i].categoryDetails && data[i].categoryDetails.length > 0 && data[i].categoryDetails[0].subCategory && data[i].categoryDetails[0].subCategory.length > 0
														?
															data[i].categoryDetails[0].subCategory.filter(obj => String(obj._id) === String(data[i].subCategory_ID))
  																												.map(obj => obj.subCategoryTitle)
  														:
  															""
  													:
  														"",
				"originalPrice"         : "<span class='textAlignRight'>"+"<i class='fa fa-"+data[i].currency+"'></i>&nbsp;"+data[i].originalPrice+"</span>",
				"discountPercent"       : "<span class='textAlignRight'>"+data[i].discountPercent+"%"+"</span>",
				"discountedPrice"       : "<span class='textAlignRight'>"+"<i class='fa fa-"+data[i].currency+"'></i>&nbsp;"+data[i].discountedPrice+"</span>",
				"currentQuantity"     	: inventoryData !== null ? inventoryData.currentQuantity : 0,
			})
		}
		if(i >= data.length){
			res.status(200).json({
				dataCount 	: dataCount,
				data 			: allData
			});
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
};