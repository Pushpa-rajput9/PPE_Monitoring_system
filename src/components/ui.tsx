import { ReactNode } from "react";
import { ViolationStatus, ViolationSeverity } from "../types";

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
    <div>
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
        {title}
      </h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatCard = ({
  label,
  value,
  icon,
  accent = "var(--color-amber)",
  suffix,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string;
  suffix?: string;
}) => (
  <div className="group rounded-xl border gap-1 border-slate-200 bg-white p-2 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-linear-to-br hover:from-white hover:via-amber-50 hover:to-orange-100 flex items-start justify-between">
    <div>
      <div className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: "var(--color-ink)" }}>
        {value}
        {suffix && <span className="text-base font-medium text-slate-400 ml-1">{suffix}</span>}
      </div>
    </div>
    <div
      className="w-5 h-5 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${accent}22`, color: accent }}
    >
      {icon}
    </div>
  </div>
);

const statusStyles: Record<ViolationStatus, string> = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  acknowledged: "bg-emerald-100 text-emerald-800 border-emerald-200",
  escalated: "bg-red-100 text-red-800 border-red-200",
};

export const StatusBadge = ({ status }: { status: ViolationStatus }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border capitalize ${statusStyles[status]}`}>
    {status}
  </span>
);

const severityStyles: Record<ViolationSeverity, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

export const SeverityBadge = ({ severity }: { severity: ViolationSeverity }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${severityStyles[severity]}`}>
    {severity}
  </span>
);

export const Card = ({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {title && (
      <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3.5 sm:px-5 sm:py-4 rounded-t-xl border-b border-slate-200">
        <h2 className="font-semibold text-sm sm:text-xl " style={{ color: "var(--color-ink)" }}>{title}</h2>
        {action}
      </div>
    )}
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);