const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

router.post("/:id/load", vehicleController.loadItems);
router.post("/:id/unload", vehicleController.unloadItems);
router.post("/:id/assign", vehicleController.assignTask);
router.post("/:id/complete-task", vehicleController.completeTask);
router.post("/:id/cancel-task", vehicleController.cancelTask);
router.post("/", vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;
