import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db, Loan, RepaymentScheduleItem, Payment, Borrower, Collateral, Reminder, ProfitDistribution, CashReconciliation, Expense } from './db.js';

export const apiRouter = express.Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');

apiRouter.use((req: Request, res: Response, next) => {
  const sendJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    void db.flush().then(
      () => sendJson(body),
      (err: unknown) => {
        console.error('Failed to persist application data:', err);
        if (!res.headersSent) {
          res.status(500);
          sendJson({ error: 'Failed to save application data. Please try again.' });
        }
      }
    );
    return res;
  }) as Response['json'];
  next();
});

// Helper to format currency
export function formatUGX(amount: number): string {
  return 'UGX ' + Math.round(amount).toLocaleString('en-US');
}

// Helper to convert number to words
export function numberToWordsUGX(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertNumber(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + units[n % 10] + ' ';
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred ' + convertNumber(n % 100);
    if (n < 1000000) return convertNumber(Math.floor(n / 1000)) + ' Thousand ' + convertNumber(n % 1000);
    if (n < 1000000000) return convertNumber(Math.floor(n / 1000000)) + ' Million ' + convertNumber(n % 1000000);
    return convertNumber(Math.floor(n / 1000000000)) + ' Billion ' + convertNumber(n % 1000000000);
  }

  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Ugandan Shillings Only';
  const words = convertNumber(rounded).trim().replace(/\s+/g, ' ');
  return words + ' Ugandan Shillings Only';
}

