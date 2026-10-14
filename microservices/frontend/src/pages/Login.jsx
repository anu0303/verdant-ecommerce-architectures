import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-2 font-body text-sm text-ink/60">Log in to check out and see your orders.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="rounded-tag border border-ochre/40 bg-ochre/10 px-4 py-3 font-body text-sm text-ochre-dark">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss disabled:opacity-60">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 font-body text-sm text-ink/60">
        New here? <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-moss hover:underline">Create an account</Link>
      </p>
      <p className="mt-4 font-mono text-xs text-ink/40">Demo admin: admin@verdant.com / admin123</p>
    </div>
  );
}
