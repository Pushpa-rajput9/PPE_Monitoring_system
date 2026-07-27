import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Timer, ListChecks, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import api from "../../api/client";
import { SupervisorDashboardMetrics, Insights, Violation, Worker } from "../../types";
import { PageHeader, StatCard, Card, StatusBadge, SeverityBadge } from "../../components/ui";
import { WorkersTable } from "../../components/WorkersTable";
import { DonutChart } from "../../components/charts/DonutChart";
import { StatCardSkeletonRow, ChartSkeleton } from "../../components/Loading";

export const SupervisorDashboard = () => {
  const [metrics, setMetrics] = useState<SupervisorDashboardMetrics | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [recent, setRecent] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [m, i, v] = await Promise.all([
      api.get<SupervisorDashboardMetrics>("/dashboard/supervisor"),
      api.get<Insights>("/dashboard/insights"),
      api.get("/violations", { params: { limit: 6 } }),
    ]);
    setMetrics(m.data);
    setInsights(i.data);
    setRecent(v.data.violations);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics || !insights)
    return (
      <div>
        <PageHeader title="Supervisor Dashboard" subtitle="Your site's PPE compliance activity" />
        <StatCardSkeletonRow count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );

  return (
    <div>
      <PageHeader title="Supervisor Dashboard" subtitle="Your site's PPE compliance activity" />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Violations Today"
          value={metrics.violationsToday}
          icon={<AlertTriangle size={18} />}
          accent="var(--color-amber)"
        />
        <StatCard
          label="Pending Acknowledgement"
          value={metrics.pendingAck}
          icon={<Timer size={18} />}
          accent="#2563eb"
        />
        <StatCard
          label="Acknowledged Today"
          value={metrics.acknowledgedToday}
          icon={<CheckCircle2 size={18} />}
          accent="var(--color-safety-green)"
        />
        <StatCard
          label="Escalated Today"
          value={metrics.escalatedToday}
          icon={<ShieldAlert size={18} />}
          accent="var(--color-safety-red)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title="Average Response Time" className="lg:col-span-1">
          <div className="text-3xl font-bold" style={{ color: "var(--color-ink)" }}>
            {metrics.avgResponseMinutes} <span className="text-base font-medium text-slate-400">min</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Time between an IoT device flagging non-compliance and acknowledgement (last 7 days). Unacknowledged
            items escalate to the administrator after 10 minutes.
          </p>
        </Card>

        <Card title="Violations by Severity" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={insights.bySeverity}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-amber)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="By PPE Type" className="lg:col-span-1">
          <DonutChart data={insights.byPpeType} variant="legend" height={180} centerLabel="Violations" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card title="14-Day Violation Trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={insights.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#2563eb33" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title="Recent Violations"
          action={
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ListChecks size={13} /> Latest 6
            </span>
          }
        >
          <div className="space-y-2">
            {recent.map((v) => {
              const worker = v.worker as Worker;
              return (
                <div key={v._id} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate">{worker?.name}</span>
                      <StatusBadge status={v.status} />
                    </div>
                    <div className="text-xs text-slate-400">
                      {v.ppeType} · {formatDistanceToNow(new Date(v.detectedAt), { addSuffix: true })}
                    </div>
                  </div>
                  <SeverityBadge severity={v.severity} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Workforce Directory</h2>
      </div>
      <WorkersTable />
    </div>
  );
};