import express from "express";
import { registerUser, getUsers } from "../controllers/userController.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Get all users route (for testing)
router.get("/", getUsers);

export default router;
