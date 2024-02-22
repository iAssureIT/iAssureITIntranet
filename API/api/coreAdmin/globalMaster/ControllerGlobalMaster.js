const mongoose  = require("mongoose");
var moment      = require('moment');

const GlobalMaster = require('./ModelGlobalMaster.js');

exports.insertTax = (req,res,next)=>{
    // var fromDate1 = req.body.effectiveFrom.replace(/-/g, '\/');
    // var toDateForPreviousRecordISOFormat = new Date(new Date(fromDate1) - (24*60*60*1000) );
    // var formateddate = new Date(toDateForPreviousRecordISOFormat);
    // var toDateForPreviousRecord = formateddate.getFullYear()+'-' + (formateddate.getMonth()+1) + '-'+formateddate.getDate();
    
    var previousDate = moment(req.body.effectiveFrom).subtract(1, 'days').endOf('day')
    processData();
    
    async function processData(){
    var allTaxData = await fetchTaxData();
    var taxType = allTaxData.filter((data)=>{
        if ((data.taxType.trim().toLowerCase() == req.body.taxType.trim().toLowerCase()) && (data.effectiveTo == "" || data.effectiveTo == null)) {
            return data;
        }
        })
        if (taxType.length > 0) {
	         GlobalMaster.updateOne({taxType:req.body.taxType.toUpperCase()},
	          {$set:{ 
	              'effectiveTo' : previousDate,
	              'status'      : 'Inactive'
	              }
	          },
	        )
	        .exec()
	        .then((respose)=>{
	        	const globalMaster = new GlobalMaster({
	                    _id           : new mongoose.Types.ObjectId(),
	                    type 		  : "Tax",
	                    taxType       : req.body.taxType.toUpperCase(),
	                  	taxRating     : req.body.taxRating,
	                  	effectiveFrom : req.body.effectiveFrom,
	                  	effectiveTo   : "",
	                  	status        : 'Active',
	                  	createdAt     : new Date(),
	                })
	                globalMaster.save()
	                .then(data=>{
	                    res.status(200).json({ created : true, fieldID : data._id });
	                })
	                .catch(err =>{
	                    res.status(500).json({ error: err }); 
	                });
	         })
	        .catch((err)=>{res.status(500).json({ error: err });})
            
        }else{
            const globalMaster = new GlobalMaster({
                            _id           : new mongoose.Types.ObjectId(),
                            type 		  : "Tax",
		                    taxType       : req.body.taxType.toUpperCase(),
		                  	taxRating     : req.body.taxRating,
		                  	effectiveFrom : req.body.effectiveFrom,
		                  	effectiveTo   : "",
		                  	status        : 'Active',
		                  	createdAt     : new Date(),
                        })
                        globalMaster.save()
                        .then(data=>{
                            res.status(200).json({ created : true, fieldID : data._id });
                        })
                        .catch(err =>{
                            res.status(500).json({ error: err }); 
                        });
        }
    }

};

var fetchTaxData = async ()=>{
    return new Promise(function(resolve,reject){ 
    GlobalMaster.find({type : "Tax"})
        .exec()
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        }); 
    });
};

exports.showAllTaxDetails = (req,res,next)=>{
    GlobalMaster.find({type : "Tax","status" :{$in:["Active","Inactive"]}})
    .sort({createdAt : -1})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });

}

exports.getSingleTaxData = (req,res,next)=>{
	GlobalMaster.find({_id:req.params.id})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};

exports.updateTaxSettings = (req,res,next)=>{
    GlobalMaster.updateOne(
        {  _id : req.body.taxId},
        {
            $set:{
                "taxType"         : req.body.taxType.toUpperCase(),
                "taxRating"       : req.body.taxRating,
                "effectiveFrom"   : req.body.effectiveFrom,
            }
        }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json("Tax Details added");
            }else{
                res.status(404).json("Tax Not found");
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
}

exports.updateStatus = (req,res,next)=>{
    GlobalMaster.updateOne(
        { _id:req.body.id },   
        {
            $set:  {   
                        "status"   : 'Deleted',
                    },

        }
    )
    .exec()
    .then(data=>{
        if(data.nModified == 1){
            GlobalMaster.updateOne(
            { _id:req.body.id},
            {
                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                            updatedBy      : req.body.updatedBy 
                                        }] 
                        }
            } )
            .exec()
            .then(data=>{
                res.status(200).json({ updated : true });
            })
        }else{
            res.status(200).json({ updated : false });
        }
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
}

