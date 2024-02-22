const mongoose                   = require("mongoose");
var ObjectID                     =  require("mongodb").ObjectID;
const AppointmentSlots           = require("../appointmentSlots/model");
const moment                     = require("moment");
const Users                      = require("../userManagementnew/ModelUsers.js");
const sendEmail                  = require("../common/email-service");
const globalVariable             = require("../../../nodemonConfig");
const smsService                 = require("../common/sms-service");
const BusinessSubCategoryMaster  = require('../masterBusinessSubCategory/Model');
const BusinessCategoryMaster     = require('../masterBusinessCategory/Model');
const { sendNotification }       =   require("../common/globalFunctions");
const { filter }                 = require("underscore");
const Enterprise                 = require('../enterprise/model');
const ModelUsers                 = require("../userManagementnew/ModelUsers.js");

exports.getConsultantList = (req, res, next) => {
   Users.find({
    roles: "consultant",
    isProfileReady : true,
    // approvalStatus: { $in: [null, "Pending", "Rejected"] },
   })
   .sort({createdAt : -1})
   .populate("profile.company_id")
   .then((response) => {
      const consultants = response.map((consultant, index) => {
         // console.log("consultant?.profile?.isdCode",consultant?.profile?.isdCode)
         // console.log("consultant?.profile?.mobile",consultant?.profile?.mobile)
         // console.log("consultant",consultant)
        return {
          srNo: index + 1,
          enterpriseName: consultant?.profile?.company_id?.enterpriseName,
          address: consultant?.profile?.company_id?.address?.addressLine,
          consultantName: consultant?.profile?.fullName,
          approvalStatus: consultant?.approvalStatus,
          approvalDate: consultant?.approvalLog.slice(-1)[0]?.updatedAt
            ? moment(consultant?.approvalLog.slice(-1)[0]?.updatedAt).format(
              "DD/MM/YYYY"
            )
            : "Not available",
          remark: consultant?.approvalLog.slice(-1)[0]?.reason ?? "None",
          phoneNumber: consultant?.profile?.isdCode ?  consultant?.profile?.isdCode + consultant?.profile?.mobile : (91+consultant?.profile?.mobile),
          emailAddress: consultant?.profile?.email,
          registrationDate: moment(consultant.createdAt).format("DD/MM/YYYY"),
          consultant_id: consultant._id,
          ...consultant
        };
      });
      // console.log("consultants",consultants)
      res
        .status(200)
        .json({ data: consultants, dataCount: consultants.length });
    });
};

exports.getEnterpriseList = (req, res, next) => {
   Enterprise.find({
    // approvalStatus: { $in: [null, "Pending", "Rejected"] },
   })
      .sort({createdAt : -1})
      .populate("createdBy")
      .then((response) => {
      const enterprises = response.map((enterprise, index) => {
        return {
          srNo: index + 1,
          enterpriseName: enterprise.enterpriseName,
          address: enterprise?.address?.addressLine,
          consultantName: enterprise.createdBy?.profile?.fullName,
          approvalStatus: enterprise?.approvalStatus,
          approvalDate: enterprise?.approvalLog.slice(-1)[0]?.updatedAt
            ? moment(enterprise?.approvalLog.slice(-1)[0]?.updatedAt).format(
              "DD/MM/YYYY"
            )
            : "Not available",
          remark: enterprise?.approvalLog.slice(-1)[0]?.reason ?? "None",
          phoneNumber: enterprise?.createdBy?.profile?.isdCode ?  enterprise?.createdBy?.profile?.isdCode + enterprise?.createdBy?.profile?.mobile : (91+enterprise?.createdBy?.profile?.mobile),
          // phoneNumber: enterprise?.createdBy?.profile?.mobile,
          emailAddress: enterprise?.createdBy?.profile?.email,
          registrationDate: moment(enterprise.createdAt).format("DD/MM/YYYY"),
          enterprise_id: enterprise._id,
          ...enterprise
        };
      });

      res
        .status(200)
        .json({ data: enterprises, dataCount: enterprises.length });
    });
};



exports.setConsultantApproval = (req, res, next) => {
   if(req.body.status==="Approved"){
      var eventName ='Profile Approved by Admin'
   }else{
      var eventName ='Profile Rejected by Admin'
   }
   Users.updateOne(
      { _id: ObjectID(req.body.consultant_id) },
      {
         $set: {
            approvalStatus: req.body.status,
         },
         $push: {
            approvalLog: {
             status: req.body.status,
             updatedAt: Date.now(),
             updatedBy: "Admin",
             reason: req.body.remark,
            },
         },
      }
   )
      .exec()
      .then((data) => {
         if (data.nModified == 1) {
            console.log("globalVariable.websiteName",globalVariable.websiteName)
            sendNotification({
               toEmail: req.body.email,
               toMobileNumber: req.body.phoneNumber,
               event:eventName,
               toUserRole: "consultant",
               variables: { 
                  UserFullName         : req.body.consultantName, 
                  status               : req.body.status, 
                  ProfileRejectReason1 : req.body.remark ?? 'None',
                  inviteConsultantLink : globalVariable.websiteName+"/consultant/invite-consultants"
               },
            });
            res.status(200).json({ success: true, status:req.body.status, consultant_name: req.body.consultantName});
         } else {
            res.status(200).json({ success: false });
         }
    });
};


