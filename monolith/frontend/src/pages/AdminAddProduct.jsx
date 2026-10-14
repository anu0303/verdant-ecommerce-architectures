import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";

const empty = { name: "", category: "indoor", price: "", stock: "10", image: "", description: "", careLevel: "easy", light: "medium", tags: "" };

export default function AdminAddProduct() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      if (!file && !form.image) throw new Error("Please choose an image from your computer");
      // Upload the picked file first; fall back to a pasted URL if no file chosen.
      let imageUrl = form.image;
      if (file) imageUrl = (await api.uploadImage(file)).url;
      const { product } = await api.createProduct({
        name: form.name,
        category: form.category,
        price: Math.round(Number(form.price) * 100),
        stock: Number(form.stock),
        image: imageUrl,
        description: form.description,
        careLevel: form.careLevel,
        light: form.light,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setCreated(product);
      setForm(empty);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl text-ink">Add a product</h1>
      <p className="mt-2 font-body text-sm text-ink/60">Admin only. Price is in rupees.</p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <input required placeholder="Product name" className="input sm:col-span-2" value={form.name} onChange={set("name")} />
        <select className="input" value={form.category} onChange={set("category")}>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
          <option value="succulent">Succulent</option>
          <option value="planter">Planter</option>
          <option value="care">Care &amp; tools</option>
        </select>
        <input required type="number" min="1" step="any" placeholder="Price (₹)" className="input" value={form.price} onChange={set("price")} />
        <input required type="number" min="0" placeholder="Stock" className="input" value={form.stock} onChange={set("stock")} />
        <select className="input" value={form.careLevel} onChange={set("careLevel")}>
          <option value="easy">Easy care</option>
          <option value="moderate">Moderate care</option>
          <option value="expert">Expert</option>
        </select>
        <select className="input" value={form.light} onChange={set("light")}>
          <option value="low">Low light</option>
          <option value="medium">Medium light</option>
          <option value="bright">Bright light</option>
        </select>
        <input placeholder="Tags (comma separated)" className="input" value={form.tags} onChange={set("tags")} />
        <div className="sm:col-span-2">
          <label className="block font-body text-sm text-ink/70">Product image (from your computer)</label>
          <input
            key={created ? created.slug : "picker"}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="input mt-1 w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {preview && <img src={preview} alt="Preview" className="mt-3 h-40 w-40 rounded-tag object-cover" />}
          <input type="url" placeholder="…or paste an image URL instead (optional)" className="input mt-3 w-full" value={form.image} onChange={set("image")} />
        </div>
        <textarea required rows={4} placeholder="Description" className="input sm:col-span-2" value={form.description} onChange={set("description")} />
        {error && <p className="sm:col-span-2 rounded-tag border border-ochre/40 bg-ochre/10 px-4 py-3 font-body text-sm text-ochre-dark">{error}</p>}
        {created && (
          <p className="sm:col-span-2 rounded-tag border border-moss/40 bg-moss/10 px-4 py-3 font-body text-sm text-moss">
            Added “{created.name}”. <Link to={`/product/${created.slug}`} className="underline">View it</Link>
          </p>
        )}
        <button type="submit" disabled={busy} className="sm:col-span-2 rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss disabled:opacity-60">
          {busy ? "Saving…" : "Add product"}
        </button>
      </form>
    </div>
  );
}
