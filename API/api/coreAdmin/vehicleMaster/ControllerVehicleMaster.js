const mongoose	            = require("mongoose");
const VehicleMaster         = require('./ModelVehicleMaster.js');
const VehicleDriverMapping  = require('../vehicleDriverMapping/ModelVehicleDriverMapping.js');
const BookingMaster         = require('../bookingMaster/ModelBookingMaster.js');


exports.insertVehicle = (req,res,next)=>{
    VehicleMaster.findOne({  
        "vehicleNumber" :  req.body.vehicleNumber
         })
        .exec()
        .then(data=>{
            if (data) {
                res.status(200).json({ duplicated : true });
            }else{

            const vehicleMaster = new VehicleMaster({
                            _id                       : new mongoose.Types.ObjectId(),
                            vehicleImage              : req.body.vehicleImage,
                            company_Id                : req.body.company_Id,
                            companyID                 : req.body.companyID,
                            workLocation              : req.body.workLocation,
                            workLocationId            : req.body.workLocationId,
                            companyName               : req.body.companyName,
                            status                    : req.body.status,
                            vehicleDocument           : req.body.vehicleDocument,
                            categoryId                : req.body.categoryId,
                            category                  : req.body.category,  
                            brandId                   : req.body.brandId,
                            brand                     : req.body.brand,
                            modelId                   : req.body.modelId, 
                            model                     : req.body.model, 
                            capacity                  : req.body.capacity,  
                            fuelTypeId                : req.body.fuelTypeId, 
                            fuelType                  : req.body.fuelType,
                            vehicleDriveType          : req.body.vehicleDriveType,  
                            ownership                 : req.body.ownership,  
                            supplier                  : req.body.supplier,  
                            vehicleNumber             : req.body.vehicleNumber,
                            vehiclecolor              : req.body.vehiclecolor,
                            registrationDate          : req.body.registrationDate,   
                            RCDoc                     : req.body.RCDoc,
                            insuranceDate             : req.body.insuranceDate,  
                            insuranceDoc              : req.body.insuranceDoc,
                            permitType                : req.body.permitType,
                            permitValidUpto           : req.body.permitValidUpto,  
                            permitDoc                 : req.body.permitDoc,
                            authorizationUpto         : req.body.authorizationUpto,
                            authorizationDoc          : req.body.authorizationDoc,
                            PUCValidUpto              : req.body.PUCValidUpto,
                            PUCDoc                    : req.body.PUCDoc,
                            FitnessValidUpto          : req.body.FitnessValidUpto,
                            FitnessDoc                : req.body.FitnessDoc,
                            createdBy                 : req.body.createdBy,
                            createdAt                 : new Date()
                        })
                        vehicleMaster.save()
                        .then(data=>{
                            res.status(200).json({ created : true, vehicleId : data._id });
                        })
                        .catch(err =>{
                            console.log('error 6465', err);
                            res.status(500).json({ error: err }); 
                        });  
            }
        })
        .catch(err =>{ res.status(500).json({ error: err }); });  

};

