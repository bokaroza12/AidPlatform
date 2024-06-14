const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

router.post("/login", UserController.login);
router.post("/register", UserController.createUser);
router.get("/base-location", UserController.getBaseLocation);
router.get("/:id", UserController.getUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.get("/", UserController.getAllUsers);
router.post("/create-rescuer", UserController.createRescuer);

module.exports = router;
