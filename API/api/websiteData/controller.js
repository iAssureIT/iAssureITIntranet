const mongoose             = require("mongoose");
const ObjectId             = require('mongodb').ObjectID;
const BusinessCategory     = require('../admin2.0/masterBusinessCategory/Model.js');
const BusinessSubCategory  = require('../admin2.0/masterBusinessSubCategory/Model.js');
const Users                = require('../admin2.0/userManagementnew/ModelUsers.js');
const Appointments         = require('../admin2.0/appointments/model.js');
const AppointmentSlots     = require('../admin2.0/appointmentSlots/model.js');
const Review               = require('../admin2.0/review/model.js');
const moment               = require('moment-timezone');


exports.getBusinessSubCategory = (req, res, next)=>{
    BusinessSubCategory.find({businessSubCategory : {$ne : "Others" }},{businessSubCategory : 1})
        .limit(12)
        .then(subcatg=>{
            if(subcatg.length > 0){
               var blockdata = {
                  success         : true,
                  subcategories   : subcatg.map(a => a.businessSubCategory)
               };
               res.status(200).json(blockdata);
            }else{
               res.status(200).json({
                  success        : true,
                  subcategories  : []
               });
            }
        })
        .catch(err =>{
            res.status(500).json({ 
                success     : false,
                error       : err
            });
        }); 
};

exports.getBusinessCategory = (req, res, next)=>{

    BusinessCategory.find({businessCategory : {$ne : "Others" }})
        .sort({createdAt : 1})
        .then(data=>{
            var catg = [];
            if(data.length > 0){
                for(var i=0; i<data.length; i++){
                    if(data[i].businessCategory !== "Others"){
                        catg.push(data[i].businessCategory);
                    }
                }
                if(i>=data.length){
                    var blockdata = {
                        success     : true,
                        categories  : catg
                    };
                    // console.log("catg blockdata = ",blockdata);
                    res.status(200).json(blockdata);
                }
            }else{
                res.status(200).json({
                    success     : true,
                    categories  : catg
                });
            }
        })
        .catch(err =>{
            res.status(500).json({ 
                success     : false,
                error       : err
            });
        }); 
};

exports.getSubCatgUsingCatg = (req, res, next)=>{
   var catg = req.params.category;

   // console.log("businessCategory => ",catg);
   
   BusinessCategory.findOne({businessCategory : catg})
     .then(categoryDoc=>{
         // console.log("BusinessCategory data => ",categoryDoc);

         BusinessSubCategory.find({businessCategoryId : categoryDoc._id})
            .sort({businessSubCategory : 1})
            .then(data=>{
               // console.log("BusinessSubCategory data => ",data);
               var subcatg = [];
               if(data.length > 0){
                  for(var i=0; i<data.length; i++){
                     subcatg.push(data[i].businessSubCategory);
                  }
                  if(i>=data.length){
                     var blockdata = {
                        success     : true,
                        categories  : subcatg
                     };
                     res.status(200).json(blockdata);
                  }
               }else{
                  res.status(200).json({
                     success     : true,
                     categories  : subcatg
                  });
               }
            })
            .catch(err =>{
               res.status(500).json({ 
                  success : false,
                  error   : err
               });
            });
         })
         .catch(err2 =>{
            res.status(500).json({ 
               success     : false,
               error       : err2
            });
         }); 
};


exports.getCatgArray = (req, res, next)=>{
   var catgArr = [];

   BusinessCategory.find({})
      .sort({businessCategory : 1})
      .then(async (categoryDocs)=>{
         // console.log("BusinessCategory data => ",categoryDocs);

         if(categoryDocs && categoryDocs.length>0){
            for(var i=0; i<categoryDocs.length; i++){
               var subcatgArr = await getSubCatgArr(categoryDocs[i]._id);
               // console.log("BusinessCategory = ",categoryDocs[i].businessCategory," | subcatgArr = ",subcatgArr);
               catgArr.push({
                  category    : categoryDocs[i].businessCategory,
                  subcatgArr  : subcatgArr
               })
            }
            if(i>=categoryDocs.length){
               res.status(200).json({
                  success : true,
                  categoryArr : catgArr
               })
            }
         }else{
            res.status(200).json({
               success     : true,
               categoryArr : []
            })            
         }
      })
      .catch(err2 =>{
         res.status(500).json({ 
            success     : false,
            error       : err2
         });
      }); 
};



