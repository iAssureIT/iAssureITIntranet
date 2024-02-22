const mongoose          = require("mongoose");
const Menubar           = require('../models/menubar.js');

exports.create_menubar = (req, res, next) => {
    // console.log("menubarName===",req.body.menubarName);
    Menubar.findOne({menubarName:req.body.menubarName})
        .exec()
        .then(data =>{
            if(data){
                console.log("data findOne ===",data);
                Menubar.updateOne(
                    { _id:data._id},  
                    {
                        $set:{                            
                            "menubarName"       : req.body.menubarName,                                  
                        },
                        $push: {
                            "menu": [{
                                "_id"            : mongoose.Types.ObjectId(),
                                "menuRank"       : req.body.menuRank,
                                "menuLevel"      : req.body.menuLevel,
                                "parentMenuItem" : req.body.parentMenuItem,
                                "menuItemName"   : req.body.menuItemName,
                                "menuLink"       : req.body.menuLink, 					
                            }]
                        }
                    }
                )
                .exec()
                .then(Updateddata=>{
                    // console.log('Updateddata ',Updateddata);
                    if(Updateddata){
                        res.status(200).json("Menu_UPDATED");
                    }else{
                        res.status(401).json("Menu_NOT_UPDATED");
                    }
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
                // return res.status(200).json({
                //     message : 'Menu already exists.',
                //     details : data
                // });
            }else{ 
                const menubar = new Menubar({
                    "_id"           : mongoose.Types.ObjectId(), 
                    "menubarName"   : req.body.menubarName, 
                    "menu"          : [],                   
                    "createdBy"     : req.body.createdBy, //_id of User or null
                    "createdAt"     : new Date(),     
                });
                // console.log("menubar obj===",menubar);
                menubar.save()
                    .then(data=>{
                            res.status(200).json({
                                                message : "MENUBAR_INSERTED",
                                                ID      : data._id
                                            });
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}; 

exports.update_menu = (req,res,next)=>{
    // console.log("req.body.menuId",req.body.menuId);
    Menubar.updateOne(
                    { "_id":req.params.ID , "menu._id" :req.body.menuId },  
                    {
                        "$set": { 
                            "menu.$.menuRank"       : req.body.menuRank,
                            "menu.$.menuLevel"      : req.body.menuLevel,
                            "menu.$.parentMenuItem" : req.body.parentMenuItem,
                            "menu.$.menuItemName"   : req.body.menuItemName,
                            "menu.$.menuLink"       : req.body.menuLink,  
                        }
                    
                    }
                )
                .exec()
                .then(data=>{
                    // console.log('data ',data);
                    if(data){
                        res.status(200).json("MENU_UPDATED");
                    }else{
                        res.status(401).json("MENU_NOT_UPDATED");
                    }
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
};

exports.fetch_menu = (req,res,next)=>{
    // console.log("Id===",req.params.ID);
    Menubar.findOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('MENU_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.fetch_all_menu = (req,res,next)=>{
    Menubar.find({})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('MENUS_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.delete_menubar = (req,res,next)=>{
    // console.log("deleted id:",req.params.ID);
    Menubar.deleteOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data.deletedCount === 1){
                res.status(200).json("BLOCK_DELETED");
            }else{
                res.status(200).json("BLOCK_NOT_DELETED");
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.delete_menu = (req, res, next) => {
	Menubar.updateOne(
		{ '_id': req.body.menubarId },
		{
			$pull: { "menu": { "_id": req.body.menuId } }
		}
	)
		.exec()
		.then(data => {
			if (data.nModified == 1) {
				res.status(200).json({
					"message": "Menu deleted successfully."
				});
			} else {
				res.status(401).json({
					"message": "Menu Not Found"
				});
			}
		})
		.catch(error => {
			console.log(error);
			res.status(500).json({
				error: error
			});
		})
};

exports.get_menu_By_menuName = (req,res,next)=>{
    Menubar.findOne({menubarName:req.body.menubarName})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('MENU_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.get_menu_By_menuName = (req,res,next)=>{
    var menubarName = req.body.menubarName;
    // console.log("menubarName===",menubarName);
    Menubar.findOne({menubarName : menubarName})
        .exec()
        .then(data=>{
            if(data){
                var menuItems = [];
                // console.log("Data====",data);     

                var parentMenus = data.menu.filter(function(newData) {                    
                    return newData.parentMenuItem === '-';
                  });
                //   console.log("parentMenus===",parentMenus);
                
//************************************************************/
                  var menuItems = getMenuItems(parentMenus);
                //   console.log("Menudetails ========",menuItems);
                  res.status(200).json(menuItems);

//*************************************************************/                
            }else{
                res.status(404).json('MENUS_NOT_FOUND');
            }

            function getMenuItems(parentMenus){
                var menuItems = [];
                if(parentMenus.length>0){
                    for(let i=0;i<parentMenus.length;i++){
                        var item = parentMenus[i];
                        // console.log("item====",item);
                        var menuItem = {};
                        menuItem.menuItemName=item.menuItemName;
                        menuItem.menulink  = item.menuLink;
                        menuItem.menuRank  = item.menuRank;
                        menuItem.menuLevel = item.menuLevel;
                        menuItem.parentMenuItem = item.parentMenuItem;
                        //add all menu info
                        var childMenuItems = getMenuItems(getChildItem(item));
                        menuItem.childItems = childMenuItems;
                        menuItems.push(menuItem)
                       
                    }//end i loop
                    console.log("menuItems===",menuItems)
                }
                    return menuItems;
            }

            function getChildItem(item){
                var childItems = data.menu.filter(function(child) {
                    return child.parentMenuItem === item.menuItemName;
                  }); 
                return childItems;   
            }
            
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

       
};



