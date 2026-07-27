import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, HardHat } from "lucide-react";
import api from "../api/client";
import { Worker } from "../types";
import { Card } from "./ui";
import { Loading } from "./Loading";

const PAGE_SIZE = 8;

export const WorkersTable = ({ title = "Workforce Directory" }: { title?: string }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<string[]>("/workers/departments").then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .get("/workers", {
          params: { search: search || undefined, department: department || undefined, page, limit: PAGE_SIZE },
        })
        .then((res) => {
          setWorkers(res.data.workers);
          setPages(res.data.pages || 1);
          setTotal(res.data.total || 0);
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, department, page]);

  useEffect(() => {
    setPage(1);
  }, [search, department]);

  return (
    <Card
      title={title}
      action={
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-35">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or ID..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 flex-1 sm:flex-none min-w-30"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {loading ? (
        <Loading label="Loading workforce records..." size="sm" />
      ) : workers.length === 0 ? (
        <div className="text-sm text-slate-400 py-6 text-center">No workers match this filter.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left max-sm:text-[10px] text-[14px] text-white bg-blue-950 uppercase tracking-wide border-b border-slate-100">
                  <th className="py-3 pr-4 pl-2 font-medium">Worker</th>
                  <th className="py-3 pr-4 font-medium">Worker ID</th>
                  <th className="py-3 pr-4 font-medium">Job Profile</th>
                  <th className="py-3 pr-4 font-medium">Department</th>
                  <th className="py-3 pr-4  font-medium">Mobile</th>
                  <th className="py-3 pr-4  font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w,rowIndex) => {
                  const isEven = rowIndex % 2 === 0;
                  return(
                  <tr key={w._id} className={`border-b max-sm:text-xs border-slate-50 last:border-0  ${isEven?"":"bg-blue-100"}`}>
                    <td className="py-2.5 pr-4 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <HardHat size={13} />
                        </div>
                        <span className="font-medium text-slate-800">{w.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{w.workerId}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{w.jobProfile}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{w.department}</td>
                    <td className="py-2.5 pr-4 text-slate-500 font-mono text-xs">{w.mobileNumber}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          w.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {w.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} workers
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
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-1.5 rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};