const express 	= require("express");
const router 	= express.Router();
const BlockController = require('../controllers/blocks.js');

router.post('/post', BlockController.create_block);
router.get('/get/list', BlockController.list_block);
router.get('/get/block/:blockComponentName', BlockController.fetch_block_blockComponentName);
router.get('/get/:ID', BlockController.fetch_block);
router.patch('/patch/:ID',BlockController.update_block);
router.delete('/delete/all',BlockController.delete_all_block);
router.delete('/delete/:ID',BlockController.delete_block);

module.exports = router;

