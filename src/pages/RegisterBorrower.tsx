import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  AlertCircle,
  CheckCircle2,
  Camera,
  FileCheck,
  User,
  Phone,
  Home,
  Briefcase,
  Users,
} from 'lucide-react';
import { CameraCapture } from '../components/common/CameraCapture';
import { api, formatUGX } from '../services/api';
import { Borrower } from '../types';

interface RegisterBorrowerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const RegisterBorrower: React.FC<RegisterBorrowerProps> = ({ onNavigate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBorrower, setSuccessBorrower] = useState<Borrower | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '1990-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    phone_primary: '+256 ',
    phone_secondary: '',
    whatsapp: '',
    residential_address: '',
    district: 'Kampala',
    town: '',
    village: '',
    occupation: '',
    employer_business: '',
    work_address: '',
    emergency_name: '',
    emergency_phone: '+256 ',
    emergency_relationship: '',
    guarantor_name: '',
    guarantor_phone: '+256 ',
    guarantor_relationship: '',
    guarantor_address: '',
    id_type: 'National ID' as const,
    id_number: '',
    notes: '',
    repayment_frequency_preference: 'monthly' as 'daily' | 'weekly' | 'monthly',
    first_payment_date_preference: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  // Media state
  const [photoUrl, setPhotoUrl] = useState('');
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');
  const [collateralItemName, setCollateralItemName] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [collateralPhotoUrl, setCollateralPhotoUrl] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.full_name.trim()) {
      setErrorMsg('Full legal name is required');
      return;
    }
    if (!formData.phone_primary.trim() || formData.phone_primary === '+256 ') {
      setErrorMsg('Primary telephone number is required (e.g. +256 700 000000)');
      return;
    }
    if (!formData.id_number.trim()) {
      setErrorMsg('National ID or accepted identification number is required for compliance');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Parameters<typeof api.createBorrower>[0] = {
        ...formData,
        photo_url: photoUrl,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        whatsapp: formData.whatsapp || formData.phone_primary,
        collateral: {
          item_name: collateralItemName,
          description: collateralDescription,
          photo_url: collateralPhotoUrl,
        },
      };

      const res = await api.createBorrower(payload);
      if (res.success && res.borrower) {
        setSuccessBorrower(res.borrower);
      } else {
        setErrorMsg(res.error || 'Failed to register borrower');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving borrower profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (successBorrower) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-8 shadow-md text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Borrower Successfully Registered!</h2>
        <p className="text-xs text-slate-600">
          The borrower file for <strong className="text-slate-900">{successBorrower.full_name}</strong> has been secured in the persistent database with unique ID:
        </p>
        <div className="inline-block rounded-xl bg-slate-900 px-6 py-2.5 font-mono text-base font-bold text-[#eab308]">
          {successBorrower.borrower_no}
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('borrower_profile', { id: successBorrower.id })}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
          >
            Open Dedicated Profile
          </button>
          <button
            onClick={() => onNavigate('loan_applications', { borrower_id: successBorrower.id })}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Create Loan Application
          </button>
          <button
            onClick={() => {
              setSuccessBorrower(null);
              setFormData({
                full_name: '',
                dob: '1990-01-01',
                gender: 'Male',
                phone_primary: '+256 ',
                phone_secondary: '',
                whatsapp: '',
                residential_address: '',
                district: 'Kampala',
                town: '',
                village: '',
                occupation: '',
                employer_business: '',
                work_address: '',
                emergency_name: '',
                emergency_phone: '+256 ',
                emergency_relationship: '',
                guarantor_name: '',
                guarantor_phone: '+256 ',
                guarantor_relationship: '',
                guarantor_address: '',
                id_type: 'National ID',
                id_number: '',
                notes: '',
                repayment_frequency_preference: 'monthly',
                first_payment_date_preference: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
              });
              setPhotoUrl('');
              setIdFrontUrl('');
              setIdBackUrl('');
              setCollateralItemName('');
              setCollateralDescription('');
              setCollateralPhotoUrl('');
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Register Another Borrower
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-amber-600" />
            Borrower Registration &amp; KYC Verification
          </h1>
          <p className="text-xs text-slate-500">
            Compliant with Ugandan financial regulations &amp; Data Protection laws
          </p>
        </div>
        <button
          onClick={() => onNavigate('borrowers')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          View Borrowers Registry
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-4 text-xs text-rose-800 border border-rose-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="h-4 w-4 text-amber-600" /> 1. Personal &amp; Identity Particulars
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Ronald Kato"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Identification Document Type</label>
              <select
                name="id_type"
                value={formData.id_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="National ID">National ID (NIRA NIN)</option>
                <option value="Passport">Passport</option>
                <option value="Driving Permit">Driving Permit</option>
                <option value="Voter Card">Voter Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ID / NIN Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="id_number"
                required
                value={formData.id_number}
                onChange={handleChange}
                placeholder="e.g. CM88045102ABCD"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Contact & Residential Address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Phone className="h-4 w-4 text-amber-600" /> 2. Contact Numbers &amp; Physical Residence
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Primary Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="phone_primary"
                required
                value={formData.phone_primary}
                onChange={handleChange}
                placeholder="+256 772 123456"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Alternative Phone</label>
              <input
                type="text"
                name="phone_secondary"
                value={formData.phone_secondary}
                onChange={handleChange}
                placeholder="+256 701 123456"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="For automated repayment notices"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Residential Physical Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="residential_address"
                required
                value={formData.residential_address}
                onChange={handleChange}
                placeholder="e.g. Kisaasi, Bahai Road, Zone 4"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Kampala / Wakiso / Mukono"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Town / Division</label>
              <input
                type="text"
                name="town"
                value={formData.town}
                onChange={handleChange}
                placeholder="e.g. Kawempe Division"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Village / LC1 Cell</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="e.g. Kisaasi Central LC1"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Occupation & Business Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Briefcase className="h-4 w-4 text-amber-600" /> 3. Economic Activity &amp; Business Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Occupation / Trade</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Retail Trader, Contractor, Salonist"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Business Name / Employer</label>
              <input
                type="text"
                name="employer_business"
                value={formData.employer_business}
                onChange={handleChange}
                placeholder="e.g. Kato Wholesale Mart"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Work / Business Address</label>
              <input
                type="text"
                name="work_address"
                value={formData.work_address}
                onChange={handleChange}
                placeholder="e.g. Container Village, Shop 18"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Guarantor & Emergency Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Users className="h-4 w-4 text-amber-600" /> 4. Guarantor &amp; Emergency Contact
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Guarantor Name</label>
              <input
                type="text"
                name="guarantor_name"
                value={formData.guarantor_name}
                onChange={handleChange}
                placeholder="e.g. David Ssenyonjo"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Guarantor Phone</label>
              <input
                type="text"
                name="guarantor_phone"
                value={formData.guarantor_phone}
                onChange={handleChange}
                placeholder="+256 755 123456"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Guarantor Relationship</label>
              <input
                type="text"
                name="guarantor_relationship"
                value={formData.guarantor_relationship}
                onChange={handleChange}
                placeholder="e.g. Business Partner / Uncle"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Guarantor Address</label>
              <input
                type="text"
                name="guarantor_address"
                value={formData.guarantor_address}
                onChange={handleChange}
                placeholder="e.g. Ntinda Shopping Complex"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 5: Photographs & National ID Documents (Camera & File upload) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Camera className="h-4 w-4 text-amber-600" /> 5. Borrower Photo &amp; National ID Documentation
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* 1. Borrower Photograph */}
            <CameraCapture
              label="Borrower Photograph"
              sublabel="Live webcam capture or photo upload"
              value={photoUrl}
              onChange={setPhotoUrl}
              category="borrower_photo"
              aspectRatio="square"
            />

            {/* 2. National ID Front */}
            <CameraCapture
              label="National ID Card (Front)"
              sublabel="Clear photo of front side"
              value={idFrontUrl}
              onChange={setIdFrontUrl}
              category="id_front"
              aspectRatio="card"
            />

            {/* 3. National ID Back */}
            <CameraCapture
              label="National ID Card (Back)"
              sublabel="Clear photo of barcode/signature"
              value={idBackUrl}
              onChange={setIdBackUrl}
              category="id_back"
              aspectRatio="card"
            />
          </div>
        </div>

        {/* Step 6: Collateral details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileCheck className="h-4 w-4 text-amber-600" /> 6. Collateral
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Collateral Item Name</label>
                <input
                  type="text"
                  value={collateralItemName}
                  onChange={e => setCollateralItemName(e.target.value)}
                  placeholder="e.g. Bajaj motorcycle, land title, refrigerator"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Description / Serial Number</label>
                <textarea
                  rows={3}
                  value={collateralDescription}
                  onChange={e => setCollateralDescription(e.target.value)}
                  placeholder="Add identifying details"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
            <CameraCapture
              label="Collateral Photo"
              sublabel="Take a photo or upload an image"
              value={collateralPhotoUrl}
              onChange={setCollateralPhotoUrl}
              category="collateral"
              aspectRatio="free"
            />
          </div>
        </div>

        {/* Step 7: Proposed repayment plan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileCheck className="h-4 w-4 text-amber-600" /> 7. Proposed Repayment Plan
          </h3>
          <p className="text-xs text-slate-500">These are the borrower’s preferences; final repayment dates and amounts are confirmed in the loan application.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">How often will they pay?</label>
              <select
                name="repayment_frequency_preference"
                value={formData.repayment_frequency_preference}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Preferred First Payment Date</label>
              <input
                type="date"
                name="first_payment_date_preference"
                value={formData.first_payment_date_preference}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => onNavigate('borrowers')}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
          >
            {submitting ? 'Registering & Saving Records...' : 'Complete Borrower Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};
