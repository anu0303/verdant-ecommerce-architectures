import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatCents } from "../lib/format.js";

export default function Cart() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink/50">Loading…</div>;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink">Your cart is empty.</p>
        <p className="mt-2 font-body text-sm text-ink/60">Nothing potted up yet — go find something green.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Your cart</h1>
      <div className="mt-8 divide-y divide-dashed divide-ink/20 border-y border-dashed border-ink/20">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-5">
            <Link to={`/product/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-tag border border-ink/15">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </Link>
            <div className="flex-1">
              <Link to={`/product/${item.slug}`} className="font-display text-lg text-ink hover:text-moss">{item.name}</Link>
              <p className="font-mono text-xs text-ink/50">{formatCents(item.price)} each</p>
            </div>
            <div className="flex items-center rounded-tag border border-ink/20">
              <button onClick={() => updateItem(item.productId, item.quantity - 1)} className="px-3 py-2 text-ink hover:text-moss" aria-label={`Decrease quantity of ${item.name}`}>−</button>
              <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
              <button onClick={() => updateItem(item.productId, item.quantity + 1)} className="px-3 py-2 text-ink hover:text-moss" aria-label={`Increase quantity of ${item.name}`}>+</button>
            </div>
            <p className="w-20 text-right font-mono text-sm text-ink">{formatCents(item.lineTotal)}</p>
            <button onClick={() => removeItem(item.productId)} className="font-body text-xs text-ink/40 hover:text-ochre-dark" aria-label={`Remove ${item.name} from cart`}>Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-end gap-2">
        <div className="flex w-full max-w-xs justify-between font-body text-sm text-ink/70 sm:w-64">
          <span>Subtotal</span><span className="font-mono">{formatCents(cart.subtotal)}</span>
        </div>
        <p className="font-body text-xs text-ink/40">Shipping and tax calculated at checkout.</p>
        <button onClick={() => navigate("/checkout")} className="mt-4 w-full max-w-xs rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss sm:w-64">Proceed to checkout</button>
      </div>
    </div>
  );
}
