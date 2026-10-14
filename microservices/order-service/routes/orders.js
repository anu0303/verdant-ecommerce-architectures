import { Router } from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /orders/mine - the logged-in user's orders, newest first
router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: String(req.user.id) }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

export default router;
