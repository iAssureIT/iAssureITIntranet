//===========  Products 	==============

db.products.createIndex({vendor_ID : 1});
db.products.createIndex({user_ID : 1});
db.products.createIndex({section : 1});
db.products.createIndex({section_ID : 1});
db.products.createIndex({category : 1});
db.products.createIndex({category_ID : 1});
db.products.createIndex({subCategory : 1});
db.products.createIndex({subCategoryUrl : 1});
db.products.createIndex({subCategory_ID : 1});
db.products.createIndex({brand : 1});
db.products.createIndex({productName : 1});
db.products.createIndex({status : 1});
db.products.createIndex({featured : 1});
db.products.createIndex({exclusive : 1});
db.products.createIndex({createdAt : 1});
db.products.createIndex({productCode : 1});
db.products.createIndex({itemCode : 1});
db.products.createIndex({fileName : 1});


//===========  Cart 	==============

db.cart.createIndex({user_ID : 1});


//===========  Categories 	==============
db.categories.createIndex({category : 1});
db.categories.createIndex({categoryUrl : 1});
db.categories.createIndex({section_ID : 1});
db.categories.createIndex({status : 1});


//===========  Sections 	==============
db.sections.createIndex({sectionUrl : 1});
db.sections.createIndex({status : 1});



//===========  Coupon Management 	==============
db.coupen.createIndex({couponcode : 1});
db.coupen.createIndex({startdate : 1});
db.coupen.createIndex({enddate : 1});


//===========  Orders 	==============
db.orders.createIndex({orderID : 1});
db.orders.createIndex({user_ID : 1});
db.orders.createIndex({"paymentDetails.disocuntCoupon_id" : 1});
db.orders.createIndex({"paymentDetails.disocuntCoupon_id" : 1});