function getSubCatgArr(category_id){
   return new Promise( (resolve,reject)=>{
         BusinessSubCategory.find({businessCategoryId : category_id})
            .sort({businessSubCategory : 1})
            .then(data=>{
               // console.log("BusinessSubCategory data => ",data);
               var subcatg = [];
               if(data.length > 0){
                  for(var i=0; i<data.length; i++){
                     subcatg.push(data[i].businessSubCategory);
                  }
                  if(i>=data.length){
                     resolve(subcatg);
                  }
               }else{
                  resolve([]);
               }
            })
            .catch(err =>{
               reject(err);
            });
   })
}

exports.getConsultants = (req, res, next)=>{
   var user_id = req.params.user_id;

   Users.find( {
                  roles                : "consultant",
                  "profile.firstname"  : {$exists : true},
                  approvalStatus       : "Approved",
                  isProfileReady       : true,
               },
               {services:0,statusLog:0})
         .populate("profile.company_id")
         .sort({rank:1})
         .limit(16)
         .then(async data=>{
            // console.log("1 data => ",data);

            if(data.length>0){
               // console.log("user_id -> ", user_id);
               
               // If user_id !== "0", it means user is logged in and we have to find whether
               // consultants are in MyConsultants list. So we show filled Heart icon on webpage. 
               // If user_id == "0", means website is being browsed without login. 

               if(user_id !== "0"){
                  Users.findOne({_id : ObjectId(user_id)})
                       .then(async mainUser => {
                           var myConsultants = mainUser.myConsultants;
                           // console.log("myConsultants -> ", myConsultants);

                           if(myConsultants.length > 0){     
                              // First check if each of the consultant is part of 
                              // user's myConsultant array

                              for(var i=0; i<data.length; i++){
                                 var totalCalls          = await getConsultantCalls(data[i]._id);
                                 var rating              = await getConsultantReviewList(data[i]._id);
                                 var nextAvailableDate   = await getNextAvailableDate(data[i]._id,data[i].profile.fullName);
                                 // console.log("nextAvailableDate => ",nextAvailableDate);

                                 // console.log("data[i]._id.toString() => ",data[i]._id.toString());
                                 var x = myConsultants.indexOf(data[i]._id.toString());
                                 // console.log("x => ",x);

                                 if(x > -1){                                    
                                    data[i] = {...data[i]._doc, isMyConsultant: true,totalCalls:totalCalls, rating : rating,nextAvailableDate:nextAvailableDate};
                                 }else{
                                    data[i] = {...data[i]._doc, isMyConsultant: false,totalCalls:totalCalls, rating : rating,nextAvailableDate:nextAvailableDate};
                                 }
                              }

                              if(i>=data.length){
                                 //Now also check if this user has put any appointment for 
                                 //selected consultants.
                                 // console.log(1," data -> ", data);

                                 Appointments.find({user_id : user_id})
                                             .then(appointments =>{
                                                if(appointments.length>0){
                                                   var apmts = appointments.map(a => a.consultant_id);
                                                   // console.log("appointments c => ",c);

                                                   for(var j=0; j<data.length; j++){
                                                      if(data[j].isMyConsultant){ 
                                                         //if already isMyConsultant is set to true, then do nothing
                                                         continue;
                                                      }else{
                                                         var xx = apmts.indexOf(data[j]._id.toString());
                                                         if(xx !== -1){
                                                            data[j] = {...data[j], isMyConsultant: true};
                                                         }else{
                                                            data[j] = {...data[j], isMyConsultant: false};
                                                         }
                                                         
                                                         // console.log("j => ",j," data[j] -> ", data[j]);

                                                      }
                                                   }

                                                   if(j>=data.length){
                                                      // console.log(2," data -> ", data);                                    
                                                      res.status(200).json({
                                                         success     : true,
                                                         consultants : data
                                                      });
                                                   }

                                                }else{
                                                   res.status(200).json({
                                                      success     : true,
                                                      consultants : data
                                                   });
                                                }
                                             })
                                             .catch(error=>{
                                                console.log("error in finding the appointments => ",error);
                                                res.status(500).json({ 
                                                   success    : false,
                                                   message    : "Some issue in finding the appointments",
                                                   error      : err
                                                });
                                             })
                              }else{
                                 res.status(200).json({
                                    success     : true,
                                    consultants : data
                                 });                                 
                              }
                           }else{
                              for(var i=0; i<data.length; i++){
                                 var totalCalls        = await getConsultantCalls(data[i]._id);
                                 var rating            = await getConsultantReviewList(data[i]._id);
                                 var nextAvailableDate = await getNextAvailableDate(data[i]._id,data[i].profile.fullName);
                                 data[i] = {
                                             ...data[i]._doc, 
                                             isMyConsultant    : false,
                                             totalCalls        : totalCalls, 
                                             rating            : rating,
                                             nextAvailableDate : nextAvailableDate
                                          };
                              }

                              if(i>=data.length){
                                 //Now also check if this user has put any appointment for 
                                 //selected consultants.
                                 // console.log(1," data -> ", data);                              
                                 res.status(200).json({
                                    success     : true,
                                    consultants  : data
                                 });
                              }
                           }
                       })
                       .catch(err =>{
                           res.status(500).json({ 
                               success    : false,
                               message    : "Some issue in finding the user",
                               error      : err
                           });
                       }); 
               }else{
                  for(var k=0; k<data.length; k++){
                     // console.log("data[k] => ",data[k]);
                     var totalCalls = await getConsultantCalls(data[k]._id);
                     var rating = await getConsultantReviewList(data[k]._id);
                     var nextAvailableDate = await getNextAvailableDate(data[k]._id,data[i].profile.fullName);
                     // console.log("nextAvailableDate => ",nextAvailableDate);

                     data[k] = {...data[k]._doc, isMyConsultant: false,totalCalls:totalCalls, rating : rating,nextAvailableDate:nextAvailableDate};
                  }

                  if(k>=data.length){                     
                     // console.log("2 data => ",data);
                     res.status(200).json({
                        success      : true,
                        consultants  : data
                     });
                  }
               }
            }else{
                res.status(200).json({
                    success     : true,
                    consultants  : []
                });
            }
        })
        .catch(err =>{
            res.status(500).json({ 
                success     : false,
                error       : err
            });
        }); 
};


