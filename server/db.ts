import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'owner_director' | 'shareholder' | 'accountant' | 'loan_officer' | 'cashier' | 'auditor';
  password_hash: string;
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
}

export interface Loan {
  id: string;
  loan_no: string;
  borrower_id: string;
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

export interface DatabaseSchema {
  users: User[];
  borrowers: Borrower[];
  loans: Loan[];
  collaterals: Collateral[];
  repayment_schedules: RepaymentScheduleItem[];
  payments: Payment[];
  reminders: Reminder[];
  employees: Employee[];
  shareholders: Shareholder[];
  profit_distributions: ProfitDistribution[];
  expenses: Expense[];
  cash_reconciliations: CashReconciliation[];
  audit_logs: AuditLog[];
  settings: CompanySettings;
}

class JsonDatabase {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, using defaults:', err);
      }
    }
    const initial = this.getInitialSeed();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public save() {
    this.saveData(this.data);
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public restore(backupData: DatabaseSchema) {
    this.data = backupData;
    this.save();
  }

  public logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const log: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.data.audit_logs.unshift(log);
    // Keep max 2000 logs
    if (this.data.audit_logs.length > 2000) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 2000);
    }
    this.save();
  }

  private getInitialSeed(): DatabaseSchema {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const settings: CompanySettings = {
      company_name: 'Tripple MMM Investments Company LTD',
      tagline: 'Empowering Growth, Building Financial Stability & Trust',
      official_phones: ['+256 746163098', '+256 701942603', '+256 703176310'],
      official_email: 'info@tripplemmm.co.ug',
      office_address: 'Plot 14, Jinja Road, Commercial Plaza, Kampala, Uganda',
      currency: 'UGX',
      currency_symbol: 'UGX',
      default_flat_rate: 10,
      default_reducing_rate: 12,
      processing_fee_percentage: 2,
      late_penalty_rate_daily: 0.5,
      loan_id_prefix: 'MMM-LN-',
      borrower_id_prefix: 'MMM-BW-',
      receipt_id_prefix: 'MMM-REC-',
      reminder_days_before: [7, 3, 1, 0],
      require_two_approvals_above: 5000000,
      allow_self_approval: false,
    };

    const users: User[] = [
      {
        id: 'usr_admin',
        name: 'Mpiima Miracle',
        email: 'admin@tripplemmm.co.ug',
        phone: '+256 746163098',
        role: 'super_admin',
        password_hash: 'admin123',
        status: 'active',
        created_at: '2026-01-01T08:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr_director',
        name: 'Mark Mugisha',
        email: 'director@tripplemmm.co.ug',
        phone: '+256 701942603',
        role: 'super_admin',
        password_hash: 'director123',
        status: 'active',
        created_at: '2026-01-01T08:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr_shareholder',
        name: 'Dr. Moses Matovu',
        email: 'shareholder@tripplemmm.co.ug',
        phone: '+256 703176310',
        role: 'shareholder',
        password_hash: 'shareholder123',
        status: 'active',
        created_at: '2026-01-05T09:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr_accountant',
        name: 'Sarah Namubiru',
        email: 'accountant@tripplemmm.co.ug',
        phone: '+256 772456789',
        role: 'accountant',
        password_hash: 'accountant123',
        status: 'active',
        created_at: '2026-01-10T08:30:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr_loanofficer',
        name: 'Brian Kigozi',
        email: 'officer@tripplemmm.co.ug',
        phone: '+256 752345678',
        role: 'loan_officer',
        password_hash: 'officer123',
        status: 'active',
        created_at: '2026-01-15T08:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr_cashier',
        name: 'Grace Atuhaire',
        email: 'cashier@tripplemmm.co.ug',
        phone: '+256 783123456',
        role: 'cashier',
        password_hash: 'cashier123',
        status: 'active',
        created_at: '2026-01-20T08:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr_auditor',
        name: 'Paul Ssemwogerere',
        email: 'auditor@tripplemmm.co.ug',
        phone: '+256 700987654',
        role: 'auditor',
        password_hash: 'auditor123',
        status: 'active',
        created_at: '2026-02-01T08:00:00Z',
        last_login: new Date().toISOString(),
      },
    ];

    const employees: Employee[] = [
      {
        id: 'emp_01',
        user_id: 'usr_admin',
        employee_no: 'MMM-EMP-001',
        full_name: 'Mpiima Miracle',
        phone: '+256 746163098',
        email: 'admin@tripplemmm.co.ug',
        role: 'Managing Director & Super Admin',
        branch: 'Kampala Main Branch',
        hire_date: '2025-01-10',
        status: 'active',
        created_at: '2025-01-10T08:00:00Z',
      },
      {
        id: 'emp_02',
        user_id: 'usr_director',
        employee_no: 'MMM-EMP-002',
        full_name: 'Mpiima Miracle',
        phone: '+256 701942603',
        email: 'director@tripplemmm.co.ug',
        role: 'Operations Director',
        branch: 'Kampala Main Branch',
        hire_date: '2025-01-10',
        status: 'active',
        created_at: '2025-01-10T08:00:00Z',
      },
      {
        id: 'emp_03',
        user_id: 'usr_accountant',
        employee_no: 'MMM-EMP-003',
        full_name: 'Sarah Namubiru',
        phone: '+256 772456789',
        email: 'accountant@tripplemmm.co.ug',
        role: 'Chief Accountant',
        branch: 'Kampala Main Branch',
        hire_date: '2025-03-01',
        status: 'active',
        created_at: '2025-03-01T08:00:00Z',
      },
      {
        id: 'emp_04',
        user_id: 'usr_loanofficer',
        employee_no: 'MMM-EMP-004',
        full_name: 'Brian Kigozi',
        phone: '+256 752345678',
        email: 'officer@tripplemmm.co.ug',
        role: 'Senior Credit & Loan Officer',
        branch: 'Kampala Main Branch',
        hire_date: '2025-04-15',
        status: 'active',
        created_at: '2025-04-15T08:00:00Z',
      },
      {
        id: 'emp_05',
        user_id: 'usr_cashier',
        employee_no: 'MMM-EMP-005',
        full_name: 'Grace Atuhaire',
        phone: '+256 783123456',
        email: 'cashier@tripplemmm.co.ug',
        role: 'Head Cashier',
        branch: 'Kampala Main Branch',
        hire_date: '2025-05-01',
        status: 'active',
        created_at: '2025-05-01T08:00:00Z',
      },
    ];

    const shareholders: Shareholder[] = [
      {
        id: 'sh_01',
        user_id: 'usr_admin',
        shareholder_no: 'MMM-SH-001',
        full_name: 'Mpiima Miracle',
        phone: '+256 746163098',
        email: 'mpiima.miracle@tripplemmm.co.ug',
        address: 'Kololo Heights, Kampala',
        join_date: '2025-01-01',
        agreed_capital: 150000000,
        actual_capital: 150000000,
        share_percentage: 40.0,
        status: 'active',
        notes: 'Founding Partner & Managing Director',
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'sh_02',
        user_id: 'usr_director',
        shareholder_no: 'MMM-SH-002',
        full_name: 'Mpiima Miracle',
        phone: '+256 701942603',
        email: 'mark.mugisha@tripplemmm.co.ug',
        address: 'Muyenga Tank Hill, Kampala',
        join_date: '2025-01-01',
        agreed_capital: 120000000,
        actual_capital: 120000000,
        share_percentage: 32.0,
        status: 'active',
        notes: 'Founding Partner & Operations Director',
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'sh_03',
        user_id: 'usr_shareholder',
        shareholder_no: 'MMM-SH-003',
        full_name: 'Dr. Moses Matovu',
        phone: '+256 703176310',
        email: 'shareholder@tripplemmm.co.ug',
        address: 'Naguru Summit View, Kampala',
        join_date: '2025-02-15',
        agreed_capital: 105000000,
        actual_capital: 105000000,
        share_percentage: 28.0,
        status: 'active',
        notes: 'Strategic Investor & Board Advisor',
        created_at: '2025-02-15T00:00:00Z',
      },
    ];

    const borrowers: Borrower[] = [
      {
        id: 'bw_01',
        borrower_no: 'MMM-BW-00101',
        full_name: 'Ronald Kato',
        dob: '1988-06-14',
        gender: 'Male',
        phone_primary: '+256 772112233',
        phone_secondary: '+256 702112233',
        whatsapp: '+256 772112233',
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
        notes: 'Good credit profile, hardware shop running for 6 years.',
        created_at: '2026-01-10T10:00:00Z',
      },
      {
        id: 'bw_02',
        borrower_no: 'MMM-BW-00102',
        full_name: 'Juliet Nankya',
        dob: '1992-11-23',
        gender: 'Female',
        phone_primary: '+256 704556677',
        phone_secondary: '',
        whatsapp: '+256 704556677',
        residential_address: 'Najjera II, Near Kira Road Police',
        district: 'Wakiso',
        town: 'Kira Municipality',
        village: 'Najjera',
        occupation: 'Supermarket Owner & Retailer',
        employer_business: 'Nankya Fresh Mart',
        work_address: 'Kira Road Junction, Wakiso',
        emergency_name: 'Patrick Nsubuga',
        emergency_phone: '+256 782334455',
        emergency_relationship: 'Brother',
        guarantor_name: 'Agnes Nalule',
        guarantor_phone: '+256 701445566',
        guarantor_relationship: 'Friend & Business Partner',
        guarantor_address: 'Kyanja Trading Centre',
        photo_url: '',
        id_front_url: '',
        id_back_url: '',
        id_type: 'National ID',
        id_number: 'CF92112301WXYZ',
        status: 'active',
        created_by: 'usr_loanofficer',
        notes: 'Repays on time every week via MTN Mobile Money.',
        created_at: '2026-01-12T11:30:00Z',
      },
      {
        id: 'bw_03',
        borrower_no: 'MMM-BW-00103',
        full_name: 'Samuel Okello',
        dob: '1985-03-09',
        gender: 'Male',
        phone_primary: '+256 788990011',
        phone_secondary: '+256 756990011',
        whatsapp: '+256 788990011',
        residential_address: 'Bweyogerere Kakajjo, Zone B',
        district: 'Wakiso',
        town: 'Kira',
        village: 'Kakajjo',
        occupation: 'Commercial Farmer & Poultry Dealer',
        employer_business: 'Okello Agribusiness Farm',
        work_address: 'Mukono - Kyetume Road',
        emergency_name: 'Eunice Akello',
        emergency_phone: '+256 779112233',
        emergency_relationship: 'Spouse',
        guarantor_name: 'Peter Otim',
        guarantor_phone: '+256 703554433',
        guarantor_relationship: 'Uncle',
        guarantor_address: 'Bweyogerere Central',
        photo_url: '',
        id_front_url: '',
        id_back_url: '',
        id_type: 'National ID',
        id_number: 'CM85030911KLMN',
        status: 'active',
        created_by: 'usr_loanofficer',
        notes: 'Poultry feed expansion loan. Land title pledged as collateral.',
        created_at: '2026-01-18T14:00:00Z',
      },
      {
        id: 'bw_04',
        borrower_no: 'MMM-BW-00104',
        full_name: 'Harriet Birungi',
        dob: '1995-08-30',
        gender: 'Female',
        phone_primary: '+256 750123987',
        phone_secondary: '',
        whatsapp: '+256 750123987',
        residential_address: 'Makindye Kizungu, Hill Road',
        district: 'Kampala',
        town: 'Makindye Division',
        village: 'Kizungu',
        occupation: 'Boutique & Salon Owner',
        employer_business: 'Glamour Hair & Beauty Studio',
        work_address: 'Kabalagala Plaza, 1st Floor',
        emergency_name: 'Geoffrey Mutebi',
        emergency_phone: '+256 771239876',
        emergency_relationship: 'Father',
        guarantor_name: 'Rose Nabawanuka',
        guarantor_phone: '+256 789456123',
        guarantor_relationship: 'Aunt',
        guarantor_address: 'Ggaba Road, Kansanga',
        photo_url: '',
        id_front_url: '',
        id_back_url: '',
        id_type: 'National ID',
        id_number: 'CF95083044PQRS',
        status: 'active',
        created_by: 'usr_loanofficer',
        notes: 'Daily repayment business loan. 100 days term.',
        created_at: '2026-01-25T09:15:00Z',
      },
    ];

    const collaterals: Collateral[] = [
      {
        id: 'col_01',
        loan_id: 'ln_01',
        borrower_id: 'bw_01',
        collateral_type: 'Motor Vehicle Logbook',
        description: 'Toyota Hiace (Drone), Silver Metallic, 2016 Model',
        owner_name: 'Ronald Kato',
        estimated_value: 38000000,
        serial_or_reg_no: 'UBK 452X',
        physical_location: 'Kisaasi Residence / Nakivubo Depot',
        ownership_doc_info: 'Original Logbook in Company Safe: UBK 452X',
        inspection_date: '2026-01-11',
        inspected_by: 'Brian Kigozi',
        photos: [],
        status: 'verified',
        notes: 'Vehicle inspected, clean mechanical condition, comprehensive insurance active.',
        created_at: '2026-01-11T12:00:00Z',
      },
      {
        id: 'col_02',
        loan_id: 'ln_02',
        borrower_id: 'bw_02',
        collateral_type: 'Commercial Equipment & Supermarket Stock',
        description: 'Double Door Display Freezers (2 Units) & Stock Pledge',
        owner_name: 'Juliet Nankya',
        estimated_value: 12000000,
        serial_or_reg_no: 'SN-FRZ-8921A / SN-FRZ-8921B',
        physical_location: 'Nankya Fresh Mart, Kira Road Junction',
        ownership_doc_info: 'Commercial Purchase Invoices & Chattels Mortgage deed',
        inspection_date: '2026-01-13',
        inspected_by: 'Brian Kigozi',
        photos: [],
        status: 'verified',
        notes: 'Freezers verified in working order. Stock valued at UGX 25,000,000.',
        created_at: '2026-01-13T10:00:00Z',
      },
      {
        id: 'col_03',
        loan_id: 'ln_03',
        borrower_id: 'bw_03',
        collateral_type: 'Land Title (Mailo)',
        description: '0.50 Acre Plot with Residential House and Poultry Shelters',
        owner_name: 'Samuel Okello',
        estimated_value: 65000000,
        serial_or_reg_no: 'Kyaggwe Block 114 Plot 388',
        physical_location: 'Mukono Kyetume, Wakiso/Mukono boundary',
        ownership_doc_info: 'Original Title Deed deposited in bank safety locker',
        inspection_date: '2026-01-19',
        inspected_by: 'Mpiima Miracle',
        photos: [],
        status: 'verified',
        notes: 'Search conducted at Ministry of Lands Zonal Office Mukono; title free of encumbrance.',
        created_at: '2026-01-19T11:00:00Z',
      },
      {
        id: 'col_04',
        loan_id: 'ln_04',
        borrower_id: 'bw_04',
        collateral_type: 'Motorcycle & Salon Equipment',
        description: 'Bajaj Boxer Motorcycle & 4 Salon Hydraulic Chairs',
        owner_name: 'Harriet Birungi',
        estimated_value: 6500000,
        serial_or_reg_no: 'UFG 901M',
        physical_location: 'Kabalagala Plaza, Shop 14',
        ownership_doc_info: 'Logbook UFG 901M & Equipment Receipts',
        inspection_date: '2026-01-26',
        inspected_by: 'Brian Kigozi',
        photos: [],
        status: 'verified',
        notes: 'Motorcycle logbook held in custody with signed transfer forms.',
        created_at: '2026-01-26T15:00:00Z',
      },
    ];

    // Build real realistic loans
    const loans: Loan[] = [
      {
        id: 'ln_01',
        loan_no: 'MMM-LN-00001',
        borrower_id: 'bw_01',
        requested_principal: 10000000,
        approved_principal: 10000000,
        interest_rate: 10,
        interest_type: 'flat',
        duration_value: 4,
        duration_unit: 'months',
        repayment_frequency: 'monthly',
        first_payment_date: '2026-02-15',
        final_payment_date: '2026-05-15',
        processing_fee: 200000,
        total_interest: 1000000,
        total_repayable: 11200000,
        total_paid: 5600000,
        principal_paid: 5000000,
        interest_paid: 500000,
        fees_paid: 200000,
        balance_remaining: 5600000,
        status: 'active',
        loan_officer_id: 'usr_loanofficer',
        approved_by: 'usr_director',
        approved_at: '2026-01-14T10:00:00Z',
        approval_notes: 'Approved at 10% flat for 4 months. Logbook collateral held.',
        disbursed_by: 'usr_cashier',
        disbursed_at: '2026-01-15T11:00:00Z',
        disbursement_method: 'bank_transfer',
        disbursement_reference: 'STANBIC-TRX-99412',
        created_at: '2026-01-12T09:00:00Z',
      },
      {
        id: 'ln_02',
        loan_no: 'MMM-LN-00002',
        borrower_id: 'bw_02',
        requested_principal: 3000000,
        approved_principal: 3000000,
        interest_rate: 8,
        interest_type: 'flat',
        duration_value: 8,
        duration_unit: 'weeks',
        repayment_frequency: 'weekly',
        first_payment_date: '2026-01-25',
        final_payment_date: '2026-03-15',
        processing_fee: 60000,
        total_interest: 240000,
        total_repayable: 3300000,
        total_paid: 2475000,
        principal_paid: 2250000,
        interest_paid: 180000,
        fees_paid: 60000,
        balance_remaining: 825000,
        status: 'active',
        loan_officer_id: 'usr_loanofficer',
        approved_by: 'usr_director',
        approved_at: '2026-01-17T11:30:00Z',
        approval_notes: 'Approved for supermarket working capital.',
        disbursed_by: 'usr_cashier',
        disbursed_at: '2026-01-18T14:00:00Z',
        disbursement_method: 'mobile_money',
        disbursement_reference: 'MTN-MOMO-882194',
        created_at: '2026-01-15T14:00:00Z',
      },
      {
        id: 'ln_03',
        loan_no: 'MMM-LN-00003',
        borrower_id: 'bw_03',
        requested_principal: 15000000,
        approved_principal: 15000000,
        interest_rate: 12,
        interest_type: 'reducing_balance',
        duration_value: 6,
        duration_unit: 'months',
        repayment_frequency: 'monthly',
        first_payment_date: '2026-02-25',
        final_payment_date: '2026-07-25',
        processing_fee: 300000,
        total_interest: 1800000,
        total_repayable: 17100000,
        total_paid: 5700000,
        principal_paid: 5000000,
        interest_paid: 600000,
        fees_paid: 300000,
        balance_remaining: 11400000,
        status: 'active',
        loan_officer_id: 'usr_loanofficer',
        approved_by: 'usr_admin',
        approved_at: '2026-01-22T15:00:00Z',
        approval_notes: 'Large facility. Title deed lodged in bank safe. Dual approval completed.',
        disbursed_by: 'usr_cashier',
        disbursed_at: '2026-01-25T10:00:00Z',
        disbursement_method: 'bank_transfer',
        disbursement_reference: 'CENTENARY-TX-55102',
        created_at: '2026-01-20T10:00:00Z',
      },
      {
        id: 'ln_04',
        loan_no: 'MMM-LN-00004',
        borrower_id: 'bw_04',
        requested_principal: 1000000,
        approved_principal: 1000000,
        interest_rate: 10,
        interest_type: 'flat',
        duration_value: 100,
        duration_unit: 'days',
        repayment_frequency: 'daily',
        first_payment_date: '2026-01-28',
        final_payment_date: '2026-05-08',
        processing_fee: 20000,
        total_interest: 100000,
        total_repayable: 1120000,
        total_paid: 660000,
        principal_paid: 600000,
        interest_paid: 60000,
        fees_paid: 20000,
        balance_remaining: 460000,
        status: 'active',
        loan_officer_id: 'usr_loanofficer',
        approved_by: 'usr_director',
        approved_at: '2026-01-27T16:00:00Z',
        approval_notes: 'Daily repayment UGX 11,000. Motorcycle collateral pledged.',
        disbursed_by: 'usr_cashier',
        disbursed_at: '2026-01-28T09:00:00Z',
        disbursement_method: 'cash',
        disbursement_reference: 'CASH-DISB-004',
        created_at: '2026-01-26T16:30:00Z',
      },
    ];

    // Repayment schedules
    const repayment_schedules: RepaymentScheduleItem[] = [];

    // Schedule for LN-01 (4 installments of 2,750,000 + fee)
    repayment_schedules.push(
      {
        id: 'sch_01_1',
        loan_id: 'ln_01',
        installment_no: 1,
        due_date: '2026-02-15',
        expected_amount: 2750000,
        principal_portion: 2500000,
        interest_portion: 250000,
        fees_portion: 0,
        amount_paid: 2750000,
        remaining_amount: 0,
        status: 'paid',
        paid_date: '2026-02-14',
        payment_method: 'bank_transfer',
        receipt_no: 'MMM-REC-2026-0001',
        cashier_id: 'usr_cashier',
      },
      {
        id: 'sch_01_2',
        loan_id: 'ln_01',
        installment_no: 2,
        due_date: '2026-03-15',
        expected_amount: 2750000,
        principal_portion: 2500000,
        interest_portion: 250000,
        fees_portion: 0,
        amount_paid: 2750000,
        remaining_amount: 0,
        status: 'paid',
        paid_date: '2026-03-15',
        payment_method: 'bank_transfer',
        receipt_no: 'MMM-REC-2026-0005',
        cashier_id: 'usr_cashier',
      },
      {
        id: 'sch_01_3',
        loan_id: 'ln_01',
        installment_no: 3,
        due_date: todayStr, // Due today!
        expected_amount: 2750000,
        principal_portion: 2500000,
        interest_portion: 250000,
        fees_portion: 0,
        amount_paid: 0,
        remaining_amount: 2750000,
        status: 'due_today',
      },
      {
        id: 'sch_01_4',
        loan_id: 'ln_01',
        installment_no: 4,
        due_date: '2026-05-15',
        expected_amount: 2750000,
        principal_portion: 2500000,
        interest_portion: 250000,
        fees_portion: 0,
        amount_paid: 0,
        remaining_amount: 2750000,
        status: 'upcoming',
      }
    );

    // Schedule for LN-04 daily (show today's installment as due today or partial)
    repayment_schedules.push(
      {
        id: 'sch_04_today',
        loan_id: 'ln_04',
        installment_no: 61,
        due_date: todayStr,
        expected_amount: 11000,
        principal_portion: 10000,
        interest_portion: 1000,
        fees_portion: 0,
        amount_paid: 0,
        remaining_amount: 11000,
        status: 'due_today',
      },
      {
        id: 'sch_04_tomorrow',
        loan_id: 'ln_04',
        installment_no: 62,
        due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
        expected_amount: 11000,
        principal_portion: 10000,
        interest_portion: 1000,
        fees_portion: 0,
        amount_paid: 0,
        remaining_amount: 11000,
        status: 'upcoming',
      }
    );

    const payments: Payment[] = [
      {
        id: 'pmt_01',
        receipt_no: 'MMM-REC-2026-0001',
        loan_id: 'ln_01',
        borrower_id: 'bw_01',
        amount: 2950000, // included 200k processing fee + 2.75m inst
        payment_method: 'bank_transfer',
        transaction_ref: 'STB-DEP-77291',
        payment_date: '2026-02-14T10:30:00Z',
        cashier_id: 'usr_cashier',
        cashier_name: 'Grace Atuhaire',
        installment_covered: 'Installment #1 & Processing Fee',
        principal_component: 2500000,
        interest_component: 250000,
        balance_after_payment: 8450000,
        notes: 'First installment payment received via Stanbic bank transfer.',
        is_reversed: false,
        created_at: '2026-02-14T10:30:00Z',
      },
      {
        id: 'pmt_02',
        receipt_no: 'MMM-REC-2026-0005',
        loan_id: 'ln_01',
        borrower_id: 'bw_01',
        amount: 2750000,
        payment_method: 'bank_transfer',
        transaction_ref: 'STB-DEP-88410',
        payment_date: '2026-03-15T14:15:00Z',
        cashier_id: 'usr_cashier',
        cashier_name: 'Grace Atuhaire',
        installment_covered: 'Installment #2',
        principal_component: 2500000,
        interest_component: 250000,
        balance_after_payment: 5600000,
        notes: 'Second installment paid on due date.',
        is_reversed: false,
        created_at: '2026-03-15T14:15:00Z',
      },
      {
        id: 'pmt_03',
        receipt_no: 'MMM-REC-2026-0012',
        loan_id: 'ln_02',
        borrower_id: 'bw_02',
        amount: 412500,
        payment_method: 'mobile_money',
        transaction_ref: 'MTN-TXN-1192837',
        payment_date: '2026-02-08T11:00:00Z',
        cashier_id: 'usr_cashier',
        cashier_name: 'Grace Atuhaire',
        installment_covered: 'Weekly Installment #3',
        principal_component: 375000,
        interest_component: 37500,
        balance_after_payment: 2062500,
        notes: 'MTN Mobile Money collection.',
        is_reversed: false,
        created_at: '2026-02-08T11:00:00Z',
      },
      {
        id: 'pmt_04',
        receipt_no: 'MMM-REC-2026-0020',
        loan_id: 'ln_04',
        borrower_id: 'bw_04',
        amount: 11000,
        payment_method: 'cash',
        transaction_ref: 'CASH-REC-0020',
        payment_date: `${todayStr}T08:45:00Z`,
        cashier_id: 'usr_cashier',
        cashier_name: 'Grace Atuhaire',
        installment_covered: 'Daily Installment #60',
        principal_component: 10000,
        interest_component: 1000,
        balance_after_payment: 460000,
        notes: 'Daily collection received at counter.',
        is_reversed: false,
        created_at: `${todayStr}T08:45:00Z`,
      },
    ];

    const reminders: Reminder[] = [
      {
        id: 'rem_01',
        borrower_id: 'bw_01',
        borrower_name: 'Ronald Kato',
        borrower_phone: '+256 772112233',
        loan_id: 'ln_01',
        loan_no: 'MMM-LN-00001',
        channel: 'whatsapp',
        message: `Dear Ronald Kato, This is a payment reminder from Tripple MMM Investments Company LTD. Your loan installment of UGX 2,750,000 is due on ${todayStr}. Your outstanding loan balance is UGX 5,600,000. Please make your payment according to your loan agreement. For assistance, contact +256 746163098, +256 701942603, or +256 703176310. Thank you.`,
        scheduled_date: todayStr,
        due_date: todayStr,
        amount_due: 2750000,
        status: 'sent',
        sent_at: `${todayStr}T07:30:00Z`,
        provider_response: 'Delivered via WhatsApp Gateway',
        created_at: `${todayStr}T07:00:00Z`,
      },
      {
        id: 'rem_02',
        borrower_id: 'bw_04',
        borrower_name: 'Harriet Birungi',
        borrower_phone: '+256 750123987',
        loan_id: 'ln_04',
        loan_no: 'MMM-LN-00004',
        channel: 'sms',
        message: `Dear Harriet Birungi, This is a payment reminder from Tripple MMM Investments Company LTD. Your daily installment of UGX 11,000 is due today. Outstanding balance is UGX 460,000. Contact +256 746163098. Thank you.`,
        scheduled_date: todayStr,
        due_date: todayStr,
        amount_due: 11000,
        status: 'sent',
        sent_at: `${todayStr}T06:45:00Z`,
        provider_response: 'Delivered (Uganda Telecom SMS aggregator)',
        created_at: `${todayStr}T06:00:00Z`,
      },
    ];

    const expenses: Expense[] = [
      {
        id: 'exp_01',
        expense_no: 'MMM-EXP-2026-001',
        date: '2026-02-01',
        category: 'rent',
        amount: 3500000,
        description: 'Office Rent - Commercial Plaza Kampala (Plot 14 Jinja Road)',
        payment_method: 'bank_transfer',
        reference: 'RENT-FEB-2026',
        recorded_by: 'Sarah Namubiru',
        approved_by: 'Mpiima Miracle',
        status: 'approved',
        created_at: '2026-02-01T09:00:00Z',
      },
      {
        id: 'exp_02',
        expense_no: 'MMM-EXP-2026-002',
        date: '2026-02-05',
        category: 'utilities',
        amount: 450000,
        description: 'Office Electricity (Umeme Yaka) and National Water bill',
        payment_method: 'mobile_money',
        reference: 'UMEME-8841029',
        recorded_by: 'Sarah Namubiru',
        approved_by: 'Mpiima Miracle',
        status: 'approved',
        created_at: '2026-02-05T11:00:00Z',
      },
      {
        id: 'exp_03',
        expense_no: 'MMM-EXP-2026-003',
        date: '2026-02-28',
        category: 'salaries',
        amount: 6800000,
        description: 'Monthly Staff Payroll - Operations & Field Officers',
        payment_method: 'bank_transfer',
        reference: 'PAYROLL-FEB-2026',
        recorded_by: 'Sarah Namubiru',
        approved_by: 'Mpiima Miracle',
        status: 'approved',
        created_at: '2026-02-28T16:00:00Z',
      },
      {
        id: 'exp_04',
        expense_no: 'MMM-EXP-2026-004',
        date: todayStr,
        category: 'transport',
        amount: 85000,
        description: 'Fuel allowance for Loan Officer field verification (Mukono / Najjera route)',
        payment_method: 'cash',
        reference: 'FUEL-VOUCHER-089',
        recorded_by: 'Grace Atuhaire',
        approved_by: 'Mpiima Miracle',
        status: 'approved',
        created_at: `${todayStr}T09:15:00Z`,
      },
    ];

    const cash_reconciliations: CashReconciliation[] = [
      {
        id: 'recon_01',
        date: todayStr,
        branch: 'Kampala Main Branch',
        opening_cash: 2500000,
        total_collections_cash: 11000,
        total_collections_momo: 412500,
        total_collections_bank: 2750000,
        total_disbursements_cash: 0,
        total_expenses_cash: 85000,
        expected_closing_cash: 2426000,
        actual_cash_counted: 2426000,
        momo_balance: 14850000,
        bank_balance: 68400000,
        discrepancy: 0,
        notes: 'Midday cash drawer reconciled. Exact match with physical count.',
        cashier_id: 'usr_cashier',
        cashier_name: 'Grace Atuhaire',
        supervisor_id: 'usr_accountant',
        supervisor_name: 'Sarah Namubiru',
        status: 'verified',
        created_at: `${todayStr}T12:00:00Z`,
      },
    ];

    const profit_distributions: ProfitDistribution[] = [
      {
        id: 'dist_01',
        period_name: 'Q4 2025 Approved Profit Distribution',
        total_profit: 32000000,
        distributable_amount: 20000000,
        calculation_date: '2026-01-08',
        approved_by: 'Board of Directors & Mpiima Miracle',
        status: 'paid',
        notes: 'Approved dividend payout per audited shareholder register.',
        allocations: [
          {
            shareholder_id: 'sh_01',
            shareholder_name: 'Mpiima Miracle',
            share_percentage: 40.0,
            amount: 8000000,
            status: 'paid',
            paid_date: '2026-01-10',
            payment_ref: 'DIV-TXN-001',
          },
          {
            shareholder_id: 'sh_02',
            shareholder_name: 'Mpiima Miracle',
            share_percentage: 32.0,
            amount: 6400000,
            status: 'paid',
            paid_date: '2026-01-10',
            payment_ref: 'DIV-TXN-002',
          },
          {
            shareholder_id: 'sh_03',
            shareholder_name: 'Dr. Moses Matovu',
            share_percentage: 28.0,
            amount: 5600000,
            status: 'paid',
            paid_date: '2026-01-10',
            payment_ref: 'DIV-TXN-003',
          },
        ],
        created_at: '2026-01-08T10:00:00Z',
      },
      {
        id: 'dist_02',
        period_name: 'Q1 2026 Proposed Distribution (Interim)',
        total_profit: 28500000,
        distributable_amount: 18000000,
        calculation_date: todayStr,
        approved_by: 'Mpiima Miracle',
        status: 'proposed',
        notes: 'Interim Q1 distribution calculation based on verified interest income.',
        allocations: [
          {
            shareholder_id: 'sh_01',
            shareholder_name: 'Mpiima Miracle',
            share_percentage: 40.0,
            amount: 7200000,
            status: 'pending',
          },
          {
            shareholder_id: 'sh_02',
            shareholder_name: 'Mpiima Miracle',
            share_percentage: 32.0,
            amount: 5760000,
            status: 'pending',
          },
          {
            shareholder_id: 'sh_03',
            shareholder_name: 'Dr. Moses Matovu',
            share_percentage: 28.0,
            amount: 5040000,
            status: 'pending',
          },
        ],
        created_at: `${todayStr}T10:00:00Z`,
      },
    ];

    const audit_logs: AuditLog[] = [
      {
        id: 'LOG-001',
        timestamp: '2026-01-15T11:00:00Z',
        user_id: 'usr_cashier',
        user_name: 'Grace Atuhaire',
        user_role: 'cashier',
        action: 'LOAN_DISBURSED',
        module: 'Loans',
        record_id: 'ln_01',
        details: 'Disbursed UGX 10,000,000 to Ronald Kato via Stanbic Bank ref STANBIC-TRX-99412',
      },
      {
        id: 'LOG-002',
        timestamp: '2026-02-14T10:30:00Z',
        user_id: 'usr_cashier',
        user_name: 'Grace Atuhaire',
        user_role: 'cashier',
        action: 'PAYMENT_RECORDED',
        module: 'Repayments',
        record_id: 'pmt_01',
        details: 'Recorded payment of UGX 2,950,000 for loan MMM-LN-00001. Issued receipt MMM-REC-2026-0001',
      },
      {
        id: 'LOG-003',
        timestamp: `${todayStr}T08:45:00Z`,
        user_id: 'usr_cashier',
        user_name: 'Grace Atuhaire',
        user_role: 'cashier',
        action: 'DAILY_PAYMENT_COLLECTED',
        module: 'Repayments',
        record_id: 'pmt_04',
        details: 'Collected UGX 11,000 cash from Harriet Birungi for daily loan MMM-LN-00004. Receipt MMM-REC-2026-0020 issued.',
      },
      {
        id: 'LOG-004',
        timestamp: `${todayStr}T09:00:00Z`,
        user_id: 'usr_admin',
        user_name: 'Mpiima Miracle',
        user_role: 'super_admin',
        action: 'SYSTEM_LOGIN',
        module: 'Auth',
        details: 'Successful login by Mpiima Miracle from IP 192.168.1.104',
      },
    ];

    return {
      users,
      borrowers,
      loans,
      collaterals,
      repayment_schedules,
      payments,
      reminders,
      employees,
      shareholders,
      profit_distributions,
      expenses,
      cash_reconciliations,
      audit_logs,
      settings,
    };
  }
}

export const db = new JsonDatabase();
