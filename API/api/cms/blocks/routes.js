const express 	= require("express");
const router 	= express.Router();
const BlockController = require('./controllers.js');

// router.post('/post', BlockController.create_block);
router.post('/post/pagetype', BlockController.fetch_pagetype);
router.post('/post/blocktype', BlockController.fetch_blocktype);
router.post('/post/pageblocktype', BlockController.fetch_page_block_type);
router.post('/post', BlockController.create_block);          
router.get('/get/list', BlockController.list_block);
router.get('/get/similarblocklist/:blockComponentName', BlockController.similar_list_block);
router.get('/get/block/:blockComponentName', BlockController.fetch_block_blockComponentName);
router.get('/get/:ID', BlockController.fetch_block);
router.patch('/patch/:ID',BlockController.update_block);
router.patch('/patch/repblock/:ID',BlockController.update_rep_block_block);
router.patch('/update/:ID',BlockController.update_block_filter);
router.delete('/delete/all',BlockController.delete_all_block);
router.delete('/delete/:ID',BlockController.delete_block);

router.post('/get/ecommblock', BlockController.getAll_eCommblock); 
router.get('/getFilter/:ID', BlockController.getAll_filters);




module.exports = router;
