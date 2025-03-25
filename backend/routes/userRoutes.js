import express from "express";
import { registerUser, getUsers, getUserById} from "../controllers/userController.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Get all users route (for testing)
router.get("/", getUsers);

// Get single user route
router.get('/:id', getUserById);

export default router;
