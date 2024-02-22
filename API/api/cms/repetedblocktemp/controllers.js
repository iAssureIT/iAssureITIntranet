const mongoose	= require("mongoose");
const RepBlock  = require('./models.js');
var ObjectId    = require('mongodb').ObjectID;

exports.repcreate_block = (req,res,next)=>{
    console.log("Request.body ======",req.body);
    var repblock_id = req.body.block_id;
    console.log("repblock_id.body ======",repblock_id);

    if (repblock_id) {
        RepBlock.find({_id:repblock_id})
            .exec()
            .then(data =>{
                console.log("data-----------------=--=>>",data);
              
                    RepBlock.updateOne(
                        { "_id":repblock_id},  
                        {
                            $push:{
                                    repeatedBlocks        : req.body.repeatedBlocks
                                
                            }
                        }
                    )
                    .exec()
                    .then(data=>{
                        res.status(200).json({
                                            
                            ID      : repblock_id
                        });
                        // console.log("data => ",data)
                        // if(data.nModified === 1){
                        //     res.status(200).json("Block updated");
                        // }else{
                        //     res.status(404).json("Block  Not updated");
                        // }
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });               
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
	}else{
        const repblock = new RepBlock({
                        _id                 : new mongoose.Types.ObjectId(),
                        repeatedBlocks        : req.body.repeatedBlocks
                     
                    });
                    repblock.save()
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

    }
       
};
exports.list_Rep_Block = (req,res,next)=>{
    RepBlock.find()
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

exports.fetch_Rep_Block = (req,res,next)=>{
    console.log("inside single fetch");
    RepBlock.findOne({"_id": ObjectId(req.params.tempRepBlock_id)})
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

exports.update_rep_block_block = (req, res, next) => {
    
    console.log("req.params.tempRepBlock_id -----",req.params.tempRepBlock_id);
    console.log("res -----",req.body);
   
                RepBlock.updateOne(
                    {
                        "_id":req.params.tempRepBlock_id,
                        "repeatedBlocks._id":req.body._id

                    },
                    {
                        $set: {
                            
                                "repeatedBlocks.$.Title": req.body.Title,
                                "repeatedBlocks.$.SubTitle": req.body.SubTitle,
                                "repeatedBlocks.$.Description": req.body.Description,
                                "repeatedBlocks.$.Image": req.body.Image,
                                "repeatedBlocks.$.Link": req.body.Link,
                                "repeatedBlocks.$.BgImage": req.body.BgImage,
                                "repeatedBlocks.$.FgImage1": req.body.FgImage1,
                                "repeatedBlocks.$.FgImage2": req.body.FgImage2,
                                "repeatedBlocks.$.BgVideo": req.body.BgVideo,
                                "repeatedBlocks.$.FgVideo": req.body.FgVideo,
                                
                        
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

exports.delete_rep_block_block = (req, res, next) => {
    console.log("res -----=============================================");
    console.log("req.params.tempRepBlock_id -----",req.params.tempRepBlock_id);
    console.log("res -----",req.body);
   
                RepBlock.updateOne(
                    {
                        "_id":req.params.tempRepBlock_id,
                        

                    },
                    {
                         $pull:{
                                        repeatedBlocks : {
                                            "_id"        : req.body._id,
                                        }
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
