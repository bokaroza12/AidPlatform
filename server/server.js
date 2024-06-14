const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost/aidPlatform_db")
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

// Import routes
const userRoutes = require("./routes/userRoutes.js");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const requestRoutes = require("./routes/requestRoutes");
const offerRoutes = require("./routes/offerRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const inventoryRoutes = require("./routes/inventory");
const statisticRoutes = require("./routes/statisticRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/statistics", statisticRoutes);
app.use("/api/announcements", announcementRoutes);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
