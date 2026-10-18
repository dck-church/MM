import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { api, formatUGX, formatDate, exportToCSV } from '../services/api';
import { DashboardSummary } from '../types';

export const FinancialReports: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!summary) return;
    const reportData = [
      { Metric: 'Total Principal Disbursed', AmountUGX: summary.totalPrincipalDisbursed },
      { Metric: 'Total Repayments Collected', AmountUGX: summary.totalRepaymentsCollected },
      { Metric: 'Principal Outstanding', AmountUGX: summary.principalOutstanding },
      { Metric: 'Interest Outstanding', AmountUGX: summary.interestOutstanding },
      { Metric: 'Total Outstanding Portfolio', AmountUGX: summary.totalOutstandingBalance },
      { Metric: 'Operating Expenses', AmountUGX: summary.totalExpenses },
      { Metric: 'Net Operating Income', AmountUGX: summary.netIncome },
      { Metric: 'Physical Cash Balance', AmountUGX: summary.cashBalance },
      { Metric: 'Bank Accounts Balance', AmountUGX: summary.bankBalance },
      { Metric: 'Mobile Money Float Balance', AmountUGX: summary.momoBalance },
    ];
    exportToCSV(`tripple_mmm_${period}_financial_report`, reportData);
  };

  if (loading || !summary) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mr-2" /> Generating verified financial statements...
      </div>
    );
  }

  const s = summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-600" />
            Financial Reporting &amp; Portfolio Statement
          </h1>
          <p className="text-xs text-slate-500">
            Official periodic income, expense, and loan portfolio accounts for Tripple MMM Investments
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded px-2.5 py-1 font-bold capitalize transition ${
                  period === p ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" /> Print Statement
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Report Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Tripple MMM Investments Company LTD
          </h2>
          <p className="text-xs text-slate-500">
            Commercial Plaza, Plot 14 Jinja Road, Kampala, Uganda • Tel: +256 746163098
          </p>
          <div className="mt-2 inline-block rounded bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-800">
            {period} Financial Statement &amp; Credit Portfolio Performance
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">
            Generated: {new Date().toLocaleString('en-GB')} • Currency: Ugandan Shillings (UGX)
          </p>
        </div>

        {/* Section 1: Portfolio Disbursed & Collected */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            1. Lending Operations &amp; Cashflow Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Total Principal Disbursed:</span>
              <span className="font-mono font-bold text-slate-900">{formatUGX(s.totalPrincipalDisbursed)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Total Contractual Expected:</span>
              <span className="font-mono font-bold text-slate-900">{formatUGX(s.totalExpectedRepayments)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Total Repayments Collected:</span>
              <span className="font-mono font-bold text-emerald-700">{formatUGX(s.totalRepaymentsCollected)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Collections Received Today:</span>
              <span className="font-mono font-bold text-emerald-700">{formatUGX(s.collectionsToday)}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Portfolio Receivables & Arrears */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            2. Outstanding Loan Portfolio &amp; Arrears Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Principal Outstanding:</span>
              <span className="font-mono font-bold text-slate-900">{formatUGX(s.principalOutstanding)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Interest &amp; Fees Outstanding:</span>
              <span className="font-mono font-bold text-slate-900">{formatUGX(s.interestOutstanding)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-bold">Total Remaining Outstanding Receivables:</span>
              <span className="font-mono font-black text-amber-700 text-sm">{formatUGX(s.totalOutstandingBalance)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Overdue Installments Count:</span>
              <span className="font-mono font-bold text-rose-700">{s.overdueInstallments} delinquent accounts</span>
            </div>
          </div>
        </div>

        {/* Section 3: Income, Expenses & Net Profit */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            3. Income Statement (Profit &amp; Loss)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Verified Interest &amp; Processing Fee Income:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatUGX(s.netIncome + s.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-rose-700">
              <span>Less Recorded Operating Expenses (Rent, Salaries, Utilities, Transport):</span>
              <span className="font-mono font-bold">({formatUGX(s.totalExpenses)})</span>
            </div>
            <div className="flex justify-between py-2.5 bg-slate-100 px-4 rounded-xl font-bold text-sm text-slate-900">
              <span>Net Operating Income (Period Earnings):</span>
              <span className="font-mono text-purple-700 text-base">{formatUGX(s.netIncome)}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Liquid Cash & Bank Position */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            4. Reconciled Liquidity &amp; Cash Balances
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Physical Cash in Drawer</span>
              <span className="font-mono font-bold text-slate-900 text-sm block mt-1">{formatUGX(s.cashBalance)}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Commercial Bank Accounts</span>
              <span className="font-mono font-bold text-slate-900 text-sm block mt-1">{formatUGX(s.bankBalance)}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Mobile Money Float (MTN/Airtel)</span>
              <span className="font-mono font-bold text-slate-900 text-sm block mt-1">{formatUGX(s.momoBalance)}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="h-12 border-b border-dashed border-slate-400" />
            <p className="mt-1 font-bold text-slate-900">Chief Accountant / Cashier</p>
            <p className="text-[10px] text-slate-400">Sarah Namubiru / Grace Atuhaire</p>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-400" />
            <p className="mt-1 font-bold text-slate-900">Managing Director / Auditor</p>
            <p className="text-[10px] text-slate-400">Mpiima Miracle/ Paul Ssemwogerere</p>
          </div>
        </div>
      </div>
    </div>
  );
};
