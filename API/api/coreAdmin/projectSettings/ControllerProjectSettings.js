const mongoose	        = require("mongoose");
const ProjectSettings   = require('./ModelProjectSettings.js');

exports.create_projectSettings = (req, res, next) => {
    var conditionQuery      = "";
    var listRequiredFields  = ""; 
    switch(req.body.type){
        case 'S3'       :
            conditionQuery      = req.body.key && req.body.secret && req.body.bucket && req.body.region;
            listRequiredFields  = "Keys, secret, bucket and region";
            break;
        case 'SMS'      :
            // conditionQuery      = req.body.authID && req.body.authToken && req.body.sourceMobile;
            // listRequiredFields  = "authID and authToken and sourceMobile";
            conditionQuery      = req.body.authID && req.body.authToken && req.body.origin;
            listRequiredFields  = "authID and authToken and origin";
            break; 
        case 'EMAIL'      :
            conditionQuery      = req.body.user && req.body.password && req.body.port && req.body.emailHost && req.body.projectName;
            listRequiredFields  = "user and password and port";
            break;  
        case 'GOOGLE'   :
            conditionQuery      = req.body.googleapikey;
            listRequiredFields  = "googleapikey";
            break;
        case 'PG'   :
            conditionQuery      =   req.body.environment &&
                                    req.body.namepayg &&
                                    req.body.partnerid &&
                                    req.body.secretkey &&
                                    req.body.status;
            listRequiredFields  = "environment,namepayg,partnerid,secretkey,status";
            break;
    case 'PUSH_NOTIFICATION'   :
        conditionQuery      = req.body.key;
        listRequiredFields  = "key";
        break; 
        default         :
            res.status(200).json("type can be either S3 or SMS or GOOGLE or PG");
            break;
    }
    if(conditionQuery){
    	ProjectSettings.findOne({type:req.body.type})
    		.exec()
    		.then(data =>{
    			if(data){
    				return res.status(200).json({
    					message : 'Details already exists.',
                        details : data
    				});
    			}else{
                const projectsetting = new ProjectSettings({
                    _id             : mongoose.Types.ObjectId(),      
                    googleapikey    : req.body.googleapikey,
                    key             : req.body.key,
                    secret          : req.body.secret,
                    bucket          : req.body.bucket,
                    region          : req.body.region,

                    authID          : req.body.authID,
                    authToken       : req.body.authToken,
                    // sourceMobile    : req.body.sourceMobile,
                    origin          : req.body.origin,

                    user           : req.body.user,
                    password       : req.body.password,
                    port           : req.body.port,
                    emailHost      : req.body.emailHost,
                    projectName    : req.body.projectName,
                    
                    environment    : req.body.environment,
                    namepayg       : req.body.namepayg,
                    partnerid      : req.body.partnerid,
                    secretkey      : req.body.secretkey,
                    status         : req.body.status,

                    type            : req.body.type
                });
                
                projectsetting.save(
                    (err)=>{
                        if(err){
                            console.log(err);
                            return  res.status(500).json({
                                error: err
                            });          
                        }
                        res.status(200).json({ 
                            message: 'Details Inserted!',
                            data: projectsetting
                        });
                    }
                );
            }
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    }else{
        res.status(200).json({message : "REQUIRED_FIELDS : "+listRequiredFields});
    }
};

exports.fetch_projectsettings = (req, res, next)=>{
    ProjectSettings.findOne({"type": req.params.type})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(200).json({
                    message : "DATA_NOT_FOUND",
                })
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });            
};

