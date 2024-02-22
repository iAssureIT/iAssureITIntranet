const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../../coreAdmin/middlerware/check-auth.js');

const franchisePOController = require('./Controller');

router.post('/post', 														checkAuth, franchisePOController.insert_franchisePO);

router.get('/get/purchaseorderList/:franchise_id/:orderDate', 	checkAuth, franchisePOController.list_franchisePO);

router.post('/get/purchaseorderallList', 								checkAuth, franchisePOController.allorder_franchise);

router.get('/get/franchiseorderlist/:franchise_id', 				checkAuth, franchisePOController.franchise_Wise_order);

// router.get('/get/franchiseorderlist/:franchise_id',franchisePOController.list_franchisePO);
 
router.get('/get/purchaseorderList/:orderDate', 					checkAuth, franchisePOController.list_allfranchisePO);

router.get('/get/all-frachise-po-data/:orderDate', 				checkAuth, franchisePOController.allFrachisePOData);

router.post('/post/searchlist', 											checkAuth, franchisePOController.search_PO);

router.get('/get/one/purchaseorder/:purchaseorder_id', 			checkAuth, franchisePOController.one_franchisePO);

router.patch('/patch/purchaseorder', 									checkAuth, franchisePOController.update_franchisePO);
 
router.patch('/patch/acceptitem', 										checkAuth, franchisePOController.update_franchisePOitem);

router.patch('/patch/patch/acceptpurchaseorder', 					checkAuth, franchisePOController.update_franchisePOaccept);

router.delete('/delete/purchaseorder/:purchaseorder_id', 		checkAuth, franchisePOController.delete_franchisePO);

router.get('/get/count', 													checkAuth, franchisePOController.count_order);

router.get('/get/count/:franchise_id', 								checkAuth, franchisePOController.count_order);


module.exports = router;