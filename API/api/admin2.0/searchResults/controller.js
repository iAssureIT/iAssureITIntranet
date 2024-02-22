const mongoose = require("mongoose");
const Categories = require("../masterBusinessCategory/Model.js");
const SubCategories = require("../masterBusinessSubCategory/Model.js");
const CompanyInfo = require("../companyInfo/model.js");


exports.getSearchResults = (req,res,next)=>{

	console.log("getSearchResults req.body => ",req.body);

	//Step 1. Find value of catg using _id 
	//Step 2. Find value of subCatg using _id 
	//Step 3. Using these catg & subCatg values, 
	// 		  find data from companyInfo collection


	Categories.findOne({"_id" : req.body.category})
	.then(catg => {
		console.log("catg => ",catg);
		var ctg = catg.businessCategory;
		var selector = req.body.subcategory === "*" ? {} : {_id : req.body.subcategory} ;

		SubCategories.findOne(selector)
		.then(subCatg => {
			console.log("subCatg => ",subCatg);
			var sctg = subCatg.businessSubCategory;

			CompanyInfo.find({
				"basicInfo.category" 	: ctg, 
				"basicInfo.subCategory" : sctg
			})
			.then(searchData =>{
				console.log("searchData => ",searchData);
				res.status(200).json({
					success : true,
					message : "Following Search Results Found!",
					data 	: searchData
				})			
			})
			.catch(error3 => {
				console.log("error3 => ",error3);
				res.status(500).json({
					success : false,
					message : "Error occured during finding Category "+error3.message
				})			
			})
		})
		.catch(error2 => {
			console.log("error2 => ",error2);
			res.status(500).json({
				success : false,
				message : "Error occured during finding Category "+error2.message
			})			
		})

	})
	.catch(error1 => {
		console.log("error1 => ",error1);
		res.status(500).json({
			success : false,
			message : "Error occured during finding Category "+error1.message
		})			
	})



}