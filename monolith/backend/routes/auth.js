import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, JWT_SECRET } from "../middleware/auth.js";

const router = Router();

function publicUser(u) {
  return { id: u._id, name: u.name, email: u.email, role: u.role };
}
function signToken(u) {
  return jwt.sign({ id: u._id, role: u.role, name: u.name }, JWT_SECRET(), { expiresIn: "7d" });
}

// POST /api/auth/register  { name, email, password }
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Could not register", details: err.message });
  }
});

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Could not sign in", details: err.message });
  }
});

// GET /api/auth/me - who is logged in (used to restore a session on page load)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: "Account no longer exists" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Could not load profile", details: err.message });
  }
});

export default router;
