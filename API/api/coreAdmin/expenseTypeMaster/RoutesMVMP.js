const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../middlerware/check-auth.js');

const ExpenseTypeMasterContoller = require('./ControllerMVMP.js');

router.post('/insertExpenseType', 		checkAuth, ExpenseTypeMasterContoller.insertExpenseType);

router.get('/showAllData', 				checkAuth, ExpenseTypeMasterContoller.showAllData);

router.post('/get/list', 				ExpenseTypeMasterContoller.fetchExpenseTypeList);

router.get('/get/one/:fieldID', 			checkAuth, ExpenseTypeMasterContoller.fetchSingleExpenseType);

router.get('/getSingleData/:id', 		checkAuth, ExpenseTypeMasterContoller.getSingleData);

router.get('/getDataByType/:type', 		checkAuth, ExpenseTypeMasterContoller.getDataByType);

router.patch('/updateExpenseType', 		checkAuth, ExpenseTypeMasterContoller.updateExpenseType);

router.delete('/delete/:fieldID', 		checkAuth, ExpenseTypeMasterContoller.deleteExpenseType);

router.delete('/get/deleteAllTaxes', 	checkAuth, ExpenseTypeMasterContoller.deleteAllTaxes);

module.exports = router;


