import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  PieChart,
  ShieldCheck,
  DollarSign,
  Users,
  Award,
  RefreshCw,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Clock,
  Briefcase,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';
import { Shareholder, ProfitDistribution } from '../types';
import { useAuth } from '../context/AuthContext';

export const ShareholdersPortal: React.FC = () => {
  const { isSuperAdmin, isDirector, user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'capital' | 'distributions'>('overview');

  // Distribution proposal modal
  const [showDistModal, setShowDistModal] = useState(false);
  const [periodName, setPeriodName] = useState('Q1 2026 Dividend Distribution');
  const [distributableAmount, setDistributableAmount] = useState('15000000');
  const [distNotes, setDistNotes] = useState('Approved by Board of Directors based on verified Net Interest income.');
  const [submittingDist, setSubmittingDist] = useState(false);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await api.getShareholdersPortalSummary();
      setSummary(res);
    } catch (err) {
      console.error('Failed to load shareholder portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleProposeDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDist(true);
    try {
      const res = await api.proposeProfitDistribution({
        period_name: periodName,
        distributable_amount: Number(distributableAmount),
        notes: distNotes,
      });
      if (res.success) {
        setShowDistModal(false);
        fetchPortalData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingDist(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mr-2" /> Loading Shareholders' Monitoring Portal...
      </div>
    );
  }

  const shareholders: Shareholder[] = summary.shareholders || [];
  const distributions: ProfitDistribution[] = summary.distributions || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-amber-600" />
              Shareholders' Financial Oversight &amp; Investor Portal
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wide">
              Read-Only Verified Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tripple MMM Investments Company LTD • Plot 14 Jinja Road, Kampala
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(isSuperAdmin || isDirector) && (
            <button
              onClick={() => setShowDistModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
            >
              <PieChart className="h-4 w-4" /> Propose Profit Distribution
            </button>
          )}
          <button
            onClick={fetchPortalData}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Refresh Portal"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Strict Privacy Assurance Box (Section 17) */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Shareholder Data Protection &amp; Confidentiality Notice</span>
          <p className="text-[11px] text-blue-800 mt-0.5">
            Per Ugandan Data Protection regulations and company governance policy, this portal presents authorized executive aggregate financial performance, shareholding equity, and dividends. Individual borrowers' confidential National ID documents, signatures, and home addresses are protected from unrestricted viewing.
          </p>
        </div>
      </div>

      {/* High-level Investor Metrics Grid (Section 17) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Capital Contributed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Share Capital Invested</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {formatUGX(summary.totalShareCapital)}
          </span>
          <span className="text-[11px] text-slate-500">{summary.shareholdersCount} registered equity partners</span>
        </div>

        {/* Total Principal Disbursed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Principal Disbursed</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {formatUGX(summary.totalPrincipalDisbursed)}
          </span>
          <span className="text-[11px] text-slate-500">{summary.totalLoansDisbursedCount} loan facilities originated</span>
        </div>

        {/* Total Repayments Collected */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Repayments Collected</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {formatUGX(summary.totalRepaymentsCollected)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">Verified inflows into company drawer &amp; banks</span>
        </div>

        {/* Net Operating Income */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Net Company Earnings</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">
            {formatUGX(summary.netIncome)}
          </span>
          <span className="text-[11px] text-slate-500">Interest collected less recorded expenses</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        {[
          { id: 'overview', label: 'Portfolio Monitoring & Yield' },
          { id: 'capital', label: `Shareholding Equity Register (${shareholders.length})` },
          { id: 'distributions', label: `Profit Distributions & Dividends (${distributions.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 transition border-b-2 ${
              activeTab === t.id
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Portfolio Monitoring */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Loan Portfolio</span>
              <span className="text-xl font-black text-slate-900 block">{summary.activeLoansCount} active facilities</span>
              <span className="text-xs text-slate-600">Outstanding balance: <strong className="text-amber-700">{formatUGX(summary.totalOutstanding)}</strong></span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verified Interest Income</span>
              <span className="text-xl font-black text-emerald-700 block">{formatUGX(summary.interestCollected)}</span>
              <span className="text-xs text-slate-600">Operating Expenses: <strong className="text-rose-700">{formatUGX(summary.totalExpenses)}</strong></span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Collection Efficiency Ratio</span>
              <span className="text-xl font-black text-slate-900 block">{summary.portfolioPerformance?.repaymentRate}%</span>
              <span className="text-xs text-slate-600">Average facility size: {formatUGX(summary.portfolioPerformance?.averageLoanSize)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Shareholder Capital Register */}
      {activeTab === 'capital' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Official Shareholder Register &amp; Capital Contributions
              </h3>
              <p className="text-[11px] text-slate-500">Reconciled with Articles of Association &amp; Board Records</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Shareholder No</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Phone Contact</th>
                  <th className="py-3 px-4">Agreed Capital</th>
                  <th className="py-3 px-4">Actual Capital Contributed</th>
                  <th className="py-3 px-4">Shareholding %</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shareholders.map(sh => (
                  <tr key={sh.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{sh.shareholder_no}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sh.full_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{sh.phone}</td>
                    <td className="py-3 px-4 font-mono">{formatUGX(sh.agreed_capital)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{formatUGX(sh.actual_capital)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-900">
                        {sh.share_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        {sh.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Profit Distribution & Dividends */}
      {activeTab === 'distributions' && (
        <div className="space-y-6">
          {distributions.map(dist => (
            <div key={dist.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{dist.period_name}</h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Calculation Date: {formatDate(dist.calculation_date)} • Approved by: {dist.approved_by}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Distributable</span>
                  <span className="text-lg font-black text-emerald-700 font-mono">{formatUGX(dist.distributable_amount)}</span>
                </div>
              </div>

              {dist.notes && <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg">{dist.notes}</p>}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3">Shareholder</th>
                      <th className="py-2 px-3">Shareholding %</th>
                      <th className="py-2 px-3">Entitled Dividend Amount</th>
                      <th className="py-2 px-3">Payout Status</th>
                      <th className="py-2 px-3">Payment Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dist.allocations.map((al, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{al.shareholder_name}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{al.share_percentage}%</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{formatUGX(al.amount)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            al.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {al.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{al.payment_ref || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose Distribution Modal */}
      {showDistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-amber-600" />
                Propose Shareholder Profit Distribution
              </h3>
              <button onClick={() => setShowDistModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleProposeDistribution} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Reporting Period Name</label>
                <input
                  type="text"
                  required
                  value={periodName}
                  onChange={e => setPeriodName(e.target.value)}
                  placeholder="e.g. Q1 2026 Dividend Distribution"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Total Distributable Amount (UGX)</label>
                <input
                  type="number"
                  required
                  min="100000"
                  step="100000"
                  value={distributableAmount}
                  onChange={e => setDistributableAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500">
                  Will be automatically allocated across shareholders based on their agreed equity percentages.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Board Notes &amp; Resolutions</label>
                <textarea
                  rows={2}
                  value={distNotes}
                  onChange={e => setDistNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDistModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDist}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {submittingDist ? 'Calculating...' : 'Confirm Distribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
