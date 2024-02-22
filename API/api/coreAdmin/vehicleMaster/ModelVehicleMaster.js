const mongoose = require('mongoose');

const vehicleMasterSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    vehicleImage              : Array,
    company_Id                : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
    companyID                 : String,
    companyName               : String,
    workLocation              : String,
    workLocationId            : String,
    categoryId                : { type: mongoose.Schema.Types.ObjectId, ref: 'categorymasters' },
    category                  : String,  
    brandId                   : { type: mongoose.Schema.Types.ObjectId, ref: 'brandmasters' },
    brand                     : String,  
    modelId                   : { type: mongoose.Schema.Types.ObjectId, ref: 'modelmasters' },
    model                     : String,   
    capacity                  : String,  
    fuelTypeId                : { type: mongoose.Schema.Types.ObjectId, ref: 'fueltypemasters' }, 
    fuelType                  : String,  
    vehicleDriveType          : String,  
    ownership                 : String,  
    supplier                  : String,  
    vehicleNumber             : String,
    vehiclecolor              : String,
    permitType                : String,
    
    // registrationDate          : Date,   
    // RCDoc                     : Array,
    // insuranceDate             : Date,  
    // insuranceDoc              : Array,
    // permitValidUpto           : Date,  
    // permitDoc                 : Array,
    // authorizationUpto         : Date,
    // authorizationDoc          : Array,
    // PUCValidUpto              : Date,
    // PUCDoc                    : Array,  
    // FitnessValidUpto          : Date,
    // FitnessDoc                : Array,
    
    vehicleDocument             : [{
                                    documentName : String,
                                    vehicleDocDate : Date,
                                    vehicleDocImg  : Array,
                                }],
    status                    : String,
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                 : Date,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ],
    statusLog                   : [
                                {
                                    status              : String,
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                            ]                            
});

module.exports = mongoose.model('vehiclemasters',vehicleMasterSchema);