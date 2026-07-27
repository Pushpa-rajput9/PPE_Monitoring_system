import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import api from "../../api/client";
import { Insights } from "../../types";
import { PageHeader, Card } from "../../components/ui";
import { ChartSkeleton } from "../../components/Loading";
import { DonutChart } from "../../components/charts/DonutChart";

const COLORS = ["#f2a900", "#0b1220", "#d7263d", "#1f9d55", "#2563eb", "#0891b2", "#7c3aed", "#c98600"];

export const AdminInsights = () => {
  const [data, setData] = useState<Insights | null>(null);

  useEffect(() => {
    api.get<Insights>("/dashboard/insights").then((res) => setData(res.data));
  }, []);

  if (!data)
    return (
      <div>
        <PageHeader title="Data Insights" subtitle="Operational patterns across departments, PPE types and time" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartSkeleton height={200} />
          <ChartSkeleton height={200} />
          <ChartSkeleton height={200} />
        </div>
      </div>
    );

  return (
    <div>
      <PageHeader title="Data Insights" subtitle="Operational patterns across departments, PPE types and time" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="By PPE Type" >
          <DonutChart data={data.byPpeType} variant="legend" height={280} centerLabel="Violations" />
        </Card>
        <Card title="Violations by Department">
          <ResponsiveContainer width="100%" height={260} >
            <BarChart data={data.byDepartment} layout="vertical" margin={{ left: -20 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0891B2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <Card title="Violation Trend (last 14 days)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="var(--color-amber-dark)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>


        <Card title="By Status">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.byStatus} dataKey="count" nameKey="label" outerRadius={80}>
                {data.byStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="By Severity">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.bySeverity}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-amber)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};