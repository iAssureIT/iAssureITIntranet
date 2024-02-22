//===========  Blocks 	==============

db.blocks.createIndex({blockType : 1});
db.blocks.createIndex({pageType : 1});
db.blocks.createIndex({blockComponentName : 1});

//===========  Pages 	==============
db.pages.createIndex({pageURL : 1});
db.pages.createIndex({pageTitle : 1});

//===========  Block Templates 	==============
db.blocktemplates.createIndex({compName : 1});
db.blocktemplates.createIndex({blockType : 1});

//===========  Blogs 	==============
db.blogs.createIndex({blogTitle : 1});
db.blogs.createIndex({blogURL : 1});
db.blogs.createIndex({typeOfBlog : 1});



