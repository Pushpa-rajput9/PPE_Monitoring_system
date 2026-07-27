import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  FileDown,
  LogOut,
  HardHat,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/alerts", label: "Alerts", icon: ShieldAlert },
  { to: "/admin/insights", label: "Data Insights", icon: BarChart3 },
];

const supervisorLinks = [
  { to: "/supervisor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/supervisor/violations", label: "Violations", icon: AlertTriangle },
  { to: "/supervisor/reports", label: "Reports", icon: FileDown },
];

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = user?.role === "admin" ? adminLinks : supervisorLinks;
  
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center hazard-stripe shrink-0">
            <HardHat size={18} className="text-white drop-shadow" />
          </div>
          <div>
            <div className="font-semibold tracking-tight leading-none">SiteGuard</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">PPE Compliance</div>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm font-medium text-white truncate">{user?.name}</div>
          <div className="text-[11px] text-slate-400 capitalize">
            {user?.role} · {user?.site}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen max-h-screen lg:flex" style={{ background: "var(--color-paper)" }}>
      {/* Mobile top bar */}
      <div
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 text-slate-100"
        style={{ background: "var(--color-ink)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded flex items-center justify-center hazard-stripe shrink-0">
            <HardHat size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">SiteGuard</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: static on desktop, sliding drawer on mobile */}
      <aside
        className={`w-72 sm:w-64 shrink-0 flex flex-col text-slate-100 fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--color-ink)" }}
      >
        {SidebarContent}
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
