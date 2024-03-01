const mongoose					= require("mongoose");
var   ObjectId 				= require('mongodb').ObjectID;
var moment             		= require('moment');
const Policy 				= require('./model.js');
const Axios                = require('axios');
const User 						= require('../userManagementnew/ModelUsers.js');
const globalVariable 		= require("../../../nodemonConfig.js");
const MasterNotifications 	= require('../notificationManagement/ModelMasterNotification.js');
const {sendNotification} 	= require("../common/globalFunctions");

 
exports.insertPolicy = (req,res,next)=>{
	console.log("insertFeedback req.body => ", req.body);
		var policy = new Policy({
                _id  	: new mongoose.Types.ObjectId(),
                policy_name : req.body.policy_name,
                policy_category    : req.body.policy_category,
                policy_summary   : req.body.policy_summary,
                createdBy : req.body.createdBy,
                createdAt : new Date(),
        });		
		policy.save()
        .then(insertedPolicy =>{
            console.log("insertedPolicy",insertedPolicy);
            res.status(200).json({
                message 	: "Policy inserted successfully",
                success 	: true,
            })
        })
        .catch(err=>{
            console.log("err",err);
        })
};

exports.updatePolicy = (req,res,next)=>{
	console.log("insertFeedback req.body => ", req.body);
    Policy.updateOne({ _id: req.body.policy_id },
		{ $set: req.body }, // Use $set to update only the specified fields in updateData
		{ new: true } // This option returns the updated document
	  )
    .then(updatePolicy =>{
        console.log("insertedPolicy",updatePolicy);
        res.status(200).json({
            message 	: "Policy updated successfully",
            success 	: true,
        })
    })
    .catch(err=>{
        console.log("err",err);
    })
};

exports.deletePolicy = (req,res,next)=>{
	console.log("insertFeedback req.body => ", req.params);
    Policy.deleteOne({ _id: ObjectId(req.params.policy_id) })
    .then(deletePolicy =>{
        console.log("insertedPolicy",deletePolicy);
        res.status(200).json({
            message 	: "Policy deleted successfully",
            success 	: true,
        })
    })
    .catch(err=>{
        console.log("err",err);
    })
};

exports.getPolicyList = (req,res,next)=>{
    Policy.find({})
        .then(policy_list =>{
            res.status(200).json(policy_list)
        })
        .catch(err=>{
            console.log("err",err);
        })
};

exports.getOnePolicy = (req,res,next)=>{
    Policy.findOne({_id:ObjectId(req.params.policy_id)})
        .then(policy =>{
            res.status(200).json(policy)
        })
        .catch(err=>{
            console.log("err",err);
        })
};

