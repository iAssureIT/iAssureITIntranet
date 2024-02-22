const express = require("express");
const router = express.Router();
const Controller = require("./controller.js");

router.post(
  "/post/payment/initialize-transaction",
  Controller.initializeTransaction
);
router.post("/post/payment/initialize-refund", Controller.initializeRefund);
router.get("/post/payment/refund-status/:orderId", Controller.checkRefundStatus);

module.exports = router;
