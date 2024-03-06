const mongoose          = require("mongoose");
const LeaveApplication  = require('./Model.js');

exports.insertApplication = (req,res,next)=>{
    const {manager_id,leaveType,leaveSubject,leaveSummary}= req.body
    const leaveApplication = new LeaveApplication({
        _id                       : new mongoose.Types.ObjectId(),
        manager_id                : manager_id,
        leaveType                 : leaveType,
        leaveSubject              : leaveSubject,
        leaveSummary              : leaveSummary,
        createdAt                 : new Date(),
        status                    : 'Pending',
    })
    leaveApplication.save()
    .then(data=>{
        if(data){
            res.status(200).json({ created : true,message:"Leave application send successfully"});
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
};

