import { Router } from "express";
import Cart from "../models/Cart.js";

const router = Router();
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4001";

async function getOrCreateCart(cartId) {
  let cart = await Cart.findOne({ cartId });
  if (!cart) cart = await Cart.create({ cartId, items: [] });
  return cart;
}

// Enrich raw {productId, quantity} rows with live product data by calling
// product-service over HTTP - this is the actual service-to-service call
// that makes this architecture "micro" instead of just modular.
async function enrichCart(cart) {
  const results = await Promise.all(
    cart.items.map(async (item) => {
      try {
        const res = await fetch(`${PRODUCT_SERVICE_URL}/products/internal/${item.productId}`);
        if (!res.ok) return null;
        const { product } = await res.json();
        return {
          productId: item.productId,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      } catch {
        return null; // product-service unreachable or item's product was deleted
      }
    })
  );
  const items = results.filter(Boolean);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, subtotal, itemCount: items.reduce((n, i) => n + i.quantity, 0) };
}

function cartId(req) {
  // The API gateway resolves/creates the shopper's cart identity and
  // forwards it as a header, so this service never touches cookies.
  return req.header("x-cart-id");
}

router.get("/", async (req, res) => {
  try {
    const cart = await getOrCreateCart(cartId(req));
    res.json(await enrichCart(cart));
  } catch (err) {
    res.status(500).json({ error: "Could not load cart", details: err.message });
  }
});

router.post("/items", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate the product actually exists by asking product-service -
    // cart-service has no local product table to check against.
    const check = await fetch(`${PRODUCT_SERVICE_URL}/products/internal/${productId}`);
    if (!check.ok) return res.status(404).json({ error: "Product not found" });

    const cart = await getOrCreateCart(cartId(req));
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ productId, quantity: Number(quantity) });
    await cart.save();
    res.json(await enrichCart(cart));
  } catch (err) {
    res.status(400).json({ error: "Could not add item", details: err.message });
  }
});

router.put("/items/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(cartId(req));
    const item = cart.items.find((i) => i.productId === req.params.productId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });

    if (quantity <= 0) cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
    else item.quantity = Number(quantity);
    await cart.save();
    res.json(await enrichCart(cart));
  } catch (err) {
    res.status(400).json({ error: "Could not update item", details: err.message });
  }
});

router.delete("/items/:productId", async (req, res) => {
  try {
    const cart = await getOrCreateCart(cartId(req));
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
    await cart.save();
    res.json(await enrichCart(cart));
  } catch (err) {
    res.status(500).json({ error: "Could not remove item", details: err.message });
  }
});

// Internal - called by order-service once an order is successfully
// placed, so it can tell cart-service to empty that shopper's cart.
router.post("/internal/clear", async (req, res) => {
  try {
    const cart = await getOrCreateCart(cartId(req));
    cart.items = [];
    await cart.save();
    res.json({ cleared: true });
  } catch (err) {
    res.status(500).json({ error: "Could not clear cart", details: err.message });
  }
});

export default router;
