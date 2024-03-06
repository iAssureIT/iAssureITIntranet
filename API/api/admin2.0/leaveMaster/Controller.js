const mongoose          = require("mongoose");
const LeaveMaster  = require('./Model.js');

exports.insertLeaveData = (req,res,next)=>{
    console.log("req.body=>",req.body);
    const {casualLeave,priviledgedLeave,sickLeave,userId}= req.body
    LeaveMaster.findOne({})
    .exec()
    .then(leaveCount=>{
        console.log("leaveCount",leaveCount);
        if(leaveCount){
        console.log("leaveCount",leaveCount);
            console.log("casualLeave",casualLeave,priviledgedLeave,sickLeave)
           LeaveMaster.updateOne({_id:leaveCount._id},
           {
            $set: {
                casualLeave : parseInt(req.body.casualLeave),
                priviledgedLeave : parseInt(req.body.priviledgedLeave),
                sickLeave : parseInt(req.body.sickLeave)
            },
            // $push: {
            //     "updateLog":{
            //         "updatedAt": new Date(),
            //         "updatedBy": userId,
            //     }
            // }
            })
            .exec()
            .then(data=>{
                console.log("data",data);
                if(data){
                    res.status(200).json({ updated : true});
                }
            })
            .catch(err =>{
                console.log("err",err)
                if (err.code == 11000) {
                    res.status(200).json({ duplicated : true });
                }else{
        
                    res.status(500).json({ error: err });
                }
            });
            
        }else{
            const leaveMaster = new LeaveMaster({
                _id                       : new mongoose.Types.ObjectId(),
                casualLeave               : casualLeave,
                priviledgedLeave          : priviledgedLeave,
                sickLeave                 : sickLeave,
                createdAt                 : new Date(),
                createdBy                 : userId,
            })
            leaveMaster.save()
            .then(data=>{
                console.log("data",data);
                if(data){
                    res.status(200).json({ created : true});
                }
            })
            .catch(err =>{
                console.log("err",err)
                if (err.code == 11000) {
                    res.status(200).json({ duplicated : true });
                }else{
        
                    res.status(500).json({ error: err });
                }
                 
            });
        }
    })
    .catch(err=>{

    })
   
};

exports.getLeaveCount = (req,res,next)=>{
    LeaveMaster.findOne({})
    .exec()
    .then(leaveMasterData=>{
       console.log("leaveMasterData",leaveMasterData);
       res.status(200).json(leaveMasterData);
    })
    .catch(err=>{
        console.log("err",err);
    })
   
};