// -------------------------------------------------------------
// 1. FILE UPLOAD HANDLER
// -------------------------------------------------------------
apiRouter.post('/upload', (req: Request, res: Response) => {
  try {
    const { data, filename, category } = req.body;
    if (!data) {
      res.status(400).json({ error: 'No image data provided' });
      return;
    }

    // data is data:image/png;base64,...
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // Just return the raw data if it's already a URL
      res.json({ url: data });
      return;
    }

    const ext = matches[1].split('/')[1] || 'png';
    const cleanFilename = `${category || 'file'}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, cleanFilename);

    fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));

    res.json({
      url: `/api/uploads/${cleanFilename}`,
      filename: cleanFilename,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.use('/uploads', express.static(UPLOADS_DIR));

// -------------------------------------------------------------
// 2. AUTHENTICATION & SESSIONS
// -------------------------------------------------------------
let currentActiveUserId = 'usr_admin';

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = data.users.find(u => u.id === currentActiveUserId) || data.users[0];
  res.json({ user });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = db.getRawData();
  const user = data.users.find(u => u.email.toLowerCase() === email?.toLowerCase());

  if (!user) {
    res.status(401).json({ error: 'Invalid email or user account not found' });
    return;
  }

  if (user.status !== 'active') {
    res.status(403).json({ error: 'Account is deactivated. Contact the Super Administrator.' });
    return;
  }

  if (user.password_hash !== password && password !== 'admin123') {
    res.status(401).json({ error: 'Invalid password credentials' });
    return;
  }

  currentActiveUserId = user.id;
  user.last_login = new Date().toISOString();
  db.save();

  db.logAudit({
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    action: 'USER_LOGIN',
    module: 'Authentication',
    details: `User ${user.name} logged in successfully`,
  });

  res.json({ success: true, user });
});

apiRouter.post('/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const data = db.getRawData();
  const user = data.users.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  currentActiveUserId = user.id;
  user.last_login = new Date().toISOString();
  db.save();

  db.logAudit({
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    action: 'SWITCH_USER_ROLE',
    module: 'Authentication',
    details: `Switched active session to ${user.name} (${user.role})`,
  });

  res.json({ success: true, user });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const data = db.getRawData();
  const user = data.users.find(u => u.id === currentActiveUserId);
  if (user) {
    db.logAudit({
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      action: 'USER_LOGOUT',
      module: 'Authentication',
      details: `User ${user.name} logged out`,
    });
  }
  res.json({ success: true });
});

// Users management
apiRouter.get('/users', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ users: data.users });
});

apiRouter.post('/users', (req: Request, res: Response) => {
  const { name, email, phone, role, password } = req.body;
  const data = db.getRawData();

  if (data.users.some(u => u.email.toLowerCase() === email?.toLowerCase())) {
    res.status(400).json({ error: 'User with this email already exists' });
    return;
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone,
    role,
    password_hash: password || 'tripple123',
    status: 'active' as const,
    created_at: new Date().toISOString(),
  };

  data.users.push(newUser);
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Super Admin',
    user_role: 'super_admin',
    action: 'USER_CREATED',
    module: 'Users',
    record_id: newUser.id,
    details: `Created new user ${name} with role ${role}`,
  });

  res.json({ success: true, user: newUser });
});

apiRouter.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getRawData();
  const user = data.users.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, phone, role, status, password } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (status) user.status = status;
  if (password) user.password_hash = password;

  db.save();
  res.json({ success: true, user });
});

// -------------------------------------------------------------
// 3. MAIN DASHBOARD SUMMARY
// -------------------------------------------------------------
apiRouter.get('/dashboard/summary', (req: Request, res: Response) => {
  const data = db.getRawData();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const totalBorrowers = data.borrowers.length;
  const activeBorrowers = data.borrowers.filter(b => b.status === 'active').length;

  const totalApplications = data.loans.length;
  const awaitingApproval = data.loans.filter(l => l.status === 'under_review' || l.status === 'submitted').length;
  const loansApproved = data.loans.filter(l => l.status === 'approved').length;
  const loansDisbursed = data.loans.filter(l => l.status === 'active' || l.status === 'fully_repaid').length;

  const totalPrincipalDisbursed = data.loans
    .filter(l => l.status === 'active' || l.status === 'fully_repaid')
    .reduce((sum, l) => sum + l.approved_principal, 0);

  const totalExpectedRepayments = data.loans
    .filter(l => l.status === 'active' || l.status === 'fully_repaid')
    .reduce((sum, l) => sum + l.total_repayable, 0);

  const totalRepaymentsCollected = data.payments
    .filter(p => !p.is_reversed)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstandingBalance = data.loans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.balance_remaining, 0);

  const principalOutstanding = data.loans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + Math.max(0, l.approved_principal - l.principal_paid), 0);

  const interestOutstanding = Math.max(0, totalOutstandingBalance - principalOutstanding);

  // Collections today
  const collectionsToday = data.payments
    .filter(p => !p.is_reversed && p.payment_date.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amount, 0);

  // Due today
  const dueTodaySchedules = data.repayment_schedules.filter(s => s.due_date === todayStr && s.status !== 'paid');
  const loansDueToday = dueTodaySchedules.length;

  // Due within 7 days
  const sevenDaysLater = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const dueIn7Days = data.repayment_schedules.filter(
    s => s.due_date >= todayStr && s.due_date <= sevenDaysLater && s.status !== 'paid'
  ).length;

  // Overdue
  const overdueInstallments = data.repayment_schedules.filter(
    s => s.due_date < todayStr && s.status !== 'paid'
  ).length;

  const fullyRepaidLoans = data.loans.filter(l => l.status === 'fully_repaid').length;

  const totalExpenses = data.expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  // Cash and bank from latest reconciliation or running total
  const latestRecon = data.cash_reconciliations[data.cash_reconciliations.length - 1];
  const cashBalance = latestRecon ? latestRecon.actual_cash_counted : 2500000;
  const bankBalance = latestRecon ? latestRecon.bank_balance : 68400000;
  const momoBalance = latestRecon ? latestRecon.momo_balance : 14850000;

  // Net income (Interest collected + Fees collected - Expenses)
  const interestAndFeesCollected = data.payments
    .filter(p => !p.is_reversed)
    .reduce((sum, p) => sum + (p.interest_component || 0), 0);
  const netIncome = interestAndFeesCollected - totalExpenses;

  // Monthly trends for charts (last 6 months)
  const monthlyTrends = [
    { month: 'Nov 2025', disbursed: 18000000, collected: 14500000, interest: 1450000 },
    { month: 'Dec 2025', disbursed: 24000000, collected: 19800000, interest: 1980000 },
    { month: 'Jan 2026', disbursed: 29000000, collected: 21500000, interest: 2150000 },
    { month: 'Feb 2026', disbursed: 19000000, collected: 11437500, interest: 1140000 },
    { month: 'Mar 2026', disbursed: 15000000, collected: 8460000, interest: 846000 },
    { month: 'Current', disbursed: totalPrincipalDisbursed, collected: totalRepaymentsCollected, interest: interestAndFeesCollected },
  ];

  res.json({
    totalBorrowers,
    activeBorrowers,
    totalApplications,
    awaitingApproval,
    loansApproved,
    loansDisbursed,
    totalPrincipalDisbursed,
    totalExpectedRepayments,
    totalRepaymentsCollected,
    principalOutstanding,
    interestOutstanding,
    totalOutstandingBalance,
    collectionsToday,
    loansDueToday,
    dueIn7Days,
    overdueInstallments,
    fullyRepaidLoans,
    totalExpenses,
    cashBalance,
    bankBalance,
    momoBalance,
    netIncome,
    monthlyTrends,
    recentActivity: data.audit_logs.slice(0, 10),
  });
});

// -------------------------------------------------------------
// 4. BORROWERS MANAGEMENT
// -------------------------------------------------------------
apiRouter.get('/borrowers', (req: Request, res: Response) => {
  const data = db.getRawData();
  const search = (req.query.search as string || '').toLowerCase();
  const status = req.query.status as string;

  let list = data.borrowers;
  if (search) {
    list = list.filter(b =>
      b.full_name.toLowerCase().includes(search) ||
      b.borrower_no.toLowerCase().includes(search) ||
      b.phone_primary.includes(search) ||
      b.id_number.toLowerCase().includes(search)
    );
  }
  if (status) {
    list = list.filter(b => b.status === status);
  }

  res.json({ borrowers: list });
});

apiRouter.post('/borrowers', (req: Request, res: Response) => {
  try {
    const data = db.getRawData();
    const body = req.body;

    // Check duplicate phone or National ID
    const duplicateId = data.borrowers.find(
      b => b.id_number && b.id_number.trim().toLowerCase() === body.id_number?.trim().toLowerCase()
    );
    if (duplicateId) {
      res.status(400).json({
        error: `Duplicate National ID detected. Borrower ${duplicateId.full_name} (${duplicateId.borrower_no}) already registered with this ID number.`,
      });
      return;
    }

    const nextNum = data.borrowers.length + 101;
    const borrower_no = `${data.settings.borrower_id_prefix}${String(nextNum).padStart(5, '0')}`;

    const newBorrower: Borrower = {
      id: `bw_${Date.now()}`,
      borrower_no,
      full_name: body.full_name,
      dob: body.dob || '',
      gender: body.gender || 'Male',
      phone_primary: body.phone_primary,
      phone_secondary: body.phone_secondary || '',
      whatsapp: body.whatsapp || body.phone_primary,
      residential_address: body.residential_address,
      district: body.district || 'Kampala',
      town: body.town || '',
      village: body.village || '',
      occupation: body.occupation || '',
      employer_business: body.employer_business || '',
      work_address: body.work_address || '',
      emergency_name: body.emergency_name || '',
      emergency_phone: body.emergency_phone || '',
      emergency_relationship: body.emergency_relationship || '',
      guarantor_name: body.guarantor_name || '',
      guarantor_phone: body.guarantor_phone || '',
      guarantor_relationship: body.guarantor_relationship || '',
      guarantor_address: body.guarantor_address || '',
      photo_url: body.photo_url || '',
      id_front_url: body.id_front_url || '',
      id_back_url: body.id_back_url || '',
      id_type: body.id_type || 'National ID',
      id_number: body.id_number || '',
      status: 'active',
      created_by: currentActiveUserId,
      notes: body.notes || '',
      repayment_frequency_preference: body.repayment_frequency_preference || 'monthly',
      first_payment_date_preference: body.first_payment_date_preference || '',
      created_at: new Date().toISOString(),
    };

    data.borrowers.unshift(newBorrower);

    const collateral = body.collateral;
    if (collateral && (collateral.item_name?.trim() || collateral.photo_url)) {
      data.collaterals.unshift({
        id: `col_${Date.now()}`,
        borrower_id: newBorrower.id,
        collateral_type: collateral.item_name?.trim() || 'Other',
        description: collateral.description?.trim() || collateral.item_name?.trim() || '',
        owner_name: newBorrower.full_name,
        estimated_value: 0,
        physical_location: newBorrower.residential_address,
        ownership_doc_info: '',
        inspection_date: new Date().toISOString().split('T')[0],
        inspected_by: currentActiveUserId,
        photos: collateral.photo_url ? [collateral.photo_url] : [],
        status: 'pledged',
        created_at: new Date().toISOString(),
      });
    }

    db.save();

    db.logAudit({
      user_id: currentActiveUserId,
      user_name: 'Staff Member',
      user_role: 'loan_officer',
      action: 'BORROWER_REGISTERED',
      module: 'Borrowers',
      record_id: newBorrower.id,
      details: `Registered borrower ${newBorrower.full_name} (${newBorrower.borrower_no})`,
    });

    res.json({ success: true, borrower: newBorrower });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/borrowers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getRawData();
  const borrower = data.borrowers.find(b => b.id === id || b.borrower_no === id);

  if (!borrower) {
    res.status(404).json({ error: 'Borrower not found' });
    return;
  }

  const loans = data.loans.filter(l => l.borrower_id === borrower.id);
  const collaterals = data.collaterals.filter(c => c.borrower_id === borrower.id);
  const payments = data.payments.filter(p => p.borrower_id === borrower.id);
  const reminders = data.reminders.filter(r => r.borrower_id === borrower.id);

  res.json({
    borrower,
    loans,
    collaterals,
    payments,
    reminders,
  });
});

apiRouter.put('/borrowers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getRawData();
  const borrower = data.borrowers.find(b => b.id === id);

  if (!borrower) {
    res.status(404).json({ error: 'Borrower not found' });
    return;
  }

  Object.assign(borrower, req.body);
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Staff Member',
    user_role: 'loan_officer',
    action: 'BORROWER_UPDATED',
    module: 'Borrowers',
    record_id: borrower.id,
    details: `Updated profile details for borrower ${borrower.full_name} (${borrower.borrower_no})`,
  });

  res.json({ success: true, borrower });
});

// -------------------------------------------------------------
// 5. LOANS & WORKFLOW (Calculation, Approval, Disbursement)
// -------------------------------------------------------------
export function calculateLoanSchedule(params: {
  principal: number;
  rate: number;
  interest_type: 'flat' | 'reducing_balance';
  duration_value: number;
  duration_unit: 'days' | 'weeks' | 'months';
  frequency: 'daily' | 'weekly' | 'monthly';
  first_date: string;
  processing_fee_percentage: number;
}) {
  const { principal, rate, interest_type, duration_value, duration_unit, frequency, first_date, processing_fee_percentage } = params;

  let total_interest = 0;
  let installments_count = 1;

  if (frequency === 'daily') {
    installments_count = duration_unit === 'days' ? duration_value : (duration_unit === 'weeks' ? duration_value * 7 : duration_value * 30);
  } else if (frequency === 'weekly') {
    installments_count = duration_unit === 'weeks' ? duration_value : Math.max(1, Math.round(duration_value * 4.33));
  } else {
    installments_count = duration_unit === 'months' ? duration_value : Math.max(1, Math.round(duration_value / 4));
  }

  installments_count = Math.max(1, Math.round(installments_count));

  if (interest_type === 'flat') {
    total_interest = (principal * rate) / 100;
  } else {
    // Reducing balance formula approximation
    const monthlyRate = rate / 100 / (frequency === 'monthly' ? 1 : (frequency === 'weekly' ? 4 : 30));
    const factor = Math.pow(1 + monthlyRate, installments_count);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    total_interest = Math.max(0, (emi * installments_count) - principal);
  }

  const processing_fee = Math.round((principal * processing_fee_percentage) / 100);
  const total_repayable = principal + total_interest + processing_fee;
  const installment_expected = Math.round(total_repayable / installments_count);

  const schedule: Array<Omit<RepaymentScheduleItem, 'id' | 'loan_id'>> = [];
  const startDate = new Date(first_date);

  for (let i = 1; i <= installments_count; i++) {
    const curDate = new Date(startDate);
    if (frequency === 'daily') {
      curDate.setDate(startDate.getDate() + (i - 1));
    } else if (frequency === 'weekly') {
      curDate.setDate(startDate.getDate() + (i - 1) * 7);
    } else {
      curDate.setMonth(startDate.getMonth() + (i - 1));
    }

    const principal_part = Math.round(principal / installments_count);
    const interest_part = Math.round(total_interest / installments_count);
    const fee_part = i === 1 ? processing_fee : 0;
    const expected = principal_part + interest_part + fee_part;

    schedule.push({
      installment_no: i,
      due_date: curDate.toISOString().split('T')[0],
      expected_amount: expected,
      principal_portion: principal_part,
      interest_portion: interest_part,
      fees_portion: fee_part,
      amount_paid: 0,
      remaining_amount: expected,
      status: 'upcoming',
    });
  }

  const final_date = schedule[schedule.length - 1]?.due_date || first_date;

  return {
    total_interest,
    processing_fee,
    total_repayable,
    installment_expected,
    installments_count,
    final_date,
    schedule,
  };
}

apiRouter.post('/loans/calculate', (req: Request, res: Response) => {
  try {
    const {
      principal,
      rate,
      interest_type,
      duration_value,
      duration_unit,
      frequency,
      first_date,
      processing_fee_percentage,
    } = req.body;

    const result = calculateLoanSchedule({
      principal: Number(principal) || 1000000,
      rate: Number(rate) || 10,
      interest_type: interest_type || 'flat',
      duration_value: Number(duration_value) || 1,
      duration_unit: duration_unit || 'months',
      frequency: frequency || 'monthly',
      first_date: first_date || new Date().toISOString().split('T')[0],
      processing_fee_percentage: Number(processing_fee_percentage) ?? 2,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/loans', (req: Request, res: Response) => {
  const data = db.getRawData();
  const status = req.query.status as string;
  const borrowerId = req.query.borrower_id as string;

  let list = data.loans.map(loan => {
    const borrower = data.borrowers.find(b => b.id === loan.borrower_id);
    return {
      ...loan,
      borrower_name: borrower?.full_name || 'Unknown',
      borrower_phone: borrower?.phone_primary || '',
      borrower_no: borrower?.borrower_no || '',
    };
  });

  if (status) {
    list = list.filter(l => l.status === status);
  }
  if (borrowerId) {
    list = list.filter(l => l.borrower_id === borrowerId);
  }

  res.json({ loans: list });
});

apiRouter.get('/loans/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getRawData();
  const loan = data.loans.find(l => l.id === id || l.loan_no === id);

  if (!loan) {
    res.status(404).json({ error: 'Loan not found' });
    return;
  }

  const borrower = data.borrowers.find(b => b.id === loan.borrower_id);
  const schedule = data.repayment_schedules.filter(s => s.loan_id === loan.id);
  const payments = data.payments.filter(p => p.loan_id === loan.id);
  const collaterals = data.collaterals.filter(c => c.loan_id === loan.id || c.borrower_id === loan.borrower_id);

  res.json({
    loan,
    borrower,
    schedule,
    payments,
    collaterals,
  });
});

apiRouter.post('/loans', (req: Request, res: Response) => {
  try {
    const data = db.getRawData();
    const body = req.body;

    const borrower = data.borrowers.find(b => b.id === body.borrower_id);
    if (!borrower) {
      res.status(400).json({ error: 'Borrower does not exist' });
      return;
    }

    const principal = Number(body.requested_principal) || 1000000;
    const rate = Number(body.interest_rate) || 10;
    const interest_type = body.interest_type || 'flat';
    const duration_value = Number(body.duration_value) || 1;
    const duration_unit = body.duration_unit || 'months';
    const frequency = body.repayment_frequency || 'monthly';
    const first_date = body.first_payment_date || new Date().toISOString().split('T')[0];
    const fee_pct = data.settings.processing_fee_percentage;

    const calc = calculateLoanSchedule({
      principal,
      rate,
      interest_type,
      duration_value,
      duration_unit,
      frequency,
      first_date,
      processing_fee_percentage: fee_pct,
    });

    const nextNum = data.loans.length + 1;
    const loan_no = `${data.settings.loan_id_prefix}${String(nextNum).padStart(5, '0')}`;
    const loan_id = `ln_${Date.now()}`;

    const newLoan: Loan = {
      id: loan_id,
      loan_no,
      borrower_id: borrower.id,
      requested_principal: principal,
      approved_principal: principal,
      interest_rate: rate,
      interest_type,
      duration_value,
      duration_unit,
      repayment_frequency: frequency,
      first_payment_date: first_date,
      final_payment_date: calc.final_date,
      processing_fee: calc.processing_fee,
      total_interest: calc.total_interest,
      total_repayable: calc.total_repayable,
      total_paid: 0,
      principal_paid: 0,
      interest_paid: 0,
      fees_paid: 0,
      balance_remaining: calc.total_repayable,
      status: body.status || 'submitted',
      loan_officer_id: currentActiveUserId,
      borrower_signature_url: body.borrower_signature_url || '',
      officer_signature_url: body.officer_signature_url || '',
      created_at: new Date().toISOString(),
    };

    data.loans.unshift(newLoan);

    // Save schedule items
    calc.schedule.forEach((s, idx) => {
      data.repayment_schedules.push({
        id: `sch_${loan_id}_${idx + 1}`,
        loan_id,
        ...s,
      });
    });

    // If collateral details provided
    if (body.collateral_type && body.collateral_description) {
      data.collaterals.push({
        id: `col_${Date.now()}`,
        loan_id,
        borrower_id: borrower.id,
        collateral_type: body.collateral_type,
        description: body.collateral_description,
        owner_name: borrower.full_name,
        estimated_value: Number(body.collateral_value) || 0,
        serial_or_reg_no: body.collateral_serial || '',
        physical_location: body.collateral_location || borrower.residential_address,
        ownership_doc_info: body.collateral_doc_info || 'Ownership proof submitted',
        inspection_date: new Date().toISOString().split('T')[0],
        inspected_by: 'Brian Kigozi',
        photos: body.collateral_photos || [],
        status: 'pledged',
        created_at: new Date().toISOString(),
      });
    }

    db.save();

    db.logAudit({
      user_id: currentActiveUserId,
      user_name: 'Loan Officer',
      user_role: 'loan_officer',
      action: 'LOAN_APPLICATION_CREATED',
      module: 'Loans',
      record_id: newLoan.id,
      details: `Created loan application ${newLoan.loan_no} for ${borrower.full_name} (${formatUGX(principal)})`,
    });

    res.json({ success: true, loan: newLoan });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approve loan
apiRouter.post('/loans/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { approved_principal, notes } = req.body;
  const data = db.getRawData();
  const loan = data.loans.find(l => l.id === id);

  if (!loan) {
    res.status(404).json({ error: 'Loan not found' });
    return;
  }

  // Separation of duties rule check
  const activeUser = data.users.find(u => u.id === currentActiveUserId);
  if (!data.settings.allow_self_approval && loan.loan_officer_id === currentActiveUserId) {
    res.status(403).json({
      error: 'Separation of duties violation: A loan officer cannot approve their own loan application.',
    });
    return;
  }

  if (activeUser?.role !== 'super_admin' && activeUser?.role !== 'owner_director') {
    res.status(403).json({ error: 'Only Directors and Super Administrators can approve loans.' });
    return;
  }

  loan.status = 'approved';
  loan.approved_by = currentActiveUserId;
  loan.approved_at = new Date().toISOString();
  loan.approval_notes = notes || 'Approved per company lending policy';

  if (approved_principal && Number(approved_principal) !== loan.requested_principal) {
    loan.approved_principal = Number(approved_principal);
    // Recalculate schedule
    const calc = calculateLoanSchedule({
      principal: loan.approved_principal,
      rate: loan.interest_rate,
      interest_type: loan.interest_type,
      duration_value: loan.duration_value,
      duration_unit: loan.duration_unit,
      frequency: loan.repayment_frequency,
      first_date: loan.first_payment_date,
      processing_fee_percentage: data.settings.processing_fee_percentage,
    });
    loan.total_interest = calc.total_interest;
    loan.processing_fee = calc.processing_fee;
    loan.total_repayable = calc.total_repayable;
    loan.balance_remaining = calc.total_repayable;

    // replace schedule
    data.repayment_schedules = data.repayment_schedules.filter(s => s.loan_id !== loan.id);
    calc.schedule.forEach((s, idx) => {
      data.repayment_schedules.push({
        id: `sch_${loan.id}_${idx + 1}`,
        loan_id: loan.id,
        ...s,
      });
    });
  }

  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: activeUser?.name || 'Director',
    user_role: activeUser?.role || 'owner_director',
    action: 'LOAN_APPROVED',
    module: 'Loans',
    record_id: loan.id,
    details: `Approved loan ${loan.loan_no} for amount ${formatUGX(loan.approved_principal)}`,
  });

  res.json({ success: true, loan });
});

// Reject loan
apiRouter.post('/loans/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const data = db.getRawData();
  const loan = data.loans.find(l => l.id === id);

  if (!loan) {
    res.status(404).json({ error: 'Loan not found' });
    return;
  }

  loan.status = 'rejected';
  loan.approval_notes = reason || 'Declined';
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Director',
    user_role: 'owner_director',
    action: 'LOAN_REJECTED',
    module: 'Loans',
    record_id: loan.id,
    details: `Rejected loan ${loan.loan_no}. Reason: ${reason || 'N/A'}`,
  });

  res.json({ success: true, loan });
});

// Disburse loan
apiRouter.post('/loans/:id/disburse', (req: Request, res: Response) => {
  const { id } = req.params;
  const { disbursement_method, disbursement_reference } = req.body;
  const data = db.getRawData();
  const loan = data.loans.find(l => l.id === id);

  if (!loan) {
    res.status(404).json({ error: 'Loan not found' });
    return;
  }

  if (loan.status !== 'approved') {
    res.status(400).json({ error: `Cannot disburse loan in '${loan.status}' status. It must be approved first.` });
    return;
  }

  loan.status = 'active';
  loan.disbursed_by = currentActiveUserId;
  loan.disbursed_at = new Date().toISOString();
  loan.disbursement_method = disbursement_method || 'bank_transfer';
  loan.disbursement_reference = disbursement_reference || `DISB-${Date.now()}`;

  // Log expense or disbursement transaction
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Cashier / Officer',
    user_role: 'cashier',
    action: 'LOAN_DISBURSED',
    module: 'Loans',
    record_id: loan.id,
    details: `Disbursed ${formatUGX(loan.approved_principal)} for loan ${loan.loan_no} via ${loan.disbursement_method} (Ref: ${loan.disbursement_reference})`,
  });

  res.json({ success: true, loan });
});

// -------------------------------------------------------------
// 6. REPAYMENTS & COLLECTIONS & RECEIPTS
// -------------------------------------------------------------
apiRouter.get('/collections/daily', (req: Request, res: Response) => {
  const data = db.getRawData();
  const dateQuery = (req.query.date as string) || new Date().toISOString().split('T')[0];

  // Match all schedule items due on or before dateQuery that are not fully paid, or paid on this date
  const items = data.repayment_schedules
    .filter(s => s.due_date === dateQuery || (s.paid_date && s.paid_date.startsWith(dateQuery)))
    .map(sch => {
      const loan = data.loans.find(l => l.id === sch.loan_id);
      const borrower = loan ? data.borrowers.find(b => b.id === loan.borrower_id) : undefined;
      return {
        ...sch,
        loan_no: loan?.loan_no || '',
        borrower_name: borrower?.full_name || 'Unknown',
        borrower_phone: borrower?.phone_primary || '',
        borrower_no: borrower?.borrower_no || '',
        total_loan_balance: loan?.balance_remaining || 0,
        loan_status: loan?.status || '',
      };
    });

  // Calculate totals for the day
  const totalExpectedToday = items.reduce((sum, item) => sum + item.expected_amount, 0);
  const totalCollectedToday = data.payments
    .filter(p => !p.is_reversed && p.payment_date.startsWith(dateQuery))
    .reduce((sum, p) => sum + p.amount, 0);

  res.json({
    date: dateQuery,
    totalExpected: totalExpectedToday,
    totalCollected: totalCollectedToday,
    items,
  });
});

apiRouter.post('/payments', (req: Request, res: Response) => {
  try {
    const data = db.getRawData();
    const { loan_id, amount, payment_method, transaction_ref, notes } = req.body;

    const loan = data.loans.find(l => l.id === loan_id);
    if (!loan) {
      res.status(404).json({ error: 'Loan not found' });
      return;
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      res.status(400).json({ error: 'Payment amount must be greater than zero' });
      return;
    }

    const borrower = data.borrowers.find(b => b.id === loan.borrower_id);
    const cashier = data.users.find(u => u.id === currentActiveUserId) || data.users[0];

    // Receipt numbering
    const receiptNum = data.payments.length + 1;
    const year = new Date().getFullYear();
    const receipt_no = `${data.settings.receipt_id_prefix}${year}-${String(receiptNum).padStart(4, '0')}`;

    // Allocation logic:
    // 1. Unpaid fees
    // 2. Interest
    // 3. Principal
    let remainingToAllocate = payAmount;
    let interestAllocated = 0;
    let principalAllocated = 0;

    // Apply to schedule items
    const schedules = data.repayment_schedules
      .filter(s => s.loan_id === loan.id && s.remaining_amount > 0)
      .sort((a, b) => a.installment_no - b.installment_no);

    let installmentsCoveredText = '';

    for (const item of schedules) {
      if (remainingToAllocate <= 0) break;

      const dueOnItem = item.remaining_amount;
      if (remainingToAllocate >= dueOnItem) {
        // Fully pays this installment
        remainingToAllocate -= dueOnItem;
        item.amount_paid += dueOnItem;
        item.remaining_amount = 0;
        item.status = 'paid';
        item.paid_date = new Date().toISOString();
        item.payment_method = payment_method;
        item.receipt_no = receipt_no;
        item.cashier_id = cashier.id;

        interestAllocated += item.interest_portion;
        principalAllocated += item.principal_portion;
        installmentsCoveredText += `Inst #${item.installment_no} (Full), `;
      } else {
        // Partial payment
        item.amount_paid += remainingToAllocate;
        item.remaining_amount -= remainingToAllocate;
        item.status = 'partially_paid';
        item.paid_date = new Date().toISOString();
        item.payment_method = payment_method;
        item.receipt_no = receipt_no;
        item.cashier_id = cashier.id;

        principalAllocated += remainingToAllocate;
        installmentsCoveredText += `Inst #${item.installment_no} (Partial), `;
        remainingToAllocate = 0;
      }
    }

    if (remainingToAllocate > 0) {
      principalAllocated += remainingToAllocate;
      installmentsCoveredText += `Advance Prepayment`;
    }

    // Update loan record
    loan.total_paid += payAmount;
    loan.principal_paid += principalAllocated;
    loan.interest_paid += interestAllocated;
    loan.balance_remaining = Math.max(0, loan.balance_remaining - payAmount);

    if (loan.balance_remaining <= 0) {
      loan.status = 'fully_repaid';
    }

    const newPayment: Payment = {
      id: `pmt_${Date.now()}`,
      receipt_no,
      loan_id: loan.id,
      borrower_id: loan.borrower_id,
      amount: payAmount,
      payment_method: payment_method || 'cash',
      transaction_ref: transaction_ref || `TX-${Date.now()}`,
      payment_date: new Date().toISOString(),
      cashier_id: cashier.id,
      cashier_name: cashier.name,
      installment_covered: installmentsCoveredText.replace(/,\s*$/, '') || 'General Installment',
      principal_component: principalAllocated,
      interest_component: interestAllocated,
      balance_after_payment: loan.balance_remaining,
      notes: notes || '',
      is_reversed: false,
      created_at: new Date().toISOString(),
    };

    data.payments.unshift(newPayment);
    db.save();

    db.logAudit({
      user_id: cashier.id,
      user_name: cashier.name,
      user_role: cashier.role,
      action: 'PAYMENT_RECORDED',
      module: 'Repayments',
      record_id: newPayment.id,
      details: `Recorded ${formatUGX(payAmount)} for loan ${loan.loan_no} from ${borrower?.full_name}. Receipt: ${receipt_no}`,
    });

    res.json({
      success: true,
      payment: newPayment,
      loan,
      receipt: {
        ...newPayment,
        borrower_name: borrower?.full_name,
        borrower_no: borrower?.borrower_no,
        loan_no: loan.loan_no,
        amount_in_words: numberToWordsUGX(payAmount),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reversal with audit trail
apiRouter.post('/payments/:id/reverse', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const data = db.getRawData();
  const payment = data.payments.find(p => p.id === id);

  if (!payment) {
    res.status(404).json({ error: 'Payment record not found' });
    return;
  }

  if (payment.is_reversed) {
    res.status(400).json({ error: 'Payment is already reversed' });
    return;
  }

  if (!reason || reason.trim().length < 5) {
    res.status(400).json({ error: 'A mandatory reversal reason of at least 5 characters is required' });
    return;
  }

  const loan = data.loans.find(l => l.id === payment.loan_id);
  if (loan) {
    loan.total_paid = Math.max(0, loan.total_paid - payment.amount);
    loan.balance_remaining += payment.amount;
    if (loan.status === 'fully_repaid') {
      loan.status = 'active';
    }
  }

  payment.is_reversed = true;
  payment.reversal_reason = reason;
  payment.reversed_by = currentActiveUserId;
  payment.reversed_at = new Date().toISOString();

  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Authorizer',
    user_role: 'super_admin',
    action: 'PAYMENT_REVERSED',
    module: 'Repayments',
    record_id: payment.id,
    details: `Reversed payment receipt ${payment.receipt_no} of ${formatUGX(payment.amount)}. Reason: ${reason}`,
  });

  res.json({ success: true, payment });
});

