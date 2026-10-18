import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldAlert,
  RefreshCw,
  User,
} from 'lucide-react';
import { api, formatDateTime, exportToCSV } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => {
    const matchesSearch =
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchesModule = !moduleFilter || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const handleExport = () => {
    const rows = filtered.map(l => ({
      Timestamp: l.timestamp,
      User: l.user_name,
      Role: l.user_role,
      Action: l.action,
      Module: l.module,
      Details: l.details,
    }));
    exportToCSV('tripple_mmm_audit_trail', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-amber-600" />
            Audit Trail &amp; Business Transparency Logs
          </h1>
          <p className="text-xs text-slate-500">
            Immutable system logs tracking financial actions, approvals, disbursements, and payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={fetchLogs}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Refresh Logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, action, details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-4 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Modules</option>
            <option value="Loans">Loans</option>
            <option value="Repayments">Repayments</option>
            <option value="Borrowers">Borrowers</option>
            <option value="Authentication">Authentication</option>
            <option value="Expenses">Expenses</option>
            <option value="Cash Management">Cash Management</option>
            <option value="Shareholders">Shareholders</option>
            <option value="Settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" /> Loading audit trail...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No audit records match your search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Date &amp; Time</th>
                  <th className="py-2.5 px-4">Staff Member</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Action Code</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Activity Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                      {formatDateTime(l.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{l.user_name}</td>
                    <td className="py-2.5 px-4 text-slate-500 capitalize">{l.user_role?.replace('_', ' ')}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-600">{l.module}</td>
                    <td className="py-2.5 px-4 text-slate-800">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
