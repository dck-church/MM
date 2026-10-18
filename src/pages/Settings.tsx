import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Database,
  Shield,
  Phone,
  Building,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { CompanySettings } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getSettings();
      setSettings(res.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup';
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Warning: Restoring from a backup will overwrite current database records. Proceed?')) {
      return;
    }

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const backupJson = JSON.parse(reader.result as string);
        const res = await api.restoreDatabase(backupJson);
        if (res.success) {
          alert('Database restored successfully from backup!');
          fetchSettings();
        }
      } catch (err: any) {
        alert('Failed to restore backup: ' + err.message);
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  if (loading || !settings) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mr-2" /> Loading configuration parameters...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-amber-600" />
          Company Settings &amp; Financial Governance
        </h1>
        <p className="text-xs text-slate-500">
          Corporate parameters, lending policies, contact numbers, and system backup management
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="h-4 w-4 text-amber-600" /> Company Corporate Identity
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Company Registered Name</label>
              <input
                type="text"
                required
                value={settings.company_name}
                onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Company Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Official Kampala Head Office Address</label>
              <input
                type="text"
                value={settings.office_address}
                onChange={e => setSettings({ ...settings, office_address: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Official Contact Phone Numbers</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {settings.official_phones.map((phone, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={phone}
                    onChange={e => {
                      const newPhones = [...settings.official_phones];
                      newPhones[idx] = e.target.value;
                      setSettings({ ...settings, official_phones: newPhones });
                    }}
                    className="rounded-xl border border-slate-300 p-2 font-mono font-semibold text-slate-900"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Policies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield className="h-4 w-4 text-amber-600" /> Lending Rates &amp; Policy Rules
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Default Flat Interest Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={settings.default_flat_rate}
                onChange={e => setSettings({ ...settings, default_flat_rate: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Reducing Balance Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={settings.default_reducing_rate}
                onChange={e => setSettings({ ...settings, default_reducing_rate: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Processing Fee Percentage (%)</label>
              <input
                type="number"
                step="0.5"
                value={settings.processing_fee_percentage}
                onChange={e => setSettings({ ...settings, processing_fee_percentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Daily Late Penalty Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.late_penalty_rate_daily}
                onChange={e => setSettings({ ...settings, late_penalty_rate_daily: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Dual Approval Threshold (UGX)</label>
              <input
                type="number"
                value={settings.require_two_approvals_above}
                onChange={e => setSettings({ ...settings, require_two_approvals_above: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Base Currency</label>
              <input
                type="text"
                disabled
                value="UGX (Ugandan Shillings)"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2 font-bold text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Backup & System Restore (Section 23) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Database className="h-4 w-4 text-amber-600" /> Database Backup &amp; System Restoration
          </h3>

          <p className="text-xs text-slate-600">
            Export a full encrypted snapshot of all borrower documents, loan schedules, receipts, and audit trail records, or restore from a previously downloaded backup.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-[#eab308] hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> Download Full Database Backup JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={restoring}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 text-blue-600" />
              {restoring ? 'Restoring Database...' : 'Restore from Backup File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleRestoreFile}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Configuration Saved Successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Changes...' : 'Save Company Policies'}
          </button>
        </div>
      </form>
    </div>
  );
};
