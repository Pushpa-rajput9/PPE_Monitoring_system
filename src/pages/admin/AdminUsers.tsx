import { FormEvent, useEffect, useState } from "react";
import { Plus, X, UserX, UserCheck, Trash2, User, Mail, KeyRound, Building2, Users as UsersIcon, ShieldCheck, ShieldOff } from "lucide-react";
import api from "../../api/client";
import { Supervisor } from "../../types";
import { PageHeader, Card, StatCard } from "../../components/ui";
import { TableSkeleton } from "../../components/Loading";

export const AdminUsers = () => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", site: "Main Site" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get<Supervisor[]>("/users");
    setSupervisors(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", site: "Main Site" });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create supervisor");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    await api.patch(`/users/${id}/status`, { isActive: !isActive });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this supervisor account? This cannot be undone.")) return;
    await api.delete(`/users/${id}`);
    load();
  };

  const activeCount = supervisors.filter((s) => s.isActive).length;
  const disabledCount = supervisors.length - activeCount;

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Create and manage supervisor accounts"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center justify-center gap-2 px-4 py-2.5  bg-blue-950 sm:py-2 rounded-lg text-sm font-semibold text-white w-full sm:w-auto transition-opacity hover:opacity-90"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Supervisor"}
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Supervisors" value={supervisors.length} icon={<UsersIcon size={18} />} accent="#2563eb" />
        <StatCard label="Active" value={activeCount} icon={<ShieldCheck size={18} />} accent="var(--color-safety-green)" />
        <StatCard label="Disabled" value={disabledCount} icon={<ShieldOff size={18} />} accent="var(--color-slate-500)" />
      </div>

      {showForm && (
        <Card title="Create Supervisor" className="mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jordan Lee"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jordan@ppesite.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Temporary password</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  minLength={6}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Site</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            {error && (
              <div className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                style={{ background: "var(--color-amber-dark)" }}
              >
                {submitting ? "Creating..." : "Create supervisor account"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Supervisors">
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : supervisors.length === 0 ? (
          <div className="text-sm text-slate-400 py-8 text-center flex flex-col items-center gap-2">
            <UsersIcon size={22} className="text-slate-300" />
            No supervisors yet. Create the first one above.
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left sm:text-[14px] bg-blue-950 text-xs text-white uppercase tracking-wide border-b border-slate-100">
                    <th className="py-3 pl-2 font-medium">Name</th>
                    <th className="py-3 font-medium">Email</th>
                    <th className="py-3 font-medium">Site</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 pr-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((s,rowIndex) =>{ 
                    const isEven = rowIndex % 2 === 0;
                    return(
                    <tr key={s._id} className={`border-b border-slate-50 last:border-0 ${isEven?"":" bg-blue-100"}`}>
                      <td className="py-3 pr-3 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials(s.name)}
                          </div>
                          <span className="font-medium text-slate-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-500">{s.email}</td>
                      <td className="py-3 pr-3 text-slate-500">{s.site}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {s.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(s._id, s.isActive)}
                            title={s.isActive ? "Disable" : "Enable"}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                          >
                            {s.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => remove(s._id)}
                            title="Remove"
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-3">
              {supervisors.map((s) => (
                <div key={s._id} className="rounded-lg border border-blue-950 bg-blue-50 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(s.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate">{s.name}</div>
                        <div className="text-xs text-slate-600 truncate">{s.email}</div>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {s.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Building2 size={12} /> {s.site}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleStatus(s._id, s.isActive)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600"
                      >
                        {s.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        {s.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => remove(s._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};