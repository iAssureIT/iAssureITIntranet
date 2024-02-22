const mongoose	= require("mongoose");

const BusinessAssociate     = require('../businessAssociate/Model');
var request                 = require('request-promise');
const gloabalVariable       = require('./../../../nodemon');
// const Masternotifications   = require('../../../coreAdmin/models/masternotifications');
const Masternotifications   = require('../../coreAdmin/notificationManagement/ModelMasterNotification.js');

exports.insert_ba = (req,res,next)=>{
    // console.log("***location Details***");
    var locationArray = [];
 
	const BA = new BusinessAssociate({
        _id                       : new mongoose.Types.ObjectId(),
        companyName               : req.body.companyName,
        emailID                   : req.body.emailID,
        mobileNo                  : req.body.mobileNo,
        pan                       : req.body.pan,
        website                   : req.body.website,
        gstno                     : req.body.gstno,
        logo                      : req.body.logo,
        documents                 : req.body.documents,  
        locationDetails           : [],
        contactDetails            : [], 
        createdAt                 : new Date(), 
        createdBy                 : req.body.createdBy,
        userID                    : req.body.userID
    });
    BA.save()
    .then(data=>{
        // console.log("Data in API:  ",data);
        var header = "<table><tbody><tr><td align='center' width='100%'><a><img src='http://anashandicrafts.iassureit.com/images/anasLogo.png' style='width:25%'></a></td></tr></table>";
        var body = "";
        var footer = "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
        footer += "<span style='color:#fff'>AnasHandicraft Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
        footer += "<span style='float:right;color:#fff'>iassureitmail@gmail.com</span></td></tr></tbody></table>"
        
        var otpMailSubject, otpSmsText;
        Masternotifications.findOne({ "templateType": "Email", "templateName": "BA New Registration" })
            .exec()
            .then((maildata) => {
                // console.log("maildata in API:  ",maildata);
                if (maildata) {
                    otpMailSubject = maildata.subject != '' ? maildata.subject : "AnasHandicraft business associate account registration" ;                    
                    if (maildata.content != '') {
                        var variables = {
                                            "username"      : req.body.emailID,
                                            "password"      : "anashandicraft123",
                                        }
                                        
                        var content = maildata.content;
                        if(content.indexOf('[') > -1 ){
                            var wordsplit = content.split('[');
                        }
        
                        var tokens = [];
                        var n = 0;
                        for(i=0;i<wordsplit.length;i++){
                            if(wordsplit[i].indexOf(']') > -1 ){
                                tokensArr = wordsplit[i].split(']');
                                tokens[n] = tokensArr[0];
                                n++;
                            }
                        }
                        var numOfVar = Object.keys(variables).length;
        
                        for(i=0; i<numOfVar; i++){
                            var tokVar = tokens[i].substr(1,tokens[i].length-2);
                            content = content.replace(tokens[i],variables[tokens[i]]);
                        }
                        content = content.split("[").join(" ");
                        content = content.split("]").join(" ");
                        
                        body += "<table><tr><td>"+content+"</td></tr></table>";
                    }else{
                        body += "<table><tbody><tr><td><p>Congratulations! You have been registered successfully as a Business Associate on GangaExpress!!</p></td></tr>";
                        body += "<tr><td><p>Your login credentials are: </p>";
                        body += "<p><b>UserName: </b>"+req.body.emailID+" </p>";
                        body += "<p><b>Password:</b> anashandicraft123 </p></td></tr>"
                        body += "</tbody></table>";   
                    }
                }else{
                    otpMailSubject = "AnasHandicraft business associate account registration";

                    //body += "<table><tr><td><p>Dear "+req.body.companyName+", </p>\n";
                    body += "<table><tbody><tr><td><p>Congratulations! You have been registered successfully as a Business Associate on AnasHandicraft!!</p></td></tr>";
                    body += "<tr><td><p>Your login credentials are: </p>";
                    body += "<p><b>UserName: </b>"+req.body.emailID+" </p>";
                    body += "<p><b>Password:</b> anashandicraft123 </p></td></tr>"
                    body += "</tbody></table>";
                }
            
                request({
                    "method": "POST",
                    "url": "http://localhost:" + gloabalVariable.PORT + "/send-email",
                    "body": {
                        "email": req.body.emailID,
                        "subject": otpMailSubject,
                        "text": otpMailSubject,
                        "mail" : body
                    },
                    "json": true,
                    "headers": {
                        "User-Agent": "Test App"
                    }
                })
                .then((sentemail) => {

                    res.header("Access-Control-Allow-Origin", "*");

                    res.status(200).json({
                    "id"     : data._id,
                    "message": "Business Associate Submitted Successfully."
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        error: err
                    });
                });
            })
            .catch(err =>{
                console.log("Error in findOne API:  ",err);
                res.status(500).json({
                    error: err
                }); 
         });
    })
    .catch(err =>{
        console.log("Error in API:  ",err);
        res.status(500).json({
            error: err
        }); 
    });
};

