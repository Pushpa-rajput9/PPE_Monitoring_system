import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { InsightBucket } from "../../types";

const RADIAN = Math.PI / 180;

export const DONUT_COLORS = ["#f2a900", "#0b1220", "#d7263d", "#1f9d55", "#2563eb", "#0891b2", "#7c3aed", "#c98600"];

interface ExternalLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: string;
  fill: string;
}

const truncate = (s: string, max = 15) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

const renderExternalLabel = (props: unknown) => {
  const { cx, cy, midAngle, outerRadius, percent, name, fill } = props as ExternalLabelProps;
  if (percent < 0.03) return null;
  const radius = outerRadius + 10;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight={600}
    >
      {`${truncate(name)} ${Math.round(percent * 100)}%`}
    </text>
  );
};

interface DonutChartProps {
  data: InsightBucket[];
  height?: number;
  colors?: string[];
  centerLabel?: string;
  variant?: "labeled" | "legend";
}

export const DonutChart = ({
  data,
  height = 220,
  colors = DONUT_COLORS,
  centerLabel = "Total",
  variant = "legend",
}: DonutChartProps) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const ringHeight = variant === "legend" ? Math.max(height - 56, 120) : height;
  const isLabeled = variant === "labeled";

  return (
    <div>
      <div className="relative" style={{ height: ringHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            margin={
              isLabeled ? { top: 24, right: 108, bottom: 24, left: 108 } : { top: 0, right: 0, bottom: 0, left: 0 }
            }
          >
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={isLabeled ? "48%" : "58%"}
              outerRadius={isLabeled ? "80%" : "100%"}
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
              labelLine={isLabeled ? { stroke: "#cbd5e1", strokeWidth: 1 } : false}
              label={isLabeled ? renderExternalLabel : undefined}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold leading-none" style={{ color: "var(--color-ink)" }}>
            {total}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-1">{centerLabel}</div>
        </div>
      </div>

      {variant === "legend" && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
              <span className="truncate max-w-27.5">{d.label}</span>
              <span className="text-slate-400">· {d.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};