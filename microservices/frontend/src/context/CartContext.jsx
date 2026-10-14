import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/api.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = async (productId, quantity = 1) => {
    const data = await api.addToCart(productId, quantity);
    setCart(data);
  };
  const updateItem = async (productId, quantity) => {
    const data = await api.updateCartItem(productId, quantity);
    setCart(data);
  };
  const removeItem = async (productId) => {
    const data = await api.removeCartItem(productId);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
