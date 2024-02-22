const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
const DriverTracking = require('./Model.js')
var request = require('request-promise');

//Write By Rushikesh
exports.addActivity = (req, res, next) => {
    // console.log("moment(req.body.currentDate).format",moment(req.body.currentDate).format("YYYY-MM-DD"));
    // console.log("req.body",req.body);
	DriverTracking.findOne({user_id:ObjectID(req.body.user_id), currentDateStr:moment(req.body.currentDate).format("YYYY-MM-DD")})
    .exec()
    .then(tracking => {
        // console.log("tracking",tracking);
        if(tracking){
            DriverTracking.updateOne(
                {user_id: ObjectID(req.body.user_id)},
                {
                    $push : {
                        onlineActivities : req.body.onlineActivities,
                    },
                    $set : {
                        status : req.body.onlineActivities.activity
                    }
                }
            )
            .then(data=>{
                res.status(200).json({
                    "message"   : "You are" + req.body.onlineActivities.activity,
                });
            })
            .catch(err =>{
                console.log('err',err);
                res.status(500).json({
                    error: err
                });
            });
        }else{
            const tracking = new DriverTracking({
                _id                 : new mongoose.Types.ObjectId(),  
                "user_id"           : req.body.user_id,
                "currentDate"       : new Date(),
                "currentDateStr"    : moment().format("YYYY-MM-DD"),
                "status"            : req.body.onlineActivities.activity,
                "onlineActivities"  : req.body.onlineActivities
            });
            tracking.save()
            .then(data=>{
                res.status(200).json({
                    "message"   : "You are" + req.body.onlineActivities.activity,
                });
            })
            .catch(err =>{
                console.log('err',err);
                res.status(500).json({
                    error: err
                });
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};


exports.startTracking = (req, res, next) => {
    // console.log("req.body",req.body);
    DriverTracking.updateOne(
        {user_id: ObjectID(req.body.user_id), currentDateStr:moment(req.body.currentDate).format("YYYY-MM-DD")},
        {
            $push:{
                currentLocations : req.body.currentLocations,
            }
        }
    )
    .then(data=>{
        res.status(200).json({
            "message"   : "Tracking Started",
        });
    })
    .catch(err =>{
        // console.log('4',err);
        res.status(500).json({
            error: err
        });
    });
}

exports.getStatus = (req, res, next) => {
    DriverTracking.findOne(
        {
            user_id         : ObjectID(req.params.user_id), 
            currentDate     : {
                $gte 	: moment().utc().startOf('day').toDate(),
                $lte 	: moment().utc().endOf('day').toDate()
            }
        },
        {status : 1}
    )
    .then(data=>{
        res.status(200).json(data);
    })
    .catch(err =>{
        // console.log('4',err);
        res.status(500).json({
            error: err
        });
    });
}
