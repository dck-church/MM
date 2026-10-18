import {
  User,
  Borrower,
  Loan,
  Collateral,
  Payment,
  Reminder,
  Employee,
  Shareholder,
  Expense,
  CashReconciliation,
  AuditLog,
  CompanySettings,
  DashboardSummary,
  ProfitDistribution,
} from '../types';

export function formatUGX(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'UGX 0';
  return 'UGX ' + Math.round(amount).toLocaleString('en-US');
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function exportToCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// REST API calls
export const api = {
  // Auth
  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: User; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async switchUser(userId: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/users');
    return res.json();
  },

  async createUser(payload: any): Promise<{ success: boolean; user: User; error?: string }> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch('/api/dashboard/summary');
    return res.json();
  },

  // Borrowers
  async getBorrowers(search = '', status = ''): Promise<{ borrowers: Borrower[] }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`/api/borrowers?${params.toString()}`);
    return res.json();
  },

  async getBorrower(id: string): Promise<{
    borrower: Borrower;
    loans: Loan[];
    collaterals: Collateral[];
    payments: Payment[];
    reminders: Reminder[];
  }> {
    const res = await fetch(`/api/borrowers/${id}`);
    return res.json();
  },

  async createBorrower(payload: Partial<Borrower> & {
    collateral?: { item_name: string; description: string; photo_url: string };
  }): Promise<{ success: boolean; borrower: Borrower; error?: string }> {
    const res = await fetch('/api/borrowers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateBorrower(id: string, payload: Partial<Borrower>): Promise<{ success: boolean; borrower: Borrower }> {
    const res = await fetch(`/api/borrowers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Loans
  async getLoans(status = '', borrower_id = ''): Promise<{ loans: Loan[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (borrower_id) params.append('borrower_id', borrower_id);
    const res = await fetch(`/api/loans?${params.toString()}`);
    return res.json();
  },

  async getLoan(id: string): Promise<{
    loan: Loan;
    borrower: Borrower;
    schedule: any[];
    payments: Payment[];
    collaterals: Collateral[];
  }> {
    const res = await fetch(`/api/loans/${id}`);
    return res.json();
  },

  async calculateLoan(payload: any) {
    const res = await fetch('/api/loans/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async createLoan(payload: any): Promise<{ success: boolean; loan: Loan; error?: string }> {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async approveLoan(id: string, approved_principal?: number, notes?: string): Promise<{ success: boolean; loan: Loan; error?: string }> {
    const res = await fetch(`/api/loans/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved_principal, notes }),
    });
    return res.json();
  },

  async rejectLoan(id: string, reason: string): Promise<{ success: boolean; loan: Loan }> {
    const res = await fetch(`/api/loans/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async disburseLoan(id: string, method: string, ref: string): Promise<{ success: boolean; loan: Loan; error?: string }> {
    const res = await fetch(`/api/loans/${id}/disburse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disbursement_method: method, disbursement_reference: ref }),
    });
    return res.json();
  },

  // Daily collections & payments
  async getDailyCollections(dateStr?: string) {
    const url = dateStr ? `/api/collections/daily?date=${dateStr}` : '/api/collections/daily';
    const res = await fetch(url);
    return res.json();
  },

  async recordPayment(payload: {
    loan_id: string;
    amount: number;
    payment_method: string;
    transaction_ref?: string;
    notes?: string;
  }): Promise<{ success: boolean; payment: Payment; receipt: any; error?: string }> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async reversePayment(id: string, reason: string) {
    const res = await fetch(`/api/payments/${id}/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async getReceipt(receiptNo: string) {
    const res = await fetch(`/api/receipts/${receiptNo}`);
    return res.json();
  },

  // Overdue
  async getOverdueLoans(): Promise<{ overdueList: any[] }> {
    const res = await fetch('/api/loans-overdue');
    return res.json();
  },

  // Reminders
  async getReminders(): Promise<{ reminders: Reminder[] }> {
    const res = await fetch('/api/reminders');
    return res.json();
  },

  async autoGenerateReminders() {
    const res = await fetch('/api/reminders/auto-generate', { method: 'POST' });
    return res.json();
  },

  async sendReminder(id: string) {
    const res = await fetch(`/api/reminders/${id}/send`, { method: 'POST' });
    return res.json();
  },

  // Collateral
  async getCollaterals(): Promise<{ collaterals: Collateral[] }> {
    const res = await fetch('/api/collateral');
    return res.json();
  },

  // Employees
  async getEmployees(): Promise<{ employees: Employee[] }> {
    const res = await fetch('/api/employees');
    return res.json();
  },

  // Shareholders & Portal
  async getShareholders(): Promise<{ shareholders: Shareholder[] }> {
    const res = await fetch('/api/shareholders');
    return res.json();
  },

  async createShareholder(payload: any) {
    const res = await fetch('/api/shareholders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getShareholdersPortalSummary(): Promise<any> {
    const res = await fetch('/api/shareholders/portal-summary');
    return res.json();
  },

  async getProfitDistributions(): Promise<{ distributions: ProfitDistribution[] }> {
    const res = await fetch('/api/profit-distributions');
    return res.json();
  },

  async proposeProfitDistribution(payload: any) {
    const res = await fetch('/api/profit-distributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Expenses & Cash Reconciliation
  async getExpenses(): Promise<{ expenses: Expense[] }> {
    const res = await fetch('/api/expenses');
    return res.json();
  },

  async createExpense(payload: any) {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getReconciliations(): Promise<{ reconciliations: CashReconciliation[] }> {
    const res = await fetch('/api/reconciliation');
    return res.json();
  },

  async submitReconciliation(payload: any) {
    const res = await fetch('/api/reconciliation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Audit logs
  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  // Settings & Backups
  async getSettings(): Promise<{ settings: CompanySettings }> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<CompanySettings>) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  async restoreDatabase(backupJson: any) {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupJson),
    });
    return res.json();
  },

  // File / Camera Upload
  async uploadFile(base64Data: string, filename?: string, category?: string): Promise<{ url: string }> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64Data, filename, category }),
    });
    return res.json();
  },
};
