// src/App.tsx
import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  AccountingProvider,
  useAccounting,
} from './context/AccountingContext';
import { Sidebar } from './components/Sidebar';
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
import { PracticeSettingsModal } from './components/PracticeSettingsModal';

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
    scanReceiptWithAI,
    postReceiptToLedger,
    bankTxCounts,
    receiptCounts,
  } = useAccounting();

  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100/90 text-slate-900 overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        firm={firm}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        allUsers={users}
        onOpenSettings={() => setIsSettingsOpen(true)}
        bankTxCount={bankTxCounts[activeClient.id] || 0}
        receiptCount={receiptCounts[activeClient.id] || 0}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Breadcrumb Context Header */}
        <Navbar
          firm={firm}
          clients={clients}
          activeClient={activeClient}
          onSelectClient={selectClient}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUser={currentUser}
          onSwitchUser={setCurrentUser}
          allUsers={users}
          onOpenNewEntry={() => setIsNewEntryOpen(true)}
          onOpenNewClient={() => setIsNewClientOpen(true)}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* View Transition Stage */}
        <main className="flex-1 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + '-' + activeClient.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {activeTab === 'firm-overview' && (
                <FirmOverview
                  firm={firm}
                  clients={clients}
                  onSelectClient={selectClient}
                  onOpenNewClient={() => setIsNewClientOpen(true)}
                  bankTxCounts={bankTxCounts}
                  receiptCounts={receiptCounts}
                  accounts={clientAccounts}
                  entries={clientEntries}
                />
              )}

              {activeTab === 'general-ledger' && (
                <GeneralLedgerView
                  client={activeClient}
                  entries={clientEntries}
                  accounts={clientAccounts}
                  currentUser={currentUser}
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
                  onAddAccount={addAccount}
                />
              )}

              {activeTab === 'receipts-ocr' && (
                <ReceiptOCRView
                  client={activeClient}
                  receipts={clientReceipts}
                  accounts={clientAccounts}
                  currentUser={currentUser}
                  onScanReceipt={scanReceiptWithAI}
                  onPostToLedger={postReceiptToLedger}
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

              {activeTab === 'financial-reports' && (
                <FinancialReportsView
                  client={activeClient}
                  accounts={clientAccounts}
                  entries={clientEntries}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Toast Notifications (Sonner Engine) */}
      <Toaster
        richColors
        position="bottom-right"
        closeButton
        theme="light"
        toastOptions={{
          className: 'border border-slate-200/90 shadow-xl rounded-xl text-xs font-medium',
        }}
      />

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

      {/* Practice Settings Modal */}
      <PracticeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        firm={firm}
        currentUser={currentUser}
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
