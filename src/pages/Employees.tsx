import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  RefreshCw,
  Award,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';
import { Employee } from '../types';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployees();
      setEmployees(res.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-amber-600" />
            Staff Directory &amp; Officer Accountability
          </h1>
          <p className="text-xs text-slate-500">
            Employee roles, branch assignments, loan processing volume, and verified collections
          </p>
        </div>

        <button
          onClick={fetchEmployees}
          className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-black text-sm">
                  {emp.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{emp.full_name}</h3>
                  <p className="text-[11px] font-semibold text-amber-600 leading-tight">{emp.role}</p>
                  <span className="font-mono text-[10px] text-slate-400">{emp.employee_no}</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                {emp.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-mono font-medium text-slate-800">{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{emp.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{emp.branch}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Hired on: {formatDate(emp.hire_date)}</span>
              </div>
            </div>

            {/* Performance Statistics */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-600" /> Accountability Metrics
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Loans Originated</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{emp.loansProcessed || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Collections Count</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{emp.collectionsCount || 0}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase block">Verified Cash Collected</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">
                    {formatUGX(emp.totalCollected || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
