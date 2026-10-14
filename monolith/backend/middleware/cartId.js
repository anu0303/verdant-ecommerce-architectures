import { v4 as uuidv4 } from "uuid";

export function ensureCartId(req, res, next) {
  let cartId = req.cookies?.cartId;
  if (!cartId) {
    cartId = uuidv4();
    res.cookie("cartId", cartId, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
    });
  }
  req.cartId = cartId;
  next();
}
