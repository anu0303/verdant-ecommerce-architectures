import { Router } from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";

const router = Router();

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// POST /api/products/upload - admin only: save an image picked from the admin's computer
router.post("/upload", protect, adminOnly, (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No image file received" });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

// POST /api/products - admin only: add a new product from the Add Product page
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, category, price, description, image, stock, careLevel, light, tags } = req.body;
    if (!name || !category || !description || !image) {
      return res.status(400).json({ error: "Name, category, description and image are required" });
    }
    if (!(Number(price) > 0)) return res.status(400).json({ error: "Price must be greater than 0" });
    if (!(Number(stock) >= 0)) return res.status(400).json({ error: "Stock must be 0 or more" });

    let slug = slugify(name);
    if (await Product.findOne({ slug })) slug += "-" + Math.random().toString(36).slice(2, 6);

    const product = await Product.create({
      name,
      slug,
      category,
      price: Math.round(Number(price)), // already in paise
      description,
      image,
      stock: Math.round(Number(stock)),
      careLevel: careLevel || "easy",
      light: light || "medium",
      tags: Array.isArray(tags) ? tags : [],
    });
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ error: "Could not add product", details: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, category, light, careLevel, sort } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (light) filter.light = light;
    if (careLevel) filter.careLevel = careLevel;
    if (search) filter.$text = { $search: search };

    let query = Product.find(filter);
    switch (sort) {
      case "price-asc": query = query.sort({ price: 1 }); break;
      case "price-desc": query = query.sort({ price: -1 }); break;
      case "rating": query = query.sort({ rating: -1 }); break;
      default: query = query.sort({ createdAt: -1 });
    }

    const products = await query.exec();
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories", details: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product", details: err.message });
  }
});

export default router;
