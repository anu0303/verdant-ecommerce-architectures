import { Router } from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:4002";

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

router.post("/", protect, async (req, res) => {
  try {
    const { customer, card } = req.body;
    if (!customer?.name || !customer?.email || !customer?.address) {
      return res.status(400).json({ error: "Missing required customer details" });
    }

    // order-service doesn't own cart data, so it asks cart-service for
    // the shopper's current cart, forwarding the same cart identity
    // header the gateway attached to this request.
    const cartRes = await fetch(`${CART_SERVICE_URL}/cart`, {
      headers: { "x-cart-id": req.header("x-cart-id") },
    });
    if (!cartRes.ok) return res.status(502).json({ error: "Could not reach cart service" });
    const cart = await cartRes.json();

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const items = cart.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = SHIPPING_FLAT_CENTS;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + shipping + tax;

    const payment = mockChargeCard(card || {});
    if (payment.status === "failed") {
      return res.status(402).json({ error: payment.reason || "Payment declined" });
    }

    const orderNumber = "VD" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
    const order = await Order.create({ user: req.user.id, orderNumber, items, subtotal, shipping, tax, total, customer, payment });

    // Tell cart-service to empty this shopper's cart now that the order
    // is placed - another cross-service call, this time a "command"
    // rather than a "query".
    await fetch(`${CART_SERVICE_URL}/cart/internal/clear`, {
      method: "POST",
      headers: { "x-cart-id": req.header("x-cart-id") },
    }).catch((err) => console.error("[order-service] failed to clear cart:", err.message));

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: "Checkout failed", details: err.message });
  }
});

router.get("/order/:orderNumber", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order || (order.user !== String(req.user.id) && req.user.role !== "admin")) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order", details: err.message });
  }
});

export default router;
