const mongoose          = require("mongoose");
const LeaveApplication  = require('./Model.js');

exports.insertApplication = (req,res,next)=>{
    const {manager_id,leaveType,leaveSubject,leaveSummary,manager_name,user_id,user_name,fromDate,toDate}= req.body
    const leaveApplication = new LeaveApplication({
        _id                       : new mongoose.Types.ObjectId(),
        manager_id                : manager_id,
		manager_name              : manager_name,
		user_id                   : user_id,
		user_name                 : user_name,
        leaveType                 : leaveType,
        leaveSubject              : leaveSubject,
        leaveSummary              : leaveSummary,
		fromDate                  : fromDate,
		toDate                   : toDate,
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

exports.getLeaveRequest = (req, res) => {
	LeaveApplication.find({"status":req.params.status})
		.then(data => {
			console.log("requests",data)
			res.status(200).json({
				data: data,
				messages: "Pending requests !!"
			})
		})
		.catch(error => {
			res.status(500).json({
				error: error,
				message: "Some error occured while fetching pending requests"
			})
		});
}

exports.updateStatus = (req, res) => {
	// console.log("req.body => ",req.body);
	LeaveApplication.updateOne(
		{ _id: req.body.leave_id },
		{
			$set: {				
				status:req.body.status,
				remark : req.body.remark
			}
		},
	)
		.then(result => {
			if (result.nModified === 1) {				
					res.status(200).json({
						message: "Status updated successfully",
						success: true,
					});				
			} else {
				res.status(404).json({ message: "No changes were made", success: false });
			}
		})
		.catch(error => {
			res.status(500).json({ message: "Error occured while updating Status" });
		})
};

exports.getInfo =(req,res)=>{
	LeaveApplication.findOne({ _id: req.params.leave_id })
		.then( leave=> {
			res.status(200).json(leave)
		})
		.catch(error => {
			res.status(500).json({ message: "Error occured while updating Status" });
		})
}