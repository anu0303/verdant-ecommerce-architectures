import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, logout } = useAuth();

  function onSearch(e) {
    e.preventDefault();
    navigate(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link to="/" className="font-display text-2xl tracking-tight text-ink">Verdant</Link>
        <form onSubmit={onSearch} className="relative flex-1 max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Search plants, planters, tools…"
            aria-label="Search the catalog"
            className="w-full rounded-tag border border-ink/20 bg-white/60 px-4 py-2 font-body text-sm text-ink placeholder:text-ink/40 focus:border-moss focus:bg-white"
          />
        </form>
        <nav className="ml-auto flex items-center gap-6 font-body text-sm">
          <Link to="/shop" className="hidden sm:inline text-ink/80 hover:text-moss">Shop</Link>
          <Link to="/shop?category=indoor" className="hidden sm:inline text-ink/80 hover:text-moss">Indoor</Link>
          <Link to="/shop?category=outdoor" className="hidden sm:inline text-ink/80 hover:text-moss">Outdoor</Link>
          {user?.role === "admin" && (
            <Link to="/admin/add-product" className="hidden md:inline text-ochre-dark hover:text-moss">Add product</Link>
          )}
          {user ? (
            <>
              <Link to="/orders" className="hidden sm:inline text-ink/80 hover:text-moss">My orders</Link>
              <span className="hidden lg:inline text-ink/50">Hi, {user.name.split(" ")[0]}</span>
              <button onClick={() => { logout(); navigate("/"); }} className="text-ink/80 hover:text-moss">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink/80 hover:text-moss">Login</Link>
              <Link to="/register" className="hidden sm:inline text-ink/80 hover:text-moss">Register</Link>
            </>
          )}
          <Link to="/cart" className="relative flex items-center gap-2 rounded-tag border border-ink px-3 py-1.5 text-ink hover:bg-ink hover:text-paper transition-colors">
            Cart
            <span className="font-mono text-xs">{cart.itemCount ?? 0}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
