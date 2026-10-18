import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  User,
  Shield,
  CheckCircle2,
  Send,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';

export const OverdueLoans: React.FC = () => {
  const [overdueList, setOverdueList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBucket, setActiveBucket] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Follow-up modal state
  const [followUpItem, setFollowUpItem] = useState<any | null>(null);
  const [followUpAction, setFollowUpAction] = useState('Phone Call');
  const [explanation, setExplanation] = useState('');
  const [promiseDate, setPromiseDate] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await api.getOverdueLoans();
      setOverdueList(res.overdueList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleSaveFollowUp = () => {
    if (!followUpItem) return;
    setSavingNote(true);
    setTimeout(() => {
      alert(`Follow-up record saved for ${followUpItem.borrower_name}: ${followUpAction}. Promise to pay: ${promiseDate || 'None'}`);
      setSavingNote(false);
      setFollowUpItem(null);
      setExplanation('');
    }, 400);
  };

  const filtered = overdueList.filter(item => {
    const matchesBucket = activeBucket === 'all' || item.bucket === activeBucket;
    const matchesSearch =
      item.borrower_name.toLowerCase().includes(search.toLowerCase()) ||
      item.loan_no.toLowerCase().includes(search.toLowerCase()) ||
      item.borrower_phone.includes(search);
    return matchesBucket && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-rose-600" />
          Overdue Loan Portfolio &amp; Arrears Recovery
        </h1>
        <p className="text-xs text-slate-500">
          Supervised delinquency management, aging buckets, and debt follow-up logs
        </p>
      </div>

      {/* Aging Bucket Tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { id: 'all', label: 'All Delinquent Loans', count: overdueList.length, color: 'border-slate-300' },
          { id: '1-7_days', label: '1 - 7 Days Overdue', count: overdueList.filter(i => i.bucket === '1-7_days').length, color: 'border-amber-300 bg-amber-50/50' },
          { id: '8-30_days', label: '8 - 30 Days Overdue', count: overdueList.filter(i => i.bucket === '8-30_days').length, color: 'border-orange-300 bg-orange-50/50' },
          { id: '30+_days', label: '30+ Days (High Risk)', count: overdueList.filter(i => i.bucket === '30+_days').length, color: 'border-rose-300 bg-rose-50/50' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveBucket(tab.id)}
            className={`rounded-xl border p-3.5 text-left transition ${
              activeBucket === tab.id ? 'ring-2 ring-slate-900 shadow-sm bg-white' : 'bg-slate-50 hover:bg-white'
            } ${tab.color}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {tab.label}
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {tab.count} accounts
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search delinquent borrower..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchOverdue}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" /> Loading overdue portfolio...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No overdue accounts found in this category. Excellent portfolio performance!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Borrower</th>
                  <th className="py-2.5 px-3">Loan Facility</th>
                  <th className="py-2.5 px-3">Overdue Amount</th>
                  <th className="py-2.5 px-3">Days Overdue</th>
                  <th className="py-2.5 px-3">Missed Installments</th>
                  <th className="py-2.5 px-3">Total Remaining</th>
                  <th className="py-2.5 px-3">Responsible Officer</th>
                  <th className="py-2.5 px-3 text-right">Follow-up Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => {
                  const whatsappLink = `https://wa.me/${item.borrower_whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Dear ${item.borrower_name}, This is a friendly reminder from Tripple MMM Investments Company LTD regarding your overdue installment of ${formatUGX(item.overdue_amount)} on loan ${item.loan_no}. Please contact us on +256 746163098.`
                  )}`;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{item.borrower_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.borrower_phone}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.loan_no}</td>
                      <td className="py-3 px-3 font-mono font-black text-rose-600 text-sm">{formatUGX(item.overdue_amount)}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                          {item.days_overdue} Days Late
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{item.missed_installments_count} missed</td>
                      <td className="py-3 px-3 font-mono text-slate-800 font-bold">{formatUGX(item.total_balance_remaining)}</td>
                      <td className="py-3 px-3 text-slate-600">{item.loan_officer}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                            title="Direct WhatsApp Reminder"
                          >
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                          </a>
                          <button
                            onClick={() => setFollowUpItem(item)}
                            className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
                          >
                            Log Follow-up
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Follow-up Logging Modal */}
      {followUpItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Log Recovery Action for {followUpItem.borrower_name}
              </h3>
              <button onClick={() => setFollowUpItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Contact Method</label>
                <select
                  value={followUpAction}
                  onChange={e => setFollowUpAction(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp Direct Notice">WhatsApp Direct Notice</option>
                  <option value="Physical Field Visit">Physical Field Visit (Residence / Shop)</option>
                  <option value="Guarantor Escalation">Guarantor Escalation</option>
                  <option value="Formal Default Letter">Formal Legal Default Letter</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Borrower Explanation &amp; Remarks</label>
                <textarea
                  rows={3}
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="Record reason given (e.g. stock delayed at border, promised Friday)..."
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Promised Repayment Date</label>
                <input
                  type="date"
                  value={promiseDate}
                  onChange={e => setPromiseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setFollowUpItem(null)}
                className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFollowUp}
                disabled={savingNote}
                className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {savingNote ? 'Saving...' : 'Save Audit Trail Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
