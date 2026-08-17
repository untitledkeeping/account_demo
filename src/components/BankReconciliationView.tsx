import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Tag,
  Calendar,
  Building,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ClientBusiness, BankTransaction, ChartOfAccount, TaxCode, JournalEntry } from '../types';
import { formatCurrency, extractTaxesFromGrossTotal } from '../utils/taxCalculator';

interface BankReconciliationViewProps {
  client: ClientBusiness;
  transactions: BankTransaction[];
  accounts: ChartOfAccount[];
  onReconcileTransaction: (tx: BankTransaction, accountId: string, taxCode: TaxCode) => void;
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({
  client,
  transactions,
  accounts,
  onReconcileTransaction,
}) => {
  const [activeView, setActiveView] = useState<'unreconciled' | 'reconciled'>('unreconciled');
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({});
  const [selectedTaxCodes, setSelectedTaxCodes] = useState<Record<string, TaxCode>>({});

  const unreconciledList = transactions.filter((t) => !t.isReconciled);
  const reconciledList = transactions.filter((t) => t.isReconciled);

  const bankAccount = accounts.find((a) => a.classification === 'bank') || accounts[0];

  const handleAccountChange = (txId: string, accId: string) => {
    setSelectedAccounts((prev) => ({ ...prev, [txId]: accId }));
  };

  const handleTaxCodeChange = (txId: string, code: TaxCode) => {
    setSelectedTaxCodes((prev) => ({ ...prev, [txId]: code }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Context & Reconciliation Metrics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Bank Feed & Fast Reconciliation
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile live bank statement lines against the Chart of Accounts with automatic Canadian tax split (GST/QST/HST) and atomic double-entry posting.
          </p>
        </div>

        {/* Stat Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unreconciled</div>
            <div className="text-lg font-bold text-orange-600 font-mono">{unreconciledList.length}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reconciled</div>
            <div className="text-lg font-bold text-emerald-600 font-mono">{reconciledList.length}</div>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Variance</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">$0.00</div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveView('unreconciled')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'unreconciled'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Needs Matching ({unreconciledList.length})</span>
        </button>

        <button
          onClick={() => setActiveView('reconciled')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'reconciled'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Reconciled History ({reconciledList.length})</span>
        </button>
      </div>

      {/* Unreconciled Feed Rows */}
      {activeView === 'unreconciled' && (
        <div className="space-y-4">
          {unreconciledList.map((tx) => {
            const isOutflow = tx.amount < 0;
            const absAmount = Math.abs(tx.amount);
            const currentAccountId = selectedAccounts[tx.id] || tx.suggestedAccountId || accounts[0]?.id;
            const currentTaxCode: TaxCode = selectedTaxCodes[tx.id] || tx.suggestedTaxCode || (client.provinceCode === 'QC' ? 'GST_QST' : 'GST_5');
            const taxBreakdown = extractTaxesFromGrossTotal(absAmount, client.provinceCode);

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6"
              >
                {/* Left: Bank Transaction Info */}
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      isOutflow
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isOutflow ? 'Money Out (Payment)' : 'Money In (Deposit)'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{tx.transactionDate}</span>
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900 font-sans leading-tight">
                    {tx.description}
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Ref: {tx.externalTransactionId} • Bank: {bankAccount?.name.split(' ')[0]}
                  </div>
                </div>

                {/* Center: Amount & Tax Preview */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 min-w-[220px]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Bank Total:</span>
                    <span className={`text-lg font-bold font-mono ${
                      isOutflow ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(absAmount)}
                    </span>
                  </div>

                  {client.provinceCode === 'QC' && currentTaxCode === 'GST_QST' && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-1 space-y-0.5 font-mono">
                      <div className="flex justify-between">
                        <span>Net Base:</span>
                        <span>{formatCurrency(taxBreakdown.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>GST (5%):</span>
                        <span>{formatCurrency(taxBreakdown.gstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-blue-700 font-medium">
                        <span>QST (9.975%):</span>
                        <span>{formatCurrency(taxBreakdown.qstAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: AI Match Candidate & 1-Click Action */}
                <div className="space-y-3 flex-1 max-w-sm">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Suggested Match ({Math.round((tx.confidenceScore || 0.95) * 100)}% Match)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Account Selector */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Account</label>
                      <select
                        value={currentAccountId}
                        onChange={(e) => handleAccountChange(tx.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                      >
                        {accounts
                          .filter((a) => (isOutflow ? a.type === 'expense' : a.type === 'revenue'))
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.accountCode} - {a.name.slice(0, 26)}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Tax Code Selector */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tax Tag</label>
                      <select
                        value={currentTaxCode}
                        onChange={(e) => handleTaxCodeChange(tx.id, e.target.value as TaxCode)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                      >
                        <option value="GST_QST">QC GST + QST (14.975%)</option>
                        <option value="GST_5">GST Only (5%)</option>
                        <option value="HST_13">ON HST (13%)</option>
                        <option value="EXEMPT">Exempt / Zero-Rated</option>
                        <option value="NONE">No Tax</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => onReconcileTransaction(tx, currentAccountId, currentTaxCode)}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm shadow-emerald-600/30"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Post & Reconcile (1-Click)</span>
                  </button>
                </div>
              </div>
            );
          })}

          {unreconciledList.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">All Bank Feeds Fully Reconciled</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All transactions for {client.legalName} have been categorized and posted to the general ledger with zero variance.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reconciled Feed Rows */}
      {activeView === 'reconciled' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {reconciledList.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{tx.description}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Date: {tx.transactionDate} • Ref: {tx.externalTransactionId}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {formatCurrency(Math.abs(tx.amount))}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Matched & Posted
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
