import React, { useState, useEffect } from 'react';
import {
  BadgeCheck,
  CreditCard,
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';
import { Loan } from '../types';

interface ActiveLoansProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenPaymentModal: (loan: Loan) => void;
  onOpenAgreementModal: (loan: Loan) => void;
}

export const ActiveLoans: React.FC<ActiveLoansProps> = ({
  onNavigate,
  onOpenPaymentModal,
  onOpenAgreementModal,
}) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchActiveLoans = async () => {
    try {
      setLoading(true);
      const res = await api.getLoans('active');
      setLoans(res.loans || []);
    } catch (err) {
      console.error('Failed to load active loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const filtered = loans.filter(l =>
    l.loan_no.toLowerCase().includes(search.toLowerCase()) ||
    (l.borrower_name && l.borrower_name.toLowerCase().includes(search.toLowerCase())) ||
    (l.borrower_phone && l.borrower_phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BadgeCheck className="h-6 w-6 text-emerald-600" />
            Active Loan Portfolio
          </h1>
          <p className="text-xs text-slate-500">
            Currently disbursed and active repayment contracts under Tripple MMM Investments
          </p>
        </div>

        <button
          onClick={() => onNavigate('daily_collections')}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
        >
          <CreditCard className="h-4 w-4" /> Go to Daily Collections
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by loan number, borrower name, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-4 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchActiveLoans}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" /> Loading active portfolio...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No active loans found matching search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Loan No</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Approved Principal</th>
                  <th className="py-3 px-4">Total Contractual</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{loan.loan_no}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{loan.borrower_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{loan.borrower_phone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{formatUGX(loan.approved_principal)}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{formatUGX(loan.total_repayable)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{formatUGX(loan.total_paid)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 text-sm">
                      {formatUGX(loan.balance_remaining)}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-semibold text-slate-600">
                      {loan.repayment_frequency} ({loan.interest_rate}%)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPaymentModal(loan)}
                          className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700"
                        >
                          <CreditCard className="h-3 w-3" /> Collect
                        </button>
                        <button
                          onClick={() => onOpenAgreementModal(loan)}
                          className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          title="Print Loan Contract Agreement"
                        >
                          <FileSpreadsheet className="h-3 w-3" /> Contract
                        </button>
                        <button
                          onClick={() => onNavigate('loan_details', { id: loan.id })}
                          className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <Eye className="h-3 w-3" /> Schedule
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
