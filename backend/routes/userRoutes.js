import express from "express";
import {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Register user 
router.post("/register", registerUser);

// Get all users 
router.get("/", getUsers);

// Get single user 
router.get("/:id", getUserById);

// Update user 
router.put("/:id", updateUser);

// Delete user 
router.delete("/:id", deleteUser);

export default router;
