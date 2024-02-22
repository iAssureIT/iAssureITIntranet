const express = require("express");
const router = express.Router();

const productController = require('./Controller.js');

router.post('/post', productController.insertProduct); //post API

// router.post('/post', upload.single('image'), productController.insertProduct);

router.post('/get/list', productController.getProductList);


router.post("/get/list/:category/:subcategory", productController.getProductListByCategoryAndSubcategory);


router.get('/get/count', productController.getProductCount);


router.get('/get/one/:product_id', productController.getOneProduct);

//update
router.patch('/patch/:product_id', productController.patchProduct);


router.delete('/delete/:product_id', productController.deleteProduct);

// GET endpoint to get a list of products with pagination
router.get('/get/list', productController.fetchProduct);

// router.post('/send-email/show-interest', productController.emailForShowInterest);
router.post('/send-email/show-interest/:productId', productController.emailForShowInterest);


module.exports = router;