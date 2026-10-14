import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import { createProxyMiddleware } from "http-proxy-middleware";

process.on("unhandledRejection", (err) => console.error("[api-gateway] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[api-gateway] uncaught exception:", err));

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(cookieParser());

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4001";
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:4002";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:4004";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:4003";

// The gateway is the ONE place that knows about the shopper's cart
// cookie. Every downstream microservice just trusts an x-cart-id header
// instead of each having to parse cookies itself.
app.use((req, res, next) => {
  let cartId = req.cookies?.cartId;
  if (!cartId) {
    cartId = uuidv4();
    res.cookie("cartId", cartId, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax" });
  }
  req.cartId = cartId;
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    architecture: "microservices",
    routesTo: {
      products: PRODUCT_SERVICE_URL,
      cart: CART_SERVICE_URL,
      checkout: ORDER_SERVICE_URL,
      orders: ORDER_SERVICE_URL,
      auth: USER_SERVICE_URL,
    },
  });
});

function proxyTo(target, publicPrefix, servicePathPrefix) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    // The browser calls /api/<thing>/...; each service listens on its own
    // short path (e.g. /products/...), so swap the public prefix for it.
    pathRewrite: { [`^${publicPrefix}`]: servicePathPrefix },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader("x-cart-id", req.cartId);
    },
    onError: (err, req, res) => {
      console.error(`[api-gateway] upstream error reaching ${target}:`, err.message);
      res.status(502).json({ error: "Upstream service unavailable", target });
    },
  });
}

// Each of these lines is the entire routing table for the system - the
// frontend never needs to know these are separate processes.
// Uploaded product images are stored by the product-service
app.use("/uploads", proxyTo(PRODUCT_SERVICE_URL, "/uploads", "/uploads"));
app.use("/api/products", proxyTo(PRODUCT_SERVICE_URL, "/api/products", "/products"));
app.use("/api/cart", proxyTo(CART_SERVICE_URL, "/api/cart", "/cart"));
app.use("/api/checkout", proxyTo(ORDER_SERVICE_URL, "/api/checkout", "/checkout"));
app.use("/api/orders", proxyTo(ORDER_SERVICE_URL, "/api/orders", "/orders"));
app.use("/api/auth", proxyTo(USER_SERVICE_URL, "/api/auth", "/auth"));

app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[api-gateway] listening on http://localhost:${PORT}`));
