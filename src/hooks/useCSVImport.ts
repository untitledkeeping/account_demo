import { useState, useMemo, useCallback, type ChangeEvent, type DragEvent } from 'react';
import {
  ChartOfAccount,
  ClientBusiness,
  JournalEntry,
  User,
} from '../types';
import {
  parseCSVText,
  convertCSVToLedgerEntries,
  SAMPLE_QBO_CSV,
  SAMPLE_WAVE_CSV,
  SAMPLE_BANK_CSV,
  ParsedCSVResult,
} from '../utils/csvParser';

export interface UseCSVImportProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  currentUser?: User;
  onBatchImportEntries: (entries: Partial<JournalEntry>[]) => void;
}

export function useCSVImport({
  client,
  accounts,
  currentUser,
  onBatchImportEntries,
}: UseCSVImportProps) {
  const [csvText, setCsvText] = useState<string>(SAMPLE_QBO_CSV);
  const [fileName, setFileName] = useState<string>('qbo_general_ledger_export.csv');
  const [parsedResult, setParsedResult] = useState<ParsedCSVResult | null>(() => {
    const raw = parseCSVText(SAMPLE_QBO_CSV);
    return convertCSVToLedgerEntries(raw, 'qbo_general_ledger_export.csv', client.id, accounts, client.provinceCode);
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Parse CSV text with client Chart of Accounts context
  const handleParse = useCallback(
    (text: string, name: string = fileName) => {
      setCsvText(text);
      setFileName(name);
      const raw = parseCSVText(text);
      const result = convertCSVToLedgerEntries(raw, name, client.id, accounts, client.provinceCode);
      setParsedResult(result);
      setIsSuccess(false);
    },
    [fileName, client.id, accounts, client.provinceCode]
  );

  // File Upload via input element
  const handleFileUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleParse(content, file.name);
      };
      reader.readAsText(file);
    },
    [handleParse]
  );

  // Drag and Drop File Handlers
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleParse(content, file.name);
      };
      reader.readAsText(file);
    },
    [handleParse]
  );

  // Execute Batch Import with Current User Attribution
  const handleExecuteImport = useCallback(() => {
    if (!parsedResult || parsedResult.extractedEntries.length === 0) return;

    // Stamp current user as creator for all imported entries
    const stampedEntries = parsedResult.extractedEntries.map((entry) => ({
      ...entry,
      createdBy: currentUser?.fullName || entry.createdBy || 'CSV Importer',
      postedAt: new Date().toISOString(),
    }));

    onBatchImportEntries(stampedEntries);
    setIsSuccess(true);
  }, [parsedResult, currentUser, onBatchImportEntries]);

  // Template Loaders
  const loadQBOTemplate = useCallback(() => {
    handleParse(SAMPLE_QBO_CSV, 'quickbooks_online_gl_2026.csv');
  }, [handleParse]);

  const loadWaveTemplate = useCallback(() => {
    handleParse(SAMPLE_WAVE_CSV, 'wave_accounting_export.csv');
  }, [handleParse]);

  const loadBankTemplate = useCallback(() => {
    handleParse(SAMPLE_BANK_CSV, 'desjardins_rbc_statement.csv');
  }, [handleParse]);

  // Pre-flight Batch Quality Validation
  const batchValidation = useMemo(() => {
    if (!parsedResult) {
      return { isValid: false, errors: ['No parsed data'], totalDebits: 0, totalCredits: 0, isBalanced: false };
    }

    const errors: string[] = Array.isArray(parsedResult.errors) ? [...parsedResult.errors] : [];
    let totalDebits = 0;
    let totalCredits = 0;

    (parsedResult.extractedEntries || []).forEach((entry, idx) => {
      let entryDebits = 0;
      let entryCredits = 0;

      entry.lines?.forEach((line) => {
        entryDebits += line.debit || 0;
        entryCredits += line.credit || 0;
      });

      totalDebits += entryDebits;
      totalCredits += entryCredits;

      if (Math.abs(entryDebits - entryCredits) > 0.05) {
        errors.push(`Entry #${idx + 1} (${entry.memo}) is imbalanced (Debits: $${entryDebits.toFixed(2)}, Credits: $${entryCredits.toFixed(2)})`);
      }
    });

    totalDebits = Math.round(totalDebits * 100) / 100;
    totalCredits = Math.round(totalCredits * 100) / 100;
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.05;

    return {
      isValid: errors.length === 0 && (parsedResult.extractedEntries?.length || 0) > 0,
      errors,
      warnings: Array.isArray(parsedResult.warnings) ? parsedResult.warnings : [],
      totalDebits,
      totalCredits,
      isBalanced,
    };
  }, [parsedResult]);

  return {
    csvText,
    setCsvText,
    fileName,
    parsedResult,
    isSuccess,
    isDragging,
    batchValidation,
    handleParse,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleExecuteImport,
    loadQBOTemplate,
    loadWaveTemplate,
    loadBankTemplate,
  };
}