exports.setEnterpriseApproval = (req, res, next) => {
   if(req.body.status==="Approved"){
      var eventName ='Profile Approved by Admin'
   }else{
      var eventName ='Profile Rejected by Admin'
   }
   Enterprise.updateOne(
    { _id: ObjectID(req.body.enterprise_id) },
    {
      $set: {
        approvalStatus: req.body.status,
      },
      $push: {
        approvalLog: {
          status: req.body.status,
          updatedAt: Date.now(),
          updatedBy: "Admin",
          reason: req.body.remark,
        },
      },
    }
   )
   .exec()
   .then((data) => {
      if (data.nModified == 1) {
         sendNotification({
            toEmail: req.body.email,
            toMobileNumber: req.body.phoneNumber,
            event: eventName,
            toUserRole: "consultant",
            variables: { 
               UserFullName: req.body.consultantName, 
               status: req.body.status, 
               ProfileRejectReason1: req.body.remark ?? 'None' ,
            },
        });
        res.status(200).json({ success: true, status:req.body.status});
      } else {
        res.status(200).json({ success: false });
      }
    });
};


   
exports.getConsultantSubCategoryListOld = async (req, res, next) => {
   const businessSubCategoryMaster = await BusinessSubCategoryMaster.find({})
   const busSubCatgArray = businessSubCategoryMaster.map(a =>{return {'businessSubCategory': a.businessSubCategory}} );
   console.log("getConsultantSubCategoryList busSubCatgArray => ",busSubCatgArray.length);

   Users.find()
      .sort({createdAt : -1})
      .populate("profile.company_id")
      .then(consultants => {
      console.log("consultants",consultants.length)

         const consultantDataList = consultants.flatMap(consultant => {
            return consultant.catg_subCatg_expertise
               .flatMap(subC => subC.subCategory.map(subC1 => {
                  return {
                     _id: consultant._id,
                     email: consultant.profile.email,
                     name: consultant.profile.fullName,
                     subCategory: subC1.businessSubCategory,
                     category: subC.category,
                     enterpriseName: consultant.profile?.company_id?.enterpriseName
                  }
               }))
         }) 
         console.log("consultantDataList",consultantDataList.length)

         var consultantSubCategoryList  = consultantDataList.filter(o=> !busSubCatgArray.some(i=> i.businessSubCategory === o.subCategory));
         console.log("getConsultantSubCategoryList consultantSubCategoryList => ",consultantSubCategoryList.length );

         res.status(200).json({ success: true, data: consultantSubCategoryList })
      }
    )
};    
exports.getConsultantSubCategoryList = async (req, res, next) => {
   Users.find(
      {roles:"consultant",approvalStatus:"Approved"},
      {profile:1, subcatgApprovalLog : 1}
   )
   .sort({createdAt : -1})
   .populate("profile.company_id")
   .then(consultants => {
      console.log("consultants",consultants.length);
      var resConSubCatg = [];
      for(var i=0; i<consultants.length; i++){
         for(var j=0;j<consultants[i].subcatgApprovalLog.length;j++){
         // console.log("consultants[i].subcatgApprovalLog[j]",consultants[i].subcatgApprovalLog[j]);
            resConSubCatg.push({
               id             : consultants[i]._id,
               email          : consultants[i].profile.email,
               phoneNumber    : consultants[i]?.profile?.isdCode ?  consultants[i]?.profile?.isdCode + consultants[i]?.profile?.mobile : (91+consultants[i]?.profile?.mobile),
               // phoneNumber    : consultants[i].profile.mobile,
               name           : consultants[i].profile.fullName,
               enterpriseName : consultants[i].profile.company_id.enterpriseName,
               subCategory    : consultants[i].subcatgApprovalLog[j].subCategory,
               category       : consultants[i].subcatgApprovalLog[j].mainCategory,
               category_id    : consultants[i].subcatgApprovalLog[j].mainCategory_id,
               status         : consultants[i].subcatgApprovalLog[j].status,
               remark         : consultants[i].subcatgApprovalLog[j].remark,
            })
            // console.log("resConSubCatg",resConSubCatg,i,consultants.length);
         }
      }

      if(i>=consultants.length){
         res.status(200).json({ success: true, data: resConSubCatg })
      }
   })
   .catch(error =>{
      console.log("updateUserSubCategoryLog Error => ",error);
      res.status(500).json({message:"Some error occured during getConsultantSubCategoryCategoryList ", error:error, success: false });
   });

};   
exports.getEnterpriseSubCategoryList = async (req, res, next) => {
   Enterprise.find(
      {approvalStatus:"Approved"},
   )
   .sort({createdAt : -1})
   .then(async enterprises => {
      // console.log("enterprises => ",enterprises);
      var enterpriseDataList = [];

      for(var i=0; i<enterprises.length; i++){
         // console.log("enterprises[i].subcatgApprovalLog => ",enterprises[i].subcatgApprovalLog);

         for(var j=0;j<enterprises[i].subcatgApprovalLog.length;j++){
            var consultant = await getConsultantDetailsforMail(enterprises[i]._id)
            // console.log("consultant => ",consultant);
            // console.log("enterprises[i].subcatgApprovalLog[j]",enterprises[i].subcatgApprovalLog[j]);
            enterpriseDataList.push({
               id                   : consultant?.data?._id,
               email                : consultant?.data?.profile.email,
               phoneNumber          : consultant?.data?.profile?.isdCode ?  consultant?.data?.profile?.isdCode + consultant?.data?.profile?.mobile : (91+consultant?.data?.profile?.mobile),
               // phoneNumber          : consultant?.data?.profile.mobile,
               consultantName       : consultant?.data?.profile.fullName,
               category             : enterprises[i].subcatgApprovalLog[j].mainCategory,
               category_id          : enterprises[i].subcatgApprovalLog[j].mainCategory_id,
               subCategory          : enterprises[i].subcatgApprovalLog[j].subCategory,
               status               : enterprises[i].subcatgApprovalLog[j].status,
               remark               : enterprises[i].subcatgApprovalLog[j].remark,
               name                 : enterprises[i].enterpriseName,
               enterprise_id        : enterprises[i]._id,
            })
            // console.log("enterpriseDataList",enterpriseDataList,i);
         }      
      }

      if(i>=enterprises.length){
         res.status(200).json({ success: true, data: enterpriseDataList })
      }
   })
   .catch(error =>{
      console.log(" Error => ",error);
      res.status(500).json({error:error, success: false });
   });
};   
exports.getEnterpriseSubCategoryListOld = async (req, res, next) => {
   const businessSubCategoryMaster = await BusinessSubCategoryMaster.find({})
   const busSubCatgArray = businessSubCategoryMaster.map(a =>{return {'businessSubCategory': a.businessSubCategory}} );
   console.log("getConsultantSubCategoryList busSubCatgArray => ",busSubCatgArray.length);

   Enterprise.find()
      .sort({createdAt : -1})
      .then(
        enterprises => {
            console.log("enterprises",enterprises.length);

            const enterpriseDataList = enterprises
            .flatMap(enterprise => enterprise.catg_subCatg_expertise
              .filter(e => e.subCategory)
              .flatMap(e => e.subCategory.map(ex => {
                return {
                  id: enterprise._id,
                  name: enterprise.enterpriseName,
                  subCategory: ex.businessSubCategory,
                  category: e.category

                }
              })))

            console.log("enterpriseDataList",enterpriseDataList.length)
            var enterpriseSubCategoryList  = enterpriseDataList.filter(o=> !busSubCatgArray.some(i=> i.businessSubCategory === o.subCategory));
            console.log("enterpriseSubCategoryList => ",enterpriseSubCategoryList.length ,enterpriseSubCategoryList);

            res.status(200).json({ success: true, data: enterpriseSubCategoryList, diff: { ...businessSubCategoryMaster.map(b => b.businessSubCategory) } })
        })
};
exports.getConsultantExpertiseCategoryListOld = async (req, res, next) => {

   const businessCategoryMaster = await BusinessCategoryMaster.find({})
   const busCatgArray = businessCategoryMaster.map(a =>{return {'businessExpertise': a.businessExpertise}} );
   console.log("businessCategoryMaster",businessCategoryMaster)
   Users.find()
      .sort({createdAt : -1})
      .populate("profile.company_id")
      .then(
      consultants => {
         console.log("consultants",consultants.length)

         const consultantDataList = consultants.flatMap(consultant => {
            return consultant.catg_subCatg_expertise
            .filter(cat => cat.expertise)
            .flatMap(cat => cat.expertise.map(cat1 => {
              return {
                  id: consultant._id,
                  email: consultant.profile.email,
                  phoneNumber: consultant.profile.mobile,
                  name: consultant.profile.fullName,
                  expertiseCategory: cat1.expertise,
                  category: cat.category,
                  category_id: cat.category_id,
                  enterpriseName: consultant.profile?.company_id?.enterpriseName
               }
            }))
         })
         console.log("consultantDataList",consultantDataList.length);
         var consultantExpertiseCategoryList  = consultantDataList.filter(o=> !businessCategoryMaster.some(i=> i.businessExpertise === o.expertiseCategory));
         console.log("consultantExpertiseCategoryList",consultantExpertiseCategoryList.length);

         res.status(200).json({ success: true, data: consultantExpertiseCategoryList })
      }
    )
};
exports.getEnterpriseExpertiseCategoryListOld = async (req, res, next) => {
   const businessCategoryMaster = await BusinessCategoryMaster.find({})
   // console.log(businessCategoryMaster);
      Enterprise.find({
         'catg_subCatg_expertise.expertise.expertise': { $nin: businessCategoryMaster.flatMap(b => b.businessExpertise), $exists: true }
      })
      .sort({createdAt : -1})
      .then(enterprises => {
        const enterpriseDataList = enterprises
          .flatMap(enterprise => enterprise.catg_subCatg_expertise
            .filter(e => e.expertise)
            .flatMap(e => e.expertise.map(ex => {
              return {
                id: enterprise._id,
                name: enterprise.enterpriseName,
                expertise: ex.expertise,
                category: e.category,
                status: enterprises.status
              }
            })))
        res.status(200).json({ success: true, data: enterpriseDataList })
      })
      .catch(error =>{
         console.log(" Error => ",error);
         res.status(500).json({error:error, success: false });
      });
}
exports.getConsultantExpertiseCategoryList = async (req, res, next) => {

   Users.find(
         {roles:"consultant",approvalStatus:"Approved"},
         {profile:1, expertiseApprovalLog : 1}
      )
      .sort({createdAt : -1})
      .populate("profile.company_id")
      .then(consultants => {

         var resConExp = [];

         for(var i=0; i<consultants.length; i++){
            for(var j=0;j<consultants[i].expertiseApprovalLog.length;j++){
               resConExp.push({
                  id          : consultants[i]._id,
                  email       : consultants[i].profile.email,
                  phoneNumber : consultants[i]?.profile?.isdCode ?  consultants[i]?.profile?.isdCode + consultants[i]?.profile?.mobile : (91+consultants[i]?.profile?.mobile),
                  // phoneNumber : consultants[i].profile.mobile,
                  name        : consultants[i].profile.fullName,
                  category    : consultants[i].expertiseApprovalLog[j].mainCategory,
                  category_id : consultants[i].expertiseApprovalLog[j].mainCategory_id,
                  expertise   : consultants[i].expertiseApprovalLog[j].expertise,
                  status      : consultants[i].expertiseApprovalLog[j].status,
                  remark      : consultants[i].expertiseApprovalLog[j].remark,
                  enterpriseName : consultants[i].profile.company_id.enterpriseName,
               })
            }
         }

         if(i>=consultants.length){
            res.status(200).json({ success: true, data: resConExp })
         }

      })
      .catch(error =>{
         console.log("updateUserExpertiseLog Error => ",error);
         res.status(500).json({message:"Some error occured during getConsultantExpertiseCategoryList ", error:error, success: false });
      });
};
exports.getEnterpriseExpertiseCategoryList = async (req, res, next) => {
   Enterprise.find(
      {approvalStatus:"Approved"},
   )
   .sort({createdAt : -1})
   .then(async enterprises => {
      // console.log("enterprises => ",enterprises);

      var enterpriseDataList = [];

      for(var i=0; i<enterprises.length; i++){
         for(var j=0;j<enterprises[i].expertiseApprovalLog.length;j++){
            var consultant = await getConsultantDetailsforMail(enterprises[i]._id)
            // console.log("consultant => ",consultant);
            console.log("enterprises[i].expertiseApprovalLog[j]",enterprises[i].expertiseApprovalLog[j]);
            enterpriseDataList.push({
               id          : consultant?.data?._id,
               email       : consultant?.data?.profile?.email,
               // phoneNumber : consultant?.data?.profile?.mobile,
               phoneNumber : consultant?.data?.profile?.isdCode ?  consultant?.data?.profile?.isdCode + consultant?.data?.profile?.mobile : (91+consultant?.data?.profile?.mobile),
               name        : consultant?.data?.profile?.fullName,
               category    : enterprises[i].expertiseApprovalLog[j].mainCategory,
               category_id : enterprises[i].expertiseApprovalLog[j].mainCategory_id,
               expertise   : enterprises[i].expertiseApprovalLog[j].expertise,
               status      : enterprises[i].expertiseApprovalLog[j].status,
               remark      : enterprises[i].expertiseApprovalLog[j].remark?enterprises[i].expertiseApprovalLog[j].remark:"",
               enterpriseName  : enterprises[i].enterpriseName,
               enterprise_id  : enterprises[i]._id,
            })
         }
      }

      if(i>=enterprises.length){
         // console.log("enterpriseDataList => ",enterpriseDataList);

         res.status(200).json({ success: true, data: enterpriseDataList })
      }
   })
   .catch(error =>{
      console.log(" Error => ",error);
      res.status(500).json({error:error, success: false });
   });
}


