const mongoose	= require("mongoose");
const Page = require('./models.js');
var ObjectID = require('mongodb').ObjectID;
exports.create_page = (req,res,next)=>{
    // var pageURL = convertToLowerReplaceSpaceWithUnderScore(req.body.pageURL);
    var pageURL     = (req.body.pageURL).replace(/\W+(?!$)/g, '-').replace(/\W$/, '').toLowerCase();
    var pageTitle   = req.body.pageTitle;
    // res.status(200).json(pageURL);
    console.log("pageURL ",pageURL);
	Page.findOne({pageTitle:pageTitle})
		.exec()
		.then(data =>{
			if(data){
				return res.status(200).json({
					message: 'Page Title already exists'
				});
			}else{
				const page = new Page({
                    _id         : new mongoose.Types.ObjectId(),
                    pageTitle   : req.body.pageTitle,
                    pageURL 	: pageURL,
					pageHead	: 	{
										pageWords 			: req.body.pageWords,
										pageDescription		: req.body.pageDescription,
                                        pageAuthor          : req.body.pageAuthor,
										pageHeadRobots		: req.body.pageHeadRobots,
                                        pageHeadCanonical   : req.body.pageHeadCanonical,
									},
				    pageType    : req.body.pageType,
                    createdBy   : req.body.user_ID,
                    createdAt   : new Date(),

                });
                page.save()
                    .then(data=>{
                        res.status(200).json({
                                            message : "PAGE_ADDED",
                                            pageURL : data.pageURL
                                        });
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
			}
		})
		.catch(err =>{
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};
exports.list_page = (req,res,next)=>{
    Page.find()
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
exports.fetch_page = (req,res,next)=>{
    console.log("inside single fetch");
    Page.findOne({"pageURL":req.params.pageURL})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('PAGE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.update_page = (req,res,next)=>{
    // console.log("req <><><><><><><><><><><><>",req.body);
    Page.updateOne(
                        { "pageURL":req.params.pageURL},  
                        {
                            $set:{
                                "pageURL" 					: req.body.pageURL,
                                "pageTitle"                 : req.body.pageTitle,
								"pageHead.pageWords"		: req.body.pageWords,
								"pageHead.pageDescription"	: req.body.pageDescription,
                                "pageHead.pageAuthor"       : req.body.pageAuthor,

								"pageHead.pageHeadRobots"		: req.body.pageHeadRobots,
                                "pageHead.pageHeadCanonical"       : req.body.pageHeadCanonical,
							    "pageType"    				: req.body.pageType
                            }
                        }
                    )
                    .exec()
                    .then(data=>{
                        console.log('data ',data);
                        if(data){
                            res.status(200).json("PAGE_UPDATED");
                        }else{
                            res.status(401).json("PAGE_NOT_UPDATED");
                        }
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
};

exports.update_block_pages_block = (req, res, next) => {
    // console.log("res -----");
    console.log("res -----",req.body);
   
                Page.updateOne(
                    {
                        "pageURL":req.params.pageURL,
                        "pageBlocks._id":req.body._id

                    },
                    {
                        $set: {
                            
                                "pageBlocks.$.block_id": req.body.block_id,
                        
                        }
                    }
                    )   .exec()
                    .then(data => {
                            res.status(201).json({data})
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Failed to update Block",
                            error: err
                        });
                    });
                    
                    
};


exports.update_block_page = (req,res,next)=>{
    console.log("update_block_page ========================>",req.body);
    var action = req.params.action;
    switch(action){
        case 'add' :
        	Page.updateOne(
                        { "pageURL":req.params.pageURL},  
                        {
                            $push:{
                                pageBlocks : {
                                    block_id		      : req.body.block_id,
                                    blockComponentName    : req.body.blockComponentName,
                                    blockFolderName       : req.body.blockFolderName,
                                    blocktempId           : req.body.blocktempId,
                                    parsed                : req.body.parsed,
			    					blockTitle		      : req.body.blockTitle,
			    					seqNumOfPage	      : req.body.seqNumOfPage,
                                    repeatedBlocks        : req.body.repeatedBlocks,
                                }
                            }
                        }
                    )
                    .exec()
                    .then(data=>{
                        if(data.nModified == 1){
                            res.status(200).json("Block Details added");
                        }else{
                            res.status(404).json("Block Details Not found");
                        }
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });  
            break;
        case 'remove' :
            console.log("remove update_block_page ",req.params.pageURL);
            Page.updateOne(
	                            { "pageURL":req.params.pageURL},  
	                            {
	                                $pull:{
	                                    pageBlocks : {
	                                        _id        : ObjectID(req.body.pageBlocks_id),
	                                    }
	                                }
	                            }
                            )
                            .exec()
                            .then(data=>{
                                if(data.nModified == 1){
                                    res.status(200).json("Block removed");
                                }else{
                                    res.status(200).json("Block Not found");
                                }
                            })
                            .catch(err =>{
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
            break;
        case 'edit' :
            Page.updateOne(
                                        { "pageURL":req.params.pageURL, "pageBlocks._id":req.body.pageBlocks_id},  
                                        {
                                            $set:{
                                                "pageBlocks.$.block_id"          : req.body.block_id,
                                                "pageBlocks.$.blockTitle"        : req.body.blockTitle,
                                                "pageBlocks.$.seqNumOfPage"      : req.body.seqNumOfPage,
                                                "pageBlocks.$.repeatedBlocks"    : req.body.repeatedBlocks
                                            }
                                        }
                                    )
                                    .exec()
                                    .then(data=>{
                                        if(data.nModified == 1){
                                            res.status(200).json("Block Details updated");
                                        }else{
                                            res.status(404).json("Block Details Not found");
                                        }
                                    })
                                    .catch(err =>{
                                        console.log(err);
                                        res.status(500).json({
                                            error: err
                                        });
                                    });
        	break;
        default :
            res.status(404).json('Action Not found');
            break;
    }
};
exports.delete_page = (req,res,next)=>{
    Page.deleteOne({"pageURL":req.params.pageURL})
        .exec()
        .then(data=>{
            console.log('data ',data);
            if(data.deletedCount === 1){
                res.status(200).json("PAGE_DELETED");
            }else{
                res.status(200).json("PAGE_NOT_DELETED");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.delete_all_page = (req,res,next)=>{
    Page.deleteMany({})
        .exec()
        .then(data=>{
            res.status(200).json("All Pages deleted");
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.fetch_page_block = (req,res,next)=>{
  Page.findOne({"pageURL":req.params.pageURL})
  // Page.find({})
        .populate('pageBlocks.block_id')
        .exec()
        .then(data=>{
            // console.log('fetch_page_block : ',data.blocks.blockSubTitle);
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('PAGE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });  
};


