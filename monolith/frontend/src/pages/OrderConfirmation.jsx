import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/api.js";
import { formatCents } from "../lib/format.js";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getOrder(orderNumber).then((data) => setOrder(data.order)).catch((err) => setError(err.message));
  }, [orderNumber]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink">We couldn't find that order.</p>
        <Link to="/shop" className="mt-4 inline-block font-body text-sm text-moss hover:underline">Back to the shop</Link>
      </div>
    );
  }
  if (!order) return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-ink/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">Order confirmed</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Thank you, {order.customer.name.split(" ")[0]}.</h1>
      <p className="mt-2 font-body text-sm text-ink/60">Order <span className="font-mono">{order.orderNumber}</span> is on its way.</p>

      <div className="mt-8 divide-y divide-dashed divide-ink/20 rounded-tag border border-ink/15 bg-white/50 p-6">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between py-3 font-body text-sm text-ink/80">
            <span>{item.name} × {item.quantity}</span>
            <span className="font-mono">{formatCents(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="space-y-2 pt-4 font-body text-sm">
          <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatCents(order.subtotal)}</span></div>
          <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{formatCents(order.shipping)}</span></div>
          <div className="flex justify-between text-ink/60"><span>GST</span><span>{formatCents(order.tax)}</span></div>
          <div className="flex justify-between font-mono text-base text-ink"><span>Total</span><span>{formatCents(order.total)}</span></div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg text-ink">Shipping to</h2>
        <p className="mt-1 font-body text-sm text-ink/70">
          {order.customer.name}<br />{order.customer.address}<br />{order.customer.city} {order.customer.postalCode}
        </p>
      </div>

      <Link to="/shop" className="mt-10 inline-block rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss">Continue shopping</Link>
    </div>
  );
}
