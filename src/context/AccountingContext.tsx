import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Firm,
  User,
  ClientBusiness,
  ChartOfAccount,
  JournalEntry,
  BankTransaction,
  ReceiptDocument,
  ReceiptStatus,
  ActiveTab,
  TaxCode,
  LedgerLine,
} from '../types';
import {
  INITIAL_FIRM,
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_RECEIPTS,
} from '../data/mockData';
import { createReversalJournalEntry } from '../utils/ledgerEngine';
import { extractTaxesFromGrossTotal } from '../utils/taxCalculator';
import { api } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
}

export interface AccountingContextType {
  // Practice & Auth State
  firm: Firm;
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Active Client & Portfolio
  clients: ClientBusiness[];
  activeClientId: string;
  activeClient: ClientBusiness;
  setActiveClientId: (id: string) => void;
  selectClient: (clientOrId: ClientBusiness | string, targetTab?: ActiveTab) => void;
  addClient: (newClient: Omit<ClientBusiness, 'id'>) => ClientBusiness;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Chart of Accounts
  accounts: ChartOfAccount[];
  clientAccounts: ChartOfAccount[];
  addAccount: (account: Omit<ChartOfAccount, 'id'>) => ChartOfAccount;

  // General Ledger
  journalEntries: JournalEntry[];
  clientEntries: JournalEntry[];
  postJournalEntry: (entry: JournalEntry) => void;
  reverseJournalEntry: (originalEntry: JournalEntry) => JournalEntry;
  batchImportJournalEntries: (entries: Partial<JournalEntry>[]) => void;

  // Bank Reconciliation
  bankTransactions: BankTransaction[];
  clientTransactions: BankTransaction[];
  reconcileBankTransaction: (tx: BankTransaction, targetAccountId: string, taxCode: TaxCode) => void;

  // Receipts OCR
  receipts: ReceiptDocument[];
  clientReceipts: ReceiptDocument[];
  postReceiptToLedger: (receipt: ReceiptDocument, targetAccountId: string) => void;
  addSimulatedReceipt: (vendor: string, total: number) => void;
  scanReceiptWithAI: (file: File) => Promise<ReceiptDocument>;

  // Aggregated Practice Metrics
  bankTxCounts: Record<string, number>;
  receiptCounts: Record<string, number>;

  // Global Toasts & Feedback
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Practice & Auth State
  const [firm] = useState<Firm>(INITIAL_FIRM);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Multi-Client State
  const [clients, setClients] = useState<ClientBusiness[]>(INITIAL_CLIENTS);
  const [activeClientId, setActiveClientId] = useState<string>(INITIAL_CLIENTS[0].id);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('firm-overview');

