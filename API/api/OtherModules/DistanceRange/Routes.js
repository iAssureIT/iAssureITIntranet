const express 		= require("express");
const router 		= express.Router();
const checkAuth 	= require('../../coreAdmin/middlerware/check-auth.js');

const DistanceRangeController = require('./Controller');

router.post('/post',              DistanceRangeController.insert_distance_range);

router.post('/get/list',          DistanceRangeController.get_distance_range);

router.get('/get/one/:fieldID',   DistanceRangeController.get_single_distance_range);

router.patch('/patch', 			  DistanceRangeController.update_distance_range);

router.delete('/delete/:fieldID', DistanceRangeController.delete_distance_range);

module.exports = router; 