const express 	= require("express");
const router 	= express.Router();
const Controller = require('./controller.js');

router.get('/get/consultant-list',Controller.getConsultantList);
router.get('/get/enterprise-list',Controller.getEnterpriseList);
router.post('/post/consultant-approval',Controller.setConsultantApproval);
router.post('/post/enterprise-approval',Controller.setEnterpriseApproval);

router.get('/get/expertise-catg/consultant-list',Controller.getConsultantExpertiseCategoryList);
router.get('/get/expertise-catg/enterprise-list',Controller.getEnterpriseExpertiseCategoryList);
router.get('/get/sub-catg/consultant-list',Controller.getConsultantSubCategoryList);
router.get('/get/sub-catg/enterprise-list',Controller.getEnterpriseSubCategoryList);
router.post('/post/sub-catg/enterprise',Controller.setEnterpriseSubCategory);
router.post('/post/sub-catg/consultant',Controller.setConsultantSubCategory);
router.post('/post/expertise-catg/enterprise',Controller.setEnterpriseExpertiseCategory);
router.post('/post/expertise-catg/consultant',Controller.setConsultantExpertiseCategory );

router.patch('/consultant/update-others-subcatg',Controller.updateConsOthersSubcatg );
router.patch('/consultant/update-others-expertise',Controller.updateConsOthersExpertise );
router.patch('/consultant/approve-others-expertise',Controller.approveConsOthersExpertise );
router.patch('/consultant/approve-others-sub-catg',Controller.approveConsOthersSubCategory );

router.patch('/enterprise/update-others-subcatg',Controller.updateEntpOthersSubcatg );
router.patch('/enterprise/update-others-expertise',Controller.updateEntpOthersExpertise );
router.patch('/enterprise/approve-others-expertise',Controller.approveEntpOthersExpertise );
router.patch('/enterprise/approve-others-sub-catg',Controller.approveEntpOthersSubCategory );

module.exports = router;

