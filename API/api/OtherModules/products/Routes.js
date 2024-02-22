const express 		        = require("express");
const router 		        = express.Router();
const checkAuth 	        = require('../../coreAdmin/middlerware/check-auth.js');
const productController 	= require('./Controller');
const productStock 			= require('./Controller2');

router.post('/post', 													checkAuth, productController.insert_product);

router.post('/post/bulkUploadProduct', 									productController.bulkUploadProduct);

// router.post('/post/bulkUploadProductSiggleowner',                    productController.bulkUploadProductSigleowner);

// router.post('/post/bulkUploadProductUpdate', 						checkAuth, productController.bulkUploadProductUpdate);

router.post('/post/bulkUploadProductUpdate', 							productController.bulkProductUpdate);

// router.get('/get/filedetails/:fileName',                             productController.filedetails);

router.post('/get/filedetails/', 										productController.filedetails);

router.post('/get/inventory/filedetails/', 										productController.inventoryFileDetails);

router.post('/get/wishlist/product', 									productController.wishlist_product);

router.patch('/patch', 													checkAuth, productController.update_product);

router.patch('/patch/availablequantity', 								checkAuth, productController.update_availablequantity);

router.get('/get/list', 												productController.list_product);

router.get('/get/related/list/:attribute_id', 					productController.list_related_products);
// in used
// router.get('/get/listbysection/:section',                            productController.list_product_bySection);

router.get('/get/list/mobile/:section', 								productController.list_product_bySection_mobile);

router.get('/get/productcode/:productCode', 							productController.list_product_code);

//router.get('/get/brandlist',                                          productController.list_brand);

router.get('/get/listbytype/:productType', 						        productController.list_productby_type);

// router.get('/get/products/listbytype/:productType', 			        productController.list_productby_type_mobile);

router.get('/get/products/listbytype/:productType/:user_ID/:limit', 	productController.list_productby_type_mobile);

router.get('/get/listbytypeNcategory/:categoryID/:productType',         productController.list_productby_type_category);

router.get('/get/list/:sectionID', 								        productController.list_productby_section);

router.get('/get/listby/category/:categoryID/:user_ID', 		        productController.list_productby_category);

router.post('/get/similar_products', 		                            productController.similar_products);

router.get('/get/listbycategory/:categoryUrl', 				            productController.list_productby_categoryUrl);

router.get('/get/listbysection/:sectionUrl', 					        productController.list_productby_sectionUrl);

router.get('/get/listbysubcategory/:subcategoryUrl', 			        productController.list_productby_subcategoryUrl);

router.get('/get/list/:categoryID/:subcategoryID', 				        productController.list_productby_subcategory);

router.put('/attribute', 										        productController.update_product_attribute);

router.put('/status', 											        productController.update_product_status);

router.put('/multiple', 										        productController.update_product_multiple);

router.get('/get/count', 										        productController.count_product);

router.get('/get/newcount', 										        productController.new_count_product);

router.post('/get/all/count', 										        productController.count_all_products);

router.get('/get/published/count',  							        productController.count_published_product);

router.get('/get/vendorwisecount/:vendorID', 					        productController.count_vendor_product);

router.post('/get/files', 										        productController.fetch_file);

router.post('/get/searchfile', 									        productController.search_file);

router.post('/get/vendorfiles',											checkAuth, productController.fetch_vendor_file);

router.get('/get/files/count', 											checkAuth, productController.fetch_file_count);

router.get('/get/vendorfiles/count/:vendorID', 							checkAuth, productController.fetch_vendorfile_count);
 
router.post('/get/list', 												productController.list_product_with_limits);

router.post('/get/inventory/list', 												productController.product_inventory_list);

router.post('/get/vendorwiselist', 										checkAuth, productController.list_product_with_vendor);

router.post('/get/vendorwiseimagelist/:vendorID', 						checkAuth, productController.list_productimage_with_vendor);

router.patch('/patch/gallery', 											checkAuth, productController.upload_photo);

router.patch('/patch/bulkimages/', 										checkAuth, productController.upload_photo_product_code);

