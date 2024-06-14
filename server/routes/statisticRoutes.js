const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");

router.get("/", statisticsController.charts);

module.exports = router;
