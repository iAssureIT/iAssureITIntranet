const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../../coreAdmin/middlerware/check-auth.js');

const FinishedGoodsEntryController = require('../controllers/FinishedGoodsEntry');

router.post('/post', 										checkAuth, FinishedGoodsEntryController.insert_FinishedGoodsEntry);

router.post('/post/list', 									checkAuth, FinishedGoodsEntryController.list_FinishedGoodsEntry);

router.get('/get/one/:fetchId', 							checkAuth, FinishedGoodsEntryController.fetch_one);

router.patch('/update/:purchaseID', 					checkAuth, FinishedGoodsEntryController.update_FinishedGoodsEntry);

router.delete('/delete/:purchaseID', 					checkAuth, FinishedGoodsEntryController.delete_FinishedGoodsEntry);

router.get('/get/TotalOutward/:itemcode', 			checkAuth, FinishedGoodsEntryController.get_total_outward);

router.get('/get/ProductList', 							checkAuth, FinishedGoodsEntryController.list_Products);


/* Bulk upload code by madhuri */
router.post('/finishedGoodsBulkUpload', 				checkAuth, FinishedGoodsEntryController.finished_goods_bulk_upload);

router.get('/get/filedetails/:fileName', 				checkAuth, FinishedGoodsEntryController.filedetails);

router.post('/post/getReportOfFinishedGoods', 		checkAuth, FinishedGoodsEntryController.get_finished_goods_report);

router.post('/post/getProductCurrentStockReport', 	checkAuth, FinishedGoodsEntryController.get_product_current_stock_report);
/* Bulk upload code end */

router.get('/get/totalFinishBalance', 					checkAuth, FinishedGoodsEntryController.get_total_finish_balance);



/*
router.get('/get/list/:section_ID',PurchaseEntryController.list_category);

router.get('/get/count',PurchaseEntryController.count_category);

router.post('/get/list',PurchaseEntryController.list_category_with_limits);

router.get('/get/one/:categoryID', PurchaseEntryController.fetch_category);

router.get('/get/:sectionID', PurchaseEntryController.fetch_categories_by_section);

router.post('/searchCategory', PurchaseEntryController.searchCategory);

router.post('/searchCategoryCount', PurchaseEntryController.searchCategoryCount);
*/



 


module.exports = router;