import React from 'react';
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
  User as UserIcon,
  Search,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { ClientBusiness, BankTransaction, ChartOfAccount, TaxCode, User } from '../types';
import { formatCurrency, extractTaxesFromGrossTotal } from '../utils/taxCalculator';
import { useBankReconciliation } from '../hooks/useBankReconciliation';

interface BankReconciliationViewProps {
  client: ClientBusiness;
  transactions: BankTransaction[];
  accounts: ChartOfAccount[];
  currentUser: User;
  onReconcileTransaction: (tx: BankTransaction, accountId: string, taxCode: TaxCode) => void;
}

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({
  client,
  transactions,
  accounts,
  currentUser,
  onReconcileTransaction,
}) => {
  const {
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
  } = useBankReconciliation({
    client,
    transactions,
    accounts,
    currentUser,
    onReconcileTransaction,
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Context & Bookkeeper Status */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Bank Feed Reconciliation
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200/70 font-medium">
              <UserIcon className="w-3 h-3 text-emerald-600" />
              <span>
                Auditor: <strong className="text-slate-900">{currentUser.fullName}</strong>
              </span>
            </div>

            <span className="text-slate-300">•</span>
            <span>
              Bank Account: <strong className="text-slate-700">{bankAccount?.accountCode} - {bankAccount?.name}</strong>
            </span>
          </div>
        </div>

        {/* Stat Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto">
          <div className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 px-3 sm:px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unmatched</div>
            <div className="text-base sm:text-lg font-bold text-orange-600 font-mono">{stats.unreconciledCount}</div>
          </div>
          <div className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 px-3 sm:px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Matched</div>
            <div className="text-base sm:text-lg font-bold text-emerald-600 font-mono">{stats.reconciledCount}</div>
          </div>
          <div className="flex-1 sm:flex-none bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Progress</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">{stats.progressPercent}%</div>
          </div>
        </div>
      </div>

      {/* Auto-Reconcile Banner */}
      {stats.highConfidenceCount > 0 && activeView === 'unreconciled' && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                {stats.highConfidenceCount} Rule Engine Matches Ready
              </div>
              <p className="text-[11px] text-emerald-800">
                Matched against prior vendor rules and Canadian sales tax rates (&ge;85% confidence).
              </p>
            </div>
          </div>

          <button
            onClick={() => autoReconcileHighConfidence()}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-all shadow-xs min-h-[40px] whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Match ({stats.highConfidenceCount})</span>
          </button>
        </div>
      )}

      {/* Filter and View Switcher Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* View Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveView('unreconciled')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md font-bold transition-all min-h-[36px] ${
                activeView === 'unreconciled'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Needs Match ({stats.unreconciledCount})</span>
            </button>

            <button
              onClick={() => setActiveView('reconciled')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md font-bold transition-all min-h-[36px] ${
                activeView === 'reconciled'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reconciled ({stats.reconciledCount})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, date, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Direction Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start md:self-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium min-h-[32px] ${typeFilter === 'ALL' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('OUTFLOW')}
              className={`px-2.5 py-1 rounded-md font-medium min-h-[32px] ${typeFilter === 'OUTFLOW' ? 'bg-white font-bold text-rose-700 shadow-xs' : 'text-slate-600'}`}
            >
              Outflow (-)
            </button>
            <button
              onClick={() => setTypeFilter('INFLOW')}
              className={`px-2.5 py-1 rounded-md font-medium min-h-[32px] ${typeFilter === 'INFLOW' ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-600'}`}
            >
              Inflow (+)
            </button>
          </div>
        </div>
      </div>

      {/* Unreconciled Feed Items */}
      {activeView === 'unreconciled' && (
        <div className="space-y-3 sm:space-y-4">
          {filteredUnreconciled.map((tx) => {
            const isOutflow = tx.amount < 0;
            const absAmount = Math.abs(tx.amount);
            const currentAccountId =
              selectedAccounts[tx.id] || tx.suggestedAccountId || accounts.find((a) => a.type === 'expense')?.id || accounts[0]?.id;
            const currentTaxCode: TaxCode = selectedTaxCodes[tx.id] || tx.suggestedTaxCode || defaultTaxCode;
            const taxBreakdown = extractTaxesFromGrossTotal(absAmount, client.provinceCode);
            const validation = validateReconciliation(tx, currentAccountId, currentTaxCode);

            return (
              <div
                key={tx.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4"
              >
                {/* Left: Bank Transaction Info */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isOutflow
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isOutflow ? 'Money Out' : 'Money In'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{tx.transactionDate}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{tx.description}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {tx.externalTransactionId}</div>
                  </div>

                  {/* AI Match Hint */}
                  {tx.confidenceScore && tx.confidenceScore >= 0.7 && (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>
                        AI Match: {Math.round(tx.confidenceScore * 100)}% ({tx.categoryHint || 'Vendor Rule'})
                      </span>
                    </div>
                  )}

                  {/* Validation Warning */}
                  {validation.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center space-x-1 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>

                {/* Right: Allocation Controls & Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/90 p-3 sm:p-4 rounded-xl border border-slate-200/80">
                  <div className="space-y-1 flex-1 sm:w-56">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Target Account
                    </label>
                    <select
                      value={currentAccountId}
                      onChange={(e) => handleAccountChange(tx.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-800 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 min-h-[38px]"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountCode} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 flex-1 sm:w-44">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Tax Code
                    </label>
                    <select
                      value={currentTaxCode}
                      onChange={(e) => handleTaxCodeChange(tx.id, e.target.value as TaxCode)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-800 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 min-h-[38px]"
                    >
                      <option value="GST_QST">GST (5%) + QST (9.975%)</option>
                      <option value="GST_5">GST Only (5%)</option>
                      <option value="HST_13">HST (13% ON)</option>
                      <option value="HST_15">HST (15% Atlantic)</option>
                      <option value="EXEMPT">Exempt (0%)</option>
                      <option value="NONE">No Tax (0%)</option>
                    </select>
                  </div>

                  <div className="text-left sm:text-right font-mono self-stretch sm:self-center min-w-[100px] py-1">
                    <div className="text-[10px] text-slate-400 font-sans">Gross Amount</div>
                    <div className={`text-base font-bold ${isOutflow ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(absAmount)}
                    </div>
                    {currentTaxCode !== 'NONE' && currentTaxCode !== 'EXEMPT' && (
                      <div className="text-[9px] text-slate-500">
                        Net: {formatCurrency(taxBreakdown.subtotal)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => executeReconcile(tx)}
                    className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-xs min-h-[40px]"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Reconcile</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredUnreconciled.length === 0 && (
            <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">All Transactions Reconciled!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Zero unreconciled bank items remaining for {client.legalName}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reconciled History Rows */}
      {activeView === 'reconciled' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Amount (CAD)</th>
                  <th className="py-2.5 px-4 text-right">Journal Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {reconciledList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-600">{tx.transactionDate}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">{tx.description}</td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-2.5 h-2.5" />
                        <span>Reconciled</span>
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(Math.abs(tx.amount))}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 text-[11px]">
                      {tx.matchedJournalEntryId || 'je-bank-feed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
