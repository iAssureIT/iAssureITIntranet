const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post',Controller.insertOrder);

router.get('/get/single/:order_id',Controller.getOneOrder);

router.get('/get/list',Controller.getAllOrders);

router.patch('/patch',Controller.patchOrder);

router.put('/put/:order_id',Controller.updateOrderStatus)

router.put('/put/renew-subscription/:order_id',Controller.renewSubscriptionOrder)

router.put('/put/bookslot/:order_id',Controller.updateOrderStatusBookslot)


module.exports = router;