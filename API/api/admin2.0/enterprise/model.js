const mongoose = require('mongoose');

const enterpriseSchema = mongoose.Schema({
    _id                  : mongoose.Schema.Types.ObjectId,
    enterpriseName       : String,
    GSTNumber            : String,
    PANNumber            : String,
    experience           : String,
    totalStaff           : String,
    awards               : String,
    membership           : String,
    aboutCompany         : String,
    businessCategory     : String,
    address              : {
        addressLine     : String,
        city            : String,
        state           : String,
        country         : String,
        pincode         : String,
    },
    catg_subCatg_expertise : [
        {
            category_id     : String,
            category        : String,
            subCategory     : Array,
            expertise       : Array,
        }
    ],
    invitations : [
        {
            email               : String,
            inviteSentOn        : Date,
            profileCreatedOn    : Date,
        }
    ],
    documents           : Object,
    createdBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    createdAt           : Date,
    updateLog           : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                            ],

    approvalStatus: {type:String,default:'Pending'},
    approvalLog: [
      {
        status: String,
        updatedAt: Date,
        updatedBy: String,
        reason: String,
      }],

    subcatgApprovalLog: [
        {
          subCategory       : String,
          mainCategory_id   : String,
          mainCategory      : String,
          userActionDate    : Date,
          status            : String,
          adminActionDate   : Date,
          remark            : String,
        }
    ],
    expertiseApprovalLog: [
        {
          expertise         : String,
          mainCategory_id   : String,
          mainCategory      : String,
          userActionDate    : Date,
          status            : String,
          adminActionDate   : Date,
          remark            : String,
        },
    ]

});

module.exports = mongoose.model('enterprise',enterpriseSchema);