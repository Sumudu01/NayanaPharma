import User from "../models/User.js";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, nic, dob, gender, email, contactNumber } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or NIC",
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      nic,
      dob,
      gender,
      email,
      contactNumber,
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
