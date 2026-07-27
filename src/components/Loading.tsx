import { HardHat } from "lucide-react";
import type { CSSProperties } from "react";

type SpinnerSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<SpinnerSize, { box: number; ring: number; icon: number }> = {
  sm: { box: 28, ring: 3, icon: 12 },
  md: { box: 44, ring: 3, icon: 18 },
  lg: { box: 64, ring: 4, icon: 26 },
};

export const Spinner = ({ size = "md", className = "" }: { size?: SpinnerSize; className?: string }) => {
  const { box, ring, icon } = SIZE_MAP[size];
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: box, height: box }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `${ring}px solid var(--color-slate-200)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `${ring}px solid transparent`,
          borderTopColor: "var(--color-amber)",
          borderRightColor: "var(--color-amber)",
          animation: "sg-spin 0.9s linear infinite",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `${ring}px solid transparent`,
          borderBottomColor: "var(--color-ink)",
          animation: "sg-spin-reverse 1.4s linear infinite",
          opacity: 0.7,
        }}
      />
      <HardHat
        size={icon}
        strokeWidth={2.25}
        style={{ color: "var(--color-ink)", animation: "sg-pulse-scale 1.6s ease-in-out infinite" }}
      />
    </div>
  );
};
export const Loading = ({
  label = "Loading...",
  size = "md",
  className = "",
}: {
  label?: string | null;
  size?: SpinnerSize;
  className?: string;
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-10 ${className}`}>
    <Spinner size={size} />
    {label && <p className="text-sm font-medium text-slate-400 tracking-wide">{label}</p>}
  </div>
);

export const PageLoader = ({ label = "Loading SiteGuard..." }: { label?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: "var(--color-paper)" }}>
    <div className="relative inline-flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <div className="absolute inset-0 rounded-2xl hazard-stripe opacity-20" style={{ animation: "sg-pulse-scale 2s ease-in-out infinite" }} />
      <Spinner size="lg" />
    </div>
    <div className="text-center">
      <div className="font-semibold tracking-tight" style={{ color: "var(--color-ink)" }}>
        SiteGuard
      </div>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  </div>
);
export const DotLoader = ({ colorClass = "bg-white" }: { colorClass?: string }) => (
  <span className="inline-flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${colorClass}`}
        style={{ animation: "sg-dot-bounce 1s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
);

const Block = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <div className={`sg-skeleton rounded-md ${className}`} style={style} />
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between shadow-sm">
    <div className="space-y-3 flex-1">
      <Block className="h-3 w-20" />
      <Block className="h-7 w-14" />
    </div>
    <Block className="w-10 h-10 rounded-lg" />
  </div>
);

export const StatCardSkeletonRow = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {Array.from({ length: count }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

export const ChartSkeleton = ({ height = 220 }: { height?: number }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
    <Block className="h-4 w-32 mb-4" />
    <Block className="w-full rounded-lg" style={{ height }} />
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <tr className="border-b border-slate-50 last:border-0">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-3 pr-4">
        <Block className="h-3.5 w-full max-w-35" />
      </td>
    ))}
  </tr>
);

export const TableSkeleton = ({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) => (
  <table className="w-full">
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </tbody>
  </table>
);