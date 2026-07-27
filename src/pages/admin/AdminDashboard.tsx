import { useEffect, useState } from "react";
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Gauge,
  Building2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import api from "../../api/client";
import { AdminDashboardMetrics, Insights, InsightBucket, Violation, Worker } from "../../types";
import { PageHeader, StatCard, Card, SeverityBadge } from "../../components/ui";
import { WorkersTable } from "../../components/WorkersTable";
import { StatCardSkeletonRow, ChartSkeleton } from "../../components/Loading";
import { DonutChart } from "../../components/charts/Donutchart";


const COLORS = ["#f2a900", "#0b1220", "#d7263d", "#1f9d55", "#2563eb", "#0891b2", "#7c3aed", "#c98600"];

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [workforceByDept, setWorkforceByDept] = useState<InsightBucket[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [m, i, w, a] = await Promise.all([
      api.get<AdminDashboardMetrics>("/dashboard/admin"),
      api.get<Insights>("/dashboard/insights"),
      api.get<InsightBucket[]>("/workers/stats/department"),
      api.get<Violation[]>("/violations/alerts"),
    ]);
    setMetrics(m.data);
    setInsights(i.data);
    setWorkforceByDept(w.data);
    setRecentAlerts(a.data.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics || !insights) {
    return (
      <div>
        <PageHeader title="Administrator Dashboard" subtitle="Site-wide workforce and PPE compliance overview" />
        <StatCardSkeletonRow count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Administrator Dashboard" subtitle="Site-wide workforce and PPE compliance overview" />

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Workers" value={metrics.totalWorkers} icon={<Users size={18} />} accent="#2563eb" />
        <StatCard label="Supervisors" value={metrics.totalSupervisors} icon={<Activity size={18} />} accent="#0891b2" />
        <StatCard
          label="Escalated Alerts"
          value={metrics.escalatedAlerts}
          icon={<ShieldAlert size={18} />}
          accent="var(--color-safety-red)"
        />
        <StatCard
          label="Open Violations"
          value={metrics.openViolations}
          icon={<AlertTriangle size={18} />}
          accent="var(--color-amber)"
        />
      </div>

      {/* Compliance + today's activity + workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title="Compliance Rate">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{
                background: `conic-gradient(var(--color-safety-green) ${metrics.complianceRate * 3.6}deg, #e2e8f0 0deg)`,
              }}
            >
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-sm font-bold">
                {metrics.complianceRate}%
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Share of total logged violations that were resolved (acknowledged) rather than left open or escalated.
            </div>
          </div>
        </Card>

        <Card title="Today's Activity">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2"><Gauge size={15} /> Violations detected today</span>
              <span className="font-semibold">{metrics.violationsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2"><CheckCircle2 size={15} /> Acknowledged (all time)</span>
              <span className="font-semibold">{metrics.acknowledgedTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2"><AlertTriangle size={15} /> Total logged violations</span>
              <span className="font-semibold">{metrics.totalViolations}</span>
            </div>
          </div>
        </Card>

        <Card title="Alert Workflow">
          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
            <li>Worker IoT device flags non-compliance</li>
            <li>Violation appears on Supervisor's queue</li>
            <li>Supervisor has 10 minutes to acknowledge</li>
            <li>Unacknowledged items escalate here as Alerts</li>
          </ol>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Violation Trend (14 days)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={insights.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="var(--color-amber-dark)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Workforce by Department">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workforceByDept} layout="vertical" margin={{ left: -20 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0891B2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card title="Violations by Department">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insights.byDepartment}>
              <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="By PPE Type">
          <DonutChart data={insights.byPpeType} variant="legend" height={200} centerLabel="Violations" />
        </Card>

        <Card title="By Status">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={insights.byStatus} dataKey="count" nameKey="label" outerRadius={70}>
                {insights.byStatus.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.label === "escalated" ? "#d7263d" : entry.label === "acknowledged" ? "#1f9d55" : "#f2a900"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent alerts strip */}
      <Card
        title="Recent Alerts"
        action={<span className="text-xs text-slate-400">Unacknowledged for 10+ minutes</span>}
        className="mb-6"
      >
        {recentAlerts.length === 0 ? (
          <div className="text-sm text-slate-400 flex items-center gap-2 py-2">
            <ShieldAlert size={15} /> No escalated alerts right now.
          </div>
        ) : (
          <div className="space-y-2">
            {recentAlerts.map((a) => {
              const worker = a.worker as Worker;
              return (
                <div
                  key={a._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 py-2.5 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <ShieldAlert size={13} />
                    </div>
                    <span className="text-sm font-medium text-slate-800 truncate">{worker?.name}</span>
                    <span className="text-xs text-slate-400 truncate">missing {a.ppeType}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-9 sm:pl-0">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {a.escalatedAt && formatDistanceToNow(new Date(a.escalatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Workforce directory */}
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Workforce Directory</h2>
      </div>
      <WorkersTable />
    </div>
  );
};