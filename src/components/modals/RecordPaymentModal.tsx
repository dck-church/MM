import React, { useState } from 'react';
import { X, CreditCard, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, formatUGX } from '../../services/api';
import { Loan } from '../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onPaymentSuccess: (receipt: any) => void;
  defaultAmount?: number;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  onPaymentSuccess,
  defaultAmount,
}) => {
  if (!isOpen || !loan) return null;

  const [amount, setAmount] = useState<string>(
    defaultAmount ? String(defaultAmount) : String(Math.min(loan.balance_remaining, 100000))
  );
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer'>('cash');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    if (paymentMethod !== 'cash' && !transactionRef.trim()) {
      setErrorMsg(`Transaction reference is required for ${paymentMethod === 'mobile_money' ? 'Mobile Money (e.g. MTN/Airtel Tx ID)' : 'Bank Transfer'}`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.recordPayment({
        loan_id: loan.id,
        amount: payAmt,
        payment_method: paymentMethod,
        transaction_ref: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.receipt) {
        onClose();
        onPaymentSuccess(res.receipt);
      } else {
        setErrorMsg(res.error || 'Failed to record payment');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Record Borrower Collection</h3>
              <p className="text-[11px] text-slate-500 font-mono">Facility: {loan.loan_no}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Outstanding Balance Banner */}
          <div className="rounded-xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Borrower: {loan.borrower_name}</span>
              <span>Total Repayable: {formatUGX(loan.total_repayable)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-medium">Outstanding Balance</span>
                <p className="text-2xl font-black text-white">{formatUGX(loan.balance_remaining)}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Total Paid So Far</span>
                <span className="text-sm font-semibold text-emerald-400">{formatUGX(loan.total_paid)}</span>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Amount Received (UGX) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">
                UGX
              </span>
              <input
                type="number"
                min="100"
                step="100"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-14 pr-4 text-base font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setAmount(String(loan.balance_remaining))}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 underline"
              >
                Pay Full Balance ({formatUGX(loan.balance_remaining)})
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash at Counter', desc: 'Physical drawer' },
                { id: 'mobile_money', label: 'Mobile Money', desc: 'MTN / Airtel' },
                { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Centenary / Stanbic' },
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`rounded-xl border p-2.5 text-left transition ${
                    paymentMethod === method.id
                      ? 'border-amber-500 bg-amber-500/10 text-slate-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{method.label}</div>
                  <div className="text-[10px] text-slate-500">{method.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Reference (required for MoMo and Bank) */}
          {paymentMethod !== 'cash' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Transaction Reference / Mobile Money ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder={paymentMethod === 'mobile_money' ? 'e.g. MTN-TXN-8819230' : 'e.g. CENTENARY-DEP-49021'}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Staff Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Paid in full for week 3"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
            >
              {submitting ? 'Recording & Issuing Receipt...' : 'Confirm & Issue Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
