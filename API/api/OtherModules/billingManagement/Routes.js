const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const billController = require('./Controller');

//get product list by category
router.get('/get/listbycategory/:categoryID/:franchiseId', 	checkAuth, billController.list_products_by_category);

//get product list by section
router.get('/get/list/:sectionID/:franchiseId', 				checkAuth, billController.list_product_by_section);

//generate bill number
router.get('/get/generateBillNumber/:companyId', 				checkAuth, billController.generate_bill_number);

//product list by franchise
router.get('/get/list/:franchiseId', 								checkAuth, billController.list_product);

//get franchise details
router.get('/getCompany/:companyID', 								checkAuth, billController.getCompany);

//list bills
router.get('/get/billnumberlist/:franchise_id', 				checkAuth, billController.getListBill);

//return products in order
router.get('/get/OrderwiseReturnedProducts/:orderID', 		checkAuth, billController.returned_products);

//return products
router.patch('/returnProducts', 										checkAuth, billController.save_returned_products);

//add customer
router.post('/saveCustomer', 											checkAuth, billController.save_customer);

//get customers list
router.get('/get/customers/:franchise_id', 						checkAuth, billController.get_customers);

router.get('/get/customersCount/:franchise_id', 				checkAuth, billController.customers_count);

router.get('/get/count/contactPersons/:franchise_id', 		checkAuth, billController.contact_persons_count);


module.exports = router;