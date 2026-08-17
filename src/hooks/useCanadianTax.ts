import { useState, useMemo, useCallback } from 'react';
import {
  ClientBusiness,
  ChartOfAccount,
  JournalEntry,
  SalesTaxSummary,
  User,
} from '../types';
import { generateSalesTaxSummary } from '../utils/ledgerEngine';

export interface UseCanadianTaxProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
  currentUser?: User;
}

export interface TaxFilingDeclaration {
  period: string;
  signedBy: string;
  role: string;
  confirmedAt: string;
  confirmationNumber: string;
  isFiled: boolean;
}

export interface TaxReadinessAudit {
  isReadyForFiling: boolean;
  warnings: string[];
  notes: string[];
  registrationCheck: {
    gstValid: boolean;
    qstValid: boolean;
  };
}

export function useCanadianTax({
  client,
  accounts,
  entries,
  currentUser,
}: UseCanadianTaxProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-Q2');
  const [isExported, setIsExported] = useState(false);
  const [filingDeclaration, setFilingDeclaration] = useState<TaxFilingDeclaration | null>(null);
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Compute live CRA and Revenu Québec sales tax summary
  const summary: SalesTaxSummary = useMemo(() => {
    return generateSalesTaxSummary(client, accounts, entries, selectedPeriod);
  }, [client, accounts, entries, selectedPeriod]);

  // Tax Readiness Audit and Registration Number validation
  const audit: TaxReadinessAudit = useMemo(() => {
    const warnings: string[] = [];
    const notes: string[] = [];

    // 1. CRA GST Number Check
    const gstPattern = /^\d{9}(RT\d{4})?$/i;
    const cleanGst = (client.gstNumber || client.businessNumber || '').replace(/[\s-]/g, '');
    const gstValid = client.gstRegistered ? gstPattern.test(cleanGst) : true;

    if (client.gstRegistered && !gstValid) {
      warnings.push(`CRA GST/HST number format is invalid (expected 9 digits or 9 digits + RT0001).`);
    }

    // 2. RQ QST Number Check (for QC businesses)
    const qstPattern = /^\d{10}(TQ\d{4})?$/i;
    const cleanQst = (client.qstNumber || '').replace(/[\s-]/g, '');
    const qstValid = client.provinceCode === 'QC' && client.qstRegistered ? qstPattern.test(cleanQst) : true;

    if (client.provinceCode === 'QC' && client.qstRegistered && !qstValid) {
      warnings.push(`Revenu Québec QST number format is invalid (expected 10 digits or 10 digits + TQ0001).`);
    }

    // 3. ITC Recovery Ratio Check
    if (summary.gst.line105GstCollected > 0 && summary.gst.line108ItcsClaimed > summary.gst.line105GstCollected * 1.5) {
      notes.push(`Input Tax Credits (ITCs) claimed exceed GST collected by >150%. A net refund of $${Math.abs(summary.gst.line109NetGstPayable).toFixed(2)} will be claimed from CRA.`);
    }

    if (summary.qst && summary.qst.line205QstCollected > 0 && summary.qst.line208ItrsClaimed > summary.qst.line205QstCollected * 1.5) {
      notes.push(`Input Tax Refunds (ITRs) claimed exceed QST collected. A net refund of $${Math.abs(summary.qst.line209NetQstPayable).toFixed(2)} will be claimed from RQ.`);
    }

    return {
      isReadyForFiling: warnings.length === 0,
      warnings,
      notes,
      registrationCheck: {
        gstValid,
        qstValid,
      },
    };
  }, [client, summary]);

  // Sign & File Tax Return under Current User Credentials
  const signAndFileReturn = useCallback(() => {
    const confirmationNum = `CRA-RQ-${client.provinceCode}-${Date.now().toString(36).toUpperCase()}`;
    const declaration: TaxFilingDeclaration = {
      period: selectedPeriod,
      signedBy: currentUser?.fullName || 'Senior Accountant',
      role: currentUser?.role.replace('_', ' ') || 'Staff Bookkeeper',
      confirmedAt: new Date().toISOString(),
      confirmationNumber: confirmationNum,
      isFiled: true,
    };

    setFilingDeclaration(declaration);
    setIsDeclarationModalOpen(false);
    setSuccessToast(`Tax return for ${selectedPeriod} certified and signed by ${declaration.signedBy}`);
    setTimeout(() => setSuccessToast(null), 4000);
  }, [selectedPeriod, currentUser, client.provinceCode]);

  // Export Worksheet Handler
  const handleExport = useCallback(() => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  }, []);

  return {
    selectedPeriod,
    setSelectedPeriod,
    summary,
    audit,
    isExported,
    handleExport,
    filingDeclaration,
    isDeclarationModalOpen,
    setIsDeclarationModalOpen,
    signAndFileReturn,
    successToast,
  };
}
