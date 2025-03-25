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

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");

    if (!user) {
      return 
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
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

// Update user by ID
export const updateUser = async (req, res) => {
    try {
      const { firstName, lastName, nic, dob, gender, email, contactNumber } = req.body;
      
      // Find user by ID
      let user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if email or NIC is being changed to an existing one
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use by another user'
          });
        }
      }
      
      if (nic !== user.nic) {
        const nicExists = await User.findOne({ nic });
        if (nicExists) {
          return res.status(400).json({
            success: false,
            message: 'NIC already in use by another user'
          });
        }
      }
      
      // Update user fields
      user.firstName = firstName;
      user.lastName = lastName;
      user.nic = nic;
      user.dob = dob;
      user.gender = gender;
      user.email = email;
      user.contactNumber = contactNumber;
      
      // Save updated user
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
      
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  
  // Delete user by ID
  export const deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };