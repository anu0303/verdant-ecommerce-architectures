import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import { formatCents } from "../lib/format.js";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getMyOrders().then((d) => setOrders(d.orders)).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink">My orders</h1>
      {error && <p className="mt-6 font-body text-sm text-ochre-dark">{error}</p>}
      {!orders && !error && <p className="mt-6 text-ink/50">Loading…</p>}
      {orders && orders.length === 0 && (
        <div className="mt-8 font-body text-sm text-ink/70">
          You haven't placed any orders yet. <Link to="/shop" className="text-moss hover:underline">Start shopping</Link>
        </div>
      )}
      <div className="mt-8 space-y-4">
        {orders?.map((o) => (
          <Link key={o.orderNumber} to={`/order/${o.orderNumber}`} className="block rounded-tag border border-ink/15 bg-white/50 p-5 hover:border-moss">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm text-ink">{o.orderNumber}</span>
              <span className="rounded-tag bg-moss/10 px-2 py-0.5 font-body text-xs text-moss">{o.status || "Processing"}</span>
            </div>
            <p className="mt-1 font-body text-xs text-ink/50">
              {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="mt-3 font-body text-sm text-ink/70">
              {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
            </p>
            <p className="mt-3 font-mono text-base text-ink">{formatCents(o.total)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
