const mongoose      = require("mongoose");
const Products      = require('./Model.js');
const { ObjectId } = require("mongodb");
const multer = require("multer");
const User = require('../userManagementnew/ModelUsers.js')
const {sendNotification} 	= require("../../admin2.0/common/globalFunctions");
const globalVariable			= require('../../../nodemonConfig.js');

// exports.insertProduct = (req,res,next)=>{

//     console.log("req.body",req.body);

//     const productData = new Products({
// 		_id         : new mongoose.Types.ObjectId(),
// 		name        : req.body.name,
//         productId  : req.body.productId,
//         // image       : req.body.image,
//         description : req.body.description,
//         businessCategory    : req.body.businessCategory,
//         businessSubCategory : req.body.businessSubCategory,


// 	});
 
// 	productData.save()
// 		.then( data =>{
// 			if(data){
// 				res.status(200).json({
// 					success : true,
// 					message : "Data inserted successfully. "
// 				})			
// 			}
// 		})
// 		.catch(error =>{
// 			console.log("error => ",error);
// 			res.status(501).json({
// 				success : false,
// 				message : "Insert error! - " + error.message
// 			})					
// 		})
          
// };















const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Rename the uploaded image
    }
});

const upload = multer({ storage: storage });

exports.insertProduct = (req, res, next) => {
    // upload.single('image')(req, res, function (err) { // Use the upload middleware here
      //   if (err instanceof multer.MulterError) {
      //       return res.status(400).json({ success: false, message: 'File upload error' });
      //   } else if (err) {
			// console.log(err,"err")
      //       return res.status(500).json({ success: false, message: 'Internal server error' });
      //   }

        console.log("req.body", req.body);

        // The uploaded image file can be accessed using req.file
        // const imageFilePath = req.file.path;

        const productData = new Products({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            productId: req.body.productId,
            image: req.body.image, // Store the image file path
            description: req.body.description,
            businessCategory: req.body.businessCategory,
            businessSubCategory: req.body.businessSubCategory,
            // ... Other fields ...
        });

        productData.save()
            .then(data => {
                if (data) {
                    res.status(200).json({
                        success: true,
                        message: "Data inserted successfully."
                    });
                }
            })
            .catch(error => {
                console.log("error => ", error);
                res.status(501).json({
                    success: false,
                    message: "Insert error! - " + error.message
                });
            });
    // });
};
  

// GET LIST API

// exports.getProductList = async (req, res) => {
// 	try {
// 	  const productList = await Products.find()
// 		.populate('businessCategory') // Populate the 'businessCategory' field and include only the 'name' field
// 		.populate('businessSubCategory'); // Populate the 'businessSubCategory' field and include only the 'name' field
  
// 	  // Extract the names from the populated fields
// 	  const modifiedProductList = productList.map(product => {
// 		return {
// 		  businessCategory: product.businessCategory.businessCategory,
// 		  businessSubCategory: product.businessSubCategory.businessSubCategory,
// 		  description: product.description,
// 		  name: product.name,
// 		  productId: product.productId,
// 		  updateLog: product.updateLog,
// 		  _id : product._id,
// 		  image : product.image,
// 		  // Exclude the following fields if you don't want to include them in the response
// 		};
// 	  });
  
