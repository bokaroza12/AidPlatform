const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["administrator", "rescuer", "citizen"],
    default: "citizen",
  },
  fullName: String,
  phone: String,
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
});

const vehicleSchema = new mongoose.Schema({
  rescuerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  currentLoad: [
    {
      itemId: { type: String, required: false },
      name: { type: String, required: true },
      detail_name: { type: String, required: true },
      detail_value: { type: String, required: true },
    },
  ],
  location: {
    type: { lat: Number, lng: Number },
    required: true,
  },
  isActive: { type: Boolean, default: true },
  assignedRequests: [
    {
      request: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
    },
  ],
  assignedOffers: [
    {
      offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    },
  ],
});

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "assigned", "completed"],
    default: "pending",
  },
  location: {
    type: { lat: Number, lng: Number },
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  assignedVehicle: [
    {
      vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
      assignedDate: Date,
      rescuerUsername: String,
    },
  ],
  pickupDate: Date,
});

const offerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "assigned", "completed"],
    default: "pending",
  },
  location: {
    type: { lat: Number, lng: Number },
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  assignedVehicle: [
    {
      vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
      assignedDate: Date,
      rescuerUsername: String,
    },
  ],
  pickupDate: Date,
});

const detailSchema = new mongoose.Schema(
  {
    detail_name: String,
    detail_value: String,
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, ref: "Category", required: true }, // Link to a Category model if you want to maintain a separate collection for categories
  details: [detailSchema],
});

const categorySchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  categoryName: { type: String },
});

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  requiredItems: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      name: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Request = mongoose.model("Request", requestSchema);
const Offer = mongoose.model("Offer", offerSchema);
const Item = mongoose.model("Item", itemSchema);
const Category = mongoose.model("Category", categorySchema);
const Announcement = mongoose.model("Announcement", announcementSchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = {
  User,
  Request,
  Offer,
  Item,
  Announcement,
  Category,
  Vehicle,
};
