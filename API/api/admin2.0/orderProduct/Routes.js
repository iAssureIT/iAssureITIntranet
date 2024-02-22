const express = require("express");
const router = express.Router();

const orderProductController = require("./Controller.js");

// CREATE API - Insert order product
router.post('/post', orderProductController.insertOrderProducts); 

// READ API - Get list of order products
router.get("/get/list", orderProductController.getOrderProducts);


router.get("/get/list/:user_id", orderProductController.getUserOrderProducts);

// DELETE API - Delete an order product
router.delete("/delete/:id", orderProductController.deleteOrderProduct);

// UPDATE/PATCH API - Update an order product
router.patch("/update/:id", orderProductController.updateOrderProduct);

// GET count API
router.get("/get/count", orderProductController.getOrderProductCount);

//GET one product
router.get("/get/:id", orderProductController.getOrderProduct);

module.exports = router;