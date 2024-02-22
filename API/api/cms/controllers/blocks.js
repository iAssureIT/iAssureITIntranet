const mongoose	= require("mongoose");
const Block = require('../models/blocks.js');
exports.create_block = (req,res,next)=>{
	const block = new Block({
            _id                 : new mongoose.Types.ObjectId(),
            blockTitle          : req.body.blockTitle,
            blockSubTitle       : req.body.blockSubTitle,
            blockDescription    : req.body.blockDescription,
            blockComponentName  : req.body.blockComponentName,
            blockType           : req.body.blockType,
            bgImage             : req.body.bgImage,
            bgVideo             : req.body.bgVideo,
            fgImage             : req.body.fgImage,
            fgVideo             : req.body.fgVideo,
            repeatedBlocks      : req.body.repeatedBlocks,
            blockGroup          : req.body.blockGroup,
            blockAppearOnPage   : req.body.blockAppearOnPage,
            createdBy           : req.body.user_ID,
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
exports.update_block = (req,res,next)=>{
    Block.updateOne(
                    { _id:req.params.ID},  
                    {
                        $set:{
                            "blockTitle"          : req.body.blockTitle,
                            "blockSubTitle"       : req.body.blockSubTitle,
                            "blockDescription"    : req.body.blockDescription,
                            "blockComponentName"  : req.body.blockComponentName,
                            "blockType"           : req.body.blockType,
                            "bgImage"             : req.body.bgImage,
                            "bgVideo"             : req.body.bgVideo,
                            "fgImage"             : req.body.fgImage,
                            "fgVideo"             : req.body.fgVideo,
                            "repeatedBlocks"      : req.body.repeatedBlocks,
                            "blockGroup"          : req.body.blockGroup,
                            "blockAppearOnPage"   : req.body.blockAppearOnPage,
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
