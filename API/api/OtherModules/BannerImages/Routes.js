const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const BannerImagesController = require('../BannerImages/Controller.js');

router.post('/post', 				checkAuth, BannerImagesController.insert_image);

router.get('/get', 					BannerImagesController.fetch_bannerimgs);

router.patch('/remove/:imageId', checkAuth, BannerImagesController.delete_image);


module.exports = router;