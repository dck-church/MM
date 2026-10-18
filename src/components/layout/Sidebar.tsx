import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  BadgeCheck,
  Banknote,
  Receipt,
  CalendarCheck,
  BellRing,
  AlertTriangle,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck2,
  Briefcase,
  PieChart,
  DollarSign,
  BarChart3,
  History,
  UserCog,
  Settings,
  LogOut,
  Building2,
  TrendingUp,
  CreditCard,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const {
    user,
    logout,
    isSuperAdmin,
    isDirector,
    isShareholder,
    isAccountant,
    isLoanOfficer,
    isCashier,
    isAuditor,
  } = useAuth();

  // Navigation Items defined strictly per Section 25 of Master Prompt
  const operationalNavSections = [
    {
      group: 'Lending Operations',
      items: [
        { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, allowed: !isShareholder },
        { id: 'borrowers', label: '2. Borrowers', icon: Users, allowed: !isShareholder },
        { id: 'register_borrower', label: '3. Register Borrower', icon: UserPlus, allowed: isSuperAdmin || isDirector || isLoanOfficer },
        { id: 'loan_applications', label: '4. Loan Applications', icon: FileText, allowed: !isShareholder },
        { id: 'active_loans', label: '5. Active Loans', icon: BadgeCheck, allowed: !isShareholder },
        { id: 'loan_approvals', label: '6. Loan Approvals', icon: FileCheck2, allowed: isSuperAdmin || isDirector },
        { id: 'loan_disbursements', label: '7. Loan Disbursements', icon: Banknote, allowed: isSuperAdmin || isDirector || isCashier },
        { id: 'calculator', label: 'Loan Calculator', icon: Calculator, allowed: !isShareholder },
      ],
    },
    {
      group: 'Collections & Reminders',
      items: [
        { id: 'repayments', label: '8. Repayments', icon: CreditCard, allowed: !isShareholder },
        { id: 'daily_collections', label: '9. Daily Collections', icon: CalendarCheck, allowed: !isShareholder },
        { id: 'reminders', label: '10. Payment Reminders', icon: BellRing, allowed: !isShareholder },
        { id: 'overdue_loans', label: '11. Overdue Loans', icon: AlertTriangle, allowed: !isShareholder },
      ],
    },
    {
      group: 'Security & Documentation',
      items: [
        { id: 'collateral', label: '12. Collateral', icon: ShieldCheck, allowed: !isShareholder },
        { id: 'agreements', label: '13. Loan Agreements', icon: FileSpreadsheet, allowed: !isShareholder },
        { id: 'receipts', label: '14. Receipts', icon: Receipt, allowed: !isShareholder },
      ],
    },
    {
      group: 'Governance & Ownership',
      items: [
        { id: 'employees', label: '15. Employees', icon: Briefcase, allowed: isSuperAdmin || isDirector },
        { id: 'shareholders', label: '16. Shareholders', icon: Users, allowed: isSuperAdmin || isDirector },
        { id: 'shareholders_portal', label: "17. Shareholders' Portal", icon: Building2, allowed: true, highlight: true },
      ],
    },
    {
      group: 'Finance & Administration',
      items: [
        { id: 'expenses_cash', label: '18. Expenses & Cash Mgt', icon: DollarSign, allowed: isSuperAdmin || isDirector || isAccountant || isCashier },
        { id: 'financial_reports', label: '19. Financial Reports', icon: BarChart3, allowed: !isCashier },
        { id: 'audit_logs', label: '20. Audit Logs', icon: History, allowed: isSuperAdmin || isDirector || isAuditor },
        { id: 'user_management', label: '21. User Management', icon: UserCog, allowed: isSuperAdmin },
        { id: 'settings', label: '22. Company Settings', icon: Settings, allowed: isSuperAdmin || isDirector },
      ],
    },
  ];

  // Dedicated Simplified Navigation for Shareholders' Portal
  const shareholderPortalNav = [
    {
      group: 'Investor Oversight',
      items: [
        { id: 'shareholders_portal', label: 'Portfolio Summary', icon: LayoutDashboard, allowed: true },
        { id: 'shareholder_reports', label: 'Approved Financial Reports', icon: BarChart3, allowed: true },
        { id: 'shareholder_capital', label: 'Capital Contributions', icon: TrendingUp, allowed: true },
        { id: 'shareholder_distributions', label: 'Profit Distributions & Dividends', icon: PieChart, allowed: true },
      ],
    },
  ];

  const activeNav = isShareholder ? shareholderPortalNav : operationalNavSections;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-[#09152b] text-slate-300 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Company Title */}
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isShareholder ? 'Shareholder Portal' : 'Tripple MMM Core'}
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {activeNav.map((section, idx) => {
            const visibleItems = section.items.filter(item => item.allowed);
            if (!visibleItems.length) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.group}
                </div>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  const isHighlighted = (item as any).highlight;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500 font-bold text-slate-950 shadow-sm'
                          : isHighlighted
                          ? 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60 border border-blue-700/50'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition ${
                          isActive
                            ? 'text-slate-950'
                            : isHighlighted
                            ? 'text-blue-300'
                            : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom User & Logout */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>23. Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
