const mongoose = require('mongoose');

const CompanyInfoSchema = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   profileStatus: String,
   basicInfo : {
      companyName               : String,
      groupName                 : String,
      companyLogo               : Array,
      website                   : String,
      employees                 : Number,
      category                  : String,
      subCategory               : String,
   },
   locations: [
               {
                  locationType        : String,
                  branchName          : Number,
                  addressLine1        : String,
                  addressLine2        : String,
                  countryCode         : String,
                  country             : String,
                  stateCode           : String,
                  state               : String,
                  district            : String,
                  city                : String,
                  area                : String,
                  pincode             : Number,
                  latitude            : Number,
                  longitude           : Number,
               }
            ],
   contactPersons:  [
               {
                  branchName                : String,
                  firstName                 : String,
                  middleName                : String,
                  lastName                  : String,
                  phone                     : String,
                  gender                    : String,
                  altPhone                  : String,
                  whatsappNo                : String,
                  email                     : String,
                  designation               : String,
               }
            ],
   socialMedia : {
      facebook : String,
      instagram: String,
      twitter  : String,
      linkedIn : String,
      youTube  : String,
   },
   about:{
      info : String
   },
   services : Array,
   photos: [
      {imgUrl: String, fileName:String}, 
   ],
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
   createdAt: Date,
   updateLog:  [
                  {
                     updatedAt: Date,
                     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                  }
               ]
});

module.exports = mongoose.model('companyInfo',CompanyInfoSchema);

