import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Eye,
  PlusCircle,
  Camera,
  RefreshCw,
  Building,
} from 'lucide-react';
import { api, formatUGX, formatDate } from '../services/api';
import { Collateral } from '../types';

export const CollateralPage: React.FC = () => {
  const [collaterals, setCollaterals] = useState<Collateral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCollateral = async () => {
    try {
      setLoading(true);
      const res = await api.getCollaterals();
      setCollaterals(res.collaterals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollateral();
  }, []);

  const totalPledgedValue = collaterals.reduce((sum, c) => sum + c.estimated_value, 0);

  const filtered = collaterals.filter(c =>
    c.collateral_type.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.serial_or_reg_no && c.serial_or_reg_no.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
            Collateral Security &amp; Asset Custody Management
          </h1>
          <p className="text-xs text-slate-500">
            Pledged motor vehicle logbooks, land titles, commercial chattels, and equipment custody
          </p>
        </div>

        <button
          onClick={fetchCollateral}
          className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Collateral Items Held</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{collaterals.length} assets</span>
          <span className="text-[11px] text-slate-500">{collaterals.filter(c => c.status === 'verified').length} verified &amp; sealed</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-emerald-50/60 border-emerald-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Pledged Market Value</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{formatUGX(totalPledgedValue)}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Under Tripple MMM secure custody</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Custody Safety Deposit</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block">Plot 14 Jinja Road Head Office Safe &amp; Bank Vault</span>
          <span className="text-[11px] text-slate-500">Dual custodian sign-off required</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search collateral by owner, registration number, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-4 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} assets
        </div>
      </div>

      {/* Collateral Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(col => (
          <div key={col.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{col.collateral_type}</span>
                <span className="text-[11px] text-slate-500">Owner: <strong className="text-slate-800">{col.owner_name}</strong></span>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                {col.status}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium">{col.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 uppercase text-[9px] block">Serial / Reg Number</span>
                <span className="font-mono font-bold text-slate-900">{col.serial_or_reg_no || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[9px] block">Estimated Valuation</span>
                <span className="font-mono font-bold text-emerald-700">{formatUGX(col.estimated_value)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 uppercase text-[9px] block">Custody &amp; Documentation</span>
                <span className="text-slate-700">{col.ownership_doc_info}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 uppercase text-[9px] block">Physical Location</span>
                <span className="text-slate-700">{col.physical_location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Inspected by: <strong>{col.inspected_by}</strong> ({formatDate(col.inspection_date)})</span>
              <span className="font-mono text-emerald-700 font-semibold">Legally Pledged</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
