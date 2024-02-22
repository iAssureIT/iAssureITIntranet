const mongoose	= require("mongoose");

const Gallery = require('./Model');

exports.insert_image = (req,res,next)=>{
	
                const gallery = new Gallery({
                    _id                       : new mongoose.Types.ObjectId(),                    
                    bannerimages              : req.body.bannerimages,                    
                    createdAt                 : new Date()
                });
                // console.log("gallery:",gallery);
                gallery.save()
                .then(data=>{
                    res.status(200).json({
                        "message": "Image Submitted Successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
};

exports.fetch_bannerimgs = (req,res,next)=>{
    Gallery.find({})
    .exec()
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.delete_image = (req,res,next)=>{
    Gallery.deleteOne({_id:req.params.imageId})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "image Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