exports.update_ba = (req,res,next)=>{

    BusinessAssociate.updateOne(
            { _id:req.body.baID},  
            {
                $set:   { 
                            'companyName'              : req.body.companyName,
                            'emailID'                  : req.body.emailID,
                            'mobileNo'                 : req.body.mobileNo,
                            'pan'                      : req.body.pan,
                            'website'                  : req.body.website,
                            'gstno'                    : req.body.gstno,
                            'logo'                     : req.body.logo,
                            'documents'                : req.body.documents
                        }
            }
        )
        .exec()
        .then(data=>{
            console.log(data)
            res.status(200).json({
                    "message": "Business Associate Updated Successfully."
                });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};


exports.update_ba_loc = (req,res,next)=>{
    var locationdetails = req.body.locationDetails;
    BusinessAssociate.updateOne(
            { _id:req.body.baID},  
            {
                $push:  { 'locationDetails' : locationdetails }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Business Associate Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Business Associate Not Found"
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

exports.singleLocation = (req,res,next)=>{
    
    BusinessAssociate.find({"_id" : req.body.baID, "locationDetails._id":req.body.locationID },
        {"locationDetails.$" : 1})
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


exports.singleContact = (req,res,next)=>{
    
    BusinessAssociate.find({"_id" : req.body.baID, "contactDetails._id":req.body.contactID },
        {"contactDetails.$" : 1})
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
exports.update_ba_loc_one = (req,res,next)=>{
    var locationdetails = req.body.locationDetails;
    
    BusinessAssociate.updateOne(
            { "_id":req.body.baID, "locationDetails._id": req.body.locationID},  
            {
                $set:   { 'locationDetails.$.addressLine1' : locationdetails[0].addressLine1,
                          'locationDetails.$.addressLine2' : locationdetails[0].addressLine2,
                          'locationDetails.$.countryCode'  : locationdetails[0].countryCode,
                          'locationDetails.$.stateCode'    : locationdetails[0].stateCode,
                          'locationDetails.$.district'     : locationdetails[0].district,
                          'locationDetails.$.city'         : locationdetails[0].city,
                          'locationDetails.$.area'         : locationdetails[0].area,
                          'locationDetails.$.pincode'    : locationdetails[0].pincode,
                          
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Business Associate Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Business Associate Not Found"
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

exports.update_ba_contact_one = (req,res,next)=>{
    var contactDetails = req.body.contactDetails;
    
    BusinessAssociate.updateOne(
            { "_id":req.body.baID, "contactDetails._id": req.body.contactID},  
            {
                $set:   { 'contactDetails.$.name'              : contactDetails[0].name,
                          'contactDetails.$.mobileNo'          : contactDetails[0].mobileNo,
                          'contactDetails.$.email'             : contactDetails[0].email,
                          'contactDetails.$.altMobileno'       : contactDetails[0].altMobileno,
                          'contactDetails.$.officeLandlineNo'  : contactDetails[0].officeLandlineNo   
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Business Associate Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Business Associate Not Found"
                });
            }
        })
        .catch(err =>{
            //console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.update_ba_contact = (req,res,next)=>{
    var contactdetails = req.body.contactDetails;

    BusinessAssociate.updateOne(
            { _id:req.body.baID},  
            {
                $push:  { 'contactDetails' : contactdetails }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Business Associate Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Business Associate Not Found"
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


exports.list_ba = (req,res,next)=>{
    BusinessAssociate.find()       
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

exports.single_ba = (req,res,next)=>{
    BusinessAssociate.find({_id : req.params.baID})
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

exports.check_ba_exists = (req,res,next)=>{
    BusinessAssociate.find({emailID : req.params.emailID})
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

exports.delete_ba = (req,res,next)=>{
    BusinessAssociate.deleteOne({_id:req.params.baID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Business Associate Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};


exports.delete_location = (req,res,next)=>{   
    BusinessAssociate.updateOne(
            { _id:req.params.baID},  
            {
                $pull: { 'locationDetails' : {_id:req.params.locationID}}
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Business Associate Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Business Associate Not Found"
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

exports.delete_contact = (req,res,next)=>{   
    BusinessAssociate.updateOne(
            { _id:req.params.baID},  
            {
                $pull: { 'contactDetails' : {_id:req.params.contactID}}
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Business Associate Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Business Associate Not Found"
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
