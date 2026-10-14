import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Create your account</h1>
      <p className="mt-2 font-body text-sm text-ink/60">It takes a few seconds.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" minLength={6} placeholder="Password (min 6 characters)" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="rounded-tag border border-ochre/40 bg-ochre/10 px-4 py-3 font-body text-sm text-ochre-dark">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss disabled:opacity-60">
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 font-body text-sm text-ink/60">
        Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-moss hover:underline">Log in</Link>
      </p>
    </div>
  );
}