exports.setConsultantSubCategory = async (req, res, nxt) => {
  const user = await ModelUsers.find({ 'roles': 'admin' })
  const busignessCategory = await BusinessCategoryMaster.findOne({ businessCategory: req.body.category })
  if (req.body.status != 'Approved') {
    Users.updateOne(
      { _id: ObjectID(req.body.consultant_id) },
      {
        $set: {
          approvalStatus: req.body.status,
        },
        $push: {
          subcatgApprovalLog: 
            {
              subCategory       : req.body.subCategory,
              mainCategory      : req.body.category,
              status            : req.body.status,
              adminActionDate   : Date.now(),
              remark            : req.body.remark,
            }
        },
        $pull: { 
          'catg_subCatg_expertise.$[].subCategory': { businessSubCategory: req.body.subCategory } 
        },
      },
    )
    .then((data) => {
        // console.log("data1",data);
      if (data.nModified == 1) {
        sendNotification({
          toEmail: req.body.email,
          toMobileNumber: req.body.phoneNumber,
          event: 'Other Sub-Category Approval',
          toUserRole: "consultant",
          variables: { consultant_name: req.body.consultantName, status: req.body.status, remark: req.body.remark ?? 'None' },
        });
        res.status(200).json({ success: true });
      } else {
        res.status(200).json({ success: false });
      }
    })
  } else {
    // console.log("req.body.status2",req.body.status)
    User
    .updateOne(
      { _id: ObjectID(req.body.consultant_id) },
      
      {
        $set: {
          approvalStatus: req.body.status,
        },
        $push: {
          approvalLog: {
            status: req.body.status,
            updatedAt: Date.now(),
            updatedBy: "Admin",
            reason: req.body.remark,
          },
        },
       
      },
    )
    .then((data) => {
      // console.log("data2",data);
      if (data.nModified == 1) {
        BusinessSubCategoryMaster.updateOne(
          { businessCategoryId: ObjectID(busignessCategory?._id) },
          {
            businessSubCategory: req.body.subCategory,
            createdBy: Users._id
          },
          { upsert: true }
        ).then(data => {

          // console.log("data3",data);
          res.status(200).json({ data: {}, success: true })
        })
      } else {
        res.status(404).json({ success: false });
      }
    })
  }
}

