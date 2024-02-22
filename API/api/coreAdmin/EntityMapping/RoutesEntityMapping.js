const express 	= require("express");
const router 	= express.Router();

const contract = require('./ControllerEntityMapping.js');

router.post('/post', contract.insertEntityMapping);

router.post('/get/list', contract.fetchEntityMappings);

router.get('/get/list', contract.getEntityMappings);

router.get('/get/count', contract.countEntityMappings);

router.get('/get/joinentities/:mappingID', contract.joinentities);

router.get('/get/joinentitieslist', contract.joinentitieslist);

router.get('/get/one/:mappingID', contract.fetchSingleEntityMapping);

router.patch('/patch', contract.updateEntityMapping);

router.post('/filterEntityMapping', contract.filterEntityMapping);

router.get('/search/:str', contract.searchEntityMapping);

router.delete('/delete/:mappingID', contract.deleteEntityMapping);

module.exports = router;