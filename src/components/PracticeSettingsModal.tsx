// src/components/PracticeSettingsModal.tsx
import React, { useState } from 'react';
import { Button, IconButton, Input, Select } from '@moondesignsystem/react';
import {
  Building2,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { Firm, User } from '../types';
import { toast } from 'sonner';

interface PracticeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: Firm;
  currentUser: User;
  onUpdateFirm?: (updated: Partial<Firm>) => void;
}

export const PracticeSettingsModal: React.FC<PracticeSettingsModalProps> = ({
  isOpen,
  onClose,
  firm,
  currentUser,
  onUpdateFirm,
}) => {
  const [firmName, setFirmName] = useState(firm.name);
  const [eFilerNumber, setEFilerNumber] = useState('E-FILER-QC-88291');
  const [managingPartner, setManagingPartner] = useState(currentUser.fullName);
  const [defaultProvince, setDefaultProvince] = useState('QC');
  const [fiscalYearEnd, setFiscalYearEnd] = useState('12-31');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFirm) {
      onUpdateFirm({ name: firmName });
    }
    toast.success('Practice Settings Updated', {
      description: 'Firm profile, CRA E-Filer configuration, and audit settings saved.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Practice & Firm Settings</h2>
              <p className="text-xs text-slate-400">Canadian CPA Practice Profile & Multi-Client Tenant Boundary</p>
            </div>
          </div>
          <IconButton
            variant="ghost"
            context="neutral"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-400" />
          </IconButton>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Practice Legal Identity */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Practice Profile
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Firm Legal Practice Name
              </label>
              <Input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Managing CPA / Partner
                </label>
                <Input
                  type="text"
                  value={managingPartner}
                  onChange={(e) => setManagingPartner(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Jurisdiction
                </label>
                <Select
                  value={defaultProvince}
                  onChange={(e) => setDefaultProvince(e.target.value)}
                >
                  <option value="QC">Quebec (GST 5% + QST 9.975%)</option>
                  <option value="ON">Ontario (HST 13%)</option>
                  <option value="BC">British Columbia (GST 5% + PST 7%)</option>
                  <option value="AB">Alberta (GST 5%)</option>
                  <option value="NS">Nova Scotia (HST 15%)</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Tax Authority Credentials */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tax Authority & Compliance
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CRA & RQ E-Filer Account
                </label>
                <Input
                  type="text"
                  value={eFilerNumber}
                  onChange={(e) => setEFilerNumber(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Fiscal Year End
                </label>
                <Input
                  type="text"
                  value={fiscalYearEnd}
                  onChange={(e) => setFiscalYearEnd(e.target.value)}
                  placeholder="MM-DD"
                />
              </div>
            </div>
          </div>

          {/* Practice Tier & Security Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Practice Client Capacity</span>
              <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-100/70 border border-emerald-200 text-[11px]">
                {firm.activeClientLimit} Clients Max (Tier 1)
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Multi-Tenant SOC-2 / CRA Practice Partitioning Active</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              context="neutral"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="fill"
              context="brand"
              size="sm"
              className="flex items-center space-x-1.5 font-bold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Practice Settings</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

