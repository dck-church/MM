import React, { useState } from 'react';
import {
  Bell,
  Search,
  UserCheck,
  Shield,
  LogOut,
  ChevronDown,
  Building,
  Menu,
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  currentPage,
  onNavigate,
}) => {
  const { user, switchUser, logout, isShareholder } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const roleLabels: Record<string, { title: string; color: string }> = {
    super_admin: { title: 'Super Administrator', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    owner_director: { title: 'Owner / Director', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    shareholder: { title: 'Shareholder Portal', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    accountant: { title: 'Chief Accountant', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    loan_officer: { title: 'Credit & Loan Officer', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    cashier: { title: 'Counter Cashier', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    auditor: { title: 'Internal Auditor', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  };

  const sampleUsers = [
    { id: 'usr_admin', name: 'Mpiima Miracle', role: 'super_admin', label: 'Super Administrator' },
    { id: 'usr_director', name: 'Mark Mugisha', role: 'super_admin', label: 'Super Administrator' },
    { id: 'usr_shareholder', name: 'Dr. Moses Matovu', role: 'shareholder', label: 'Shareholder (Investor View)' },
    { id: 'usr_loanofficer', name: 'Brian Kigozi', role: 'loan_officer', label: 'Loan Officer' },
    { id: 'usr_cashier', name: 'Grace Atuhaire', role: 'cashier', label: 'Cashier (Collections)' },
    { id: 'usr_accountant', name: 'Sarah Namubiru', role: 'accountant', label: 'Accountant' },
    { id: 'usr_auditor', name: 'Paul Ssemwogerere', role: 'auditor', label: 'Auditor (Read-Only)' },
  ];

  const currentRoleInfo = roleLabels[user?.role || 'super_admin'] || {
    title: user?.role || 'User',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => onNavigate(isShareholder ? 'shareholders_portal' : 'dashboard')}
          className="cursor-pointer"
        >
          <Logo size="md" />
        </div>
      </div>

      {/* Center portal badge indicator */}
      <div className="hidden md:flex items-center gap-2">
        {isShareholder ? (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Building className="h-3.5 w-3.5 text-blue-600" />
            <span>Shareholders' Monitoring Portal Mode</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            <span>Core Financial &amp; Lending Operations</span>
          </div>
        )}
      </div>

      {/* Right controls: Role switcher & User menu */}
      <div className="flex items-center gap-3">
        {/* Role Switcher (For testing all master prompt roles) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100"
            title="Switch User Role for Testing"
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">Switch Role:</span>
            <span className="font-bold text-slate-900">{user?.name?.split(' ')[0]}</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Operational Persona
              </div>
              <div className="space-y-1">
                {sampleUsers.map(su => (
                  <button
                    key={su.id}
                    onClick={() => {
                      switchUser(su.id);
                      setShowRoleSwitcher(false);
                      if (su.role === 'shareholder') {
                        onNavigate('shareholders_portal');
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition ${
                      user?.id === su.id
                        ? 'bg-amber-500 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{su.name}</div>
                      <div className={`text-[10px] ${user?.id === su.id ? 'text-amber-100' : 'text-slate-500'}`}>
                        {su.label}
                      </div>
                    </div>
                    {user?.id === su.id && <span className="text-xs">Active</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => onNavigate('reminders')}
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          title="Payment Reminders &amp; Alerts"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-xs font-bold text-[#eab308] shadow-2xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden text-left xl:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">{currentRoleInfo.title}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                <div className="mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Shield className="h-3.5 w-3.5 text-slate-500" /> Company Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-600" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
