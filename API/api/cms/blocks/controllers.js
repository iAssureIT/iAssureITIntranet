const mongoose	= require("mongoose");
const Block = require('./models.js');

exports.create_block = (req,res,next)=>{
    // console.log("Request.body ======",req.body);
	const block = new Block({
            _id                 : new mongoose.Types.ObjectId(),
            displayOnPage	    :  req.body.displayOnPage,
            blockTitle          : req.body.blockTitle,
            blockSubTitle       : req.body.blockSubTitle,
            blockDescription    : req.body.blockDescription,
            blockComponentName  : req.body.blockComponentName,
            blockFolderName     : req.body.blockFolderName,
            blockType           : req.body.blockType,
            pageType            : req.body.pageType,
            bgImage             : req.body.bgImage,
            bgVideo             : req.body.bgVideo,
            fgImage1            : req.body.fgImage1,
            fgImage2            : req.body.fgImage2,
            fgVideo             : req.body.fgVideo,
            repeatedBlocks      : req.body.repeatedBlocks,
            animationSettings   : req.body.animationSettings,
            blockGroup          : req.body.blockGroup,
            blockAppearOnPage   : req.body.blockAppearOnPage,
            blockSettings       : req.body.blockSettings,
            productSettings     : req.body.productSettings,
            filterSettings      : [],
            groupSettings       : req.body.groupSettings,
            dealSettings        : req.body.dealSettings,
            createdAt           : new Date(),

        });
        block.save()
            .then(data=>{
                res.status(200).json({
                                    message : "BLOCK_ADDED",
                                    ID      : data._id
                                });
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
};

exports.list_block = (req,res,next)=>{
    Block.find()
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.similar_list_block = (req,res,next)=>{
            // console.log("=-=-=-=-=-=-=-=-=-=-",req.params.blockComponentName);

    Block.find({blockComponentName:req.params.blockComponentName})
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(404).json('Components Not Found');
            console.log(err);
            
        });
}

exports.getAll_eCommblock = (req,res,next)=>{
    Block.find({blockType:req.body.blockType})
        .exec()
        .then(data=>{
            if(data){
                console.log("dataa============",data);
                res.status(200).json(data);
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.getAll_filters=(req,res,next)=>{
    console.log("req.params.ID===",req.params.ID);
    Block.find({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data){
                console.log("dataa============",data);
                res.status(200).json(data);
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
exports.fetch_block = (req,res,next)=>{
    Block.findOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('ROLE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.fetch_block_blockComponentName = (req,res,next)=>{
    Block.findOne({blockComponentName:req.params.blockComponentName})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('DATA_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.update_block_filter = (req,res,next)=>{
    // console.log("ID============",req.params.ID);
    // console.log("formValue============",req.body);
    Block.updateOne(
		{ '_id': req.params.ID },
		{
			$push: {
				"filterSettings": [{
					"filterLabel": req.body.filterLabel,
					"dbFeildName": req.body.dbFeildName,					
				}]
			}
		})
		.exec()
		.then(data => {
			if (data.nModified == 1) {
				res.status(200).json({
					"message": "Feild added successfully."
				});
			} else {				
				res.status(401).json({
					"message": "Somthing is wrong"
				});
			}
		})
		.catch(error => {
			console.log("error:",error);
			res.status(500).json({
				error: error
			});
		})

};

exports.update_block = (req,res,next)=>{
    Block.updateOne(
                    { _id:req.params.ID},  
                    {
                        $set:{
                            "blockTitle"          : req.body.blockTitle,
                            "blockSubTitle"       : req.body.blockSubTitle,
                            "blockDescription"    : req.body.blockDescription,
                            "blockComponentName"  : req.body.blockComponentName,
                            "blockFolderName"     : req.body.blockFolderName,
                            "blockType"           : req.body.blockType,
                            "pageType"            : req.body.pageType,
                            "bgImage"             : req.body.bgImage,
                            "bgVideo"             : req.body.bgVideo,
                            "fgImage1"            : req.body.fgImage1,

                            "fgImage2"            : req.body.fgImage2,
                            "fgVideo"             : req.body.fgVideo,
                            "repeatedBlocks"      : req.body.repeatedBlocks,
                            "blockGroup"          : req.body.blockGroup,
                            "blockAppearOnPage"   : req.body.blockAppearOnPage,

                            "dealSettings"        : req.body.dealSettings,
                            "groupSettings"       : req.body.groupSettings,

                            "animationSettings"   : req.body.animationSettings,
                            "blockSettings"       : req.body.blockSettings,
                            "productSettings"     : req.body.productSettings,
                            
                        }
                    }
                )
                .exec()
                .then(data=>{
                    console.log('data ',data);
                    if(data){
                        res.status(200).json("BLOCK_UPDATED");
                    }else{
                        res.status(401).json("BLOCK_NOT_UPDATED");
                    }
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
};
exports.delete_block = (req,res,next)=>{
    Block.deleteOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data.deletedCount === 1){
                res.status(200).json("BLOCK_DELETED");
            }else{
                res.status(200).json("BLOCK_NOT_DELETED");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.delete_all_block = (req,res,next)=>{
    Block.deleteMany({})
        .exec()
        .then(data=>{
            res.status(200).json("All Blocks deleted");
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.fetch_pagetype = (req,res,next)=>{

    console.log("re============>",req.body.pagetype);
    var pagetype = req.body.pagetype;
    var blocktype = req.body.blocktype ;

    Block.find({"pageType":pagetype})
        .exec()
        .then(data=>{
            console.log("data===....",data);
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('Block_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });



};

exports.fetch_blocktype = (req,res,next)=>{

    console.log("re============>",req.body.pagetype);
    var blocktype = req.body.blocktype ;

    Block.find({"blockType":blocktype})
        .exec()
        .then(data=>{
            console.log("data===....",data);
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('Block_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });



};

exports.fetch_page_block_type = (req,res,next)=>{

    console.log("re============>",req.body.pagetype);
    var pagetype = req.body.pagetype;
    var blocktype = req.body.blocktype ;

    Block.find({"pageType":pagetype,"blockType":blocktype})
        .exec()
        .then(data=>{
            console.log("data===....",data);
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('Block_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.update_rep_block_block = (req, res, next) => {
    console.log("res -----=============================================");
    console.log("req.params.tempRepBlock_id -----",req.params);
    console.log("res -----",req.body);
   
                Block.updateOne(
                    {
                        "_id":req.params.ID,
                        "repeatedBlocks._id":req.body._id

                    },
                    {
                        $set: {
                            
                                "repeatedBlocks.$.Title"            : req.body.Title,
                                "repeatedBlocks.$.SubTitle"         : req.body.SubTitle,
                                "repeatedBlocks.$.Description"      : req.body.Description,
                                "repeatedBlocks.$.Image"            : req.body.Image,
                                "repeatedBlocks.$.Link"             : req.body.Link,
                                "repeatedBlocks.$.repBlockBackImage": req.body.repBlockBackImage,
                                "repeatedBlocks.$.FGImage1"         : req.body.FGImage1,
                                "repeatedBlocks.$.FGImage2"         : req.body.FGImage2,
                                "repeatedBlocks.$.FgVideo"          : req.body.FgVideo,
                                "repeatedBlocks.$.BgImage"          : req.body.BgImage,
                                "repeatedBlocks.$.BgVideo"          : req.body.BgVideo,
                                
                        
                        }
                    }
                    )   .exec()
                    .then(data => {
                            res.status(201).json({data})
                            console.log("Updated");
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Failed to update Block",
                            error: err
                        });
                    });
                    
                    
};
