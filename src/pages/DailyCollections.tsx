import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CreditCard,
  Search,
  Calendar,
  DollarSign,
  Printer,
  CheckCircle2,
  Clock,
  Phone,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';
import { Loan } from '../types';

interface DailyCollectionsProps {
  onOpenPaymentModal: (loan: Loan, defaultAmount?: number) => void;
  onNavigate: (page: string, params?: any) => void;
}

export const DailyCollections: React.FC<DailyCollectionsProps> = ({
  onOpenPaymentModal,
  onNavigate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [data, setData] = useState<{
    date: string;
    totalExpected: number;
    totalCollected: number;
    items: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const res = await api.getDailyCollections(selectedDate);
      setData(res);
    } catch (err) {
      console.error('Failed to load daily collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [selectedDate]);

  const items = (data?.items || []).filter(item =>
    item.borrower_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.loan_no?.toLowerCase().includes(search.toLowerCase()) ||
    item.borrower_phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-emerald-600" />
            Daily Repayment Collections &amp; Drawer Tracker
          </h1>
          <p className="text-xs text-slate-500">
            Real-time cashier collection desk for Tripple MMM Investments Company LTD
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={fetchDaily}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Refresh Collections"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Expected Due Today</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {formatUGX(data?.totalExpected || 0)}
          </span>
          <span className="text-[11px] text-slate-500">{data?.items?.length || 0} borrower installments</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-emerald-50/60 border-emerald-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Received &amp; Verified</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {formatUGX(data?.totalCollected || 0)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Immediate receipted collections</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-amber-50/60 border-amber-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Outstanding Daily Balance</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {formatUGX(Math.max(0, (data?.totalExpected || 0) - (data?.totalCollected || 0)))}
          </span>
          <span className="text-[11px] text-amber-800 font-medium">Pending collections today</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search borrower by name, loan number, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-4 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing {items.length} records for {formatDate(selectedDate)}
        </div>
      </div>

      {/* Table of Expected Borrowers */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" /> Loading daily collection schedule...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No borrower installments due on {formatDate(selectedDate)}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Borrower Name</th>
                  <th className="py-3 px-4">Loan Facility</th>
                  <th className="py-3 px-4">Phone Contact</th>
                  <th className="py-3 px-4">Installment Due</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Remaining Today</th>
                  <th className="py-3 px-4">Total Loan Balance</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Cashier Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{item.borrower_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">No: {item.borrower_no}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.loan_no}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> {item.borrower_phone}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatUGX(item.expected_amount)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                      {formatUGX(item.amount_paid)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {formatUGX(item.remaining_amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {formatUGX(item.total_loan_balance)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'due_today' ? 'bg-amber-500 text-white animate-pulse' :
                        item.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'overdue' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.remaining_amount > 0 ? (
                        <button
                          onClick={() => {
                            // find loan or pass mock
                            const mockLoan: any = {
                              id: item.loan_id,
                              loan_no: item.loan_no,
                              borrower_name: item.borrower_name,
                              borrower_no: item.borrower_no,
                              balance_remaining: item.total_loan_balance,
                              total_repayable: item.total_loan_balance + item.amount_paid,
                              total_paid: item.amount_paid,
                            };
                            onOpenPaymentModal(mockLoan, item.remaining_amount);
                          }}
                          className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700"
                        >
                          <CreditCard className="h-3 w-3" /> Record Payment
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Fully Paid
                        </span>
                      )}
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
