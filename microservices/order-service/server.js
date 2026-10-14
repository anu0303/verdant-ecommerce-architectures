import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import checkoutRouter from "./routes/checkout.js";
import ordersRouter from "./routes/orders.js";

process.on("unhandledRejection", (err) => console.error("[order-service] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[order-service] uncaught exception:", err));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "order-service" }));
app.use("/checkout", checkoutRouter);
app.use("/orders", ordersRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4003;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`[order-service] listening on http://localhost:${PORT}`));
});
