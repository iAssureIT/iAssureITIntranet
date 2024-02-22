const mongoose = require("mongoose");
const ObjectId = require('mongodb').ObjectId;
const ThankYouNote = require("./model.js");


exports.insertThankYouNote = (req,res,next)=>{
	console.log("Input Req => ",req.body);

	const thankYouNote = new ThankYouNote({
		_id : new mongoose.Types.ObjectId(),
		from : req.body.from,
		to : req.body.to,
		referralAmount : req.body.referralAmount,
		createdAt : new Date(),
		createdBy : "Developer"
	});

	thankYouNote.save()
		.then( newDoc =>{
			if(newDoc){
				res.status(200).json({
					success : true,
					message : "Data inserted successfully. "
				})			
			}
		})
		.catch(error =>{
			console.log("error => ",error);
			res.status(501).json({
				success : false,
				message : "Insert error! - " + error.message
			})					
		})
}


exports.deleteTYN = (req,res,next)=>{
	console.log("deleteTYN Input Req => ",req.body);
	const doc_id = req.body._id
	ThankYouNote.deleteOne({
		_id : doc_id
	})
	.then( data =>{
		console.log("Delete data => ",data);
		if(data.deletedCount>0){
			res.status(200).json({
				success : true,
				message : "Record Deleted Successfully. "
			})			
		}else{
			res.status(200).json({
				success : false,
				message : "Something went wrong during delete."
			})						
		}
	})
	.catch(error =>{
		console.log("error => ",error);
		res.status(501).json({
			success : false,
			message : "Delete error! - " + error.message
		})					
	})
}


exports.getOneTYN = (req,res,next)=>{
	console.log("getOneTYN Input Req.params => ",req.params);

	const tyn_id = req.params.tyn_id;
	ThankYouNote.findOne({ _id : tyn_id })
	.then( data =>{
		console.log("Get One data => ",data);
		if(data){
			res.status(200).json({
				success  : true,
				message  : "Record Found Successfully.",
				data 		: data
			})			
		}else{
			res.status(200).json({
				success : false,
				message : "Data Not Found"
			})						
		}
	})
	.catch(error =>{
		console.log("error => ",error);
		res.status(501).json({
			success : false,
			message : "Get One error! - " + error.message
		})					
	})
}

exports.getListofTYN = (req,res,next)=>{
	// console.log("getListofTYN Input Req.params => ",req.params);

	// const tyn_id = req.params.tyn_id;
	ThankYouNote.find({})
	.then( data =>{
		console.log("Get One data => ",data);
		if(data){
			res.status(200).json({
				success  : true,
				message  : "Record Found Successfully.",
				data 		: data
			})			
		}else{
			res.status(200).json({
				success : false,
				message : "Data Not Found"
			})						
		}
	})
	.catch(error =>{
		console.log("error => ",error);
		res.status(501).json({
			success : false,
			message : "Get List error! - " + error.message
		})					
	})
}

exports.updateTYN = (req,res,next)=>{
	console.log("updateTYN Input Req.body => ",req.body);

	const tyn_id = req.body.tyn_id;
	ThankYouNote.updateOne(
		{_id : tyn_id},
		{$set : {
			from: req.body.from,
			to: req.body.to,
			referralAmount: req.body.referralAmount
		} }
	)
	.then( data =>{
		console.log("updateTYN data => ",data);
		if(data.modifiedCount === 1){
			res.status(200).json({
				success  : true,
				message  : "Record Updated Successfully.",
				data 		: data
			})			
		}else{
			res.status(200).json({
				success : false,
				message : "Data Not Found"
			})						
		}
	})
	.catch(error =>{
		console.log("error => ",error);
		res.status(501).json({
			success : false,
			message : "Update error! - " + error.message
		})					
	})
}