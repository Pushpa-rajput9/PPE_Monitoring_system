import { useEffect, useMemo, useState } from "react";
import { FileDown, FileText, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import api from "../../api/client";
import { Violation, Worker, InsightBucket } from "../../types";
import { PageHeader, Card, StatCard, StatusBadge, SeverityBadge } from "../../components/ui";
import { DonutChart } from "../../components/charts/Donutchart";
import { DotLoader, TableSkeleton } from "../../components/Loading";
import { generateViolationsPdf } from "../../utils/pdfReport";
import { AlertTriangle, CheckCircle2, ShieldAlert, ListChecks } from "lucide-react";

const PAGE_SIZE = 10;

export const SupervisorReports = () => {
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);

  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    api.get<string[]>("/workers/departments").then((res) => setDepartments(res.data));
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/violations", {
      params: {
        status: status || undefined,
        department: department || undefined,
        from: from || undefined,
        to: to || undefined,
        limit: 200,
      },
    });
    setViolations(data.violations);
    setPage(1);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, department, from, to]);
  const summary = useMemo(() => {
    const open = violations.filter((v) => v.status === "open").length;
    const acknowledged = violations.filter((v) => v.status === "acknowledged").length;
    const escalated = violations.filter((v) => v.status === "escalated").length;

    const statusBuckets: InsightBucket[] = [
      { label: "open", count: open },
      { label: "acknowledged", count: acknowledged },
      { label: "escalated", count: escalated },
    ].filter((b) => b.count > 0);

    const severityMap: Record<string, number> = {};
    violations.forEach((v) => {
      severityMap[v.severity] = (severityMap[v.severity] || 0) + 1;
    });
    const severityBuckets: InsightBucket[] = Object.entries(severityMap).map(([label, count]) => ({ label, count }));

    return { open, acknowledged, escalated, statusBuckets, severityBuckets };
  }, [violations]);

  const totalPages = Math.max(1, Math.ceil(violations.length / PAGE_SIZE));
  const pageRows = violations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters = { status, department, from, to };

  const handleDownloadCsv = async () => {
    setDownloadingCsv(true);
    setPdfError(null);
    try {
      const res = await api.get("/reports/violations/export", {
        params: {
          status: status || undefined,
          department: department || undefined,
          from: from || undefined,
          to: to || undefined,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `violations-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV export failed:", err);
      setPdfError("Couldn't export the CSV. Please try again.");
    } finally {
      setDownloadingCsv(false);
    }
  };

  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      generateViolationsPdf(violations, activeFilters, {
        statusBuckets: summary.statusBuckets,
        severityBuckets: summary.severityBuckets,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      setPdfError("Couldn't generate the PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Preview, filter and export the violations list for offline review or audits"
      />

      {/* Filters */}
      <Card title="Filters" className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv || violations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-950 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            
          >
            <FileDown size={16} />
            {downloadingCsv ? (
              <>
                Preparing <DotLoader />
              </>
            ) : (
              "Download CSV"
            )}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || violations.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--color-amber-dark)" }}
          >
            <FileText size={16} />
            {downloadingPdf ? (
              <>
                Building PDF <DotLoader />
              </>
            ) : (
              "Download PDF"
            )}
          </button>
          <span className="text-xs text-slate-400 ml-auto">
            {violations.length} record{violations.length !== 1 ? "s" : ""} match the current filters
          </span>
        </div>
        {pdfError && (
          <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {pdfError}
          </div>
        )}
      </Card>
      <div className="bg-white rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard label="Open" value={summary.open} icon={<AlertTriangle size={18} />} accent="var(--color-amber)" />
          <StatCard
            label="Acknowledged"
            value={summary.acknowledged}
            icon={<CheckCircle2 size={18} />}
            accent="var(--color-safety-green)"
          />
          <StatCard
            label="Escalated"
            value={summary.escalated}
            icon={<ShieldAlert size={18} />}
            accent="var(--color-safety-red)"
          />
        </div>

        {violations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <Card title="Status Breakdown">
              <DonutChart data={summary.statusBuckets} variant="legend" height={190} centerLabel="Matching" />
            </Card>
            <Card title="Severity Breakdown">
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={summary.severityBuckets}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-amber)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </div>

      {/* Data table */}
      <Card
        title="Violations"
        action={
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ListFilter size={13} />
            Page {page} of {totalPages}
          </span>
        }
      >
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : violations.length === 0 ? (
          <div className="text-sm text-slate-400 py-6 text-center flex flex-col items-center gap-2">
            <ListChecks size={20} className="text-slate-300" />
            No violations match the current filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] sm:text-[14px] text-white uppercase bg-blue-950 tracking-wide border-b border-slate-300">
                    <th className="py-3 pr-4 pl-2 font-medium">Worker</th>
                    <th className="py-3 font-medium pr-4">Department</th>
                    <th className="py-3 font-medium pr-4">PPE Type</th>
                    <th className="py-3 font-medium pr-4">Severity</th>
                    <th className="py-3 font-medium pr-4">Status</th>
                    <th className="py-3 font-medium pr-4">Detected</th>
                    <th className="py-3 font-medium">Acknowledged</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((v,rowIndex) => {
                    const worker = v.worker as Worker;
                    const isEven = rowIndex % 2 === 0;
                    return (
                      <tr key={v._id} className={`border-b border-slate-50 max-sm:text-xs  last:border-0  ${isEven?"":"bg-blue-100"}`}>
                        <td className="py-2.5 pr-4 pl-2">
                          <div className="font-medium text-slate-800">{worker?.name || "Unknown"}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{worker?.workerId}</div>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-600">{v.department}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{v.ppeType}</td>
                        <td className="py-2.5 pr-4">
                          <SeverityBadge severity={v.severity} />
                        </td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={v.status} />
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(v.detectedAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 text-slate-500 text-xs whitespace-nowrap">
                          {v.acknowledgedAt ? new Date(v.acknowledgedAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, violations.length)} of{" "}
                {violations.length}
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
          </>
        )}
      </Card>
    </div>
  );
};