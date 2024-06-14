const mongoose = require("mongoose");
const { User, Request, Offer, Vehicle } = require("../models"); // Adjust the path as needed
const bcrypt = require("bcryptjs");

const initializeDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/aidPlatform_db");

    // Create base
    await User.deleteMany({ role: "administrator" });
    const hashedPassword = await bcrypt.hash("password", 10);
    const base = {
      username: "admin",
      password: hashedPassword,
      role: "administrator",
      fullName: "Base",
      phone: "1234567890",
      location: { lat: 38.2461195, lng: 21.7352228 },
    };
    await User.insertMany(base);

    // Create rescue vehicles (users with rescuer role) with bcrypt hashed passwords
    await User.deleteMany({ role: "rescuer" });
    await Vehicle.deleteMany({}); // Clear any existing vehicles

    const rescuers = [
      {
        username: "rescuer1",
        password: hashedPassword,
        role: "rescuer",
        fullName: "Rescuer One",
        phone: "1234567890",
        location: { lat: 38.238711731020985, lng: 21.72924452613629 },
      },
      {
        username: "rescuer2",
        password: hashedPassword,
        role: "rescuer",
        fullName: "Rescuer Two",
        phone: "1234567890",
        location: { lat: 38.22939321903725, lng: 21.738312017131786 },
      },
      {
        username: "rescuer3",
        password: hashedPassword,
        role: "rescuer",
        fullName: "Rescuer Three",
        phone: "1234567890",
        location: { lat: 38.270509862312174, lng: 21.747581730857206 },
      },
    ];

    const savedRescuers = await User.insertMany(rescuers);

    // Assign a vehicle to each rescuer
    for (const rescuer of savedRescuers) {
      const vehicle = new Vehicle({
        rescuerId: rescuer._id,
        location: rescuer.location,
        currentLoad: [],
        isActive: true,
        assignedRequests: [],
        assignedOffers: [],
      });

      await vehicle.save();

      // Update the rescuer to reference the vehicle
      rescuer.vehicle = vehicle._id;
      await rescuer.save();
    }

    // Create citizen accounts with bcrypt hashed passwords
    await User.deleteMany({ role: "citizen" });

    const citizens = [
      {
        username: "citizen1",
        password: hashedPassword,
        role: "citizen",
        fullName: "Citizen One",
        phone: "1234567890",
        location: { lat: 38.242586, lng: 21.732235 },
      },
      {
        username: "citizen2",
        password: hashedPassword,
        role: "citizen",
        fullName: "Citizen Two",
        phone: "1234567890",
        location: { lat: 38.240488, lng: 21.738216 },
      },
      {
        username: "citizen3",
        password: hashedPassword,
        role: "citizen",
        fullName: "Citizen Three",
        phone: "1234567890",
        location: { lat: 38.255941, lng: 21.738873 },
      },
      {
        username: "citizen4",
        password: hashedPassword,
        role: "citizen",
        fullName: "Citizen Four",
        phone: "1234567890",
        location: { lat: 38.260224, lng: 21.757693 },
      },
      {
        username: "citizen5",
        password: hashedPassword,
        role: "citizen",
        fullName: "Citizen Five",
        phone: "1234567890",
        location: { lat: 38.234654, lng: 21.731825 },
      },
    ];
    const savedCitizens = await User.insertMany(citizens);

    // Create requests and offers
    await Request.deleteMany({});
    await Offer.deleteMany({});

    const requests = [
      {
        userId: savedCitizens[0]._id,
        item: "665f0087a695ba100251fef1", //Water
        quantity: 10,
        status: "pending",
        location: savedCitizens[0].location,
      },
      {
        userId: savedCitizens[0]._id,
        item: "665f0087a695ba100251fe24", //Bread
        quantity: 5,
        status: "pending",
        location: savedCitizens[0].location,
      },
      {
        userId: savedCitizens[1]._id,
        item: "665f0087a695ba100251fe2c", //Bandages
        quantity: 2,
        status: "pending",
        location: savedCitizens[1].location,
      },
      {
        userId: savedCitizens[2]._id,
        item: "665f0087a695ba100251fe4d", //Socks
        quantity: 3,
        status: "pending",
        location: savedCitizens[2].location,
      },
      {
        userId: savedCitizens[2]._id,
        item: "665f0087a695ba100251fe32", //Blankets
        quantity: 4,
        status: "pending",
        location: savedCitizens[2].location,
      },
    ];
    const offers = [
      {
        userId: savedCitizens[3]._id,
        item: "665f0087a695ba100251fef1", //Water
        quantity: 15,
        status: "pending",
        location: savedCitizens[3].location,
      },
      {
        userId: savedCitizens[3]._id,
        item: "665f0087a695ba100251fe24", //Bread
        quantity: 10,
        status: "pending",
        location: savedCitizens[3].location,
      },
      {
        userId: savedCitizens[4]._id,
        item: "665f0087a695ba100251fe2c", //Bandages
        quantity: 5,
        status: "pending",
        location: savedCitizens[4].location,
      },
    ];
    await Request.insertMany(requests);
    await Offer.insertMany(offers);

    console.log("Database initialized successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error initializing database:", error);
    mongoose.connection.close();
  }
};

initializeDatabase();