exports.setConsultantExpertiseCategory = (req, res, nxt) => {
  // console.log(req.body);
  const user = ModelUsers.find({ 'roles': 'admin' })

  if (req.body.status != 'Approved') {
    User
      .updateOne(
        { _id: ObjectID(req.body.consultant_id) },
        {
          $pull: { 'catg_subCatg_expertise.$[].expertise': { expertise: req.body.expertiseCategory } },
        },
        { multi: true }
      )
      .then(ent => {
        res.json({ data: {}, success: true })
      })
  } else {
    BusinessCategoryMaster.updateOne(
      { businessCategory: req.body.category },
      {
        $addToSet: { businessExpertise: req.body.expertiseCategory },
        createdBy: Users._id
      },
      { upsert: true }
    ).then(data => {

      // console.log(data);
      res.json({ data: {}, success: true })
    })

  }
}

exports.setEnterpriseSubCategory = async (req, res, nxt) => {
  const user = await ModelUsers.find({ 'roles': 'admin' })
  const busignessCategory = await BusinessCategoryMaster.findOne({ businessCategory: req.body.category })
  // console.log(busignessCategory);


  if (req.body.status != 'Approved') {
    Enterprise
      .updateOne(
        { _id: ObjectID(req.body.enterprise_id) },
        {
          $pull: { 'catg_subCatg_expertise.$[].subCategory': { businessSubCategory: req.body.subCategory } },
        },
        { multi: true }
      )
      .then(ent => {
        res.status(200).json({ data: {}, success: true })
      })
  } else {
    BusinessSubCategoryMaster.updateOne(
      { businessCategoryId: ObjectID(busignessCategory?._id) },
      {
        businessSubCategory: req.body.subCategory,
        createdBy: Users._id
      },
      { upsert: true }
    ).then(data => {

      // console.log(data);
      res.status(200).json({ data: {}, success: true })
    })
  }
}

exports.setEnterpriseExpertiseCategory = async (req, res, nxt) => {

  const user = ModelUsers.find({ 'roles': 'admin' })

  if (req.body.status != 'Approved') {
    Enterprise
      .updateOne(
        { _id: ObjectID(req.body.enterprise_id) },
        {
          $pull: { 'catg_subCatg_expertise.$[].expertise': { expertise: req.body.expertiseCategory } },
        },
        { multi: true }
      )
      .then(ent => {
        res.json({ data: {}, success: true })
      })
  } else {
    BusinessCategoryMaster.updateOne(
      { businessCategory: req.body.category },
      {
        $addToSet: { businessExpertise: req.body.expertiseCategory },
        createdBy: Users._id
      },
      { upsert: true }
    ).then(data => {

      // console.log(data);
      res.json({ data: {}, success: true })
    })

  }
}

