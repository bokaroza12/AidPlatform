const { Offer, Announcement, User } = require("../models");

// Get all offers (admin and rescuers only)
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("userId", "fullName phone")
      .populate("item", "name")
      .populate({
        path: "assignedVehicle.vehicle",
        populate: { path: "rescuerId" },
      });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific offer
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "userId",
      "fullName phone"
    );
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOffer = async (req, res) => {
  const { userId, announcementId, quantity } = req.body;

  try {
    const announcement = await Announcement.findById(announcementId).populate(
      "requiredItems.item"
    );
    if (!announcement) throw new Error("Announcement not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const offer = new Offer({
      userId,
      item: announcement.requiredItems[0].item._id,
      quantity,
      status: "pending",
      location: user.location,
    });

    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an offer (admin and rescuers only)
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const { type, quantity, status } = req.body;
    if (type) offer.type = type;
    if (quantity) offer.quantity = quantity;
    if (status) offer.status = status;

    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an offer (admin only)
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json({ message: "Offer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