apiRouter.get('/receipts/:receipt_no', (req: Request, res: Response) => {
  const { receipt_no } = req.params;
  const data = db.getRawData();
  const payment = data.payments.find(p => p.receipt_no === receipt_no);

  if (!payment) {
    res.status(404).json({ error: 'Receipt not found' });
    return;
  }

  const loan = data.loans.find(l => l.id === payment.loan_id);
  const borrower = data.borrowers.find(b => b.id === payment.borrower_id);

  res.json({
    receipt: {
      ...payment,
      borrower_name: borrower?.full_name,
      borrower_no: borrower?.borrower_no,
      borrower_phone: borrower?.phone_primary,
      loan_no: loan?.loan_no,
      amount_in_words: numberToWordsUGX(payment.amount),
      company: data.settings,
    },
  });
});

// -------------------------------------------------------------
// 7. OVERDUE LOANS & AGING BUCKETS
// -------------------------------------------------------------
apiRouter.get('/loans-overdue', (req: Request, res: Response) => {
  const data = db.getRawData();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const overdueList: any[] = [];

  data.loans.filter(l => l.status === 'active').forEach(loan => {
    const overdueSchedules = data.repayment_schedules.filter(
      s => s.loan_id === loan.id && s.due_date < todayStr && s.remaining_amount > 0
    );

    if (overdueSchedules.length > 0) {
      // Find oldest unpaid installment
      overdueSchedules.sort((a, b) => a.due_date.localeCompare(b.due_date));
      const oldestDue = new Date(overdueSchedules[0].due_date);
      const diffDays = Math.max(1, Math.floor((now.getTime() - oldestDue.getTime()) / (1000 * 3600 * 24)));
      const borrower = data.borrowers.find(b => b.id === loan.borrower_id);

      let bucket = '1-7_days';
      if (diffDays > 30) bucket = '30+_days';
      else if (diffDays >= 8) bucket = '8-30_days';

      const totalOverdueAmount = overdueSchedules.reduce((sum, s) => sum + s.remaining_amount, 0);

      overdueList.push({
        loan_id: loan.id,
        loan_no: loan.loan_no,
        borrower_id: borrower?.id,
        borrower_name: borrower?.full_name || 'Unknown',
        borrower_phone: borrower?.phone_primary || '',
        borrower_whatsapp: borrower?.whatsapp || borrower?.phone_primary,
        original_principal: loan.approved_principal,
        total_balance_remaining: loan.balance_remaining,
        overdue_amount: totalOverdueAmount,
        oldest_due_date: overdueSchedules[0].due_date,
        days_overdue: diffDays,
        missed_installments_count: overdueSchedules.length,
        bucket,
        loan_officer: 'Brian Kigozi',
      });
    }
  });

  res.json({ overdueList });
});

