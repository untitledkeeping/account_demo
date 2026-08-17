import React, { useState, useMemo } from 'react';
import {
  INITIAL_FIRM,
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_RECEIPTS,
} from './data/mockData';
import {
  ClientBusiness,
  Firm,
  User,
  ChartOfAccount,
  JournalEntry,
  BankTransaction,
  ReceiptDocument,
  TaxCode,
  LedgerLine,
  ActiveTab,
} from './types';
import { Navbar } from './components/Navbar';
import { FirmOverview } from './components/FirmOverview';
import { GeneralLedgerView } from './components/GeneralLedgerView';
import { BankReconciliationView } from './components/BankReconciliationView';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { ReceiptOCRView } from './components/ReceiptOCRView';
import { FinancialReportsView } from './components/FinancialReportsView';
import { CanadianTaxReportsView } from './components/CanadianTaxReportsView';
import { CSVImportView } from './components/CSVImportView';
import { ArchitectureHub } from './components/ArchitectureHub';
import { NewJournalEntryModal } from './components/NewJournalEntryModal';
import { NewClientModal } from './components/NewClientModal';
import { createReversalJournalEntry } from './utils/ledgerEngine';
import { calculateTaxFromSubtotal, extractTaxesFromGrossTotal } from './utils/taxCalculator';

