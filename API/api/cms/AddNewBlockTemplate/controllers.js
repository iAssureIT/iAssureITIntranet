const mongoose    			= require('mongoose');
const AddNewBlockTemplate 	= require('./model.js');
const objectId       		= require('mongodb').objectId;

exports.insertBlockTemplate = (req, res, next)=>{

							
		// async function addNewBlockTemplate(){
								

		// 	}
								
	AddNewBlockTemplate.findOne({"compName":req.body.compName})
				.exec()

				.then(blockTempData=>{

					console.log("=========================<><>>>",blockTempData);

					if (blockTempData) {
						res.status(200).json({
							
								message : "Block Template already exists"
							});


					}else{

							const BlockTemplateMasterData = new AddNewBlockTemplate({
									"_id" 		      		: new mongoose.Types.ObjectId(),
									// "blocktemplateId" 		:  getBlockTemplateIDNum(),
									"compName"        		: req.body.compName,
									"blockType"		  		: req.body.blockType,
									"compImage"       		: req.body.compImage,
									"blockTitle"      		: req.body.blockTitle,
									"blockSubTitle"   		: req.body.blockSubTitle,
									"blockDescription"		: req.body.blockDescription,
									"BlockType"         	: req.body.BlockType,
									"blockLink"         	: req.body.blockLink,
									"bgImage"         		: req.body.bgImage,
									"bgVideo"         		: req.body.bgVideo,
									"fgVideo"         		: req.body.fgVideo,
									"fgImage1"        		: req.body.fgImage1,
									"fgImage2"        		: req.body.fgImage2,
									"repBlockTitle"     	: req.body.repBlockTitle,
									"repBlockSubTitle"  	: req.body.repBlockSubTitle,
									"repBlockDescription"  	: req.body.repBlockDescription,
									"repBlockBackImage"    	: req.body.repBlockBackImage,
									"repBlockImage1"    	: req.body.repBlockImage1,
									"repBlockImage2"    	: req.body.repBlockImage2,
									"repBlockVideo"     	: req.body.repBlockVideo,
									"repBlockLink"      	: req.body.repBlockLink,	
								});
								
								BlockTemplateMasterData.save()
												.then((blockTempData)=>{
													res.status(200).json({
														data   : blockTempData,
														message: "BlockTemplate inserted successfully  !!!"
													});
												})
												.catch((error)=>{
													res.status(500).json({
														error : error,
														message: "Some problem occured while insertion"
													});
												});
							}
						
					
				})
				.catch(error=>{
					res.status(500).json({
						error   : error,
						message : "Issue occured while getting an FormData"
					})
				});	

}
exports.getBlockTemplateList = (req,res,next)=>{
	AddNewBlockTemplate.find({})
				.then(blockTempList=>{
					res.status(200).json({
						blockTempList: blockTempList,
						message: "BlockTemaplate List Generated"
					})
				})
				.catch(error=>{
					res.status(500).json({
						error:error,
						message:"Some error occured while generating Form List"
					})
				});

}

exports.getSearchList = (req,res,next)=>{

	const searchTxt = req.params.searchTxt;
	console.log("line no 69",req.params)
	if(searchTxt !== ""){
		const pattern = new RegExp("^"+searchTxt) ;
		const selector1 = {blockType : {$regex : searchTxt, $options: "i" }}  ;
		
		// const selector2 = {lastName : {$regex: pattern, $options: "i" }  };

		const selector = {$or: [selector1]};

		console.log("selector = ",selector1);

		AddNewBlockTemplate.find(selector1)
					.then(blockTempList => {
						res.status(200).json({
							blockTempList : blockTempList
						})
					})
					.catch(error=>{
						res.status(500).json({
							error : error,
							message : "Some issue occurred during Get List!"
						})
					});

	}
}


exports.getBlockTemplate = (req,res,next)=>{
		    const blockTemp_id = req.params.blockTemp_id;

	AddNewBlockTemplate.findOne({"_id":blockTemp_id})
				.then(blockTempData=>{
					res.status(200).json({
						blockTempData : blockTempData,
						message : "Got form data "
					});
				})
				.catch(error=>{
					res.status(500).json({
						error   : error,
						message : "Issue occured while getting an FormData"
					})
				});
}

