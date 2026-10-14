import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../api/api.js";
import { formatCents } from "../lib/format.js";

export default function Checkout() {
  const { cart, loading, refresh } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", address: "", city: "", postalCode: "", country: "India" });
  const [card, setCard] = useState({ cardNumber: "", expiry: "", cvc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && cart.items.length === 0) navigate("/cart");
  }, [loading, cart.items.length, navigate]);

  const shipping = 9900;
  const tax = Math.round(cart.subtotal * 0.18);
  const total = cart.subtotal + shipping + tax;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { order } = await api.checkout({ customer: form, card });
      await refresh();
      navigate(`/order/${order.orderNumber}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || cart.items.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Checkout</h1>
      <div className="mt-8 grid gap-10 sm:grid-cols-[1.4fr,1fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="font-display text-lg text-ink">Shipping details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Full name" className="input sm:col-span-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Email" className="input sm:col-span-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required placeholder="Address" className="input sm:col-span-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input required placeholder="City" className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input required placeholder="PIN code" className="input" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink">Payment</h2>
            <p className="mt-1 font-body text-xs text-ink/50">Demo store — use 4242 4242 4242 4242 to succeed, or 4000 0000 0000 0002 to test a decline.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Card number" className="input sm:col-span-2" value={card.cardNumber} onChange={(e) => setCard({ ...card, cardNumber: e.target.value })} />
              <input required placeholder="MM/YY" className="input" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
              <input required placeholder="CVC" className="input" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
            </div>
          </div>
          {error && <p className="rounded-tag border border-ochre/40 bg-ochre/10 px-4 py-3 font-body text-sm text-ochre-dark">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss disabled:opacity-60">
            {submitting ? "Processing…" : `Pay ${formatCents(total)}`}
          </button>
        </form>
        <div className="h-fit rounded-tag border border-ink/15 bg-white/50 p-6">
          <h2 className="font-display text-lg text-ink">Order summary</h2>
          <div className="mt-4 space-y-2 font-body text-sm">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-ink/70">
                <span>{item.name} × {item.quantity}</span><span className="font-mono">{formatCents(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-dashed border-ink/20 pt-4 font-body text-sm">
            <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatCents(cart.subtotal)}</span></div>
            <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{formatCents(shipping)}</span></div>
            <div className="flex justify-between text-ink/60"><span>GST (18%)</span><span>{formatCents(tax)}</span></div>
            <div className="flex justify-between border-t border-dashed border-ink/20 pt-2 font-mono text-base text-ink"><span>Total</span><span>{formatCents(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
