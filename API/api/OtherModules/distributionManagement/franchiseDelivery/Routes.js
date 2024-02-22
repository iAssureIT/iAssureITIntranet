const express 	= require("express");
const router 	= express.Router();

const franchiseDeliveryController = require('./Controller');

router.post('/post', franchiseDeliveryController.insert_franchise_delivery);

router.get('/get/franchiseDeliveryChallan/:id', franchiseDeliveryController.get_delivery_challan);

router.put('/attribute', franchiseDeliveryController.update_delivery_attribute);

router.get('/get/deliveryChallansForPo/:id', franchiseDeliveryController.get_delivery_challans_for_po);

router.get('/get/FinishGoodsCurrentStock/:itemcode', franchiseDeliveryController.finish_goods_current_stock);


module.exports = router; 