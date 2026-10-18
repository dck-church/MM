import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MapPin,
  FileText,
  Download,
  Eye,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { api, formatDate, exportToCSV } from '../services/api';
import { Borrower } from '../types';

interface BorrowersProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Borrowers: React.FC<BorrowersProps> = ({ onNavigate }) => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const res = await api.getBorrowers(search, statusFilter);
      setBorrowers(res.borrowers || []);
    } catch (err) {
      console.error('Failed to load borrowers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, [search, statusFilter]);

  const handleExport = () => {
    const rows = borrowers.map(b => ({
      BorrowerNo: b.borrower_no,
      FullName: b.full_name,
      Phone: b.phone_primary,
      District: b.district,
      Occupation: b.occupation,
      IDType: b.id_type,
      IDNumber: b.id_number,
      Status: b.status,
      RegisteredDate: b.created_at,
    }));
    exportToCSV('tripple_mmm_borrowers_registry', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-600" />
            Borrowers Registry &amp; Profiles
          </h1>
          <p className="text-xs text-slate-500">
            Total {borrowers.length} registered borrowers under Tripple MMM Investments Company LTD
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
            onClick={() => onNavigate('register_borrower')}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            <UserPlus className="h-4 w-4" /> Register New Borrower
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by borrower name, ID number, phone or borrower number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
          <button
            onClick={fetchBorrowers}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Borrowers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-500 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mr-2 text-amber-500" /> Loading borrowers list...
          </div>
        ) : borrowers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No borrowers found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Borrower No</th>
                  <th className="py-3 px-4">Full Legal Name</th>
                  <th className="py-3 px-4">Telephone</th>
                  <th className="py-3 px-4">National ID</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Occupation / Business</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowers.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {b.borrower_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {b.full_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{b.full_name}</span>
                          <span className="text-[10px] text-slate-400">Reg: {formatDate(b.created_at)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {b.phone_primary}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {b.id_number || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {b.district}, {b.town || b.village}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium">{b.occupation || 'Business'}</span>
                      {b.employer_business && (
                        <span className="block text-[10px] text-slate-400">{b.employer_business}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        b.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'blacklisted'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('borrower_profile', { id: b.id })}
                          className="flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <Eye className="h-3 w-3" /> Profile
                        </button>
                        <button
                          onClick={() => onNavigate('loan_applications', { borrower_id: b.id })}
                          className="flex items-center gap-1 rounded bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 border border-amber-200"
                        >
                          <FileText className="h-3 w-3" /> Loan
                        </button>
                      </div>
                    </td>
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
