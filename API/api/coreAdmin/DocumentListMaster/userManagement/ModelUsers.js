const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
	createdAt	: {type:Date},
	createdBy	: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	services	: {
		password:{
					bcrypt:String
				  },
		resume: {
			loginTokens:[
				{
					loginTimeStamp: {type:Date},
					logoutTimeStamp: {type:Date},
					ValidateTill: {type:Date},
					hashedToken : String
				}
			]
		}
	},
	username	: {type:String},
	profile 	:
					{
						company_id 				: { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
						companyID 				: String,
						companyName  			: String,
						workLocation	  		: String,
						firstname 				: String,
						lastname  				: String,
						fullName  				: String,
						mobile 		 			: String,
						image 					: String,
						otpMobile	  			: String,
						mobileVerified			: Boolean,
						email 					: String,
						otpEmail	  			: String,
						passwordreset	  		: Boolean,
						otpMobile	  			: String,
						emailVerified			: Boolean,
						status					: String,
						department				: String,
						designation				: String,
						city					: String,
						states					: String,
						createdOn 				: String,
					},
	roles       : [String],
	statusLog   : [
	                {
	                	status 				: String,
	                    updatedAt           : Date,
	                    updatedBy           : String,
	                }
	            ],
});

module.exports = mongoose.model('users',userSchema);
