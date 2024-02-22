const mongoose	= require("mongoose");

const FranchiseGoods = require('./Model');

exports.insert_franchise_goods = (req,res,next)=>{
            getData();
            async function getData(){
                const franchiseGoods = new FranchiseGoods({
                    _id                       : new mongoose.Types.ObjectId(),    
                    franchise_id              : req.body.franchise_id, 
                    franchisePO_id            : req.body.franchisePO_id,
                    deliveryChallanNum        : req.body.deliveryChallanNum,
                    productCode               : req.body.productCode,
                    itemCode                  : req.body.itemCode,
                    productName               : req.body.productName,
                    inwardQty                 : req.body.suppliedQty,
                    unit                      : req.body.unit,
                    orders                    : [],
                    returnedOrders            : [],
                    balance                   : req.body.suppliedQty,
                    orderedDate               : req.body.orderedDate,
                    createdBy                 : req.body.createdBy,
                    createdAt                 : new Date()
                });
                franchiseGoods.save()
                .then(data=>{
                    // console.log("data",data);
                    res.status(200).json({
                        "franchiseGoodsId":data._id,
                        "message": "purchaseEntry Submitted Successfully."
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            }
};


exports.get_delivery_challan = (req,res,next)=>{
      FranchiseGoods.find({"_id":req.params.id})
        .exec()
        .then(data=>{
             res.status(200).json(data[0]);   
          })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
       
};

function generate_delivery_Challan() {
    // console.log("itemCode",itemCode,"productName",productName);

    return new Promise(function(resolve,reject){  
        FranchiseGoods.findOne()
        .sort({ "createdAt": -1 })
        .exec()
        .then(data=>{
            if(data){
                 const  dcChallan = data.deliveryChallanNo.replace('DC','');
                 const number = Number(dcChallan) + Number(1);
                 dc_challan = "DC" + number;
             }else{
                 dc_challan = "DC" + 1;
             }
             //console.log("generate_delivery_Challan",resolve);
             resolve(dc_challan);
            
        })
        .catch(err =>{ reject(err); }); 
    })         
}

exports.total_franchise_stock = (req, res, next) => {
  FranchiseGoods.aggregate([
           {"$match":{"franchise_id":req.params.franchise_id}},
           {"$group": {"_id": null,"TotalStock": { "$sum": "$balance"}}
        }])
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json({count:data[0].TotalStock});
            }else{
                res.status(404).json('PAGE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};