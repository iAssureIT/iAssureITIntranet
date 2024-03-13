const mongoose = require('mongoose');

const personMasterSchema = mongoose.Schema({
    _id                         : mongoose.Schema.Types.ObjectId,
    employeeId                  : String,
    profilePhoto                : String,
    firstName                   : String,
    middleName                  : String,
    lastName                    : String,
    DOB                         : Date,
    age                         : Number,
    gender                      : String,
    maritalStatus               : String,
    nationality                 : String, 
    adhaarCardNo                : Number,
    panCardNo                   : String,
    passportNo                  : Number,
    correspondenceAddress                     : {
        addressLine1    : String,
        city            : String,
        state           : String,
        country         : String,
        pincode         : Number,
    },
     permanentAddress                     : {
        addressLine1    : String,
        city            : String,
        state           : String,
        country         : String,
        pincode         : Number,
    },
    contactNo                   : String,
    altContactNo                : String,
    personalEmail               : String,
    companyEmail                : String,
    bloodGroup                  : String,
    designationId               : { type: mongoose.Schema.Types.ObjectId, ref: 'designationmasters' },
    departmentId                : { type: mongoose.Schema.Types.ObjectId, ref: 'departmentmasters' },
    approvingAuthorityId1       : String,
    approvingAuthorityId2       : String,
    approvingAuthorityId3       : String,
    emergencyContact            : [{
        name : String,
        conatctNumber : Number,
    }],
    academicDetails             : [{
                                            qualificationLevel: String,
                                            collegeName       : String,
                                            universityName    : String,
                                            specialization    : String,
                                            passingYear       : Date,
                                            percentage        : String
    }],

    workExperience              : String,
    companyDetails              :   [{
                                        companyName        : String,
                                        Location           : String,
                                        designation        : String,
                                        workingFrom        : Date,
                                        workingTill        : Date,
                                        reportingManager   : String
                                    }], 
    skills             : Array,                                           
    certification        : [{
                                     certificationName  : String,
                                     issuedBy           : String,
                                     certifiedOn        : Date,
                                     ValidTill          : Date,
                                     percentageGrade    : String
    }],    
    bankDetails        : [{
                                     accountHolderName : String,
                                     bankName : String,
                                     accountNumber: Number,
                                     ifscCode : Date,
    }],             
    documents             : [{
                                    documentName        : String,
                                    documentNumber      : String,
                                    documentProof       : {
                                                            imgUrl : Array,
                                                            status : String,
                                                            remark : String,
                                                            createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
                                                            createdAt : Date
                                                        },
                                }],                                           
    userId                      : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    status                      : String,
    createdBy                   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt                   : Date,
    updateLog                   : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                            ],
    statusLog                   :   [
                                        {
                                            
                                            status 				: String,
                                            updatedAt           : Date,
                                            updatedBy           : String,
                                        }
                                    ]
});

module.exports = mongoose.model('personmasters',personMasterSchema);
