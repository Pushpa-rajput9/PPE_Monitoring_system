import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, Clock, Flame, LayoutList, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../../api/client";
import { Violation, Worker } from "../../types";
import { PageHeader, Card, StatCard, SeverityBadge } from "../../components/ui";
import { Loading } from "../../components/Loading";

const PAGE_SIZE = 6;

const severityAccent: Record<string, string> = {
  low: "#64748b",
  medium: "#ea580c",
  high: "var(--color-safety-red)",
};

export const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async () => {
    const { data } = await api.get<Violation[]>("/violations/alerts");
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const highSeverityCount = useMemo(() => alerts.filter((a) => a.severity === "high").length, [alerts]);
  const oldestAlert = useMemo(() => {
    if (alerts.length === 0) return null;
    return alerts.reduce((oldest, a) =>
      new Date(a.detectedAt) < new Date(oldest.detectedAt) ? a : oldest
    );
  }, [alerts]);

  const totalPages = Math.max(1, Math.ceil(alerts.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);
  const pageAlerts = alerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle="Violations left unacknowledged by supervisors for over 10 minutes"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Alerts" value={alerts.length} icon={<ShieldAlert size={18} />} accent="var(--color-safety-red)" />
        <StatCard label="High Severity" value={highSeverityCount} icon={<Flame size={18} />} accent="#ea580c" />
        <StatCard
          label="Longest Outstanding"
          value={oldestAlert ? formatDistanceToNow(new Date(oldestAlert.detectedAt)) : "—"}
          icon={<Clock size={18} />}
          accent="#2563eb"
        />
      </div>

      <Card
        title="Escalated Violations"
        action={
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <LayoutList size={13} />
            {alerts.length > 0 ? `Page ${page} of ${totalPages} · ` : ""}Auto-refreshes every 15s
          </span>
        }
      >
        {loading ? (
          <Loading label="Checking for alerts..." size="sm" />
        ) : alerts.length === 0 ? (
          <div className="text-sm text-slate-400 flex flex-col items-center gap-2 py-8 text-center">
            <ShieldAlert size={22} className="text-slate-300" />
            No escalated alerts right now — supervisors are keeping up with violations.
          </div>
        ) : (
          <div className="space-y-3">
            {pageAlerts.map((a) => {
              const worker = a.worker as Worker;
              return (
                <div
                  key={a._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-red-100 bg-red-50/50"
                  style={{ borderLeft: `4px solid ${severityAccent[a.severity]}` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <ShieldAlert size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">
                        {worker?.name || "Unknown worker"}{" "}
                        <span className="font-normal text-slate-400">· {worker?.workerId}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Missing <span className="font-medium">{a.ppeType}</span> · {a.department} · {a.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-12 sm:pl-0">
                    <SeverityBadge severity={a.severity} />
                    <div className="text-right text-xs text-slate-500">
                      <div>Detected {formatDistanceToNow(new Date(a.detectedAt), { addSuffix: true })}</div>
                      {a.escalatedAt && (
                        <div className="text-red-600 font-medium">
                          Escalated {formatDistanceToNow(new Date(a.escalatedAt), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && alerts.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, alerts.length)} of {alerts.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-slate-500 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};