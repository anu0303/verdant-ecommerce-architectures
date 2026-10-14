import { Router } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = Router();

async function getOrCreateCart(cartId) {
  let cart = await Cart.findOne({ cartId }).populate("items.product");
  if (!cart) cart = await Cart.create({ cartId, items: [] });
  return cart;
}

function summarize(cart) {
  const items = cart.items
    .filter((i) => i.product)
    .map((i) => ({
      productId: i.product._id,
      name: i.product.name,
      slug: i.product.slug,
      image: i.product.image,
      price: i.product.price,
      quantity: i.quantity,
      lineTotal: i.product.price * i.quantity,
    }));
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, subtotal, itemCount: items.reduce((n, i) => n + i.quantity, 0) };
}

router.get("/", async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.cartId);
    res.json(summarize(cart));
  } catch (err) {
    res.status(500).json({ error: "Could not load cart", details: err.message });
  }
});

router.post("/items", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const cart = await getOrCreateCart(req.cartId);
    const existing = cart.items.find((i) => i.product._id.toString() === productId);
    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ product: productId, quantity: Number(quantity) });
    await cart.save();
    const populated = await getOrCreateCart(req.cartId);
    res.json(summarize(populated));
  } catch (err) {
    res.status(400).json({ error: "Could not add item", details: err.message });
  }
});

router.put("/items/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.cartId);
    const item = cart.items.find((i) => i.product._id.toString() === req.params.productId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product._id.toString() !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }
    await cart.save();
    const populated = await getOrCreateCart(req.cartId);
    res.json(summarize(populated));
  } catch (err) {
    res.status(400).json({ error: "Could not update item", details: err.message });
  }
});

router.delete("/items/:productId", async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.cartId);
    cart.items = cart.items.filter((i) => i.product._id.toString() !== req.params.productId);
    await cart.save();
    const populated = await getOrCreateCart(req.cartId);
    res.json(summarize(populated));
  } catch (err) {
    res.status(500).json({ error: "Could not remove item", details: err.message });
  }
});

export default router;
