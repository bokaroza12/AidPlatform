const { Vehicle, User, Item, Request, Offer } = require("../models");

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  const { rescuerId, currentLoad, location, isActive } = req.body;
  try {
    const vehicle = new Vehicle({ rescuerId, currentLoad, location, isActive });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate("rescuerId")
      .populate("assignedRequests")
      .populate("assignedOffers");
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  const { lat, lng } = req.body;
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    vehicle.location = { lat, lng };
    await vehicle.save();
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unload items from vehicle
exports.unloadItems = async (req, res) => {
  const { vehicleId } = req.body;
  console.log(vehicleId);
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    // Update base inventory
    for (const load of vehicle.currentLoad) {
      const item = await Item.findOne({ itemId: load.itemId });
      if (!item) throw new Error(`Item with ID ${load.itemId} not found`);
      const itemDetail = item.details.find(
        (detail) => detail.detail_name === load.detail_name
      );

      if (!itemDetail) {
        item.details.push({
          detail_name: load.detail_name,
          detail_value: load.detail_value,
        });
      } else {
        itemDetail.detail_value = (
          parseInt(itemDetail.detail_value) + parseInt(load.detail_value)
        ).toString();
      }
      await item.save();
    }

    // Clear vehicle load
    vehicle.currentLoad = [];
    await vehicle.save();

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Load items to vehicle
exports.loadItems = async (req, res) => {
  const { vehicleId, itemId, detail_name, detail_value } = req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const item = await Item.findOne({ itemId });
    if (!item) throw new Error(`Item with ID ${itemId} not found`);

    const itemDetail = item.details.find(
      (detail) => detail.detail_name === detail_name
    );
    if (!itemDetail)
      throw new Error(`Detail ${detail_name} not found for item ${item.name}`);
    if (parseInt(itemDetail.detail_value) < parseInt(detail_value)) {
      throw new Error(`Not enough ${detail_name} for item ${item.name}`);
    }

    // Deduct from base inventory
    itemDetail.detail_value = (
      parseInt(itemDetail.detail_value) - parseInt(detail_value)
    ).toString();
    await item.save();

    // Add to vehicle load
    const existingLoadItem = vehicle.currentLoad.find(
      (load) => load.itemId === itemId && load.detail_name === detail_name
    );
    if (existingLoadItem) {
      existingLoadItem.detail_value = (
        parseInt(existingLoadItem.detail_value) + parseInt(detail_value)
      ).toString();
    } else {
      vehicle.currentLoad.push({
        itemId: item.itemId,
        name: item.name,
        detail_name,
        detail_value,
      });
    }

    await vehicle.save();
    res.status(200).json(vehicle);
  } catch (error) {
    console.error("Error in loadItems:", error);
    res.status(400).json({ message: error.message });
  }
};

// Assign task to vehicle
exports.assignTask = async (req, res) => {
  const { type, taskId } = req.body;
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("rescuerId");
    if (!vehicle) throw new Error("Vehicle not found");

    if (type === "request") {
      const request = await Request.findById(taskId);
      if (!request) throw new Error("Request not found");
      if (
        vehicle.assignedRequests.length + vehicle.assignedOffers.length >=
        4
      ) {
        throw new Error("Maximum task limit reached");
      }
      vehicle.assignedRequests.push({ request: request._id });
      request.status = "assigned";
      request.assignedVehicle.push({
        vehicle: vehicle._id,
        assignedDate: new Date(),
        rescuerUsername: vehicle.rescuerId.fullName,
      });
      await request.save();
    } else if (type === "offer") {
      const offer = await Offer.findById(taskId);
      if (!offer) throw new Error("Offer not found");
      if (
        vehicle.assignedRequests.length + vehicle.assignedOffers.length >=
        4
      ) {
        throw new Error("Maximum task limit reached");
      }
      vehicle.assignedOffers.push({ offer: offer._id });
      offer.status = "assigned";

      offer.assignedVehicle.push({
        vehicle: vehicle._id,
        assignedDate: new Date(),
        rescuerUsername: vehicle.rescuerId.fullName,
      });
      await offer.save();
    } else {
      throw new Error("Invalid task type");
    }
    await vehicle.save();
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.completeTask = async (req, res) => {
  const { type, taskId } = req.body;
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("rescuerId");
    if (!vehicle) throw new Error("Vehicle not found");

    if (type === "request") {
      const request = await Request.findById(taskId).populate("item");
      if (!request) throw new Error("Request not found");

      request.status = "completed";

      // Remove the request from the assignedRequests array
      vehicle.assignedRequests = vehicle.assignedRequests.filter(
        (r) => r.request.toString() !== taskId
      );

      // Unload items from the vehicle based on the request
      const itemIndex = vehicle.currentLoad.findIndex(
        (load) => load.itemId === request.item.itemId
      );

      if (itemIndex > -1) {
        const loadItem = vehicle.currentLoad[itemIndex];
        const remainingQuantity = loadItem.detail_value - request.quantity;

        if (remainingQuantity <= 0) {
          // Remove the item from currentLoad if the remaining quantity is zero or less
          vehicle.currentLoad.splice(itemIndex, 1);
        } else {
          // Update the item's quantity in currentLoad
          vehicle.currentLoad[itemIndex].detail_value = remainingQuantity;
        }
      }
      await request.save();
      await vehicle.save();
      res.status(200).json(vehicle);
    } else if (type === "offer") {
      const offer = await Offer.findById(taskId).populate("item");
      if (!offer) throw new Error("Offer not found");

      offer.status = "completed";

      // Remove the offer from the assignedOffers array
      vehicle.assignedOffers = vehicle.assignedOffers.filter(
        (o) => o.offer.toString() !== taskId
      );

      // Load items into the vehicle based on the offer
      const itemIndex = vehicle.currentLoad.findIndex(
        (load) => load.itemId === offer.item.itemId
      );

      const detail_name =
        offer.item.details.length > 0
          ? offer.item.details[0].detail_name
          : "detail";

      if (itemIndex > -1) {
        // If the item exists in currentLoad, update its quantity
        vehicle.currentLoad[itemIndex].detail_value += offer.quantity;
      } else {
        // If the item does not exist, add it to currentLoad
        vehicle.currentLoad.push({
          itemId: offer.item.itemId,
          name: offer.item.name,
          detail_name: detail_name,
          detail_value: offer.quantity,
        });
      }
      await offer.save();
      await vehicle.save();
      res.status(200).json(vehicle);
    } else {
      throw new Error("Invalid task type");
    }
  } catch (error) {
    console.error("Error completing task:", error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.cancelTask = async (req, res) => {
  const { type, taskId } = req.body;
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("rescuerId");
    if (!vehicle) throw new Error("Vehicle not found");

    if (type === "request") {
      const request = await Request.findById(taskId);
      if (!request) throw new Error("Request not found");

      request.status = "pending";
      request.assignedVehicle = [];
      await request.save();

      vehicle.assignedRequests = vehicle.assignedRequests.filter(
        (r) => r.request.toString() !== taskId
      );

      await vehicle.save();
      res.status(200).json(vehicle);
    } else if (type === "offer") {
      const offer = await Offer.findById(taskId);
      if (!offer) throw new Error("Offer not found");

      offer.status = "pending";
      offer.assignedVehicle = [];
      await offer.save();

      vehicle.assignedOffers = vehicle.assignedOffers.filter(
        (o) => o.offer.toString() !== taskId
      );

      await vehicle.save();
      res.status(200).json(vehicle);
    } else {
      throw new Error("Invalid task type");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
