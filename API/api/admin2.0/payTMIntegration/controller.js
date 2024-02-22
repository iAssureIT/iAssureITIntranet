const mongoose			= require("mongoose");
var   ObjectID 			= require('mongodb').ObjectID;
var   Axios 			= 'axios';
const User 				= require('../userManagementnew/ModelUsers.js');
const Orders 			= require('../orders/model.js');
const globalVariable 	= require("../../../nodemonConfig.js");
const PaytmChecksum 	= require("./payTMChecksum.js");


exports.globalVariable = (req,res,next)=>{

	const merchantId 	= globalVariable.MERCHANT_ID
	const merchantKey = globalVariable.MERCHANT_KEY
	const websiteName = globalVariable.WEBSITE_NAME
	const callbackUrl = globalVariable.CALLBACK_URL
	const paytmURL 	= globalVariable.PAYTM_URL
	var paytmParams 	= {};

    paytmParams.body = {
        requestType 	: "Payment",
        merchantId 	: merchantId,
        websiteName 	: websiteName,
        orderId 		: req.body.orderId,
        callbackUrl  : req.body.callbackUrl,
        txnAmount: {
            value 	: req.body.amount,
            currency : req.body.currency,
        },
        userInfo: {
            custId: req.body.custId,
        },
    };



    PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        merchantKey
    ).then(function (checksum) {
        console.log(checksum);
        paytmParams.head = {
            signature: checksum,
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {
            hostname : paytmURL,
            port 		: 443,
            path 		: `/theia/api/v1/initiateTransaction?merchantId=${merchantId}&orderId=${orderId}`,
            method 	: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length,
            },
        };

        var response = "";


     //    Axios(options,paytmParams)
     //    		.then(checksum=>{
     //    			console.log("Paytm successful checksum => ",checksum);
        			
					// res.status(200).json({
     //              token 		: checksum.txnToken,
     //              order 		: req.body.orderId,
     //              merchantId 	: merchantId,
     //              amount 		: req.body.amount,						
					// })
     //    		})
     //    		.catch(error=>{
     //    			console.log("error at paytm checksum => ",error);
					// res.status(500).json({
					// 	message : error,
					// 	success : false,						
					// })
     //    		})

        // var post_req = https.request(options, function (post_res) {
        //     post_res.on("data", function (chunk) {
        //         response += chunk;
        //     });
        //     post_res.on("end", function () {
        //         console.warn(response);
        //         paymentCallback({
        //             token: JSON.parse(response).body.txnToken,
        //             order: orderId,
        //             merchantId: merchantId,
        //             amount: amount,
        //         });
        //     });
        // });
        // post_req.write(post_data);
        // post_req.end();

    });	

}