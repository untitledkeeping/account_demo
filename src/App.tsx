import React, { useState } from 'react';
import {
  AccountingProvider,
  useAccounting,
  ToastMessage,
} from './context/AccountingContext';
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
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

function MainAppContent() {
  const {
    firm,
    users,
    currentUser,
    setCurrentUser,
    clients,
    activeClient,
    selectClient,
    addClient,
    activeTab,
    setActiveTab,
    clientAccounts,
    addAccount,
    clientEntries,
    postJournalEntry,
    reverseJournalEntry,
    batchImportJournalEntries,
    clientTransactions,
    reconcileBankTransaction,
    clientReceipts,
    postReceiptToLedger,
    addSimulatedReceipt,
    scanReceiptWithAI,
    bankTxCounts,
    receiptCounts,
    toasts,
    removeToast,
  } = useAccounting();

  // Modal dialog states
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Practice-First Navigation Bar */}
      <Navbar
        firm={firm}
        clients={clients}
        activeClient={activeClient}
        onSelectClient={selectClient}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={setCurrentUser}
        onOpenNewEntry={() => setIsNewEntryOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'firm-overview' && (
          <FirmOverview
            firm={firm}
            clients={clients}
            currentUser={currentUser}
            bankTxCounts={bankTxCounts}
            receiptCounts={receiptCounts}
            onSelectClient={(client, targetTab) => selectClient(client, targetTab || 'general-ledger')}
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
            onReverseEntry={reverseJournalEntry}
          />
        )}

        {activeTab === 'bank-reconciliation' && (
          <BankReconciliationView
            client={activeClient}
            transactions={clientTransactions}
            accounts={clientAccounts}
            currentUser={currentUser}
            onReconcileTransaction={reconcileBankTransaction}
          />
        )}

        {activeTab === 'chart-of-accounts' && (
          <ChartOfAccountsView
            client={activeClient}
            accounts={clientAccounts}
            entries={clientEntries}
            currentUser={currentUser}
            onAddAccount={addAccount}
          />
        )}

        {activeTab === 'receipts-ocr' && (
          <ReceiptOCRView
            client={activeClient}
            receipts={clientReceipts}
            accounts={clientAccounts}
            currentUser={currentUser}
            onPostReceiptToLedger={postReceiptToLedger}
            onAddSimulatedReceipt={addSimulatedReceipt}
            onScanReceiptWithAI={scanReceiptWithAI}
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
            currentUser={currentUser}
          />
        )}

        {activeTab === 'csv-import' && (
          <CSVImportView
            client={activeClient}
            accounts={clientAccounts}
            currentUser={currentUser}
            onBatchImportEntries={batchImportJournalEntries}
          />
        )}

        {activeTab === 'architecture-docs' && (
          <ArchitectureHub
            firm={firm}
            activeClient={activeClient}
          />
        )}
      </main>

      {/* Global Toast Notifications Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start space-x-3 transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/50'
                : toast.type === 'error'
                ? 'bg-rose-950 text-white border-rose-500/50'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-white border-amber-500/50'
                : 'bg-slate-900 text-white border-blue-500/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs">{toast.title}</div>
              {toast.message && <div className="text-[11px] text-slate-300 mt-0.5">{toast.message}</div>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Post Compound Journal Entry Modal */}
      <NewJournalEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        client={activeClient}
        accounts={clientAccounts}
        currentUser={currentUser}
        onPostEntry={postJournalEntry}
      />

      {/* Provision New Client Modal */}
      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        firm={firm}
        currentClientCount={clients.length}
        currentUser={currentUser}
        allUsers={users}
        onAddClient={addClient}
      />
    </div>
  );
}

export function App() {
  return (
    <AccountingProvider>
      <MainAppContent />
    </AccountingProvider>
  );
}

export default App;
