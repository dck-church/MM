import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  switchUser: (userId: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isDirector: boolean;
  isShareholder: boolean;
  isAccountant: boolean;
  isLoanOfficer: boolean;
  isCashier: boolean;
  isAuditor: boolean;
  canApproveLoans: boolean;
  canDisburse: boolean;
  canRecordPayments: boolean;
  canViewBorrowerPrivateDocs: boolean;
  canManageUsers: boolean;
  canManageExpenses: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load current user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const switchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const logout = async () => {
    await api.logout();
    await fetchCurrentUser();
  };

  const role = user?.role;

  const isSuperAdmin = role === 'super_admin';
  const isDirector = role === 'owner_director' || isSuperAdmin;
  const isShareholder = role === 'shareholder';
  const isAccountant = role === 'accountant' || isSuperAdmin;
  const isLoanOfficer = role === 'loan_officer' || isSuperAdmin;
  const isCashier = role === 'cashier' || isSuperAdmin;
  const isAuditor = role === 'auditor';

  const canApproveLoans = isSuperAdmin || role === 'owner_director';
  const canDisburse = isSuperAdmin || role === 'owner_director' || role === 'cashier';
  const canRecordPayments = isSuperAdmin || role === 'cashier' || role === 'accountant';
  
  // Sensitive documents (National ID, handwritten signature) must not be accessible to pure shareholders or unauthorized external viewers
  const canViewBorrowerPrivateDocs = !isShareholder && !isAuditor;
  const canManageUsers = isSuperAdmin;
  const canManageExpenses = isSuperAdmin || role === 'owner_director' || role === 'accountant';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        switchUser,
        login,
        logout,
        isSuperAdmin,
        isDirector,
        isShareholder,
        isAccountant,
        isLoanOfficer,
        isCashier,
        isAuditor,
        canApproveLoans,
        canDisburse,
        canRecordPayments,
        canViewBorrowerPrivateDocs,
        canManageUsers,
        canManageExpenses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
