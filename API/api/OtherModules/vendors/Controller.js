const mongoose = require("mongoose");

const Vendors = require('./Model');

exports.insert_vendor = (req, res, next) => {
    // console.log("insert new vender ");
    Vendors.find({website: req.body.website, emailId : req.body.emailId})
        .exec()
        .then(data => {
            if(data.length>0){
                res.status(200).json({
                    "message": "Vendor's website already exists.",
                    "vendor_ID": ""
                });
            }else{
                const vendors = new Vendors({
                    _id                         : new mongoose.Types.ObjectId(),
                    typeOptions                 : req.body.typeOptions,
                    companyName                 : req.body.companyName,
                    emailId                     : req.body.emailId,
                    pan                         : req.body.pan,
                    tin                         : req.body.tin,
                    website                     : req.body.website,
                    gstno                       : req.body.gstno,
                    category                    : req.body.category,
                    mobileNumber                : req.body.mobileNumber,
                    coino                       : req.body.coino,
                    mfg                         : req.body.mfg,
                    score                       : req.body.score,
                    evaluation                  : req.body.evaluation,
                    logo                        : req.body.logo,
                    attachedDocuments           : req.body.attachedDocuments,
                    locationDetails             : req.body.locationDetails,
                    contactDetails              : req.body.contactDetails,
                    productsServices            : req.body.productsServices,
                    vendorID                    : req.body.vendorID,
                    owner_ID                    : req.body.owner_ID,
                    user_ID                     : req.body.user_ID,
                    createdAt                   : new Date()
                });
                vendors.save()
                .then(data => {
                    res.status(200).json({
                        "message": "Vendor Submitted Successfully.",
                        "vendor_ID": data._id
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.update_vendor = (req, res, next) => {
    // console.log("vender update");
    Vendors.updateOne(
        { _id: req.body.edit_ID },
        {
            $set: {
                typeOptions                 : req.body.typeOptions,
                companyName                 : req.body.companyName,
                emailId                     : req.body.emailId,
                pan                         : req.body.pan,
                tin                         : req.body.tin,
                website                     : req.body.website,
                gstno                       : req.body.gstno,
                category                    : req.body.category,
                mobileNumber                : req.body.mobileNumber,
                coino                       : req.body.coino,
                mfg                         : req.body.mfg,
                score                       : req.body.score,
                Evaluation                  : req.body.Evaluation,
                logo                        : req.body.logo,
                vendorID                    : req.body.vendorID,
                owner_ID                    : req.body.owner_ID,
                user_ID                     : req.body.user_ID,
                createdAt                   : new Date()
            }
        }
    )
        .exec()
        .then(data => {
            res.status(200).json({
                "message": "Vendor Updated Successfully.",
                "vendor_ID": req.body.edit_ID
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.list_vendor = (req, res, next) => {
    Vendors.find()
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
};
exports.get_greatest_vendorid = (req, res, next) => {
    Vendors.findOne().sort({"vendorID":-1})
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
};
exports.insert_vendor_location = (req, res, next) => {
    // console.log('req', req.params, req.body);
    Vendors.updateOne(
        { _id: req.params.vendorID },
        {
            $push: {
                locationDetails: req.body,
            }
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                res.status(200).json({
                    "message": "Vendor's location submitted successfully.",
                    "vendor_ID": data._id
                });
            } else {
                res.status(401).json({
                    "message": "Vendor Not Found"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.update_vendor_location = (req, res, next) => {
    // console.log('req', req.params, req.body);
    Vendors.updateOne(
        { "_id": req.params.vendorID, "locationDetails._id": req.params.locationID },
        {
            $set: {
                "locationDetails.$.locationType": req.body.locationType,
                "locationDetails.$.addressLineone": req.body.addressLineone,
                "locationDetails.$.addressLinetwo": req.body.addressLinetwo,
                "locationDetails.$.city": req.body.city,
                "locationDetails.$.states": req.body.states,
                "locationDetails.$.district": req.body.district,
                "locationDetails.$.area": req.body.area,
                "locationDetails.$.pincode": req.body.pincode,
                "locationDetails.$.country": req.body.country

            }
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                res.status(200).json({
                    "message": "Vendor's location updated successfully.",
                    "vendor_ID": data._id
                });
            } else {
                res.status(200).json({
                    "message": "Vendor's location already  updated"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.delete_vendor_location = (req, res, next) => {
    // console.log('req', req.params, req.body);
    Vendors.updateOne(
        { "_id": req.params.vendorID, "locationDetails._id": req.params.locationID },
        {
            $pull: { "locationDetails": { "_id": req.params.locationID } }
        }
    )
        .exec()
        .then(data => {
            if (data.nModified == 1) {
                res.status(200).json({
                    "message": "Vendor's location deleted successfully.",
                });
            } else {
                res.status(200).json({
                    "message": "Vendor's location deleted successfully.",
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.delete_vendor_contact = (req, res, next) => {
    Vendors.updateOne(
        { "_id": req.params.vendorID, "contactDetails._id": req.params.contactID },
        {
            $pull: { "contactDetails": { "_id": req.params.contactID } }
        }
    )
    .exec()
    .then(data => {
        if (data.nModified == 1) {
            res.status(200).json({
                "message": "Vendor's contact deleted successfully.",
            });
        } else {
            res.status(200).json({
                "message": "Vendor's contact deleted successfully.",
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.insert_vendor_contact = (req, res, next) => {
    Vendors.updateOne(
        { _id: req.params.vendorID },
        {
            $push: {
                contactDetails: req.body,
            }
        }
    )
    .exec()
    .then(data => {
        if (data.nModified == 1) {
            res.status(200).json({
                "message": "Vendor's contact submitted successfully.",
                "vendor_ID": data._id
            });
        } else {
            res.status(401).json({
                "message": "Vendor Not Found"
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.update_vendor_contact = (req, res, next) => {
    // console.log(req.params, req.body)
    Vendors.updateOne(
        { "_id": req.params.vendorID, "contactDetails._id": req.params.contactID },
        {
            $set: {
                "contactDetails.$.Location"          : req.body.Location,
                "contactDetails.$.Designation"       : req.body.Designation,
                "contactDetails.$.ContactLevel"      : req.body.ContactLevel,
                "contactDetails.$.Phone"             : req.body.Phone,
                "contactDetails.$.Email"             : req.body.Email,
                "contactDetails.$.Name"              : req.body.Name,
                "contactDetails.$.Reportinmanager"   : req.body.Reportinmanager,
                "contactDetails.$.AltPhone"          : req.body.AltPhone,
                "contactDetails.$.Landing"           : req.body.Landing,
            }
        }
    )
    .exec()
    .then(data => {
        if(data.nModified == 1) {
            res.status(200).json({
                "message": "Vendor's contact updated successfully.",
                "vendor_ID": data._id
            });
        }else{
            res.status(200).json({
                "message": "Vendor's contact already updated"
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.list_vendor_with_limits = (req, res, next) => {
    Vendors.find()
        .exec()
        .then(data => {
            // var allData = data.map((x, i)=>{
            //     return {
            //         "_id"                   : x._id,
            //         "vendorCode"           : x.vendorCode,
            //         "vendorName"           : x.vendorName,
            //         "featured"              : x.featured,
            //         "exclusive"             : x.exclusive,
            //         "status"                : x.status
            //     }
            // })
            res.status(200).json(data.slice(req.body.startRange, req.body.limitRange));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.count_vendor = (req, res, next) => {
    Vendors.find({})
        .exec()
        .then(data => {
            // var allData = data.map((x, i)=>{
            //     return {
            //         "_id"                   : x._id,
            //         "vendorCode"           : x.vendorCode,
            //         "vendorName"           : x.vendorName,
            //         "featured"              : x.featured,
            //         "exclusive"             : x.exclusive,
            //         "status"                : x.status
            //     }
            // })
            res.status(200).json({ "dataCount": data });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.fetch_vendor = (req, res, next) => {
    Vendors.findOne({ _id: req.params.vendorID })
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
};
exports.fetch_vendorid = (req, res, next) => {
    Vendors.find({ user_ID: req.params.userID })
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
};
exports.delete_vendor = (req, res, next) => {
    Vendors.deleteOne({ _id: req.params.vendorID })
        .exec()
        .then(data => {
            res.status(200).json({
                "message": "Vendor Deleted Successfully."
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};