import { useMemo } from 'react';
import { ClientBusiness, ChartOfAccount, JournalEntry, BankTransaction, ReceiptDocument, CanadianProvince } from '../types';
import { useAccounting } from '../context/AccountingContext';

export interface ProvincialTaxInfo {
  provinceCode: CanadianProvince;
  hasGST: boolean;
  hasQST: boolean;
  hasHST: boolean;
  gstRate: number;
  qstRate: number;
  hstRate: number;
  combinedTaxRate: number;
  taxLabel: string;
}

export interface UseActiveClientResult {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
  transactions: BankTransaction[];
  receipts: ReceiptDocument[];
  unreconciledBankCount: number;
  pendingReceiptCount: number;
  taxInfo: ProvincialTaxInfo;
  isCurrentFiscalYear: boolean;
  isAssignedToCurrentUser: boolean;
}

export const useActiveClient = (): UseActiveClientResult => {
  const {
    activeClient,
    clientAccounts,
    clientEntries,
    clientTransactions,
    clientReceipts,
    currentUser,
  } = useAccounting();

  const taxInfo = useMemo<ProvincialTaxInfo>(() => {
    const code = activeClient.provinceCode;
    switch (code) {
      case 'QC':
        return {
          provinceCode: 'QC',
          hasGST: true,
          hasQST: true,
          hasHST: false,
          gstRate: 0.05,
          qstRate: 0.09975,
          hstRate: 0,
          combinedTaxRate: 0.14975,
          taxLabel: 'GST 5% + QST 9.975% (Québec)',
        };
      case 'ON':
        return {
          provinceCode: 'ON',
          hasGST: false,
          hasQST: false,
          hasHST: true,
          gstRate: 0,
          qstRate: 0,
          hstRate: 0.13,
          combinedTaxRate: 0.13,
          taxLabel: 'HST 13% (Ontario)',
        };
      case 'NS':
      case 'NB':
      case 'NL':
      case 'PE':
        return {
          provinceCode: code,
          hasGST: false,
          hasQST: false,
          hasHST: true,
          gstRate: 0,
          qstRate: 0,
          hstRate: 0.15,
          combinedTaxRate: 0.15,
          taxLabel: `HST 15% (${code})`,
        };
      case 'BC':
        return {
          provinceCode: 'BC',
          hasGST: true,
          hasQST: false,
          hasHST: false,
          gstRate: 0.05,
          qstRate: 0,
          hstRate: 0,
          combinedTaxRate: 0.05,
          taxLabel: 'GST 5% + PST (BC)',
        };
      default:
        return {
          provinceCode: code,
          hasGST: true,
          hasQST: false,
          hasHST: false,
          gstRate: 0.05,
          qstRate: 0,
          hstRate: 0,
          combinedTaxRate: 0.05,
          taxLabel: `GST 5% (${code})`,
        };
    }
  }, [activeClient.provinceCode]);

  const unreconciledBankCount = useMemo(() => {
    return clientTransactions.filter((tx) => !tx.isReconciled).length;
  }, [clientTransactions]);

  const pendingReceiptCount = useMemo(() => {
    return clientReceipts.filter(
      (r) => r.status === 'pending_ocr' || r.status === 'pending_review' || r.status === 'extracted'
    ).length;
  }, [clientReceipts]);

  const isAssignedToCurrentUser = useMemo(() => {
    return (
      Boolean(currentUser?.fullName) &&
      activeClient.assignedBookkeeper.toLowerCase() === currentUser.fullName.toLowerCase()
    );
  }, [activeClient.assignedBookkeeper, currentUser?.fullName]);

  return {
    client: activeClient,
    accounts: clientAccounts,
    entries: clientEntries,
    transactions: clientTransactions,
    receipts: clientReceipts,
    unreconciledBankCount,
    pendingReceiptCount,
    taxInfo,
    isCurrentFiscalYear: true,
    isAssignedToCurrentUser,
  };
};