router.patch('/remove/image', 											checkAuth, productController.remove_photo);

// router.get('/get/one/:productID/:user_ID', 								productController.fetch_product);

router.post('/get/one', 								                    productController.fetch_product);

router.get('/get/one/:productID', 								        productController.fetch_One_product);

router.get('/get/hotproduct', 											productController.fetch_hot_product);

router.delete('/delete/:productID', 									checkAuth, productController.delete_product);

router.delete('/file/delete/:fileName', 								checkAuth, productController.delete_file);

router.get('/get/adminsearch/:searchstr', 								checkAuth, productController.admin_search_product);

router.get('/get/search/:searchstr/:vendorID', 							checkAuth, productController.vendor_search_product);

router.get('/get/searchcount/:searchstr/:vendorID', 					checkAuth, productController.vendor_search_count_product);

// router.get('/get/search/website/:searchstr/:user_id/:limit', 		    productController.search_product);

router.post('/get/search/website', 		                                productController.search_product);

router.post('/get/search/suggestion', 						            productController.search_suggestion);

router.get('/get/searchproducts/:searchstr', 							productController.search_product_mobileapp);

router.post('/post/searchINCategory', 								    checkAuth, productController.searchINCategory);

router.get('/get/listBrand/:sectionID', 							    productController.list_brand);

router.post('/get/listBrandByCategories', 								productController.listBrandByCategories);

router.post('/get/listBrandBySubcategories', 							productController.listBrandBySubcategories);

router.get('/get/listSize/:sectionID', 									productController.list_size);

router.get('/get/listSizeByCategory/:categoryID', 					    productController.listSizeByCategory);

router.get('/get/listSizeBySubcategory/:subcategoryID', 				productController.listSizeBySubcategory);

router.get('/get/listColor/:sectionID', 								productController.list_color);

router.get('/get/listColorByCategory/:categoryID', 					    productController.listColorByCategory);

router.get('/get/listColorBySubcategory/:subcategoryID', 			    productController.listColorBySubcategory);

router.get('/get/minmaxprice/:sectionID', 								productController.get_minmaxprice);

router.get('/get/listGroceryBrand', 									productController.list_grocerybrand);

router.get('/get/getmegamenulist', 										productController.get_menu_list);

router.post('/post/list/adminFilterProducts', 							checkAuth, productController.admin_filter_products);

router.post('/post/adminFilterProductsCount', 							checkAuth, productController.admin_filter_productsCount); 

router.post('/post/list/filterProducts', 								checkAuth, productController.filter_products);

router.post('/post/list/filterProductsByCategory', 					    checkAuth, productController.filter_products_ByCategory);

router.get('/get/productCountByStatus', 								checkAuth, productController.productCountByStatus);

router.get('/get/vendorProductCount/:vendorID', 						checkAuth, productController.vendorProductCount);

router.patch('/patch/productBulkAction', 								checkAuth, productController.productBulkAction);

router.get('/get/outofstockproducts', 									checkAuth, productController.outofstockproducts);

router.get('/get/attributes/:sectionID', 								checkAuth, productController.getattributes);

router.get('/get/attributesbycategory/:categoryID', 					checkAuth, productController.getattributesbycategory);

router.get('/get/attributesbysubcategory/:subCategoryID', 			    checkAuth, productController.getattributesbysubcategory);

router.post('/get/list/lowestprice', 									productController.products_by_lowest_price);
//================================================== for franchise

router.get('/get/franchisestock', 										productStock.getfranchisestock);

router.get('/get/franchisestock/:franchise_id', 						productStock.getFranchiseCurrentStock);

router.get('/check-item-code-exits/:itemcode',							productController.checkItemCodeExists)

// router.get('/get/warehousestock',                                    productStock.getwarehousestock);

/*===================== New API's By Jyoti =====================*/

router.post('/get/product_list_by_section', 					        productController.product_list_by_section);


/*===================== New API's By Ranjan =====================*/

router.post('/get/listimgproduct/limit', 	productController.list_limit_product_data);
router.post('/get/listimgproduct/filter', productController.list_product_with_FilterData);



module.exports = router;