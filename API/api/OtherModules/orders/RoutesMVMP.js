const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const orderController = require('./ControllerMVMP');

router.post('/post', 																			orderController.insert_orders);

router.patch('/changevendororderstatus', 													    orderController.change_vendor_orders_status);

router.post('/get/list_orders_by_status', 													    orderController.list_orders_by_status);
 
router.patch('/patch/returnproduct', 															orderController.returnProduct);

router.post('/reports/revenue', 																	orderController.revenue_reports);

router.post('/reports/delivery_drivers', 																	orderController.delivery_drivers_reports);

router.post('/reports/vendor_sales', 																	orderController.vendor_sales_reports);

router.post('/pgcall/post', 																	orderController.paymentgatewaycall);

router.patch('/', 																				orderController.update_order);

router.patch('/paymentorder/:order_ID', 														orderController.update_order_payment);

router.patch('/patch/updateDeliveryStatus', 													orderController.updateDeliveryStatus);

router.patch('/patch/changeToPreviousStatus', 												    orderController.changeToPreviousStatus);

router.patch('/cancel/order', 													                orderController.cancel_order);

router.get('/get/list', 																		orderController.list_order);

router.get('/get/list/fordashboard', 																		orderController.list_order_for_dashboard);

router.get('/get/franchisewise/list/:franchiseID', 										        orderController.list_franchise_order);

router.post('/get/vendorwiselist/:vendorID', 												    orderController.vendor_order_list);

router.get('/get/orderlist/:status', 															orderController.list_orderby_status);

router.get('/get/orderlist/:status/:franchiseID', 											    orderController.list_orderby_status_franchisewise);

router.post('/get/vendororderstatuslist/:vendorID', 										    orderController.vendor_orderlistby_status);

router.get('/get/count', 																		orderController.count_order);

router.get('/get/vendorwisecount/:vendorID', 												    orderController.vendor_order_count);

router.get('/get/list/:userID', 															    orderController.list_order_by_user);

router.post('/get/list', 																		orderController.list_order_with_limits);

router.get('/get/one/:orderID', 																orderController.fetch_order);

router.get('/get/one/vendor/order/:orderID/:vendor_id', 									    orderController.fetch_vendor_order);

router.get('/get/one/order/:orderID', 															orderController.fetch_one_order);

router.delete('/delete/:orderID', 																checkAuth, orderController.delete_order);

router.patch('/patch/dispatchOrder', 															checkAuth, orderController.dispatchOrder);

router.get('/dispatchcenter/get/nearby_delivery_persons/:order_id/:vendor_id',                 orderController.get_nearby_delivery_persons);

router.get('/get/listbyba/:ba_ID', 																checkAuth, orderController.list_order_by_ba);

router.patch('/get/cancelOrder', 																orderController.cancelOrder);
 
// router.patch('/get/returnOrder', 																checkAuth, orderController.returnOrder);

router.post('/get/report-count', 																checkAuth, orderController.get_reports_count);

router.post('/get/report/:startRange/:limitRange', 										        checkAuth, orderController.get_reports);

router.post('/get/report/:franchiseID/:startRange/:limitRange', 						        checkAuth, orderController.get_reports_franchise);

router.post('/get/category-wise-report-count', 												    checkAuth, orderController.get_category_reports_count);

router.post('/get/category-wise-report/:startRange/:limitRange', 						        checkAuth, orderController.get_category_reports);

router.get('/get/ytdorders', 																	checkAuth, orderController.ytdorders);

router.get('/get/mtdorders', 																	checkAuth, orderController.mtdorders);

router.get('/get/mtdorders', 																	checkAuth, orderController.mtdorders);

router.get('/get/neworderscount', 																checkAuth, orderController.neworderscount);

router.get('/get/totalOrdersByPeriod/:startTime', 											    checkAuth, orderController.totalOrdersByPeriod);

router.get('/get/totalOrdersByState', 															checkAuth, orderController.totalOrdersByState);

router.get('/get/sectionRevenue', 																checkAuth, orderController.sectionRevenueVendorOrders);

router.get('/get/categoryRevenue', 																checkAuth, orderController.categoryRevenue);

router.get('/get/subCategoryRevenue', 															checkAuth, orderController.subCategoryRevenue);

router.get('/get/vendorWiseOrder', 																checkAuth, orderController.subCategoryRevenue);

router.post('/get/get_orders', 																	checkAuth, orderController.get_orders_with_filters);

//code by madhuri ghute start

router.post('/get/getBillsByUser/', 															checkAuth, orderController.list_bill_by_user);

router.patch('/patch/allocateOrderToFranchise', 											    checkAuth, orderController.allocateOrderToFranchise);

router.get('/get/franchisewisecount', 															checkAuth, orderController.franchise_order_count);

router.get('/get/topFranchiseSale', 															checkAuth, orderController.top_franchise_sale);

router.get('/get/franchiseCategoryRevenue/:franchiseID', 								        checkAuth, orderController.franchiseCategoryRevenue);

router.get('/get/franchiseSectionRevenue/:franchiseID', 									    checkAuth, orderController.franchiseSectionRevenue);

router.post('/get/getMonthwiseOrders', 														    checkAuth, orderController.getMonthwiseOrders);

router.get('/get/franchiseTopProductsSale/:franchiseID/:startDate/:endDate', 		            checkAuth, orderController.franchiseTopProductsSale);

router.get('/get/digitalytdorders/:franchiseID', 											    checkAuth, orderController.franchise_digital_order_counts);

router.get('/get/totalSale/', 																	checkAuth, orderController.total_sale_cost);

router.get('/get/franchise-daily-orders-count/:franchiseID/:startDate/:endDate',                checkAuth, orderController.franchise_daily_orders_count);

router.get('/get/inStoreBillCounts/:franchiseID', 											    checkAuth, orderController.franchise_bill_counts);

router.delete('/get/deleteAllOrders', 															checkAuth, orderController.deleteAllOrders);

// Order Dispatch Center

router.post('/get/list_ready_to_dispatch_orders',                                               orderController.list_ready_to_dispatch_orders)

//Mobile Driver App

router.post('/get/single/vendor_order',                                                          orderController.get_single_vendor_order)

router.patch('/deliver/vendor_order',                                                            orderController.deliver_single_vendor_order)

router.post('/get/daily/vendor_orders',                                                         orderController.daily_vendor_orders)

router.post('/get/driver/rejected/vendor_orders',                                                         orderController.rejected_orders)

router.post('/get/monthly/vendor_orders',                                                         orderController.monthly_vendor_orders)

//Code By Rushikesh For Driver App
router.post('/get/nearest_vendor_orders',                                                        orderController.nearest_vendor_orders)

module.exports = router; 