import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../../api/client";
import { Violation, Worker } from "../../types";
import { PageHeader, Card, StatusBadge, SeverityBadge } from "../../components/ui";
import { Loading } from "../../components/Loading";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "escalated", label: "Escalated" },
];

export const SupervisorViolations = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [ackingId, setAckingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/violations", { params: { status: status || undefined, limit: 50 } });
    setViolations(data.violations);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const acknowledge = async (id: string) => {
    setAckingId(id);
    try {
      await api.patch(`/violations/${id}/acknowledge`);
      load();
    } finally {
      setAckingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Violations"
        subtitle="Non-compliance events detected by worker IoT devices across the site"
        action={
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              status === f.value
                ? "bg-blue-950 text-white border-transparent"
                : "text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <Loading label="Fetching violations..." />
        ) : violations.length === 0 ? (
          <div className="text-sm text-slate-400">No violations match this filter.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {violations.map((v) => {
              const worker = v.worker as Worker;
              return (
                <div key={v._id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">{worker?.name || "Unknown"}</span>
                      <span className="text-xs text-slate-500">{worker?.workerId}</span>
                      <StatusBadge status={v.status} />
                      <SeverityBadge severity={v.severity} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Missing <span className="font-medium">{v.ppeType}</span> · {v.department} · {v.location} · device {v.deviceId}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Detected {formatDistanceToNow(new Date(v.detectedAt), { addSuffix: true })}
                      {v.acknowledgedAt && ` · Acknowledged ${formatDistanceToNow(new Date(v.acknowledgedAt), { addSuffix: true })}`}
                    </div>
                  </div>

                  {v.status === "open" || v.status === "escalated" ? (
                    <button
                      onClick={() => acknowledge(v._id)}
                      disabled={ackingId === v._id}
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg sm:text-xs text-[10px] font-semibold text-white shrink-0 disabled:opacity-60"
                      style={{ background: "var(--color-safety-green)" }}
                    >
                      <CheckCircle2 size={14} />
                      {ackingId === v._id ? "Saving..." : "Acknowledge"}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium shrink-0">✓ Resolved</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};