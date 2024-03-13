const mongoose = require("mongoose");

const PersonMaster = require('./ModelPersonMaster');
var request = require('request-promise');
//const gloabalVariable = require('./../../../nodemon');
var ObjectID = require('mongodb').ObjectID;
const FailedRecords = require('../failedRecords/ModelFailedRecords');
const DesignationMaster = require('../designationMaster/ModelDesignationMaster.js');
const DepartmentMaster = require('../departmentMaster/ModelDepartmentMaster.js');
const moment = require('moment');

exports.insertPerson = (req, res, next) => {
    PersonMaster.find(
        {"firstName":req.body.firstName, "lastName": req.body.lastName,"email":req.body.email,"dob":req.body.dob})
        .exec()
        .then(data=>{
            if(data.length > 0)
            {
             res.status(200).json({ duplicated : true });
            }else
            {
            const person = new PersonMaster({
                _id: new mongoose.Types.ObjectId(),
                firstName: req.body.firstname,
                middleName: req.body.middlename,
                lastName: req.body.lastname,
                contactNo: req.body.mobNumber,
                companyEmail : req.body.email,
                designationId: req.body.designationId,
                departmentId: req.body.departmentId,
                employeeId: req.body.employeeId,
                userId: req.body.userId,
                createdBy: req.body.createdBy,
                createdAt: new Date(),
                status: req.body.status,
        })
        person.save()
            .then(data => {
                res.status(200).json({ created: true, PersonId: data._id });
            })

            .catch(err => {
                console.log(err)
                res.status(500).json({ error: err });
            });

        }
        })
        .catch(err =>{
            reject(0)
        });
};

function fetchPersonData(firstName,lastName,email,dob){
    return new Promise((resolve,reject)=>{
        PersonMaster.find(
        {"firstName":firstName, "lastName":lastName,"email":email,"dob":dob})
        .exec()
        .then(data=>{
            resolve(data)
        })
        .catch(err =>{
            reject(0)
        });
    })
}



