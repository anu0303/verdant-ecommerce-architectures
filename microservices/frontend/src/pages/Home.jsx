import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.getProducts({ sort: "rating" }).then((data) => setFeatured(data.products.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="grid gap-10 sm:grid-cols-[1.2fr,1fr] sm:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-moss">Catalog No. 04 — Now Growing</p>
            <h1 className="font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
              A greenhouse,<br /><span className="italic text-moss">indexed.</span>
            </h1>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-ink/70">
              Every plant listed here comes tagged the way a nursery tags it: light needs, care level, and price, at a glance.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop" className="rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper transition-colors hover:bg-moss">Browse the shop</Link>
              <Link to="/shop?category=indoor" className="rounded-tag border border-ink/20 px-6 py-3 font-body text-sm text-ink transition-colors hover:border-moss hover:text-moss">Indoor plants</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-tag border border-ink/15">
            <img src="https://images.unsplash.com/photo-1755355761632-b0478d4edbad?w=900&q=80&auto=format&fit=crop" alt="A fiddle leaf fig in bright light" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between border-b border-dashed border-ink/20 pb-4">
          <h2 className="font-display text-2xl text-ink">Top rated this season</h2>
          <Link to="/shop" className="font-body text-sm text-moss hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
