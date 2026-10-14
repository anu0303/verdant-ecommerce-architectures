import { Router } from "express";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const SHIPPING_FLAT_CENTS = 9900; // Rs 99 flat rate (values stored in paise)
const TAX_RATE = 0.18; // 18% GST

function mockChargeCard({ cardNumber, expiry, cvc }) {
  const digits = (cardNumber || "").replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return { status: "failed", reason: "Card number looks invalid." };
  if (!/^\d{2}\/\d{2}$/.test(expiry || "")) return { status: "failed", reason: "Expiry must be in MM/YY format." };
  if (!/^\d{3,4}$/.test(cvc || "")) return { status: "failed", reason: "CVC looks invalid." };
  if (digits === "4000000000000002") return { status: "failed", reason: "Card was declined." };
  return {
    status: "paid",
    cardBrand: digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Card",
    last4: digits.slice(-4),
    transactionId: "mock_" + Math.random().toString(36).slice(2, 12),
  };
}

// POST /api/checkout - only for signed-in users, so every order belongs to someone
router.post("/", protect, async (req, res) => {
  try {
    const { customer, card } = req.body;
    if (!customer?.name || !customer?.email || !customer?.address) {
      return res.status(400).json({ error: "Missing required customer details" });
    }

    const cart = await Cart.findOne({ cartId: req.cartId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const items = cart.items
      .filter((i) => i.product)
      .map((i) => ({ product: i.product._id, name: i.product.name, price: i.product.price, quantity: i.quantity }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = SHIPPING_FLAT_CENTS;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + shipping + tax;

    const payment = mockChargeCard(card || {});
    if (payment.status === "failed") {
      return res.status(402).json({ error: payment.reason || "Payment declined" });
    }

    const orderNumber = "VD" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      items,
      subtotal,
      shipping,
      tax,
      total,
      customer,
      payment,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: "Checkout failed", details: err.message });
  }
});

// GET /api/checkout/order/:orderNumber - a user can only open their own order
router.get("/order/:orderNumber", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order || (String(order.user) !== req.user.id && req.user.role !== "admin")) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order", details: err.message });
  }
});

export default router;
