const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const wishlistsController = require('./Controller');

router.post('/post', 						            wishlistsController.insert_wishlist);

router.get('/get/list', 								wishlistsController.list_wishlist);

router.get('/get/userwishlist/:user_ID', 				wishlistsController.get_user_wishlist);

router.post('/get/userwishlist', 					    wishlistsController.get_user_wishlist);

router.get('/get/wishlistdata/:user_ID', 			    wishlistsController.get_wishlist);

router.get('/get/count', 								checkAuth, wishlistsController.count_wishlist);

router.get('/get/wishlistcount/:user_ID', 				checkAuth, wishlistsController.usercount_wishlist);

router.post('/get/list', 								wishlistsController.list_wishlist_with_limits);

router.get('/get/one/:wishID', 							checkAuth, wishlistsController.fetch_wishlist);

router.get('/get/one/productwish/:userID/:productID',   checkAuth, wishlistsController.fetch_wishlist_product);

router.delete('/delete/:wishlist_ID', 					wishlistsController.delete_wishlist);

// router.patch('/', wishlistsController.update_wishlists);
// router.delete('/',wishlistsController.deleteall_wishlist);

module.exports = router;