exports.updateConsOthersSubcatg = async (req, res, nxt) => {
   var subcatgArr = req.body.subcatg.split(",");
   var mainCatg = req.body.mainCategoryText;
   var mainCatg_id = req.body.mainCategory_id;
   var user_id = req.body.user_id;


   for(var i=0; i<subcatgArr.length;i++){
      var subcatgLog = await updateUserSubcatgLog(subcatgArr[i].trim(),mainCatg,mainCatg_id,user_id);

      if(!subcatgLog.success){
         break;         
         res.status(500).json({message : "Some error occured during subcatgLog update",error:error,success:false})
      }
   }

   if(i>=subcatgArr.length){
      res.status(200).json({message : "Others subcatg added to Users profile",success:true})
   }   
}
function updateUserSubcatgLog(subcatg,mainCategoryText,mainCategory_id,user_id){

   return new Promise((resolve,reject)=>{
      Users.updateOne(
         { _id: ObjectID(user_id) },
         {
            $push:{
               subcatgApprovalLog: 
               {
                  subCategory       : subcatg,
                  mainCategory      : mainCategoryText,
                  mainCategory_id   : mainCategory_id,
                  userActionDate    : new Date(),
                  status            : "Pending",
               },
            }
         },
      )
      .then(updateLog => {
         resolve({ updateLog:updateLog, success: true });
      })
      .catch(error =>{
         // console.log("updateUserExpertiseLog Error => ",error);
         resolve({ error:error, success: false });
      });
   });
}

exports.updateConsOthersExpertise = async (req, res, nxt) => {
   var expertiseArr = req.body.expertise.split(",");
   var mainCatg = req.body.mainCategoryText;
   var mainCatg_id = req.body.mainCategory_id;
   var user_id = req.body.user_id;


   for(var i=0; i<expertiseArr.length;i++){
      var expLog = await updateUserExpertiseLog(expertiseArr[i].trim(),mainCatg,mainCatg_id,user_id);
      // console.log("updateConsOthersExpertise expLog => ",expLog);

      if(!expLog.success){
         break;         
         res.status(500).json({message : "Some error occured during expertiseLog update",error:error,success:false})
      }
   }

   if(i>=expertiseArr.length){
      res.status(200).json({message : "Others expertise added to Users profile",success:true})
   }   
}
function updateUserExpertiseLog(expertise,mainCategoryText,mainCategory_id,user_id){

   return new Promise((resolve,reject)=>{
      Users.updateOne(
         { _id: ObjectID(user_id) },
         {
            $push:{
               expertiseApprovalLog: 
               {
                  expertise         : expertise,
                  mainCategory      : mainCategoryText,
                  mainCategory_id   : mainCategory_id,
                  userActionDate    : new Date(),
                  status            : "Pending",
               },
            }
         },
      )
      .then(updateLog => {
         resolve({ updateLog:updateLog, success: true });
      })
      .catch(error =>{
         // console.log("updateUserExpertiseLog Error => ",error);
         resolve({ error:error, success: false });
      });
   });
}


exports.updateEntpOthersSubcatg = async (req, res, nxt) => {
   var subcatgArr    = req.body.subcatg.split(",");
   var mainCatg      = req.body.mainCategoryText;
   var mainCatg_id   = req.body.mainCategory_id;
   var enterprise_id = req.body.enterprise_id;


   for(var i=0; i<subcatgArr.length;i++){
      var subcatgLog = await updateEntpSubcatgLog(subcatgArr[i].trim(),mainCatg,mainCatg_id,enterprise_id);

      if(!subcatgLog.success){
         break;         
         res.status(500).json({message : "Some error occured during subcatgLog update",error:error,success:false})
      }
   }

   if(i>=subcatgArr.length){
      res.status(200).json({message : "Others SubCategory added to Enterprise profile",success:true})
   }   
}
function updateEntpSubcatgLog(subcatg,mainCategoryText,mainCategory_id,enterprise_id){

   return new Promise((resolve,reject)=>{
      Enterprise.updateOne(
         { _id: ObjectID(enterprise_id) },
         {
            $push:{
               subcatgApprovalLog: 
               {
                  subCategory       : subcatg,
                  mainCategory      : mainCategoryText,
                  mainCategory_id   : mainCategory_id,
                  userActionDate    : new Date(),
                  status            : "Pending",
               },
            }
         },
      )
      .then(updateLog => {
         resolve({ updateLog:updateLog, success: true });
      })
      .catch(error =>{
         // console.log("updateUserExpertiseLog Error => ",error);
         resolve({ error:error, success: false });
      });
   });
}

exports.updateEntpOthersExpertise = async (req, res, nxt) => {
   var expertiseArr  = req.body.expertise.split(",");
   var mainCatg      = req.body.mainCategoryText;
   var mainCatg_id   = req.body.mainCategory_id;
   var enterprise_id = req.body.enterprise_id;


   for(var i=0; i<expertiseArr.length;i++){
      var expLog = await updateEntpExpertiseLog(expertiseArr[i].trim(),mainCatg,mainCatg_id,enterprise_id);
      // console.log("updateEntpExpertiseLog expLog => ",expLog);

      if(!expLog.success){
         break;         
         res.status(500).json({message : "Some error occured during expertiseLog update",error:error,success:false})
      }
   }

   if(i>=expertiseArr.length){
      res.status(200).json({message : "Others expertise added to Enterprise profile",success:true})
   }   
}
function updateEntpExpertiseLog(expertise,mainCategoryText,mainCategory_id,enterprise_id){

   return new Promise((resolve,reject)=>{
      Enterprise.updateOne(
         { _id: ObjectID(enterprise_id) },
         {
            $push:{
               expertiseApprovalLog: 
               {
                  expertise         : expertise,
                  mainCategory      : mainCategoryText,
                  mainCategory_id   : mainCategory_id,
                  userActionDate    : new Date(),
                  status            : "Pending",
               },
            }
         },
      )
      .then(updateLog => {
         resolve({ updateLog:updateLog, success: true });
      })
      .catch(error =>{
         // console.log("updateUserExpertiseLog Error => ",error);
         resolve({ error:error, success: false });
      });
   });
}



