const express = require('express');
const router  = express.Router();

const blocktemplateMasterController = require("./controllers.js");

router.post("/api/blocktemplate/post", 		                    blocktemplateMasterController.insertBlockTemplate);
router.get("/api/blocktemplate/get/list", 	 	 	            blocktemplateMasterController.getBlockTemplateList);
router.get("/api/blocktemplate/get/searchlist/:searchTxt",	    blocktemplateMasterController.getSearchList);
router.get("/api/blocktemplate/get/:blockTemp_id",          	blocktemplateMasterController.getBlockTemplate);
router.get("/api/blocktemplate/getcompname/:compName",          	    blocktemplateMasterController.getBlockTemplateByName);
router.put("/api/blocktemplate/update/",                        blocktemplateMasterController.updateBlockTemplate); 	 		            
router.delete("/api/blocktemplate/del/:blockTemp_id",  	 		blocktemplateMasterController.delBlockTemplate);
router.get("/api/blocktemplatebyblocktype/get/:blockType",          	    blocktemplateMasterController.getBlockTemplateByBlockType);



module.exports = router;