const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.post('/post/submit-basic-profile',Controller.submit_entprofile);

router.patch('/patch/update-basic-profile',Controller.update_entprofile);

router.post('/post/submit-ent-categories',Controller.submit_entcategories);

router.post('/post/submit-ent-documents',Controller.submit_entdocuments);

router.patch('/patch/update-invited-consultants',Controller.updateInvitations);

router.get('/get/one/:enterprise_id',Controller.getEntBasicProfile);

router.get('/get/one/using-user-id/:user_id',Controller.getEntBasicProfileUsingUserId);

router.get('/get/all-consultants/:enterprise_id',Controller.getEnterpriseConsultants);


module.exports = router;
