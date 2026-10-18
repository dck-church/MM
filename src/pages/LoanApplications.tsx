import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  CheckCircle,
  XCircle,
  Banknote,
  Search,
  Filter,
  AlertCircle,
  Shield,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';
import { Loan, Borrower } from '../types';
import { useAuth } from '../context/AuthContext';
import { SignaturePad } from '../components/common/SignaturePad';

interface LoanApplicationsProps {
  onNavigate: (page: string, params?: any) => void;
  preselectedBorrowerId?: string;
}

export const LoanApplications: React.FC<LoanApplicationsProps> = ({
  onNavigate,
  preselectedBorrowerId,
}) => {
  const { isDirector, isSuperAdmin, isCashier, user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(Boolean(preselectedBorrowerId));

  // Modal actions
  const [selectedLoanForApproval, setSelectedLoanForApproval] = useState<Loan | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('Approved per company credit policy');
  const [approvedAmount, setApprovedAmount] = useState<string>('');
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // New Application Form State
  const [newBorrowerId, setNewBorrowerId] = useState(preselectedBorrowerId || '');
  const [requestedPrincipal, setRequestedPrincipal] = useState('1000000');
  const [interestRate, setInterestRate] = useState('10');
  const [interestType, setInterestType] = useState<'flat' | 'reducing_balance'>('flat');
  const [durationValue, setDurationValue] = useState('1');
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('months');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [firstPaymentDate, setFirstPaymentDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [borrowerSignature, setBorrowerSignature] = useState('');
  const [collateralType, setCollateralType] = useState('Motor Vehicle Logbook');
  const [collateralDesc, setCollateralDesc] = useState('');
  const [collateralValue, setCollateralValue] = useState('3000000');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const [lRes, bRes] = await Promise.all([
        api.getLoans(statusFilter),
        api.getBorrowers(),
      ]);
      setLoans(lRes.loans || []);
      setBorrowers(bRes.borrowers || []);
      if (!newBorrowerId && bRes.borrowers?.length) {
        setNewBorrowerId(bRes.borrowers[0].id);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBorrowerId) {
      setCreateError('Please select a registered borrower');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const res = await api.createLoan({
        borrower_id: newBorrowerId,
        requested_principal: Number(requestedPrincipal),
        interest_rate: Number(interestRate),
        interest_type: interestType,
        duration_value: Number(durationValue),
        duration_unit: durationUnit,
        repayment_frequency: frequency,
        first_payment_date: firstPaymentDate,
        borrower_signature_url: borrowerSignature,
        collateral_type: collateralType,
        collateral_description: collateralDesc,
        collateral_value: Number(collateralValue),
      });

      if (res.success) {
        setShowCreateModal(false);
        fetchLoans();
      } else {
        setCreateError(res.error || 'Failed to submit loan application');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Error creating application');
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedLoanForApproval) return;
    setApprovalSubmitting(true);
    setApprovalError(null);
    try {
      const amt = approvedAmount ? Number(approvedAmount) : selectedLoanForApproval.requested_principal;
      const res = await api.approveLoan(selectedLoanForApproval.id, amt, approvalNotes);
      if (res.success) {
        setSelectedLoanForApproval(null);
        fetchLoans();
      } else {
        setApprovalError(res.error || 'Approval failed');
      }
    } catch (err: any) {
      setApprovalError(err.message);
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const handleReject = async (loanId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    await api.rejectLoan(loanId, reason);
    fetchLoans();
  };

  const handleDisburse = async (loanId: string) => {
    const ref = prompt('Enter bank transaction reference or MoMo voucher:', `DISB-${Date.now()}`);
    if (!ref) return;
    const res = await api.disburseLoan(loanId, 'bank_transfer', ref);
    if (res.success) {
      alert('Loan funds successfully marked as disbursed! Repayment schedule is now active.');
      fetchLoans();
    } else {
      alert(res.error || 'Disbursement failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-600" />
            Loan Applications &amp; Approval Workflow
          </h1>
          <p className="text-xs text-slate-500">
            Multi-stage workflow: Draft → Submitted → Under Review → Approved → Disbursed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
          >
            <PlusCircle className="h-4 w-4" /> New Loan Application
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
          >
            <option value="">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved (Awaiting Disbursement)</option>
            <option value="active">Active &amp; Disbursed</option>
            <option value="fully_repaid">Fully Repaid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchLoans}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" /> Loading applications...
          </div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No loan applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase text-[10px] text-slate-600">
                  <th className="py-3 px-4">Loan No</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Requested Principal</th>
                  <th className="py-3 px-4">Approved Principal</th>
                  <th className="py-3 px-4">Interest Rate &amp; Term</th>
                  <th className="py-3 px-4">Total Repayable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{loan.loan_no}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{loan.borrower_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{loan.borrower_phone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{formatUGX(loan.requested_principal)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {loan.approved_principal ? formatUGX(loan.approved_principal) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {loan.interest_rate}% ({loan.interest_type}) • {loan.duration_value} {loan.duration_unit} ({loan.repayment_frequency})
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{formatUGX(loan.total_repayable)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        loan.status === 'approved' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        loan.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        loan.status === 'fully_repaid' ? 'bg-blue-100 text-blue-800' :
                        loan.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {loan.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('loan_details', { id: loan.id })}
                          className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          View Details
                        </button>

                        {/* Approval Action for Director */}
                        {(loan.status === 'submitted' || loan.status === 'under_review') && (isDirector || isSuperAdmin) && (
                          <button
                            onClick={() => {
                              setSelectedLoanForApproval(loan);
                              setApprovedAmount(String(loan.requested_principal));
                              setApprovalError(null);
                            }}
                            className="rounded bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-600"
                          >
                            Approve / Review
                          </button>
                        )}

                        {/* Disbursement Action */}
                        {loan.status === 'approved' && (isSuperAdmin || isDirector || isCashier) && (
                          <button
                            onClick={() => handleDisburse(loan.id)}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                          >
                            Disburse Funds
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE LOAN APPLICATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-amber-600" />
                Prepare New Loan Application
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Select Registered Borrower</label>
                <select
                  required
                  value={newBorrowerId}
                  onChange={e => setNewBorrowerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-medium"
                >
                  <option value="">-- Choose Borrower --</option>
                  {borrowers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.full_name} ({b.borrower_no}) - Tel: {b.phone_primary}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Requested Principal (UGX)</label>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    required
                    value={requestedPrincipal}
                    onChange={e => setRequestedPrincipal(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    required
                    value={interestRate}
                    onChange={e => setInterestRate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Interest Calculation Method</label>
                  <select
                    value={interestType}
                    onChange={e => setInterestType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium"
                  >
                    <option value="flat">Flat Rate Interest</option>
                    <option value="reducing_balance">Reducing Balance Interest</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Repayment Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium"
                  >
                    <option value="daily">Daily Repayments</option>
                    <option value="weekly">Weekly Repayments</option>
                    <option value="monthly">Monthly Repayments</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Duration Value &amp; Unit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={durationValue}
                      onChange={e => setDurationValue(e.target.value)}
                      className="w-20 rounded-xl border border-slate-300 p-2 font-mono"
                    />
                    <select
                      value={durationUnit}
                      onChange={e => setDurationUnit(e.target.value as any)}
                      className="flex-1 rounded-xl border border-slate-300 p-2 font-medium"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">First Repayment Date</label>
                  <input
                    type="date"
                    required
                    value={firstPaymentDate}
                    onChange={e => setFirstPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>

              {/* Collateral details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <span className="font-bold text-slate-800 block">Pledged Collateral Security</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={collateralType}
                    onChange={e => setCollateralType(e.target.value)}
                    placeholder="Type (e.g. Logbook, Title, Equipment)"
                    className="rounded-lg border border-slate-300 p-2 bg-white"
                  />
                  <input
                    type="number"
                    value={collateralValue}
                    onChange={e => setCollateralValue(e.target.value)}
                    placeholder="Est Market Value UGX"
                    className="rounded-lg border border-slate-300 p-2 bg-white font-mono"
                  />
                  <input
                    type="text"
                    value={collateralDesc}
                    onChange={e => setCollateralDesc(e.target.value)}
                    placeholder="Full Description & Reg / Serial Number"
                    className="col-span-2 rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>
              </div>

              {/* Digital Signature */}
              <SignaturePad
                label="Borrower Digital Signature"
                signatoryRole="Borrower"
                value={borrowerSignature}
                onChange={setBorrowerSignature}
                staffName={user?.name || 'Loan Officer'}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {creating ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL MODAL (With separation of duties enforcement) */}
      {selectedLoanForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                Director Loan Review &amp; Approval
              </h3>
              <button
                onClick={() => setSelectedLoanForApproval(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {approvalError && (
              <div className="rounded-lg bg-rose-50 p-3 text-rose-800 border border-rose-200">
                {approvalError}
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-1">
              <p><strong>Borrower:</strong> {selectedLoanForApproval.borrower_name}</p>
              <p><strong>Requested Amount:</strong> {formatUGX(selectedLoanForApproval.requested_principal)}</p>
              <p><strong>Terms:</strong> {selectedLoanForApproval.interest_rate}% ({selectedLoanForApproval.interest_type}) for {selectedLoanForApproval.duration_value} {selectedLoanForApproval.duration_unit}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Approved Principal Amount (UGX)</label>
              <input
                type="number"
                value={approvedAmount}
                onChange={e => setApprovedAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-500">You may approve full or reduced facility amount</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Approval Comments &amp; Terms</label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleReject(selectedLoanForApproval.id);
                  setSelectedLoanForApproval(null);
                }}
                className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700 font-semibold hover:bg-rose-100"
              >
                Reject Application
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanForApproval(null)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={approvalSubmitting}
                  onClick={handleApprove}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {approvalSubmitting ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
