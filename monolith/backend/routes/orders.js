import { Router } from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/orders/mine - the logged-in user's own orders, newest first
router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: "Could not load orders", details: err.message });
  }
});

export default router;