  // Ledger & Financial Records
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(INITIAL_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [receipts, setReceipts] = useState<ReceiptDocument[]>(INITIAL_RECEIPTS);

  // Toast Queue
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Derived Active Client
  const activeClient = useMemo(() => {
    return clients.find((c) => c.id === activeClientId) || clients[0];
  }, [clients, activeClientId]);

  // Filtered Client-Specific Records
  const clientAccounts = useMemo(() => {
    return accounts.filter((a) => a.clientBusinessId === activeClient.id);
  }, [accounts, activeClient.id]);

  const clientEntries = useMemo(() => {
    return journalEntries.filter((j) => j.clientBusinessId === activeClient.id);
  }, [journalEntries, activeClient.id]);

  const clientTransactions = useMemo(() => {
    return bankTransactions.filter((t) => t.clientBusinessId === activeClient.id);
  }, [bankTransactions, activeClient.id]);

  const clientReceipts = useMemo(() => {
    return receipts.filter((r) => r.clientBusinessId === activeClient.id);
  }, [receipts, activeClient.id]);

  // Aggregate Pending Counts across All Clients
  const bankTxCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bankTransactions.forEach((tx) => {
      if (!tx.isReconciled) {
        counts[tx.clientBusinessId] = (counts[tx.clientBusinessId] || 0) + 1;
      }
    });
    return counts;
  }, [bankTransactions]);

  const receiptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    receipts.forEach((r) => {
      if (r.status === 'pending_ocr' || r.status === 'pending_review' || r.status === 'extracted') {
        counts[r.clientBusinessId] = (counts[r.clientBusinessId] || 0) + 1;
      }
    });
    return counts;
  }, [receipts]);

  // Sync API context
  useEffect(() => {
    api.setContext(firm.id, currentUser.id, currentUser.fullName);
  }, [firm.id, currentUser.id, currentUser.fullName]);

  // Initial load & client switch synchronization from REST API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [apiClients, apiAccounts, apiEntries, apiBankTx, apiReceipts] = await Promise.all([
          api.getClients().catch(() => null),
          api.getAccounts(activeClientId).catch(() => null),
          api.getJournalEntries(activeClientId).catch(() => null),
          api.getBankTransactions(activeClientId).catch(() => null),
          api.getReceipts(activeClientId).catch(() => null),
        ]);

        if (!isMounted) return;

        if (apiClients && apiClients.length > 0) {
          setClients(apiClients);
        }
        if (apiAccounts && apiAccounts.length > 0) {
          setAccounts((prev) => {
            const others = prev.filter((a) => a.clientBusinessId !== activeClientId);
            return [...others, ...apiAccounts];
          });
        }
        if (apiEntries && apiEntries.length > 0) {
          setJournalEntries((prev) => {
            const others = prev.filter((e) => e.clientBusinessId !== activeClientId);
            return [...others, ...apiEntries];
          });
        }
        if (apiBankTx && apiBankTx.length > 0) {
          setBankTransactions((prev) => {
            const others = prev.filter((t) => t.clientBusinessId !== activeClientId);
            return [...others, ...apiBankTx];
          });
        }
        if (apiReceipts && apiReceipts.length > 0) {
          setReceipts((prev) => {
            const others = prev.filter((r) => r.clientBusinessId !== activeClientId);
            return [...others, ...apiReceipts];
          });
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeClientId]);

  // Switch Active Client
  const selectClient = useCallback(
    (clientOrId: ClientBusiness | string, targetTab?: ActiveTab) => {
      const id = typeof clientOrId === 'string' ? clientOrId : clientOrId.id;
      setActiveClientId(id);
      if (targetTab) {
        setActiveTab(targetTab);
      }
    },
    []
  );

  // 1. Add Provisioned Client
  const addClient = useCallback(
    (newClientData: Omit<ClientBusiness, 'id'>) => {
      const id = `client-${Date.now()}`;
      const newClient: ClientBusiness = {
        ...newClientData,
        id,
      };

      setClients((prev) => [newClient, ...prev]);
      setActiveClientId(id);
      addToast('success', 'Client Provisioned', `${newClient.legalName} is now ready for bookkeeping.`);

      // Persist to backend API
      api.createClient(newClientData).catch((err) => {
        console.warn('API client creation synced locally:', err);
      });

      return newClient;
    },
    [addToast]
  );

  // 2. Add Chart of Account Code
  const addAccount = useCallback(
    (accountData: Omit<ChartOfAccount, 'id'>) => {
      const newAccount: ChartOfAccount = {
        ...accountData,
        id: `acc-${Date.now()}`,
      };
      setAccounts((prev) => [...prev, newAccount]);
      addToast('success', 'Account Created', `${newAccount.accountCode} - ${newAccount.name}`);

      api.createAccount(accountData.clientBusinessId, accountData).catch((err) => {
        console.warn('API account creation synced locally:', err);
      });

      return newAccount;
    },
    [addToast]
  );

  // 3. Post Journal Entry
  const postJournalEntry = useCallback(
    (entry: JournalEntry) => {
      setJournalEntries((prev) => [entry, ...prev]);
      addToast('success', 'Entry Posted', `Entry #${entry.entryNumber} recorded to general ledger.`);

      api.postJournalEntry(entry.clientBusinessId, entry).catch((err) => {
        console.warn('API journal entry post synced locally:', err);
      });
    },
    [addToast]
  );

  // 4. Post Immutable Reversal Entry
  const reverseJournalEntry = useCallback(
    (originalEntry: JournalEntry) => {
      const reversal = createReversalJournalEntry(
        originalEntry,
        currentUser.fullName,
        `Reversal of Entry #${originalEntry.entryNumber}: ${originalEntry.memo}`
      );
      setJournalEntries((prev) => [reversal, ...prev]);
      addToast('info', 'Reversal Entry Created', `Reversal entry #${reversal.entryNumber} recorded.`);

      api.reverseJournalEntry(originalEntry.clientBusinessId, originalEntry.id).catch((err) => {
        console.warn('API reversal entry post synced locally:', err);
      });

      return reversal;
    },
    [currentUser.fullName, addToast]
  );

  // 5. Batch Import Entries
  const batchImportJournalEntries = useCallback(
    (newEntries: Partial<JournalEntry>[]) => {
      const fullEntries: JournalEntry[] = newEntries.map((e, idx) => ({
        id: e.id || `je-import-${Date.now()}-${idx}`,
        clientBusinessId: activeClient.id,
        entryNumber: e.entryNumber || Math.floor(6000 + Math.random() * 3000),
        entryDate: e.entryDate || new Date().toISOString().split('T')[0],
        memo: e.memo || 'CSV Ingestion Entry',
        source: e.source || 'csv_import',
        status: 'posted',
        createdBy: currentUser.fullName,
        postedAt: new Date().toISOString(),
        lines: e.lines || [],
      }));

      setJournalEntries((prev) => [...fullEntries, ...prev]);
      addToast('success', 'Batch Import Complete', `Imported ${fullEntries.length} journal entries.`);

      api.batchImportEntries(activeClient.id, fullEntries).catch((err) => {
        console.warn('API batch import synced locally:', err);
      });
    },
    [activeClient.id, currentUser.fullName, addToast]
  );

  // 6. Reconcile Bank Feed Transaction
  const reconcileBankTransaction = useCallback(
    (tx: BankTransaction, targetAccountId: string, taxCode: TaxCode) => {
      const isOutflow = tx.amount < 0;
      const absAmount = Math.abs(tx.amount);
      const taxSplit = extractTaxesFromGrossTotal(absAmount, activeClient.provinceCode);

      const bankAcc = clientAccounts.find((a) => a.classification === 'bank') || clientAccounts[0];
      const targetAcc = clientAccounts.find((a) => a.id === targetAccountId) || clientAccounts[1];
      const gstAcc = clientAccounts.find((a) => a.accountCode === '2150');
      const qstAcc = clientAccounts.find((a) => a.accountCode === '2160');

      const entryId = `je-recon-${Date.now()}`;
      const lines: LedgerLine[] = [];

      if (isOutflow) {
        lines.push({
          id: `line-${entryId}-1`,
          journalEntryId: entryId,
          accountId: targetAcc.id,
          description: tx.description,
          debit: taxSplit.subtotal,
          credit: 0,
          taxCode,
        });

        if (taxSplit.gstAmount > 0 && gstAcc) {
          lines.push({
            id: `line-${entryId}-2`,
            journalEntryId: entryId,
            accountId: gstAcc.id,
            description: 'GST Input Tax Credit (5%)',
            debit: taxSplit.gstAmount,
            credit: 0,
          });
        }

        if (taxSplit.qstAmount > 0 && qstAcc && activeClient.provinceCode === 'QC') {
          lines.push({
            id: `line-${entryId}-3`,
            journalEntryId: entryId,
            accountId: qstAcc.id,
            description: 'QST Input Tax Refund (9.975%)',
            debit: taxSplit.qstAmount,
            credit: 0,
          });
        }

        lines.push({
          id: `line-${entryId}-4`,
          journalEntryId: entryId,
          accountId: bankAcc.id,
          description: `Bank clearing: ${tx.externalTransactionId}`,
          debit: 0,
          credit: absAmount,
        });
      } else {
        lines.push({
          id: `line-${entryId}-1`,
          journalEntryId: entryId,
          accountId: bankAcc.id,
          description: `Deposit: ${tx.description}`,
          debit: absAmount,
          credit: 0,
        });

        lines.push({
          id: `line-${entryId}-2`,
          journalEntryId: entryId,
          accountId: targetAcc.id,
          description: tx.description,
          debit: 0,
          credit: taxSplit.subtotal,
          taxCode,
        });

        if (taxSplit.gstAmount > 0 && gstAcc) {
          lines.push({
            id: `line-${entryId}-3`,
            journalEntryId: entryId,
            accountId: gstAcc.id,
            description: 'GST Collected (5%)',
            debit: 0,
            credit: taxSplit.gstAmount,
          });
        }

        if (taxSplit.qstAmount > 0 && qstAcc && activeClient.provinceCode === 'QC') {
          lines.push({
            id: `line-${entryId}-4`,
            journalEntryId: entryId,
            accountId: qstAcc.id,
            description: 'QST Collected (9.975%)',
            debit: 0,
            credit: taxSplit.qstAmount,
          });
        }
      }

      const newJournalEntry: JournalEntry = {
        id: entryId,
        clientBusinessId: activeClient.id,
        entryNumber: Math.floor(2000 + Math.random() * 8000),
        entryDate: tx.transactionDate,
        memo: `Bank Match: ${tx.description}`,
        source: 'bank_feed',
        status: 'posted',
        createdBy: currentUser.fullName,
        postedAt: new Date().toISOString(),
        lines,
      };

      setJournalEntries((prev) => [newJournalEntry, ...prev]);
      setBankTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, isReconciled: true, matchedJournalEntryId: entryId } : t))
      );
      addToast('success', 'Transaction Reconciled', `Matched with general ledger entry #${newJournalEntry.entryNumber}.`);

      api.reconcileBankTransaction(activeClient.id, tx.id, targetAccountId, taxCode).catch((err) => {
        console.warn('API bank reconciliation synced locally:', err);
      });
    },
    [activeClient.id, activeClient.provinceCode, clientAccounts, currentUser.fullName, addToast]
  );

  // 7. Post OCR Receipt to Ledger
  const postReceiptToLedger = useCallback(
    (receipt: ReceiptDocument, targetAccountId: string) => {
      const expenseAcc = clientAccounts.find((a) => a.id === targetAccountId) || clientAccounts[0];
      const apAcc = clientAccounts.find((a) => a.classification === 'accounts_payable') || clientAccounts[0];
      const gstAcc = clientAccounts.find((a) => a.accountCode === '2150');
      const qstAcc = clientAccounts.find((a) => a.accountCode === '2160');

      const entryId = `je-rcpt-${Date.now()}`;
      const lines: LedgerLine[] = [
        {
          id: `line-${entryId}-1`,
          journalEntryId: entryId,
          accountId: expenseAcc.id,
          description: `Invoice: ${receipt.extractedVendor}`,
          debit: receipt.extractedSubtotal,
          credit: 0,
          taxCode: activeClient.provinceCode === 'QC' ? 'GST_QST' : 'GST_5',
        },
      ];

      if (receipt.extractedGst > 0 && gstAcc) {
        lines.push({
          id: `line-${entryId}-2`,
          journalEntryId: entryId,
          accountId: gstAcc.id,
          description: 'GST Input Tax Credit (5%)',
          debit: receipt.extractedGst,
          credit: 0,
        });
      }

      if (receipt.extractedQst > 0 && qstAcc && activeClient.provinceCode === 'QC') {
        lines.push({
          id: `line-${entryId}-3`,
          journalEntryId: entryId,
          accountId: qstAcc.id,
          description: 'QST Input Tax Refund (9.975%)',
          debit: receipt.extractedQst,
          credit: 0,
        });
      }

      lines.push({
        id: `line-${entryId}-4`,
        journalEntryId: entryId,
        accountId: apAcc.id,
        description: `Payable to ${receipt.extractedVendor}`,
        debit: 0,
        credit: receipt.extractedTotal,
      });

      const newJournalEntry: JournalEntry = {
        id: entryId,
        clientBusinessId: activeClient.id,
        entryNumber: Math.floor(5000 + Math.random() * 4000),
        entryDate: receipt.extractedDate,
        memo: `Receipt OCR: ${receipt.extractedVendor}`,
        source: 'ocr_receipt',
        status: 'posted',
        createdBy: currentUser.fullName,
        postedAt: new Date().toISOString(),
        lines,
      };

      setJournalEntries((prev) => [newJournalEntry, ...prev]);
      setReceipts((prev) =>
        prev.map((r) =>
          r.id === receipt.id
            ? { ...r, status: 'posted' as ReceiptStatus }
            : r
        )
      );
      addToast('success', 'Receipt Posted', `Created Accounts Payable entry for ${receipt.extractedVendor}.`);

      api.postReceiptToLedger(activeClient.id, receipt.id, targetAccountId).catch((err) => {
        console.warn('API receipt posting synced locally:', err);
      });
    },
    [activeClient.id, activeClient.provinceCode, clientAccounts, currentUser.fullName, addToast]
  );

  // 8. Add Simulated Receipt
  const addSimulatedReceipt = useCallback(
    (vendor: string, total: number) => {
      const taxSplit = extractTaxesFromGrossTotal(total, activeClient.provinceCode);

      const newReceipt: ReceiptDocument = {
        id: `rcpt-${Date.now()}`,
        clientBusinessId: activeClient.id,
        uploadedBy: currentUser.fullName,
        fileName: `${vendor.toLowerCase().replace(/\s+/g, '_')}_invoice_${Date.now().toString().slice(-4)}.pdf`,
        uploadedAt: new Date().toISOString(),
        status: 'extracted',
        extractedVendor: vendor,
        extractedDate: new Date().toISOString().split('T')[0],
        extractedSubtotal: taxSplit.subtotal,
        extractedGst: taxSplit.gstAmount,
        extractedQst: taxSplit.qstAmount,
        extractedTotal: total,
        suggestedAccountId: clientAccounts.find((a) => a.classification === 'operating_expense')?.id || clientAccounts[0].id,
      };

      setReceipts((prev) => [newReceipt, ...prev]);
      addToast('info', 'Receipt Uploaded', `AI parsed invoice for ${vendor} ($${total.toFixed(2)} CAD).`);

      api.uploadReceipt(activeClient.id, {
        vendor,
        total,
        suggestedAccountId: newReceipt.suggestedAccountId,
      }).catch((err) => {
        console.warn('API receipt upload synced locally:', err);
      });
    },
    [activeClient.id, activeClient.provinceCode, clientAccounts, currentUser.fullName, addToast]
  );

  // 9. Real AI OCR Document Scanner (Gemini Multimodal)
  const scanReceiptWithAI = useCallback(
    async (file: File): Promise<ReceiptDocument> => {
      addToast('info', 'Gemini AI Scanning...', `Analyzing ${file.name} with multimodal vision.`);

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const previewUrl = URL.createObjectURL(file);

      try {
        const scannedReceipt = await api.scanReceiptOCR(activeClient.id, {
          fileName: file.name,
          fileBase64: base64,
          mimeType: file.type || 'image/jpeg',
          imageUrl: previewUrl,
        });

        setReceipts((prev) => [scannedReceipt, ...prev]);
        addToast(
          'success',
          'Invoice Parsed Successfully',
          `Extracted ${scannedReceipt.extractedVendor} ($${scannedReceipt.extractedTotal.toFixed(2)} CAD).`
        );
        return scannedReceipt;
      } catch (err: any) {
        console.error('Scan OCR error:', err);
        addToast('error', 'OCR Processing Error', err.message || 'Failed to process invoice');
        throw err;
      }
    },
    [activeClient.id, addToast]
  );

  const value: AccountingContextType = {
    firm,
    users,
    currentUser,
    setCurrentUser,
    clients,
    activeClientId,
    activeClient,
    setActiveClientId,
    selectClient,
    addClient,
    activeTab,
    setActiveTab,
    accounts,
    clientAccounts,
    addAccount,
    journalEntries,
    clientEntries,
    postJournalEntry,
    reverseJournalEntry,
    batchImportJournalEntries,
    bankTransactions,
    clientTransactions,
    reconcileBankTransaction,
    receipts,
    clientReceipts,
    postReceiptToLedger,
    addSimulatedReceipt,
    scanReceiptWithAI,
    bankTxCounts,
    receiptCounts,
    toasts,
    addToast,
    removeToast,
  };

  return <AccountingContext.Provider value={value}>{children}</AccountingContext.Provider>;
};

export const useAccounting = (): AccountingContextType => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
