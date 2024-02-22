const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id                       : mongoose.Schema.Types.ObjectId,
    name                      : String,
    productId                 : String,
    image                     : String,                                

    description               : String,
    businessCategory                 : { type: mongoose.Schema.Types.ObjectId, ref: 'businessCategoryMaster' },
    businessSubCategory                 : { type: mongoose.Schema.Types.ObjectId, ref: 'businessSubCategoryMaster'},
    
    createdBy                 : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },


    createdAt                 : Date,
    fileName                  : String,
    updateLog                 : [
                                {
                                    updatedAt           : Date,
                                    updatedBy           : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
                                }
                                ]
});

module.exports = mongoose.model('products',productSchema);
 

// const productSchema = new mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     name: { type: String, required: true },
//     productId: { type: String, required: true },
//     // image: { type: String, required: true }, // Store only the image name
//     description: { type: String },
//     businessCategory: { type: String },
//     businessSubCategory: { type: String },
//   });
  
//   module.exports = mongoose.model('productSchema', productSchema);

  //module.exports = mongoose.model('Products', productSchema);