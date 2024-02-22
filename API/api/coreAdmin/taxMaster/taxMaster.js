const express 	= require("express");
const router 	= express.Router();

const taxMaster = require('./taxMaster');

router.post('/post', taxMaster.insertTax);

router.get('/get/list', taxMaster.listTax);

router.get('/get/one/:taxID', taxMaster.singleTax);

router.patch('/patch', taxMaster.updateTax);

router.delete('/delete/:taxID',taxMaster.deleteTax);

module.exports = router;