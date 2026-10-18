import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  Phone,
  Shield,
} from 'lucide-react';
import { api, formatUGX, formatDate, formatDateTime } from '../services/api';
import { Reminder } from '../types';

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.getReminders();
      setReminders(res.reminders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.autoGenerateReminders();
      alert(`Auto-generated ${res.count} scheduled reminders for loans due in 7d, 3d, 1d, due today, or overdue.`);
      fetchReminders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendReminder = async (id: string) => {
    setSendingId(id);
    try {
      await api.sendReminder(id);
      fetchReminders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="h-6 w-6 text-amber-600" />
            Automated Payment Reminders Engine
          </h1>
          <p className="text-xs text-slate-500">
            Intelligent repayment notices: 7-day, 3-day, 1-day, Due Date, and Overdue triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Scanning Schedules...' : 'Scan & Auto-Schedule Reminders'}
          </button>
          <button
            onClick={fetchReminders}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Refresh Reminders"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Reminders Queued</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{reminders.length}</span>
          <span className="text-[11px] text-slate-500">Synchronized with active loan terms</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-emerald-50/60 border-emerald-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Delivered Notices</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {reminders.filter(r => r.status === 'sent').length}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Confirmed delivery via WhatsApp &amp; SMS</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-amber-50/60 border-amber-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Pending Broadcast</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {reminders.filter(r => r.status === 'scheduled').length}
          </span>
          <span className="text-[11px] text-amber-800 font-medium">Scheduled for automated delivery</span>
        </div>
      </div>

      {/* Official Reminder Template Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <Shield className="h-4 w-4 text-amber-600" /> Official Tripple MMM Standard Notice Format (Section 14)
        </div>
        <p className="italic text-slate-700 font-mono text-[11px] bg-white p-3 rounded-lg border border-amber-200/80">
          "Dear [Borrower Name], This is a payment reminder from Tripple MMM Investments Company LTD. Your loan installment of UGX [Amount Due] is due on [Due Date]. Your outstanding loan balance is UGX [Outstanding Balance]. Please make your payment according to your loan agreement. For assistance, contact us on +256 746163098, +256 701942603, or +256 703176310. Thank you."
        </p>
      </div>

      {/* Reminders List Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Automated Reminder Queue &amp; Dispatch History
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" /> Loading reminders queue...
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No reminders in queue. Click "Scan &amp; Auto-Schedule Reminders" to populate based on due dates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Borrower &amp; Phone</th>
                  <th className="py-2.5 px-3">Loan No</th>
                  <th className="py-2.5 px-3">Installment Due</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Delivery Response</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reminders.map(rem => {
                  const whatsappLink = `https://wa.me/${rem.borrower_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(rem.message)}`;

                  return (
                    <tr key={rem.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{rem.borrower_name}</span>
                        <span className="font-mono text-slate-500 text-[10px]">{rem.borrower_phone}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{rem.loan_no}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">
                        {formatUGX(rem.amount_due)}
                        <span className="block text-[10px] text-slate-400 font-normal">Due: {formatDate(rem.due_date)}</span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-700">
                        <span className={`inline-block px-2 py-0.5 rounded ${
                          rem.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rem.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          rem.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rem.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {rem.provider_response || 'Queued for dispatch'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                            title="Direct One-Click WhatsApp Send"
                          >
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                          </a>
                          {rem.status === 'scheduled' && (
                            <button
                              onClick={() => handleSendReminder(rem.id)}
                              disabled={sendingId === rem.id}
                              className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                              <Send className="h-3 w-3" /> {sendingId === rem.id ? 'Sending...' : 'Mark Sent'}
                            </button>
                          )}
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
    </div>
  );
};
