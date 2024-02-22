const mongoose          = require("mongoose");
const NodeGeocoder      = require('node-geocoder');
const EntityMaster      = require('./ModelEntityMaster');
const PersonMaster      = require('../personMaster/ModelPersonMaster.js');
const DepartmentMaster  = require('../departmentMaster/ModelDepartmentMaster.js');
const DesignationMaster = require('../designationMaster/ModelDesignationMaster.js');
const User              = require('../userManagement/ModelUsers.js');
const FailedRecords     = require('../failedRecords/ModelFailedRecords');
var ObjectId 		    = require('mongodb').ObjectID;
const globalVariable    = require("../../../nodemonConfig.js");
const axios             = require('axios');
const _                 = require("underscore");
const sendNotification  = require("../../coreAdmin/notificationManagement/SendNotification.js");


exports.insertEntity = (req,res,next)=>{
    insertEntityFunc();

    async function insertEntityFunc(){
        // console.log("basic info post => ",req.body);
        var getnext = await getNextSequence(req.body.entityType)
        // if(req.body.entityType == 'corporate'){var str = "C"+parseInt(getnext)}else if(req.body.entityType == 'vendor'){var str = "V"+parseInt(getnext)}else{var str = 1}

        EntityMaster.findOne({  
            companyName               : req.body.companyName.trim(),
            // groupName                 : req.body.groupName,
            // companyEmail              : req.body.companyEmail, 
            // companyPhone              : req.body.companyPhone,
            // website                   : req.body.website   
        })
        .exec()
        .then(data=>{
            // console.log("Company Name data = ",data);
            if (data) {
                res.status(200).json({ duplicated : true });
            }else{
                const entity = new EntityMaster({
                    _id                       : new mongoose.Types.ObjectId(),
                    supplierOf                : req.body.supplierOf ? req.body.supplierOf : null,
                    entityType                : req.body.entityType,
                    profileStatus             : req.body.profileStatus,
                    companyNo                 : getnext ? getnext : 1,
                    // companyID                 : str ? str : 1, 
                    companyID                 : getnext ? getnext : 1, 
                    companyName               : req.body.companyName,
                    groupName                 : req.body.groupName,
                    CIN                       : req.body.CIN,   
                    COI                       : req.body.COI,
                    TAN                       : req.body.TAN,
                    companyLogo               : req.body.companyLogo,
                    shopImage                   : req.body.shopImage,
                    website                   : req.body.website,
                    companyPhone              : req.body.companyPhone,
                    companyEmail              : req.body.companyEmail,
                    commisionPercent            : req.body.commisionPercent,
                    userID                    : req.body.userID,  
                    createdBy                 : req.body.createdBy ? req.body.createdBy : null,
                    createdAt                 : new Date()
                })
                entity.save()
                .then(data=>{
                    res.status(200).json({ created : true, entityID : data._id ,companyID : data.companyID});
                })
                .catch(err =>{
                    res.status(500).json({ error: err }); 
                });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err }); 
        });
        
    }
    
};

function getNextSequence(entityType) {
    return new Promise((resolve,reject)=>{
    EntityMaster.findOne({entityType : entityType})    
        .sort({companyID : -1})   
        .exec()
        .then(data=>{
            if (data) { 
                var seq = data.companyID;
                // console.log("seq 1 => ",seq)
                seq = seq+1;
                // console.log("seq 2 => ",seq)
                resolve(seq) 
            }else{
               resolve(2)
            }
            
        })
        .catch(err =>{
            reject(0)
        });
    });
}

