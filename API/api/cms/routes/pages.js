const express 	= require("express");
const router 	= express.Router();
const PageController = require('../controllers/pages.js');

router.post('/post', PageController.create_page);
router.get('/get/list', PageController.list_page);
router.get('/get/page_block/:pageURL', PageController.fetch_page_block);
router.get('/get/:pageURL', PageController.fetch_page);
router.patch('/patch/blocks/:action/:pageURL',PageController.update_block_page);
router.patch('/patch/:pageURL',PageController.update_page);
router.delete('/delete/all',PageController.delete_all_page);
router.delete('/delete/:pageURL',PageController.delete_page);

//code by madhuri
router.post('/post/sort_blocks/:pageURL',PageController.sort_blocks_onpage);
module.exports = router;