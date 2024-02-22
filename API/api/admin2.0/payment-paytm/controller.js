var ObjectId = require("mongodb").ObjectID;
const globalVariable = require("../../../nodemonConfig.js");
const https = require("https");
const PaytmChecksum = require("./paytmChecksum");
const Order = require("../orders/model");

const merchantId = globalVariable.MERCHANT_ID;
const merchantKey = globalVariable.MERCHANT_KEY;
const websiteName = globalVariable.WEBSITE_NAME;
const callbackUrl = globalVariable.CALLBACK_URL;
const paytmURL = globalVariable.PAYTM_URL;

exports.initializeTransaction = (req, res, next) => {
  var paytmParams = {};
  paytmParams.body = {
    requestType: "Payment",
    mid: merchantId,
    websiteName: websiteName,
    orderId: req.body.orderId,
    callbackUrl: callbackUrl,
    txnAmount: {
      value: req.body.amount,
      currency: req.body.currency,
    },
    userInfo: {
      custId: req.body.custId,
    },
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    merchantKey
  ).then(function (checksum) {
    console.log("Paytm checksum=>", checksum);
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      hostname: paytmURL,
      port: 443,
      path: `/theia/api/v1/initiateTransaction?mid=${merchantId}&orderId=${req.body.orderId}`,
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
        console.warn(req.body.amount, response, "response");
        res.status(200).json({
          token: JSON.parse(response).body.txnToken,
          order: req.body.orderId,
          mid: merchantId,
          amount: req.body.amount,
        });
      });
    });

    post_req.write(post_data);
    post_req.end();
  });
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

    var paytmParams = {};

    paytmParams.body = {
      mid: merchantId,
      txnType: "REFUND",
      orderId: order[0]._id,
      txnId: order[0].paymentDetail?.transactionId,
      refId: order[0]._id,
      refundAmount: order[0]?.netAmountPayable - order[0]?.taxValue,
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
        path: "/refund/apply",
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
          const responseParsed = JSON.parse(response);
          console.log(responseParsed?.body?.resultInfo?.resultMsg);
          Order.updateOne(
            { _id: ObjectId(req.body.orderId) },
            {
              $set: {
                paymentDetail: {
                  ...order[0].paymentDetail,
                  refundStatus: responseParsed?.body?.resultInfo?.resultStatus,
                  refundMessage: responseParsed?.body?.resultInfo?.resultMsg,
                  refundId: responseParsed?.body?.refundId,
                  refundAmount: parseInt(
                    responseParsed?.body?.refundAmount || 0
                  ),
                },
              },
            }
          ).exec();
          res.json({ success: true, data: responseParsed?.body });
        });
      });

      post_req.write(post_data);
      post_req.end();
    });
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
