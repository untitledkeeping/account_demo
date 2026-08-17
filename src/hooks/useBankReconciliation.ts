import { useState, useMemo, useCallback } from 'react';
import {
  BankTransaction,
  ChartOfAccount,
  ClientBusiness,
  TaxCode,
  User,
  JournalEntry,
  LedgerLine,
} from '../types';
import { extractTaxesFromGrossTotal } from '../utils/taxCalculator';

export interface UseBankReconciliationProps {
  client: ClientBusiness;
  transactions: BankTransaction[];
  accounts: ChartOfAccount[];
  currentUser: User;
  onReconcileTransaction: (tx: BankTransaction, accountId: string, taxCode: TaxCode) => void;
  onBatchReconcile?: (reconciledEntries: { tx: BankTransaction; accountId: string; taxCode: TaxCode }[]) => void;
}

export interface ReconciliationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useBankReconciliation({
  client,
  transactions,
  accounts,
  currentUser,
  onReconcileTransaction,
  onBatchReconcile,
}: UseBankReconciliationProps) {
  const [activeView, setActiveView] = useState<'unreconciled' | 'reconciled'>('unreconciled');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({});
  const [selectedTaxCodes, setSelectedTaxCodes] = useState<Record<string, TaxCode>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fast account lookup map
  const accountMap = useMemo(() => {
    const map = new Map<string, ChartOfAccount>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Primary Bank/Cash account (Asset)
  const bankAccount = useMemo(() => {
    return accounts.find((a) => a.classification === 'bank') || accounts[0];
  }, [accounts]);

  // Default tax code for client province
  const defaultTaxCode: TaxCode = useMemo(() => {
    if (client.provinceCode === 'QC') return 'GST_QST';
    if (['ON', 'NB', 'NL', 'NS', 'PE'].includes(client.provinceCode)) return 'HST_13';
    return 'GST_5';
  }, [client.provinceCode]);

  // Lists
  const unreconciledList = useMemo(() => {
    return transactions.filter((t) => !t.isReconciled);
  }, [transactions]);

  const reconciledList = useMemo(() => {
    return transactions.filter((t) => t.isReconciled);
  }, [transactions]);

  // Filtered list based on search and type
  const filteredUnreconciled = useMemo(() => {
    return unreconciledList.filter((tx) => {
      const matchesSearch =
        !searchTerm ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.transactionDate.includes(searchTerm) ||
        Math.abs(tx.amount).toString().includes(searchTerm);

      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'INFLOW' && tx.amount > 0) ||
        (typeFilter === 'OUTFLOW' && tx.amount < 0);

      return matchesSearch && matchesType;
    });
  }, [unreconciledList, searchTerm, typeFilter]);

  // Validation function for a single transaction reconciliation
  const validateReconciliation = useCallback(
    (tx: BankTransaction, accountId: string, taxCode: TaxCode): ReconciliationValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!tx) {
        errors.push('Transaction data is missing.');
        return { isValid: false, errors, warnings };
      }

      if (tx.isReconciled) {
        errors.push('Transaction has already been reconciled.');
      }

      const targetAccount = accountMap.get(accountId);
      if (!targetAccount) {
        errors.push('Target Chart of Accounts code must be selected.');
      } else if (!targetAccount.isActive) {
        errors.push(`Account ${targetAccount.accountCode} (${targetAccount.name}) is inactive.`);
      }

      if (targetAccount?.id === bankAccount?.id) {
        errors.push('Target account cannot be the same as the originating bank account.');
      }

      // Check tax appropriateness
      if (tx.amount > 0 && targetAccount?.type === 'expense') {
        warnings.push('Money in (deposit) is being matched against an Expense account (refund or offset).');
      }
      if (tx.amount < 0 && targetAccount?.type === 'revenue') {
        warnings.push('Money out (payment) is being matched against a Revenue account (credit note or refund).');
      }

      if (client.provinceCode === 'QC' && taxCode === 'HST_13') {
        warnings.push('Quebec business entity selected Ontario HST_13 tax code.');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [accountMap, bankAccount, client.provinceCode]
  );

  // Handle Account Selection Change
  const handleAccountChange = useCallback((txId: string, accId: string) => {
    setSelectedAccounts((prev) => ({ ...prev, [txId]: accId }));
  }, []);

  // Handle Tax Code Selection Change
  const handleTaxCodeChange = useCallback((txId: string, code: TaxCode) => {
    setSelectedTaxCodes((prev) => ({ ...prev, [txId]: code }));
  }, []);

  // Execute Single Reconciliation with User Attribution
  const executeReconcile = useCallback(
    (tx: BankTransaction) => {
      const currentAccountId = selectedAccounts[tx.id] || tx.suggestedAccountId || accounts.find((a) => a.type === 'expense')?.id || accounts[0]?.id;
      const currentTaxCode: TaxCode = selectedTaxCodes[tx.id] || tx.suggestedTaxCode || defaultTaxCode;

      const validation = validateReconciliation(tx, currentAccountId, currentTaxCode);
      if (!validation.isValid) {
        alert(`Cannot reconcile: ${validation.errors.join(', ')}`);
        return;
      }

      onReconcileTransaction(tx, currentAccountId, currentTaxCode);
      setSuccessToast(`Reconciled "${tx.description}" by ${currentUser.fullName}`);
      setTimeout(() => setSuccessToast(null), 3000);
    },
    [selectedAccounts, selectedTaxCodes, defaultTaxCode, accounts, validateReconciliation, onReconcileTransaction, currentUser]
  );

  // Auto-Match All High-Confidence Items (score >= 0.85)
  const autoReconcileHighConfidence = useCallback(() => {
    const candidates = unreconciledList.filter((tx) => (tx.confidenceScore || 0) >= 0.85);
    if (candidates.length === 0) return 0;

    candidates.forEach((tx) => {
      const accId = tx.suggestedAccountId || accounts.find((a) => a.type === 'expense')?.id || accounts[0]?.id;
      const taxCode = tx.suggestedTaxCode || defaultTaxCode;
      onReconcileTransaction(tx, accId, taxCode);
    });

    setSuccessToast(`Auto-reconciled ${candidates.length} high-confidence transactions by ${currentUser.fullName}`);
    setTimeout(() => setSuccessToast(null), 3500);
    return candidates.length;
  }, [unreconciledList, accounts, defaultTaxCode, onReconcileTransaction, currentUser]);

  // Statistics
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const reconciledCount = reconciledList.length;
    const unreconciledCount = unreconciledList.length;
    const progressPercent = totalTransactions > 0 ? Math.round((reconciledCount / totalTransactions) * 100) : 100;

    let unreconciledOutflow = 0;
    let unreconciledInflow = 0;

    unreconciledList.forEach((t) => {
      if (t.amount < 0) unreconciledOutflow += Math.abs(t.amount);
      else unreconciledInflow += t.amount;
    });

    return {
      totalTransactions,
      reconciledCount,
      unreconciledCount,
      progressPercent,
      unreconciledOutflow: Math.round(unreconciledOutflow * 100) / 100,
      unreconciledInflow: Math.round(unreconciledInflow * 100) / 100,
      highConfidenceCount: unreconciledList.filter((tx) => (tx.confidenceScore || 0) >= 0.85).length,
    };
  }, [transactions, reconciledList, unreconciledList]);

  return {
    activeView,
    setActiveView,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    selectedAccounts,
    selectedTaxCodes,
    accountMap,
    bankAccount,
    defaultTaxCode,
    unreconciledList,
    reconciledList,
    filteredUnreconciled,
    handleAccountChange,
    handleTaxCodeChange,
    validateReconciliation,
    executeReconcile,
    autoReconcileHighConfidence,
    stats,
    successToast,
  };
}
