import React from 'react';
import { Phone, MapPin, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
      <div className="mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Tripple MMM Investments Company LTD</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="h-3 w-3 text-amber-600" /> Commercial Plaza, Plot 14 Jinja Road, Kampala
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-700">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-amber-600" /> +256 746163098
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-amber-600" /> +256 701942603
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-amber-600" /> +256 703176310
          </span>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 font-bold text-amber-700 border border-amber-500/20">
            Currency: UGX
          </span>
        </div>
      </div>
    </footer>
  );
};