function getConsultantCalls(consultant_id) {
   return new Promise((resolve, reject) => {
      var currDate = moment().tz('Asia/Kolkata').format("YYYY-MM-DD");
      var currTime = moment().tz('Asia/Kolkata').format("HH:mm");

      // Appointments.find({ consultant_id: ObjectId(consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} },{"meetingRoomDetails":0})
      var selector = { consultant_id: ObjectId(consultant_id), status:  {$ne : "cancelled"}, "isoAppointmentDate" : {$lte : currDate} }
      var query = { $match : selector};
      var statusList =["captured","TXN_SUCCESS"];
      Appointments.aggregate([
            query,
            {
               $lookup:
                  {
                    from: "orders",
                    localField: "order_id",
                    foreignField: "_id",
                    as: "order"
                  }
            },
            { "$unwind": "$order" },
            { 
               "$match": { 
                  "order.status": { "$in": statusList },
               } 
            }

         ])
         .then(totalData => {
            // console.log("totalData=",totalData.length)
            for(var i=0; i<totalData.length; i++){
               if(( totalData[i].appointmentEnd > currTime && moment(totalData[i].isoAppointmentDate).diff(moment(currDate)) >= 0)){
                  const index = totalData.indexOf(totalData[i]);
                  // console.log("index",index,i)
                  if (index > -1) { // only splice array when item is found
                    totalData.splice(index, 1); // 2nd parameter means remove one item only
                  }

               }
            }
            // console.log("totalData==",totalData.length)
            resolve(totalData.length);
         })
         .catch(err => {
            console.log('getConsultantCalls error => ', err);
            reject(-1);
         });

      // Appointments.countDocuments({ consultant_id: ObjectId(consultant_id), status:  {$nin : ['cancelled','pending']}, "isoAppointmentDate" : {$lte : currDate} })
      //    .then(totalCalls => {
      //       resolve(totalCalls);
      //    })
      //    .catch(err => {
      //       console.log('getConsultantCalls error => ', err);
      //       reject(-1);
      //    });
   })
}


