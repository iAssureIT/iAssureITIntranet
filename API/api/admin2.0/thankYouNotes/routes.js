const express = require("express");
const router = express.Router() ;

const Controller = require("./controller.js");

router.post("/post",Controller.insertThankYouNote);

router.delete("/delete",Controller.deleteTYN);

router.get("/get/one/:tyn_id",Controller.getOneTYN);

router.get("/get/list",Controller.getListofTYN);

router.patch("/patch",Controller.updateTYN);



module.exports = router;