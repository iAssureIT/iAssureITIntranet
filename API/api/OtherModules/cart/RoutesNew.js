const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const cartController = require('./ControllerNew');

router.post('/post', 							cartController.add_to_cart);

router.get('/get/cartproductlist/:user_ID', 	cartController.list_cart_product);

router.get('/get/count/:user_ID', 				cartController.count_cart);

router.patch('/quantity', 						cartController.change_cart_item_quantity);

router.patch('/remove', 						cartController.remove_cart_items);

router.patch('/address', 						cartController.add_address_to_cart);

router.patch('/put/coupon', 				    cartController.apply_coupon);

router.patch('/redeem/creditpoints', 		    cartController.apply_credit_points);

router.delete('/delete/:user_ID', 		cartController.delete_cart);

/*=============================================================================*/

router.get('/get/list/:user_ID', 				cartController.list_cart);

router.get('/get/list', 						cartController.all_list_cart);

router.get('/get/one/:user_ID', 				cartController.user_cart);

router.patch('/payment', 						cartController.add_paymentmethod_to_cart);

router.patch('/updateCart', 					cartController.update_cart_item);
router.patch('/removeproductfromcart', 		    cartController.remove_product_from_cart);

// router.post('/paymentgatewaypinepg/post', cartController.paymentgatewaypinepg);
//route for remove product from cart if that product get unpublish
//code by madhuri ghute



module.exports = router;