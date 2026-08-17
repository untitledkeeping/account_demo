import { useState, useMemo, useCallback, type FormEvent } from 'react';
import {
  ReceiptDocument,
  ChartOfAccount,
  ClientBusiness,
  User,
  ReceiptStatus,
  JournalEntry,
} from '../types';
import { extractTaxesFromGrossTotal } from '../utils/taxCalculator';

export interface UseReceiptOCRProps {
  client: ClientBusiness;
  receipts: ReceiptDocument[];
  accounts: ChartOfAccount[];
  currentUser?: User;
  onPostReceiptToLedger: (receipt: ReceiptDocument, targetAccountId: string) => void;
  onAddSimulatedReceipt: (vendor: string, total: number) => void;
}

export interface ReceiptTaxValidation {
  isMathematicallyValid: boolean;
  variance: number;
  hasVendor: boolean;
  hasValidDate: boolean;
  errors: string[];
  warnings: string[];
}

export function useReceiptOCR({
  client,
  receipts,
  accounts,
  currentUser,
  onPostReceiptToLedger,
  onAddSimulatedReceipt,
}: UseReceiptOCRProps) {
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(receipts[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEEDS_REVIEW' | 'POSTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [targetAccountMap, setTargetAccountMap] = useState<Record<string, string>>({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [customVendor, setCustomVendor] = useState('Costco Wholesale');
  const [customTotal, setCustomTotal] = useState('348.90');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fast account lookup
  const accountMap = useMemo(() => {
    const map = new Map<string, ChartOfAccount>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Selected receipt document
  const selectedReceipt = useMemo(() => {
    return receipts.find((r) => r.id === selectedReceiptId) || receipts[0] || null;
  }, [receipts, selectedReceiptId]);

  // Default target account for active receipt
  const currentTargetAccountId = useMemo(() => {
    if (!selectedReceipt) return accounts.find((a) => a.type === 'expense')?.id || accounts[0]?.id;
    return (
      targetAccountMap[selectedReceipt.id] ||
      selectedReceipt.suggestedAccountId ||
      accounts.find((a) => a.type === 'expense')?.id ||
      accounts[0]?.id
    );
  }, [selectedReceipt, targetAccountMap, accounts]);

  // Filtered receipts list
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        r.extractedVendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.extractedDate.includes(searchTerm) ||
        r.extractedTotal.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'NEEDS_REVIEW' && r.status !== 'posted') ||
        (statusFilter === 'POSTED' && r.status === 'posted');

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  // Validation function for active receipt
  const validateReceipt = useCallback(
    (receipt: ReceiptDocument | null, accountId: string): ReceiptTaxValidation => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!receipt) {
        return {
          isMathematicallyValid: false,
          variance: 0,
          hasVendor: false,
          hasValidDate: false,
          errors: ['No receipt selected'],
          warnings: [],
        };
      }

      const hasVendor = Boolean(receipt.extractedVendor?.trim());
      if (!hasVendor) {
        errors.push('Vendor name could not be extracted from document.');
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const hasValidDate = dateRegex.test(receipt.extractedDate);
      if (!hasValidDate) {
        errors.push('Extracted transaction date is invalid (expected YYYY-MM-DD).');
      }

      // Mathematical Tax Verification: Subtotal + GST + QST == Total
      const computedSum = receipt.extractedSubtotal + receipt.extractedGst + receipt.extractedQst;
      const variance = Math.round(Math.abs(computedSum - receipt.extractedTotal) * 100) / 100;
      const isMathematicallyValid = variance <= 0.05;

      if (!isMathematicallyValid) {
        warnings.push(
          `Tax components ($${computedSum.toFixed(2)}) differ from gross total ($${receipt.extractedTotal.toFixed(
            2
          )}) by $${variance.toFixed(2)}.`
        );
      }

      const targetAccount = accountMap.get(accountId);
      if (!targetAccount) {
        errors.push('Please select a destination Chart of Accounts code.');
      } else if (!targetAccount.isActive) {
        errors.push(`Account ${targetAccount.accountCode} is marked inactive.`);
      }

      if (receipt.status === 'posted') {
        warnings.push('This receipt has already been posted to the General Ledger.');
      }

      return {
        isMathematicallyValid,
        variance,
        hasVendor,
        hasValidDate,
        errors,
        warnings,
      };
    },
    [accountMap]
  );

  // Active validation state
  const currentValidation = useMemo(() => {
    return validateReceipt(selectedReceipt, currentTargetAccountId);
  }, [selectedReceipt, currentTargetAccountId, validateReceipt]);

  // Handle Target Account selection for active receipt
  const handleSelectTargetAccount = useCallback((receiptId: string, accId: string) => {
    setTargetAccountMap((prev) => ({ ...prev, [receiptId]: accId }));
  }, []);

  // Post to Ledger with Current User Attribution
  const handlePostReceipt = useCallback(() => {
    if (!selectedReceipt) return;
    if (currentValidation.errors.length > 0) {
      alert(`Validation error: ${currentValidation.errors.join(', ')}`);
      return;
    }

    onPostReceiptToLedger(selectedReceipt, currentTargetAccountId);
    setSuccessToast(`Posted receipt "${selectedReceipt.extractedVendor}" by ${currentUser?.fullName || 'Bookkeeper'}`);
    setTimeout(() => setSuccessToast(null), 3000);
  }, [selectedReceipt, currentValidation, onPostReceiptToLedger, currentTargetAccountId, currentUser]);

  // Handle Simulated Upload Submission
  const handleUploadSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const tot = parseFloat(customTotal) || 100;
      onAddSimulatedReceipt(customVendor, tot);
      setIsUploadOpen(false);
      setSuccessToast(`Uploaded & OCR-processed document from "${customVendor}"`);
      setTimeout(() => setSuccessToast(null), 3000);
    },
    [customTotal, customVendor, onAddSimulatedReceipt]
  );

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalGross = 0;
    let pendingCount = 0;
    let postedCount = 0;

    receipts.forEach((r) => {
      totalGross += r.extractedTotal;
      if (r.status === 'posted') postedCount++;
      else pendingCount++;
    });

    return {
      totalReceipts: receipts.length,
      pendingCount,
      postedCount,
      totalGross: Math.round(totalGross * 100) / 100,
    };
  }, [receipts]);

  return {
    selectedReceipt,
    selectedReceiptId,
    setSelectedReceiptId,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    currentTargetAccountId,
    handleSelectTargetAccount,
    filteredReceipts,
    currentValidation,
    validateReceipt,
    handlePostReceipt,
    isUploadOpen,
    setIsUploadOpen,
    customVendor,
    setCustomVendor,
    customTotal,
    setCustomTotal,
    handleUploadSubmit,
    metrics,
    accountMap,
    successToast,
  };
}
