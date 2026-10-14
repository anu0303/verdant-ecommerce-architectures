import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import productsRouter from "./routes/products.js";
import { UPLOAD_DIR } from "./middleware/upload.js";

process.on("unhandledRejection", (err) => console.error("[product-service] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[product-service] uncaught exception:", err));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "product-service" }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/products", productsRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`[product-service] listening on http://localhost:${PORT}`));
});
