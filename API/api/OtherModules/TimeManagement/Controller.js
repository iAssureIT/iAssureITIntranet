const mongoose  = require("mongoose");
const Time = require('./Model');

exports.insert_Time = (req,res,next)=>{
    Time.find({"fromtime":req.body.fromtime,"totime":req.body.totime})
        .exec()
        .then(data =>{
            if (data.length == 0) {
        	const TimeObj = new Time({
                        _id                       : new mongoose.Types.ObjectId(),                    
                        fromtime                  : req.body.fromtime,
                        totime                    : req.body.totime,
                        createdBy 				  : req.body.createdBy, 	
                        createdAt                 : new Date()
                    });
                    // console.log('TimeObj==>', TimeObj);
                    TimeObj.save()
                    .then(data=>{
                        res.status(200).json({
                    		"message": "Time is submitted successfully!"
                		});
                    })
                    .catch(err =>{
                    	res.status(500).json({
		                    error: err
		                });
                    });
            }else{
                res.status(200).json({
                            "message": "Time already exists!"
                        });
            }
        })
};        

exports.get_Time = (req,res,next)=>{
    Time.find()       
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.get_single_Time = (req,res,next)=>{
    Time.findOne({_id : req.params.TimeID})       
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            });
        });
};

exports.update_Time = (req,res,next)=>{
    // console.log("Update Body = ", req.body);
    Time.updateOne(
            { _id:req.body.TimeID},  
            {
                $set:{
                    fromtime                : req.body.fromtime,
                    totime                  : req.body.totime,
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Time Updated Successfully!"
                });
            }else{
                res.status(401).json({
                    "message": "Time Not Found"
                });
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_Time = (req,res,next)=>{
    Time.deleteOne({_id:req.params.TimeID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Time Deleted Successfully!"
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.count_section = (req,res,next)=>{
    Time.find({})
    .exec()
    .then(data=>{
        res.status(200).json({"dataCount":data.length});
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.get_Time_with_limits = (req,res,next)=>{
    Time.find()  
    .sort({createdAt : -1})
    .skip(parseInt(req.params.startRange))
    .limit(parseInt(req.params.limitRange))     
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};

exports.get_megamenu_list = (req,res,next)=>{
   
    Time.aggregate([
    { $lookup:
        {
         from: 'categories',
         localField: '_id',
         foreignField: 'section_ID',
         as: 'categorylist'
        }
    },
    {
        // $sort: {
        //   "categorylist.createdAt": -1
        // }
        $sort: {
            "sectionRank": 1
          }
    }
    ])
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
};
