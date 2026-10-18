import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  PlusCircle,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';

interface LoanCalculatorProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({ onNavigate }) => {
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('10');
  const [interestType, setInterestType] = useState<'flat' | 'reducing_balance'>('flat');
  const [durationValue, setDurationValue] = useState('100');
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [firstDate, setFirstDate] = useState(new Date().toISOString().split('T')[0]);
  const [feePercentage, setFeePercentage] = useState('2');

  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCalculating(true);
    try {
      const res = await api.calculateLoan({
        principal: Number(principal),
        rate: Number(rate),
        interest_type: interestType,
        duration_value: Number(durationValue),
        duration_unit: durationUnit,
        frequency,
        first_date: firstDate,
        processing_fee_percentage: Number(feePercentage),
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  // Run calculation on initial load
  React.useEffect(() => {
    handleCalculate();
  }, [principal, rate, interestType, durationValue, durationUnit, frequency, firstDate, feePercentage]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6 text-amber-600" />
          Loan Interest &amp; Repayment Schedule Simulator
        </h1>
        <p className="text-xs text-slate-500">
          Precision financial calculation engine supporting Flat and Reducing-Balance models in UGX
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Input Parameters Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            Loan Particulars
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Principal Amount (UGX)</label>
              <input
                type="number"
                step="50000"
                min="50000"
                value={principal}
                onChange={e => setPrincipal(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-slate-900"
              />
              <div className="mt-1 flex gap-1">
                {['500000', '1000000', '3000000', '10000000'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrincipal(p)}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200"
                  >
                    {formatUGX(Number(p))}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={rate}
                  onChange={e => setRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Fee Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={feePercentage}
                  onChange={e => setFeePercentage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Interest Calculation Engine</label>
              <select
                value={interestType}
                onChange={e => setInterestType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2 font-medium"
              >
                <option value="flat">Flat Rate (Uniform Periodic Installments)</option>
                <option value="reducing_balance">Reducing Balance (Amortized Schedule)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Repayment Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2 font-medium"
              >
                <option value="daily">Daily Installments</option>
                <option value="weekly">Weekly Installments</option>
                <option value="monthly">Monthly Installments</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Facility Duration</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={durationValue}
                  onChange={e => setDurationValue(e.target.value)}
                  className="w-24 rounded-xl border border-slate-300 p-2 font-mono"
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
                value={firstDate}
                onChange={e => setFirstDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Results & Breakdown Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Repayable</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{formatUGX(result.total_repayable)}</span>
                  <span className="text-[10px] text-slate-500">Contractual sum</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-amber-600 block">Total Interest</span>
                  <span className="text-xl font-black text-amber-600 mt-1 block">{formatUGX(result.total_interest)}</span>
                  <span className="text-[10px] text-slate-500">{rate}% {interestType}</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Installment Amount</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">{formatUGX(result.installment_expected)}</span>
                  <span className="text-[10px] text-slate-500">{result.installments_count} installments</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Processing Fee</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{formatUGX(result.processing_fee)}</span>
                  <span className="text-[10px] text-slate-500">{feePercentage}% processing</span>
                </div>
              </div>

              {/* Installments Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Calculated Schedule Breakdown ({result.schedule.length} installments)
                    </h3>
                    <p className="text-[11px] text-slate-500">Maturity Date: {formatDate(result.final_date)}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('loan_applications')}
                    className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Apply Loan with These Terms
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">Expected Amount</th>
                        <th className="py-2.5 px-3">Principal Portion</th>
                        <th className="py-2.5 px-3">Interest Portion</th>
                        <th className="py-2.5 px-3">Fees Portion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.schedule.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{item.installment_no}</td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-900">{formatDate(item.due_date)}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{formatUGX(item.expected_amount)}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{formatUGX(item.principal_portion)}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{formatUGX(item.interest_portion)}</td>
                          <td className="py-2 px-3 font-mono text-slate-400">{formatUGX(item.fees_portion)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
