import React, { useState } from 'react';
import {
  Building,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ClientBusiness, ProvinceCode, Firm, BookkeepingStatus } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: Firm;
  currentClientCount: number;
  onAddClient: (newClient: Omit<ClientBusiness, 'id'>) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  firm,
  currentClientCount,
  onAddClient,
}) => {
  const [legalName, setLegalName] = useState('');
  const [operatingName, setOperatingName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [provinceCode, setProvinceCode] = useState<ProvinceCode>('QC');
  const [gstNumber, setGstNumber] = useState('');
  const [qstNumber, setQstNumber] = useState('');
  const [fiscalYearEndMonth, setFiscalYearEndMonth] = useState(12);
  const [assignedBookkeeper, setAssignedBookkeeper] = useState('Jeff Tremblay');

  if (!isOpen) return null;

  const isLimitReached = currentClientCount >= firm.activeClientLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName || isLimitReached) return;

    onAddClient({
      firmId: firm.id,
      legalName,
      operatingName: operatingName || legalName,
      businessNumber: businessNumber || '999888777 RC0001',
      provinceCode,
      gstRegistered: true,
      gstNumber: gstNumber || (businessNumber ? `${businessNumber} RT0001` : '999888777 RT0001'),
      qstRegistered: provinceCode === 'QC',
      qstNumber: provinceCode === 'QC' ? (qstNumber || '1234567890 TQ0001') : undefined,
      fiscalYearEndMonth,
      currency: 'CAD',
      status: 'Up to Date' as BookkeepingStatus,
      lastClosedMonth: '2026-06',
      assignedBookkeeper: assignedBookkeeper || 'Jeff Tremblay',
      isActive: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Provision Client Business</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adds an isolated multi-tenant client file to {firm.name}.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Firm Boundary Status */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
          isLimitReached ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Firm Boundary Capacity:</span>
          </div>
          <span className="font-bold font-mono">
            {currentClientCount} / {firm.activeClientLimit} Active Slots
          </span>
        </div>

        {isLimitReached ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
            <div className="font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Practice Client Limit Reached (15 / 15)</span>
            </div>
            <p>
              To maintain strict firm-first isolation without performance degradation, please archive an inactive client file or upgrade your practice subscription.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Legal Corporation Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Atelier Veloce Inc."
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">CRA Business No. (BN9)</label>
                <input
                  type="text"
                  placeholder="e.g. 783451290 RC0001"
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Canadian Jurisdiction</label>
                <select
                  value={provinceCode}
                  onChange={(e) => setProvinceCode(e.target.value as ProvinceCode)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="QC">Québec (GST + QST 14.975%)</option>
                  <option value="ON">Ontario (HST 13%)</option>
                  <option value="BC">British Columbia (GST + PST)</option>
                  <option value="AB">Alberta (GST 5%)</option>
                  <option value="NS">Nova Scotia (HST 15%)</option>
                </select>
              </div>
            </div>

            {provinceCode === 'QC' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Revenu Québec QST Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1098765432 TQ0001"
                  value={qstNumber}
                  onChange={(e) => setQstNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Fiscal Year-End Month</label>
                <select
                  value={fiscalYearEndMonth}
                  onChange={(e) => setFiscalYearEndMonth(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value={12}>December 31</option>
                  <option value={3}>March 31</option>
                  <option value={6}>June 30</option>
                  <option value={9}>September 30</option>
                  <option value={10}>October 31</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Currency</label>
                <input
                  type="text"
                  disabled
                  value="CAD ($)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Provision Client File</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
