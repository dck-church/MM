export type UserRole =
  | 'super_admin'
  | 'owner_director'
  | 'shareholder'
  | 'accountant'
  | 'loan_officer'
  | 'cashier'
  | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

export interface Borrower {
  id: string;
  borrower_no: string;
  full_name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone_primary: string;
  phone_secondary?: string;
  whatsapp?: string;
  residential_address: string;
  district: string;
  town: string;
  village: string;
  occupation: string;
  employer_business: string;
  work_address: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_relationship: string;
  guarantor_address: string;
  photo_url: string;
  id_front_url: string;
  id_back_url: string;
  id_type: 'National ID' | 'Passport' | 'Driving Permit' | 'Voter Card';
  id_number: string;
  status: 'active' | 'inactive' | 'blacklisted';
  created_by: string;
  notes?: string;
  repayment_frequency_preference?: 'daily' | 'weekly' | 'monthly';
  first_payment_date_preference?: string;
  created_at: string;
}

export interface Collateral {
  id: string;
  loan_id?: string;
  borrower_id: string;
  collateral_type: string;
  description: string;
  owner_name: string;
  estimated_value: number;
  serial_or_reg_no?: string;
  physical_location: string;
  ownership_doc_info: string;
  inspection_date: string;
  inspected_by: string;
  photos: string[];
  status: 'pledged' | 'inspected' | 'verified' | 'released' | 'liquidated';
  notes?: string;
  created_at: string;
}

export interface RepaymentScheduleItem {
  id: string;
  loan_id: string;
  installment_no: number;
  due_date: string;
  expected_amount: number;
  principal_portion: number;
  interest_portion: number;
  fees_portion: number;
  amount_paid: number;
  remaining_amount: number;
  status: 'upcoming' | 'due_today' | 'partially_paid' | 'paid' | 'overdue' | 'rescheduled';
  paid_date?: string;
  payment_method?: string;
  receipt_no?: string;
  cashier_id?: string;
  loan_no?: string;
  borrower_name?: string;
  borrower_phone?: string;
  borrower_no?: string;
  total_loan_balance?: number;
}

export interface Loan {
  id: string;
  loan_no: string;
  borrower_id: string;
  borrower_name?: string;
  borrower_phone?: string;
  borrower_no?: string;
  requested_principal: number;
  approved_principal: number;
  interest_rate: number;
  interest_type: 'flat' | 'reducing_balance';
  duration_value: number;
  duration_unit: 'days' | 'weeks' | 'months';
  repayment_frequency: 'daily' | 'weekly' | 'monthly';
  first_payment_date: string;
  final_payment_date: string;
  processing_fee: number;
  total_interest: number;
  total_repayable: number;
  total_paid: number;
  principal_paid: number;
  interest_paid: number;
  fees_paid: number;
  balance_remaining: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'active' | 'fully_repaid' | 'overdue' | 'restructured' | 'written_off';
  loan_officer_id: string;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  disbursed_by?: string;
  disbursed_at?: string;
  disbursement_method?: 'cash' | 'mobile_money' | 'bank_transfer';
  disbursement_reference?: string;
  borrower_signature_url?: string;
  officer_signature_url?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  receipt_no: string;
  loan_id: string;
  borrower_id: string;
  amount: number;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer';
  transaction_ref?: string;
  payment_date: string;
  cashier_id: string;
  cashier_name: string;
  installment_covered: string;
  principal_component: number;
  interest_component: number;
  balance_after_payment: number;
  notes?: string;
  is_reversed: boolean;
  reversal_reason?: string;
  reversed_by?: string;
  reversed_at?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  borrower_id: string;
  borrower_name: string;
  borrower_phone: string;
  loan_id: string;
  loan_no: string;
  installment_id?: string;
  channel: 'in_app' | 'sms' | 'whatsapp' | 'email';
  message: string;
  scheduled_date: string;
  due_date: string;
  amount_due: number;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
  provider_response?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  user_id?: string;
  employee_no: string;
  full_name: string;
  phone: string;
  email: string;
  role: string;
  branch: string;
  hire_date: string;
  status: 'active' | 'on_leave' | 'inactive';
  loansProcessed?: number;
  collectionsCount?: number;
  totalCollected?: number;
  created_at: string;
}

export interface Shareholder {
  id: string;
  user_id?: string;
  shareholder_no: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  join_date: string;
  agreed_capital: number;
  actual_capital: number;
  share_percentage: number;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
}

export interface ProfitDistribution {
  id: string;
  period_name: string;
  total_profit: number;
  distributable_amount: number;
  calculation_date: string;
  approved_by: string;
  status: 'proposed' | 'approved' | 'paid';
  notes?: string;
  allocations: {
    shareholder_id: string;
    shareholder_name: string;
    share_percentage: number;
    amount: number;
    status: 'pending' | 'paid';
    paid_date?: string;
    payment_ref?: string;
  }[];
  created_at: string;
}

export interface Expense {
  id: string;
  expense_no: string;
  date: string;
  category: 'rent' | 'salaries' | 'utilities' | 'transport' | 'office_supplies' | 'legal' | 'marketing' | 'miscellaneous';
  amount: number;
  description: string;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer';
  reference?: string;
  recorded_by: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt_doc_url?: string;
  created_at: string;
}

export interface CashReconciliation {
  id: string;
  date: string;
  branch: string;
  opening_cash: number;
  total_collections_cash: number;
  total_collections_momo: number;
  total_collections_bank: number;
  total_disbursements_cash: number;
  total_expenses_cash: number;
  expected_closing_cash: number;
  actual_cash_counted: number;
  momo_balance: number;
  bank_balance: number;
  discrepancy: number;
  notes?: string;
  cashier_id: string;
  cashier_name: string;
  supervisor_id?: string;
  supervisor_name?: string;
  status: 'balanced' | 'discrepancy' | 'verified';
  created_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  record_id?: string;
  details: string;
  ip_address?: string;
}

export interface CompanySettings {
  company_name: string;
  tagline: string;
  official_phones: string[];
  official_email: string;
  office_address: string;
  currency: string;
  currency_symbol: string;
  default_flat_rate: number;
  default_reducing_rate: number;
  processing_fee_percentage: number;
  late_penalty_rate_daily: number;
  loan_id_prefix: string;
  borrower_id_prefix: string;
  receipt_id_prefix: string;
  reminder_days_before: number[];
  require_two_approvals_above: number;
  allow_self_approval: boolean;
}

export interface DashboardSummary {
  totalBorrowers: number;
  activeBorrowers: number;
  totalApplications: number;
  awaitingApproval: number;
  loansApproved: number;
  loansDisbursed: number;
  totalPrincipalDisbursed: number;
  totalExpectedRepayments: number;
  totalRepaymentsCollected: number;
  principalOutstanding: number;
  interestOutstanding: number;
  totalOutstandingBalance: number;
  collectionsToday: number;
  loansDueToday: number;
  dueIn7Days: number;
  overdueInstallments: number;
  fullyRepaidLoans: number;
  totalExpenses: number;
  cashBalance: number;
  bankBalance: number;
  momoBalance: number;
  netIncome: number;
  monthlyTrends: Array<{
    month: string;
    disbursed: number;
    collected: number;
    interest: number;
  }>;
  recentActivity: AuditLog[];
}
