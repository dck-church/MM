import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from '../brand/Logo';
import { formatUGX, formatDateTime } from '../../services/api';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    receipt_no: string;
    borrower_name: string;
    borrower_no: string;
    borrower_phone?: string;
    loan_no: string;
    amount: number;
    amount_in_words?: string;
    payment_method: string;
    transaction_ref?: string;
    payment_date: string;
    installment_covered?: string;
    balance_after_payment: number;
    cashier_name: string;
  } | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData,
}) => {
  if (!isOpen || !receiptData) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#eab308', '#0f2447', '#10b981'],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 print:shadow-none print:rounded-none">
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <CheckCircle className="h-3.5 w-3.5" /> Confirmed Payment
            </span>
            <span className="text-xs text-slate-500 font-mono">{receiptData.receipt_no}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" /> Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 print:p-6" id="printable-receipt">
          {/* Company Branding */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-dashed border-slate-300">
            <Logo size="lg" className="mb-2 justify-center" />
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Plot 14, Jinja Road, Commercial Plaza, Kampala, Uganda
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-slate-700">
              <span>Tel: +256 746163098</span>
              <span>•</span>
              <span>+256 701942603</span>
              <span>•</span>
              <span>+256 703176310</span>
            </div>
            <div className="mt-4 inline-block rounded bg-slate-900 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#eab308]">
              Official Payment Receipt
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-dashed border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Receipt Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{receiptData.receipt_no}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Payment Date &amp; Time</span>
              <span className="font-medium text-slate-800">{formatDateTime(receiptData.payment_date)}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Borrower Name</span>
              <span className="font-semibold text-slate-900">{receiptData.borrower_name}</span>
              <span className="text-slate-500 block text-[11px]">No: {receiptData.borrower_no}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Loan Facility</span>
              <span className="font-mono font-bold text-slate-900">{receiptData.loan_no}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="my-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 border border-amber-200/80">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Amount Received</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatUGX(receiptData.amount)}
              </span>
            </div>
            {receiptData.amount_in_words && (
              <p className="mt-2 text-xs italic text-slate-700 bg-white/70 p-2 rounded border border-amber-100">
                <strong className="not-italic text-amber-900 font-semibold">In Words:</strong> {receiptData.amount_in_words}
              </p>
            )}
          </div>

          {/* Allocation Details */}
          <div className="space-y-2 py-2 text-xs border-b border-dashed border-slate-200">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-slate-800 uppercase">{receiptData.payment_method.replace('_', ' ')}</span>
            </div>
            {receiptData.transaction_ref && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Transaction Reference:</span>
                <span className="font-mono text-slate-800">{receiptData.transaction_ref}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Installment Allocation:</span>
              <span className="font-medium text-slate-800">{receiptData.installment_covered || 'Scheduled installment'}</span>
            </div>
            <div className="flex justify-between py-1 bg-slate-50 px-2 rounded font-medium">
              <span className="text-slate-600 font-semibold">Remaining Loan Balance:</span>
              <span className="font-bold text-slate-900">{formatUGX(receiptData.balance_after_payment)}</span>
            </div>
          </div>

          {/* Cashier & Official Stamp */}
          <div className="mt-6 flex items-end justify-between pt-2">
            <div className="text-xs">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Issued By Cashier</span>
              <span className="font-semibold text-slate-800">{receiptData.cashier_name}</span>
              <span className="text-[10px] text-slate-400 block">Tripple MMM Cash Operations</span>
            </div>

            {/* Official Stamp Box */}
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-emerald-600/60 p-2 text-center text-emerald-800 font-mono text-[9px] uppercase tracking-wider rotate-[-2deg]">
              <div className="flex items-center gap-1 font-bold">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> TRIPPLE MMM
              </div>
              <div className="text-[8px] font-semibold text-emerald-700">OFFICIAL RECEIPT SEALED</div>
              <div className="text-[8px] text-slate-500">{new Date(receiptData.payment_date).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400">
            Thank you for fulfilling your financial commitment with Tripple MMM Investments Company LTD.
          </div>
        </div>
      </div>
    </div>
  );
};
