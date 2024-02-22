const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const orderController = require('./Controller');

router.post('/post', 																				orderController.insert_orders);

router.post('/pgcall/post', 																		checkAuth, orderController.paymentgatewaycall);

router.patch('/', 																					checkAuth, orderController.update_order);

router.patch('/paymentorder/:order_ID', 														checkAuth, orderController.update_order_payment);

router.patch('/patch/updateDeliveryStatus', 													checkAuth, orderController.updateDeliveryStatus);

router.patch('/patch/changeToPreviousStatus', 												checkAuth, orderController.changeToPreviousStatus);

router.get('/get/list', 																			checkAuth, orderController.list_order);

router.get('/get/franchisewise/list/:franchiseID', 										checkAuth, orderController.list_franchise_order);

router.post('/get/vendorwiselist/:vendorID', 												checkAuth, orderController.vendor_order_list);

router.get('/get/orderlist/:status', 															checkAuth, orderController.list_orderby_status);

router.get('/get/orderlist/:status/:franchiseID', 											checkAuth, orderController.list_orderby_status_franchisewise);

router.post('/get/vendororderstatuslist/:vendorID', 										checkAuth, orderController.vendor_orderlistby_status);

router.get('/get/count', 																			checkAuth, orderController.count_order);

router.get('/get/vendorwisecount/:vendorID', 												checkAuth, orderController.vendor_order_count);

router.get('/get/list/:userID', 															checkAuth, orderController.list_order_by_user);

router.post('/get/list', 																			checkAuth, orderController.list_order_with_limits);

router.get('/get/one/:orderID', 															 orderController.fetch_order);

router.delete('/delete/:orderID', 																checkAuth, orderController.delete_order);

router.patch('/patch/dispatchOrder', 															checkAuth, orderController.dispatchOrder);

router.get('/get/listbyba/:ba_ID', 																checkAuth, orderController.list_order_by_ba);

router.patch('/get/cancelOrder', 																checkAuth, orderController.cancelOrder);
 
router.patch('/get/returnOrder', 																checkAuth, orderController.returnOrder);

router.post('/get/report-count', 																checkAuth, orderController.get_reports_count);

router.post('/get/report/:startRange/:limitRange', 										checkAuth, orderController.get_reports);

router.post('/get/report/:franchiseID/:startRange/:limitRange', 						checkAuth, orderController.get_reports_franchise);

router.post('/get/category-wise-report-count', 												checkAuth, orderController.get_category_reports_count);

router.post('/get/category-wise-report/:startRange/:limitRange', 						checkAuth, orderController.get_category_reports);

router.get('/get/ytdorders', 																		checkAuth, orderController.ytdorders);

router.get('/get/mtdorders', 																		checkAuth, orderController.mtdorders);

router.get('/get/mtdorders', 																		checkAuth, orderController.mtdorders);

router.get('/get/neworderscount', 																checkAuth, orderController.neworderscount);

router.get('/get/totalOrdersByPeriod/:startTime', 											checkAuth, orderController.totalOrdersByPeriod);

router.get('/get/totalOrdersByState', 															checkAuth, orderController.totalOrdersByState);

router.get('/get/sectionRevenue', 																checkAuth, orderController.sectionRevenue);

router.get('/get/categoryRevenue', 																checkAuth, orderController.categoryRevenue);

router.get('/get/subCategoryRevenue', 															checkAuth, orderController.subCategoryRevenue);

router.get('/get/vendorWiseOrder', 																checkAuth, orderController.subCategoryRevenue);

router.post('/get/get_orders', 																	checkAuth, orderController.get_orders_with_filters);

//code by madhuri ghute start

router.post('/get/getBillsByUser/', 															checkAuth, orderController.list_bill_by_user);

router.patch('/patch/allocateOrderToFranchise', 											checkAuth, orderController.allocateOrderToFranchise);

router.get('/get/franchisewisecount', 															checkAuth, orderController.franchise_order_count);

router.get('/get/topFranchiseSale', 															checkAuth, orderController.top_franchise_sale);

router.get('/get/franchiseCategoryRevenue/:franchiseID', 								checkAuth, orderController.franchiseCategoryRevenue);

router.get('/get/franchiseSectionRevenue/:franchiseID', 									checkAuth, orderController.franchiseSectionRevenue);

router.post('/get/getMonthwiseOrders', 														checkAuth, orderController.getMonthwiseOrders);

router.get('/get/franchiseTopProductsSale/:franchiseID/:startDate/:endDate', 		checkAuth, orderController.franchiseTopProductsSale);

router.get('/get/digitalytdorders/:franchiseID', 											checkAuth, orderController.franchise_digital_order_counts);

router.get('/get/totalSale/', 																	checkAuth, orderController.total_sale_cost);

router.get('/get/franchise-daily-orders-count/:franchiseID/:startDate/:endDate', checkAuth, orderController.franchise_daily_orders_count);

router.get('/get/inStoreBillCounts/:franchiseID', 											checkAuth, orderController.franchise_bill_counts);

router.delete('/get/deleteAllOrders', 															checkAuth, orderController.deleteAllOrders);

//code by madhuri ghute end

module.exports = router; 