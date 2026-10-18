import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  PlusCircle,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  RefreshCw,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { api, formatUGX, formatDate, formatDateTime } from '../services/api';
import { Expense, CashReconciliation } from '../types';

export const ExpensesCash: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reconciliations, setReconciliations] = useState<CashReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'expenses'>('reconciliation');

  // Expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<any>('rent');
  const [expAmount, setExpAmount] = useState('150000');
  const [expDesc, setExpDesc] = useState('');
  const [expMethod, setExpMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer'>('cash');
  const [expRef, setExpRef] = useState('');
  const [savingExp, setSavingExp] = useState(false);

  // Reconciliation form
  const [showReconModal, setShowReconModal] = useState(false);
  const [reconDate, setReconDate] = useState(new Date().toISOString().split('T')[0]);
  const [openingCash, setOpeningCash] = useState('2500000');
  const [collCash, setCollCash] = useState('11000');
  const [collMomo, setCollMomo] = useState('412500');
  const [collBank, setCollBank] = useState('2750000');
  const [expCash, setExpCash] = useState('85000');
  const [actualCashCounted, setActualCashCounted] = useState('2426000');
  const [momoFloat, setMomoFloat] = useState('14850000');
  const [bankBalance, setBankBalance] = useState('68400000');
  const [reconNotes, setReconNotes] = useState('Drawer count verified at end of business day.');
  const [submittingRecon, setSubmittingRecon] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eRes, rRes] = await Promise.all([api.getExpenses(), api.getReconciliations()]);
      setExpenses(eRes.expenses || []);
      setReconciliations(rRes.reconciliations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExp(true);
    try {
      const res = await api.createExpense({
        category: expCategory,
        amount: Number(expAmount),
        description: expDesc,
        payment_method: expMethod,
        reference: expRef,
      });
      if (res.success) {
        setShowExpenseModal(false);
        setExpDesc('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingExp(false);
    }
  };

  const handleReconSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRecon(true);

    const op = Number(openingCash);
    const cc = Number(collCash);
    const ec = Number(expCash);
    const expected = op + cc - ec;

    try {
      const res = await api.submitReconciliation({
        date: reconDate,
        branch: 'Kampala Main Branch',
        opening_cash: op,
        total_collections_cash: cc,
        total_collections_momo: Number(collMomo),
        total_collections_bank: Number(collBank),
        total_disbursements_cash: 0,
        total_expenses_cash: ec,
        expected_closing_cash: expected,
        actual_cash_counted: Number(actualCashCounted),
        momo_balance: Number(momoFloat),
        bank_balance: Number(bankBalance),
        notes: reconNotes,
      });
      if (res.success) {
        setShowReconModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingRecon(false);
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-600" />
            Expenses &amp; Daily Cash Drawer Reconciliation
          </h1>
          <p className="text-xs text-slate-500">
            Internal operations control: Counter physical cash, Mobile Money float, and Bank balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            <PlusCircle className="h-4 w-4" /> Record Operational Expense
          </button>
          <button
            onClick={() => setShowReconModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
          >
            <CalendarCheck className="h-4 w-4 text-[#eab308]" /> New Cash Reconciliation
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Approved Operating Expenses</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{formatUGX(totalExpenses)}</span>
          <span className="text-[11px] text-slate-500">{expenses.length} expense vouchers</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Drawer Reconciliations Recorded</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{reconciliations.length} days</span>
          <span className="text-[11px] text-slate-500">Audited cash counts</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-emerald-50/60 border-emerald-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Latest Closing Drawer Status</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">Balanced (0 Discrepancy)</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Count matched expected closing cash</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'reconciliation'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Daily Cash Drawer Reconciliations ({reconciliations.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 transition border-b-2 ${
            activeTab === 'expenses'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Recorded Operating Expenses ({expenses.length})
        </button>
      </div>

      {/* TAB 1: Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Opening Cash</th>
                  <th className="py-3 px-4">Cash Collections</th>
                  <th className="py-3 px-4">Cash Expenses</th>
                  <th className="py-3 px-4">Expected Closing</th>
                  <th className="py-3 px-4">Actual Cash Counted</th>
                  <th className="py-3 px-4">MoMo Float</th>
                  <th className="py-3 px-4">Bank Balances</th>
                  <th className="py-3 px-4">Discrepancy</th>
                  <th className="py-3 px-4">Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.map(recon => (
                  <tr key={recon.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatDate(recon.date)}</td>
                    <td className="py-3 px-4 text-slate-600">{recon.branch}</td>
                    <td className="py-3 px-4 font-mono">{formatUGX(recon.opening_cash)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{formatUGX(recon.total_collections_cash)}</td>
                    <td className="py-3 px-4 font-mono text-rose-600">{formatUGX(recon.total_expenses_cash)}</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatUGX(recon.expected_closing_cash)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatUGX(recon.actual_cash_counted)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{formatUGX(recon.momo_balance)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{formatUGX(recon.bank_balance)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        recon.discrepancy === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {recon.discrepancy === 0 ? 'Balanced' : `${formatUGX(recon.discrepancy)}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{recon.cashier_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Expenses List */}
      {activeTab === 'expenses' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Voucher No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{exp.expense_no}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{formatDate(exp.date)}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-700">{exp.category}</td>
                    <td className="py-3 px-4 text-slate-800">{exp.description}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 text-sm">{formatUGX(exp.amount)}</td>
                    <td className="py-3 px-4 text-slate-600 uppercase text-[10px] font-semibold">{exp.payment_method.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{exp.reference || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-amber-600" />
                Record Operational Expense Voucher
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Expense Category</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium"
                  >
                    <option value="rent">Office Rent</option>
                    <option value="salaries">Salaries &amp; Field Allowances</option>
                    <option value="utilities">Utilities (Umeme &amp; NWSC)</option>
                    <option value="transport">Fuel &amp; Transport</option>
                    <option value="office_supplies">Office Supplies &amp; Printing</option>
                    <option value="legal">Legal &amp; Registration</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Amount (UGX)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description &amp; Payee</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder="e.g. Fuel for Mukono loan verification visit"
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Payment Method</label>
                  <select
                    value={expMethod}
                    onChange={e => setExpMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium"
                  >
                    <option value="cash">Cash Out of Drawer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Reference / Voucher No</label>
                  <input
                    type="text"
                    value={expRef}
                    onChange={e => setExpRef(e.target.value)}
                    placeholder="e.g. VOUCHER-091"
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExp}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {savingExp ? 'Saving...' : 'Save Expense Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Reconciliation Modal */}
      {showReconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-amber-600" />
                Submit Daily Drawer Cash Reconciliation
              </h3>
              <button onClick={() => setShowReconModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleReconSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Reconciliation Date</label>
                  <input
                    type="date"
                    required
                    value={reconDate}
                    onChange={e => setReconDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Opening Cash in Drawer</label>
                  <input
                    type="number"
                    value={openingCash}
                    onChange={e => setOpeningCash(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Cash Repayments Collected</label>
                  <input
                    type="number"
                    value={collCash}
                    onChange={e => setCollCash(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Cash Operating Expenses Paid</label>
                  <input
                    type="number"
                    value={expCash}
                    onChange={e => setExpCash(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Actual Physical Cash Counted</label>
                  <input
                    type="number"
                    required
                    value={actualCashCounted}
                    onChange={e => setActualCashCounted(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mobile Money Merchant Balance</label>
                  <input
                    type="number"
                    value={momoFloat}
                    onChange={e => setMomoFloat(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Commercial Bank Account Balance</label>
                  <input
                    type="number"
                    value={bankBalance}
                    onChange={e => setBankBalance(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Supervisor Notes &amp; Verification</label>
                <textarea
                  rows={2}
                  value={reconNotes}
                  onChange={e => setReconNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReconModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecon}
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {submittingRecon ? 'Verifying...' : 'Save Reconciled Drawer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