exports.listEntity = (req,res,next)=>{
    EntityMaster.find({entityType:req.params.entityType, 
                        // profileStatus:"New"
                        profileStatus:{$ne : "inactive"}
                    })
        .sort({createdAt : -1})    
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.listInactiveEntity = (req,res,next)=>{
    EntityMaster.find({entityType:req.params.entityType, profileStatus:"inactive"})
                .sort({createdAt : -1})    
                .exec()
                .then(data=>{
                    res.status(200).json(data);
                })
                .catch(err =>{
                    res.status(500).json({
                        error: err
                    });
                });
};

exports.listFilterEntity = (req,res,next)=>{
    EntityMaster.find({entityType : req.params.entityType}, {companyName : 1})
                .sort({companyName : 1})
                .exec()
                .then(data=>{
                    res.status(200).json(data);
                })
                .catch(err =>{
                    res.status(500).json({
                        error: err
                    });
                });
};


exports.listEntity_franchise = (req,res,next)=>{
    EntityMaster.find({entityType:req.params.entityType,_id:req.params.franchiseId}).sort({createdAt : -1})    
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.listSupplier = (req,res,next)=>{
    EntityMaster.find({entityType:req.params.entityType,
                        supplierOf:req.params.company_id,
                        profileStatus : "New"
                })
        .sort({createdAt : -1})    
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.listInactiveSupplier = (req,res,next)=>{
    EntityMaster.find({entityType:req.params.entityType,
                        supplierOf:req.params.company_id,
                        profileStatus : "inactive"
                })
        .sort({createdAt : -1})    
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.countEntity = (req,res,next)=>{
    EntityMaster.find({entityType:req.params.entityType, profileStatus:"New"}).count()       
        .exec()
        .then(data=>{
            res.status(200).json({count: data});
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.countInactiveEntity = (req,res,next)=>{
    EntityMaster.find({entityType:req.params.entityType, profileStatus:"inactive"}).count()       
        .exec()
        .then(data=>{
            res.status(200).json({count: data});
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.companyNamewiseData=(req,res,next)=>{

    // console.log("req.body.companyName",req.params.companyName);

    EntityMaster.find({"companyName"    : req.params.companyName})
         .exec()
       
          .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
                //  console.log("err for company",err);
        });
};

exports.singleEntity = (req,res,next)=>{
    EntityMaster.findOne({_id : req.params.entityID})
    .exec()
    .then(data=>{
        main();
        async function main(){
            var k = 0 ;
            var returnData = [];
            if(data){
            if(data.contactPersons && data.contactPersons.length > 0){
                var contactData = [];
                for(k = 0 ; k < data.contactPersons.length ; k++){
                    var manager1Details = {
                        Name   : "",
                        Department  : "",
                        Designation    : "",
                        contactNo   : "",
                        EmpID   : "",
                    };
                     var manager2Details = {
                        Name   : "",
                        Department  : "",
                        Designation    : "",
                        contactNo   : "",
                        EmpID   : "",
                    };
                     var manager3Details = {
                        Name   : "",
                        Department  : "",
                        Designation    : "",
                        contactNo   : "",
                        EmpID   : "",
                    };
                    // if(data.contactPersons[k].bookingApprovalRequired == 'Yes'){

                      
                    manager1Details = await getManagerDetails(data.contactPersons[k].approvingAuthorityId1,data.companyID)
                    
                   
                    manager2Details = await getManagerDetails(data.contactPersons[k].approvingAuthorityId2,data.companyID)
                    
                   
                    manager3Details = await getManagerDetails(data.contactPersons[k].approvingAuthorityId3,data.companyID)

                       
                    // }
                    contactData.push({
                        "_id"                    : data.contactPersons[k]._id,
                        branchCode               : data.contactPersons[k].branchCode,
                        branchName               : data.contactPersons[k].branchName,
                        firstName                : data.contactPersons[k].firstName,
                        workLocationId           : data.contactPersons[k].workLocationId,
                        addEmployee              : data.contactPersons[k].addEmployee,
                        personID                 : data.contactPersons[k].personID,
                        lastName                 : data.contactPersons[k].lastName,
                        departmentName           : data.contactPersons[k].departmentName,
                        designationName          : data.contactPersons[k].designationName,
                        phone                    : data.contactPersons[k].phone,
                        email                    : data.contactPersons[k].email,
                        employeeID               : data.contactPersons[k].employeeID,
                        role                     : data.contactPersons[k].role,
                        bookingApprovalRequired  : data.contactPersons[k].bookingApprovalRequired,
                        profilePhoto             : data.contactPersons[k].profilePhoto,
                        middleName               : data.contactPersons[k].middleName,
                        DOB                      : data.contactPersons[k].DOB,
                        altPhone                 : data.contactPersons[k].altPhone,
                        gender                   : data.contactPersons[k].gender,
                        whatsappNo               : data.contactPersons[k].whatsappNo,
                        department               : data.contactPersons[k].department,
                        empCategory              : data.contactPersons[k].empCategory,
                        empPriority              : data.contactPersons[k].empPriority,
                        designation              : data.contactPersons[k].designation,
                        address                  : data.contactPersons[k].address,
                        createUser               : data.contactPersons[k].createUser,
                        recieveNotifications     : data.contactPersons[k].recieveNotifications,
                        approvingAuthorityId1    : data.contactPersons[k].approvingAuthorityId1,
                        approvingAuthorityId2    : data.contactPersons[k].approvingAuthorityId2,
                        approvingAuthorityId3    : data.contactPersons[k].approvingAuthorityId3,
                        preApprovedKilometer     : data.contactPersons[k].preApprovedKilometer,
                        preApprovedAmount        : data.contactPersons[k].preApprovedAmount,
                        preApprovedRides         : data.contactPersons[k].preApprovedRides,

                        manager1Details           : manager1Details,
                        manager2Details           : manager2Details,
                        manager3Details           : manager3Details,

                    })
                }
                    
            }
            returnData.push({
                        _id                     : data._id,
                        supplierOf              : data.supplierOf,
                        companyID               : data.companyID,
                        companyName             : data.companyName,
                        companyPhone            : data.companyPhone,
                        companyEmail            : data.companyEmail,
                        locations               : data.locations,
                        entityType              : data.entityType,
                        profileStatus           : data.profileStatus,
                        groupName               : data.groupName,
                        CIN                     : data.CIN,   
                        COI                     : data.COI,
                        TAN                     : data.TAN,
                        companyLogo             : data.companyLogo,
                        shopImage               : data.shopImage,
                        commisionPercent        : data.commisionPercent,
                        website                 : data.website,
                        userID                  : data.userID,  
                        contactData             : contactData
                    })
            }//data
            res.status(200).json(returnData);
            
        }
        
        
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};



function getManagerDetails(ID,companyID){
   return new Promise(function(resolve,reject){
        PersonMaster.findOne({"employeeId" : ID,"companyID":companyID},{firstName:1,middleName:1,lastName:1,contactNo:1,designation:1,department:1,employeeId:1})
             .populate('designationId')
             .populate('departmentId')
             .exec()
             .then(managerDetails=>{
                resolve(managerDetails);
             })
            .catch(err =>{
                res.status(500).json({
                    message : "manager not found.",
                    error: err
                   });
            });
    });
}
exports.getCompany = (req,res,next)=>{
    EntityMaster.findOne({companyID : req.params.companyID})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.entityDetails = (req,res,next)=>{
    EntityMaster.findOne({"contactPersons.userID" : req.params.userID})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.fetchLocationEntities = (req, res, next)=>{
    EntityMaster.findOne({_id : req.body.entityID})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchContactEntities = (req, res, next)=>{
    EntityMaster.findOne({_id : req.body.entityID})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.getWorkLocation = (req, res, next)=>{
    // console.log("body=>",req.body)
    var selector = {};
    if(req.body.company_id){
        selector = {'_id':ObjectId(req.body.company_id)}
    }else{
        selector = {"entityType":req.body.entityType} 
    }
    // console.log("selector",selector);
    EntityMaster.aggregate([
        { $match :selector},
        { $unwind: "$locations" }
        ])
        .exec()
        .then(data=>{
            var locations = data.map((a, i)=>{
                return a.locations
             })   
            res.status(200).json({locations});
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};


exports.companyName = (req,res,next)=>{
    EntityMaster.findOne({companyID : req.params.companyID})
    .exec()
    .then(data=>{
        // console.log("req.params.companyID==>",data);
        if(data){
            res.status(200).json(data);
        }else{
            res.status(200).json({message:"COMPANY_NOT_FOUND"})
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.get_companyName = (req,res,next)=>{
    EntityMaster.findOne({companyID : req.body.companyID},{companyName:1,companyLogo:1, shopImage:1})
    .exec()
    .then(data=>{
        // console.log("req.params.companyID==>",data);
        if(data){
            res.status(200).json(data);
        }else{
            res.status(200).json({message:"COMPANY_NOT_FOUND"})
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.companyNameType = (req,res,next)=>{
    EntityMaster.findOne({companyID : req.params.companyID,entityType : req.params.type},{companyID:1,companyName:1})
    .exec()
    .then(data=>{
        if(data){
            res.status(200).json(data);
        }else{
            res.status(200).json({message:"COMPANY_NOT_FOUND"})
        }
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.branchCodeLocation = (req,res,next)=>{
    EntityMaster.findOne({_id : req.params.entityID, 'locations.branchCode' : req.params.branchCode})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};
exports.updateEntity = (req,res,next)=>{
    console.log("req.body => ",req.body)
    EntityMaster.updateOne(
            { _id:req.body.entityID},  
            {
                $set:   {  
                            'companyName'               : req.body.companyName,
                            'groupName'                 : req.body.groupName,
                            'companyEmail'              : req.body.companyEmail,
                            'CIN'                       : req.body.CIN,   
                            'COI'                       : req.body.COI,
                            'TAN'                       : req.body.TAN,
                            'companyLogo'               : req.body.companyLogo,
                            'shopImage'               : req.body.shopImage,
                            'website'                   : req.body.website,
                            'companyPhone'              : req.body.companyPhone,
                            commisionPercent            : req.body.commisionPercent
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                EntityMaster.updateOne(
                { _id:req.body.entityID},
                {
                    $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                updatedBy      : req.body.updatedBy 
                                            }] 
                            }
                } )
                .exec()
                .then(data=>{
                    res.status(200).json({ updated : true });
                })
            }else{
                res.status(200).json({ updated : false });
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.updateProfileStatus = (req,res,next)=>{
    EntityMaster.updateOne(
            { _id:req.body.entityID},  
            {
                $set:   { 
                            'profileStatus':req.body.status
                        }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                EntityMaster.updateOne(
                { _id:req.body.entityID},
                {
                    $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                updatedBy      : req.body.updatedBy 
                                            }] 
                            }
                } )
                .exec()
                .then(data=>{
                    res.status(200).json({ updated : true });
                })
            }else{
                res.status(200).json({ updated : false });
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.addLocation = (req,res,next)=>{
    var locationdetails = req.body.locationDetails;
    
    insertLocationdetails();
    async function insertLocationdetails() {
        // var data = await updateDocInLoc(req.body.entityID,locationdetails)
        // console.log('data====>',data)
         var getData = await fetchLocData(req.body.entityID,locationdetails);
        if (getData.length > 0) {
            res.status(200).json({ duplicated : true });
        }else{
            if(locationdetails.GSTIN || locationdetails.PAN){
                var compare = await updateSameStateDocuments(req.body.entityID,locationdetails)
            }
            var getnext = await getNextBranchCode(req.body.entityID)
            locationdetails.branchCode = getnext;
            EntityMaster.updateOne(
                    { _id: ObjectId(req.body.entityID) },  
                    {
                        $push:  { 'locations' : locationdetails }
                    }
                )
                .exec()
                .then(data=>{
                    if(data.nModified == 1){
                        res.status(200).json({ created : true });
                    }else{
                        res.status(401).json({ created : false });
                    }
                })
                .catch(err =>{
                    res.status(500).json({ error: err });
                });
        }
    }
};

function fetchLocData(entityID,locationdetails){
    return new Promise((resolve,reject)=>{
        EntityMaster.find(
        {_id: entityID,"locations.locationType":locationdetails.locationType, "locations.addressLine1": locationdetails.addressLine1},{ 'locations.$': 1 })
        .exec()
        .then(data=>{
            resolve(data)
        })
        .catch(err =>{
            reject(0)
        });
    })
}

function getNextBranchCode(entityID) {
    return new Promise((resolve,reject)=>{
    EntityMaster.findOne({"_id" : entityID }).sort({"locations.branchCode":-1})       
        .exec()
        .then(data=>{
            if (data.locations.length > 0 ) { 
                var seq = data.locations[data.locations.length - 1].branchCode;
                seq = seq+1;
                resolve(seq) 
            }else{
               resolve(1)
            }
            
        })
        .catch(err =>{
            reject(0)
        });
    });
}

function updateSameStateDocuments(entityID,locationdetails){
    return new Promise((resolve,reject)=>{
        EntityMaster.updateMany({"_id":entityID, "locations.state":locationdetails.state},
            {
                $set:   { 
                          'locations.$[].GSTIN'        : locationdetails.GSTIN,
                          'locations.$[].GSTDocument'  : locationdetails.GSTDocument,
                          'locations.$[].PAN'          : locationdetails.PAN,
                          'locations.$[].PANDocument'  : locationdetails.PANDocument
                        }
            },{ multi: true }
        )
        .exec()
        .then(data=>{
            resolve(data)
        })
        .catch(err =>{
            reject(0)
        });
    })
}

exports.updateDocInLoc= (req,res,next)=>{
    EntityMaster.find({"_id":req.body.entityID, "locations.state":req.body.state},{_id: 0, 'locations.$': 1})
    .exec()
    .then(data=>{
        //  console.log('results====>',JSON.stringify(data[0].locations[0].GSTIN)) 
         // EntityMaster.updateOne({"_id":entityID, "locations._id":})
//              const category = await Category.findOne({ _id:req.params.categoryId });
// const lastIndex: number = category.items.length - 1;

// console.log(category.items[lastIndex]);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
}

exports.singleLocation = (req,res,next)=>{
    EntityMaster.find({"_id" : req.body.entityID, "locations._id":req.body.locationID },
        {"locations.$" : 1})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};
exports.updateSingleLocation = (req,res,next)=>{
    var locationdetails = req.body.locationDetails;
    insertLocationdetails();
    async function insertLocationdetails() {
    // var getData = await fetchLocData(req.body.entityID,locationdetails);
    //     if (getData.length > 0) {
    //         res.status(200).json({ duplicated : true });
    //     }else{
            if(locationdetails.GSTIN || locationdetails.PAN){
                var compare = await updateSameStateDocuments(req.body.entityID,locationdetails)
            }
    
           EntityMaster.updateOne(
                { "_id":req.body.entityID, "locations._id": req.body.locationID},  
                {
                    $set:   { 'locations.$.locationType' : locationdetails.locationType,
                              'locations.$.branchCode'   : locationdetails.branchCode,
                              'locations.$.addressLine1' : locationdetails.addressLine1,
                              'locations.$.addressLine2' : locationdetails.addressLine2,
                              'locations.$.countryCode'  : locationdetails.countryCode,
                              'locations.$.country'      : locationdetails.country,
                              'locations.$.stateCode'    : locationdetails.stateCode,
                              'locations.$.state'        : locationdetails.state,
                              'locations.$.district'     : locationdetails.district,
                              'locations.$.city'         : locationdetails.city,
                              'locations.$.area'         : locationdetails.area,
                              'locations.$.pincode'      : locationdetails.pincode,
                              'locations.$.latitude'     : locationdetails.latitude,
                              'locations.$.longitude'    : locationdetails.longitude,
                              'locations.$.GSTIN'        : locationdetails.GSTIN,
                              'locations.$.GSTDocument'  : locationdetails.GSTDocument,
                              'locations.$.PAN'          : locationdetails.PAN,
                              'locations.$.PANDocument'  : locationdetails.PANDocument
                            }
                }
            )
            .exec()
            .then(data=>{
                if(data.nModified == 1){
                    res.status(200).json({ updated : true });
                }else{
                    res.status(200).json({ updated : false });
                }
            })
            .catch(err =>{
                res.status(500).json({ error: err });
            });
        // }
    }
};

exports.addContact = (req,res,next)=>{
    var contactdetails = req.body.contactDetails;
    EntityMaster.find({"contactPersons.email": contactdetails.email,"contactPersons._id" : {$ne : req.body.entityID}})
    .then((datas)=>{
        if(datas.length > 0){
            res.status(200).json({ duplicated : true });
        }else{
            EntityMaster.updateOne(
                { _id:req.body.entityID},  
                {
                    $push:  { 'contactPersons' : contactdetails }
                }
            )
            .exec()
            .then(data=>{
                if(data.nModified == 1){
                    res.status(200).json({ created : true });
                }else{
                    res.status(200).json({ created : false });
                }
            })
            .catch(err =>{
                res.status(500).json({
                    error: err
                });
            });
        }
    })
    .catch((err)=>{
        res.status(500).json({
            error: err
        });
    })
    
};
exports.singleContact = (req,res,next)=>{
    EntityMaster.findOne({"_id" : req.body.entityID, "contactPersons._id":req.body.contactID,"contactPersons.employeeID" : {$ne : req.body.employeeID}  },
        {"contactPersons.$" : 1})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

function camelCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

exports.getAllVendors = (req,res,next)=>{
    var city = req.params.city;
    var city1 = camelCase(city);
    var city2 = city.toUpperCase();
    var city3 = city.toLowerCase();
    EntityMaster.find({"entityType":"vendor","locations.city":{$in:
          [city,city1,city2,city3]}})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.getAdminCompany = (req,res,next)=>{
    EntityMaster.find({"entityType":"appCompany"})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.getAllEntities = (req,res,next)=>{
    EntityMaster.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};


exports.updateSingleContact = (req,res,next)=>{
    var contactdetails = req.body.contactDetails;
    // console.log('contactdetails', contactdetails, contactdetails.createUser);
    EntityMaster.find({"contactPersons.email": contactdetails.email, _id: { $ne: req.body.entityID}, "contactPersons._id" : {$ne : req.body.contactID},"contactPersons.employeeID" : {$ne : req.body.employeeID} })
    .then((datas)=>{
        if(datas.length > 0){
            res.status(200).json({ duplicated : true });
        }else{
            EntityMaster.updateOne(
            { "_id":req.body.entityID, "contactPersons._id": req.body.contactID},  
            {
                $set:   { 'contactPersons.$.branchCode' : contactdetails.branchCode,
                          'contactPersons.$.branchName' : contactdetails.branchName,
                          'contactPersons.$.profilePhoto': contactdetails.profilePhoto,
                          'contactPersons.$.firstName'  : contactdetails.firstName,
                          'contactPersons.$.middleName' : contactdetails.middleName,
                          'contactPersons.$.lastName'   : contactdetails.lastName,
                          'contactPersons.$.DOB'        : contactdetails.DOB,
                          'contactPersons.$.employeeID' : contactdetails.employeeID,
                          'contactPersons.$.phone'      : contactdetails.phone,
                          'contactPersons.$.altPhone'   : contactdetails.altPhone,
                          'contactPersons.$.whatsappNo' : contactdetails.whatsappNo,
                          'contactPersons.$.email'      : contactdetails.email,
                          'contactPersons.$.gender'     : contactdetails.gender,
                          'contactPersons.$.department' : contactdetails.department,
                          'contactPersons.$.empCategory' : contactdetails.empCategory,
                          'contactPersons.$.empPriority' : contactdetails.empPriority,
                          'contactPersons.$.designationName'    : contactdetails.designationName,
                          'contactPersons.$.designation'        : contactdetails.designation,
                          'contactPersons.$.departmentName'     : contactdetails.departmentName,
                          'contactPersons.$.address'            : contactdetails.address,
                          'contactPersons.$.role'               : contactdetails.role,
                          'contactPersons.$.createUser'         : contactdetails.createUser,
                          'contactPersons.$.recieveNotifications'         : contactdetails.recieveNotifications,
                          'contactPersons.$.bookingApprovalRequired'    : contactdetails.bookingApprovalRequired,
                          'contactPersons.$.approvingAuthorityId1'      : contactdetails.approvingAuthorityId1,
                          'contactPersons.$.approvingAuthorityId2'      : contactdetails.approvingAuthorityId2,
                          'contactPersons.$.approvingAuthorityId3'      : contactdetails.approvingAuthorityId3,
                          'contactPersons.$.preApprovedKilometer'       : contactdetails.preApprovedKilometer,
                          'contactPersons.$.preApprovedAmount'  : contactdetails.preApprovedAmount,
                          'contactPersons.$.preApprovedRides'  : contactdetails.preApprovedRides,
                        }
            }
            )
            .exec()
            .then(data=>{
                if(data.nModified == 1){
                    res.status(200).json({ updated : true });
                }else{
                    res.status(200).json({ updated : false });
                }
            })
            .catch(err =>{
                res.status(500).json({ error: err });
            });
        }
    })
    .catch((err)=>{
        res.status(500).json({
            error: err
        });
    })
};

exports.deleteEntity = (req,res,next)=>{
    console.log("*****************Inactivate the Entity***************** ")
    console.log("req.params.entityID => ",req.params.entityID)
    EntityMaster.update(
                            { _id : ObjectId(req.params.entityID)},
                            {$set : { profileStatus : "inactive"}}
                        )
    .then(data=>{
        console.log("data => ",data)
        res.status(200).json({ deleted : true });
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};

exports.changeEntityStatus = (req,res,next)=>{
    console.log("*****************Activate the Entity***************** ")
    console.log("req.params.entityID => ",req.params.entityID)
    EntityMaster.update(
                            { _id : ObjectId(req.params.entityID)},
                            {$set : { profileStatus : "active"}}
                        )
    .then(data=>{
        console.log("data => ",data)
        res.status(200).json({ statusChanged : true });

    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};


exports.deleteLocation = (req,res,next)=>{   
    EntityMaster.updateOne(
            { _id:req.params.entityID},  
            {
                $pull: { 'locations' : {_id:req.params.locationID}}
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({ deleted : true });
            }else{
                res.status(401).json({ deleted : false });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });
};

exports.deleteContact = (req,res,next)=>{   
    EntityMaster.updateOne(
            { _id:req.params.entityID},  
            {
                $pull: { 'contactPersons' : {_id:req.params.contactID}}
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({ deleted : true });
            }else{
                res.status(200).json({ deleted : false });
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.filterEntities = (req,res,next)=>{
    // var selector = {
    //         "locations":{ $elemMatch: { stateCode : "MH" }}, 
    //         "locations":{ $elemMatch: { district : "Pune" }},
    //         "companyName" :  {$regex : "^i",$options: "i"} 
    //     };


    var selector = {}; 
    selector['$and']=[];

    selector["$and"].push({ profileStatus: {$ne : "inactive"} })
    selector["$and"].push({ entityType : { $regex : req.body.entityType,$options: "i"} })
    //selector.entityType = {$regex : req.body.entityType,$options: "i"}  
    if (req.body.stateCode) {
        selector["$and"].push({ locations : { $elemMatch: { stateCode : req.body.stateCode } }  })
        //selector.locations = { $elemMatch: { stateCode : req.body.stateCode } }     
    }
    if (req.body.district) {
        selector["$and"].push({ locations : { $elemMatch: { district : { $regex : req.body.district, $options: "i"} } }  })
    }
    if (req.body.initial && req.body.initial != 'All') {
        //selector.companyName = {$regex : "^"+req.body.initial,$options: "i"} 
        selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
    }
    if (req.body.searchStr && req.body.searchStr != '') {
        selector['$or']=[];
        if (req.body.initial && req.body.initial != 'All') {
            selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
        }
        
        selector["$or"].push({ companyName : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ groupName   : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ locations   : { $elemMatch: { addressLine1 : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { area : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { district : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { stateCode : { $regex : req.body.searchStr, $options: "i"} } }  })
    }

    EntityMaster.find(selector)
            .sort({createdAt : -1})
            .exec()
            .then(data=>{
                res.status(200).json(data);
            })
            .catch(err =>{
                res.status(500).json({
                    error: err
                });
            });
};

exports.filterInactiveEntities = (req,res,next)=>{
    var selector = {}; 
    selector['$and']=[];

    selector["$and"].push({ profileStatus: "inactive" })
    selector["$and"].push({ entityType : { $regex : req.body.entityType,$options: "i"} })
    //selector.entityType = {$regex : req.body.entityType,$options: "i"}  
    if (req.body.stateCode) {
        selector["$and"].push({ locations : { $elemMatch: { stateCode : req.body.stateCode } }  })
        //selector.locations = { $elemMatch: { stateCode : req.body.stateCode } }     
    }
    if (req.body.district) {
        selector["$and"].push({ locations : { $elemMatch: { district : { $regex : req.body.district, $options: "i"} } }  })
    }
    if (req.body.initial && req.body.initial != 'All') {
        //selector.companyName = {$regex : "^"+req.body.initial,$options: "i"} 
        selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
    }
    if (req.body.searchStr && req.body.searchStr != '') {
        selector['$or']=[];
        if (req.body.initial && req.body.initial != 'All') {
            selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
        }
        
        selector["$or"].push({ companyName : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ groupName   : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ locations   : { $elemMatch: { addressLine1 : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { area : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { district : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { stateCode : { $regex : req.body.searchStr, $options: "i"} } }  })
    }

    EntityMaster.find(selector)
            .sort({createdAt : -1})
            .exec()
            .then(data=>{
                res.status(200).json(data);
            })
            .catch(err =>{
                res.status(500).json({
                    error: err
                });
            });
};



exports.filterEntities_grid = (req,res,next)=>{
    
    var selector = {}; 
    selector['$and']=[];

    selector["$and"].push({ entityType : { $regex : req.body.entityType,$options: "i"} })
    if (req.body.stateCode) {
        selector["$and"].push({ locations : { $elemMatch: { stateCode : req.body.stateCode } }  })
    }
    if (req.body.district) {
        selector["$and"].push({ locations : { $elemMatch: { district : { $regex : req.body.district, $options: "i"} } }  })
    }
    if (req.body.initial && req.body.initial != 'All') {
        selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
    }
    if (req.body.searchStr && req.body.searchStr != '') {
        selector['$or']=[];
        if (req.body.initial && req.body.initial != 'All') {
            selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
        }
        
        selector["$or"].push({ companyName : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ groupName   : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ locations   : { $elemMatch: { addressLine1 : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { area : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { district : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { stateCode : { $regex : req.body.searchStr, $options: "i"} } }  })
    }

    EntityMaster.find(selector)
    .sort({createdAt : -1})
    .skip(req.body.startRange)
    .limit(req.body.limitRange)
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.filterInactiveEntities_grid = (req,res,next)=>{
    
    var selector = {}; 
    selector['$and']=[];

    selector["$and"].push({ profileStatus : "New" });
    selector["$and"].push({ entityType : { $regex : req.body.entityType,$options: "i"} });
    if (req.body.stateCode) {
        selector["$and"].push({ locations : { $elemMatch: { stateCode : req.body.stateCode } }  })
    }
    if (req.body.district) {
        selector["$and"].push({ locations : { $elemMatch: { district : { $regex : req.body.district, $options: "i"} } }  })
    }
    if (req.body.initial && req.body.initial != 'All') {
        selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
    }
    if (req.body.searchStr && req.body.searchStr != '') {
        selector['$or']=[];
        if (req.body.initial && req.body.initial != 'All') {
            selector["$and"].push({ companyName : { $regex : "^"+req.body.initial,$options: "i"}   })
        }
        
        selector["$or"].push({ companyName : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ groupName   : { $regex : req.body.searchStr, $options: "i"}  })
        selector["$or"].push({ locations   : { $elemMatch: { addressLine1 : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { area : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { district : { $regex : req.body.searchStr, $options: "i"} } }  })
        selector["$or"].push({ locations   : { $elemMatch: { stateCode : { $regex : req.body.searchStr, $options: "i"} } }  })
    }

    EntityMaster.find(selector)
    .sort({createdAt : -1})
    .skip(req.body.startRange)
    .limit(req.body.limitRange)
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.fetchEntities = (req, res, next)=>{
    console.log("req.body => ",req.body)
    // EntityMaster.find({
    //     $and:[
    //         {entityType : req.body.type}, 
    //         {$or : [
    //             {profileStatus :"New"},
    //             {profileStatus :"active"},
    //             {profileStatus :""}
    //             ]
    //         }]
    //     })
    EntityMaster.find({
        entityType :  req.body.type,
        profileStatus :{ $ne : "inactive"}
        })
                .sort({createdAt : -1})
                // .skip(req.body.startRange)
                // .limit(req.body.limitRange)
                .exec()
                .then(data=>{
                    // console.log("data => ",data)
                    res.status(200).json(data);
                })
                .catch(err =>{
                    res.status(500).json({ error: err });
                }); 
};

exports.fetchInactiveEntities = (req, res, next)=>{
    // console.log("req.body => ",req.body)
    EntityMaster.find({entityType : req.body.type, profileStatus:"inactive"})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            // console.log("data => ",data)
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};


exports.CompanyfromEntities = (req, res, next)=>{
    EntityMaster.find({})
        .sort({createdAt : -1})
        .select("companyName")
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.countContacts = (req,res,next)=>{
    EntityMaster.aggregate([
        { "$match": { entityType:req.params.entityType } },
        {
          $group: {
            _id: "$entityType",
            total: { $sum: { $size: "$contactPersons"} }
          }
        }
    ])
    .exec()
    .then(data=>{
        if(data[0]){
            var count = data[0].total
        }else{
            var count = 0
        }

            res.status(200).json({count:count});
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.appCompanyDetails = (req,res,next)=>{
    EntityMaster.findOne({companyID :1})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.getVendorList = (req,res,next)=>{
    console.log("req.body => ", req.body);

    res.status(200).json({});



};

// /*=========== Bulk upload Entity ===========*/
// exports.bulkUploadEntity = (req, res, next) => {
//     var entity          = req.body.data;
//     var validData       = [];
//     var validObjects    = [];
//     var invalidData     = [];
//     var invalidObjects  = [];
//     var remark          = '';
//     var failedRecords   = [];
//     var count           = 0;
//     var duplicateCount  = 0;
//     console.log("entity...",entity);

//     processData();
//     async function processData() {
//         for (var k = 0; k < entity.length; k++) {
//             console.log("entityType = > ",k, entity[k].entityType)
//             console.log("Condition => ", (entity[k].entityType !== '-'))
//             if (entity[k].entityType !== '-') {
//                 // remark += "entityType not found, ";
            
//                 if (entity[k].companyName === '-') {
//                     remark += "companyName not found, ";
//                 }
//                 if (entity[k].groupName === '-') {
//                     remark += "groupName not found, ";
//                 }
//                 if (entity[k].companyEmail === '-') {
//                     remark += "companyEmail not found, ";
//                 }
//                 if (entity[k].companyPhone === '-') {
//                     remark += "companyPhone not found, ";
//                 }

//                 if (remark === '') {
//                     var getnext = await getNextSequence(entity[k].entityType)
//                     // console.log("entity[k].EntityType => ",entity[k].EntityType)
//                     if(entity[k].entityType == 'corporate'){
//                         var str = "C"+parseInt(getnext)
//                     }else if(entity[k].entityType == 'vendor'){
//                     //    var str = "V"+parseInt(getnext)
//                     var str = parseInt(getnext)
//                     }else if(entity[k].entityType == 'supplier'){ 
//                         var str = "S"+parseInt(getnext)
//                     }else{var str = 1}

//                     var companyNo  = getnext ? getnext : 1;
//                     var companyID  = str ? str : 1;


//                     // var departmentId, designationId;
//                     // if(entity[k].Department != '-'){
//                     //     // departmentId1 = departmentExists1[0]._id;
//                     //      var deptData = {
//                     //         companyID           : validData.companyID,
//                     //         department          : entity[k].Department,
//                     //         createdBy           : req.body.reqdata.createdBy
//                     //     }
//                     //    departmentId = await insertCompanywiseDepartment(deptData)
//                     // }

//                     // if(entity[k].Designation != '-'){
//                     //     var desigData= {
//                     //         companyID           : validData.companyID,
//                     //         designation         : entity[k].Designation,
//                     //         createdBy           : req.body.reqdata.createdBy
                        
//                     //     }
//                     //     designationId = await insertCompanywiseDesignation(desigData)
//                     // }                
//                     console.log("req.body.EntityType => ", entity[k].entityType);
//                     var allEntities     = await fetchAllEntities(entity[k].entityType);
//                     // console.log("allEntities => ", allEntities);
//                     if(validData && validData.length > 0){
//                         var vendorExists  = validData.filter((data) => {
//                             console.log("data.companyName => ", data.companyName);
//                             console.log("entity[k].companyName => ", entity[k].CompanyName);
//                             if ((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()) {
//                                 return data;
//                             }
//                             // else if(validData && validData.length > 0){
//                             //     console.log("validData ==> ",validData);
//                             //     return validData.filter((data) => {
//                             //         console.log("------------ ",data)
//                             //         if((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()){
//                             //             return data
//                             //         }
//                             //     })

//                             // }
//                         })
//                     }else{                    
//                         var vendorExists  = allEntities.filter((data) => {
//                             console.log("data.companyName => ", data.companyName);
//                             console.log("entity[k].companyName => ", entity[k].CompanyName);
//                             if ((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()) {
//                                 return data;
//                             }
//                             // else if(validData && validData.length > 0){
//                             //     console.log("validData ==> ",validData);
//                             //     return validData.filter((data) => {
//                             //         console.log("------------ ",data)
//                             //         if((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()){
//                             //             return data
//                             //         }
//                             //     })

//                             // }
//                         })
//                     }
//                     console.log("vendorExists=> ",k + " ", vendorExists);
//                     if(vendorExists && vendorExists.length === 0){
                    
//                         var employeeExists  = allEntities.filter((data) => {
//                             if (data.entityType == entity[k].entityType
//                                 && data.companyName == entity[k].companyName
//                                 && data.companyEmail == entity[k].companyEmail) {
//                                 return data;
//                             }
//                         })

//                         // console.log("allEntities => ",allEntities)
//                         // console.log("employeeExists => ",employeeExists)
//                         // console.log("employeeExists => ",employeeExists.length)
//                         validObjects.fileName       = req.body.fileName;

//                         if (employeeExists && employeeExists.length === 0) {               
                        
//                             var latlong    = await getLatLong(entity[k].addressLine2); 
//                             var lat        = latlong[0].latitude;
//                             var lng        = latlong[0].longitude;

//                             var locations  = [{
//                                 locationType        : entity[k].locationType,
//                                 addressLine1        : entity[k].addressflatNo,
//                                 addressLine2        : entity[k].addressLine2,
//                                 country             : entity[k].country,
//                                 state               : entity[k].state,
//                                 district            : entity[k].district,
//                                 city                : entity[k].city,
//                                 area                : entity[k].area,
//                                 pincode             : entity[k].pincode && entity[k].pincode !== "-" ? entity[k].pincode : 0,
//                                 latitude            : lat,
//                                 longitude           : lng,                                            
//                             }]

//                             // console.log("locations => ",locations);
//                             let locationdetails = [];

//                             for( var a = 0; a < locations.length; a++){
//                                 if((locations[a].locationType != 'null' || locations[a].addressLine1 != 'null' || locations[a].addressLine2 != 'null' )){                            
//                                     locationdetails.push(locations[a]);                                
//                                 }
//                             }  

//                             var contactPersons   = [{
//                                 branchName                : entity[k].branchName,
//                                 firstName                 : entity[k].firstName,
//                                 lastName                  : entity[k].lastName,
//                                 phone                     : entity[k].phone,
//                                 altPhone                  : entity[k].altPhone,
//                                 email                     : entity[k].email,
//                                 // department                : entity[k].Department,
//                                 // designation               : entity[k].Designation,
//                                 employeeID                : entity[k].employeeID,
//                                 role                      : entity[k].role,
//                                 createUser                : entity[k].loginCredential && entity[k].loginCredential != '-' && (entity[k].loginCredential).toLowerCase() === 'yes' ? true : false,
//                             }]

//                             // console.log("contactPersons",contactPersons);           
//                             let contactdetails = [];

//                             for( var a=0; a<contactPersons.length; a++){
//                                 if((contactPersons[a].branchName !== null || contactPersons[a].firstName !== null || 
//                                     contactPersons[a].lastName !== null || contactPersons[a].empCategory !== null || 
//                                     contactPersons[a].phone !== null || contactPersons[a].altPhone !== null || contactPersons[a].email !== null ||
//                                     contactPersons[a].department !== null || contactPersons[a].designation !== null || contactPersons[a].employeeID !== null )){

//                                     if(contactPersons[a].branchName !== 'null'){
//                                         contactPersons[a].branchName = 0; 
//                                         contactdetails.push(contactPersons[a]);
//                                     }                                    
//                                 }
//                             } 
                                                    
                                                        
//                             var users = await fetchAllUsers(entity[k].email ? (entity[k].email).toLowerCase() : null);
//                             // console.log("users1----",users1);
                            
//                             if(users){
//                             var userID = users._id
//                             }else{
//                                 var userDetails = {

//                                     firstname               : entity[k].firstName != '-'  ? entity[k].firstName : null,
//                                     lastname                : entity[k].lastName != '-'  ? entity[k].lastName : null,
//                                     mobNumber               : entity[k].phone != '-'  ? entity[k].phone : null,
//                                     email                   : entity[k].email != '-'  ? entity[k].email : null,
//                                     companyID               : validData.companyID,
//                                     companyName             : entity[k].companyName != '-'  ? entity[k].companyName : null,
//                                     designation             : entity[k].designation != '-'  ? entity[k].designation : null,
//                                     department              : entity[k].department != '-'  ? entity[k].department : null,
//                                     pwd                     : "welcome123",
//                                     role                    : [  entity[k].role != '-'  ? entity[k].role : null],
//                                     status                    : 'blocked',
//                                     entityType              : entity[k].entityType,
//                                     // "status"                :  entity[k].role1 ==="corporateadmin" || entity[k].role1 ==="vendoradmin" || entity[k].role1 === "admin" ? "active" :"blocked",
//                                     "emailSubject"  : "Email Verification",
//                                     "emailContent"  : "As part of our registration process, we screen every new profile to ensure its credibility by validating email provided by user. While screening the profile, we verify that details put in by user are correct and genuine.",
//                                 }
//                                 console.log("userDetails => ",userDetails)
//                                 console.log("entity[k].LoginCredential => ",entity[k].loginCredential)
//                                 if( (userDetails.email != '-') && entity[k].loginCredential && ((entity[k].loginCredential).toLowerCase() === 'yes')){
//                                     var userID = await createUser(userDetails);
//                                 }                                               
//                             }

//                             validObjects = {
//                                 fileName                  : req.body.fileName,   
//                                 entityType                : entity[k].entityType,
//                                 companyName               : entity[k].companyName,
//                                 companyNo                 : companyNo,
//                                 companyID                 : companyID,
//                                 groupName                 : entity[k].groupName,
//                                 CIN                       : entity[k].CIN,   
//                                 COI                       : [],
//                                 TAN                       : entity[k].TAN,
//                                 website                   : entity[k].website,
//                                 companyPhone              : entity[k].companyPhone,
//                                 companyEmail              : entity[k].companyEmail,
//                                 country                   : entity[k].country,
//                                 locations                 : locationdetails,
//                                 contactPersons            : contactdetails,                           
//                             }
//                             console.log("validObjects=> ",validObjects)

//                             validData.push(validObjects);

//                         } else {

//                             remark                      += "data already exists.";
//                             invalidObjects              = entity[k];
//                             invalidObjects.failedRemark = remark;

//                             invalidData.push(invalidObjects);
//                         }
//                     } else {

//                         remark                      += "This Vendor Already Exists in the System.";
//                         invalidObjects              = entity[k];
//                         invalidObjects.failedRemark = remark;

//                         invalidData.push(invalidObjects);
//                     }

//                 } else {    

//                     invalidObjects              = entity[k];
//                     invalidObjects.failedRemark = remark;
//                     invalidData.push(invalidObjects);
//                 }
//                 remark = '';
//             }else{
//                 console.log("validData => ",validData);
//                 if(validData && validData.length > 0){                
//                     var vendorRecord = validData[validData.length -1];
//                     console.log("vendorRecord => ",vendorRecord);
//                     if (entity[k].Country === '-') {
//                         remark += "Country not found, ";
//                     }
//                     if (entity[k].City === '-') {
//                         remark += "City not found, ";
//                     }

//                     console.log("1 Condition => ",(entity[k].LocationType !== '-'))

//                     if (entity[k].LocationType !== '-') {                      
                        
//                         var latlong    = await getLatLong(entity[k].addressLine2); 
//                         var lat        = latlong[0].latitude;
//                         var lng        = latlong[0].longitude;

//                         var vendorLocation  = {
//                             locationType        : entity[k].locationType,
//                             addressLine1        : entity[k].addressflatNo,
//                             addressLine2        : entity[k].addressLine2,
//                             country             : entity[k].country,
//                             state               : entity[k].state,
//                             district            : entity[k].district,
//                             city                : entity[k].city,
//                             area                : entity[k].area,
//                             pincode             : entity[k].pincode && entity[k].pincode !== "-" ? entity[k].pincode : 0,
//                             latitude            : lat,
//                             longitude           : lng,                                            
//                         }

//                         console.log("validData.locations" ,validData[0].locations)
//                         vendorRecord.locations.push(vendorLocation);
//                     }
//                     var contactPerson   = {
//                         branchName                : entity[k].branchName,
//                         firstName                 : entity[k].firstName,
//                         lastName                  : entity[k].lastName,
//                         phone                     : entity[k].phone,
//                         altPhone                  : entity[k].altPhone,
//                         email                     : entity[k].email,
//                         // department                : entity[k].Department,
//                         // designation               : entity[k].Designation,
//                         employeeID                : entity[k].employeeID,
//                         role                      : entity[k].role,
//                         createUser                : entity[k].loginCredential && entity[k].loginCredential != '-' && (entity[k].loginCredential).toLowerCase() === 'yes' ? true : false,
//                     }

//                     // console.log("contactPersons",contactPersons);           
                    
//                     if(entity[k].branchName !== '-' && entity[k].firstName !== '-' && entity[k].lastName !== "-"){
//                         vendorRecord.contactPersons.push(contactPerson);
//                     } 
//                 }else{

//                 }
//             }
//         }
//         console.log("validData",validData);
//         EntityMaster.insertMany(validData)
//         .then(data => {
//             console.log("Data *=> ",data)
//         })
//         .catch(err => {
//             console.log(err);
//         });

//         failedRecords.FailedRecords = invalidData;
//         failedRecords.fileName      = req.body.fileName;
//         failedRecords.totalRecords  = req.body.totalRecords;

//         await insertFailedRecords(failedRecords, req.body.updateBadData);

//         res.status(200).json({
//             "message"   : "Bulk upload process is completed successfully!",
//             "completed" : true
//         });
//     }
// };



/*=========== Bulk upload Entity ===========*/
exports.bulkUploadEntity = (req, res, next) => {
    var entity          = req.body.data;
    var validData       = [];
    var validObjects    = [];
    var invalidData     = [];
    var invalidObjects  = [];
    var remark          = '';
    var failedRecords   = [];
    var count           = 0;
    var duplicateCount  = 0;
    // console.log("entity...",entity);

    processData();
    async function processData() {
        for (var k = 0; k < entity.length; k++) {
            // console.log("entityType = > ",k, entity[k].entityType)
            // console.log("Condition => ", (entity[k].entityType !== '-'))
            if (entity[k].entityType !== '-') {
                // remark += "entityType not found, ";
            
                if (entity[k].companyName === '-') {
                    remark += "companyName not found, ";
                }
                if (entity[k].groupName === '-') {
                    remark += "groupName not found, ";
                }
                if (entity[k].companyEmail === '-') {
                    remark += "companyEmail not found, ";
                }
                if (entity[k].companyPhone === '-') {
                    remark += "companyPhone not found, ";
                }

                if (remark === '') {                    
                    // console.log("condition 1 ",(validData && validData.length > 0))
                    if(validData && validData.length > 0){
                        var maxCompanyID = Math.max.apply(null, validData.map(function(vendor) {
                            return vendor.companyID;
                        }));
                        // console.log("maxCompanyID => ", k, " " ,maxCompanyID);
                        var getnext = parseInt(maxCompanyID + 1);

                        if(entity[k].entityType == 'corporate'){
                            var str = "C"+parseInt(maxCompanyID + 1)
                        }else if((entity[k].entityType).toLowerCase() === 'vendor'){
                            //    var str = "V"+parseInt(getnext)
                            var str = parseInt(maxCompanyID + 1);
                            // console.log("str => ",str);
                        }else if(entity[k].entityType == 'supplier'){ 
                            var str = "S"+parseInt(maxCompanyID + 1)
                        }
                    }else{
                        var getnext = await getNextSequence(entity[k].entityType)
                        // console.log("entityType 2 => ",(entity[k].entityType).toLowerCase());
                        // console.log("condition 2 => ",((entity[k].entityType).toLowerCase() === 'vendor'));
                        if(entity[k].entityType == 'corporate'){
                            var str = "C"+parseInt(getnext)
                        }else if((entity[k].entityType).toLowerCase() === 'vendor'){
                            //    var str = "V"+parseInt(getnext)
                            var str = parseInt(getnext);
                        }else if(entity[k].entityType == 'supplier'){ 
                            var str = "S"+parseInt(getnext)
                        }
                    }
                    // console.log("getnext => ",getnext);
                    // console.log("str => ",str);

                    var companyNo  = getnext;
                    var companyID  = str;


                    // var departmentId, designationId;
                    // if(entity[k].Department != '-'){
                    //     // departmentId1 = departmentExists1[0]._id;
                    //      var deptData = {
                    //         companyID           : validData.companyID,
                    //         department          : entity[k].Department,
                    //         createdBy           : req.body.reqdata.createdBy
                    //     }
                    //    departmentId = await insertCompanywiseDepartment(deptData)
                    // }

                    // if(entity[k].Designation != '-'){
                    //     var desigData= {
                    //         companyID           : validData.companyID,
                    //         designation         : entity[k].Designation,
                    //         createdBy           : req.body.reqdata.createdBy
                        
                    //     }
                    //     designationId = await insertCompanywiseDesignation(desigData)
                    // }                
                    // console.log("req.body.EntityType => ", entity[k].entityType);
                    var allEntities     = await fetchAllEntities(entity[k].entityType);
                    // console.log("allEntities => ", allEntities);
                    if(validData && validData.length > 0){
                        var vendorExists  = validData.filter((data) => {
                            // console.log("data.companyName => ", data.companyName);
                            // console.log("entity[k].companyName => ", entity[k].CompanyName);
                            if ((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()) {
                                return data;
                            }
                            // else if(validData && validData.length > 0){
                            //     console.log("validData ==> ",validData);
                            //     return validData.filter((data) => {
                            //         console.log("------------ ",data)
                            //         if((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()){
                            //             return data
                            //         }
                            //     })

                            // }
                        })
                    }else{                    
                        var vendorExists  = allEntities.filter((data) => {
                            // console.log("data.companyName => ", data.companyName);
                            // console.log("entity[k].companyName => ", entity[k].CompanyName);
                            if ((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()) {
                                return data;
                            }
                            // else if(validData && validData.length > 0){
                            //     console.log("validData ==> ",validData);
                            //     return validData.filter((data) => {
                            //         console.log("------------ ",data)
                            //         if((data.companyName).toLowerCase() === (entity[k].companyName).toLowerCase()){
                            //             return data
                            //         }
                            //     })

                            // }
                        })
                    }
                    // console.log("vendorExists=> ",k + " ", vendorExists);
                    if(vendorExists && vendorExists.length === 0){
                    
                        var employeeExists  = allEntities.filter((data) => {
                            if (data.entityType == entity[k].entityType
                                && data.companyName == entity[k].companyName
                                && data.companyEmail == entity[k].companyEmail) {
                                return data;
                            }
                        })

                        // console.log("allEntities => ",allEntities)
                        // console.log("employeeExists => ",employeeExists)
                        // console.log("employeeExists => ",employeeExists.length)
                        validObjects.fileName       = req.body.fileName;

                        if (employeeExists && employeeExists.length === 0) {               
                        
                            var latlong    = await getLatLong(entity[k].addressLine2); 
                            var lat        = latlong[0].latitude;
                            var lng        = latlong[0].longitude;

                            var locations  = [{
                                locationType        : entity[k].locationType,
                                addressLine1        : entity[k].addressflatNo,
                                addressLine2        : entity[k].addressLine2,
                                country             : entity[k].country,
                                state               : entity[k].state,
                                district            : entity[k].district,
                                city                : entity[k].city,
                                area                : entity[k].area,
                                pincode             : entity[k].pincode && entity[k].pincode !== "-" ? entity[k].pincode : 0,
                                latitude            : lat,
                                longitude           : lng,                                            
                            }]

                            // console.log("locations => ",locations);
                            let locationdetails = [];

                            for( var a = 0; a < locations.length; a++){
                                if((locations[a].locationType != 'null' || locations[a].addressLine1 != 'null' || locations[a].addressLine2 != 'null' )){                            
                                    locationdetails.push(locations[a]);                                
                                }
                            }  

                            var contactPersons   = [{
                                branchName                : entity[k].branchName,
                                firstName                 : entity[k].firstName,
                                lastName                  : entity[k].lastName,
                                phone                     : entity[k].phone,
                                altPhone                  : entity[k].altPhone,
                                email                     : entity[k].email,
                                // department                : entity[k].Department,
                                // designation               : entity[k].Designation,
                                employeeID                : entity[k].employeeID,
                                role                      : entity[k].role,
                                createUser                : entity[k].loginCredential && entity[k].loginCredential != '-' && (entity[k].loginCredential).toLowerCase() === 'yes' ? true : false,
                            }]

                            // console.log("contactPersons",contactPersons);           
                            let contactdetails = [];

                            for( var a=0; a<contactPersons.length; a++){
                                if((contactPersons[a].branchName !== null || contactPersons[a].firstName !== null || 
                                    contactPersons[a].lastName !== null || contactPersons[a].empCategory !== null || 
                                    contactPersons[a].phone !== null || contactPersons[a].altPhone !== null || contactPersons[a].email !== null ||
                                    contactPersons[a].department !== null || contactPersons[a].designation !== null || contactPersons[a].employeeID !== null )){

                                    if(contactPersons[a].branchName !== 'null'){
                                        contactPersons[a].branchName = 0; 
                                        contactdetails.push(contactPersons[a]);
                                    }                                    
                                }
                            } 
                                                    
                                                        
                            var users = await fetchAllUsers(entity[k].email ? (entity[k].email).toLowerCase() : null);
                            // console.log("users1----",users1);
                            
                            if(users){
                            var userID = users._id
                            }else{
                                var userDetails = {

                                    firstname               : entity[k].firstName != '-'  ? entity[k].firstName : null,
                                    lastname                : entity[k].lastName != '-'  ? entity[k].lastName : null,
                                    mobNumber               : entity[k].phone != '-'  ? entity[k].phone : null,
                                    email                   : entity[k].email != '-'  ? entity[k].email : null,
                                    companyID               : validData.companyID,
                                    companyName             : entity[k].companyName != '-'  ? entity[k].companyName : null,
                                    designation             : entity[k].designation != '-'  ? entity[k].designation : null,
                                    department              : entity[k].department != '-'  ? entity[k].department : null,
                                    pwd                     : "welcome123",
                                    role                    : [  entity[k].role != '-'  ? entity[k].role : null],
                                    status                    : 'blocked',
                                    entityType              : entity[k].entityType,
                                    recieveNotifications    : entity[k].recieveNotifications,
                                    // "status"                :  entity[k].role1 ==="corporateadmin" || entity[k].role1 ==="vendoradmin" || entity[k].role1 === "admin" ? "active" :"blocked",
                                    "emailSubject"  : "Email Verification",
                                    "emailContent"  : "As part of our registration process, we screen every new profile to ensure its credibility by validating email provided by user. While screening the profile, we verify that details put in by user are correct and genuine.",
                                }
                                // console.log("userDetails => ",userDetails)
                                // console.log("entity[k].LoginCredential => ",entity[k].loginCredential)
                                if( (userDetails.email != '-') && entity[k].loginCredential && ((entity[k].loginCredential).toLowerCase() === 'yes')){
                                    var userID = await createUser(userDetails);
                                }                                               
                            }

                            validObjects = {
                                fileName                  : req.body.fileName,   
                                entityType                : entity[k].entityType,
                                companyName               : entity[k].companyName,
                                companyNo                 : companyNo,
                                companyID                 : companyID,
                                groupName                 : entity[k].groupName,
                                CIN                       : entity[k].CIN,   
                                COI                       : [],
                                TAN                       : entity[k].TAN,
                                website                   : entity[k].website,
                                companyPhone              : entity[k].companyPhone,
                                companyEmail              : entity[k].companyEmail,
                                country                   : entity[k].country,
                                locations                 : locationdetails,
                                contactPersons            : contactdetails,                           
                            }
                            // console.log("validObjects=> ",validObjects)

                            validData.push(validObjects);

                        } else {

                            remark                      += "This Vendor Employee Already Exists in the System.";
                            invalidObjects              = entity[k];
                            invalidObjects.failedRemark = remark;

                            invalidData.push(invalidObjects);
                        }
                    } else {

                        remark                      += "This Vendor Already Exists in the System.";
                        invalidObjects              = entity[k];
                        invalidObjects.failedRemark = remark;

                        invalidData.push(invalidObjects);
                    }

                } else {    

                    invalidObjects              = entity[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects);
                }
                remark = '';
            }else{
                // console.log("validData => ",validData);
                if(validData && validData.length > 0){                
                    var vendorRecord = validData[validData.length -1];
                    // console.log("vendorRecord => ",vendorRecord);
                    if (entity[k].Country === '-') {
                        remark += "Country not found, ";
                    }
                    if (entity[k].City === '-') {
                        remark += "City not found, ";
                    }

                    // console.log("1 Condition => ",(entity[k].LocationType !== '-'))

                    if (entity[k].LocationType !== '-') {                      
                        
                        var latlong    = await getLatLong(entity[k].addressLine2); 
                        var lat        = latlong[0].latitude;
                        var lng        = latlong[0].longitude;

                        var vendorLocation  = {
                            locationType        : entity[k].locationType,
                            addressLine1        : entity[k].addressflatNo,
                            addressLine2        : entity[k].addressLine2,
                            country             : entity[k].country,
                            state               : entity[k].state,
                            district            : entity[k].district,
                            city                : entity[k].city,
                            area                : entity[k].area,
                            pincode             : entity[k].pincode && entity[k].pincode !== "-" ? entity[k].pincode : 0,
                            latitude            : lat,
                            longitude           : lng,                                            
                        }

                        // console.log("validData.locations" ,validData[0].locations)
                        vendorRecord.locations.push(vendorLocation);
                    }
                    var contactPerson   = {
                        branchName                : entity[k].branchName,
                        firstName                 : entity[k].firstName,
                        lastName                  : entity[k].lastName,
                        phone                     : entity[k].phone,
                        altPhone                  : entity[k].altPhone,
                        email                     : entity[k].email,
                        // department                : entity[k].Department,
                        // designation               : entity[k].Designation,
                        employeeID                : entity[k].employeeID,
                        role                      : entity[k].role,
                        recieveNotifications    : entity[k].recieveNotifications,
                        createUser                : entity[k].loginCredential && entity[k].loginCredential != '-' && (entity[k].loginCredential).toLowerCase() === 'yes' ? true : false,
                    }

                    // console.log("contactPersons",contactPersons);           
                    
                    if(entity[k].branchName !== '-' && entity[k].firstName !== '-' && entity[k].lastName !== "-"){
                        vendorRecord.contactPersons.push(contactPerson);
                    } 
                }else{

                }
            }
        }
        // console.log("validData",validData);
        EntityMaster.insertMany(validData)
        .then(data => {
            // console.log("Data *=> ",data)
        })
        .catch(err => {
            console.log(err);
        });

        failedRecords.FailedRecords = invalidData;
        failedRecords.fileName      = req.body.fileName;
        failedRecords.totalRecords  = req.body.totalRecords;

        await insertFailedRecords(failedRecords, req.body.updateBadData);

        res.status(200).json({
            "message"   : "Bulk upload process is completed successfully!",
            "completed" : true
        });
    }
};

/*=========== Insert Companywise Department ===========*/
function insertCompanywiseDepartment(deptData) {
    return new Promise(function (resolve, reject) {
        const departmentMaster = new DepartmentMaster({
            _id         : new mongoose.Types.ObjectId(),
            department  : deptData.department,
            companyID   : deptData.companyID,
            createdBy   : deptData.createdBy,
            createdAt   : new Date()
        })
        departmentMaster.save()
        .then(data => {
            // console.log("department data => ",data);
            resolve(data._id);
        })
        .catch(err => {
            reject(err);
        }); 
    });
}

/*=========== Insert Companywise Designation ===========*/
function insertCompanywiseDesignation(desigData) {
    return new Promise(function (resolve, reject) {
        const designationMaster = new DesignationMaster({
            _id: new mongoose.Types.ObjectId(),
            designation     : desigData.designation,
            companyID       : desigData.companyID,
            createdBy       : desigData.createdBy,
            createdAt       : new Date()
        })
        designationMaster.save()
        .then(data => {
            // console.log("designation => ",data);
            resolve(data._id);
        })
        .catch(err => {
            reject(err);
        });
    });
}

/*=========== Fetch All Entities ===========*/
var fetchAllEntities = async (type) => {
    // console.log("entityType => ",type);
    return new Promise(function (resolve, reject) {
        EntityMaster.find({entityType : type})
            .sort({ createdAt: -1 })
            .then(data => {
                // console.log("data ======> ",data);
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
};

/*=========== Get Latitude Longitude ===========*/
function getLatLong(address){
    // console.log("address => ",address)
    return new Promise(function(resolve, reject){
        var type = 'GOOGLE';         
        axios.get('http://localhost:'+globalVariable.port+'/api/projectsettings/get/'+type)
        .then((response)=>{ 
            // console.log("response => ",response.data);       
            const options = {
                provider       : 'google',
                httpAdapter    : 'https', // Default
                apiKey         : response.data.googleapikey, // for Mapquest, OpenCage, Google Premier
                formatter      : null          
            };
            // console.log("options => ",options); 
            const geocoder = NodeGeocoder(options);
            // console.log("geocoder",geocoder);

            geocoder.geocode('address', function(err, res) {
            // console.log("res => ",res); 
            resolve(res)
            }); 
        })
        .catch((error)=>{})
    })             // const res = await geocoder.geocode('29 champs elysée paris');     
}

/*=========== Fetch All Users ===========*/
var fetchAllUsers = async (email) => {
    return new Promise(function (resolve, reject) {
        User.findOne({username:email})
        .exec()
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject(err);
        });
    });
};

/*=========== Create User ===========*/
function createUser(userDetails){       
    return new Promise(function(resolve, reject){
        // console.log("userDetails---",userDetails);
        axios.post('http://localhost:'+globalVariable.port+'/api/auth/post/signup/user', userDetails)
        .then((response)=>{    
            // console.log("user response",response.data);         
            resolve(response.data.ID);
            if(response.data.message === 'USER_CREATED'){
                //swal(response.data.message);
            }else{
                swal(response.data.message);
            }            
        })
        .catch((error)=>{})
    })
}

/*=========== Insert Companywise Designation ===========*/
var insertFailedRecords = async (invalidData, updateBadData) => {
    //console.log('invalidData',invalidData);
    return new Promise(function (resolve, reject) {
        FailedRecords.find({ fileName: invalidData.fileName })
            .exec()
            .then(data => {
                if (data.length > 0) {
                    //console.log('data',data[0].failedRecords.length)   
                    if (data[0].failedRecords.length > 0) {
                        if (updateBadData) {
                            FailedRecords.updateOne({ fileName: invalidData.fileName },
                                { $set: { 'failedRecords': [] } })
                                .then(data => {
                                    if (data.nModified == 1) {
                                        FailedRecords.updateOne({ fileName: invalidData.fileName },
                                            {
                                                $set: { 'totalRecords': invalidData.totalRecords },
                                                $push: { 'failedRecords': invalidData.FailedRecords }
                                            })
                                            .then(data => {
                                                if (data.nModified == 1) {
                                                    resolve(data);
                                                } else {
                                                    resolve(data);
                                                }
                                            })
                                            .catch(err => { reject(err); });
                                    } else {
                                        resolve(0);
                                    }
                                })
                                .catch(err => { reject(err); });
                        } else {
                            FailedRecords.updateOne({ fileName: invalidData.fileName },
                                {
                                    $set: { 'totalRecords': invalidData.totalRecords },
                                    $push: { 'failedRecords': invalidData.FailedRecords }
                                })
                                .then(data => {
                                    if (data.nModified == 1) {
                                        resolve(data);
                                    } else {
                                        resolve(data);
                                    }
                                })
                                .catch(err => { reject(err); });
                        }

                    } else {
                        FailedRecords.updateOne({ fileName: invalidData.fileName },
                            {
                                $set: { 'totalRecords': invalidData.totalRecords },
                                $push: { 'failedRecords': invalidData.FailedRecords }
                            })
                            .then(data => {
                                if (data.nModified == 1) {
                                    resolve(data);
                                } else {
                                    resolve(data);
                                }
                            })
                            .catch(err => { reject(err); });
                    }
                } else {
                    const failedRecords = new FailedRecords({
                        _id: new mongoose.Types.ObjectId(),
                        failedRecords: invalidData.FailedRecords,
                        fileName: invalidData.fileName,
                        totalRecords: invalidData.totalRecords,
                        createdAt: new Date()
                    });

                    failedRecords
                    .save()
                    .then(data => {
                        resolve(data._id);
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
                }
            })

    })
}

/*=========== Get File Details ===========*/
exports.filedetails = (req,res,next)=>{
    // console.log('req------',req,'res',res);
    var finaldata = {};
    console.log(req.params.fileName)
    EntityMaster.find( { fileName : req.params.fileName  })
    .exec()
    .then(data=>{
        // finaldata.push({goodrecords: data})
        finaldata.goodrecords = data;
        FailedRecords.find({fileName:req.params.fileName})  
        .exec()
        .then(badData=>{
            finaldata.failedRecords = badData[0].failedRecords;
            finaldata.totalRecords = badData[0].totalRecords;
            res.status(200).json(finaldata);
        })        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.fetch_file = (req,res,next)=>{
	EntityMaster.find()
	.exec()
	.then(data=>{
		var x = _.unique(_.pluck(data, "fileName"));
		var z = [];
        x = x.filter(function( element ) {
            return element !== undefined;
         });
		for(var i=0; i<x.length; i++){
			var y = data.filter((a)=> a.fileName === x[i]);
            console.log("x => ",x)
            console.log("y => ",y)
			z.push({
				"fileName"      : x[i],
				'vendorCount'   : y.length,
				"_id"           : x[i]
			})
		}
        console.log("z => ",z)
		res.status(200).json(z.slice(req.body.startRange, req.body.limitRange));
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};
exports.search_file = (req,res,next)=>{
	// console.log("search_file ",req.body);
	EntityMaster.find(
		{
			"$and" : [
			{ "$or": 
				[{"fileName" : {'$regex' : req.body.filename , $options: "i"} }]
			}]
		})
	.exec()
	.then(data=>{
		// res.status(200).json(data);
		var x = _.unique(_.pluck(data, "fileName"));
		var z = [];
        x = x.filter(function( element ) {
            return element !== undefined;
         });
		for(var i=0; i<x.length; i++){
			var y = data.filter((a)=> a.fileName == x[i]);
			z.push({
				"fileName"      : x[i],
				'productCount'  : y.length,
				"_id"           : x[i]
			})
		}
		res.status(200).json(z.slice(req.body.startRange, req.body.limitRange));
	})
	.catch(err =>{
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
	
};

exports.fetch_vendor_file = (req,res,next)=>{
	res.status(200).json({});	
};

exports.fetch_file_count = (req,res,next)=>{
    res.status(200).json({});    
};



exports.sos_to_appCompony_contacts = (req,res,next)=>{
    User.findOne({ _id : ObjectId(req.body.user_id)})
    .exec()
    .then(async(userdata)=>{
        // console.log("data => ",data);
        if (userdata && userdata !== null && userdata !== undefined) {
            var appCompanyContacts = await User.find({"profile.companyID" : 1}, {_id : 1});
            // console.log("appCompanyContacts => ",appCompanyContacts);
            if (appCompanyContacts && appCompanyContacts.length > 0) {
                for(var i=0; i < appCompanyContacts.length; i++){
                    var userNotificationValues = {
                        "event"         : "SOS",
                        "toUser_id"     : appCompanyContacts[i]._id,
                        "toUserRole"    : "admin",                               
                        "variables"     : {
                                            // "userType"           : userRole.replace(/([a-z])([A-Z][a-z])/g, "$1 $2").charAt(0).toUpperCase(),
                                            "firstName"          : userdata.profile.firstName,
                                            "lastName"           : userdata.profile.lastName,
                                            "fullName"           : userdata.profile.fullName,
                                            "emailId"            : userdata.profile.email,
                                            "mobileNumber"       : userdata.profile.mobile,
                                            "locationLink"       : req.body.locationLink,
                        }
                    }
                    // console.log("userNotificationValues  => ",userNotificationValues);
                    var send_notification_to_user = await sendNotification.send_notification_function(userNotificationValues);
                    // console.log("send_notification_to_user => ",send_notification_to_user)
                }
                if (i >= appCompanyContacts.length) {
                    res.status(200).json({
                        statusCode  : "Success",
                        message     : "Message Sent!"
                    });
                }
            }else{
                res.status(200).json({
                    statusCode  : "Success",
                    message     : "No Contact Persons Available!"
                });
            }           
        }else{
            res.status(200).json({
                statusCode  : "Failed",
                message     : "No User Found"
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