import React from 'react';
import { X, Printer, Shield, CheckCircle2 } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Loan, Borrower, Collateral } from '../../types';
import { formatUGX, formatDate } from '../../services/api';

interface LoanAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  borrower: Borrower;
  collateral?: Collateral;
}

export const LoanAgreementModal: React.FC<LoanAgreementModalProps> = ({
  isOpen,
  onClose,
  loan,
  borrower,
  collateral,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm print:p-0 print:bg-white overflow-y-auto">
      <div className="relative my-8 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 print:my-0 print:shadow-none print:rounded-none">
        {/* Modal Controls (hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-800">Legal Loan Facility Contract Agreement</h3>
            <span className="font-mono text-xs text-slate-500">[{loan.loan_no}]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600"
            >
              <Printer className="h-4 w-4" /> Print Agreement
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Contract Document */}
        <div className="p-8 sm:p-12 print:p-8 text-slate-800 text-xs leading-relaxed space-y-6" id="printable-agreement">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <Logo size="lg" />
              <p className="mt-2 text-[11px] text-slate-600 font-medium">
                Plot 14, Jinja Road, Commercial Plaza, Kampala, Uganda
              </p>
              <p className="text-[11px] text-slate-600">
                Official Lines: +256 746163098 | +256 701942603 | +256 703176310
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded bg-slate-900 px-3 py-1 font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Facility No: {loan.loan_no}
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                Date: {formatDate(loan.approved_at || loan.created_at)}
              </p>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              COMMERCIAL CREDIT FACILITY &amp; LOAN AGREEMENT
            </h2>
            <p className="text-[11px] text-slate-500">
              Between Tripple MMM Investments Company LTD (The Lender) and {borrower.full_name} (The Borrower)
            </p>
          </div>

          {/* Section 1: Parties */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h4 className="font-bold uppercase text-[11px] tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. CONTRACTUAL PARTIES
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-900">THE LENDER:</p>
                <p>Tripple MMM Investments Company LTD</p>
                <p className="text-slate-600">Kampala Main Branch, Commercial Plaza</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">THE BORROWER:</p>
                <p className="font-bold text-slate-900">{borrower.full_name}</p>
                <p className="text-slate-600">ID ({borrower.id_type}): {borrower.id_number}</p>
                <p className="text-slate-600">Tel: {borrower.phone_primary} | Resid: {borrower.residential_address}</p>
                <p className="text-slate-600">District: {borrower.district}, {borrower.town}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Credit Terms Grid */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase text-[11px] tracking-wider text-slate-900">
              2. FINANCIAL TERMS &amp; LOAN PARTICULARS
            </h4>
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 p-4 bg-white text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Principal Amount</span>
                <span className="font-bold text-sm text-slate-900">{formatUGX(loan.approved_principal)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Interest Rate &amp; Method</span>
                <span className="font-bold text-slate-900">{loan.interest_rate}% ({loan.interest_type.replace('_', ' ')})</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Total Interest</span>
                <span className="font-bold text-slate-900">{formatUGX(loan.total_interest)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Facility Processing Fee</span>
                <span className="font-bold text-slate-900">{formatUGX(loan.processing_fee)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Total Repayable Amount</span>
                <span className="font-bold text-sm text-amber-700">{formatUGX(loan.total_repayable)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Repayment Frequency</span>
                <span className="font-bold text-slate-900 uppercase">{loan.repayment_frequency} ({loan.duration_value} {loan.duration_unit})</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">First Installment Due</span>
                <span className="font-semibold text-slate-800">{formatDate(loan.first_payment_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Final Maturity Date</span>
                <span className="font-semibold text-slate-800">{formatDate(loan.final_payment_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Disbursement Channel</span>
                <span className="font-semibold text-slate-800 uppercase">{loan.disbursement_method || 'Bank / MoMo'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Collateral & Guarantor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
              <h4 className="font-bold uppercase text-[10px] tracking-wider text-slate-900 mb-1">
                3. PLEDGED SECURITY / COLLATERAL
              </h4>
              {collateral ? (
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <p><strong className="text-slate-900">Type:</strong> {collateral.collateral_type}</p>
                  <p><strong className="text-slate-900">Description:</strong> {collateral.description}</p>
                  <p><strong className="text-slate-900">Reg / Serial No:</strong> {collateral.serial_or_reg_no || 'N/A'}</p>
                  <p><strong className="text-slate-900">Estimated Value:</strong> {formatUGX(collateral.estimated_value)}</p>
                  <p><strong className="text-slate-900">Custody Info:</strong> {collateral.ownership_doc_info}</p>
                </div>
              ) : (
                <p className="text-slate-500 italic text-[11px]">Personal Guarantorship and Chattels Lien</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
              <h4 className="font-bold uppercase text-[10px] tracking-wider text-slate-900 mb-1">
                4. GUARANTOR PARTICULARS
              </h4>
              <div className="space-y-1 text-slate-700 text-[11px]">
                <p><strong className="text-slate-900">Guarantor:</strong> {borrower.guarantor_name || 'N/A'}</p>
                <p><strong className="text-slate-900">Relationship:</strong> {borrower.guarantor_relationship || 'Associate'}</p>
                <p><strong className="text-slate-900">Contact Tel:</strong> {borrower.guarantor_phone || 'N/A'}</p>
                <p><strong className="text-slate-900">Physical Address:</strong> {borrower.guarantor_address || 'Kampala'}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Terms and Conditions */}
          <div className="space-y-1 rounded-lg border border-slate-200 p-3 text-[10px] text-slate-600 bg-slate-50/30">
            <h4 className="font-bold uppercase tracking-wider text-slate-800">
              5. KEY CONTRACTUAL CLAUSES &amp; DEFAULT TERMS
            </h4>
            <p>
              <strong>5.1 Repayment Obligation:</strong> The Borrower agrees to punctually pay all installments on or before their agreed contractual due dates without deduction or set-off.
            </p>
            <p>
              <strong>5.2 Default &amp; Late Charges:</strong> In the event of failure to remit any installment within 48 hours of due date, a daily late fee of 0.5% per day on the overdue amount shall accrue until full settlement.
            </p>
            <p>
              <strong>5.3 Collateral Realization:</strong> Should default exceed thirty (30) calendar days, the Lender retains the irrevocable legal right to take custody of, liquidate, or sell the pledged security to recover outstanding balance, legal fees, and recovery charges under Ugandan Chattels Securities Act.
            </p>
            <p>
              <strong>5.4 Governing Law:</strong> This agreement is governed by the laws of the Republic of Uganda and any dispute shall be submitted to the courts of Kampala.
            </p>
          </div>

          {/* Signatures Block */}
          <div className="pt-4 border-t-2 border-slate-900">
            <h4 className="font-bold uppercase text-[11px] tracking-wider text-slate-900 mb-4">
              6. EXECUTION &amp; SIGNATURES
            </h4>
            <div className="grid grid-cols-3 gap-6 text-xs">
              {/* Borrower Signature */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900">FOR THE BORROWER:</p>
                <div className="h-20 rounded border border-slate-300 bg-white p-1 flex items-center justify-center">
                  {loan.borrower_signature_url ? (
                    <img src={loan.borrower_signature_url} alt="Borrower Signature" className="max-h-16 object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Signature on file</span>
                  )}
                </div>
                <p className="font-medium text-slate-800">{borrower.full_name}</p>
                <p className="text-[10px] text-slate-500">Date: {formatDate(loan.created_at)}</p>
              </div>

              {/* Company Officer Signature */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900">FOR TRIPPLE MMM INVESTMENTS:</p>
                <div className="h-20 rounded border border-slate-300 bg-white p-1 flex items-center justify-center">
                  {loan.officer_signature_url ? (
                    <img src={loan.officer_signature_url} alt="Officer Signature" className="max-h-16 object-contain" />
                  ) : (
                    <div className="text-center font-serif italic text-slate-700">
                      Mpiima Miracl<br />
                      <span className="text-[9px] not-italic font-sans text-slate-500">Managing Director</span>
                    </div>
                  )}
                </div>
                <p className="font-medium text-slate-800">Authorized Signatory</p>
                <p className="text-[10px] text-slate-500">Date: {formatDate(loan.approved_at || loan.created_at)}</p>
              </div>

              {/* Witness Block */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900">IN THE PRESENCE OF WITNESS:</p>
                <div className="h-20 rounded border border-slate-300 bg-white p-1 flex items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 italic">Brian Kigozi<br />Credit Officer</span>
                </div>
                <p className="font-medium text-slate-800">{borrower.guarantor_name || 'Legal Witness'}</p>
                <p className="text-[10px] text-slate-500">Verified &amp; Sealed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
