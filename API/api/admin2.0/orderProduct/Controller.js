const mongoose = require("mongoose");
const orderProduct = require("./Model.js");
const { ObjectId } = require("mongodb");

exports.insertOrderProducts = (req, res, next) => {
  console.log("req.body", req.body);

  const orderProductData = new orderProduct({
    _id: new mongoose.Types.ObjectId(),
    businessCategory: req.body.businessCategory,
    businessSubCategory: req.body.businessSubCategory,
    selectedProduct: req.body.selectedProduct,
    orderDate: req.body.orderDate,
    unitPackSize: req.body.unitPackSize,
    pricePerKg: req.body.pricePerKg,
    quantity: req.body.quantity,
    totalAmount: req.body.totalAmount,
    unitPackSize: req.body.unitPackSize,
    expectedDeliveryDate: req.body.expectedDeliveryDate,
    trackingNumber: req.body.trackingNumber,
    deliveryStatus: req.body.deliveryStatus,
    userName: req.body.userName,
  });

  orderProductData
    .save()
    .then((data) => {
      if (data) {
        res.status(200).json({
          success: true,
          message: "Data inserted successfully. ",
        });
      }
    })
    .catch((error) => {
      console.log("error => ", error);
      res.status(501).json({
        success: false,
        message: "Insert error! - " + error.message,
      });
    });
};

// exports.getOrderProducts = (req, res) => {
//   orderProduct
//     .find()

//     .populate("businessCategory")
//     .populate("businessSubCategory")
// 	.populate("selectedProduct")
// 	.populate("userName")
//     .then((orderProducts) => {
// 		console.log(orderProducts,"orderProducts")
//     //   Map the response to replace the references with names
//       const mappedResponse = orderProducts.map(  (orderProduct) =>  {
// 		console.log(orderProduct?.userName?.profile,"orderProducts")
// 		return {

//        _id:orderProduct._id,
//         selectedProduct: orderProduct.selectedProduct.name,
//         businessCategory: orderProduct.businessCategory.businessCategory,
//         businessSubCategory: orderProduct.businessSubCategory.businessSubCategory,
// 		orderDate : orderProduct.orderDate,
// 		unitPackSize : orderProduct.unitPackSize,
// 		pricePerKg:orderProduct.pricePerKg,
// 		quantity:orderProduct.quantity,
// 		totalAmount:orderProduct.totalAmount,
// 		expectedDeliveryDate:orderProduct.expectedDeliveryDate,
// 		trackingNumber:orderProduct.trackingNumber,
// 		deliveryStatus:orderProduct.deliveryStatus,
//         userName:orderProduct?.userName?.profile?.fullName,

// 	  }
// 	}
// 	  );
// console.log(mappedResponse,"mappedResponse")
//       res.status(200).json(mappedResponse);
//     })
//     .catch((error) => {
//       console.log("error => ", error);
//       res.status(500).json({ error: "Internal server error" });
//     });
// };

