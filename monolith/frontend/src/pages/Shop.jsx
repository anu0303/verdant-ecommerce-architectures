import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/api.js";
import ProductCard from "../components/ProductCard.jsx";
import FilterBar from "../components/FilterBar.jsx";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "",
  };

  useEffect(() => {
    setLoading(true);
    api.getProducts(filters).then((data) => setProducts(data.products)).catch(() => setProducts([])).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function updateFilters(next) {
    const params = {};
    if (next.search) params.search = next.search;
    if (next.category) params.category = next.category;
    if (next.sort) params.sort = next.sort;
    setSearchParams(params);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">{filters.search ? `Results for "${filters.search}"` : "The full catalog"}</h1>
        <p className="mt-1 font-body text-sm text-ink/60">{loading ? "Searching…" : `${products.length} item${products.length === 1 ? "" : "s"}`}</p>
      </div>
      <FilterBar filters={filters} onChange={updateFilters} />
      {!loading && products.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-display text-xl text-ink">Nothing matches that search.</p>
          <p className="mt-2 font-body text-sm text-ink/60">Try a different word, or clear your filters to see everything in stock.</p>
          <button onClick={() => updateFilters({})} className="mt-6 rounded-tag border border-ink/20 px-4 py-2 font-body text-sm text-ink hover:border-moss hover:text-moss">Clear filters</button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
