const mongoose = require("mongoose");
const DocumentEntityMaster = require('./Model.js');
const FailedRecords = require('../failedRecords/ModelFailedRecords');

// exports.insertDocuments = (req, res, next) => {
//     console.log("req.body In Doc entity=>", req.body.fieldValue);
//     processData();
//     async function processData() {
//         var alldocuments = await fetchDocuments()
//         var document = alldocuments.filter((data) => {
//             if (data.document.trim().toLowerCase() == req.body.fieldValue.trim().toLowerCase()) {
//                 return data;
//             }
//         })
//         if (document.length > 0) {
//             res.status(200).json({ duplicated: true });
//         } else {
//             const documentEntityMaster = new DocumentEntityMaster({
//                 _id: new mongoose.Types.ObjectId(),
//                 documententity: req.body.fieldValue,
//                 createdBy: req.body.createdBy,
//                 createdAt: new Date()
//             })
//             documentEntityMaster.save()
//                 .then(data => {
//                     res.status(200).json({ created: true, fieldID: data._id });
//                 })
//                 .catch(err => {
//                     console.log("err", err.code)
//                     if (err.code == 11000) {
//                         res.status(200).json({ duplicated: true });
//                     } else {
//                         res.status(500).json({ error: err });
//                     }

//                 });
//         }
//     }
// };
// var fetchDocuments = async () => {
//     return new Promise(function (resolve, reject) {
//         DocumentEntityMaster.find({})
//             .exec()
//             .then(data => {
//                 resolve(data);
//             })
//             .catch(err => {
//                 reject(err);
//             });
//     });
// };
exports.insertDocuments = (req, res, next) => {
    // console.log("req.body In Doc entity=>", req.body.fieldValue);
    DocumentEntityMaster
        .find({documententity:req.body.fieldValue})
        .then(data =>{
            if (data.length > 0) {
                res.status(200).json({message:"Document Entity already exists"});
                // res.status(409).json({ duplicated: true });
            } else {
                const documentEntityMaster = new DocumentEntityMaster({
                    _id: new mongoose.Types.ObjectId(),
                    documententity: req.body.fieldValue,
                    createdBy: req.body.createdBy,
                    createdAt: new Date()
                })
                documentEntityMaster.save()
                    .then(data => {
                        res.status(200).json({ created: true, fieldID: data._id });
                    })
                    .catch(err => {
                        // console.log("err", err.code)
                        if (err.code == 11000) {
                            res.status(409).json({ duplicated: true });
                        } else {
                            res.status(500).json({ error: err });
                        }
    
                    });   
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });


      
};
exports.countdocuments = (req, res, next) => {
    DocumentEntityMaster.find({}).count()
        .exec()
        .then(data => {
            res.status(200).json({ count: data });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
exports.fetchDocuments = (req, res, next) => {
    DocumentEntityMaster.find({})
        .sort({ createdAt: -1 })
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
exports.getDocuments = (req, res, next) => {
    DocumentEntityMaster.find({})
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
exports.fetchSingleDocument = (req, res, next) => {
    DocumentEntityMaster.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.searchDocuments = (req, res, next) => {
    DocumentEntityMaster.find({ document: { $regex: req.params.str, $options: "i" } })
        .exec()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
exports.updateDocument = (req, res, next) => {
    DocumentEntityMaster.updateOne(
        { _id: req.body.fieldID },
        {
            $set: { 'documententity': req.body.fieldValue }
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                DocumentEntityMaster.updateOne(
                    { _id: req.body.fieldID },
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
exports.deletedocument = (req, res, next) => {
    DocumentEntityMaster.deleteOne({ _id: req.params.fieldID })
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

var fetchAlldocuments = async (type) => {
    return new Promise(function (resolve, reject) {
        DocumentEntityMaster.find()
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
};


exports.bulkUploadVehicledocument = (req, res, next) => {
    // console.log("inside bulk upload document");
    // var vehicledocuments = [{document:"mesh"}];
    var vehicledocuments = req.body.data;
    // console.log("vehicledocuments", vehicledocuments);

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
        // var alldepartments = await fetchDepartments();
        for (var k = 0; k < vehicledocuments.length; k++) {
            if (vehicledocuments[k].document == '-') {
                remark += "department not found, ";
            }
            // console.log("remark", remark)

            if (remark == '') {
                // var allDepartments = await fetchAllDepartments(req.body.reqdata);
                // console.log("alldepartments",allDepartments);
                // console.log()
                var alldocuments = await fetchAlldocuments(req.body.reqdata);
                var documentExists = alldocuments.filter((data) => {
                    if (data.document == vehicledocuments[k].document) {
                        return data;
                    }
                })

                // console.log("in else validObjects", documentExists);
                if (documentExists.length == 0) {
                    validObjects = vehicledocuments[k];
                    validObjects.fileName = req.body.fileName;
                    // validObjects.createdBy      = req.body.reqdata.createdBy;
                    validObjects.createdAt = new Date();

                    validData.push(validObjects);

                } else {

                    remark += "document already exists.";

                    invalidObjects = vehicledocuments[k];
                    invalidObjects.failedRemark = remark;
                    invalidData.push(invalidObjects);
                }


            }

        }
        DocumentEntityMaster.insertMany(validData)
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
exports.fetch_file = (req, res, next) => {
    DocumentEntityMaster.find({ _id: "fileName" })
        .exec()
        .then(data => {
            res.status(200).json(data.length);
            //res.status(200).json(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.filedetails = (req, res, next) => {
    var finaldata = {};
    // console.log(req.params.fileName)
    DocumentEntityMaster.find({ fileName: req.params.fileName })
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