exports.fetch_projectsettings_all = (req, res, next)=>{
    ProjectSettings.find({})
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

exports.patch_projectsettings = (req, res, next)=>{
    var conditionQuery      = "";
    var listRequiredFields  = ""; 
    switch(req.body.type){
        case 'S3'       :
            conditionQuery      = req.body.key && req.body.secret && req.body.bucket && req.body.region;
            listRequiredFields  = "Keys, secret, bucket and region";
            break;
        case 'SMS'      :
            // conditionQuery      = req.body.authID && req.body.authToken && req.body.sourceMobile;
            // listRequiredFields  = "authID and authToken";
            conditionQuery      = req.body.authID && req.body.authToken && req.body.origin;
            listRequiredFields  = "authID and authToken, and origin";
            break; 
        case 'EMAIL'      :
            conditionQuery      = req.body.user && req.body.password && req.body.port && req.body.emailHost && req.body.projectName;
            listRequiredFields  = "user and password and port";
            break;  
        case 'GOOGLE'   :
            conditionQuery      = req.body.googleapikey;
            listRequiredFields  = "googleapikey";
            break;
        default         :
            res.status(200).json("type can be either S3 or SMS or GOOGLE");
            break;
    }
    if(conditionQuery){
        ProjectSettings.updateOne(
                                    {"type": req.params.type},
                                    {
                                        $set : {
                                                "googleapikey" : req.body.googleapikey,
                                                "authID"          : req.body.authID,
                                                "authToken"       : req.body.authToken,
                                                // "sourceMobile"    : req.body.sourceMobile,
                                                "origin"    : req.body.origin,
                                                "key"         : req.body.key,
                                                "secret"      : req.body.secret,
                                                "bucket"      : req.body.bucket,
                                                "region"      : req.body.region, 
                                                "user"           : req.body.user,
                                                "password"       : req.body.password,
                                                "port"           : req.body.port,
                                                "emailHost"      : req.body.emailHost,
                                                "projectName"    : req.body.projectName,                   
                                        }
                                    }
                                )
            .exec()
            .then(data=>{
                // console.log("req.DATA===>",data);
                if(data.nModified == 1){
                    res.status(200).json({
                        message : "DETAILS_UPDATED",
                    });
                }else{
                    res.status(200).json({
                        message : "DETAILS_NOT_UPDATED",
                    })
                }
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });   
    }else{
        res.status(200).json({message : "REQUIRED_FIELDS : "+listRequiredFields});
    } 
};
// exports.patch_projectsettings_google = (req, res, next)=>{
//     var conditionQuery      = "";
//     var listRequiredFields  = ""; 
//     console.log("req.body.key===>",req.body.googleapikey);
//     switch(req.body.type){
//         case 'S3'       :
//             conditionQuery      = req.body.key && req.body.secret && req.body.bucket && req.body.region;
//             listRequiredFields  = "Keys, secret, bucket and region";
//             break;
//         case 'SMS'      :
//             conditionQuery      = req.body.key && req.body.secret;
//             listRequiredFields  = "Keys and secret";
//             break;  
//         case 'GOOGLE'   :
//             conditionQuery      = req.body.googleapikey;
//             listRequiredFields  = "googleapikey";
//             break;
//         default         :
//             res.status(200).json("type can be either S3 or SMS or GOOGLE");
//             break;
//     }
//     if(conditionQuery){
//         console.log("req.params.type===>",req.params.type);
//         ProjectSettings.updateOne(
//                                     {"type": req.params.type},
//                                     {
//                                         $set :  {
//                                                     "googleapikey" : req.body.googleapikey,
//                                                 }
//                                     }
//                                 )
//             .exec()
//             .then(data=>{
//                 console.log("req.data===>",data);
//                 if(data.nModified == 1){
//                     res.status(200).json({
//                         message : "DETAILS_UPDATED",
//                     });
//                 }else{
//                     res.status(500).json({
//                         message : "DETAILS_NOT_UPDATED",
//                     })
//                 }
//             })
//             .catch(err =>{
//                 console.log(err);
//                 res.status(500).json({
//                     error: err
//                 });
//             });   
//     }else{
//         res.status(200).json({message : "REQUIRED_FIELDS : "+listRequiredFields});
//     } 
// };

exports.delete_projectsettings = (req, res, next)=>{
    ProjectSettings.deleteOne({"type": req.params.type})
        .exec()
        .then(data=>{
            if(data.deletedCount === 1){
                res.status(200).json({
                    message : "DETAILS_DELETED",
                });
            }else{
                res.status(200).json({
                    message : "DATA_NOT_FOUND",
                })
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });            
};

exports.insertS3Data = (req, res, next) => {
    ProjectSettings.find({type:'S3'}).count()
    .exec()
        .then(data=>{
            if(data > 0){
                ProjectSettings.updateOne(
                        { type:'S3' },   
                        {
                            $set:   {   
                                        "key"             : req.body.key,
                                        "secret"          : req.body.secret,
                                        "bucket"          : req.body.bucket,
                                        "region"          : req.body.region,
                                    },
                        }
                    )
                    .exec()
                    .then(data=>{
                        if(data.nModified == 1){
                            ProjectSettings.updateOne(
                            { type:'S3'},
                            {
                                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                            updatedBy      : req.body.updatedBy 
                                                        }] 
                                        }
                            } )
                            .exec()
                            .then(data=>{
                                res.status(200).json({ 
                                    updated : true, 
                                    "message"    : "S3 Details updated Successfully", 
                                });
                            })
                        }else{
                            res.status(200).json({ 
                                updated : false, 
                                "message"    : "S3 Details not modified", 
                            });
                            // res.status(200).json({ updated : false });
                        }
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({ error: err });
                    });
            }else{
                const projectSettings = new ProjectSettings({
                    _id             : mongoose.Types.ObjectId(),      
                    type            : 'S3',
                    key             : req.body.key,
                    secret          : req.body.secret,
                    bucket          : req.body.bucket,
                    region          : req.body.region,
                    createdAt       : new Date()
                });
                
                projectSettings.save()
                .then(data=>{
                    res.status(200).json({ 
                        created : true,
                        "message"    : "S3 Details submitted Successfully", 
                    });
                })
                .catch(err =>{
                    res.status(500).json({ error: err }); 
                });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 

};

