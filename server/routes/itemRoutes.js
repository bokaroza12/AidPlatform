const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/itemController");

router.post("/import", ItemController.importData);
router.get("/", ItemController.getItems);
router.post("/", ItemController.createItem);
router.put("/:id", ItemController.updateItem);
router.delete("/:id", ItemController.deleteItem);

module.exports = router;
