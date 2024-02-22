const express = require("express");
const router = express.Router();

const Controller = require("./controller.js");

router.post("/api/search-results/post",Controller.getSearchResults);

module.exports = router;