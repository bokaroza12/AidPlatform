const { Vehicle, Item, Request, Offer } = require("../models");

exports.getInventoryStatus = async (req, res) => {
  try {
    const items = await Item.find();
    const vehicles = await Vehicle.find().populate(
      "currentLoad.itemId",
      "name category"
    );
    const requests = await Request.find({
      status: { $ne: "completed" },
    }).populate("item", "name category");
    const offers = await Offer.find({ status: { $ne: "completed" } }).populate(
      "item",
      "name category"
    );

    const inventoryStatus = items.map((item) => {
      const inBase =
        item.details.length > 0 ? item.details[0].detail_value : "N/A";

      const onVehicles = vehicles.reduce((acc, vehicle) => {
        vehicle.currentLoad.forEach((load) => {
          if (load.itemId === item.itemId) {
            acc += parseInt(load.detail_value);
          }
        });
        return acc;
      }, 0);

      return {
        item: item.name,
        category: item.category,
        detail: inBase,
        onVehicles,
      };
    });

    res.json(inventoryStatus);
  } catch (error) {
    console.error("Error fetching inventory status:", error.message);
    res.status(500).json({ message: error.message });
  }
};
