const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../../coreAdmin/middlerware/check-auth.js');

const PurchaseEntryController = require('../controllers/PurchaseEntry');

router.post('/post', 											checkAuth, PurchaseEntryController.insert_purchaseEntry);

router.get('/get/list', 										checkAuth, PurchaseEntryController.list_purchaseEntry);

router.post('/post/getReportOfPurchaseEntry', 			checkAuth, PurchaseEntryController.get_purchase_entry_report);

router.get('/get/one/:fetchId', 								checkAuth, PurchaseEntryController.fetch_one);

router.patch('/patch/:purchaseID', 							checkAuth, PurchaseEntryController.update_PurchaseEntry);

router.delete('/delete/:purchaseID', 						checkAuth, PurchaseEntryController.delete_purchaseEntry);

router.post('/post/datewisepurchase/', 					checkAuth, PurchaseEntryController.get_datewise_purchaceEntry);

router.get('/get/PurchaseNumbers', 							checkAuth, PurchaseEntryController.get_purchase_numbers);

router.get('/get/TotalInward/:itemcode', 					checkAuth, PurchaseEntryController.get_total_inward);

router.get('/get/RawMaterialCurrentStock/:itemcode', 	checkAuth, PurchaseEntryController.raw_material_current_stock);

/* Bulk upload code by madhuri */
router.post('/raw_material_bulk_upload', 					checkAuth, PurchaseEntryController.raw_material_bulk_upload);

router.get('/get/filedetails/:fileName', 					checkAuth, PurchaseEntryController.filedetails);

router.get('/get/GeneratePurchaseNumber', 				checkAuth, PurchaseEntryController.generate_purchase_number);
/*bulk upload end*/
router.get('/get/totalRawBalance', 							checkAuth, PurchaseEntryController.get_total_raw_balance);

/*
router.get('/get/datewisepurchase/:purchaseDate',PurchaseEntryController.get_datewise_purchaceEntry);

router.get('/get/list/:section_ID',PurchaseEntryController.list_category);

router.get('/get/count',PurchaseEntryController.count_category);

router.post('/get/list',PurchaseEntryController.list_category_with_limits);

router.get('/get/one/:categoryID', PurchaseEntryController.fetch_category);

router.get('/get/:sectionID', PurchaseEntryController.fetch_categories_by_section);

router.post('/searchCategory', PurchaseEntryController.searchCategory);

router.post('/searchCategoryCount', PurchaseEntryController.searchCategoryCount);
*/



 


module.exports = router;