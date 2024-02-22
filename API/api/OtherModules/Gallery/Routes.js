const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const galleryController = require('../Gallery/Controller');

router.post('/post', 				checkAuth, galleryController.insert_image);

router.get('/get', 					checkAuth, galleryController.fetch_gallery);

router.patch('/remove/:imageId', checkAuth, galleryController.delete_image);


module.exports = router;