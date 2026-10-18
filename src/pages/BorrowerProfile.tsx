import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Home,
  Briefcase,
  Shield,
  FileText,
  CreditCard,
  Bell,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { api, formatUGX, formatDate, formatDateTime } from '../services/api';
import { Borrower, Loan, Collateral, Payment, Reminder } from '../types';
import { useAuth } from '../context/AuthContext';

interface BorrowerProfileProps {
  borrowerId: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenPaymentModal?: (loan: Loan) => void;
}

export const BorrowerProfile: React.FC<BorrowerProfileProps> = ({
  borrowerId,
  onNavigate,
  onOpenPaymentModal,
}) => {
  const { canViewBorrowerPrivateDocs, isShareholder } = useAuth();
  const [data, setData] = useState<{
    borrower: Borrower;
    loans: Loan[];
    collaterals: Collateral[];
    payments: Payment[];
    reminders: Reminder[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'payments' | 'collateral' | 'reminders'>('overview');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getBorrower(borrowerId);
      setData(res);
    } catch (err) {
      console.error('Failed to load borrower profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [borrowerId]);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mr-2" /> Loading borrower profile records...
      </div>
    );
  }

  const { borrower, loans, collaterals, payments, reminders } = data;
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.balance_remaining, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('borrowers')}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
            title="Back to Borrowers"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{borrower.full_name}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                {borrower.borrower_no}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                borrower.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {borrower.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registered on {formatDate(borrower.created_at)} • {borrower.district}, {borrower.town}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeLoans.length > 0 && onOpenPaymentModal && (
            <button
              onClick={() => onOpenPaymentModal(activeLoans[0])}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            >
              <CreditCard className="h-4 w-4" /> Record Repayment
            </button>
          )}
          <button
            onClick={() => onNavigate('loan_applications', { borrower_id: borrower.id })}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            <FileText className="h-4 w-4" /> Create Loan
          </button>
        </div>
      </div>

      {/* Profile Overview Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Outstanding Balance</span>
          <span className="text-xl font-black text-amber-600 block mt-1">{formatUGX(totalOutstanding)}</span>
          <span className="text-[11px] text-slate-500">{activeLoans.length} active loan facility</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Facilities Count</span>
          <span className="text-xl font-black text-slate-900 block mt-1">{loans.length} loans</span>
          <span className="text-[11px] text-slate-500">{loans.filter(l => l.status === 'fully_repaid').length} fully repaid</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Repayments Made</span>
          <span className="text-xl font-black text-emerald-600 block mt-1">{formatUGX(payments.reduce((s, p) => s + p.amount, 0))}</span>
          <span className="text-[11px] text-slate-500">{payments.length} verified receipts</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Collateral Pledges</span>
          <span className="text-xl font-black text-slate-900 block mt-1">{collaterals.length} items</span>
          <span className="text-[11px] text-slate-500">Valued at {formatUGX(collaterals.reduce((s, c) => s + c.estimated_value, 0))}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        {[
          { id: 'overview', label: 'Personal & KYC Details' },
          { id: 'loans', label: `Loan Facilities (${loans.length})` },
          { id: 'payments', label: `Payments & Receipts (${payments.length})` },
          { id: 'collateral', label: `Collateral Security (${collaterals.length})` },
          { id: 'reminders', label: `Payment Reminders (${reminders.length})` },
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

      {/* TAB 1: Personal & KYC Details */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Photos & Identification Documents (Protected by privacy rules) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-amber-600" /> Borrower Photograph &amp; ID Documents
            </h3>

            {/* Privacy Check */}
            {!canViewBorrowerPrivateDocs ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center border border-slate-200 space-y-2">
                <Lock className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">Protected Confidential Documents</h4>
                <p className="text-[11px] text-slate-500">
                  Per Section 17 &amp; 23, raw borrower photographs and National ID cards are restricted to authorized operational staff.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Photo */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">Borrower Photograph</span>
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {borrower.photo_url ? (
                      <img src={borrower.photo_url} alt={borrower.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400 text-xs">
                        <User className="h-12 w-12 mx-auto text-slate-300" />
                        No photo captured
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Front */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">National ID Card (Front)</span>
                  <div className="aspect-[1.586/1] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {borrower.id_front_url ? (
                      <img src={borrower.id_front_url} alt="ID Front" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">ID Front on file</span>
                    )}
                  </div>
                </div>

                {/* ID Back */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">National ID Card (Back)</span>
                  <div className="aspect-[1.586/1] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {borrower.id_back_url ? (
                      <img src={borrower.id_back_url} alt="ID Back" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">ID Back on file</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity & Residence */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                Demographics &amp; Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Primary Phone</span>
                  <span className="font-mono font-bold text-slate-800">{borrower.phone_primary}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">WhatsApp</span>
                  <span className="font-mono text-slate-800">{borrower.whatsapp || borrower.phone_primary}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">National ID / NIN</span>
                  <span className="font-mono font-bold text-slate-900">{borrower.id_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Date of Birth / Gender</span>
                  <span className="text-slate-800">{borrower.dob || '-'} ({borrower.gender})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 uppercase text-[10px] block">Residential Address</span>
                  <span className="text-slate-800">{borrower.residential_address}, {borrower.village}, {borrower.town}, {borrower.district}</span>
                </div>
              </div>
            </div>

            {/* Employment & Guarantor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                  Economic Activity
                </h3>
                <div className="text-xs space-y-2 text-slate-700">
                  <p><strong className="text-slate-900">Trade:</strong> {borrower.occupation || 'Business'}</p>
                  <p><strong className="text-slate-900">Business Name:</strong> {borrower.employer_business || 'Self-Employed'}</p>
                  <p><strong className="text-slate-900">Work Address:</strong> {borrower.work_address || 'Kampala'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                  Guarantor &amp; Emergency
                </h3>
                <div className="text-xs space-y-2 text-slate-700">
                  <p><strong className="text-slate-900">Guarantor:</strong> {borrower.guarantor_name || 'N/A'}</p>
                  <p><strong className="text-slate-900">Telephone:</strong> {borrower.guarantor_phone || 'N/A'}</p>
                  <p><strong className="text-slate-900">Relationship:</strong> {borrower.guarantor_relationship || '-'}</p>
                  <p><strong className="text-slate-900">Address:</strong> {borrower.guarantor_address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {borrower.notes && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-900">
                <strong className="block font-bold mb-1">Credit Officer Notes:</strong>
                <p>{borrower.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Loans List */}
      {activeTab === 'loans' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Loan Applications &amp; Disbursed Contracts
            </h3>
            <button
              onClick={() => onNavigate('loan_applications', { borrower_id: borrower.id })}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
            >
              + Create New Application
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Loan No</th>
                  <th className="py-2.5 px-4">Principal</th>
                  <th className="py-2.5 px-4">Rate &amp; Term</th>
                  <th className="py-2.5 px-4">Total Repayable</th>
                  <th className="py-2.5 px-4">Total Paid</th>
                  <th className="py-2.5 px-4">Remaining Balance</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{loan.loan_no}</td>
                    <td className="py-3 px-4 font-mono">{formatUGX(loan.approved_principal)}</td>
                    <td className="py-3 px-4 text-slate-600">{loan.interest_rate}% ({loan.duration_value} {loan.duration_unit})</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatUGX(loan.total_repayable)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{formatUGX(loan.total_paid)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600">{formatUGX(loan.balance_remaining)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        loan.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        loan.status === 'fully_repaid' ? 'bg-blue-100 text-blue-800' :
                        loan.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {loan.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('loan_details', { id: loan.id })}
                        className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Details &amp; Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Payments */}
      {activeTab === 'payments' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Verified Repayments &amp; Cashier Receipts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Receipt No</th>
                  <th className="py-2.5 px-4">Payment Date</th>
                  <th className="py-2.5 px-4">Amount Paid</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Allocation Covered</th>
                  <th className="py-2.5 px-4">Balance After</th>
                  <th className="py-2.5 px-4">Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.receipt_no}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{formatDateTime(p.payment_date)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">{formatUGX(p.amount)}</td>
                    <td className="py-3 px-4 text-slate-700 uppercase font-medium">{p.payment_method.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-slate-600">{p.installment_covered}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">{formatUGX(p.balance_after_payment)}</td>
                    <td className="py-3 px-4 text-slate-600">{p.cashier_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Collateral */}
      {activeTab === 'collateral' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collaterals.map(col => (
            <div key={col.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 text-xs">{col.collateral_type}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                  {col.status}
                </span>
              </div>
              <p className="text-xs text-slate-700">{col.description}</p>
              <div className="text-xs space-y-1 text-slate-600">
                <p><strong>Reg / Serial No:</strong> {col.serial_or_reg_no || 'N/A'}</p>
                <p><strong>Estimated Market Value:</strong> <span className="font-bold text-slate-900 font-mono">{formatUGX(col.estimated_value)}</span></p>
                <p><strong>Documentation:</strong> {col.ownership_doc_info}</p>
                <p><strong>Inspected By:</strong> {col.inspected_by} on {formatDate(col.inspection_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Reminders */}
      {activeTab === 'reminders' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Payment Reminders &amp; Notification History
            </h3>
          </div>
          <div className="divide-y divide-slate-100 p-4 space-y-3">
            {reminders.map(rem => (
              <div key={rem.id} className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Channel: <strong className="uppercase text-slate-800">{rem.channel}</strong></span>
                  <span className="font-mono">{formatDate(rem.scheduled_date)}</span>
                </div>
                <p className="text-slate-800 italic bg-white p-2.5 rounded border border-slate-200">"{rem.message}"</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Amount Due: <strong>{formatUGX(rem.amount_due)}</strong></span>
                  <span className="text-emerald-700 font-semibold">{rem.provider_response || 'Delivered'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
