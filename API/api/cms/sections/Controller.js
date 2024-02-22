const mongoose  = require("mongoose");
const Sections = require('../sections/Model');
// const Category = require('../categories/Model');
// const Products = require('../products/Model');

exports.insert_section = (req,res,next)=>{
	var sectionUrl = req.body.section.replace(/\s+/g, '-').toLowerCase();
    Sections.find({"section"    :  { "$regex": req.body.section, $options: "i"}  })
        .exec()
        .then(data =>{
            if (data.length == 0) {
        	const SectionObj = new Sections({
                        _id                       : new mongoose.Types.ObjectId(),                    
                        section                   : req.body.section,
                        sectionUrl                : sectionUrl,
                        sectionRank               : req.body.sectionRank,
                        createdBy 				  : req.body.createdBy, 	
                        createdAt                 : new Date()
                    });

                    SectionObj
                    .save()
                    .then(data=>{
                        res.status(200).json({
                    		"message": "Section is submitted successfully."
                		});
                    })
                    .catch(err =>{
                    	res.status(500).json({
		                    error: err
		                });
                    });
            }else{
                res.status(200).json({
                            "message": "Section already exists."
                        });
            }
        })
};        

exports.get_sections = (req,res,next)=>{
    Sections.find()       
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

exports.get_single_section = (req,res,next)=>{
    Sections.findOne({_id : req.params.sectionID})       
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

exports.update_section = (req,res,next)=>{
    console.log("Update Body = ", req.body);
    var sectionUrl = req.body.section.replace(/\s+/g, '-').toLowerCase();
    Sections.updateOne(
            { _id:req.body.sectionID},  
            {
                $set:{
                section                   : req.body.section,
                sectionRank               : req.body.sectionRank,
                sectionUrl                : sectionUrl
                }
            }
        )
        .exec()
        .then(data=>{
            // if(data.nModified == 1){
                res.status(200).json({
                    "message": "Section Updated Successfully."
                });
            // }else{
            //     res.status(401).json({
            //         "message": "Section Not Found"
            //     });
            // }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_section = (req,res,next)=>{

   /* Products.findOne({section_ID:req.params.sectionID})
        .exec()
        .then(pdata=>{
            if (pdata) {
                res.status(200).json({
                    "message": "You cannot delete this section as products are related to this section."
                });
            }else{
                Sections.deleteOne({_id:req.params.sectionID})
                        .exec()
                        .then(data=>{
                            res.status(200).json({
                                "message": "Section Deleted Successfully."
                            });
                        })
                        .catch(err =>{
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });

            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        }); 
*/

    /*Sections.deleteOne({_id:req.params.sectionID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Section Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });*/
};
exports.count_section = (req,res,next)=>{
    Sections.find({})
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

exports.get_sections_with_limits = (req,res,next)=>{
    Sections.find()  
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
   
    Sections.aggregate([
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
