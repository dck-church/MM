import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { LoanAgreementModal } from './components/modals/LoanAgreementModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Borrowers } from './pages/Borrowers';
import { BorrowerProfile } from './pages/BorrowerProfile';
import { RegisterBorrower } from './pages/RegisterBorrower';
import { LoanApplications } from './pages/LoanApplications';
import { ActiveLoans } from './pages/ActiveLoans';
import { LoanDetails } from './pages/LoanDetails';
import { LoanCalculator } from './pages/LoanCalculator';
import { DailyCollections } from './pages/DailyCollections';
import { OverdueLoans } from './pages/OverdueLoans';
import { Reminders } from './pages/Reminders';
import { CollateralPage } from './pages/Collateral';
import { Employees } from './pages/Employees';
import { ShareholdersPortal } from './pages/ShareholdersPortal';
import { ExpensesCash } from './pages/ExpensesCash';
import { FinancialReports } from './pages/FinancialReports';
import { AuditLogsPage } from './pages/AuditLogs';
import { UserManagement } from './pages/UserManagement';
import { SettingsPage } from './pages/Settings';

import { Loan, Borrower, Collateral } from './types';

function MainApp() {
  const { user, isShareholder } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(
    isShareholder ? 'shareholders_portal' : 'dashboard'
  );
  const [pageParams, setPageParams] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global modals
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [activeAgreementData, setActiveAgreementData] = useState<{
    loan: Loan;
    borrower: Borrower;
    collateral?: Collateral;
  } | null>(null);

  const [paymentLoan, setPaymentLoan] = useState<Loan | null>(null);
  const [paymentDefaultAmt, setPaymentDefaultAmt] = useState<number | undefined>(undefined);

  const navigateTo = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPaymentModal = (loan: Loan, defaultAmt?: number) => {
    setPaymentLoan(loan);
    setPaymentDefaultAmt(defaultAmt);
  };

  const handleOpenAgreementModal = (loan: Loan, borrower?: Borrower, collateral?: Collateral) => {
    const dummyBorrower: Borrower = borrower || {
      id: loan.borrower_id,
      borrower_no: loan.borrower_no || 'MMM-BW-00101',
      full_name: loan.borrower_name || 'Ronald Kato',
      dob: '1988-06-14',
      gender: 'Male',
      phone_primary: loan.borrower_phone || '+256 772112233',
      residential_address: 'Kisaasi, Bahai Road, Zone 4',
      district: 'Kampala',
      town: 'Kawempe Division',
      village: 'Kisaasi Central',
      occupation: 'Hardware Wholesale Merchant',
      employer_business: 'Kato & Brothers Hardware Ltd',
      work_address: 'Container Village, Nakivubo, Shop 18',
      emergency_name: 'Annet Nabakooza',
      emergency_phone: '+256 774889900',
      emergency_relationship: 'Spouse',
      guarantor_name: 'David Ssenyonjo',
      guarantor_phone: '+256 755123456',
      guarantor_relationship: 'Business Associate',
      guarantor_address: 'Ntinda Shopping Centre, Level 2',
      photo_url: '',
      id_front_url: '',
      id_back_url: '',
      id_type: 'National ID',
      id_number: 'CM88045102ABCD',
      status: 'active',
      created_by: 'usr_loanofficer',
      created_at: '2026-01-10T10:00:00Z',
    };

    setActiveAgreementData({
      loan,
      borrower: dummyBorrower,
      collateral,
    });
  };

  const handlePaymentSuccess = (receipt: any) => {
    setActiveReceipt(receipt);
    setShowReceiptModal(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={navigateTo}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentPage === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
            {currentPage === 'borrowers' && <Borrowers onNavigate={navigateTo} />}
            {currentPage === 'borrower_profile' && (
              <BorrowerProfile
                borrowerId={pageParams.id || 'bw_01'}
                onNavigate={navigateTo}
                onOpenPaymentModal={handleOpenPaymentModal}
              />
            )}
            {currentPage === 'register_borrower' && (
              <RegisterBorrower onNavigate={navigateTo} />
            )}
            {currentPage === 'loan_applications' && (
              <LoanApplications
                onNavigate={navigateTo}
                preselectedBorrowerId={pageParams.borrower_id}
              />
            )}
            {currentPage === 'loan_approvals' && (
              <LoanApplications onNavigate={navigateTo} />
            )}
            {currentPage === 'loan_disbursements' && (
              <LoanApplications onNavigate={navigateTo} />
            )}
            {currentPage === 'active_loans' && (
              <ActiveLoans
                onNavigate={navigateTo}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenAgreementModal={handleOpenAgreementModal}
              />
            )}
            {currentPage === 'repayments' && (
              <ActiveLoans
                onNavigate={navigateTo}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenAgreementModal={handleOpenAgreementModal}
              />
            )}
            {currentPage === 'agreements' && (
              <ActiveLoans
                onNavigate={navigateTo}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenAgreementModal={handleOpenAgreementModal}
              />
            )}
            {currentPage === 'loan_details' && (
              <LoanDetails
                loanId={pageParams.id || 'ln_01'}
                onNavigate={navigateTo}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenAgreementModal={handleOpenAgreementModal}
              />
            )}
            {currentPage === 'calculator' && (
              <LoanCalculator onNavigate={navigateTo} />
            )}
            {currentPage === 'daily_collections' && (
              <DailyCollections
                onNavigate={navigateTo}
                onOpenPaymentModal={handleOpenPaymentModal}
              />
            )}
            {currentPage === 'receipts' && (
              <DailyCollections
                onNavigate={navigateTo}
                onOpenPaymentModal={handleOpenPaymentModal}
              />
            )}
            {currentPage === 'overdue_loans' && <OverdueLoans />}
            {currentPage === 'reminders' && <Reminders />}
            {currentPage === 'collateral' && <CollateralPage />}
            {currentPage === 'employees' && <Employees />}
            {(currentPage === 'shareholders' ||
              currentPage === 'shareholders_portal' ||
              currentPage === 'shareholder_capital' ||
              currentPage === 'shareholder_distributions') && <ShareholdersPortal />}
            {currentPage === 'shareholder_reports' && <FinancialReports />}
            {currentPage === 'expenses_cash' && <ExpensesCash />}
            {currentPage === 'financial_reports' && <FinancialReports />}
            {currentPage === 'audit_logs' && <AuditLogsPage />}
            {currentPage === 'user_management' && <UserManagement />}
            {currentPage === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Global Footer */}
      <Footer />

      {/* Payment Recording Modal */}
      {paymentLoan && (
        <RecordPaymentModal
          isOpen={Boolean(paymentLoan)}
          onClose={() => setPaymentLoan(null)}
          loan={paymentLoan}
          defaultAmount={paymentDefaultAmt}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          receiptData={activeReceipt}
        />
      )}

      {/* Official Printable Agreement Modal */}
      {activeAgreementData && (
        <LoanAgreementModal
          isOpen={Boolean(activeAgreementData)}
          onClose={() => setActiveAgreementData(null)}
          loan={activeAgreementData.loan}
          borrower={activeAgreementData.borrower}
          collateral={activeAgreementData.collateral}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
