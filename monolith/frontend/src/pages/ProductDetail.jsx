import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/api.js";
import { useCart } from "../context/CartContext.jsx";
import { formatCents } from "../lib/format.js";

const LIGHT_LABEL = { low: "Low light", medium: "Medium light", bright: "Bright light" };

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setProduct(null);
    setError(null);
    api.getProduct(slug).then((data) => setProduct(data.product)).catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink">We couldn't find that one.</p>
        <Link to="/shop" className="mt-4 inline-block font-body text-sm text-moss hover:underline">Back to the shop</Link>
      </div>
    );
  }
  if (!product) return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink/50">Loading…</div>;

  async function handleAdd() {
    await addItem(product._id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/shop" className="font-body text-sm text-ink/60 hover:text-moss">← Back to shop</Link>
      <div className="mt-6 grid gap-10 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-tag border border-ink/15 bg-paperDim">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="font-display text-4xl text-ink">{product.name}</h1>
          <p className="mt-3 font-mono text-2xl text-ink">{formatCents(product.price)}</p>
          <p className="mt-6 font-body leading-relaxed text-ink/70">{product.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-dashed border-ink/20 py-6 font-mono text-xs">
            <div><dt className="text-ink/40 uppercase tracking-wide">Light</dt><dd className="mt-1 text-ink">{LIGHT_LABEL[product.light]}</dd></div>
            <div><dt className="text-ink/40 uppercase tracking-wide">Care level</dt><dd className="mt-1 capitalize text-ink">{product.careLevel}</dd></div>
            <div><dt className="text-ink/40 uppercase tracking-wide">In stock</dt><dd className="mt-1 text-ink">{product.stock} available</dd></div>
            <div><dt className="text-ink/40 uppercase tracking-wide">Category</dt><dd className="mt-1 capitalize text-ink">{product.category}</dd></div>
          </dl>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-tag border border-ink/20">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-ink hover:text-moss" aria-label="Decrease quantity">−</button>
              <span className="w-8 text-center font-mono text-sm">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-ink hover:text-moss" aria-label="Increase quantity">+</button>
            </div>
            <button onClick={handleAdd} disabled={product.stock === 0}
              className="flex-1 rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:bg-ink/30">
              {product.stock === 0 ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
