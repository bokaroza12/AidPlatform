const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/InventoryController");

router.get("/status", inventoryController.getInventoryStatus);

module.exports = router;