export function App() {
  // Firm & User State
  const [firm] = useState<Firm>(INITIAL_FIRM);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Jeff Tremblay

  // Multi-Client Portfolio State
  const [clients, setClients] = useState<ClientBusiness[]>(INITIAL_CLIENTS);
  const [activeClientId, setActiveClientId] = useState<string>(INITIAL_CLIENTS[0].id);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('firm-overview');

  // Accounting State
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(INITIAL_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [receipts, setReceipts] = useState<ReceiptDocument[]>(INITIAL_RECEIPTS);

  // Modals
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Active Client Context
  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];
  const clientAccounts = accounts.filter((a) => a.clientBusinessId === activeClient.id);
  const clientEntries = journalEntries.filter((j) => j.clientBusinessId === activeClient.id);
  const clientTransactions = bankTransactions.filter((t) => t.clientBusinessId === activeClient.id);
  const clientReceipts = receipts.filter((r) => r.clientBusinessId === activeClient.id);

  // Unreconciled / Pending Counts for Firm Overview
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

  // Quick Client Switcher (handles both ClientBusiness object and string ID)
  const handleSelectClient = (clientOrId: ClientBusiness | string) => {
    const id = typeof clientOrId === 'string' ? clientOrId : clientOrId.id;
    setActiveClientId(id);
  };

  // 1. Post New Compound Journal Entry
  const handlePostEntry = (newEntry: JournalEntry) => {
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  // 2. Post Immutable Reversal of an existing Journal Entry
  const handleReverseEntry = (originalEntry: JournalEntry) => {
    const reversal = createReversalJournalEntry(
      originalEntry,
      currentUser.fullName,
      `Reversal of Entry #${originalEntry.entryNumber}: ${originalEntry.memo}`
    );
    setJournalEntries((prev) => [reversal, ...prev]);
  };

  // 3. 1-Click Bank Reconciliation & General Ledger Posting
  const handleReconcileTransaction = (
    tx: BankTransaction,
    targetAccountId: string,
    taxCode: TaxCode
  ) => {
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
      // Money Out -> Debit Expense (Net), Debit Taxes, Credit Bank
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
      // Money In -> Debit Bank, Credit Revenue (Net), Credit Sales Tax
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

    // Post entry & mark transaction reconciled
    setJournalEntries((prev) => [newJournalEntry, ...prev]);
    setBankTransactions((prev) =>
      prev.map((t) => (t.id === tx.id ? { ...t, isReconciled: true, matchedJournalEntryId: entryId } : t))
    );
  };

  // 4. 1-Click Receipt Approval & Posting
  const handlePostReceiptToLedger = (receipt: ReceiptDocument, targetAccountId: string) => {
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

    const newEntry: JournalEntry = {
      id: entryId,
      clientBusinessId: activeClient.id,
      entryNumber: Math.floor(3000 + Math.random() * 7000),
      entryDate: receipt.extractedDate,
      memo: `OCR Receipt: ${receipt.extractedVendor}`,
      source: 'receipt_ocr',
      status: 'posted',
      createdBy: currentUser.fullName,
      postedAt: new Date().toISOString(),
      lines,
    };

    setJournalEntries((prev) => [newEntry, ...prev]);
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receipt.id ? { ...r, status: 'posted', matchedJournalEntryId: entryId } : r
      )
    );
  };

  // 5. Add Simulated Scanned Receipt
  const handleAddSimulatedReceipt = (vendor: string, total: number) => {
    const tax = extractTaxesFromGrossTotal(total, activeClient.provinceCode);
    const expenseAcc = clientAccounts.find((a) => a.type === 'expense') || clientAccounts[0];

    const newDoc: ReceiptDocument = {
      id: `rcpt-${Date.now()}`,
      clientBusinessId: activeClient.id,
      fileName: `${vendor.toLowerCase().replace(/ /g, '_')}_scanned.pdf`,
      uploadedBy: currentUser.id,
      uploadedAt: new Date().toISOString(),
      status: 'extracted',
      extractedVendor: vendor,
      extractedDate: new Date().toISOString().split('T')[0],
      extractedTotal: total,
      extractedSubtotal: tax.subtotal,
      extractedGst: tax.gstAmount,
      extractedQst: tax.qstAmount,
      suggestedAccountId: expenseAcc.id,
      notes: `Scanned merchant invoice for ${vendor} - ready for ledger posting.`,
    };

    setReceipts((prev) => [newDoc, ...prev]);
  };

  // 6. Add Chart of Account Code
  const handleAddAccount = (newAcc: Omit<ChartOfAccount, 'id'>) => {
    const created: ChartOfAccount = {
      ...newAcc,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, created]);
  };

  // 7. Provision New Client Business
  const handleAddClient = (newClient: Omit<ClientBusiness, 'id'>) => {
    const createdId = `cb-${Date.now()}`;
    const created: ClientBusiness = {
      ...newClient,
      id: createdId,
    };

    // Seed default standard Chart of Accounts for new client
    const defaultAccounts: ChartOfAccount[] = [
      { id: `acc-${createdId}-1010`, clientBusinessId: createdId, accountCode: '1010', name: 'Operating Chequing Account', type: 'asset', classification: 'bank', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-1200`, clientBusinessId: createdId, accountCode: '1200', name: 'Accounts Receivable (A/R)', type: 'asset', classification: 'accounts_receivable', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-2010`, clientBusinessId: createdId, accountCode: '2010', name: 'Accounts Payable (A/P)', type: 'liability', classification: 'accounts_payable', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-2150`, clientBusinessId: createdId, accountCode: '2150', name: 'GST / HST Payable & ITCs', type: 'liability', classification: 'sales_tax_payable', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-2160`, clientBusinessId: createdId, accountCode: '2160', name: 'QST Payable & ITRs', type: 'liability', classification: 'sales_tax_payable', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-3010`, clientBusinessId: createdId, accountCode: '3010', name: "Owner's Equity & Capital", type: 'equity', classification: 'owner_equity', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-4010`, clientBusinessId: createdId, accountCode: '4010', name: 'Sales & Professional Revenue', type: 'revenue', classification: 'operating_revenue', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-5010`, clientBusinessId: createdId, accountCode: '5010', name: 'Cost of Goods Sold (COGS)', type: 'expense', classification: 'cost_of_goods_sold', currency: 'CAD', isActive: true, isSystem: true },
      { id: `acc-${createdId}-6200`, clientBusinessId: createdId, accountCode: '6200', name: 'Commercial Rent & Facility Lease', type: 'expense', classification: 'operating_expense', currency: 'CAD', isActive: true, isSystem: false },
      { id: `acc-${createdId}-6300`, clientBusinessId: createdId, accountCode: '6300', name: 'Software & Technology Subscriptions', type: 'expense', classification: 'operating_expense', currency: 'CAD', isActive: true, isSystem: false },
    ];

    setClients((prev) => [...prev, created]);
    setAccounts((prev) => [...prev, ...defaultAccounts]);
    setActiveClientId(createdId);
  };

  // 8. Batch Import Entries from CSV Parser
  const handleBatchImportEntries = (importedEntries: Partial<JournalEntry>[]) => {
    const fullEntries: JournalEntry[] = importedEntries.map((item, idx) => ({
      id: `je-csv-${Date.now()}-${idx}`,
      clientBusinessId: activeClient.id,
      entryNumber: Math.floor(5000 + Math.random() * 5000),
      entryDate: item.entryDate || new Date().toISOString().split('T')[0],
      memo: item.memo || 'CSV Imported Entry',
      source: 'csv_import',
      status: 'posted',
      createdBy: currentUser.fullName,
      postedAt: new Date().toISOString(),
      lines: item.lines || [],
    }));

    setJournalEntries((prev) => [...fullEntries, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Practice-First Navigation */}
      <Navbar
        firm={firm}
        clients={clients}
        activeClient={activeClient}
        onSelectClient={handleSelectClient}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={setCurrentUser}
        onOpenNewEntry={() => setIsNewEntryOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'firm-overview' && (
          <FirmOverview
            firm={firm}
            clients={clients}
            bankTxCounts={bankTxCounts}
            receiptCounts={receiptCounts}
            onSelectClient={(client, targetTab) => {
              handleSelectClient(client);
              if (targetTab) {
                setActiveTab(targetTab);
              } else {
                setActiveTab('general-ledger');
              }
            }}
            onOpenNewClient={() => setIsNewClientOpen(true)}
          />
        )}

        {activeTab === 'general-ledger' && (
          <GeneralLedgerView
            client={activeClient}
            entries={clientEntries}
            currentUser={currentUser}
            accounts={clientAccounts}
            onOpenNewEntry={() => setIsNewEntryOpen(true)}
            onReverseEntry={handleReverseEntry}
          />
        )}

        {activeTab === 'bank-reconciliation' && (
          <BankReconciliationView
            client={activeClient}
            transactions={clientTransactions}
            accounts={clientAccounts}
            onReconcileTransaction={handleReconcileTransaction}
          />
        )}

        {activeTab === 'chart-of-accounts' && (
          <ChartOfAccountsView
            client={activeClient}
            accounts={clientAccounts}
            entries={clientEntries}
            onAddAccount={handleAddAccount}
          />
        )}

        {activeTab === 'receipts-ocr' && (
          <ReceiptOCRView
            client={activeClient}
            receipts={clientReceipts}
            accounts={clientAccounts}
            onPostReceiptToLedger={handlePostReceiptToLedger}
            onAddSimulatedReceipt={handleAddSimulatedReceipt}
          />
        )}

        {activeTab === 'financial-reports' && (
          <FinancialReportsView
            client={activeClient}
            accounts={clientAccounts}
            entries={clientEntries}
          />
        )}

        {activeTab === 'tax-filing' && (
          <CanadianTaxReportsView
            client={activeClient}
            accounts={clientAccounts}
            entries={clientEntries}
          />
        )}

        {activeTab === 'csv-import' && (
          <CSVImportView
            client={activeClient}
            accounts={clientAccounts}
            onBatchImportEntries={handleBatchImportEntries}
          />
        )}

        {activeTab === 'architecture-docs' && (
          <ArchitectureHub
            firm={firm}
            activeClient={activeClient}
          />
        )}
      </main>

      {/* Post Compound Journal Entry Modal */}
      <NewJournalEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        client={activeClient}
        accounts={clientAccounts}
        currentUser={currentUser}
        onPostEntry={handlePostEntry}
      />

      {/* Provision New Client Modal */}
      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        firm={firm}
        currentClientCount={clients.length}
        onAddClient={handleAddClient}
      />
    </div>
  );
}

export default App;
