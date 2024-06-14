const { User, Vehicle } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secret = "my_jwt_secret";
const saltRounds = 10;

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    if (password === user.password) {
      // if (!isMatch) {
      //   return res
      //     .status(401)
      //     .json({ message: "Invalid username or password" });
      // }

      const token = jwt.sign({ id: user._id, role: user.role }, secret, {
        expiresIn: "1h",
      });

      res.json({ token, role: user.role, userId: user._id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, role, fullName, phone, location } = req.body;

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      fullName,
      phone,
      location,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error("User not found");
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { lat, lng } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = { lat, lng };
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBaseLocation = async (req, res) => {
  try {
    const base = await User.findOne({ role: "administrator" });
    if (!base) throw new Error("Base not found");
    res.status(200).json(base.location);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new Error("User not found");
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createRescuer = async (req, res) => {
  const { username, password, fullName, phone, role, vehicleLocation } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      phone,
      role,
    });

    const savedUser = await newUser.save();

    if (role === "rescuer" && vehicleLocation) {
      const newVehicle = new Vehicle({
        rescuerId: savedUser._id,
        location: vehicleLocation,
        currentLoad: [],
        isActive: true,
        assignedRequests: [],
        assignedOffers: [],
      });

      const savedVehicle = await newVehicle.save();

      savedUser.vehicle = savedVehicle._id;
      await savedUser.save();
    }

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
