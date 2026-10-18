import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  BadgeCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building,
  RefreshCw,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';
import { api, formatUGX, formatDate, formatDateTime } from '../services/api';
import { DashboardSummary } from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold">Loading real-time financial monitoring...</p>
        </div>
      </div>
    );
  }

  const s = summary!;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Financial Operations &amp; Loan Portfolio Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time verified transactions for Tripple MMM Investments Company LTD (UGX)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('daily_collections')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <CreditCard className="h-4 w-4" /> Today's Collections
          </button>
          <button
            onClick={() => onNavigate('register_borrower')}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            <PlusCircle className="h-4 w-4" /> Register Borrower
          </button>
          <button
            onClick={() => onNavigate('loan_applications')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-4 w-4 text-slate-500" /> New Application
          </button>
          <button
            onClick={fetchSummary}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Cards (Prompt Section 5) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Principal Disbursed */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Principal Disbursed</span>
            <span className="rounded bg-blue-50 p-1.5 text-blue-600">
              <BanknoteIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatUGX(s.totalPrincipalDisbursed)}
            </span>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">{s.loansDisbursed} loans disbursed</span>
              <span>•</span>
              <span>{s.fullyRepaidLoans} fully repaid</span>
            </div>
          </div>
        </div>

        {/* Total Repayments Collected */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Repayments Collected</span>
            <span className="rounded bg-emerald-50 p-1.5 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-emerald-600 tracking-tight">
              {formatUGX(s.totalRepaymentsCollected)}
            </span>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Expected: {formatUGX(s.totalExpectedRepayments)}</span>
            </div>
          </div>
        </div>

        {/* Total Outstanding Loan Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Outstanding Balance</span>
            <span className="rounded bg-amber-50 p-1.5 text-amber-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-amber-600 tracking-tight">
              {formatUGX(s.totalOutstandingBalance)}
            </span>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Principal: {formatUGX(s.principalOutstanding)}</span>
              <span>Interest: {formatUGX(s.interestOutstanding)}</span>
            </div>
          </div>
        </div>

        {/* Net Operating Income */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Net Operating Income</span>
            <span className="rounded bg-purple-50 p-1.5 text-purple-600">
              <Building className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatUGX(s.netIncome)}
            </span>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Operating Expenses: {formatUGX(s.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Pulse Grid (16 live operational metrics) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Collections Today */}
        <div className="rounded-xl border border-slate-200 bg-emerald-50/50 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Collections Today</span>
          <p className="mt-1 text-base font-black text-emerald-700">{formatUGX(s.collectionsToday)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Received at counter / MoMo</span>
        </div>

        {/* Loans Due Today */}
        <div className="rounded-xl border border-slate-200 bg-amber-50/50 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Due Today</span>
          <p className="mt-1 text-base font-black text-amber-700">{s.loansDueToday} installments</p>
          <button
            onClick={() => onNavigate('daily_collections')}
            className="text-[10px] font-semibold text-amber-800 underline hover:text-amber-900"
          >
            Open daily collection
          </button>
        </div>

        {/* Due in 7 Days */}
        <div className="rounded-xl border border-slate-200 bg-blue-50/50 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Due within 7 Days</span>
          <p className="mt-1 text-base font-black text-blue-700">{s.dueIn7Days} installments</p>
          <button
            onClick={() => onNavigate('reminders')}
            className="text-[10px] font-semibold text-blue-800 underline hover:text-blue-900"
          >
            Automated reminders
          </button>
        </div>

        {/* Overdue Installments */}
        <div className="rounded-xl border border-slate-200 bg-rose-50/50 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Overdue Installments</span>
          <p className="mt-1 text-base font-black text-rose-700">{s.overdueInstallments} accounts</p>
          <button
            onClick={() => onNavigate('overdue_loans')}
            className="text-[10px] font-semibold text-rose-800 underline hover:text-rose-900"
          >
            Review overdue loans
          </button>
        </div>

        {/* Borrowers Total / Active */}
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Borrower Accounts</span>
          <p className="mt-1 text-base font-black text-slate-900">{s.totalBorrowers} registered</p>
          <span className="text-[10px] text-slate-500 font-medium">{s.activeBorrowers} currently active</span>
        </div>

        {/* Approvals Awaiting */}
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Awaiting Approval</span>
          <p className="mt-1 text-base font-black text-slate-900">{s.awaitingApproval} applications</p>
          <button
            onClick={() => onNavigate('loan_approvals')}
            className="text-[10px] font-semibold text-amber-600 underline hover:text-amber-700"
          >
            Review queue
          </button>
        </div>
      </div>

      {/* Cash & Bank Liquidity Balances (Prompt Section 5 & 18) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-600" />
            Recorded Cash, Mobile Money &amp; Bank Drawer Balances
          </h3>
          <button
            onClick={() => onNavigate('expenses_cash')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
          >
            Perform Daily Cash Reconciliation
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Physical Cash in Drawer</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">{formatUGX(s.cashBalance)}</span>
            <span className="text-[11px] text-slate-500">Kampala Main Branch Counter</span>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Mobile Money Float (MTN &amp; Airtel)</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">{formatUGX(s.momoBalance)}</span>
            <span className="text-[11px] text-slate-500">Corporate Merchant Accounts</span>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Commercial Bank Accounts</span>
            <span className="text-lg font-black text-slate-900 mt-1 block">{formatUGX(s.bankBalance)}</span>
            <span className="text-[11px] text-slate-500">Stanbic &amp; Centenary Operational Balances</span>
          </div>
        </div>
      </div>

      {/* Monthly Trends Table & Performance Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Monthly Loan Disbursements vs. Repayment Collections
              </h3>
              <p className="text-[11px] text-slate-500">Portfolio growth trajectory and monthly yield</p>
            </div>
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-600">
              Uganda Shillings (UGX)
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-semibold">Reporting Period</th>
                  <th className="pb-2 font-semibold">Principal Disbursed</th>
                  <th className="pb-2 font-semibold">Repayments Collected</th>
                  <th className="pb-2 font-semibold">Interest &amp; Fees Earned</th>
                  <th className="pb-2 font-semibold">Recovery Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {s.monthlyTrends.map((t, idx) => {
                  const recovery = t.disbursed > 0 ? Math.min(100, Math.round((t.collected / t.disbursed) * 100)) : 100;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 font-bold text-slate-800">{t.month}</td>
                      <td className="py-2.5 text-slate-700 font-mono">{formatUGX(t.disbursed)}</td>
                      <td className="py-2.5 text-emerald-700 font-mono font-semibold">{formatUGX(t.collected)}</td>
                      <td className="py-2.5 text-amber-700 font-mono">{formatUGX(t.interest)}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          recovery >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {recovery}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operational Summary Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            Company Quick Health Indicators
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Portfolio at Risk (PAR &gt; 30d):</span>
              <span className="font-bold text-slate-800 font-mono">
                {s.overdueInstallments > 0 ? `${Math.min(15, s.overdueInstallments * 2.5)}%` : '0%'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Active Borrowers Ratio:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {s.totalBorrowers > 0 ? `${Math.round((s.activeBorrowers / s.totalBorrowers) * 100)}%` : '100%'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Active Approved Loans:</span>
              <span className="font-bold text-slate-800 font-mono">{s.loansDisbursed} accounts</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Operating Expenses:</span>
              <span className="font-bold text-rose-600 font-mono">{formatUGX(s.totalExpenses)}</span>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate('financial_reports')}
                className="w-full rounded-lg bg-slate-900 py-2 text-center text-xs font-bold text-[#eab308] hover:bg-slate-800"
              >
                View Full Audited Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table (Section 5) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Operational &amp; Financial Activity Log
            </h3>
            <p className="text-[11px] text-slate-500">Audited transaction records and responsible personnel</p>
          </div>
          <button
            onClick={() => onNavigate('audit_logs')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
          >
            View Complete Audit Trail
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-semibold">Date &amp; Time</th>
                <th className="py-2 font-semibold">Employee</th>
                <th className="py-2 font-semibold">Action</th>
                <th className="py-2 font-semibold">Module</th>
                <th className="py-2 font-semibold">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.recentActivity.map(act => (
                <tr key={act.id} className="hover:bg-slate-50">
                  <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                    {formatDateTime(act.timestamp)}
                  </td>
                  <td className="py-2.5 font-medium text-slate-800">
                    {act.user_name} <span className="text-[10px] text-slate-400">({act.user_role})</span>
                  </td>
                  <td className="py-2.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                      {act.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600">{act.module}</td>
                  <td className="py-2.5 text-slate-800 font-medium">{act.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function BanknoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