exports.getBlockTemplateByName = (req,res,next)=>{
		    const compName = req.params.compName;

	AddNewBlockTemplate.findOne({"compName":compName})
				.then(blockTempData=>{
					res.status(200).json({
						blockTempData : blockTempData,
						message : "Got form data "
					});
				})
				.catch(error=>{
					res.status(500).json({
						error   : error,
						message : "Issue occured while getting an FormData"
					})
				});
}

exports.getBlockTemplateByBlockType = (req,res,next)=>{
		    const blockType = req.params.blockType;

	AddNewBlockTemplate.find({"blockType":blockType})
				.then(blockTempData=>{
					res.status(200).json({
						blockTempData : blockTempData,
						message : "Got form data "
					});
				})
				.catch(error=>{
					res.status(500).json({
						error   : error,
						message : "Issue occured while getting an FormData"
					})
				});
}




exports.updateBlockTemplate = (req,res,next)=>{
   const blockTemp_id = req.body.blockTemp_id;
   
    AddNewBlockTemplate.updateMany(
                        {"_id" : req.body.blockTemp_id},
                        {$set  : {
								"compName"        		: req.body.compName,
								"blockType"		  		: req.body.blockType,
								"compImage"       		: req.body.compImage,
								"blockTitle"        	: req.body.blockTitle,
								"blockSubTitle"     	: req.body.blockSubTitle,
								"blockDescription"     	: req.body.blockDescription,
								"BlockType"         	: req.body.BlockType,
								"blockLink"         	: req.body.blockLink,
								"bgImage"         		: req.body.bgImage,
								"bgVideo"         		: req.body.bgVideo,
								"fgVideo"         		: req.body.fgVideo,
								"fgImage1"        		: req.body.fgImage1,
								"fgImage2"        		: req.body.fgImage2,
								"repBlockTitle"     	: req.body.repBlockTitle,
								"repBlockSubTitle"  	: req.body.repBlockSubTitle,
								"repBlockDescription" 	: req.body.repBlockDescription,
								"repBlockBackImage"    	: req.body.repBlockBackImage,
								"repBlockImage1"    	: req.body.repBlockImage1,
								"repBlockImage2"    	: req.body.repBlockImage2,
								"repBlockVideo"     	: req.body.repBlockVideo,
								"repBlockLink"      	: req.body.repBlockLink,                                 
						}}
                    )
                .then((data)=>{
                    res.status(200).json({
                        data : data,
                        message     : "BlockTemplate Updated Successfully"
                    })
                })
                .catch((error)=>{
                    res.status(500).json({
                        error   : error,
                        message : "Some problem occured updating BlockTemplate...!"
                    })
                })
            }


exports.delBlockTemplate = (req,res,next)=>{
    const blockTemp_id = req.params.blockTemp_id;
    AddNewBlockTemplate.deleteOne({"_id" : blockTemp_id})
                .then((blockTempDel)=>{
                    res.status(200).json({
                        blockTempDel : blockTempDel,
                        message    : "BlockTemplate Deleted...!"
                    })
                })
                .catch((error)=>{
                    res.status(500).json({
                        error   : error,
                        message : "Some problem occured deleting patient..!"
                    })
                })
}

function getBlockTemplateIDNum(){

	return new Promise( (resolve,reject)=>{
	
		var newBlckTempId = 0;
		AddNewBlockTemplate.find()
					.sort({"blocktemplateId" : -1})
					.limit(1)
					.then(maxBlckTempIdData => {
					console.log("maxBlckTempIdData = ",maxBlckTempIdData);
						if(maxBlckTempIdData.length > 0){
							var maxblckTempId = maxBlckTempIdData[0].blocktemplateId;
							newBlckTempId = maxblckTempId + 1;
						}else{
							newBlckTempId = 1;
						}
						console.log("newBlckTempId = ",newBlckTempId);
						resolve(newBlckTempId);
					})
					.catch(error=>{
						console.log("error = ", error);
						reject(-1);
					});	

	});
}

