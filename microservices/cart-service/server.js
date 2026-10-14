import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import cartRouter from "./routes/cart.js";

process.on("unhandledRejection", (err) => console.error("[cart-service] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[cart-service] uncaught exception:", err));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "cart-service" }));
app.use("/cart", cartRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4002;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`[cart-service] listening on http://localhost:${PORT}`));
});
