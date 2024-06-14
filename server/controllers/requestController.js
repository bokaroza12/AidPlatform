const { Request, Item, User } = require("../models");

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("userId", "fullName phone")
      .populate("item", "name")
      .populate({
        path: "assignedVehicle.vehicle",
        populate: { path: "rescuerId" },
      });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific request
exports.getRequest = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("item", "name")
      .populate("userId");
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new request (citizens only)
exports.createRequest = async (req, res) => {
  const { userId, itemId, quantity } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newRequest = new Request({
      userId,
      item: itemId,
      quantity,
      location: user.location, // Set request location to user's location
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a request (admin and rescuers only)
exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const { type, quantity, status } = req.body;
    if (type) request.type = type;
    if (quantity) request.quantity = quantity;
    if (status) request.status = status;

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a request (admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
