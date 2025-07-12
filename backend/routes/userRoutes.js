import express from "express";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();


router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

export default router;
