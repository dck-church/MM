import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  FileSpreadsheet,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';
import { api, formatUGX, formatDate, formatDateTime } from '../services/api';
import { Loan, Borrower, RepaymentScheduleItem, Payment, Collateral } from '../types';

interface LoanDetailsProps {
  loanId: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenPaymentModal: (loan: Loan) => void;
  onOpenAgreementModal: (loan: Loan, borrower: Borrower, collateral?: Collateral) => void;
}

export const LoanDetails: React.FC<LoanDetailsProps> = ({
  loanId,
  onNavigate,
  onOpenPaymentModal,
  onOpenAgreementModal,
}) => {
  const [data, setData] = useState<{
    loan: Loan;
    borrower: Borrower;
    schedule: RepaymentScheduleItem[];
    payments: Payment[];
    collaterals: Collateral[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await api.getLoan(loanId);
      setData(res);
    } catch (err) {
      console.error('Failed to load loan details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [loanId]);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mr-2" /> Loading loan schedule &amp; facility details...
      </div>
    );
  }

  const { loan, borrower, schedule, payments, collaterals } = data;
  const primaryCollateral = collaterals[0];

  const paidCount = schedule.filter(s => s.status === 'paid').length;
  const remainingCount = schedule.length - paidCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('active_loans')}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
            title="Back to Active Loans"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Loan Facility {loan.loan_no}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                loan.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                loan.status === 'fully_repaid' ? 'bg-blue-100 text-blue-800' :
                'bg-slate-100 text-slate-700'
              }`}>
                {loan.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Borrower: <button onClick={() => onNavigate('borrower_profile', { id: borrower.id })} className="font-bold text-slate-800 hover:text-amber-600 underline">{borrower.full_name}</button> ({borrower.borrower_no})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loan.status === 'active' && (
            <button
              onClick={() => onOpenPaymentModal(loan)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              <CreditCard className="h-4 w-4" /> Record Repayment
            </button>
          )}
          <button
            onClick={() => onOpenAgreementModal(loan, borrower, primaryCollateral)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-[#eab308] hover:bg-slate-800 shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" /> Print Legal Agreement
          </button>
        </div>
      </div>

      {/* Financial Particulars Cards (Section 10) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Original Principal</span>
          <span className="text-sm font-black text-slate-900 mt-1 block">{formatUGX(loan.approved_principal)}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Interest Charged</span>
          <span className="text-sm font-black text-amber-700 mt-1 block">{formatUGX(loan.total_interest)}</span>
          <span className="text-[10px] text-slate-500">{loan.interest_rate}% ({loan.interest_type})</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Processing Fees</span>
          <span className="text-sm font-black text-slate-900 mt-1 block">{formatUGX(loan.processing_fee)}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Contractual</span>
          <span className="text-sm font-black text-slate-900 mt-1 block">{formatUGX(loan.total_repayable)}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block">Total Amount Paid</span>
          <span className="text-sm font-black text-emerald-600 mt-1 block">{formatUGX(loan.total_paid)}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-amber-500/10 p-3 border-amber-300">
          <span className="text-[10px] font-bold uppercase text-amber-900 block">Remaining Balance</span>
          <span className="text-sm font-black text-amber-700 mt-1 block">{formatUGX(loan.balance_remaining)}</span>
          <span className="text-[10px] text-amber-800 font-semibold">{remainingCount} installments left</span>
        </div>
      </div>

      {/* Repayment Schedule Table (Section 11) */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Contractual Repayment Schedule ({loan.repayment_frequency} Installments)
            </h3>
            <p className="text-[11px] text-slate-500">
              Calculated exactly per agreement. Real-time installment payment statuses.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {paidCount} of {schedule.length} Paid
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Expected Amount</th>
                <th className="py-2.5 px-3">Principal Portion</th>
                <th className="py-2.5 px-3">Interest Portion</th>
                <th className="py-2.5 px-3">Amount Paid</th>
                <th className="py-2.5 px-3">Remaining</th>
                <th className="py-2.5 px-3">Receipt / Channel</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map(inst => (
                <tr key={inst.id} className={`hover:bg-slate-50 ${inst.status === 'due_today' ? 'bg-amber-50/60' : ''}`}>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                    {inst.installment_no}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                    {formatDate(inst.due_date)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {formatUGX(inst.expected_amount)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {formatUGX(inst.principal_portion)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {formatUGX(inst.interest_portion)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600">
                    {formatUGX(inst.amount_paid)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                    {formatUGX(inst.remaining_amount)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {inst.receipt_no ? (
                      <span className="font-semibold text-slate-800">{inst.receipt_no}</span>
                    ) : '-'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      inst.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      inst.status === 'due_today' ? 'bg-amber-500 text-white font-extrabold animate-pulse' :
                      inst.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                      inst.status === 'overdue' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {inst.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recorded Cashier Payment Receipts for this Facility ({payments.length})
          </h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No payments recorded yet for this facility.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Payment Date</th>
                  <th className="py-2.5 px-3">Amount Received</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Transaction Ref</th>
                  <th className="py-2.5 px-3">Balance After</th>
                  <th className="py-2.5 px-3">Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.receipt_no}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{formatDateTime(p.payment_date)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{formatUGX(p.amount)}</td>
                    <td className="py-2.5 px-3 text-slate-700 uppercase font-medium">{p.payment_method.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{p.transaction_ref || '-'}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{formatUGX(p.balance_after_payment)}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.cashier_name}</td>
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
