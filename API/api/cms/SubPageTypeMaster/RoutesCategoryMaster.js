const express 	     = require("express");
const router 	     = express.Router();


const SubPageTypeMaster = require('./ControllersSubPageTypeMaster.js');


router.post('/post', SubPageTypeMaster.insertSubPageType);

router.post('/get/list', SubPageTypeMaster.fetchSubPageType);

router.get('/get/list', SubPageTypeMaster.getSubPageType);

router.get('/get/count', SubPageTypeMaster.countSubPageType);

router.get('/get/one/:fieldID', SubPageTypeMaster.fetchSingleSubPageType);

router.get('/search/:str', SubPageTypeMaster.searchSubPageType);

router.patch('/patch', SubPageTypeMaster.updateSubPageType);

router.delete('/delete/:fieldID', SubPageTypeMaster.deleteSubPageType);


module.exports = router;