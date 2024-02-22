const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
	createdAt	: {type:Date},
	createdBy	: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	services	: {
		password:{
			bcrypt  :  String, // current pwd
			bcrypt1 :  String, // earlier pwd
			bcrypt2 :  String, // 2 pwd ago
		},
		resume: {
			loginTokens:[
				{
					loginTimeStamp 	: {type:Date},
					logoutTimeStamp 	: {type:Date},
					ValidateTill 		: {type:Date},
					hashedToken 		: String
				}
			]
		}
	},
	username				: {type:String},
	authService 		: String,
	social_media_id 	: String,
	profile:{
			company_id 				: { type: mongoose.Schema.Types.ObjectId, ref: 'enterprise' },
			companyID 				: Number,
			employeeID 				: Number,
			companyName  			: String,
			firstname 				: String,
			lastname  				: String,
			fullName  				: String,
			mobile 		 			: String,
			image 					: String,
			pincode	  				: String,
			countryCode          : String,
			isdCode  				: String,
			email 					: String,
			otpEmail	  				: String,
			otpMobile	  			: String,
			emailVerified			: Boolean,
			mobileVerified			: Boolean,
			status					: String,
			createdOn 				: String,
	},
	subscriptionDetails : {
		planName			: String,
		planCost 		: Number,
		planType 		: String,
		startDate 		: Date,
		startDateISO 	: String,
		endDate 			: Date,
		endDateISO 		: String,
		planStatus 		: String, 
		order_id 		: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
		planHistory    : Array,
	},
	address : {
		addressLine	: String,
		city 			: String,
		state 		: String,
		country 		: String,
		pincode 		: String,
	},
	otherInfo   : {
		fees 					: 	Number,
		experience 			: 	String,
		panNumber 			: 	String,
		qualification 		: 	String,
		languages 			: 	Array,
		awards 				: 	String,
		membership 			: 	String,
		pastWorkExp 		: 	String,
		aboutMyself 		: 	String,
	},
	documents: {
		profilePhoto 		: Array,
		panCard 				: Array,
		educationalQual 	: Array,
	},
	catg_subCatg_expertise  : Array,
	myConsultants  			: Array,
	roles       				: [String],
	recieveNotifications    : Boolean,
	joinAsConsultant 	   	: Boolean,
	invitedConsultant 	   : Boolean,
	isProfileReady				: Boolean,
	statusLog: 	[
	            	{
	                	status 				: String,
	                  updatedAt         : Date,
	                  updatedBy         : String,
	               }
	            ]
});

module.exports = mongoose.model('user',userSchema);
