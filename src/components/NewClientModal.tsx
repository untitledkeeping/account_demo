import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { NativeSelect } from './ui/select';
import { Button } from './ui/button';
import { Building, Check, AlertCircle } from 'lucide-react';
import { ClientBusiness, ProvinceCode, Firm, BookkeepingStatus, User } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: Firm;
  currentClientCount: number;
  currentUser?: User;
  allUsers?: User[];
  onAddClient: (newClient: Omit<ClientBusiness, 'id'>) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  firm,
  currentClientCount,
  currentUser,
  allUsers = [],
  onAddClient,
}) => {
  const [legalName, setLegalName] = useState('');
  const [operatingName, setOperatingName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [provinceCode, setProvinceCode] = useState<ProvinceCode>('QC');
  const [gstNumber, setGstNumber] = useState('');
  const [qstNumber, setQstNumber] = useState('');
  const [fiscalYearEndMonth, setFiscalYearEndMonth] = useState(12);
  const [assignedBookkeeper, setAssignedBookkeeper] = useState(currentUser?.fullName || 'Jeff Tremblay');

  useEffect(() => {
    if (currentUser?.fullName) {
      setAssignedBookkeeper(currentUser.fullName);
    }
  }, [currentUser]);

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
      assignedBookkeeper: assignedBookkeeper || currentUser?.fullName || 'Jeff Tremblay',
      isActive: true,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="space-y-4">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Provision Client Business</DialogTitle>
          <DialogDescription>
            Adds an isolated multi-tenant client file to {firm.name}.
          </DialogDescription>
        </DialogHeader>

        {/* Firm Boundary Status */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            isLimitReached ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
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
              <Input
                type="text"
                required
                placeholder="e.g. Atelier Veloce Inc."
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">CRA Business No. (BN9)</label>
                <Input
                  type="text"
                  placeholder="e.g. 783451290 RC0001"
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Canadian Jurisdiction</label>
                <NativeSelect
                  value={provinceCode}
                  onChange={(e) => setProvinceCode(e.target.value as ProvinceCode)}
                >
                  <option value="QC">Québec (GST + QST 14.975%)</option>
                  <option value="ON">Ontario (HST 13%)</option>
                  <option value="BC">British Columbia (GST + PST)</option>
                  <option value="AB">Alberta (GST 5%)</option>
                  <option value="NS">Nova Scotia (HST 15%)</option>
                </NativeSelect>
              </div>
            </div>

            {provinceCode === 'QC' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Revenu Québec QST Number</label>
                <Input
                  type="text"
                  placeholder="e.g. 1098765432 TQ0001"
                  value={qstNumber}
                  onChange={(e) => setQstNumber(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Lead Bookkeeper</label>
                <NativeSelect
                  value={assignedBookkeeper}
                  onChange={(e) => setAssignedBookkeeper(e.target.value)}
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.fullName}>
                      {u.fullName} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                  {!allUsers.some((u) => u.fullName === assignedBookkeeper) && (
                    <option value={assignedBookkeeper}>{assignedBookkeeper}</option>
                  )}
                </NativeSelect>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fiscal Year-End Month</label>
                <NativeSelect
                  value={fiscalYearEndMonth.toString()}
                  onChange={(e) => setFiscalYearEndMonth(parseInt(e.target.value))}
                >
                  <option value="12">December 31</option>
                  <option value="3">March 31</option>
                  <option value="6">June 30</option>
                  <option value="9">September 30</option>
                  <option value="10">October 31</option>
                </NativeSelect>
              </div>
            </div>

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="default"
                className="flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Provision Client File</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