exports.countVehicles = (req, res, next)=>{
    VehicleMaster.find({}).count()
        .exec()
        .then(data=>{
            res.status(200).json({ count : data });
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.fetchVehicles = (req, res, next)=>{
    VehicleMaster.find({})
        .sort({createdAt : -1})
        // .skip(req.body.startRange)
        // .limit(req.body.limitRange)
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.filterVehicles = (req,res,next)=>{
    var selector = {};
    console.log(req.body)
    for (var key in req.body) {
        if (key=='categoryIds' && req.body.categoryIds.length > 0 ) {
            selector.categoryId =  { $in: req.body.categoryIds } 
        }
        if (key=='brandIds' && req.body.brandIds.length > 0) {
            selector.brandId =  { $in: req.body.brandIds } 
        }
        if (key=='modelIds' && req.body.modelIds.length > 0) {
            selector.modelId =  { $in: req.body.modelIds } 
        }
        if (key=='fueltypeIds' && req.body.fueltypeIds.length > 0) {
            selector.fuelTypeId =  { $in: req.body.fueltypeIds } 
        }
        if (key=='company_Id') {
            selector.company_Id =  req.body.company_Id
        }
        if (req.body.initial && req.body.initial != 'All') {
            selector.brand = { $regex : "^"+req.body.initial,$options: "i"}
        }
    }
    console.log("selector",selector);
    VehicleMaster.find(selector)
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
exports.fetchSingleVehicle = (req, res, next)=>{
    VehicleMaster.findOne({ _id: req.params.vehicleID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.searchVehicle = (req, res, next)=>{
    var selector = {}; 
    if(req.params.company_Id!=="All"){
        selector["$and"] = [];
        selector["$and"].push({ "company_Id":req.params.company_Id})
    }
    selector['$or']=[];

    selector["$or"].push({ vehicle      : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ category     : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ brand        : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ model        : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ fuelType     : { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ vehicleNumber: { $regex : req.params.str, $options: "i"}  })
    selector["$or"].push({ vehiclecolor : { $regex : req.params.str, $options: "i"}  })
   
    VehicleMaster.find(selector)
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.updateVehicle = (req, res, next)=>{
    console.log("updateVehicle",req.body);
    VehicleMaster.updateOne(
            { _id:req.body.vehicleID },  
            {
                $set:   {   

                            "company_Id"                : req.body.company_Id,
                            "companyID"                 : req.body.companyID,
                            "workLocation"              : req.body.workLocation,
                            "workLocationId"            : req.body.workLocationId,
                            "companyName"               : req.body.companyName,
                            'vehicleImage'              : req.body.vehicleImage,
                            "vehicleDocument"           : req.body.vehicleDocument,
                            'categoryId'                : req.body.categoryId,
                            'category'                  : req.body.category,
                            'brandId'                   : req.body.brandId,
                            'brand'                     : req.body.brand,
                            'modelId'                   : req.body.modelId, 
                            'model'                     : req.body.model, 
                            'capacity'                  : req.body.capacity,  
                            'fuelTypeId'                : req.body.fuelTypeId, 
                            'fuelType'                  : req.body.fuelType,
                            'vehicleDriveType'          : req.body.vehicleDriveType,  
                            'ownership'                 : req.body.ownership,  
                            'supplier'                  : req.body.supplier,  
                            'vehicleNumber'             : req.body.vehicleNumber,
                            'vehiclecolor '             : req.body.vehiclecolor,
                            'registrationDate'          : req.body.registrationDate,   
                            'RCDoc'                     : req.body.RCDoc,
                            'insuranceDate'             : req.body.insuranceDate,  
                            'insuranceDoc'              : req.body.insuranceDoc,
                            'permitType'                : req.body.permitType,
                            'permitValidUpto'           : req.body.permitValidUpto,  
                            'permitDoc'                 : req.body.permitDoc,
                            'authorizationUpto'         : req.body.authorizationUpto,
                            'authorizationDoc'          : req.body.authorizationDoc,
                            'PUCValidUpto'              : req.body.PUCValidUpto,
                            'PUCDoc'                    : req.body.PUCDoc,
                            'FitnessValidUpto'          : req.body.FitnessValidUpto,
                            'FitnessDoc'                : req.body.FitnessDoc,
                        }
            }
        )
        .exec()
        .then(data=>{
            console.log("data",data)
            if(data.nModified == 1){
                VehicleMaster.updateOne(
                { _id:req.body.vehicleID},
                {
                    $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                updatedBy      : req.body.updatedBy 
                                            }] 
                            }
                })
                .exec()
                .then(data=>{
                    res.status(200).json({ updated : true });
                })
            }else{
                res.status(200).json({ updated : false });
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({ error: err });
        });
};
exports.deleteVehicle = (req, res, next)=>{
    VehicleMaster.deleteOne({_id: req.params.vehicleID})
        .exec()
        .then(data=>{
            if(data.deletedCount === 1){
                res.status(200).json({ deleted : true });
            }else{
                res.status(200).json({ deleted : false });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });            
};


exports.vehicleListMapping = (req,res,next)=>{ 
    VehicleMaster.find({company_Id: req.params.company_Id,status:'Active'},{ vehicleImage:1, brand: 1, model:1, fuelType: 1,vehicleNumber:1,category:1,vehiclecolor:1})
        .sort({createdAt : -1})
        .then(vehicleList=>{
            if(vehicleList){
                for(var k=0; k<vehicleList.length; k++){                    
                    vehicleList[k] = {...vehicleList[k]._doc, matched:false};
                }

                if(req.params.company_Id && vehicleList.length > 0){
                    VehicleDriverMapping.find({company_Id: req.params.company_Id},{vehicleID:1,status:1})
                        .then(mappingList => {
                            if(mappingList.length > 0){
                                for(var i=0; i<mappingList.length; i++){
                                    for(let j=0; j<vehicleList.length; j++){
                                        if(mappingList[i].vehicleID.equals(vehicleList[j]._id) && mappingList[i].status==="Active"){
                                            vehicleList[j] = {...vehicleList[j], matched:true};
                                            break;
                                        }
                                    }

                                }
                                if(i >= mappingList.length){
                                    const resVehicleList = vehicleList.filter(list => list.matched === false);
                                    res.status(200).json(resVehicleList);
                                }       
                            }else{
                                res.status(200).json(vehicleList);
                            }
                        })
                        .catch(err =>{
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });                        
                    }else{
                        res.status(200).json(vehicleList);
                    }
                }else{
                    res.status(404).json('Vehicle Details not found');
                }



        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};
exports.getVehicleList = (req,res,next)=>{ 
    var selector = {};
    for (var key in req.body) {
        if(key=='company_Id' && req.body.company_Id!=='All') {
            selector.company_Id = req.body.company_Id 
        }
        if(key=='status') {
            selector.status =  { $in: req.body.status } 
        }
    }
    console.log("selector",selector);
    VehicleMaster.find(selector,{ vehicleImage:1, brand: 1, model:1, fuelType: 1,vehicleNumber:1,category:1,vehiclecolor:1,status:1,statusLog:1,company_Id:1,companyName:1})
    .sort({createdAt : -1})
    .then(data=>{
        res.status(200).json( data );
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};


exports.getVehicleListForAllocation = (req,res,next)=>{ 
    var desiredFromDate = req.body.fromDate;
    var desiredToDate   = req.body.toDate;
    VehicleMaster.find({company_Id: req.body.company_Id, category: req.body.vehicleCategory,status:'Active'})
        .then(validVehicles=>{
            let vehicleIDArray = validVehicles.map(vehicles => vehicles._id);
            if(validVehicles && validVehicles.length > 0){
                for(var i=0; i<validVehicles.length; i++){
                    var insurance = validVehicles[i].vehicleDocument.filter((elem)=>{return elem.documentName==="Insurance"})
                    var puc       = validVehicles[i].vehicleDocument.filter((elem)=>{return elem.documentName==="PUC"})
                    var permit    = validVehicles[i].vehicleDocument.filter((elem)=>{return elem.documentName==="Permit"})
                    if((insurance.length > 0 && puc.length > 0 && permit.length > 0) &&
                        (new Date(insurance[0].insuranceDate) <= new Date(desiredToDate) || 
                        new Date(insurance[0].PUCValidUpto) <= new Date(desiredToDate) || 
                        new Date(insurance[0].permitValidUpto) <= new Date(desiredToDate))){
                        validVehicles[i] = {...validVehicles[i]._doc, 
                                            availabilityStatus  : 'Not Ready',
                                            driverID            : '',
                                            driverName          : '',
                                        };
                    }else{
                        validVehicles[i] = {...validVehicles[i]._doc, 
                                            availabilityStatus  : 'Available',
                                            driverID            : '',
                                            driverName          : '',
                                        };
                    }
                }
                VehicleDriverMapping.find({vehicleID:{$in:vehicleIDArray},status:'Active'}) 
                .then(vehDrivers =>{
                    for(var i=0; i<validVehicles.length; i++){
                        for(var j=0; j<vehDrivers.length; j++){
                            if(validVehicles[i]._id.equals(vehDrivers[j].vehicleID)){
                                validVehicles[i] = {...validVehicles[i], 
                                                driverID            : vehDrivers[j].driverID,
                                                driverName          : vehDrivers[j].driverName,
                                            };
                                break;            
                            }

                        }                    
                    }

                    BookingMaster
                        .find(
                                {
                                    vehicleID:{$in:vehicleIDArray},
                                    statusValue:{$nin:["Cancel By User", "Cancel By Vendor", "Cancel By Admin"]},
                                    // (bfd < dfd) && (btd > dtd)
                                    // OR
                                    // (bfd > dfd) && (bfd < dtd)
                                    // OR
                                    // (btd > dfd) && (btd < dtd)

                                    $or:[
                                        {
                                            $and:[
                                                {pickupDate:{$lte:new Date(desiredFromDate)}},
                                                {returnDate:{$gte:new Date(desiredToDate)}},   
                                            ]
                                        },
                                        {
                                            $and:[
                                                {pickupDate:{$gte:new Date(desiredFromDate)}},
                                                {pickupDate:{$lte:new Date(desiredToDate)}},  
                                            ]
                                        },
                                        {
                                            $and:[
                                                {returnDate:{$gte:new Date(desiredFromDate)}},
                                                {returnDate:{$lte:new Date(desiredToDate)}},  
                                            ]
                                        }
                                    ]
                                    
                                        
                                }
                          )      
                        .then(bookedVehicleID =>{
                            var availabilityStatus = '';
                            if(bookedVehicleID && bookedVehicleID.length > 0){
                                for(var i=0; i<bookedVehicleID.length; i++){
                                    for(let j=0; j<validVehicles.length; j++){
                                        if(bookedVehicleID[i].vehicleID.equals(validVehicles[j]._id)){
                                            validVehicles[j] = {...validVehicles[j], availabilityStatus:'Booked'};
                                            break;
                                        }
                                    }
                                } 
                                if(i >= bookedVehicleID.length){
                                    res.status(200).json(validVehicles);
                                }  
                            }else{
                                res.status(200).json( validVehicles );
                            }
                            
                        })
                    .catch(err => {
                        res.status(500).json({ error: err });
                    }) 
                })
                .catch(err => {
                    res.status(500).json({ error: err });
                }) 
            }else{
                //if valid vehicle not found
                res.status(200).json( validVehicles );
            }    
              
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.tempDeleteVehicle = (req, res, next)=>{
    VehicleMaster.findOne({_id:req.body.vehicleID})
        .exec()
        .then(vehicle=>{
            if(vehicle){
                console.log("req.vehicle==>",vehicle);
                var newstatus = "";
                if(vehicle.status === 'Active'){
                    newstatus = 'deleted-Active';
                }
                if(vehicle.status === 'Inactive'){
                    newstatus = 'deleted-Inactive';
                }
                VehicleMaster.updateOne(
                    {_id:req.body.vehicleID},
                    {
                        $set:{
                            "status" : newstatus,
                        },
                    }
                )
                .exec() 
                .then(data=>{
                    console.log("RESPONSE.data==>",data);
                    if(data.nModified == 1){
                        VehicleMaster.updateOne(
                            {_id:req.body.vehicleID},
                            {
                                $push:  { 'statusLog' : [{  
                                                            status         : newstatus,
                                                            updatedAt      : new Date(),
                                                            updatedBy      : req.body.updatedBy,
                                                        }] 
                                        }
                            })
                        .exec()
                        .then(data=>{
                            res.status(200).json("VEHICLE_SOFT_DELETED");
                        })
                    }else{
                        res.status(200).json("VEHICLE_NOT_DELETED")
                    }
                })
                .catch(err =>{
                    res.status(500).json({
                        error: err
                    });
                });
            }else{
                res.status(200).json("Vehicle Not Found");
            }
        })
        .catch(err=>{
            res.status(500).json({
                error:err
            });
        });
};

exports.vehicle_update_recover_status = (req,res,next)=>{
    VehicleMaster.findOne({_id:req.body.vehicleID})
        .exec()
        .then(user=>{
            if(user){
                var newstatus = "";
                if(user.status === 'deleted-Active'){
                    newstatus = 'Active';
                }
                if(user.status === 'deleted-Inactive'){
                    newstatus = 'Inactive';
                }
                VehicleMaster.updateOne(
                    {_id:req.body.vehicleID},
                    {
                        $set:{
                            "status" : newstatus,
                        },
                    }
                )
                .exec() 
                .then(data=>{
                    if(data.nModified == 1){
                        VehicleMaster.updateOne(
                            {_id:req.body.vehicleID},
                            {
                                $push:  { 'statusLog' : [{  
                                                            status         : newstatus,
                                                            updatedAt      : new Date(),
                                                            updatedBy      : req.body.updatedBy,
                                                        }] 
                                        }
                            })
                        .exec()
                        .then(data=>{
                            res.status(200).json("USER_IS_RESTORED");
                        })
                    }else{
                        res.status(200).json("USER_IS_NOT_RESTORED")
                    }
                })
                .catch(err =>{
                    res.status(500).json({
                        error: err
                    });
                });
            }else{
                res.status(200).json("User Not Found");
            }
        })
        .catch(err=>{
            res.status(500).json({
                error:err
            });
        });
};