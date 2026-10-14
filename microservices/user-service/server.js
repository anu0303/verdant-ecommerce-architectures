import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";

process.on("unhandledRejection", (err) => console.error("[user-service] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[user-service] uncaught exception:", err));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "user-service" }));
app.use("/auth", authRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4004;
connectDB().then(async () => {
  await ensureAdmin();
  app.listen(PORT, () => console.log(`[user-service] listening on http://localhost:${PORT}`));
});

// Makes sure the demo admin account exists, so there is no extra seed step for users.
async function ensureAdmin() {
  try {
    const { default: User } = await import("./models/User.js");
    const { default: bcrypt } = await import("bcryptjs");
    if (!(await User.findOne({ email: "admin@verdant.com" }))) {
      await User.create({ name: "Verdant Admin", email: "admin@verdant.com", passwordHash: await bcrypt.hash("admin123", 10), role: "admin" });
      console.log("[user-service] created admin admin@verdant.com / admin123");
    }
  } catch (err) {
    console.error("[user-service] could not ensure admin:", err.message);
  }
}
