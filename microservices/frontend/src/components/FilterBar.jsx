const CATEGORIES = [
  { value: "", label: "All" },
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "succulent", label: "Succulents" },
  { value: "planter", label: "Planters" },
  { value: "care", label: "Care tools" },
];
const SORTS = [
  { value: "", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-dashed border-ink/20 pb-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => onChange({ ...filters, category: c.value })}
            className={`rounded-tag border px-3 py-1.5 font-body text-sm transition-colors ${filters.category === c.value ? "border-moss bg-moss text-paper" : "border-ink/20 text-ink/70 hover:border-moss hover:text-moss"}`}>
            {c.label}
          </button>
        ))}
      </div>
      <label className="ml-auto flex items-center gap-2 font-mono text-xs text-ink/60">
        Sort
        <select value={filters.sort} onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="rounded-tag border border-ink/20 bg-white/60 px-2 py-1.5 font-body text-sm text-ink">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
    </div>
  );
}
