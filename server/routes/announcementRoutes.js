const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");

router.post("/", announcementController.createAnnouncement);
router.get("/", announcementController.getAnnouncements);

module.exports = router;
