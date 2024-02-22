const express 	= require("express");
const router 	= express.Router();
// const checkAuth     = require('../../../coreAdmin/middlerware/check-auth.js');
const BlogController = require('./controllers.js');

router.post('/post', BlogController.create_blogs);
router.get('/get/:blogURL', BlogController.fetch_blog_url);
router.get('/get/:ID', BlogController.fetch_blog);
router.get('/get/all/:pageno', BlogController.fetch_blog_all);
router.get('/get/all/type/:type/:pageno', BlogController.fetch_blog_all_type);
router.get('/get/all/list/type/:type/:pageno', BlogController.fetch_blog_all_type_list);
router.get('/get/all/list/:pageno', BlogController.fetch_blog_all_list);
router.get('/get/count/url/:blogURL', BlogController.get_count_blog_url);
router.get('/get/count/:ID', BlogController.get_count_blog);
router.patch('/patch/:ID', BlogController.patch_blog);
router.delete('/delete/url/:blogURL', BlogController.delete_blog_url);
router.delete('/delete/:ID', BlogController.delete_blog);

module.exports = router;