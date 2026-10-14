import { Link } from "react-router-dom";
import { formatCents } from "../lib/format.js";

const LIGHT_LABEL = { low: "Low light", medium: "Medium light", bright: "Bright light" };
const LIGHT_ICON = { low: "◐", medium: "◑", bright: "●" };

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.slug}`} className="tag-notch group relative flex flex-col overflow-hidden rounded-tag border border-ink/15 bg-white/50 transition-shadow hover:shadow-lg hover:shadow-ink/5">
      <div className="aspect-square overflow-hidden bg-paperDim">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-dashed border-ink/20 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight text-ink">{product.name}</h3>
          {product.compareAtPrice && (
            <span className="shrink-0 rounded-tag bg-ochre/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ochre-dark">Sale</span>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-ink/60">
          <span title={LIGHT_LABEL[product.light]}>{LIGHT_ICON[product.light]} {LIGHT_LABEL[product.light]}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{product.careLevel} care</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-mono text-base text-ink">{formatCents(product.price)}</span>
          {product.compareAtPrice && <span className="font-mono text-xs text-ink/40 line-through">{formatCents(product.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}
