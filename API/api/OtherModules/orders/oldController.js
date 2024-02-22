const mongoose              = require("mongoose");
const Orders                = require('./Model');
const Carts                 = require('../cart/Model');
const Masternotifications   = require('../../coreAdmin/notificationManagement/ModelMasterNotification.js');
const User                  = require('../../coreAdmin/userManagement/ModelUsers.js');
const BusinessAssociate     = require('../businessAssociate/Model');
const ReturnedProducts      = require('../returnedProducts/Model');
const Products              = require('../products/Model');
var request                 = require('request-promise');  
const gloabalVariable 	    = require('../../../nodemon');
const moment                = require('moment-timezone');
var ObjectId                = require('mongodb').ObjectID;


exports.insert_orders = (req,res,next)=>{ 
  if(req.body.cartItems.length>0){
    for(k=0;k<req.body.cartItems.length;k++){
      Products.updateOne( 
          {"_id": req.body.cartItems[k].product_ID},
          { $inc: {
              "availableQuantity" : -(req.body.cartItems[k].quantity),
          }
      })
      .then()
      .catch();
    }
  }

  User.findOne({"_id":req.body.user_ID})
  .exec()
  .then(data=>{

      const order = new Orders({
          _id               : new mongoose.Types.ObjectId(),
        "orderID"           : Math.round(new Date().getTime()/1000),
        "user_ID"           : req.body.user_ID,
        "userName"          : data.profile.emailId,
        "userFullName"      : data.profile.fullName,
        "total"             : req.body.total,
        "currency"          : 'inr',
        "cartTotal"         : req.body.cartTotal,
        "discount"          : req.body.discount,
        "status"            : "UnPaid",
        "createdAt"         : new Date(),
        "products"          : req.body.cartItems,
        "paymentMethod"     : req.body.paymentMethod,
        "productLength"     : req.body.cartItems.length,
        "cartQuantity"      : req.body.cartQuantity,
        'deliveryAddress'   : {
                                "name"            : req.body.deliveryAddress.name,
                                "email"           : req.body.deliveryAddress.email,
                                "addressLine1"    : req.body.deliveryAddress.addressLine1,
                                "addressLine2"    : req.body.deliveryAddress.addressLine2,
                                "pincode"         : req.body.deliveryAddress.pincode,
                                "city"            : req.body.deliveryAddress.city,
                                "state"           : req.body.deliveryAddress.state,
                                "stateCode"       : req.body.deliveryAddress.stateCode,
                                "mobileNumber"    : req.body.deliveryAddress.mobileNumber,
                                "district"        : req.body.deliveryAddress.district,
                                "country"         : req.body.deliveryAddress.country,
                                "countryCode"     : req.body.deliveryAddress.countryCode,
                                "addType"         : req.body.deliveryAddress.addType
                              },
        "deliveryStatus"   : [
            {
              "status"            : "New Order",
              "Date"              : new Date(),
              "Userid"            : req.body.user_ID,
            }
        ],
      });
      order.save()
      .then(orderdata=>{
          
          var header = "<table><tbody><tr><td align='center' width='100%'><a><img src='http://http://anashandicrafts.iassureit.com/images/anasLogo.png' style='width:25%'></a></td></tr></table>";
          var body = "";
          var footer = "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
          footer += "<span style='color:#fff'>AnasHandicraft Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
          footer += "<span style='float:right;color:#fff'>anashandicraft@gmail.com</span></td></tr></tbody></table>"
          
          var mailSubject, mailText, smsText;
          Masternotifications.findOne({"templateType":"Email","templateName":"Order Placed Successfully"})
              .exec()
              .then((maildata)=>{
                
                if (maildata) {
                  mailSubject = maildata.subject != '' ? maildata.subject : "Your order is placed successfully.";
                    var variables = {
                      "username"      : data.profile.fullName
                    }
                  
                    var content = maildata.content;
                    if(content.indexOf('[') > -1 ){
                      var wordsplit = content.split('[');
                    }
            
                    var tokens = [];
                    var n = 0;
                    for(i=0;i<wordsplit.length;i++){
                      if(wordsplit[i].indexOf(']') > -1 ){
                        tokensArr = wordsplit[i].split(']');
                        tokens[n] = tokensArr[0];
                        n++;
                      }
                    }
                    var numOfVar = Object.keys(variables).length;
            
                    for(i=0; i<numOfVar; i++){
                      var tokVar = tokens[i].substr(1,tokens[i].length-2);
                      content = content.replace(tokens[i],variables[tokens[i]]);
                    }
                    content = content.split("[").join(" ");
                    content = content.split("]").join(" ");

                    body += "<table><tr><td>"+content+"</td></tr></table>";
                    body += "<tr><b><p>Your order will be sent to:</p></b>";
                    
                    body += "<p style='margin:0'>"+orderdata.deliveryAddress.name+"</p>";
                    body += "<p style='margin:0'>"+orderdata.deliveryAddress.addressLine1+"</p>";
                    if (orderdata.deliveryAddress.addressLine2) {
                        body += "<p style='margin:0'>"+orderdata.deliveryAddress.addressLine2+"</p>";
                    }
                    body += "<p style='margin:0'>"+orderdata.deliveryAddress.city+" "+orderdata.deliveryAddress.district +" "+orderdata.deliveryAddress.state+" "+orderdata.deliveryAddress.pincode+"</p>";
                    body += "<p style='margin:0'>"+orderdata.deliveryAddress.country+"</p></tr>";
                    body += "</tbody></table>";

                    body += "<h3>Order Details</h3>";
                    body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";
                    
                    cartArray.map((productdata,index)=>{

                      body += "<tr><td>"+productdata.productName+"</td><td>"+productdata.discountedPrice+"</td><td>"+productdata.quantity+"</td><td>"+productdata.total+"</td></tr>";
                    })
                    
                    body += "</tbody></table><br>";

                }else{
                  mailSubject = "Your order is placed successfully.";
                  body += "<table><tr><td><h3>Dear "+data.profile.fullName+", </h3>\n";
                  body += "<p>Thank you for your order. We’ll send a confirmation when your order ships.</p></tr>";
                  
                  body += "<tr><b><p>Your order will be sent to:</p></b>";
                  body += "<p style='margin:0'>"+orderdata.deliveryAddress.name+"</p>";
                  body += "<p style='margin:0'>"+orderdata.deliveryAddress.addressLine1+"</p>";
                  if (orderdata.deliveryAddress.addressLine2) {
                    body += "<p style='margin:0'>"+orderdata.deliveryAddress.addressLine2+"</p>";
                  }
                  body += "<p style='margin:0'>"+orderdata.deliveryAddress.city+" "+orderdata.deliveryAddress.district +" "+orderdata.deliveryAddress.state+" "+orderdata.deliveryAddress.pincode+"</p>";
                  body += "<p style='margin:0'>"+orderdata.deliveryAddress.country+"</p></tr>";
                  body += "</tbody></table>";

                  body += "<h3>Order Details</h3>";
                  body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";
                  
                  req.body.cartItems.map((productdata,index)=>{

                    body += "<tr><td>"+productdata.productName+"</td><td>"+productdata.discountedPrice+"</td><td>"+productdata.quantity+"</td><td>"+productdata.subTotal+"</td></tr>";
                  })
                  
                  
                  body += "</tbody></table><br>";
                  
                }
                //body += footer;
                // console.log('body',body)
                // request({
                //     "method"    : "POST",
                //     "url"       : "http://localhost:" + gloabalVariable.PORT + "/send-email",
                //     "body"      :   {
                //                         "email"     : data.profile.emailId,
                //                         "subject"   : mailSubject,
                //                         "text"      : mailSubject,
                //                         "mail"      : body 
                //                         //"mail"      : 'Hello '+data.profile.fullName+','+'\n'+mailText,
                //                         // "mail"      : 'Hello '+data.profile.fullName+','+'\n'+"\n <br><br>Your Order has been placed successfully and will be dispached soon."+"<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team GangaExpress',
                //                     },
                //     "json"      : true,
                //     "headers"   : { "User-Agent": "Test App" }
                //   })
                //   .then((sentemail)=>{
                //       res.header("Access-Control-Allow-Origin","*");
                //       res.status(200).json({ "message": 'Order placed successfully' });
                //   })
                //   .catch((err) =>{
                //     console.log('e', error);
                //       res.status(500).json({
                //           error: err
                //       });
                //   }); 
              })
              .catch()          
          
          
          // request({
          //   "method"    : "POST",
          //   "url"       : "http://localhost:"+gloabalVariable.PORT+"/send-email",
          //   "body"      :  {
          //                       "email"     : "iassureitmail@gmail.com",
          //                       "subject"   : 'Order Placed Successfully',
          //                       "text"      : "WOW Its done",
          //                       "mail"      : 'Hello '+'Admin'+','+'\n'+"\n <br><br>You have an order placed by "+data.profile.fullName+"."+"<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team AnasHandicraft',
          //                 },
          //   "json"      : true,
          //   "headers"   : {
          //                   "User-Agent": "Test App"
          //               }
          // })
          // .then((sentemail)=>{
          //     res.header("Access-Control-Allow-Origin","*");
          //     res.status(200).json({message:"Mail Sent successfully"});
          // })
          // .catch((err) =>{
          //     res.status(500).json({
          //         error: err
          //     });
          // });
          Carts.findOne({"user_ID":req.body.user_ID})
          .exec()
          .then(userCart=>{
              if(userCart){
                  Carts.updateOne(
                      {"_id": userCart._id},
                      { $set: {
                      "cartItems" : [],
                      "cartTotal" : 0
                      }
                  })
                  .exec()
                  .catch(error=>{
                      res.status(500).json({
                          error1: error
                      });
                  })
              }
          })
          .catch(error=>{
              res.status(500).json({
                  error2: error
              });
          })
          res.status(200).json({
              "message": "Order Placed Successfully.",
              "order_ID" : orderdata._id
          });
      })
      .catch(err=>{
        console.log('e1', error);
          res.status(500).json({
              error1: error
          });
      })
  
  })
  .catch(err =>{
    console.log('e3', error);
      res.status(500).json({
          error3: err
      });
  });
};
exports.update_order = (req,res,next)=>{
    Orders.updateOne(
            { _id:req.body.order_ID}, 
            {
                $set:{
                    user_ID                   : req.body.user_ID,
                    emailID                   : req.body.emailID,
                    userFullName              : req.body.userFullName,
                    numericOrderID            : req.body.numericOrderID,
                    cartTotal                 : req.body.cartTotal,
                    currency                  : req.body.currency,
                    totalAmount               : req.body.totalAmount,
                    transactionID             : req.body.transactionID,
                    status                    : req.body.status,
                    products                  : req.body.products,
                    paymentMethod             : req.body.paymentMethod,
                    productLength             : req.body.productLength,
                    totalQuantity             : req.body.totalQuantity,
                    deliveryAddress           : req.body.deliveryAddress,
                    deliveryStatus            : req.body.deliveryStatus,
                    createdAt                 : new Date()
                }
            }
        )
        .exec()
        .then(data=>{
            if(data.nModified == 1){
                res.status(200).json({
                    "message": "Order Updated Successfully."
                });
            }else{
                res.status(401).json({
                    "message": "Order Not Found"
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
exports.list_order = (req,res,next)=>{
    Orders.find({}).sort({createdAt:-1})      
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
exports.vendor_order_list = (req,res,next)=>{
  Orders.aggregate([
    { "$unwind": "$products" },
    { "$lookup": {
        "from": "products",
        "as": "products.productDetail",
        "localField": "products.product_ID",
        "foreignField": "_id"
    }},
    { "$unwind": "$products.productDetail" },
    { "$match" : { "products.vendor_ID" : ObjectId(req.params.vendorID) } },
    { "$group": {
        "_id": "$_id",
        "orderID":{ "$first": "$orderID" },
        "userFullName":{ "$first": "$userFullName" },
        "products": { "$push": "$products" },
        "cartQuantity":{ "$first": "$cartQuantity" },
        "status":{ "$first": "$status" },
      }
    },
  ])
  .skip(parseInt(req.body.startRange))
  .limit(parseInt(req.body.limitRange))   
  .exec()
  .then(data=>{
      var tableData = data.map((a, i)=>{
        return {"orderID" : a.orderID,
        "userFullName" : a.userFullName,
        "products" : ((a.products.map((b,j)=>{return '<div><p>Product Name: '+b.productName+'</p><p>Product Code: '+b.productDetail.productCode+'-'+b.productDetail.itemCode+'</p><p>Sell Quantity: '+b.quantity+'</p><p>Price: <span class="ororiginalPrice">'+(b.discountPercent > 0 ? b.originalPrice : '')+'</span>  <span>'+b.discountedPrice+'</span>  <span class="orPercent">'+(b.discountPercent > 0 ? b.discountPercent+'%' : '')+'</span>  </p>'+'</div><br/>'})).toString()).replace(/,/g, " "),
        "cartQuantity":a.cartQuantity,
        "status":a.status}
      })
      res.status(200).json(tableData);
  })
  .catch(err =>{
      console.log(err);
      res.status(500).json({
          error: err
      });
  });
};
exports.vendor_order_count = (req,res,next)=>{
  Orders.aggregate([
    { "$unwind": "$products" },
    { "$lookup": {
        "from": "products",
        "as": "products.productDetail",
        "localField": "products.product_ID",
        "foreignField": "_id"
    }},
    { "$unwind": "$products.productDetail" },
    { "$match" : { "products.vendor_ID" : ObjectId(req.params.vendorID) } },
    { "$group": {
        "_id": "$_id",
        "products": { "$push": "$products" },
        
       }
    },
    {   
      "$count": "dataCount"
    },
  ])
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
exports.list_orderby_status = (req,res,next)=>{
    Orders.aggregate([
    { "$match": { "deliveryStatus.status" :  req.params.status} },
    { "$redact":
        {
            "$cond": {
               "if": { "$eq": [ { "$arrayElemAt": [ "$deliveryStatus.status", -1 ] }, req.params.status ] },
               "then": "$$KEEP",
               "else": "$$PRUNE"
            }
        }
    }
    ]).sort({createdAt:-1})      
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
exports.vendor_orderlistby_status = (req,res,next)=>{
  Orders.aggregate([
    { "$unwind": "$products" },
    { "$lookup": {
        "from": "products",
        "as": "products.productDetail",
        "localField": "products.product_ID",
        "foreignField": "_id"
    }},
    { "$unwind": "$products.productDetail" },
    { "$match" : { "products.vendor_ID" : ObjectId(req.params.vendorID) } },
    { "$group": {
        "_id": "$_id",
        "orderID":{ "$first": "$orderID" },
        "userFullName":{ "$first": "$userFullName" },
        "products": { "$push": "$products" },
        "cartQuantity":{ "$first": "$cartQuantity" },
        "status":{ "$first": "$status" },
        "deliveryStatus":{"$first":"$deliveryStatus"}
      }
    },
    { "$match": { "deliveryStatus.status" :  req.body.status} },
      { "$redact":
          {
              "$cond": {
                  "if": { "$eq": [ { "$arrayElemAt": [ "$deliveryStatus.status", -1 ] }, req.body.status ] },
                  "then": "$$KEEP",
                  "else": "$$PRUNE"
              }
          }
      }
  ])
  .sort({createdAt:-1})     
  .skip(parseInt(req.body.startRange))
  .limit(parseInt(req.body.limitRange))    
  .exec()
  .then(data=>{
    var tableData = data.map((a, i)=>{
      return {"orderID" : a.orderID,
      "userFullName" : a.userFullName,
      "products" : ((a.products.map((b,j)=>{return '<div><p>Product Name: '+b.productName+'</p><p>Product Code: '+b.productDetail.productCode+'-'+b.productDetail.itemCode+'</p><p>Sell Quantity: '+b.quantity+'</p><p>Price: <span class="ororiginalPrice">'+(b.discountPercent > 0 ? b.originalPrice : '')+'</span>  <span>'+b.discountedPrice+'</span>  <span class="orPercent">'+(b.discountPercent > 0 ? b.discountPercent+'%' : '')+'</span>  </p>'+'</div><br/>'})).toString()).replace(/,/g, " "),
      "cartQuantity":a.cartQuantity,
      "status":a.status}
    })
    res.status(200).json(tableData);
  })
  .catch(err =>{
      console.log(err);
      res.status(500).json({
          error: err
      });
  });
};
exports.list_order_by_ba = (req,res,next)=>{

    Orders.find({businessAssociate : req.params.ba_ID}).sort({createdAt:-1})     
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


exports.list_order_with_limits = (req,res,next)=>{
    Orders.find({}).sort({createdAt:-1})
    .exec()
    .then(data=>{
        // var allData = data.map((x, i)=>{
        //     return {
        //         "_id"                   : x._id,
        //         "orderCode"           : x.orderID,
        //         "orderName"           : x.orderName,
        //         "featured"              : x.featured,
        //         "exclusive"             : x.exclusive,
        //         "status"                : x.status
        //     }
        // })
        res.status(200).json(data);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
exports.count_order = (req,res,next)=>{
    Orders.find({})
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
exports.fetch_order = (req,res,next)=>{
    Orders.findOne({_id : req.params.orderID}).sort({createdAt:-1})
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
exports.delete_order = (req,res,next)=>{
    Orders.deleteOne({_id:req.params.orderID})
    .exec()
    .then(data=>{
        res.status(200).json({
            "message": "Order Deleted Successfully."
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
 
exports.updateDeliveryStatus = (req,res,next)=>{

  /*Masternotifications.findOne({"templateType":"SMS","templateName":"Order Delivered"})
  .exec()
  .then((smsdata)=>{
      var textcontent = smsdata.content;                              
      var regex = new RegExp(/(<([^>]+)>)/ig);
      var textcontent = smsdata.content.replace(regex, '');
      textcontent   = textcontent.replace(/\&nbsp;/g, '');
      DeliverySmsText = textcontent;
  })
  .catch()*/

    var status = req.body.status == "Delivered & Paid" ? "Paid" : "UnPaid";
    console.log(req.body.status);

    Orders.updateOne(
            { _id : req.body.orderID}, 
            {
                $push:{
                    deliveryStatus : [
                                        {
                                          status : req.body.status,
                                          Date   : new Date(), 
                                          userid : req.body.userid
                                        }
                                    ]             
                },
                status: status  
            }
            )
            .exec()
                .then(data=>{
                    // console.log(data);
                    if(data.nModified == 1){
                      if(status == 'Paid'){

                            request({
                             "method"    : "POST",
                             "url"       : "http://localhost:"+gloabalVariable.PORT+"/send-email",
                             "body"      :  {
                                                 "email"     : "priyanka.kale@iassureit.com",
                                                 "subject"   : 'Order delivered Successfully',
                                                 "text"      : "WOW Its done",
                                                 "mail"      : 'Hello '+'Admin'+','+'\n'+"\n <br><br>Order delivered successfully."+"<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team GangaExpress',
                                            },
                             "json"      : true,
                             "headers"   : {
                                             "User-Agent": "Test App"
                                         }
                            })
                            .then((sentemail)=>{
                                res.header("Access-Control-Allow-Origin","*");
                                res.status(200).json({message:"Mail Sent successfully"});
                            })
                            .catch((err) =>{
                                res.status(500).json({
                                    error: err
                                });
                            });
                            Orders.findOne({_id:req.body.orderID})
                            .exec()
                            .then(orderData =>{
                              User.findOne({_id : orderData.user_ID})
                              .exec()
                              .then(customerData =>{
                                var header = "<table><tbody><tr><td align='center' width='100%'><a><img src='http://qagangaexpress.iassureit.com/images/GangaExpress.png' style='width:25%'></a></td></tr></table>";
                                var body = "";
                                var footer = "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
                                footer += "<span style='color:#fff'>GangaExpress Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
                                footer += "<span style='float:right;color:#fff'>gangaexpress@gmail.com</span></td></tr></tbody></table>"
                                
                                var mailSubject, mailText, smsText;

                                if(customerData){ 
                                  Masternotifications.findOne({"templateType":"Email","templateName":"Order Delivered"})
                                  .exec()
                                  .then((maildata)=>{
                                      if (maildata) {
                                      mailSubject = maildata.subject != '' ? maildata.subject : "Your order is delivered successfully.";
                                        var variables = {
                                          "username"      : customerData.profile.fullName
                                        }
                                      
                                        var content = maildata.content;
                                        if(content.indexOf('[') > -1 ){
                                          var wordsplit = content.split('[');
                                        }
                                
                                        var tokens = [];
                                        var n = 0;
                                        for(i=0;i<wordsplit.length;i++){
                                          if(wordsplit[i].indexOf(']') > -1 ){
                                            tokensArr = wordsplit[i].split(']');
                                            tokens[n] = tokensArr[0];
                                            n++;
                                          }
                                        }
                                        var numOfVar = Object.keys(variables).length;
                                
                                        for(i=0; i<numOfVar; i++){
                                          var tokVar = tokens[i].substr(1,tokens[i].length-2);
                                          content = content.replace(tokens[i],variables[tokens[i]]);
                                        }
                                        content = content.split("[").join(" ");
                                        content = content.split("]").join(" ");

                                        body += "<table><tr><td>"+content+"</td></tr></table>";
                                        body += "<tr><b><p>Your order is delivered to:</p></b>";
                                        
                                        body += "<p style='margin:0'>"+orderData.deliveryAddress.name+"</p>";
                                        body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine1+"</p>";
                                        body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine2+"</p>";
                                        body += "<p style='margin:0'>"+orderData.deliveryAddress.city+" "+orderData.deliveryAddress.state+" "+orderData.deliveryAddress.pincode+"</p>";
                                        body += "<p style='margin:0'>"+orderData.deliveryAddress.country+"</p></tr>";
                                        body += "</tbody></table>";

                                        body += "<h3>Order Details</h3>";
                                        body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";
                                        
                                        orderData.products.map((productdata,index)=>{

                                          body += "<tr><td>"+productdata.productName+"</td><td>"+productdata.discountedPrice+"</td><td>"+productdata.quantity+"</td><td>"+productdata.total+"</td></tr>";
                                        })
                                        
                                        body += "</tbody></table><br>";

                                    }else{
                                      mailSubject = "Your order is delivered successfully.";
                                      body += "<table><tr><td><h3>Dear "+customerData.profile.fullName+", </h3>\n";
                                      body += "<p>Thank you for your order. Your order is delivered successfully.</p></tr>";
                                      
                                      body += "<tr><b><p>Your order is delivered to:</p></b>";
                                      body += "<p style='margin:0'>"+orderData.deliveryAddress.name+"</p>";
                                      body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine1+"</p>";
                                      body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine2+"</p>";
                                      body += "<p style='margin:0'>"+orderData.deliveryAddress.city+" "+orderData.deliveryAddress.state+" "+orderData.deliveryAddress.pincode+"</p>";
                                      body += "<p style='margin:0'>"+orderData.deliveryAddress.country+"</p></tr>";
                                      body += "</tbody></table>";

                                      body += "<h3>Order Details</h3>";
                                      body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";
                                      
                                      orderData.products.map((productdata,index)=>{

                                        body += "<tr><td>"+productdata.productName+"</td><td>"+productdata.discountedPrice+"</td><td>"+productdata.quantity+"</td><td>"+productdata.total+"</td></tr>";
                                      })
                                      
                                      
                                      body += "</tbody></table><br>";
                                     
                                    }
                                    //body += footer;
                                      request({
                                       "method"    : "POST",
                                       "url"       : "http://localhost:"+gloabalVariable.PORT+"/send-email",
                                       "body"      :   {
                                                           "email"     : customerData.profile.emailId,
                                                           "subject"   : mailSubject,
                                                           "text"      : mailSubject,
                                                           "mail"      : body
                                                           //"mail"      : 'Hello '+customerData.profile.fullName+','+'\n'+"\n <br><br>"+DeliveryMailText+"<b></b>"+'\n'+'\n'+'<br><br>\nRegards,<br>Team GangaExpress',
                                                       },
                                       "json"      : true,
                                       "headers"   : {
                                                       "User-Agent": "Test App"
                                                   }
                                      })
                                      .then((sentemail)=>{
                                          res.header("Access-Control-Allow-Origin","*");
                                          res.status(200).json({message:"Mail Sent successfully"});
                                      })
                                      .catch((err) =>{
                                          res.status(500).json({
                                              error: err
                                          });
                                      });
                                     
                                      /*const client4 = new plivo.Client('MAMZU2MWNHNGYWY2I2MZ', 'MWM1MDc4NzVkYzA0ZmE0NzRjMzU2ZTRkNTRjOTcz');
                                      const sourceMobile4 = "+919923393733";
                                      var text4 = DeliverySmsText;
                                     
                                      client4.messages.create(
                                       src=sourceMobile4,
                                       dst= '+91'+customerData.profile.mobileNumber,
                                       text=text4
                                      ).then((result)=> {
                                          // console.log("src = ",src," | DST = ", dst, " | result = ", result);
                                          res.status(200).json({
                                              message:"Order dilivered Successfully"
                                          });
                                      })
                                      .catch(otpError=>{
                                          return res.status(501).json({
                                               message: "Some Issue Occured While Delivering Your Order",
                                               error: otpError
                                          });
                                      });*/
                                    
                                  })
                                  .catch()  
                                    
                                }
                                    
                                  })
                                  .catch(err =>{
                                      res.status(500).json({
                                          error: err
                                      });
                                  }); 

                            })
                            .catch(err =>{
                                res.status(500).json({
                                    error: err
                                });
                            });

                      }

                        res.status(200).json({
                            "message": "Order Status is updated Successfully."
                        });
                    }else{
                        res.status(401).json({
                            "message": "Order Not Found"
                        });
                    }
                })
                .catch(err =>{
                    // console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
};


exports.changeToPreviousStatus = (req,res,next)=>{
  Orders.updateOne(
                {_id: ObjectId(req.body.orderID) }, 
                { $pop:{ deliveryStatus : 1 } }
        )
        .exec()
        .then(data=>{
          res.status(200).json({
              "message": "Order Status is updated Successfully."
          });
        })
        .catch(err =>{
            res.status(500).json({error: err});
        });
};

exports.dispatchOrder = (req,res,next)=>{
    
    /*Masternotifications.findOne({"templateType":"SMS","templateName":"Order Dispatched"})
                      .exec()
                      .then((smsdata)=>{ 
                          var textcontent = smsdata.content;                              
                          var regex = new RegExp(/(<([^>]+)>)/ig);
                          var textcontent = smsdata.content.replace(regex, '');
                          textcontent   = textcontent.replace(/\&nbsp;/g, '');                                                
                          dispatchSmsText = textcontent
                      })
                      .catch()*/
    // console.log(req.body.orderID);
    // console.log('businessAssociateId',req.body.businessAssociateId);
    Orders.updateOne(
            { _id : req.body.orderID}, 
            {
                $push:{
                    deliveryStatus  : [
                                        {
                                          status : "Dispatch",
                                          Date   : new Date(),
                                          userid : req.body.userid
                                        }
                                    ]
                },
                businessAssociate :  req.body.businessAssociateId
            }
            )
            .exec()
            .then(data=>{

                    BusinessAssociate.findOne({userID:req.body.businessAssociateId})
                    .exec()
                    .then(ba =>{
                            if(ba){   
                             request({
                             "method"    : "POST",
                             "url"       : "http://localhost:"+gloabalVariable.PORT+"/send-email",
                             "body"      :   {
                                                 "email"     : ba.emailID,
                                                 "subject"   : "You have a order to be delivered.",
                                                 "text"      : "You have a order to be delivered.",
                                                 "mail"      : 'Hello '+ba.companyName+','+'\n'+"\n <br><br>You have a order to be delivered.<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team GangaExpress',
                                             },
                             "json"      : true,
                             "headers"   : {
                                             "User-Agent": "Test App"
                                         }
                            })
                            .then((sentemail)=>{
                                res.header("Access-Control-Allow-Origin","*");
                                res.status(200).json({message:"Mail Sent successfully"});
                            })
                            .catch((err) =>{
                                res.status(500).json({
                                    error: err
                                });
                            });
                           
                            /*const client3 = new plivo.Client('MAMZU2MWNHNGYWY2I2MZ', 'MWM1MDc4NzVkYzA0ZmE0NzRjMzU2ZTRkNTRjOTcz');
                            const sourceMobile3 = "+919923393733";
                            var text3 = "Dear ba, "+'\n'+"You have a order to be delivered.\n";
                           
                            client3.messages.create(
                             src=sourceMobile3,
                             dst= '+91'+ba.mobileNo,
                             text=text3
                            ).then((result)=> {
                                // console.log("src = ",src," | DST = ", dst, " | result = ", result);
                                res.status(200).json({
                                    message:"Order dispached Successfully"
                                });
                            })
                            .catch(otpError=>{
                                // console.log("otpError",otpError);
                                return res.status(501).json({
                                     message: "Some Issue Occured While Placing Your Order",
                                     error: otpError
                                });
                            });*/ 
                          }
                          
                           
                        })
                        .catch(err =>{
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });       
                    if(data.nModified == 1){
                    
                    // send notification to customer
                    Orders.findOne({_id:req.body.orderID})
                    .exec()
                    .then(orderData =>{
                      User.findOne({_id : orderData.user_ID})
                      .exec()
                      .then(customerData =>{
                        
                        var header = "<table><tbody><tr><td align='center' width='100%'><a><img src='http://qagangaexpress.iassureit.com/images/GangaExpress.png' style='width:25%'></a></td></tr></table>";
                        var body = "";
                        var footer = "<table width='100%' bgcolor='#232f3e' height='50'><tbody><tr><td>"
                        footer += "<span style='color:#fff'>GangaExpress Copyright <i class='fa fa-copyright'></i> 2019 - 2020. All Rights Reserved.</span>";
                        footer += "<span style='float:right;color:#fff'>gangaexpress@gmail.com</span></td></tr></tbody></table>"
                        
                        var mailSubject, mailText, smsText;

                        if(customerData){   
                        var mailSubject, dispatchSmsText;
                        Masternotifications.findOne({"templateType":"Email","templateName":"Order Dispatched"})
                        .exec()
                        .then((maildata)=>{
                          
                            if (maildata) {
                                mailSubject = maildata.subject != '' ? maildata.subject : "Your order is dispatched successfully.";
                                  var variables = {
                                    "username"      : customerData.profile.fullName
                                  }
                                
                                  var content = maildata.content;
                                  if(content.indexOf('[') > -1 ){
                                    var wordsplit = content.split('[');
                                  }
                          
                                  var tokens = [];
                                  var n = 0;
                                  for(i=0;i<wordsplit.length;i++){
                                    if(wordsplit[i].indexOf(']') > -1 ){
                                      tokensArr = wordsplit[i].split(']');
                                      tokens[n] = tokensArr[0];
                                      n++;
                                    }
                                  }
                                  var numOfVar = Object.keys(variables).length;
                          
                                  for(i=0; i<numOfVar; i++){
                                    var tokVar = tokens[i].substr(1,tokens[i].length-2);
                                    content = content.replace(tokens[i],variables[tokens[i]]);
                                  }
                                  content = content.split("[").join(" ");
                                  content = content.split("]").join(" ");

                                  body += "<table><tr><td>"+content+"</td></tr></table>";
                                  body += "<tr><b><p>Your order will be sent to:</p></b>";
                                  
                                  body += "<p style='margin:0'>"+orderData.deliveryAddress.name+"</p>";
                                  body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine1+"</p>";
                                  body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine2+"</p>";
                                  body += "<p style='margin:0'>"+orderData.deliveryAddress.city+" "+orderData.deliveryAddress.state+" "+orderData.deliveryAddress.pincode+"</p>";
                                  body += "<p style='margin:0'>"+orderData.deliveryAddress.country+"</p></tr>";
                                  body += "</tbody></table>";

                                  body += "<h3>Order Details</h3>";
                                  body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";
                                  
                                  orderData.products.map((productdata,index)=>{

                                    body += "<tr><td>"+productdata.productName+"</td><td>"+productdata.discountedPrice+"</td><td>"+productdata.quantity+"</td><td>"+productdata.total+"</td></tr>";
                                  })
                                  
                                  body += "</tbody></table><br>";

                              }else{
                                mailSubject = "Your order is dispatched successfully.";
                                body += "<table><tr><td><h3>Dear "+customerData.profile.fullName+", </h3>\n";
                                body += "<p>Thank you for your order. Your order will be delivered soon.</p></tr>";
                                
                                body += "<tr><b><p>Your order will be sent to:</p></b>";
                                body += "<p style='margin:0'>"+orderData.deliveryAddress.name+"</p>";
                                body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine1+"</p>";
                                body += "<p style='margin:0'>"+orderData.deliveryAddress.addressLine2+"</p>";
                                body += "<p style='margin:0'>"+orderData.deliveryAddress.city+" "+orderData.deliveryAddress.state+" "+orderData.deliveryAddress.pincode+"</p>";
                                body += "<p style='margin:0'>"+orderData.deliveryAddress.country+"</p></tr>";
                                body += "</tbody></table>";

                                body += "<h3>Order Details</h3>";
                                body += "<table width='100%' style='border-top:1px solid #333'><thead align='left'><tr><th>Product Name</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>";
                                
                                orderData.products .map((productdata,index)=>{

                                  body += "<tr><td>"+productdata.productName+"</td><td>"+productdata.discountedPrice+"</td><td>"+productdata.quantity+"</td><td>"+productdata.total+"</td></tr>";
                                })
                                
                                
                                body += "</tbody></table><br>";
                               
                              }
                              //body += footer;
                              request({
                                 "method"    : "POST",
                                 "url"       : "http://localhost:"+gloabalVariable.PORT+"/send-email",
                                 "body"      :   {
                                                     "email"     : customerData.profile.emailId,
                                                     "subject"   : mailSubject,
                                                     "text"      : mailSubject,
                                                     "mail"      : body
                                                     //"mail"      : 'Hello '+customerData.profile.fullName+','+'\n'+"\n <br><br>"+dispatchMailText+"<b></b>"+'\n'+'\n'+' </b><br><br>\nRegards,<br>Team GangaExpress',
                                                 },
                                 "json"      : true,
                                 "headers"   : {
                                                 "User-Agent": "Test App"
                                             }
                                })
                                .then((sentemail)=>{
                                    res.header("Access-Control-Allow-Origin","*");
                                    res.status(200).json({message:"Mail Sent successfully"});
                                })
                                .catch((err) =>{
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                          
                        })
                        .catch()  
                         
                         
                       
                        /*const client4 = new plivo.Client('MAMZU2MWNHNGYWY2I2MZ', 'MWM1MDc4NzVkYzA0ZmE0NzRjMzU2ZTRkNTRjOTcz');
                        const sourceMobile4 = "+919923393733";
                        var text4 = dispatchSmsText;
                        client4.messages.create(
                         src=sourceMobile4,
                         dst= '+91'+customerData.profile.mobileNumber,
                         text=text4
                        ).then((result)=> {
                            // console.log("src = ",src," | DST = ", dst, " | result = ", result);
                            res.status(200).json({
                                message:"Order dispached Successfully"
                            });
                        })
                        .catch(otpError=>{
                            return res.status(501).json({
                                 message: "Some Issue Occured While Placing Your Order",
                                 error: otpError
                            });
                        }); */
                      }
                      
                    })
                    .catch(err =>{
                        res.status(500).json({
                            error: err
                        });
                    }); 

                    })
                    .catch(err =>{
                        res.status(500).json({
                            error: err
                        });
                    });
                        res.status(200).json({
                            "message": "Order is dispatched successfully."
                        });
                    }else{
                        res.status(401).json({
                            "message": "Order Not Found"
                        });
                    }



                })
                .catch(err =>{
                    // console.log('err2');
                    res.status(500).json({
                        error: err
                    });
                });
};



exports.list_order_by_user = (req,res,next)=>{
  console.log('user_ID',req.params.userID);

    /*Orders.find({
        "user_ID": ObjectId(req.params.userID)
      })*/
    Orders.aggregate([{ $lookup:
      {
         from: 'returnedproducts',
         localField: '_id',
         foreignField: 'orderID',
         as: 'returnProducts'
      } 
      },
      {
        $sort: {
          "createdAt": -1
        }
      },
      {
        $match:{"user_ID": ObjectId(req.params.userID)}
      }
    ])   
    .exec()
    .then(data=>{
      console.log('data', data);
      res.status(200).json(data);
    })
    .catch(err =>{
      console.log(err);
      res.status(500).json({
          error: err
      });
    });
};

exports.cancelOrder = (req,res,next)=>{
    console.log("Order cancelled");
     Orders.updateOne(
            { _id : req.body.orderID}, 
            {
                $push:{
                    deliveryStatus : [
                                        {
                                          status : 'Cancelled',
                                          Date   : new Date(),
                                          userid : req.body.userid
                                        }
                                    ]
                }
            }
            )
            .exec()
                .then(data=>{
                    // console.log(data);
                    if(data.nModified == 1){
                        res.status(200).json({
                            "message": "Order is cancelled Successfully."
                        });
                    }else{
                        res.status(401).json({
                            "message": "Order Not Found"
                        });
                    }
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({ 
                        error: err
                    });
                });
}

exports.returnOrder = (req,res,next)=>{ 
    console.log(req.body.orderID)
    console.log(req.body.productID)
      /*Orders.findOne(
            { _id : req.body.orderID, "products.product_ID":req.body.productID}
            )
            .exec()
                .then(data=>{
                  console.log(data);
                })*/
      Orders.updateOne(
            {_id : ObjectId(req.body.orderID), "products.product_ID": ObjectId(req.body.productID) }, 
            {
              $set:
                  { 
                    'products.$.status' : 'Returned',
                    'products.$.returnedDate'   : new Date(),
                  }
            } 
            )
            .exec()
                .then(data=>{
                  console.log(data);
                    if(data.nModified == 1){
                        
                        Orders.findOne({ _id : req.body.orderID, "products.product_ID":req.body.productID})
                        .exec()
                        .then(orders=>{
                          const returnedproducts = new ReturnedProducts({
                            _id                       : new mongoose.Types.ObjectId(), 
                            orderID                   : req.body.orderID,
                            altOrderID                : req.body.altorderid,
                            user_ID                   : req.body.userid,
                            product_ID                : req.body.productID,
                            reasonForReturn           : req.body.reasonForReturn, 
                            originalPrice             : orders.originalPrice,
                            discountedPrice           : orders.discountedPrice,
                            discountPercent           : orders.discountPercent,
                            dateofPurchase            : orders.createdAt,
                            modeofPayment             : orders.paymentMethod,
                            dateofReturn              : new Date(),
                            returnStatus              : [{
                                                            status:"Return Approval Pending",
                                                            date : new Date()
                                                        }],
                            refund                    : [{
                                                            bankName      : req.body.bankname,
                                                            bankAccountNo : req.body.bankacctno,
                                                            IFSCCode      : req.body.ifsccode,
                                                            amount        : orders.products[0].discountedPrice
                                                        }],                        
                            createdBy                 : req.body.userid,
                            createdAt                 : new Date()
                          })
                          returnedproducts.save()
                                  .then(data=>{
                                      res.status(200).json({"message": "Product is returned. Return process will start soon!"});
                                  })
                                  .catch(err =>{
                                      res.status(500).json({error: err});
                                  });
                        })
                        .catch(err =>{
                          res.status(500).json({error: err});
                        });
              
                    }else{
                        res.status(401).json({
                            "message": "Product Not Found"
                        });
                    }
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
}
exports.get_reports_count = (req,res,next)=>{

    Orders.find({
      createdAt: {
        $gte:  moment(req.body.startDate).startOf('day').toDate(),
        $lte:  moment(req.body.endDate).endOf('day').toDate()
      }
    }).sort({createdAt:-1})      
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

exports.get_reports = (req,res,next)=>{
    Orders.find({
      createdAt: {
        $gte:  moment(req.body.startDate).startOf('day').toDate(),
        $lte:  moment(req.body.endDate).endOf('day').toDate()
      }
    }).sort({createdAt:-1})      
        .exec()
        .then(data=>{
          
          var allData = data.map((x, i)=>{
            //console.log(x)
            return {
                "_id"                   : x._id,
                "orderID"               : (x.orderID).toString(),
                "cratedAt"              : moment(x.createdAt).format("DD/MM/YYYY hh:mm a"),
                "userFullName"          : x.userFullName,
                "totalAmount"           : (x.total).toString(),
                "deliveryStatus"        : x.deliveryStatus[x.deliveryStatus.length-1].status
            }
          })
          res.status(200).json(allData.slice(req.params.startRange, req.params.limitRange));
          //  res.status(200).json(allData);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.get_category_reports_count = (req,res,next)=>{
  var selector = {};
  if (req.body.section && req.body.category && req.body.subcategory) {
    selector = {
    createdAt: { $gte:  moment(req.body.startTime).startOf('day').toDate() },
    createdAt: { $lte:  moment(req.body.endTime).endOf('day').toDate() },
    "products.section_ID"  :  req.body.section,   
    "products.category_ID" :  req.body.category, 
    "products.subCategory_ID" : req.body.subcategory
    }
  }
  else if (req.body.section && req.body.category) {
    selector = {
    createdAt: { $gte:  moment(req.body.startTime).startOf('day').toDate() },
    createdAt: { $lte:  moment(req.body.endTime).endOf('day').toDate() },
    "products.section_ID"  :  req.body.section,    
    "products.category_ID" :  req.body.category,
    }
  }
  else if (req.body.category) {
    selector = {
    createdAt: { $gte:  moment(req.body.startTime).startOf('day').toDate() },
    createdAt: { $lte:  moment(req.body.endTime).endOf('day').toDate() },  
    "products.category_ID" :  req.body.category  
    }
  } 
  else {
    selector = {
    createdAt: {
        $gte:  moment(req.body.startTime).startOf('day').toDate(),
        $lte:  moment(req.body.endTime).endOf('day').toDate()
      }
    }
  }
  
    Orders.find(selector).sort({createdAt:-1})      
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

exports.get_category_reports = (req,res,next)=>{
  var selector = {};
  if (req.body.section && req.body.category && req.body.subcategory) {
    selector = {
    createdAt: { $gte:  moment(req.body.startTime).startOf('day').toDate() },
    createdAt: { $lte:  moment(req.body.endTime).endOf('day').toDate() },
    "products.section_ID"  :  req.body.section,   
    "products.category_ID" :  req.body.category, 
    "products.subCategory_ID" : req.body.subcategory
    }
  }
  else if (req.body.section && req.body.category) {
    selector = {
    createdAt: { $gte:  moment(req.body.startTime).startOf('day').toDate() },
    createdAt: { $lte:  moment(req.body.endTime).endOf('day').toDate() },
    "products.section_ID"  :  req.body.section,    
    "products.category_ID" :  req.body.category,
    }
  }
  else if (req.body.category) {
    selector = {
    createdAt: { $gte:  moment(req.body.startTime).startOf('day').toDate() },
    createdAt: { $lte:  moment(req.body.endTime).endOf('day').toDate() },  
    "products.category_ID" :  req.body.category  
    }
  } 
  else {
    selector = {
    createdAt: {
        $gte:  moment(req.body.startTime).startOf('day').toDate(),
        $lte:  moment(req.body.endTime).endOf('day').toDate()
      }
    }
  }
  //console.log(selector)
    Orders.find(selector).sort({createdAt:-1})      
        .exec()
        .then(data=>{
          var allData = data.map((x, i)=>{
            return {
                "_id"                   : x._id,
                "orderID"               : (x.orderID).toString(),
                "cratedAt"              : moment(x.createdAt).format("DD/MM/YYYY hh:mm a"),
                "userFullName"          : x.userFullName,
                "totalAmount"           : (x.total).toString(),
                "deliveryStatus"        : x.deliveryStatus[x.deliveryStatus.length-1].status
            }
          })
          res.status(200).json(allData.slice(req.params.startRange, req.params.limitRange));
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.ytdorders = (req,res,next)=>{
    //console.log('year',moment().tz('Asia/Kolkata').startOf('year'));
    //console.log('day',moment().tz('Asia/Kolkata').endOf('day'));

    Orders.find({
      createdAt: {
        $gte:  moment().tz('Asia/Kolkata').startOf('year'),
        $lte:  moment().tz('Asia/Kolkata').endOf('day')
      }
    }).count()     
        .exec()
        .then(data=>{
          res.status(200).json({ "dataCount": data });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};


exports.mtdorders = (req,res,next)=>{

    Orders.find({
      createdAt: {
        $gte:  moment().tz('Asia/Kolkata').startOf('month'),
        $lte:  moment().tz('Asia/Kolkata').endOf('day')
      }
    }).count()      
        .exec()
        .then(data=>{
          res.status(200).json({ "dataCount": data });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};


exports.todaysorders = (req,res,next)=>{
    Orders.aggregate([
    { "$match": { "createdAt": {$gte:  moment().tz('Asia/Kolkata').startOf('day')} }
    },
    { $count: "count" }
    ])     
    .exec()
    .then(data=>{
      if (data.length==0) {
        res.status(200).json({ "dataCount": 0 });
      }else{
        res.status(200).json({ "dataCount": data[0].count });
      }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};
 
exports.neworderscount = (req,res,next)=>{
    Orders.aggregate([
    { "$match": { "deliveryStatus.status" :  "New Order" }
    },
    { "$redact":
        {
            "$cond": {
               "if": { "$eq": [ { "$arrayElemAt": [ "$deliveryStatus.status", -1 ] }, "New Order" ] },
               "then": "$$KEEP",
               "else": "$$PRUNE"
            }
        }
    },
    {
      $count: "count"
    }
    ])     
        .exec()
        .then(data=>{
          if (data.length==0) {
            res.status(200).json({ "dataCount": 0 });
          }else{
            res.status(200).json({ "dataCount": data[0].count });
          }
          
          
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};


exports.totalOrdersByPeriod = (req,res,next)=>{
    console.log('sdash',moment(req.params.startTime).tz('Asia/Kolkata').startOf('day').toDate())
    Orders.aggregate([
      {
        $match:{
          createdAt: {
            $gte:  moment(req.params.startTime).tz('Asia/Kolkata').startOf('day').toDate()
            //$lte:  moment().tz('Asia/Kolkata').endOf('day')
          }
        }
      },
      {
          $unwind : "$products"
      },
      {
          $group : {
                  "_id":"$products.category",
                  "count": { $sum: 1 } 
              }
      }
    ])    
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


exports.totalOrdersByState = (req,res,next)=>{
    //console.log('sdash',moment(req.params.startTime).tz('Asia/Kolkata').startOf('day').toDate())
    Orders.aggregate([
      {
          $unwind : "$products"
      },
      {
          $group : {
                  "_id":"$deliveryAddress.state",
                  "count": { $sum: 1 } 
              }
      },
      {$sort : {"count" : -1}},
      {$limit : 10}
    ])    
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

exports.sectionRevenue = (req,res,next)=>{
    Orders.aggregate([
      {
          $unwind : "$products"
      },
      {
          $group : {
                  "_id":"$products.section",
                  "revenue" : {"$sum":  { $multiply: [ "$products.quantity", "$products.discountedPrice" ] }  }
              }
      },
      { $limit  :5  }
    ]).exec()
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


exports.categoryRevenue = (req,res,next)=>{
    Orders.aggregate([
      {
          $unwind : "$products"
      },
      {
          $group : {
                  "_id":"$products.category",
                  "revenue" : {"$sum":  { $multiply: [ "$products.quantity", "$products.discountedPrice" ] }  }
              }
      },
      { $limit  :5  }
    ]).exec()
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

exports.subCategoryRevenue = (req,res,next)=>{
    Orders.aggregate([
      {
          $unwind : "$products"
      },
      {
          $group : {
                  "_id":"$products.subCategory",
                  "revenue" : {"$sum":  { $multiply: [ "$products.quantity", "$products.discountedPrice" ] }  }
              }
      },
      { $limit  :5  }
    ]).exec()
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
exports.vendorWiseOrder = (req,res,next)=>{
  Orders.aggregate([
    { "$unwind": "$products" },
    { "$lookup": {
        "from": "products",
        "as": "products.productDetail",
        "localField": "products.product_ID",
        "foreignField": "_id"
    }},   
    { "$unwind": "$products.productDetail" },
    { "$group": {
        "_id": "$_id",
        
        "products": { "$push": "$products" },
    }},
    {
    "$project": {
      "_id": 1,
        "products.product_ID" : 1,
        "products.productName":1,
        "products.discountPercent":1,
        "products.discountedPrice":1,
        "products.originalPrice":1,
        "products.currency":1,
        "products.quantity":1,
        "products.subTotal":1,
        "products.saving":1,
        "products.productDetail.vendor_ID": 1,
    }
  }
]).exec()
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