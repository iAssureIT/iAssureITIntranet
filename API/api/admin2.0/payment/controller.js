var ObjectId = require("mongodb").ObjectID;
const globalVariable = require("../../../nodemonConfig.js");
const https = require("https");
const Order = require("../orders/model");
const RazorPay = require('razorpay')

const razorpay = new RazorPay({ key_id: globalVariable.RAZORPAY_ID, key_secret: globalVariable.RAZORPAY_SECRET })


exports.initializeTransaction = (req, res, next) => {
  const options = {
    amount: parseInt(req.body.amount),
    currency: req.body.currency,
    receipt: req.body.orderId
  };
  
  console.log("options => ",options);

  razorpay.orders.create(options, (error, order) => {

    if (error) {
      console.log("initializeTransaction error => ",error);

      res.status(200).json({
        error: error,
        success: false,
        data: {}
      })
      return
    }

    res.status(200).json({
      error: false,
      success: true,
      data: order
    })

  })

};

exports.initializeRefund = (req, res, next) => {
  Order.find({ _id: ObjectId(req.body.orderId) }).then((order) => {
    if (
      !order.length &&
      !["captured","TXN_SUCCESS"].includes(order[0].status) &&
      !order[0]?.paymentDetail?.transactionId
    ) {
      res.json({
        success: false,
        error: "order not found or txn failed.",
        data: {},
      });
      return;
    }
    razorpay.payments.refund(order[0]?.paymentDetail?.transactionId, { 'amount': 100 },
      (error, response) => {
        if (error) {
          console.log(error);
          res.status(200).json({ error: true, success: false, data: { ...error } })
          return
        }
        Order.updateOne(
          { _id: req.body.orderId },
          {
            $set: {
              "paymentDetail.refundId": response.id,
              "paymentDetail.refundStatus": response.status,
              "paymentDetail.refundMessage": response.status,
              "paymentDetail.refundAmount": response.amount,
            }
          }).then(response => {
            res.status(200).json({
              error: false,
              success: true,
              data: response
            })
          })
      })
  });
};

exports.checkRefundStatus = (req, res, next) => {
  Order.find({ _id: ObjectId(req.params.orderId) }).then((order) => {
    if (
      !order.length &&
      !["captured","TXN_SUCCESS"].includes(order[0].status) &&
      !order[0]?.paymentDetail?.refundStatus != "PENDING"
    ) {
      res.json({
        success: false,
        error: "order not found or txn failed.",
        data: {},
      });
      return;
    }

    var paytmParams = {};

    paytmParams.body = {
      mid: merchantId,
      orderId: order[0]._id,
      refId: order[0]._id,
    };

    PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      merchantKey
    ).then(function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        hostname: paytmURL,
        port: 443,
        path: "/v2/refund/status",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", function () {
          console.log("Response: ", response);
          const parsedResponse = JSON.parse(response);
          Order.updateOne(
            { _id: ObjectId(req.body.orderId) },
            {
              $set: {
                paymentDetail: {
                  ...order[0].paymentDetail,
                  refundId: parsedResponse?.body?.refundId,
                  refundStatus: parsedResponse?.body?.resultInfo?.resultStatus,
                },
              },
            }
          ).exec();

          res.json({ success: true, data: parsedResponse.body });
        });
      });

      post_req.write(post_data);
      post_req.end();
    });
  });
};


exports.fetchPaymentStatusFromRazorpay = (req, res, next) => {
  razorpay.orders.fetchPayments(req.params.orderId, (error, order) => {
    if (error) {
      res.status(200).json({
        error: error,
        success: false,
        data: {}
      })
      return
    }

    res.status(200).json({
      error: false,
      success: true,
      data: order
    })
  })
}