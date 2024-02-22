const mongoose = require("mongoose");
const Company = require("./model");
const { ObjectId } = require("mongodb");

exports.insertCompany = (req, res, next) => {
  Company.findOne({
    "basicInfo.companyName": req.body.companyName,
    "basicInfo.groupName": req.body.groupName,
    "basicInfo.website": req.body.website,
  })
    .exec()
    .then((data) => {
      if (data) {
        res.status(200).json({ duplicated: true, companyID: data._id });
      } else {
        const company = new Company({
          _id: new mongoose.Types.ObjectId(),
          "basicInfo.profileStatus": req.body.profileStatus,
          "basicInfo.companyName": req.body.companyName,
          "basicInfo.groupName": req.body.groupName,
          "basicInfo.companyLogo": req.body.companyLogo,
          "basicInfo.website": req.body.website,
          "basicInfo.employees": req.body.employees,
          "basicInfo.category": req.body.category,
          "basicInfo.subCategory": req.body.subCategory,
          userID: req.body.userID,
          createdBy: req.body.createdBy ? req.body.createdBy : null,
          createdAt: new Date(),
        });
        company
          .save()
          .then((data) => {
            res.status(200).json({ created: true, companyID: data._id });
          })
          .catch((err) => {
            res.status(500).json({ error: err });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.getCompany = (req, res, next) => {
  Company.findOne({ _id: req.params._id })
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.getAllCompanies = (req, res, next) => {
  Company.find({})
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.deleteCompany = (req, res, next) => {
  Company.deleteOne({ _id: req.params._id })
    .exec()
    .then((data) => {
      res.status(200).json({ deleted: true });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.fetchCompany = (req, res, next) => {
  Company.findOne({ _id: req.body._id })
    .sort({ createdAt: -1 })
    .skip(req.body.startRange)
    .limit(req.body.limitRange)
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.addLocation = (req, res, next) => {
  console.log("req.body", req.body);
  var locationdetails = req.body.locationDetails;

  insertLocationdetails();
  async function insertLocationdetails() {
    var getData = await fetchLocData(req.body._id, locationdetails);
    console.log("getData", getData);
    if (getData.length > 0) {
      res.status(200).json({ duplicated: true });
    } else {
      Company.updateOne(
        { _id: req.body._id },
        {
          $push: { locations: locationdetails },
        }
      )
        .exec()
        .then((data) => {
          console.log("data", data);
          if (data.nModified == 1) {
            res.status(200).json({ created: true });
          } else {
            res.status(401).json({ created: false });
          }
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    }
  }
};

function fetchLocData(_id, locationdetails) {
  return new Promise((resolve, reject) => {
    Company.find(
      {
        _id: _id,
        "locations.locationType": locationdetails.locationType,
        "locations.addressLine1": locationdetails.addressLine1,
      },
      { "locations.$": 1 }
    )
      .exec()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(0);
      });
  });
}

exports.singleLocation = (req, res, next) => {
  Company.find(
    { _id: req.body._id, "locations._id": req.body.locationID },
    { "locations.$": 1 }
  )
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.updateSingleLocation = (req, res, next) => {
  var locationdetails = req.body.locationDetails;

  Company.updateOne(
    { _id: req.body._id, "locations._id": req.body.locationID },
    {
      $set: {
        "locations.$.locationType": locationdetails.locationType,
        "locations.$.branchCode": locationdetails.branchCode,
        "locations.$.addressLine1": locationdetails.addressLine1,
        "locations.$.addressLine2": locationdetails.addressLine2,
        "locations.$.countryCode": locationdetails.countryCode,
        "locations.$.country": locationdetails.country,
        "locations.$.stateCode": locationdetails.stateCode,
        "locations.$.state": locationdetails.state,
        "locations.$.district": locationdetails.district,
        "locations.$.city": locationdetails.city,
        "locations.$.area": locationdetails.area,
        "locations.$.pincode": locationdetails.pincode,
        "locations.$.latitude": locationdetails.latitude,
        "locations.$.longitude": locationdetails.longitude,
      },
    }
  )
    .exec()
    .then((data) => {
      if (data.nModified == 1) {
        res.status(200).json({ updated: true });
      } else {
        res.status(200).json({ updated: false });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.deleteLocation = (req, res, next) => {
  Company.updateOne(
    { _id: req.params._id },
    {
      $pull: { locations: { _id: req.params.locationID } },
    }
  )
    .exec()
    .then((data) => {
      if (data.nModified == 1) {
        res.status(200).json({ deleted: true });
      } else {
        res.status(401).json({ deleted: false });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.addContact = (req, res, next) => {
  console.log("req.body", req.body);
  var contactdetails = req.body.contactDetails;
  Company.find({
    "contactPersons.email": contactdetails.email,
    "contactPersons._id": { $ne: req.body._id },
  })
    .then((datas) => {
      console.log("datas", datas);
      if (datas.length > 0) {
        res.status(200).json({ duplicated: true });
      } else {
        console.log("contactdetails", contactdetails);
        Company.updateOne(
          { _id: req.body._id },
          {
            $push: { contactPersons: contactdetails },
          }
        )
          .exec()
          .then((data) => {
            console.log("data patch", data);
            if (data.nModified == 1) {
              res.status(200).json({ created: true });
            } else {
              res.status(200).json({ created: false });
            }
          })
          .catch((err) => {
            // console.log("err------------------",err)
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.singleContact = (req, res, next) => {
  Company.findOne(
    { _id: req.body._id, "contactPersons._id": req.body.contactID },
    { "contactPersons.$": 1 }
  )
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.updateSingleContact = (req, res, next) => {
  var contactdetails = req.body.contactDetails;
  console.log("contactdetails", contactdetails, contactdetails.createUser);
  Company.find({
    "contactPersons.email": contactdetails.email,
    _id: { $ne: req.body._id },
    "contactPersons._id": { $ne: req.body.contactID },
  })
    .then((datas) => {
      if (datas.length > 0) {
        res.status(200).json({ duplicated: true });
      } else {
        Company.updateOne(
          { _id: req.body._id, "contactPersons._id": req.body.contactID },
          {
            $set: {
              "contactPersons.$.branchName": contactdetails.branchName,
              "contactPersons.$.firstName": contactdetails.firstName,
              "contactPersons.$.middleName": contactdetails.middleName,
              "contactPersons.$.lastName": contactdetails.lastName,
              "contactPersons.$.phone": contactdetails.phone,
              "contactPersons.$.altPhone": contactdetails.altPhone,
              "contactPersons.$.whatsappNo": contactdetails.whatsappNo,
              "contactPersons.$.email": contactdetails.email,
              "contactPersons.$.designation": contactdetails.designation,
            },
          }
        )
          .exec()
          .then((data) => {
            if (data.nModified == 1) {
              res.status(200).json({ updated: true });
            } else {
              res.status(200).json({ updated: false });
            }
          })
          .catch((err) => {
            res.status(500).json({ error: err });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.deleteContact = (req, res, next) => {
  Company.updateOne(
    { _id: req.params._id },
    {
      $pull: { contactPersons: { _id: req.params.contactID } },
    }
  )
    .exec()
    .then((data) => {
      if (data.nModified == 1) {
        res.status(200).json({ deleted: true });
      } else {
        res.status(200).json({ deleted: false });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};
exports.deleteService = (req, res, next) => {
  Company.updateOne(
    { _id: req.params._id },
    {
      $pull: { contactPersons: { _id: req.params.contactID } },
    }
  )
    .exec()
    .then((data) => {
      if (data.nModified == 1) {
        res.status(200).json({ deleted: true });
      } else {
        res.status(200).json({ deleted: false });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.addSocialMedia = (req, res, next) => {
  console.log("req", req.body, req.params._id);
  Company.updateOne(
    { _id: req.params._id },
    {
      $set: {
        "socialMedia.facebook": req.body.facebook,
        "socialMedia.instagram": req.body.instagram,
        "socialMedia.twitter": req.body.twitter,
        "socialMedia.linkedIn": req.body.linkedIn,
        "socialMedia.youTube": req.body.youTube,
      },
    }
  )
    .exec()
    .then((data) => {
      console.log("data", data);
      res.status(200).json({ created: true, companyID: data._id });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.addAbout = (req, res, next) => {
  console.log("req", req.body);
  Company.updateOne(
    { _id: req.params._id },
    {
      $set: {
        "about.info": req.body.about,
      },
    }
  )
    .exec()
    .then((data) => {
      res.status(200).json({ created: true, companyID: data._id });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};
exports.addServices = (req, res, next) => {
  var services = req.body.services;
  console.log("services  401", services);
  insertServices();
  async function insertServices() {
    var getData = await fetchServicesData(req.body._id, services);
    console.log("getData", getData);
    if (getData.length > 0) {
      res.status(200).json({ duplicated: true });
    } else {
      Company.updateOne(
        { _id: req.body._id },
        {
          $set: { services: services },
        }
      )
        .exec()
        .then((data) => {
          console.log("data", data);
          if (data.nModified == 1) {
            res.status(200).json({ created: true });
          } else {
            res.status(401).json({ created: false });
          }
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    }
  }
};
function fetchServicesData(_id, services) {
  return new Promise((resolve, reject) => {
    Company.find({ _id: _id, services: services }, { "services.$": 1 })
      .exec()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(0);
      });
  });
}
