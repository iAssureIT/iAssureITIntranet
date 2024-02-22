const mongoose  = require("mongoose");
const Coupon    = require('./Model');
const Order     = require('../orders/Model');

var momentTz    = require('moment-timezone');
/**=========== insert_coupon ===========*/
exports.insert_coupon = (req, res, next) => {
    var startDate   = new Date(new Date(new Date(req.body.startdate).toLocaleDateString()).getTime());
    var endDate     = new Date(new Date(new Date(req.body.enddate).toLocaleDateString()).getTime()+24*60*60*1000-1);
    
    console.log("startDate => ",startDate)
    console.log("endDate => ",endDate)
    //Format time 2018-06-06 00:00:00
    //If only the simple formatting becomes 2018-6-6 0:0:0, you need to use the trinocular operation to judge and add 0 to the appropriate place to complete the required format.
    var newStartDate = startDate.getFullYear() + "-" + ((startDate.getMonth() + 1) < 10 ? "0" + (startDate.getMonth() + 1):(startDate.getMonth() + 1))+ "-" + (startDate.getDate() < 10 ? "0" + startDate.getDate():startDate.getDate()) + " " + (startDate.getHours()<10?"0"+startDate.getHours():startDate.getHours()) + ":" + (startDate.getMinutes()<10?"0"+startDate.getMinutes():startDate.getMinutes()) + ":" + (startDate.getSeconds()<10?"0"+startDate.getSeconds():startDate.getSeconds());
    
    
    //Format time 2018-06-06 23:59:59
     var newEndDate = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate() + ' ' + endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds()
     console.log("startTime => ",newStartDate)
     console.log("endTime => ",newEndDate)






    // var startDate = new Date(req.body.startdate);
    // var endDt = new Date(req.body.enddate);
    // startDate.toLocalString('en-US',{timezone: 'Asia/Dubai'} );
    
    // var stDtArr = req.body.startdate.split("-");
    // Var startDate = new Date(stDtArr[0], stDtArr[1], stDtArr[2], 23, 59, 59); 
    // console.log("endDt => ",endDate);
    // var n = .endOf('day')
    // startDate.setHours(23,59,59,999);
    // var utcDate = momentTz.tz(startDate, "YYYY-MM-DD HH:mm:ss", 'Asia/Dubai').toISOString();
    // console.log("utcDate => ",utcDate);

    // console.log("=== ",moment(req.body.startdate).format()); 
    // var end = new Date();
    

    // console.log( "----", startDate );
    
    // var endDtArr = req.body.enddate.split("-");
    // console.log("endDtArr => ",endDtArr);
    // console.log("endDtArr[0] => ",parseInt(endDtArr[0]) );
    // console.log("endDtArr[1] => ",parseInt(endDtArr[1]) );
    // console.log("endDtArr[2] => ",parseInt(endDtArr[2]) );

    
    // var endDate = new Date(parseInt(endDtArr[0]), parseInt(endDtArr[1])-1, parseInt(endDtArr[2]), 23, 59, 59); 
    // var endDate = new Date(2021, 4, 31, 23, 59, 59); 
    // endDate.toLocalDateString();
    
    // var currentDateTimeCentralTimeZone = new Date(endDate.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
    // console.log("-->",moment(new Date(req.body.enddate)).format('YYYY-MM-DD 23:59:59'));
    // console.log("startDate => ",startDate);
    // console.log("endDt => ",endDate);
    
    
    const CouponObj = new Coupon({
        _id                 : new mongoose.Types.ObjectId(),
        section 			: req.body.section_ID,
        category 			: req.body.category_ID,
        subCategory 		: req.body.subCategory_ID,
        coupontitle         : req.body.coupontitle,
        couponcode          : req.body.couponcode,
        couponin            : req.body.couponin,
        couponvalue         : req.body.couponvalue,
        minPurchaseAmount   : req.body.minPurchaseAmount,
        maxDiscountAmount   : req.body.maxDiscountAmount,
        couponLimit         : req.body.numOfOrders,
        status              : req.body.status,
        startdate           : req.body.startdate,
        enddate             : newEndDate,
        couponImage         : req.body.couponImage,
        createdBy           : req.body.createdBy,
        createdAt           : new Date()
    });
    console.log("CouponObj => ",CouponObj)
    CouponObj
    .save()
    .then(data => {
        // console.log("data => ",data);
        res.status(200).json({
            "message": "Coupon is submitted successfully."
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};

/**=========== get_coupon ===========*/
exports.get_coupon = (req, res, next) => {
    Coupon.find({})
    .sort({createdAt : -1})
    .exec()
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};

/**=========== get_coupon ===========*/
exports.get_coupon_by_couponcode = (req, res, next) => {
    // console.log("params => ",req.params.couponCode);
    Coupon.findOne({"couponcode" : req.params.couponCode, 'startdate': { $lte : new Date()},'enddate': {$gte : new Date()}})
    .exec()
    .then(coupon => {
        if(coupon){
            Order.find({coupon_id:coupon._id}).count()
            .then(count=>{
                res.status(200).json(coupon);
            })
            .catch(err=>{
                console.log("err",err)
            })
        }else{
            res.status(200).json({message : "This promotional code you entered is not valid...!"});
        }    
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};

/**=========== get_single_coupon ===========*/
exports.get_single_coupon = (req, res, next) => {
    // console.log("params => ",req.params.couponID);
    Coupon.findOne({ _id: req.params.couponID })
    .exec()
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};

/**=========== update_coupon ===========*/
exports.update_coupon = (req, res, next) => {
    console.log("Update Body = ", req.body);
    Coupon.updateOne(
        { _id: req.body.couponID },
        {
            $set: {
                section 			: req.body.section_ID,
                category 			: req.body.category_ID,
                subCategory 		: req.body.subCategory_ID,
                coupontitle         : req.body.coupontitle,
                couponcode          : req.body.couponcode,
                couponin            : req.body.couponin,
                couponvalue         : req.body.couponvalue,
                minPurchaseAmount   : req.body.minPurchaseAmount,
                maxDiscountAmount   : req.body.maxDiscountAmount,
                couponLimit         : req.body.numOfOrders,
                status              : req.body.status,
                startdate           : req.body.startdate, 
                enddate             : req.body.enddate,
                couponImage         : req.body.couponImage
            }
        }
    )
    .exec()
    .then(data => {
        // console.log("data => ",data);
        res.status(200).json({
            "message": "Coupon Updated Successfully."
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

/**=========== couponBulkAction ===========*/
exports.couponBulkAction = (req, res, next) => {
    var action = req.body.selectedAction;
    // console.log('action =>', action);
    switch (action) {
        case 'Active':
            Coupon.updateMany(
                {"_id": { "$in": req.body.selectedProducts}},
                {$set:{"status":"Active"}}
            )
            .exec()
            .then(data => {
                return res.status(200).json({
                    "msg": 'Selected Coupon are Active.',
                });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        break;
        case 'Inactive':
            Coupon.updateMany(
                {"_id": { "$in": req.body.selectedProducts}},
                {$set:{"status":"Inactive"}}
            )
            .exec()
            .then(data => {
                return res.status(200).json({
                    "msg": 'Selected Coupon are Inactive.',
                });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        break ;
        
        case 'delete':
            Coupon.deleteMany(
                {"_id": { "$in": req.body.selectedProducts}}
                )
            .exec()
            .then(data => {
                return res.status(200).json({
                    "msg": 'Selected Coupon are deleted.',
                });
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
    }
};

/**=========== delete_coupon ===========*/
exports.delete_coupon = (req, res, next) => {
    Coupon.deleteOne({ _id: req.params.couponID })
    .exec()
    .then(data => {
        res.status(200).json({
            "message": "Coupon Deleted Successfully."
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

/**=========== count_discount ===========*/
exports.count_discount = (req, res, next) => {
    Coupon.find({})
    .exec()
    .then(data => {
        res.status(200).json({ "dataCount": data.length });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

/**=========== get_discounts_with_limits ===========*/
exports.get_discounts_with_limits = (req, res, next) => {
    // console.log("params => ",req.params);
    Coupon.find()
    .skip(parseInt(req.params.startRange))
    .limit(parseInt(req.params.limitRange))
    .exec()
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};


exports.inActivateExpiredCoupons = (req, res, next)=>{
    Coupon.find({status : "Active"})
    .exec()
    .then(coupons=>{
        main();
        async function main(){
            
            for (var i = 0; i < coupons.length; i++) {
                var endDate      = coupons[i].enddate;
                var dayDiff      = moment(new Date(endDate), "DD-MM-YYYY").diff(moment(new Date(), "DD-MM-YYYY"), 'days');
                console.log("dayDiff => ", dayDiff);                
                
                if (dayDiff < 1) {
                  Coupon.updateOne(
                      { _id : ObjectId(coupons[i]._id)},  
                      {
                          $set: { 'status' : "Inactive"}
                      }
                  )
                  .exec()
                  .then(data=>{
                    console.log("data.nModified => ",data.nModified);
                      // if(data.nModified == 1){
                      //     res.status(200).json({ message: "sent" });
                      // }else{
                      //   res.status(200).json({ message: "Not sent" });
                      // }
                  })
                  .catch(err =>{
                    console.log("error => ",err);
                    // res.status(500).json({ error: err });
                  });
                }
            }
            if(i >= coupons.length){
                res.status(200).json({ message: "Coupons Updated" });
            }
        }    
    })
    .catch(err =>{
        res.status(500).json({ error: err });
    });
};