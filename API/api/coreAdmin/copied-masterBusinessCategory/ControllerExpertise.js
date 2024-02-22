const mongoose          = require("mongoose");
var   ObjectId          = require('mongodb').ObjectID;
const BusinessCategory  = require('./Model.js');

exports.insertCatgExpertise = (req,res,next)=>{
    // console.log("insertCatgExpertise req.body => ", req.body);

    BusinessCategory.find({_id : req.body.dropdownID})
                    .then(catgData=>{
                        if(catgData && catgData.length>0){
                            //Need to Update the Category document with expertise
                            // console.log("catgData => ",catgData);
                            var expertise1  = catgData[0].businessExpertise;
                            var expertise2  = req.body.fieldValue.split(",");

                            if(expertise1){
                                var newExpertise   = expertise1.concat(expertise2) ;
                            }else{
                                var newExpertise   = expertise2 ;
                            }

                            BusinessCategory.updateOne(
                                {_id : catgData[0]._id },
                                {$set : {
                                            businessExpertise : newExpertise
                                        }
                                }
                            )
                            .then(updateCatg => {
                                // console.log("updateCatg => ", updateCatg);
                                res.status(200).json({
                                    created : true,
                                    data : updateCatg,
                                    message : "Expertise Updated Successfully!"
                                })
                            })
                            .catch(error =>{
                                console.log("3 insertCatgExpertise update error => ",error);
                                res.status(500).json({
                                                        message: "Error occured while updating category", 
                                                        error: error
                                                    })
                            })
                        }else{
                            //Need to Insert category and Expertise
                            const businessCategory = new BusinessCategory({
                                _id                         : new mongoose.Types.ObjectId(),
                                businessCategory            : req.body.fieldValue,
                                businessExpertise           : req.body.businessExpertise,
                                createdBy                   : req.body.createdBy,
                                createdAt                   : new Date()
                            });

                            businessCategory.save()
                            .then(data=>{
                                res.status(200).json({ created : true, data : data });
                            })
                            .catch(error=>{
                                console.log("1 insertCatgExpertise insert error => ",error);
                                res.status(500).json({
                                                        message: "Error occured while inserting category", 
                                                        error: error
                                                    })
                            })
                        }
                    })
                    .catch(error=>{
                        console.log("2 insertCatgExpertise find error => ",error);
                        res.status(500).json({
                                                message: "Error occured while finding category", 
                                                error: error
                                            })
                    })

}       



exports.fetchCatgExpertise = (req, res, next)=>{
    BusinessCategory.find({})
        .sort({createdAt : -1})
        .skip(req.body.startRange)
        .limit(req.body.limitRange)
        .exec()
        .then(data=>{

            if(data.length>0){
                var newArray = [];
                for(var i=0; i<data.length; i++){
                    newArray[i] = {
                        _id                 : data[i]._id,
                        businessCategory    : data[i].businessCategory,
                        businessExpertise   : JSON.stringify(data[i].businessExpertise).replace("[","").replace("]",""),
                        createdBy           : data[i].createdBy,
                    }
                }

                if(i>=data.length){
                    // console.log("newArray = ",newArray);
                    res.status(200).json(newArray);
                }
            }else{
                res.status(200).json(data);
            }


        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};




exports.getCatgExpertise = (req, res, next)=>{
    BusinessCategory.find({})
                    .then(data=>{
                        res.status(200).json(data);
                    })
                    .catch(err =>{
                        res.status(500).json({ error: err });
                    }); 
};



exports.fetchSingleBusinessCategory = (req, res, next)=>{
    BusinessCategory.findOne({ _id: req.params.fieldID })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};

exports.searchBusinessCategory = (req, res, next)=>{
    BusinessCategory.find({ businessCategory: { $regex : req.params.str ,$options: "i" }  })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        }); 
};



exports.updateBusinessCategory = (req, res, next)=>{
    
    console.log("updateBusinessCategory req.body => ",req.body); 
    var busExpertise = req.body.fieldValue.split(",") ; 
    console.log("busExpertise => ",busExpertise); 

    BusinessCategory.updateOne(
            { _id:req.body.fieldID },  
            {
                $set:   {  'businessExpertise'  :  busExpertise }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                BusinessCategory.updateOne(
                { _id:req.body.fieldID},
                {
                    $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                updatedBy      : req.body.updatedBy 
                                            }] 
                            }
                })
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
};
exports.deleteBusinessCategory = (req, res, next)=>{
    BusinessCategory.deleteOne({_id: req.params.fieldID})
        .exec()
        .then(data=>{
            if(data.deletedCount === 1){
                res.status(200).json({ deleted : true });
            }else{
                res.status(200).json({ deleted : false });
            }
        })
        .catch(err =>{
            res.status(500).json({ error: err });
        });            
};

var fetchAllBusinessCategory = async (type)=>{
    return new Promise(function(resolve,reject){ 
    BusinessCategory.find()
        .sort({createdAt : -1})
        // .skip(req.body.startRange)
        // .limit(req.body.limitRange)
        .then(data=>{
            resolve( data );
        })
        .catch(err =>{
            reject(err);
        });
    });
}; 

