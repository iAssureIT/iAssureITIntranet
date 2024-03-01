const express 	= require("express");
const router 	= express.Router();
const policyController = require('./controller.js');

router.post('/insert-policy',policyController.insertPolicy);
router.get('/policy_list',policyController.getPolicyList);
router.get('/get/one/:policy_id',policyController.getOnePolicy);
router.patch('/update-policy',policyController.updatePolicy);
router.delete('/delete-policy/:policy_id',policyController.deletePolicy);


module.exports = router;
