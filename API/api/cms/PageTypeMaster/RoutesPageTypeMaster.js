const express 	     = require("express");
const router 	     = express.Router();


const PageTypeMaster = require('./ControllersPageTypeMaster.js');


router.post('/post', PageTypeMaster.insertPageType);

router.post('/get/list', PageTypeMaster.fetchPageType);

router.get('/get/list', PageTypeMaster.getPageType);

router.get('/get/count', PageTypeMaster.countPageType);

router.get('/get/one/:fieldID', PageTypeMaster.fetchSinglePageType);

router.get('/search/:str', PageTypeMaster.searchPageType);

router.patch('/patch', PageTypeMaster.updatePageType);

router.delete('/delete/:fieldID', PageTypeMaster.deletePageType);


module.exports = router;