exports.approveConsOthersExpertise = async (req, res, nxt) => {
   // console.log("approveConsOthersExpertise req.body => ",req.body);
   var selector = { 
      _id                  : ObjectID(req.body.consultant_id),
      expertiseApprovalLog : { 
         $elemMatch : {
            mainCategory   : req.body.category,
            expertise      : req.body.expertise,
            status         : "Pending"
         }
      }
   };
   var updator = {
      $set:{
         "expertiseApprovalLog.$.status" : req.body.status,
         "expertiseApprovalLog.$.remark" : req.body.remark,
         "expertiseApprovalLog.$.adminActionDate" : new Date(),
      }
   };
   if(req.body.status === "Approved"){
      BusinessCategoryMaster.find({_id   : req.body.category_id})
         .then(expData => {
            if(expData && expData.length>0){
               var expertise1  = expData[0].businessExpertise;
               var expertise2  = req.body.expertise.split(",");
               var duplicateExpertise = expertise1.some(item => expertise2.includes(item))
                
               // console.log("duplicateExpertise",duplicateExpertise)
               if (duplicateExpertise) {
                     res.status(200).json({ duplicated: true, status:req.body.status, expertise:req.body.expertise});
               }else{
                  Users.updateOne( selector, updator )
                     .then(updateLog => {
                        console.log("approveConsOthersExpertise updateLog => ",updateLog);
                        if(updateLog.nModified === 1){
                              BusinessCategoryMaster.updateOne(
                                 {_id   : req.body.category_id},
                                 {$push : {businessExpertise : req.body.expertise} },
                              )
                              .then(updatedExpt => {
                                 Users.findOne({ "_id": ObjectID(req.body.consultant_id)})
                                    .then(data => {
                                       var catArray = data.catg_subCatg_expertise
                                       for (var i = 0; i < catArray.length; i++) {
                                          if((catArray[i].category_id)===(req.body.category_id)){
                                             catArray[i].expertise = [...catArray[i].expertise,{"expertise": req.body.expertise}]
                                          }
                                       }
                                       Users.updateOne(
                                          { "_id": ObjectID(req.body.consultant_id)},
                                          {$set:{"catg_subCatg_expertise" : catArray }}
                                          )
                                       .then(updateData => {
                                          console.log("Users updateData",updateData)
                                          sendNotif("Approved","Other Expertise Approval");
                                          res.status(200).json({ updateData:data, success: true, status:req.body.status, expertise:req.body.expertise});
                                       })
                                       .catch(error =>{
                                          console.log("data Error => ",error);
                                          res.status(500).json({ error:error, success: false });
                                       });

                                    })
                                    .catch(error =>{
                                       console.log("data Error => ",error);
                                       res.status(500).json({ error:error, success: false });
                                    });      
                              })
                              .catch(error =>{
                                 console.log("BusinessCategoryMaster Update Error => ",error);
                                 res.status(500).json({ error:error, success: false });
                              });    
                        }else{
                           res.status(200).json({ message:"Status update didn't happen", success: false });
                        }
                        
                     })
                     .catch(error =>{
                        console.log(" Error => ",error);
                        res.status(500).json({ error:error, success: false });
                     });
               }
            }
         })
         .catch(error =>{
            console.log("BusinessCategoryMaster find Error => ",error);
            res.status(500).json({ error:error, success: false });
         }); 
   }else{
      Users.updateOne( selector, updator )
      .then(updateLog => {
         console.log("Rejected updateLog => ",updateLog);
         sendNotif("Rejected","Other Expertise Rejected");
         res.status(200).json({ updateData:updateLog, success: true, status:req.body.status, expertise:req.body.expertise});
      })
      .catch(error =>{
         console.log(" Error => ",error);
         res.status(500).json({ error:error, success: false });
      });
   }
   function sendNotif(status,event){
      sendNotification({
         toEmail          : req.body.email,
         toMobileNumber   : req.body.phoneNumber,
         event            : event,
         toUserRole       : "consultant",
         variables        : { 
                              UserFullName: req.body.consultantName, 
                              Expertise: req.body.expertise, 
                              MainCategory: req.body.category, 
                              status: status, 
                              remark: req.body.remark ?? 'None' 
                           },
      });         
   }
}
function getConsultantDetailsforMail(enterprise_id){
   return new Promise((resolve,reject)=>{
      Users.findOne({ "profile.company_id": ObjectID(enterprise_id) })
            .populate("profile.company_id")
      .then(getData => {
         resolve({ data:getData, success: true });
      })
      .catch(error =>{
         console.log("updateUserExpertiseLog Error => ",error);
         reject({ error:error, success: false });
      });
   });
}

