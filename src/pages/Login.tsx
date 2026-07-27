import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HardHat, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DotLoader } from "../components/Loading";

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/supervisor");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-ink)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center hazard-stripe mb-4">
            <HardHat size={26} className="text-white drop-shadow" />
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">SiteGuard</h1>
          <p className="text-slate-400 text-sm mt-1">PPE Compliance Monitoring</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ppesite.com"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-80 flex items-center justify-center gap-2"
            style={{ background: "var(--color-ink)" }}
          >
            {loading ? (
              <>
                Signing in <DotLoader />
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed">
            Demo accounts (after seeding):<br />
            Admin: admin@ppesite.com / Admin@12345<br />
            Supervisor: supervisor@ppesite.com / Supervisor@12345
          </div>
        </form>
      </div>
    </div>
  );
};