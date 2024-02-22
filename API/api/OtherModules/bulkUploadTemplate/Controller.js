const mongoose  = require("mongoose");
const BulkUploadTemplate = require('./Model');

exports.addBulkUploadTemplate = (req,res,next)=>{
	// console.log('templateUrl',req.body.templateUrl)
    BulkUploadTemplate.findOne({"category_ID" : req.body.category_ID})
        .exec()
        .then(data =>{
        	if (data) {
        		BulkUploadTemplate.updateOne({	"category_ID" : req.body.category_ID	},
        			{   $set:   { 	'section_ID'	: req.body.section_ID,
        							'section'		: req.body.section,
        							'category_ID'   : req.body.category_ID,
        							'category'   	: req.body.category, 
        							'templateUrl'   : req.body.templateUrl
        						}
        		})
        		.exec()
        		.then(updata=>{
        			// console.log(updata)
        			if (updata.nModified) {
	        			res.status(200).json({
		                    "message": "Template is updated successfully."
		                });
        			}
        		})
        		.catch(err =>{
        			
	                res.status(500).json({
	                    error: err
	                });
	            });

        	}else{
        		const template = new BulkUploadTemplate({
	                _id                       : new mongoose.Types.ObjectId(), 
	                section_ID                : req.body.section_ID, 
	                section					  : req.body.section,
        			category_ID 			  : req.body.category_ID,
	                category 	              : req.body.category, 
	                templateUrl               : req.body.templateUrl,
	                createdAt                 : new Date()
            	})
            	template.save()
            	.then(tempdata=>{
	                res.status(200).json({
	                    "message": "Template is saved successfully."
	                });
	            })
	            .catch(err =>{
	                res.status(500).json({
	                    error: err
	                });
	            });
        	}
       	})
};

exports.updateBulkUploadTemplate = (req,res,next)=>{
    BulkUploadTemplate.updateOne({	"category_ID" : req.body.category_ID	},
        			{   $set:   { 	'section_ID'	: req.body.section_ID,
        							'category_ID'   : req.body.category_ID, 
        							'templateUrl'   : req.body.templateUrl
        						}
        		})
        		.exec()
        		.then(data=>{
        			res.status(200).json({
	                    "message": "Template is saved successfully."
	                });
        		})
        		.catch(err =>{
	                res.status(500).json({
	                    error: err
	                });
	            });
};

exports.getTemplates = (req,res,next)=>{
    BulkUploadTemplate.find({})
        .exec()
        .then(data =>{
        	res.status(200).json(data);
       	})
       	.catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};
exports.getTemplatesCount = (req,res,next)=>{
    BulkUploadTemplate.find({})
        .exec()
        .then(data =>{
        	res.status(200).json({"dataCount":data.length});
       	})
       	.catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.getTemplateByID = (req,res,next)=>{
    BulkUploadTemplate.findOne({_id:req.params.template_ID})
        .exec()
        .then(data =>{
        	 res.status(200).json(data);
       	})
       	.catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};
exports.getTemplateByCategory = (req,res,next)=>{
    BulkUploadTemplate.findOne({"category_ID" : req.params.category_ID})
        .exec()
        .then(data =>{
        	 res.status(200).json(data);
       	})
       	.catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.deleteTemplate = (req,res,next)=>{
	BulkUploadTemplate.deleteOne({_id:req.params.template_ID})
        .exec()
        .then(data=>{
            res.status(200).json({
                "message": "Template is deleted successfully."
            });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};