function getConsultantReviewList(consultant_id){
   return new Promise((resolve, reject) => {
      Review.find({consultantId : ObjectId(consultant_id)})
      .sort({"createdAt" : -1})
      .then(consultantReviewList=>{
         if(consultantReviewList.length>0){
            var rating = 0;
            consultantReviewList.map((e,i)=>{               
               rating=rating+e.rating;
            });
            rating = (rating / consultantReviewList.length).toFixed(1);
            resolve(rating);
         }else{
            resolve(0);            
         }

      })
      .catch(error=>{
         console.log("getConsultantReviewList error => ",error)
         reject(0);
      });      
   })
}

function getNextAvailableDate(consultant_id,name){
   console.log("getNextAvailableDate name => ", name);

   var currDate             = moment().tz('Asia/Kolkata');
   var currDay              = currDate.format("dddd");
   var currTime             = currDate.format("HH");

   return new Promise((resolve, reject) => {   
      AppointmentSlots.findOne({user_id : ObjectId(consultant_id)})
      .then(apmtSlots => {
         // console.log("apmtSlots => ",apmtSlots);
         // Slots maybe created or not created. 
         // var dayArray = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

         if(apmtSlots && apmtSlots.dayWiseSlots && apmtSlots.dayWiseSlots.length > 0 ){
            var slotsAvailable = checkNextDaySlots(apmtSlots,0);
         }else{
            var slotsAvailable = {
                                    slotsCreated      : false,
                                    slotsCreatedDt    : '',
                                    slotsCreatedArr   : []
                                 }
         }

         if(slotsAvailable && slotsAvailable.slotsCreated){
            //It means slots were created
            var slotsCreatedArr = slotsAvailable.slotsCreatedArr;
            var slots = slotsCreatedArr[0].phaseWiseSlots[0].slots;
            var lastSlotTimeArr = slots[slots.length-1].startTime.split(":");
            var lastSlotTimeHr = parseInt(lastSlotTimeArr[0]);
            var lastSlotTimeMin = parseInt(lastSlotTimeArr[1]);

            var leadTime = slotsCreatedArr && slotsCreatedArr[0] 
                           ? slotsCreatedArr[0].phaseWiseSlots && slotsCreatedArr[0].phaseWiseSlots[0]
                              ? slotsCreatedArr[0].phaseWiseSlots[0].slots && slotsCreatedArr[0].phaseWiseSlots[0].slots[0]
                                 ? slotsCreatedArr[0].phaseWiseSlots[0].slots[0].leadTime : 60
                              : 60 
                           : 60 ;

            var currTimeWithLeadTime = currDate.add(leadTime,'minutes').format("HH");

            if(currTimeWithLeadTime >= lastSlotTimeHr){
               //This means on the day when slots are available, its too late. 
               //Last slot time can't be catched. 
               //Now find nextDay whenslots are available. 

               var slotFound = false;
               do {
                  var nextSlotsAvailable = checkNextDaySlots(apmtSlots,slotsAvailable.numDays);
                  if(nextSlotsAvailable && nextSlotsAvailable.slotsCreated){
                     var dt1 = nextSlotsAvailable.slotsCreatedDt.format("DD-MM-YYYY");
                     var dateBookings = apmtSlots.calendarDays.filter(x => x.date === apmtDate1);
                     slotFound = true;                 
                  }
               }
               while(slotFound === false);

               resolve(currDate.format("DD-MMM-YY"));

            }else{
               resolve(currDate.format("DD-MMM-YY"));
            }
         }
         else{
            //It means slots were NOT created
            //Default last slot is at 6pm and default lead time is 1 hour. 
            //So if its before 5pm, we can recommend 6pm slot, else next day. 
            // console.log("currTime => ",currTime);

            if(currTime >= 19){
               var dt = 1;
               var next = getNextDay(dt);
               var nextAvailableDate = checkIfWholeDayBooked(apmtSlots,next.nextDate, dt,name);                  
               // console.log("nextAvailableDate",nextAvailableDate)
               resolve(nextAvailableDate);
            }else{
               // console.log("here false slotsCreated",currDate.format("DD-MMM-YY"))
               resolve(currDate.format("DD-MMM-YY"));
            }
         }


         function checkNextDaySlots(apmtSlots,numDays){
            //numDays is a variable which is the difference between currentDay 
            //and the day when slots were available at first occurance. 
            //If numDays = 0, it means current date

            if(numDays < 7){
               for(var i = numDays; i < 7; i++){
                  var nextDt  = getNextDay(i);
                  var nextDay = nextDt.nextDay;
                  var slotsCreatedArr = apmtSlots.dayWiseSlots.filter(x=> x.day === nextDay);
                  if(slotsCreatedArr && slotsCreatedArr.length>0){
                     var slotsCreated  = true;
                     console.log(i, " true slotsCreated => ",slotsCreated)
                     return {
                        slotsCreated      : true,
                        slotsCreatedDt    : nextDt,
                        slotsCreatedArr   : slotsCreatedArr,
                        numDays           : i+1
                     }
                     break;
                  }else{
                     var slotsCreated  = false;
                     console.log(i, " false slotsCreated => ",slotsCreated)
                  }
               }

               if(i>=6){
                  if(!slotsCreated){
                     return {
                        slotsCreated      : false,
                        slotsCreatedDt    : '',
                        slotsCreatedArr   : [],
                        numDays           : false
                     }                  
                  }
               }

            }else{
               var nextDt  = getNextDay(numDays);
               var nextDay = nextDt.nextDay;
               var slotsCreatedArr = apmtSlots.dayWiseSlots.filter(x=> x.day === nextDay);
               if(slotsCreatedArr && slotsCreatedArr.length>0){
                  return {
                     slotsCreated      : true,
                     slotsCreatedDt    : nextDt,
                     slotsCreatedArr   : slotsCreatedArr,
                     numDays           : numDays+1
                  }
               }else{
                  return {
                     slotsCreated      : false,
                     slotsCreatedDt    : '',
                     slotsCreatedArr   : [],
                     numDays           : false
                  }
               }

            }
         }


         function checkIfWholeDayBooked(apmtSlots,apmtDate,dt,name){
            // console.log("checkIfWholeDayBooked apmtDate ==> ",apmtDate, dt, name);
            apmtDate1 = apmtDate.format("DD-MM-YYYY");
            apmtDate2 = apmtDate.format("DD-MMM-YY");
            var next = getNextDay(dt);

            if(apmtSlots && apmtSlots.calendarDays.length>0){
               var dateBookings = apmtSlots.calendarDays.filter(x => x.date === apmtDate1);
               // console.log("1 checkIfWholeDayBooked dateBookings ===> ",dateBookings);
               
               //When slots not created, consultant will see default 9 slots. 
               //Hence check if booked slots are less than or equal to 9 slots.

               if(dateBookings.length > 9){
                  dt++;
                  apmtDate1 = next.nextDate.format("DD-MM-YYYY");

                  var disabledDay = 0;
                  while(disabledDay > -1){
                     dateBookings = apmtSlots.calendarDays.filter(x => x.date === apmtDate1);
                     disabledDay = dateBookings.findIndex(i => i.from === "");
                     //disabledDay > -1, means whole day is disabled, then find next available date.
                     if(disabledDay > -1){
                        dt++;
                        var next = getNextDay(dt);
                        apmtDate1 = next.nextDate.format("DD-MM-YYYY");
                     }else{
                        return(next.nextDate.format("DD-MMM-YY"));
                     }                     
                  }
               }else{
                  //Check if whole day is disabled. 
                  //That time, only one slot will be visible & startTime will be = ""

                  if(dateBookings.length>0){
                     var disabledDay = 0;
                     while(disabledDay > -1){
                        dateBookings = apmtSlots.calendarDays.filter(x => x.date === apmtDate1);
                        console.log("dateBookings",dateBookings)
                        disabledDay = dateBookings.findIndex(i => i.from === "");
                        console.log("disabledDay",disabledDay)
                        //disabledDay > -1, means whole day is disabled, then find next available date.
                        if(disabledDay > -1){
                           dt++;
                           var next = getNextDay(dt);
                           apmtDate1 = next.nextDate.format("DD-MM-YYYY");
                        }else{
                              console.log("hereeee", next)
                           if(next && next.nextDate){
                              console.log("here",next.nextDate.format("DD-MMM-YY"))
                              return(next.nextDate.format("DD-MMM-YY"));
                           }
                        }                     
                     }
                  }else{
                     console.log("apmtDate2  =1",apmtDate2, name)
                     return apmtDate2;
                  }
               }
            }else{
               var dt1 = dt+1;
               var nextToNext = getNextDay(dt1);
               // console.log("next",next,"nextToNext",nextToNext)
               var nextAvailableDate = checkIfWholeDayBooked(apmtSlots,nextToNext.nextDate,next.nextDate,name);                  
               // console.log("nextAvailableDate",nextAvailableDate)
               // console.log("apmtDate2  =2",apmtDate2, name)
               return(apmtDate2);
            }
         }

         function getNextDay(dt){
            var nextDate   = moment().tz("Asia/Kolkata").add(dt,'day');
            var nextDay    = nextDate.format("dddd");
            // console.log("nextDate",nextDate)
            // if(nextDay === "Sunday"){
            //    dt++;
            //    getNextDay(dt);                        
            //    nextDate = moment().tz("Asia/Kolkata").add(dt,'day');
            //    nextDay = nextDate.format("dddd");
            // }

            var nextDateObj = {
               nextDate : nextDate,
               nextDay  : nextDay,
               nextDateFormatted : nextDate.format("DD-MM-YYYY")
            };
            return nextDateObj;
         }

      })
      .catch(error=>{
         console.log("AppointmentSlots error => ",error);
         reject(-1);
      })
   })

}

