import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-ink/50">Loading…</div>;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (adminOnly && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink">Admins only.</p>
        <p className="mt-2 font-body text-sm text-ink/60">Your account doesn't have permission to view this page.</p>
        <Link to="/" className="mt-4 inline-block font-body text-sm text-moss hover:underline">Back home</Link>
      </div>
    );
  }
  return children;
}
