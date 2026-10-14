import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import { ensureCartId } from "./middleware/cartId.js";

import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import checkoutRouter from "./routes/checkout.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import { UPLOAD_DIR } from "./middleware/upload.js";

process.on("unhandledRejection", (err) => console.error("[unhandled rejection]", err));
process.on("uncaughtException", (err) => console.error("[uncaught exception]", err));

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(ensureCartId);

app.get("/api/health", (_req, res) => res.json({ status: "ok", architecture: "monolith" }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", ordersRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`[monolith api] listening on http://localhost:${PORT}`));
});
