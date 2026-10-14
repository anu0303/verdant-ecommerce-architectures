const BASE = "/api";
const TOKEN_KEY = "verdant_token";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

async function request(path, options = {}) {
  const headers = {};
  // For file uploads the browser sets the multipart Content-Type itself.
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),
  getCategories: () => request("/products/categories"),
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return request("/products/upload", { method: "POST", body: fd });
  },
  createProduct: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  getCart: () => request("/cart"),
  addToCart: (productId, quantity = 1) =>
    request("/cart/items", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId, quantity) =>
    request(`/cart/items/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
  removeCartItem: (productId) => request(`/cart/items/${productId}`, { method: "DELETE" }),
  checkout: (payload) => request("/checkout", { method: "POST", body: JSON.stringify(payload) }),
  getOrder: (orderNumber) => request(`/checkout/order/${orderNumber}`),
  getMyOrders: () => request("/orders/mine"),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
};
