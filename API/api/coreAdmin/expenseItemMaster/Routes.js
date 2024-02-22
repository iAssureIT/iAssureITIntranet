const express 			= require("express");
const router 			= express.Router();
const checkAuth 		= require('../middlerware/check-auth.js');

const ExpenseItemMaster = require('./Controller.js');

router.post('/post', 						checkAuth, ExpenseItemMaster.insertExpenseItemMaster);

router.get('/get/list', 					checkAuth, ExpenseItemMaster.getExpenseItemList);

router.get('/get/reimbursementItems', 	checkAuth, ExpenseItemMaster.getReimbursementItems);

router.post('/get/list', 					checkAuth, ExpenseItemMaster.fetchExpenseItemList); 
 
router.get('/get/one/:fieldID', 			checkAuth, ExpenseItemMaster.fetchSingleExpenseItem);

router.patch('/patch', 						checkAuth, ExpenseItemMaster.updateExpenseItem);

router.delete('/delete/:fieldID', 		checkAuth, ExpenseItemMaster.deleteExpenseItem);

module.exports = router;