function getNextAvailableDateOld(consultant_id,name){
   var currDate = moment().tz('Asia/Kolkata');
   var currDay = currDate.format("dddd");
   var currTime = moment().tz('Asia/Kolkata').format("HH");
   var currTimeWithLeadTime = moment().tz('Asia/Kolkata').add(1,'hour').format("HH");

   // console.log("currDate => ",currDate);
   // console.log("currDay => ",currDay);
   // console.log("consultant_id => ",consultant_id);
   // console.log("currTimeWithLeadTime => ",currTimeWithLeadTime);
   return new Promise((resolve, reject) => {   
      AppointmentSlots.findOne({user_id : ObjectId(consultant_id)})
      .then(apmtSlots => {
         // console.log("apmtSlots => ",apmtSlots);
         // Slots maybe created or not created. 

         if(apmtSlots && apmtSlots.dayWiseSlots && apmtSlots.dayWiseSlots.length > 0 ){
            var slotsCreatedArr = apmtSlots.dayWiseSlots.filter(x=> x.day === currDay);
            // console.log("slotsCreatedArr => ",slotsCreatedArr);
            if(slotsCreatedArr && slotsCreatedArr.length>0){
               var slotsCreated = true;
            }else{
               var slotsCreated = false;
            }
         }else{
            var slotsCreated = false;
         }

            console.log("name", name,slotsCreated)
         if(slotsCreated){
            //It means slots were created

            var slots = slotsCreatedArr[0].phaseWiseSlots[0].slots;

            var lastSlotTimeArr = slots[slots.length-1].startTime.split(":");
            var lastSlotTimeHr = parseInt(lastSlotTimeArr[0]);
            var lastSlotTimeMin = parseInt(lastSlotTimeArr[1]);
            // console.log("lastSlotTimeArr",lastSlotTimeArr)
            // console.log("lastSlotTimeHr",lastSlotTimeHr)
            // console.log("lastSlotTimeMin",lastSlotTimeMin)
            if(currTimeWithLeadTime >= lastSlotTimeHr){
               var dt = 1;
               var next = getNextDay(dt);
               var nextDate = next.nextDate;
               var nextDay = next.nextDay;               
               // console.log("input next => ",next);
               if(next && next.nextDay){
                  // console.log("input next.nextDate => ",next.nextDate);
                  var nextAvailableDate = checkIfWholeDayBooked(apmtSlots,next.nextDate,dt);
                  resolve(nextAvailableDate);
               }
               // console.log("output nextAvailableDate => ",nextAvailableDate);
            }else{
               resolve(currDate.format("DD-MMM-YY"));
            }
         }else{
            //It means slots were NOT created
            //Default last slot is at 6pm and default lead time is 1 hour. 
            //So if its before 5pm, we can recommend 6pm slot, else next day. 
            // console.log("currTime => ",currTime);

            if(currTime >= 19){
               var dt = 1;
               var next = getNextDay(dt);
               var nextAvailableDate = checkIfWholeDayBooked(apmtSlots,next.nextDate, dt,name);                  
               console.log("nextAvailableDate",nextAvailableDate)
               resolve(nextAvailableDate);
            }else{
               resolve(currDate.format("DD-MMM-YY"));
            }
         }

         function checkIfWholeDayBooked(apmtSlots,apmtDate,dt,name){
            console.log("checkIfWholeDayBooked apmtDate => ",apmtDate, name);
            apmtDate1 = apmtDate.format("DD-MM-YYYY");
            apmtDate2 = apmtDate.format("DD-MMM-YY");

            if(apmtSlots && apmtSlots.calendarDays.length>0){
               var dateBookings = apmtSlots.calendarDays.filter(x => x.date === apmtDate1);
               console.log("1 checkIfWholeDayBooked dateBookings ===> ",dateBookings);
               
               //When slots not created, consultant will see default 9 slots. 
               //Hence check if booked slots are less than or equal to 9 slots.

               if(dateBookings.length > 9){
                  dt++;
                  var next = getNextDay(dt);
                  apmtDate1 = next.nextDate.format("DD-MM-YYYY");

                  var disabledDay = 0;
                  while(disabledDay > -1){
                     dateBookings = apmtSlots.calendarDays.filter(x => x.date === apmtDate1);
                     disabledDay = dateBookings.findIndex(i => i.from === "");
                     //disabledDay > -1, means whole day is disabled, then find next available date.
                     if(disabledDay > -1){
                        dt++;
                        var next = getNextDay(dt);
                        apmtDate1 = next.nextDate.format("DD-MM-YYYY");
                     }else{
                        return(next.nextDate.format("DD-MMM-YY"));
                     }                     
                  }
               }else{
                  //Check if whole day is disabled. 
                  //That time, only one slot will be visible & startTime will be = ""

                  if(dateBookings.length>0){
                     var disabledDay = 0;
                     while(disabledDay > -1){
                        dateBookings = apmtSlots.calendarDays.filter(x => x.date === apmtDate1);
                        console.log("dateBookings",dateBookings)
                        disabledDay = dateBookings.findIndex(i => i.from === "");
                        console.log("disabledDay",disabledDay)
                        //disabledDay > -1, means whole day is disabled, then find next available date.
                        if(disabledDay > -1){
                           dt++;
                           var next = getNextDay(dt);
                           apmtDate1 = next.nextDate.format("DD-MM-YYYY");
                        }else{
                           if(next && next.nextDate){
                              return(next.nextDate.format("DD-MMM-YY"));
                           }
                        }                     
                     }
                  }else{
                     console.log("apmtDate2  1",apmtDate2, name)
                     return apmtDate2;
                  }
               }
            }else{
                     console.log("apmtDate2  2",apmtDate2, name)
               return(apmtDate2);
            }
         }

         function getNextDay(dt){
            var nextDate   = moment().tz("Asia/Kolkata").add(dt,'day');
            var nextDay    = nextDate.format("dddd");
            console.log("nextDate",nextDate)
            if(nextDay === "Sunday"){
               dt++;
               getNextDay(dt);                        
               nextDate = moment().tz("Asia/Kolkata").add(dt,'day');
               nextDay = nextDate.format("dddd");
            }

            var nextDateObj = {
               nextDate : nextDate,
               nextDay  : nextDay,
               nextDateFormatted : nextDate.format("DD-MM-YYYY")
            };
            return nextDateObj;
         }

      })
      .catch(error=>{
         console.log("AppointmentSlots error => ",error);
         reject(-1);
      })
   })

}