exports.approveEntpOthersExpertise = async (req, res, nxt) => {
   // console.log("approveEntpOthersExpertise req.body => ",req.body);
   var consultantDetailsforMail = await getConsultantDetailsforMail(req.body.enterprise_id);
   // console.log("consultantDetailsforMail",consultantDetailsforMail)
   var selector = { 
      _id: ObjectID(req.body.enterprise_id),
      expertiseApprovalLog : { 
         $elemMatch : {
            mainCategory   : req.body.category,
            expertise      : req.body.expertise,
            status         : "Pending"
         }
      }
   };
   var updator = {
      $set:{
         "expertiseApprovalLog.$.status"           : req.body.status,
         "expertiseApprovalLog.$.remark"           : req.body.remark ? req.body.remark : "",
         "expertiseApprovalLog.$.adminActionDate"  : new Date(),
      }
   };
   if(req.body.status === "Approved"){
      BusinessCategoryMaster.find({_id   : req.body.category_id})
         .then(expData => {
            if(expData && expData.length>0){
               var expertise1  = expData[0].businessExpertise;
               var expertise2  = req.body.expertise.split(",");
               var duplicateExpertise = expertise1.some(item => expertise2.includes(item))
                
               // console.log("duplicateExpertise-",duplicateExpertise)
               if (duplicateExpertise) {
                     res.status(200).json({ duplicated: true, status:req.body.status, expertise:req.body.expertise});
               }else{
                  Enterprise.updateOne( selector, updator )
                     .then(updateLog => {
                        // console.log("approveEntpOthersExpertise updateLog => ",updateLog);
                        if(updateLog.nModified === 1){
                              BusinessCategoryMaster.updateOne(
                                 {_id   : req.body.category_id},
                                 {$push : {businessExpertise : req.body.expertise} },
                              )
                              .then(updatedExpt => {
                                 sendNotif("Approved","Other Expertise Approval");
                                 Enterprise.findOne({ "_id": ObjectID(req.body.enterprise_id)})
                                    .then(data => {
                                       var catArray = data.catg_subCatg_expertise
                                       for (var i = 0; i < catArray.length; i++) {
                                          if((catArray[i].category_id)===(req.body.category_id)){
                                             catArray[i].expertise = [...catArray[i].expertise,{"expertise": req.body.expertise}]
                                          }
                                       }
                                       Enterprise.updateOne(
                                          { "_id": ObjectID(req.body.enterprise_id)},
                                          {$set:{"catg_subCatg_expertise" : catArray }}
                                       )
                                       .then(updateData => {
                                          // console.log("Enterprise updateData======",updateData)
                                          res.status(200).json({ updateData:data, success: true, status:req.body.status, expertise:req.body.expertise});
                                       })
                                       .catch(error =>{
                                          console.log("data Error => ",error);
                                          res.status(500).json({ error:error, success: false });
                                       });

                                    })
                                    .catch(error =>{
                                       console.log("data Error => ",error);
                                       res.status(500).json({ error:error, success: false });
                                    });   
                              }) 
                              .catch(error =>{
                                 console.log("BusinessCategoryMaster Update Error => ",error);
                                 res.status(500).json({ error:error, success: false });
                              });   
                        }else{
                           res.status(200).json({ message:"Status update didn't happen", success: false });
                        }
                     })
                     .catch(error =>{
                        console.log(" Error => ",error);
                        res.status(500).json({ error:error, success: false });
                     });
               }
            }
         })
         .catch(error =>{
            console.log("BusinessCategoryMaster find Error => ",error);
            res.status(500).json({ error:error, success: false });
         }); 
   }else{
      Enterprise.updateOne( selector, updator )
         .then(updateLog => {
            sendNotif("Rejected","Other Expertise Rejected");
            res.status(200).json({ updateData:updateLog, success: true, status:req.body.status, expertise:req.body.expertise});
         })
         .catch(error =>{
            console.log(" Error => ",error);
            res.status(500).json({ error:error, success: false });
         });
   }
   function sendNotif(status,event){
      sendNotification({
         toEmail          : consultantDetailsforMail.data.profile.email,
         toMobileNumber   : consultantDetailsforMail.data.profile.phoneNumber,
         event            : event,
         toUserRole       : "consultant",
         variables        : { 
                              UserFullName: consultantDetailsforMail.data.profile.consultantName, 
                              Expertise: req.body.expertise, 
                              MainCategory: req.body.category, 
                              status: status, 
                              remark: req.body.remark ?? 'None' 
                           },
      });         
   }
}

