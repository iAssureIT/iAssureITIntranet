const mongoose	= require("mongoose");
var request         = require('request-promise');  
const gloabalVariable 	= require('../../../nodemon');

exports.query_mail = (req,res,next)=>{
	// console.log(req.body);
	request({
	     "method"    : "POST",
	     "url"       : "http://localhost:"+gloabalVariable.PORT+"/send-email",
	     "body"      :  {
	                         "email"     : "priyanka.kale@iassureit.com",
	                         "subject"   : "Customer Query",
	                         "text"      : "Customer Query",
	                         // "mail"      : 'Hello admin, query details are given below: ' +'\n'+ '\n Customer Name: '+req.body.customerName +'\n'+ '\n Customer MobileNo: '+req.body.customerMobile +'\n'+'\n Query: '+ req.body.customerQuery ,
                          	 // "mail"      : 'Hello admin, query details are given below: '+'\n'+"\n <br><br>Customer Name: "+req.body.customerName+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team GangaExpress',
							 "mail"          : 'Dear Admin, query details are given below: <br/><br/>'+
							                          "<b>Customer Name: </b>" + req.body.customerName + '<br/>'+
							                          "<b>Customer MobileNo: </b>"  + req.body.customerMobile + '<br/><br/>'+
							                          "<pre><b>Customer Query: </b>" + req.body.query + "</pre>" +
							                          "<br/><br/> Support Team, <br/> www.GangaExpress.com " ,	                 
					   },
	     "json"      : true,
	     "headers"   : {
	                     "User-Agent": "Test App"
	                 }
	    })
	    .then((sentemail)=>{
	        res.header("Access-Control-Allow-Origin","*");
	        res.status(200).json({message:"Your Query Sent successfully"});
	    })
	    .catch((err) =>{

	        res.status(500).json({
	            error: err
	        });
	    });
};