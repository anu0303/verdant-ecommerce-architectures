import jwt from "jsonwebtoken";

export const JWT_SECRET = () => process.env.JWT_SECRET || "dev-secret-change-me";

// Reads "Authorization: Bearer <token>", verifies it, and puts the
// logged-in user's id/role/name on req.user.
export function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Please sign in to continue" });
  try {
    const payload = jwt.verify(token, JWT_SECRET());
    req.user = { id: payload.id, role: payload.role, name: payload.name };
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired, please sign in again" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admins only" });
  next();
}
