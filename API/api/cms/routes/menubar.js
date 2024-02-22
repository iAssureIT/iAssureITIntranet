const express 	= require("express");
const router 	= express.Router();
const MenuController = require('../controllers/menubar.js');

router.post('/post', MenuController.create_menubar);
router.get('/getone/:ID', MenuController.fetch_menu);
router.get('/getall', MenuController.fetch_all_menu);
router.patch('/update/:ID', MenuController.update_menu);
router.delete('/deletemenubar/:ID', MenuController.delete_menubar);
router.patch('/deletemenu', MenuController.delete_menu);

router.post('/getsingle', MenuController.get_menu_By_menuName);
// router.get('/getallfiltermenu', MenuController.fetch_all_filtermenu);



module.exports = router;