exports.getOrderProducts = async (req, res) => {
  try {
    const orderProducts = await orderProduct
      .find()
      .populate("businessCategory")
      .populate("businessSubCategory")
      .populate("selectedProduct")
      .populate("userName");

    const mappedResponse = orderProducts.map((orderProduct) => {
      console.log("orderProduct1", orderProduct.selectedProduct);
      return {
        _id: orderProduct?._id,
        selectedProduct: orderProduct?.selectedProduct?.name,
        businessCategory: orderProduct?.businessCategory?.businessCategory,
        businessSubCategory:
          orderProduct?.businessSubCategory?.businessSubCategory,
        orderDate: orderProduct?.orderDate,
        unitPackSize: orderProduct?.unitPackSize,
        pricePerKg: orderProduct?.pricePerKg,
        quantity: orderProduct?.quantity,
        totalAmount: orderProduct?.totalAmount,
        expectedDeliveryDate: orderProduct?.expectedDeliveryDate,
        trackingNumber: orderProduct?.trackingNumber,
        deliveryStatus: orderProduct?.deliveryStatus,
        userName: orderProduct?.userName?.profile?.fullName,
      };
    });

    console.log(mappedResponse, "mappedResponse");
    res.status(200).json(mappedResponse);
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserOrderProducts = (req, res) => {
  const userId = req.params.user_id; // Assuming the user ID is passed as a query parameter
console.log("userId",userId);
  orderProduct
    .find({ userName: ObjectId(userId) }) // Replace 'userId' with the actual field name in your schema
    .populate("businessCategory")
    .populate("businessSubCategory")
    .populate("selectedProduct")

    //   .populate("userName")
    .then((orderProducts) => {
      console.log("orderProducts", orderProducts, orderProducts.length);
      const mappedResponse = orderProducts.map((orderProduct) => {
        return {
          _id: orderProduct._id,
          selectedProduct: orderProduct.selectedProduct.name,
          businessCategory: orderProduct.businessCategory.businessCategory,
          businessSubCategory:
            orderProduct.businessSubCategory.businessSubCategory,
          orderDate: orderProduct.orderDate,
          unitPackSize: orderProduct.unitPackSize,
          pricePerKg: orderProduct.pricePerKg,
          quantity: orderProduct.quantity,
          totalAmount: orderProduct.totalAmount,
          expectedDeliveryDate: orderProduct.expectedDeliveryDate,
          trackingNumber: orderProduct.trackingNumber,
          deliveryStatus: orderProduct.deliveryStatus,
          userName: orderProduct?.userName,
          image: orderProduct.selectedProduct.image,
        };
      });

      res.status(200).json(mappedResponse);
    })
    .catch((error) => {
      console.log("error => ", error);
      res.status(500).json({ error: "Internal server error" });
    });
};

exports.getOrderProductCount = async (req, res) => {
  try {
    const count = await orderProduct.countDocuments();

    res.json({ count });
  } catch (error) {
    console.error("Error fetching order product count:", error);
    res.status(500).json({ error: "Error fetching order product count" });
  }
};

//Delete an Order Product:
exports.deleteOrderProduct = (req, res, next) => {
  const orderProductId = req.params.id;

  orderProduct
    .findByIdAndRemove(orderProductId)
    .then((deletedOrderProduct) => {
      if (!deletedOrderProduct) {
        return res.status(404).json({ error: "Order product not found" });
      }
      res.status(200).json({ message: "Order product deleted successfully" });
    })
    .catch((error) => {
      console.log("error => ", error);
      res.status(500).json({ error: "Internal server error" });
    });
};

//Update/Patch an Order Product
exports.updateOrderProduct = (req, res, next) => {
  const orderProductId = req.params.id;
  const updates = req.body;

  orderProduct
    .findByIdAndUpdate(orderProductId, updates, { new: true })
    .then((updatedOrderProduct) => {
      if (!updatedOrderProduct) {
        return res.status(404).json({ error: "Order product not found" });
      }
      res.status(200).json(updatedOrderProduct);
    })
    .catch((error) => {
      console.log("error => ", error);
      res.status(500).json({ error: "Internal server error" });
    });
};

// exports.getOrderProduct = (req, res) => {
//   const orderProductId = req.params.id;
//   console.log("req.params", req.params);
//   orderProduct
//     .findById(orderProductId)
//     .populate("businessCategory")
//     .populate("businessSubCategory")
//     .populate("selectedProduct")
//     .then((orderProduct) => {
//       if (!orderProduct) {
//         return res.status(404).json({ error: "Order product not found" });
//       }

//       const mappedResponse = {
//         selectedProduct: orderProduct.selectedProduct.name,
//         businessCategory: orderProduct.businessCategory.businessCategory,
//         businessSubCategory:
//           orderProduct.businessSubCategory.businessSubCategory,
//         orderDate: orderProduct.orderDate,
//         unitPackSize: orderProduct.unitPackSize,
//         pricePerKg: orderProduct.pricePerKg,
//         quantity: orderProduct.quantity,
//         totalAmount: orderProduct.totalAmount,
//         expectedDeliveryDate: orderProduct.expectedDeliveryDate,
//         trackingNumber: orderProduct.trackingNumber,
//         deliveryStatus: orderProduct.deliveryStatus,
//       };

//       res.status(200).json(mappedResponse);
//     })
//     .catch((error) => {
//       console.log("error => ", error);
//       res.status(500).json({ error: "Internal server error" });
//     });
// };

exports.getOrderProduct = (req, res) => {
  const orderProductId = req.params.id;
  console.log("req.params", req.params);
  orderProduct
    .findById(orderProductId)
    .populate("businessCategory")
    .populate("businessSubCategory")
    .populate("selectedProduct")
    .then((orderProduct) => {
      if (!orderProduct) {
        return res.status(404).json({ error: "Order product not found" });
      }
      console.log("orderProduct",orderProduct);
      const mappedResponse = {
        selectedProduct: orderProduct.selectedProduct,
        businessCategory: orderProduct.businessSubCategory,
        businessSubCategory:
          orderProduct.businessSubCategory,
        orderDate: orderProduct.orderDate,
        unitPackSize: orderProduct.unitPackSize,
        pricePerKg: orderProduct.pricePerKg,
        quantity: orderProduct.quantity,
        totalAmount: orderProduct.totalAmount,
        expectedDeliveryDate: orderProduct.expectedDeliveryDate,
        trackingNumber: orderProduct.trackingNumber,
        deliveryStatus: orderProduct.deliveryStatus,
        userName : orderProduct.userName
      };
      console.log("mappedResponse",mappedResponse);
      res.status(200).json(mappedResponse);
    })
    .catch((error) => {
      console.log("error => ", error);
      res.status(500).json({ error: "Internal server error" });
    });
};