exports.countPersons = (req, res, next) => {
    PersonMaster.find({ type: req.params.type }).count()
        .exec()
        .then(data => {
            res.status(200).json({ count: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.listPersons = (req, res, next) => {
    // PersonMaster.find({ type: req.body.type })
    PersonMaster.aggregate([
        {
            $lookup:
            {
                from: "departmentmasters",
                localField: "departmentId",
                foreignField: "_id",
                as: "department"
            }
        },
        {
            $lookup:
            {
                from: "designationmasters",
                localField: "designationId",
                foreignField: "_id",
                as: "designation"
            }
        },
        { $match: { type: req.body.type } }
    ])
        .sort({ createdAt: -1 })
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.singlePerson = (req, res, next) => {
    PersonMaster.findOne({ _id: req.params.personID })
    PersonMaster.aggregate([
        {
            $lookup:
            {
                from: "departmentmasters",
                localField: "departmentId",
                foreignField: "_id",
                as: "department"
            }
        },
        {
            $lookup:
            {
                from: "designationmasters",
                localField: "designationId",
                foreignField: "_id",
                as: "designation"
            }
        },
        { $match: { "_id": ObjectID(req.params.personID) } }
    ])
        .exec()
        .then(data => {
            res.status(200).json(data[0]);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.singlePersonByUserId = (req, res, next) => {
    PersonMaster.findOne({ _id: req.params.personID })
    PersonMaster.aggregate([
        {
            $lookup:
            {
                from: "departmentmasters",
                localField: "departmentId",
                foreignField: "_id",
                as: "department"
            }
        },
        {
            $lookup:
            {
                from: "designationmasters",
                localField: "designationId",
                foreignField: "_id",
                as: "designation"
            }
        },
        {
            $lookup:
            {
                from: "entitymasters",
                localField: "company_Id",
                foreignField: "_id",
                as: "entity"
            }
        },
        { $match: { "userId": ObjectID(req.params.userID) } }
    ])
        .exec()
        .then(data => {
            res.status(200).json(data[0]);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
exports.updatePersonStatus = (req, res, next) => {
    PersonMaster.updateOne(
        { _id: req.body.personID },
        {
            $set: {
                'status': req.body.status
            }
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                PersonMaster.updateOne(
                    { _id: req.body.personID },
                    {
                        $push: {
                            'updateLog': [{
                                updatedAt: new Date(),
                                updatedBy: req.body.updatedBy
                            }]
                        }
                    })
                    .exec()
                    .then(data => {
                        res.status(200).json({ updated: true });
                    })
            } else {
                res.status(200).json({ updated: false });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.deleteAcademicDetails=(req,res,next)=>{
    console.log("req.body",req.params)
    PersonMaster.deleteOne({ _id: req.params.person_id,"academicDetails._id": req.params.academic_id} )
        .exec()
        .then(data => {
            console.log("data",data);
            if (data.deletedCount === 1) {
                res.status(200).json({ deleted: true });
            } else {
                res.status(200).json({ deleted: false });
            }
        })
        .catch(err=>{

        })
}

exports.updateAcademicDetails=(req,res,next)=>{
    if(!req.body.edit){
        PersonMaster.updateOne(
            { _id: req.body.personID },
            {
                    $push: {
                        'academicDetails': req.body.academic
                    }
            }
        )
            .exec()
            .then(data => {
                if (data.nModified == 1) {
                    PersonMaster.updateOne(
                        { _id: req.body.personID },
                        {
                            $push: {
                                'updateLog': [{
                                    updatedAt: new Date(),
                                    updatedBy: req.body.updatedBy
                                }]
                            }
                        })
                        .exec()
                        .then(data => {
                            res.status(200).json({ updated: true });
                        })
                } else {
                    res.status(200).json({ updated: false });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    }else{
        console.log("Inside else",req.body)
        PersonMaster.updateOne(
            { _id: req.body.personID,"academicDetails._id": req.body.academic_id},
            {
                    $set: {
                        "academicDetails.$" : req.body.academic
                    }
            }
        )
            .exec()
            .then(data => {
                if (data.nModified == 1) {
                    PersonMaster.updateOne(
                        { _id: req.body.personID },
                        {
                            $push: {
                                'updateLog': [{
                                    updatedAt: new Date(),
                                    updatedBy: req.body.updatedBy
                                }]
                            }
                        })
                        .exec()
                        .then(data => {
                            res.status(200).json({ updated: true });
                        })
                } else {
                    res.status(200).json({ updated: false });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    }
   
}

exports.updateSkillAndCert=(req,res,next)=>{
    console.log("req.body",req.body);
    if(!req.body.edit){
        PersonMaster.updateOne(
            { _id: req.body.personID },
            {
                $set: {
                    "skills" : req.body.skills
                },
                $push: {
                    'certification': req.body.certification
                }
            }
        )
            .exec()
            .then(data => {
                if (data.nModified == 1) {
                    PersonMaster.updateOne(
                        { _id: req.body.personID },
                        {
                            $push: {
                                'updateLog': [{
                                    updatedAt: new Date(),
                                    updatedBy: req.body.updatedBy
                                }]
                            }
                        })
                        .exec()
                        .then(data => {
                            res.status(200).json({ updated: true });
                        })
                } else {
                    res.status(200).json({ updated: false });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    }else{
        console.log("Inside else",req.body)
        PersonMaster.updateOne(
            { _id: req.body.personID,"cerification._id": req.body.academic_id},
            {
                    $set: {
                        "cerification.$" : req.body.cerification
                    }
            }
        )
            .exec()
            .then(data => {
                if (data.nModified == 1) {
                    PersonMaster.updateOne(
                        { _id: req.body.personID },
                        {
                            $push: {
                                'updateLog': [{
                                    updatedAt: new Date(),
                                    updatedBy: req.body.updatedBy
                                }]
                            }
                        })
                        .exec()
                        .then(data => {
                            res.status(200).json({ updated: true });
                        })
                } else {
                    res.status(200).json({ updated: false });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
    }
   
}

exports.updatePerson = (req, res, next) => {
    PersonMaster.updateOne(
        { _id: req.body.personID },
        {
            $set: {
                'firstName': req.body.firstName,
                'middleName': req.body.middleName,
                'lastName': req.body.lastName,
                'DOB': req.body.dob,
                'gender': req.body.gender,
                "maritalStatus":req.body.maritalStatus,
                "nationality" : req.body.nationality,
                "adhaarCardNo":req.body.aadharCardNo,
                'contactNo': req.body.personalMobileNo,
                'altContactNo': req.body.alternateMobileNo,
                'personalEmail' : req.body.personalEmail,
                "panCardNo":req.body.panCardNo,
                'correspondenceAddress'                     : {
                    addressLine1    : req.body.addressLine,
                    city            : req.body.city,
                    state           : req.body.state,
                    country         : req.body.country,
                    pincode         : req.body.pincode,
                },
                "bloodGroup" : req.body.bloodGroup
            }
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                PersonMaster.updateOne(
                    { _id: req.body.packageID },
                    {
                        $push: {
                            'updateLog': [{
                                updatedAt: new Date(),
                                updatedBy: req.body.updatedBy
                            }]
                        }
                    })
                    .exec()
                    .then(data => {
                        res.status(200).json({ updated: true });
                    })
            } else {
                res.status(200).json({ updated: false });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.deletePerson = (req, res, next) => {
    PersonMaster.deleteOne({ _id: req.params.personID })
        .exec()
        .then(data => {
            if (data.deletedCount === 1) {
                res.status(200).json({ deleted: true });
            } else {
                res.status(200).json({ deleted: false });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.person_update_delete_status = (req, res, next) => {
    PersonMaster.findOne({ _id: req.body.personID_tobedeleted })
        .exec()
        .then(user => {
            if (user) {
                // console.log("req.user==>",user);
                var newstatus = "";
                if (user.status === 'Active') {
                    newstatus = 'deleted-Active';
                }
                if (user.status === 'Inactive') {
                    newstatus = 'deleted-Inactive';
                }
                PersonMaster.updateOne(
                    { _id: req.body.personID_tobedeleted },
                    {
                        $set: {
                            status: newstatus,
                        },
                    }
                )
                    .exec()
                    .then(data => {
                        if (data.nModified == 1) {
                            PersonMaster.updateOne(
                                { _id: req.body.personID_tobedeleted },
                                {
                                    $push: {
                                        'statusLog': [{
                                            status: newstatus,
                                            updatedAt: new Date(),
                                            updatedBy: req.body.updatedBy,
                                        }]
                                    }
                                })
                                .exec()
                                .then(data => {
                                    res.status(200).json("USER_SOFT_DELETED");
                                })
                        } else {
                            res.status(200).json("USER_NOT_DELETED")
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            } else {
                res.status(200).json("User Not Found");
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

exports.person_update_recover_status = (req, res, next) => {
    PersonMaster.findOne({ _id: req.body.personID_toberecover })
        .exec()
        .then(user => {
            if (user) {
                var newstatus = "";
                if (user.status === 'deleted-Active') {
                    newstatus = 'Active';
                }
                if (user.status === 'deleted-Inactive') {
                    newstatus = 'Inactive';
                }
                PersonMaster.updateOne(
                    { _id: req.body.personID_toberecover },
                    {
                        $set: {
                            status: newstatus,
                        },
                    }
                )
                    .exec()
                    .then(data => {
                        res.status(200).json(data);
                        if (data.nModified == 1) {
                            PersonMaster.updateOne(
                                { _id: req.body.personID_toberecover },
                                {
                                    $push: {
                                        'statusLog': [{
                                            status: newstatus,
                                            updatedAt: new Date(),
                                            updatedBy: req.body.updatedBy,
                                        }]
                                    }
                                })
                                .exec()
                                .then(data => {
                                    res.status(200).json(data);
                                    // res.status(200).json("USER_SOFT_DELETED");
                                })
                        } else {
                            res.status(200).json("USER_NOT_DELETED")
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            } else {
                res.status(200).json("User Not Found");
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};
exports.filterPersons = (req, res, next) => {
    var selector = {};
    main();
    async function main(){
        for (var key in req.body) {
            if (key == 'departments' && req.body.departments.length > 0) {
                var departmentids = await getDepartmentIds(req.body.departments);
                selector.departmentId =[ObjectID(departmentids[0])];
                if(departmentids.length > 1){
                    for(let i=1; i<departmentids.length; i++){
                        selector.departmentId.push(ObjectID(departmentids[i]));
                    }
                }                
            }
            if (key == 'designations' && req.body.designations.length > 0) {
                var designationsids = await getDesignationIds(req.body.designations);
                selector.designationId =[ObjectID(designationsids[0])];
                if(designationsids.length > 1){
                    for(let i=1; i<designationsids.length; i++){
                        selector.designationId.push(ObjectID(designationsids[i]));
                    }
                }
            }
            if (req.body.initial && req.body.initial != 'All') {
                selector.firstName = { $regex: "^" + req.body.initial, $options: "i" }
            }
            if (key == 'company_Id') {
                selector.company_Id = req.body.company_Id
            }
        }
        selector.type = { $regex: req.body.type, $options: "i" }
        PersonMaster.find(selector)
        // PersonMaster.aggregate([
        //     {
        //         $lookup:
        //         {
        //             from: "departmentmasters",
        //             localField: "departmentId",
        //             foreignField: "_id",
        //             as: "department"
        //         }
        //     },
        //     {
        //         $lookup:
        //         {
        //             from: "designationmasters",
        //             localField: "designationId",
        //             foreignField: "_id",
        //             as: "designation"
        //         }
        //     },
        //     { $match: selector }
        // ])
            .sort({ createdAt: -1 })
            .exec()
            .then(data => {
                res.status(200).json(data);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    }
    function getDepartmentIds(departmentNames){
        return new Promise((resolve,reject)=>{
            DepartmentMaster.find({department : {$in : departmentNames}},{_id:1})
            .then(data => {
                var deptids = [];
                for(let i = 0; i<data.length; i++){
                    deptids.push(data[i]._id);
                }
                resolve(deptids);
            })
            .catch(err => {
                reject(err)
            });
        })
    }
    function getDesignationIds(designationsNames){
        return new Promise((resolve,reject)=>{
            DesignationMaster.find({designation : {$in : designationsNames}},{_id:1})
            .then(data => {
                var dsgids = [];
                for(let i = 0; i<data.length; i++){
                    dsgids.push(data[i]._id);
                }
                resolve(data);
            })
            .catch(err => {
                reject(err)
            });
        })
    }

};

exports.searchPerson = (req, res, next) => {
    var selector = {};
    selector["$and"] = [];
    selector["$and"].push({ type: { $regex: req.params.type, $options: "i" } })
    if (req.params.company_Id !== "All") {
        selector["$and"].push({ "company_Id": req.params.company_Id })
    }
    selector['$or'] = [];

    selector["$or"].push({ firstName: { $regex: req.params.str, $options: "i" } })
    selector["$or"].push({ middleName: { $regex: req.params.str, $options: "i" } })
    selector["$or"].push({ lastName: { $regex: req.params.str, $options: "i" } })
    selector["$or"].push({ gender: { $regex: req.params.str, $options: "i" } })
    selector["$or"].push({ designation: { $regex: req.params.str, $options: "i" } })
    selector["$or"].push({ department: { $regex: req.params.str, $options: "i" } })
    selector["$or"].push({ employeeId: { $regex: req.params.str, $options: "i" } })
    PersonMaster.find(selector)
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.bulkUploadEmployee = (req, res, next) => {
    var employees = req.body.data;

    var validData = [];
    var validObjects = [];
    var invalidData = [];
    var invalidObjects = [];
    var remark = '';
    var failedRecords = [];
    var Count = 0;
    var DuplicateCount = 0;
    processData();
    async function processData() {

        var departments = await fetchDepartments();
        var designations = await fetchDesignations();

        for (var k = 0; k < employees.length; k++) {
            if (employees[k].firstName == '-') {
                remark += "firstName not found, ";
            }
            if (employees[k].middleName == '-') {
                remark += "middleName not found, ";
            }
            if (employees[k].lastName == '-') {
                remark += "lastName not found, ";
            }
            if (employees[k].DOB == '-') {
                remark += "DOB not found, ";
            }
            if (employees[k].gender == '-') {
                remark += "gender not found, ";
            }
            if (employees[k].email == '-') {
                remark += "email not found, ";
            }
            if (employees[k].department == '-') {
                remark += "department not found, ";
            }
            if (employees[k].designation == '-') {
                remark += "designation not found, ";
            }
            if (employees[k].employeeId == '-') {
                remark += "employeeId not found, ";
            }
            if (employees[k].companyID == '-') {
                remark += "companyID not found, ";
            }
            // console.log("remark", remark)

            if (remark == '') {
                var departmentId, designationId;
                // check if department exists
                var departmentExists = departments.filter((data) => {
                    if (data.department == employees[k].department) {
                        return data;
                    }
                })
                if (departmentExists.length > 0) {
                    departmentId = departmentExists[0]._id;
                } else {
                    departmentId = await insertDepartment(employees[k].department, req.body.reqdata.createdBy);
                    //departmentId = departmentExists[0]._id;
                }
                // check if designation exists
                var designationExists = designations.filter((data) => {
                    if (data.designation == employees[k].designation) {
                        return data;
                    }
                })
                if (designationExists.length > 0) {
                    designationId = designationExists[0]._id;
                } else {
                    designationId = await insertDesignation(employees[k].designation);
                    //departmentId = departmentExists[0]._id;
                }

                var allEmployees = await fetchAllEmployees(req.body.reqdata.type);

                // check if employee exists
                var employeeExists = allEmployees.filter((data) => {
                    if (data.firstName.trim().toLowerCase() == employees[k].firstName.trim().toLowerCase()
                        && data.middleName.trim().toLowerCase() == employees[k].middleName.trim().toLowerCase()
                        && data.lastName.trim().toLowerCase() == employees[k].lastName.trim().toLowerCase()
                        && data.email.trim() == employees[k].email.trim() && data.companyID.trim() == employees[k].companyID.trim()) {
                        return data;
                    }
                })

                if (employeeExists.length == 0) {
                    var DOB;
                    if (typeof employees[k].DOB == 'number') {
                        DOB = moment(new Date(Math.round((employees[k].DOB - 25569) * 86400 * 1000))).format("YYYY-MM-DD");
                    } else {
                        DOB = moment(new Date(employees[k].DOB)).format("YYYY-MM-DD")
                    }
                    var bookingApprovalRequired = employees[k].bookingApprovalRequired && employees[k].bookingApprovalRequired == '-' ? "No" : "Yes";

                    validObjects = employees[k];

                    validObjects.type = "employee";
                    validObjects.DOB = DOB;
                    validObjects.departmentId = departmentId;
                    validObjects.designationId = designationId;
                    validObjects.bookingApprovalRequired = bookingApprovalRequired;
                    validObjects.corporateId = req.body.reqdata.corporateId;
                    validObjects.fileName = req.body.fileName;
                    validObjects.createdBy = req.body.reqdata.createdBy;
                    validObjects.createdAt = new Date();

                    validData.push(validObjects);

                } else {

                    remark += "Employee already exists.";

                    invalidObjects = employees[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects);
                }

            } else {

                var DOB;
                if (employees[k].DOB == '-') {
                    employees[k].DOB = '-';
                } else {
                    if (typeof employees[k].DOB == 'number') {
                        DOB = moment(new Date(Math.round((employees[k].DOB - 25569) * 86400 * 1000))).format("YYYY-MM-DD");
                    } else {
                        DOB = moment(new Date(employees[k].DOB)).format("YYYY-MM-DD")
                    }

                    employees[k].DOB = DOB;
                }
                invalidObjects = employees[k];
                invalidObjects.failedRemark = remark;
                invalidData.push(invalidObjects);
            }
            remark = '';
        }
        //console.log("validData",validData);
        PersonMaster.insertMany(validData)
            .then(data => {

            })
            .catch(err => {
                console.log(err);
            });

        failedRecords.FailedRecords = invalidData;
        failedRecords.fileName = req.body.fileName;
        failedRecords.totalRecords = req.body.totalRecords;

        await insertFailedRecords(failedRecords, req.body.updateBadData);

        res.status(200).json({
            "message": "Bulk upload process is completed successfully!",
            "completed": true
        });
    }
};

var fetchDesignations = async () => {
    return new Promise(function (resolve, reject) {
        DesignationMaster.find({})
            .exec()
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
};


var fetchDepartments = async () => {
    return new Promise(function (resolve, reject) {
        DepartmentMaster.find({})
            .exec()
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
};
var fetchAllEmployees = async (type) => {
    return new Promise(function (resolve, reject) {
        PersonMaster.find({ type: type })
            .sort({ createdAt: -1 })
            // .skip(req.body.startRange)
            // .limit(req.body.limitRange)
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
};
function insertDepartment(department, createdBy) {
    return new Promise(function (resolve, reject) {
        const departmentMaster = new DepartmentMaster({
            _id: new mongoose.Types.ObjectId(),
            department: department,
            createdBy: createdBy,
            createdAt: new Date()
        })
        departmentMaster.save()
            .then(data => {
                resolve(data._id);
            })
            .catch(err => {
                reject(err);
            });
    });
}
function insertDesignation(designation, createdBy) {
    return new Promise(function (resolve, reject) {
        const designationMaster = new DesignationMaster({
            _id: new mongoose.Types.ObjectId(),
            designation: designation,
            createdBy: createdBy,
            createdAt: new Date()
        })
        designationMaster.save()
            .then(data => {
                resolve(data._id);
            })
            .catch(err => {
                reject(err);
            });
    });
}
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


//Mobile Driver API

//For Driver Basic Info
exports.updatePersonBasicInfo = (req, res, next) => {
    PersonMaster.updateOne(
    { _id:req.body.person_id },   
    {
        $set:   {   
                    'firstName'                   : req.body.firstName,
                    'middleName'                  : req.body.middleName,
                    'lastName'                    : req.body.lastName,
                    'DOB'                         : req.body.DOB,
                    'gender'                      : req.body.gender,
                    'contactNo'                   : req.body.contactNo,
                    'altContactNo'                : req.body.altContactNo,
                    'email'                       : req.body.email,
                    'whatsappNo'                  : req.body.whatsappNo,
                    'workLocationId'              : req.body.workLocationId,
                    'workLocation'                : req.body.workLocation,
            }  
    })
    .exec()
    .then(data=>{
        if(data.nModified == 1){
            PersonMaster.updateOne(
            { userId:req.body.userId},
            {
                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                            updatedBy      : req.body.updatedBy 
                                        }] 

                        }
                    })
                    .exec()
                    .then(data => {
                        res.status(200).json({ updated: true });
                    })
            } else {
                res.status(200).json({ updated: false });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};
//End


//For Driver Address Info
exports.updatePersonAddressInfo = (req, res, next) => {
    PersonMaster.updateOne(
        { _id: req.body.person_id },
        {
            $set: {

                'address': [{
                    addressLine1: req.body.addressLine1,
                    addressLine2: req.body.addressLine2,
                    landmark: req.body.landmark,
                    area: req.body.area,
                    city: req.body.city,
                    district: req.body.district,
                    stateCode: req.body.stateCode,
                    state: req.body.state,
                    countryCode: req.body.countryCode,
                    country: req.body.country,
                    pincode: req.body.pincode,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    addressProof: req.body.addressProof
                }],

            }
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                PersonMaster.updateOne(
                    { _id: req.body.person_id },
                    {
                        $push: {
                            'updateLog': [{
                                updatedAt: new Date(),
                                updatedBy: req.body.updatedBy
                            }]
                        }
                    })
                    .exec()
                    .then(data => {
                        res.status(200).json({ updated: true });
                    })
            } else {
                res.status(200).json({ updated: false });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

};
//End

//For Person Document Info
exports.updatePersonDocumentsProof = (req, res, next) => {
    PersonMaster.updateOne(
        { _id: req.body.person_id },
        {
            $set:   {   
                         Documentarray  : req.body.documentArray, 
                         badgeNumber    : req.body.badgeNumber,                                   
                    }   

        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                PersonMaster.updateOne(
                    { _id: req.body.person_id },
                    {
                        $push: {
                            'updateLog': [{
                                updatedAt: new Date(),
                                updatedBy: req.body.updatedBy
                            }]
                        }
                    })
                    .exec()
                    .then(data => {
                        res.status(200).json({ updated: true });
                    })
            } else {
                res.status(200).json({ updated: false });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};

exports.personProfilePhoto = (req, res, next) => {
    PersonMaster.updateOne(
        { _id: req.body.person_id },
        {
            $set: {
                "profilePhoto": req.body.profilePhoto,
            },
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                PersonMaster.updateOne(
                    { _id: req.body.person_id },
                    {
                        $push: {
                            'updateLog': [{
                                updatedAt: new Date(),
                                updatedBy: req.body.updatedBy
                            }]
                        }
                    })
                    .exec()
                    .then(data => {
                        res.status(200).json({ updated: true });
                    })
            } else {
                res.status(200).json({ updated: false });
            }
        })
        .catch(err => {
            console.log('user error ', err);
            res.status(500).json({
                error: err
            });
        });
};


exports.getPersonProfilePhoto = (req, res, next) => {
    PersonMaster.findOne({ userId: req.params.userId }, { profilePhoto: 1, firstName: 1, lastName: 1, contactNo: 1, _id: 0 })
        .then(data => {
            // console.log(data)
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(200).json({ message: "NOT_FOUND" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};



exports.filedetails = (req, res, next) => {
    var finaldata = {};
    PersonMaster.aggregate([
        {
            $lookup:
            {
                from: "departmentmasters",
                localField: "departmentId",
                foreignField: "_id",
                as: "department"
            }
        },
        {
            $lookup:
            {
                from: "designationmasters",
                localField: "designationId",
                foreignField: "_id",
                as: "designation"
            }
        },
        { $match: { type: req.params.type, fileName: req.params.fileName } }
    ])
        .exec()
        .then(data => {
            //finaldata.push({goodrecords: data})
            finaldata.goodrecords = data;
            FailedRecords.find({ fileName: req.params.fileName })
                .exec()
                .then(badData => {
                    finaldata.failedRecords = badData[0].failedRecords
                    finaldata.totalRecords = badData[0].totalRecords
                    res.status(200).json(finaldata);
                })

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};



exports.fetch_file = (req, res, next) => {
    PersonMaster.aggregate([
        { $match: { "type": req.body.type } },
        { $group: { _id: "$fileName", count: { $sum: 1 } } }
    ])
        .exec()
        .then(data => {
            res.status(200).json(data.slice(req.body.startRange, req.body.limitRange));
            //res.status(200).json(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.fetch_file_count = (req, res, next) => {
    //PersonMaster.find({"type" : req.params.type})
    PersonMaster.aggregate([
        { $match: { "type": req.params.type } },
        { $group: { _id: "$fileName", count: { $sum: 1 } } }
    ])
        .exec()
        .then(data => {

            res.status(200).json(data.length);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_file = (req, res, next) => {

    //console.log("type",req.params.type)
    //console.log("fileName",req.params.fileName)
    PersonMaster.deleteMany({ "fileName": req.params.fileName, "type": req.params.type })
        .exec()
        .then(data => {
            res.status(200).json({
                "message": "Records of file " + req.params.fileName + " deleted successfully"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.getUserByEmpID = (req, res, next) => {
    PersonMaster.find({ employeeId: req.params.employeeId, company_Id: req.params.corporateId })
        .exec()
        .then(data => {
            res.status(200).json({ data: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.getGuestByEmail = (req, res, next) => {
    PersonMaster.find({type:'guest', email: req.params.email, company_Id: req.params.corporateId })
        .exec()
        .then(data => {
            res.status(200).json({ data: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.getEmpByEmpID = (req, res, next) => {
    PersonMaster.find({ employeeId: req.params.employeeId })
        .exec()
        .then(data => {
            res.status(200).json({ data: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.getUserByID = (req, res, next) => {
    PersonMaster.find({ _id: req.params.userId })
        .exec()
        .then(data => {
            res.status(200).json({ data: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.getUserByEmail = (req, res, next) => {
    PersonMaster.find({ email: req.params.emailId })
        .exec()
        .then(data => {
            res.status(200).json({ data: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
exports.getUserByUserId = (req, res, next) => {
    PersonMaster.find({ userId: req.params.userId })
        .exec()
        .then(data => {
            res.status(200).json({ data: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};



exports.getPersonList = (req,res,next)=>{ 
    var selector = {};
    for (var key in req.body) {
        if(key=='company_Id' && req.body.company_Id!=='All') {
            selector.company_Id = req.body.company_Id 
        }
        if(key=='type') {
            selector.type =  req.body.type  
        }
        if(key=='status') {
            selector.status =  { $in: req.body.status } 
        }
    }
    PersonMaster.find(selector,{ firstName: 1, middleName:1, lastName: 1,contactNo:1,profilePhoto:1,email:1,type:1,status:1,statusLog:1,companyID:1,companyName:1})
    .sort({createdAt : -1})
    .then(data=>{
        res.status(200).json( data );
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    }); 
};


exports.getDriverListForVendor = (req, res, next) => {
    PersonMaster.find({ company_Id: req.params.company_Id, type: "driver" }, { firstName: 1, middleName: 1, lastName: 1, contactNo: 1, profilePhoto: 1, email: 1, type: 1, status: 1, statusLog: 1 })
        .sort({ createdAt: -1 })
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};






exports.driver_update_recover_status = (req, res, next) => {
    PersonMaster.findOne({ _id: req.body.driverID })
        .exec()
        .then(user => {
            if (user) {
                var newstatus = "";
                if (user.status === 'deleted-Active') {
                    newstatus = 'Active';
                }
                if (user.status === 'deleted-Inactive') {
                    newstatus = 'Inactive';
                }
                PersonMaster.updateOne(
                    { _id: req.body.driverID },
                    {
                        $set: {
                            "status": newstatus,
                        },
                    }
                )
                    .exec()
                    .then(data => {
                        if (data.nModified == 1) {
                            PersonMaster.updateOne(
                                { _id: req.body.driverID },
                                {
                                    $push: {
                                        'statusLog': [{
                                            status: newstatus,
                                            updatedAt: new Date(),
                                            updatedBy: req.body.updatedBy,
                                        }]
                                    }
                                })
                                .exec()
                                .then(data => {
                                    res.status(200).json("USER_IS_RESTORED");
                                })
                        } else {
                            res.status(200).json("USER_IS_NOT_RESTORED")
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            } else {
                res.status(200).json("User Not Found");
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};

// End

exports.searchPersonByID_Name = (req, res, next) => {
    // console.log('req.params.companyID: ',req.params.companyID)
    // console.log('req.params.str: ',req.params.str)
    PersonMaster.aggregate([
        { $match: { "company_Id": ObjectID(req.params.companyID) } },
        {
            $match:
            {
                $or:
                    [
                        { "firstName": { $regex: req.params.str, $options: "i" } },
                        { middleName: { $regex: req.params.str, $options: "i" } },
                        { lastName: { $regex: req.params.str, $options: "i" } },
                        { employeeId: { $regex: req.params.str, $options: "i" } }
                    ]
            }
        },
    ])
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
