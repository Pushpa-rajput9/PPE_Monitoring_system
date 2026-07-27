import { ReactNode } from "react";
import { AlertTriangle, ShieldAlert, X, HardHat } from "lucide-react";
import { useNotifications, AppNotification } from "../context/NotificationContext";
import { ViolationSeverity } from "../types";

const severityAccent: Record<ViolationSeverity, string> = {
  low: "#64748b",
  medium: "#ea580c",
  high: "var(--color-safety-red)",
};

const kindIcon: Record<AppNotification["kind"], ReactNode> = {
  violation: <HardHat size={16} />,
  escalated: <ShieldAlert size={16} />,
  acknowledged: <AlertTriangle size={16} />,
};

export const NotificationToasts = () => {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-3  right-4 z-100 w-[92vw] max-w-sm sm:max-w-md flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => {
        const accent = severityAccent[n.severity];
        const isEscalated = n.kind === "escalated";
        return (
          <div
            key={n.id}
            className={`sg-toast pointer-events-auto relative overflow-hidden rounded-xl border bg-white shadow-lg ${
              isEscalated ? "border-red-200" : "border-slate-200"
            }`}
            style={{ borderLeft: `4px solid ${accent}` }}
            role="alert"
          >
            <div className="flex items-start gap-3 pl-3.5 pr-2.5 py-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isEscalated ? "sg-toast-pulse" : ""
                }`}
                style={{ background: `${accent}1f`, color: accent }}
              >
                {kindIcon[n.kind]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800 leading-tight">{n.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-snug truncate">{n.message}</div>
              </div>
              <button
                onClick={() => dismiss(n.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
            <div className="h-0.5 w-full bg-slate-100">
              <div className="sg-toast-bar h-full" style={{ background: accent }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