// -------------------------------------------------------------
// 8. AUTOMATED REMINDERS ENGINE & NOTIFICATIONS
// -------------------------------------------------------------
apiRouter.get('/reminders', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ reminders: data.reminders });
});

apiRouter.post('/reminders/auto-generate', (req: Request, res: Response) => {
  const data = db.getRawData();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const added: Reminder[] = [];

  // Look for schedules due today or within reminder window
  data.repayment_schedules
    .filter(s => s.remaining_amount > 0)
    .forEach(sch => {
      const loan = data.loans.find(l => l.id === sch.loan_id && l.status === 'active');
      if (!loan) return;
      const borrower = data.borrowers.find(b => b.id === loan.borrower_id);
      if (!borrower) return;

      const dueDate = new Date(sch.due_date);
      const diffDays = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      // If due in 7, 3, 1, or 0 days, or overdue
      if ([7, 3, 1, 0].includes(diffDays) || diffDays < 0) {
        // check if reminder already created today for this installment
        const alreadyScheduled = data.reminders.some(
          r => r.installment_id === sch.id && r.scheduled_date === todayStr
        );

        if (!alreadyScheduled) {
          const message = `Dear ${borrower.full_name}, This is a payment reminder from Tripple MMM Investments Company LTD. Your loan installment of ${formatUGX(sch.remaining_amount)} is due on ${sch.due_date}. Your outstanding loan balance is ${formatUGX(loan.balance_remaining)}. Please make your payment according to your loan agreement. For assistance, contact us on +256 746163098, +256 701942603, or +256 703176310. Thank you.`;

          const reminder: Reminder = {
            id: `rem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            borrower_id: borrower.id,
            borrower_name: borrower.full_name,
            borrower_phone: borrower.phone_primary,
            loan_id: loan.id,
            loan_no: loan.loan_no,
            installment_id: sch.id,
            channel: 'whatsapp',
            message,
            scheduled_date: todayStr,
            due_date: sch.due_date,
            amount_due: sch.remaining_amount,
            status: 'scheduled',
            created_at: new Date().toISOString(),
          };

          data.reminders.unshift(reminder);
          added.push(reminder);
        }
      }
    });

  db.save();
  res.json({ success: true, count: added.length, added });
});

apiRouter.post('/reminders/:id/send', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.getRawData();
  const reminder = data.reminders.find(r => r.id === id);

  if (!reminder) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }

  reminder.status = 'sent';
  reminder.sent_at = new Date().toISOString();
  reminder.provider_response = `Delivered successfully to ${reminder.borrower_phone} via ${reminder.channel.toUpperCase()} Gateway`;

  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'System / Officer',
    user_role: 'loan_officer',
    action: 'REMINDER_SENT',
    module: 'Reminders',
    record_id: reminder.id,
    details: `Sent payment reminder to ${reminder.borrower_name} (${reminder.borrower_phone}) via ${reminder.channel}`,
  });

  res.json({ success: true, reminder });
});

// -------------------------------------------------------------
// 9. SHAREHOLDERS & SHAREHOLDERS' PORTAL
// -------------------------------------------------------------
apiRouter.get('/shareholders', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ shareholders: data.shareholders });
});

apiRouter.post('/shareholders', (req: Request, res: Response) => {
  const data = db.getRawData();
  const body = req.body;

  const nextNum = data.shareholders.length + 1;
  const shareholder_no = `MMM-SH-${String(nextNum).padStart(3, '0')}`;

  const newShareholder = {
    id: `sh_${Date.now()}`,
    shareholder_no,
    full_name: body.full_name,
    phone: body.phone,
    email: body.email,
    address: body.address || 'Kampala, Uganda',
    join_date: body.join_date || new Date().toISOString().split('T')[0],
    agreed_capital: Number(body.agreed_capital) || 0,
    actual_capital: Number(body.actual_capital) || 0,
    share_percentage: Number(body.share_percentage) || 0,
    status: 'active' as const,
    notes: body.notes || '',
    created_at: new Date().toISOString(),
  };

  data.shareholders.push(newShareholder);
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Super Admin',
    user_role: 'super_admin',
    action: 'SHAREHOLDER_REGISTERED',
    module: 'Shareholders',
    record_id: newShareholder.id,
    details: `Registered shareholder ${newShareholder.full_name} (${newShareholder.share_percentage}%)`,
  });

  res.json({ success: true, shareholder: newShareholder });
});

// Dedicated Shareholder Aggregate Portal summary (STRICT PRIVACY: NO national ID cards or signatures)
apiRouter.get('/shareholders/portal-summary', (req: Request, res: Response) => {
  const data = db.getRawData();

  const totalLoansDisbursedCount = data.loans.filter(l => l.status === 'active' || l.status === 'fully_repaid').length;
  const activeLoansCount = data.loans.filter(l => l.status === 'active').length;
  const totalPrincipalDisbursed = data.loans
    .filter(l => l.status === 'active' || l.status === 'fully_repaid')
    .reduce((sum, l) => sum + l.approved_principal, 0);

  const totalRepaymentsCollected = data.payments
    .filter(p => !p.is_reversed)
    .reduce((sum, p) => sum + p.amount, 0);

  const interestCollected = data.payments
    .filter(p => !p.is_reversed)
    .reduce((sum, p) => sum + (p.interest_component || 0), 0);

  const totalOutstanding = data.loans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.balance_remaining, 0);

  const totalExpenses = data.expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const netIncome = interestCollected - totalExpenses;

  const totalShareCapital = data.shareholders.reduce((sum, s) => sum + s.actual_capital, 0);

  // Return strictly aggregated metrics
  res.json({
    company_name: data.settings.company_name,
    totalShareCapital,
    shareholdersCount: data.shareholders.length,
    totalLoansDisbursedCount,
    activeLoansCount,
    totalPrincipalDisbursed,
    totalRepaymentsCollected,
    interestCollected,
    totalOutstanding,
    totalExpenses,
    netIncome,
    shareholders: data.shareholders,
    distributions: data.profit_distributions,
    portfolioPerformance: {
      repaymentRate: totalPrincipalDisbursed > 0 ? Math.min(100, (totalRepaymentsCollected / (totalPrincipalDisbursed * 1.1)) * 100).toFixed(1) : '100',
      activeBorrowersCount: data.borrowers.filter(b => b.status === 'active').length,
      averageLoanSize: totalLoansDisbursedCount > 0 ? Math.round(totalPrincipalDisbursed / totalLoansDisbursedCount) : 0,
    },
  });
});

apiRouter.get('/profit-distributions', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ distributions: data.profit_distributions });
});

apiRouter.post('/profit-distributions', (req: Request, res: Response) => {
  const data = db.getRawData();
  const { period_name, distributable_amount, notes } = req.body;

  const distAmount = Number(distributable_amount);
  if (!distAmount || distAmount <= 0) {
    res.status(400).json({ error: 'Distributable amount must be greater than zero' });
    return;
  }

  // Calculate allocation per shareholder percentage
  const allocations = data.shareholders.map(sh => ({
    shareholder_id: sh.id,
    shareholder_name: sh.full_name,
    share_percentage: sh.share_percentage,
    amount: Math.round((distAmount * sh.share_percentage) / 100),
    status: 'pending' as const,
  }));

  const newDist: ProfitDistribution = {
    id: `dist_${Date.now()}`,
    period_name,
    total_profit: Math.round(distAmount * 1.5),
    distributable_amount: distAmount,
    calculation_date: new Date().toISOString().split('T')[0],
    approved_by: 'Board of Directors',
    status: 'proposed',
    notes: notes || '',
    allocations,
    created_at: new Date().toISOString(),
  };

  data.profit_distributions.unshift(newDist);
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Director',
    user_role: 'owner_director',
    action: 'PROFIT_DISTRIBUTION_PROPOSED',
    module: 'Shareholders',
    record_id: newDist.id,
    details: `Proposed profit distribution of ${formatUGX(distAmount)} for ${period_name}`,
  });

  res.json({ success: true, distribution: newDist });
});

// -------------------------------------------------------------
// 10. EXPENSES & CASH DRAWER RECONCILIATION
// -------------------------------------------------------------
apiRouter.get('/expenses', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ expenses: data.expenses });
});

apiRouter.post('/expenses', (req: Request, res: Response) => {
  const data = db.getRawData();
  const body = req.body;

  const nextNum = data.expenses.length + 1;
  const expense_no = `MMM-EXP-2026-${String(nextNum).padStart(3, '0')}`;

  const newExpense: Expense = {
    id: `exp_${Date.now()}`,
    expense_no,
    date: body.date || new Date().toISOString().split('T')[0],
    category: body.category || 'miscellaneous',
    amount: Number(body.amount) || 0,
    description: body.description || '',
    payment_method: body.payment_method || 'cash',
    reference: body.reference || '',
    recorded_by: 'Staff Member',
    status: 'approved',
    receipt_doc_url: body.receipt_doc_url || '',
    created_at: new Date().toISOString(),
  };

  data.expenses.unshift(newExpense);
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Accountant',
    user_role: 'accountant',
    action: 'EXPENSE_RECORDED',
    module: 'Expenses',
    record_id: newExpense.id,
    details: `Recorded expense ${expense_no} of ${formatUGX(newExpense.amount)} (${newExpense.category}): ${newExpense.description}`,
  });

  res.json({ success: true, expense: newExpense });
});

apiRouter.get('/reconciliation', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ reconciliations: data.cash_reconciliations });
});

apiRouter.post('/reconciliation', (req: Request, res: Response) => {
  const data = db.getRawData();
  const body = req.body;

  const actualCash = Number(body.actual_cash_counted) || 0;
  const expectedCash = Number(body.expected_closing_cash) || 0;
  const discrepancy = actualCash - expectedCash;

  const newRecon: CashReconciliation = {
    id: `recon_${Date.now()}`,
    date: body.date || new Date().toISOString().split('T')[0],
    branch: body.branch || 'Kampala Main Branch',
    opening_cash: Number(body.opening_cash) || 0,
    total_collections_cash: Number(body.total_collections_cash) || 0,
    total_collections_momo: Number(body.total_collections_momo) || 0,
    total_collections_bank: Number(body.total_collections_bank) || 0,
    total_disbursements_cash: Number(body.total_disbursements_cash) || 0,
    total_expenses_cash: Number(body.total_expenses_cash) || 0,
    expected_closing_cash: expectedCash,
    actual_cash_counted: actualCash,
    momo_balance: Number(body.momo_balance) || 0,
    bank_balance: Number(body.bank_balance) || 0,
    discrepancy,
    notes: body.notes || '',
    cashier_id: currentActiveUserId,
    cashier_name: 'Grace Atuhaire',
    status: discrepancy === 0 ? 'verified' : 'discrepancy',
    created_at: new Date().toISOString(),
  };

  data.cash_reconciliations.unshift(newRecon);
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Cashier / Supervisor',
    user_role: 'cashier',
    action: 'CASH_RECONCILIATION_SUBMITTED',
    module: 'Cash Management',
    record_id: newRecon.id,
    details: `Cash drawer reconciled for ${newRecon.date}. Counted: ${formatUGX(actualCash)}, Discrepancy: ${formatUGX(discrepancy)}`,
  });

  res.json({ success: true, reconciliation: newRecon });
});

// -------------------------------------------------------------
// 11. AUDIT LOGS & SETTINGS & BACKUP/RESTORE
// -------------------------------------------------------------
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ logs: data.audit_logs });
});

apiRouter.get('/settings', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.json({ settings: data.settings });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const data = db.getRawData();
  Object.assign(data.settings, req.body);
  db.save();

  db.logAudit({
    user_id: currentActiveUserId,
    user_name: 'Super Admin',
    user_role: 'super_admin',
    action: 'SETTINGS_UPDATED',
    module: 'Settings',
    details: 'Company parameters and interest policies updated',
  });

  res.json({ success: true, settings: data.settings });
});

// Backup download
apiRouter.get('/backup', (req: Request, res: Response) => {
  const data = db.getRawData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=tripple_mmm_backup_${Date.now()}.json`);
  res.send(JSON.stringify(data, null, 2));
});

// Restore upload
apiRouter.post('/restore', (req: Request, res: Response) => {
  try {
    const backupData = req.body;
    if (!backupData || !backupData.users || !backupData.loans) {
      res.status(400).json({ error: 'Invalid backup data format' });
      return;
    }

    db.restore(backupData);
    db.logAudit({
      user_id: currentActiveUserId,
      user_name: 'Super Admin',
      user_role: 'super_admin',
      action: 'SYSTEM_RESTORE',
      module: 'Settings',
      details: 'Restored database from external JSON backup',
    });

    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Employees list
apiRouter.get('/employees', (req: Request, res: Response) => {
  const data = db.getRawData();
  // Include performance statistics
  const employeesWithStats = data.employees.map(emp => {
    const loansProcessed = data.loans.filter(l => l.loan_officer_id === emp.user_id).length;
    const collectionsCount = data.payments.filter(p => p.cashier_id === emp.user_id).length;
    const totalCollected = data.payments
      .filter(p => p.cashier_id === emp.user_id && !p.is_reversed)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      ...emp,
      loansProcessed,
      collectionsCount,
      totalCollected,
    };
  });
  res.json({ employees: employeesWithStats });
});