exports.approveConsOthersSubCategory = async (req, res, nxt) => {
   // console.log("approveConsOthersSubCategory req.body => ",req.body);
   var selector = { 
      _id                  : ObjectID(req.body.consultant_id),
      subcatgApprovalLog : { 
         $elemMatch : {
            mainCategory     : req.body.category,
            subCategory      : req.body.subCategory,
            status           : "Pending"
         }
      }
   };
   var updator = {
      $set:{
         "subcatgApprovalLog.$.status" : req.body.status,
         "subcatgApprovalLog.$.remark" : req.body.remark ? req.body.remark : "",
         "subcatgApprovalLog.$.adminActionDate" : new Date(),
      }
   };
   if(req.body.status === "Approved"){

      BusinessSubCategoryMaster.find({businessCategoryId : req.body.category_id})
         .then(subData => {
            var duplicateSubCategory = subData.filter((data)=>{
               if (data.businessSubCategory.trim().toLowerCase() == req.body.subCategory.trim().toLowerCase()) {
                  return data;
               }
            })
            if (duplicateSubCategory.length > 0) {
                  res.status(200).json({duplicated: true, status:req.body.status, subCategory:req.body.subCategory});
            }else{
               Users.updateOne( selector, updator )
                  .then(updateLog => {
                     console.log("approveConsOthersSubCategory updateLog => ",updateLog);
                     if(updateLog.nModified === 1){                           
                           BusinessSubCategoryMaster.updateOne(
                              {businessCategoryId : req.body.category_id},
                              {$set : { businessSubCategory: req.body.subCategory} },
                           )
                           .then(updatedSubCatg => {
                              console.log("updatedSubCatg",updatedSubCatg)
                              sendNotif("Approved","Other Sub-Category Approval");
                              Users.findOne({ "_id": ObjectID(req.body.consultant_id)})
                                 .then(data => {
                                    var catArray = data.catg_subCatg_expertise
                                    for (var i = 0; i < catArray.length; i++) {
                                       if((catArray[i].category_id)===(req.body.category_id)){
                                          catArray[i].subCategory = [...catArray[i].subCategory,{"businessSubCategory": req.body.subCategory}]
                                       }
                                    }
                                    // console.log("catArray",catArray)
                                    Users.updateOne(
                                       { "_id": ObjectID(req.body.consultant_id)},
                                       {$set:{"catg_subCatg_expertise" : catArray }}
                                    )
                                    .then(updateData => {
                                       console.log("Users updateData=",updateData)
                                       res.status(200).json({ updateData:data, success: true, status:req.body.status, subCategory:req.body.subCategory});
                                    })
                                    .catch(error =>{
                                       console.log("data Error => ",error);
                                       res.status(500).json({ error:error, success: false });
                                    });

                                 })
                                 .catch(error =>{
                                    console.log("data Error => ",error);
                                    res.status(500).json({ error:error, success: false });
                                 });     
                           })
                           .catch(error =>{
                              console.log("BusinessSubCategoryMaster Update Error => ",error);
                              res.status(500).json({ error:error, success: false });
                           });    
                        
                     }else{
                        res.status(200).json({ message:"Status update didn't happen", success: false });
                     }
                  })
                  .catch(error =>{
                     console.log(" Error => ",error);
                     res.status(500).json({ error:error, success: false });
                  });
            }   
         })
         .catch(error =>{
            console.log("BusinessSubCategoryMaster find Error => ",error);
            res.status(500).json({ error:error, success: false });
         }); 
   }else{
      Users.updateOne( selector, updator )
         .then(updateLog => {
            console.log("Rejected updateLog => ",updateLog);
            sendNotif("Rejected","Other Sub-Category Rejected");
            res.status(200).json({ updateData:updateLog, success: true, status:req.body.status, subCategory:req.body.subCategory});
         })
         .catch(error =>{
            console.log(" Error => ",error);
            res.status(500).json({ error:error, success: false });
         });
   } 

      function sendNotif(status,event){
         sendNotification({
            toEmail          : req.body.email,
            toMobileNumber   : req.body.phoneNumber,
            event            : event,
            toUserRole       : "consultant",
            variables        : { 
                                 UserFullName: req.body.consultantName, 
                                 SubCategory: req.body.subCategory, 
                                 MainCategory: req.body.category, 
                                 status: status, 
                                 remark: req.body.remark ?? 'None' 
                              },
         });         
      }
}
exports.approveEntpOthersSubCategory = async (req, res, nxt) => {
   // console.log("approveEntpOthersSubCategorytrty req.body => ",req.body);
   var consultantDetailsforMail = await getConsultantDetailsforMail(req.body.enterprise_id);
   // console.log("consultantDetailsforMail",consultantDetailsforMail)
   var selector = { 
      _id: ObjectID(req.body.enterprise_id),
      subcatgApprovalLog : { 
         $elemMatch : {
            mainCategory     : req.body.category,
            subCategory      : req.body.subCategory,
            status           : "Pending"
         }
      }
   };
   var updator = {
      $set:{
         "subcatgApprovalLog.$.status"           : req.body.status,
         "subcatgApprovalLog.$.remark"           : req.body.remark ? req.body.remark : "",
         "subcatgApprovalLog.$.adminActionDate"  : new Date(),
      }
   };
   if(req.body.status === "Approved"){
      BusinessSubCategoryMaster.find({businessCategoryId : req.body.category_id})
         .then(subData => {
            var duplicateSubCategory = subData.filter((data)=>{
               if (data.businessSubCategory.trim().toLowerCase() == req.body.subCategory.trim().toLowerCase()) {
                  return data;
               }
            })
            if (duplicateSubCategory.length > 0) {
                  res.status(200).json({ duplicated: true, status:req.body.status, subCategory:req.body.subCategory});
            }else{
               Enterprise.updateOne( selector, updator )
                  .then(updateLog => {
                     console.log("approveEntpOthersSubCategory updateLog => ",updateLog);
                     if(updateLog.nModified === 1){
                           BusinessSubCategoryMaster.updateOne(
                              {businessCategoryId : req.body.category_id},
                              {$set : {businessSubCategory : req.body.subCategory} },
                           )
                           .then(updatedSubCatg => {
                              sendNotif("Approved","Other Sub-Category Approval");
                              Enterprise.findOne({ "_id": ObjectID(req.body.enterprise_id)})
                                 .then(data => {
                                    var catArray = data.catg_subCatg_expertise
                                    for (var i = 0; i < catArray.length; i++) {
                                       if((catArray[i].category_id)===(req.body.category_id)){
                                          catArray[i].subCategory = [...catArray[i].subCategory,{"businessSubCategory": req.body.subCategory}]
                                       }
                                    }
                                    Enterprise.updateOne(
                                       { "_id": ObjectID(req.body.enterprise_id)},
                                       {$set:{"catg_subCatg_expertise" : catArray }}
                                    )
                                    .then(updateData => {
                                       console.log("Enterprise updateData======",updateData)
                                       res.status(200).json({ updateData:data, success: true, status:req.body.status, subCategory:req.body.subCategory});
                                    })
                                    .catch(error =>{
                                       console.log("data Error => ",error);
                                       res.status(500).json({ error:error, success: false });
                                    });

                                 })
                                 .catch(error =>{
                                    console.log("data Error => ",error);
                                    res.status(500).json({ error:error, success: false });
                                 });
                           })
                           .catch(error =>{
                              console.log("BusinessSubCategoryMaster Update Error => ",error);
                              res.status(500).json({ error:error, success: false });
                           }); 
                     }else{
                        res.status(200).json({ message:"Status update didn't happen", success: false });
                     }
                  })
                  .catch(error =>{
                     console.log(" Error => ",error);
                     res.status(500).json({ error:error, success: false });
                  });
            }   
         })
         .catch(error =>{
            console.log("BusinessSubCategoryMaster find Error => ",error);
            res.status(500).json({ error:error, success: false });
         });  
   }else{
       Enterprise.updateOne( selector, updator )
         .then(updateLog => {
            console.log("Rejected updateLog => ",updateLog);
            sendNotif("Rejected","Other Sub-Category Rejected");
            res.status(200).json({ updateData:updateLog, success: true, status:req.body.status, subCategory:req.body.subCategory});
         })
         .catch(error =>{
            console.log(" Error => ",error);
            res.status(500).json({ error:error, success: false });
         });
   }
   function sendNotif(status,event){
      sendNotification({
         toEmail          : consultantDetailsforMail.data.profile.email,
         toMobileNumber   : consultantDetailsforMail.data.profile.isdCode + consultantDetailsforMail.data.profile.phoneNumber,
         event            : event,
         toUserRole       : "consultant",
         variables        : { 
                              UserFullName: consultantDetailsforMail.data.profile.consultantName, 
                              SubCategory: req.body.subCategory, 
                              MainCategory: req.body.category,
                              status: status, 
                              remark: req.body.remark ?? 'None' 
                           },
     });         
   }
}