exports.insertSMSData = (req, res, next) => {
    GlobalMaster.find({type:'SMS'}).count()
    .exec()
        .then(data=>{
            if(data > 0){
                GlobalMaster.updateOne(
                        { type:'SMS' },   
                        {
                            $set:  {   
                                        "authID"        : req.body.authID.toUpperCase(),
                                        "authToken"     : req.body.authToken,
                                        "sourceMobile"  : req.body.sourceMobile,
                                    },

                        }
                    )
                    .exec()
                    .then(data=>{
                        if(data.nModified == 1){
                            GlobalMaster.updateOne(
                            { type:'SMS'},
                            {
                                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                            updatedBy      : req.body.updatedBy 
                                                        }] 
                                        }
                            } )
                            .exec()
                            .then(data=>{
                                res.status(200).json({ updated : true });
                            })
                        }else{
                            res.status(200).json({ updated : false });
                        }
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({ error: err });
                    });
            }else{
                const globalMaster = new GlobalMaster({
                    _id             : mongoose.Types.ObjectId(),      
                    type            : 'SMS',
                    authID          : req.body.authID.toUpperCase(),
                    authToken       : req.body.authToken.toUpperCase(),
                    sourceMobile    : req.body.sourceMobile,
                    createdAt       : new Date()
                });
                
                globalMaster.save()
                .then(data=>{
                    res.status(200).json({ created : true, fieldID : data._id });
                })
                .catch(err =>{
                    res.status(500).json({ error: err }); 
                });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 

};

exports.insertEmailData = (req, res, next) => {
    GlobalMaster.find({type:'Email'}).count()
    .exec()
        .then(data=>{
            if(data > 0){
                GlobalMaster.updateOne(
                        { type:'Email' },   
                        {
                            $set:  {   
                                        "user"         : req.body.user,
                                        "password"     : req.body.password,
                                        "port"         : req.body.port,
                                        "emailHost"    : req.body.emailHost,
                                        "projectName"  : req.body.projectName,
                                    },

                        }
                    )
                    .exec()
                    .then(data=>{
                        if(data.nModified == 1){
                            GlobalMaster.updateOne(
                            { type:'Email'},
                            {
                                $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                            updatedBy      : req.body.updatedBy 
                                                        }] 
                                        }
                            } )
                            .exec()
                            .then(data=>{
                                res.status(200).json({ updated : true });
                            })
                        }else{
                            res.status(200).json({ updated : false });
                        }
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({ error: err });
                    });
            }else{
                const globalMaster = new GlobalMaster({
                    _id             : mongoose.Types.ObjectId(),      
                    type            : 'Email',
                    user           : req.body.user,
                    password       : req.body.password,
                    port           : req.body.port,
                    emailHost      : req.body.emailHost,
                    projectName    : req.body.projectName,
                    createdAt       : new Date()
                });
                
                globalMaster.save()
                .then(data=>{
                    res.status(200).json({ created : true, fieldID : data._id });
                })
                .catch(err =>{
                    res.status(500).json({ error: err }); 
                });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 

};

exports.get_tax_Data = (req,res,next)=>{
    GlobalMaster.find({type:'Tax',taxType:req.params.type,status:'Active'})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};

exports.getSMSDetails = (req,res,next)=>{
    GlobalMaster.findOne({type:'SMS'})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};
exports.getEmailDetails = (req,res,next)=>{
    GlobalMaster.findOne({type:'Email'})
    .exec() 
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};