// 	  res.status(200).json(modifiedProductList);
// 	} catch (err) {
// 	  res.status(500).json({ error: err.message });
// 	}
//   };
exports.getProductList = async (req, res) => {
	try {
	  const productList = await Products.find()
		.populate('businessCategory')
		.populate('businessSubCategory');
  
	  // Extract the filenames from the image paths and simplify the response
	  const modifiedProductList = productList.map(product => {
		// Check if the image property is present and a string

		const filename = product.image && typeof product.image === 'string'
		  ? product.image.substring(product.image.lastIndexOf('\\') + 1)
		  : null;
  
		return {
		  businessCategory: product.businessCategory.businessCategory,
		  businessSubCategory: product.businessSubCategory.businessSubCategory,
		  description: product.description,
		  name: product.name,
		  productId: product.productId,
		  updateLog: product.updateLog,
		  _id: product._id,
		  image: filename, // Use the extracted filename here
		};
	  });
  
	  res.status(200).json(modifiedProductList);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };


// exports.getProductList = async (req, res) => {
// 	try {
// 	  const productList = await Products.find()
// 		.populate({
// 		  path: 'businessCategory',
// 		  select: 'name'
// 		})
// 		.populate({
// 		  path: 'businessSubCategory',
// 		  select: 'name'
// 		});
  
// 	  const modifiedProductList = productList.map(product => {
// 		const modifiedProduct = {
// 		  description: product.description,
// 		  name: product.name,
// 		  productId: product.productId,
// 		  updateLog: product.updateLog,
// 		  _id: product._id
// 		};
  
// 		if (product.businessCategory) {
// 		  modifiedProduct.businessCategory = product.businessCategory.name;
// 		}
  
// 		if (product.businessSubCategory) {
// 		  modifiedProduct.businessSubCategory = product.businessSubCategory.name;
// 		}
  
// 		return modifiedProduct;
// 	  });
  
// 	  res.status(200).json(modifiedProductList);
// 	} catch (err) {
// 	  res.status(500).json({ error: err.message });
// 	}
//   };
  



  

  //GET COUNT API
  exports.getProductCount = async (req, res) => {
	try {
	  const productCount = await Products.countDocuments();
	  res.status(200).json({ count: productCount });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  

  //GETONE API
  exports.getOneProduct = async (req, res) => {
  try {
    const product = await Products.findOne({ _id: req.params.product_id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the image property is present and a string
    const filename = product.image && typeof product.image === 'string'
      ? product.image.substring(product.image.lastIndexOf('\\') + 1)
      : null;

    // Create a new object with the extracted filename
    const simplifiedProduct = {
      _id: product._id,
      name: product.name,
      productId: product.productId,
      image: filename, // Use the extracted filename here
      description: product.description,
      businessCategory: product.businessCategory,
      businessSubCategory: product.businessSubCategory,
      updateLog: product.updateLog,
      __v: product.__v
    };

    res.status(200).json(simplifiedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  
  
// Update API
// Patch API
// exports.patchProduct = async (req, res) => {
// 	try {
// 	  const productId = req.params.product_id;
// 	  const updateData = req.body; // Assuming your request body contains the fields to update
	  
// 	  const patchedProduct = await Products.findOneAndUpdate(
// 		{ _id: productId },
// 		{ $set: updateData }, // Use $set to update only the specified fields in updateData
// 		{ new: true } // This option returns the updated document
// 	  );
	  
// 	  if (!patchedProduct) {
// 		return res.status(404).json({ message: 'Product not found' });
// 	  }
	  
// 	  res.status(200).json(patchedProduct);
// 	} catch (err) {
// 	  res.status(500).json({ error: err.message });
// 	}
//   };
  
exports.patchProduct = async (req, res) => {
	try {
	  const productId = req.params.product_id;
	  const updateData = req.body; // Assuming your request body contains the fields to update
  
	  // Check if the image property is present and a string
	  if (updateData.image && typeof updateData.image === 'string') {
		// Extract the filename from the image path
		const filename = updateData.image.substring(updateData.image.lastIndexOf('\\') + 1);
		updateData.image = filename; // Update the image field with the extracted filename
	  }
  
	  const patchedProduct = await Products.findOneAndUpdate(
		{ _id: productId },
		{ $set: updateData }, // Use $set to update only the specified fields in updateData
		{ new: true } // This option returns the updated document
	  );
  
	  if (!patchedProduct) {
		return res.status(404).json({ message: 'Product not found' });
	  }
  
	  res.status(200).json(patchedProduct);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  
  
  //DELETE API
  exports.deleteProduct = async (req, res) => {
	try {
	  const deletedProduct = await Products.findOneAndRemove({
		_id: req.params.product_id,
	  });
	  res.status(200).json(deletedProduct);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };


  // GET endpoint to get a list of products with pagination
  exports.fetchProduct = async (req, res) => {
	try {
	  const startRange = parseInt(req.query.startRange) || 0;
	  const limitRange = parseInt(req.query.limitRange) || 10;
  
	  const productList = await Products.find()
		.sort({ createdAt: -1 })
		.skip(startRange)
		.limit(limitRange)
		.exec();
  
	  res.status(200).json(productList);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  
//Get endpoint that retrieves a list of products based on both the category and subcategory
//   exports.getProductListByCategoryAndSubcategory = async (req, res) => {
  
//     const { category, subcategory } = req.params;

//     const selector = {};
//     if (category !== "") {
//       selector["businessCategory"] = ObjectId(category);
//     }
//     if (subcategory !== "") {
//       selector["businessSubCategory"] = ObjectId(subcategory);
//     }
//     console.log("selector", selector);


// 	Products.find(selector)
// 	.populate("businessCategory")
// 	.populate("businessSubCategory")

// 	.then(data =>{
// 		var productData = data.map((value,i)=>{
// 			return{
// 				_id                            : value._id,
// 				name                           : value.name,
// 				productId                      : value.productId,
// 				description                    : value.description,
// 				businessCategory               : value.businessCategory.businessCategory,
// 				businessSubCategory            : value.businessSubCategory.businessSubCategory,
// 			}
// 		  })
// 		console.log(data,"data")
// 		res.status(200).json({
// 			success : true,
// 			message : "Following Search Results Found!",
// 			data 	: productData
// 		})	
// 	}
// 	)
// 	.catch(error => {
// 		console.log("error => ",error);
// 		res.status(500).json({
// 			success : false,
// 			message : "Error occured during search "+error.message
// 		})			
// 	})


// };

exports.getProductListByCategoryAndSubcategory = async (req, res) => {
  const { category, subcategory } = req.params;

  const selector = {};
  if (category !== "") {
    selector["businessCategory"] = ObjectId(category);
  }
  if (subcategory !== "") {
    selector["businessSubCategory"] = ObjectId(subcategory);
  }
  console.log("selector", selector);

  Products.find(selector)
    .populate("businessCategory")
    .populate("businessSubCategory")

    .then(data => {
      var productData = data.map((value, i) => {
        // Check if the image property is present and a string
        const filename = value.image && typeof value.image === "string"
          ? value.image.substring(value.image.lastIndexOf('\\') + 1)
          : null;

        return {
          _id: value._id,
          name: value.name,
          productId: value.productId,
          description: value.description,
          businessCategory: value.businessCategory.businessCategory,
          businessSubCategory: value.businessSubCategory.businessSubCategory,
          image: filename, // Use the extracted filename here
        };
      });
      
      console.log(data, "data");
      res.status(200).json({
        success: true,
        message: "Following Search Results Found!",
        data: productData,
      });
    })
    .catch(error => {
      console.log("error => ", error);
      res.status(500).json({
        success: false,
        message: "Error occurred during search " + error.message,
      });
    });
};

// exports.emailForShowInterest = async (req, res) => {
//   try {
//     // console.log(req.body)
    
//       const userDetails = await getUserDetailsWith_id(req.body.user_id);
//    console.log(userDetails.user.profile,"userDetails.profile")
//       const userNotificationValues = {
      
//           "event": "ExpressIntrest",
//           "toUser_id": userDetails.user.profile._id.toString(),
//           // "toEmail": userDetails.user.profile.email,
//           "toEmail": "nmangawade@gmail.com",
//           "toMobileNumber": userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
//           "toUserRole": 'user',
//           "userDetails": userDetails.user,
//           "variables": {
//               UserFullName: userDetails.user.profile.fullName,
//               ProductName: req.body.productName
//           }
//       };

//       console.log("userNotificationValues",userNotificationValues)
//       const notificationResult = await sendNotification(userNotificationValues);
     

//       // Respond with success message and inserted product
//       res.status(200).json({
//           message: 'Product created successfully and notification sent.',
         
//       });
//   } catch (error) {
//       // Handle errors and respond with an error message
//       res.status(500).json({ error: 'An error occurred while creating the product.' });
//   }
// };

// exports.emailForShowInterest = async (req, res) => {
//   try {
//     const userDetails = await getUserDetailsWith_id(req.body.user_id);
//       // Rest of the existing code...

//       const userNotificationValues = {
//                  "event": "ExpressIntrest",
//           "toUser_id": userDetails.user.profile._id.toString(),
//           // "toEmail": userDetails.user.profile.email,
//           "toEmail": "nmangawade@gmail.com",
//           "toMobileNumber": userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
//           "toUserRole": 'user',
//           "userDetails": userDetails.user,
//           "variables": {
//               UserFullName: userDetails.user.profile.fullName,
//               ProductName: req.body.productName
//           }
//       };
//       const notificationResult = await sendNotification(userNotificationValues);
//       // Rest of the existing code...

//       res.status(200).json({
//           message: 'Notification sent successfully.',
//           // Other properties...
//       });
//   } catch (error) {
//       res.status(500).json({ error: 'An error occurred while sending notification of the product.' });
//   }
// };
exports.getUserDetailsWith_id = async (userId) => {
  console.log(userId, "userId", typeof userId)
  try {
    const userDetails = await User.findOne({ _id: ObjectId(userId) });

    if (!userDetails) {
      throw new Error('User not found');
    }

    return { user: userDetails };

  } catch (error) {
    console.log (error, "error")
    throw new Error(`Error getting user details: ${error.message}`);
  }
};

exports.emailForShowInterest = async (req, res) => {
  console.log(req.body, "req.body")
  try {
    const userDetails = await exports.getUserDetailsWith_id(req.body.user_id); // Use exports to reference the function

    const userNotificationValues = {
      event: "ExpressInterest",
      toUser_id: req.body.user_id,
      toEmail: globalVariable.adminAccountEmail,
      toMobileNumber: userDetails.user.profile.isdCode + userDetails.user.profile.mobile,
      toUserRole: 'user',
      userDetails: userDetails.user,
      variables: {
        UserFullName: userDetails.user.profile.fullName,
        ProductName: req.body.productName
      }
    };

    const notificationResult = await sendNotification(userNotificationValues);
    console.log(notificationResult,"notificationResult")
    console.log("userNotificationValues", userNotificationValues)

    res.status(200).json({
      message: 'Notification sent successfully.',
      // Other properties...
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: 'An error occurred while sending notification of the product.' });
  }
};








