import React from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Layers,
  Building,
  Check,
  AlertCircle,
  Tag,
  Download,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, AccountType, AccountClassification, JournalEntry, User } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { useChartOfAccounts } from '../hooks/useChartOfAccounts';

interface ChartOfAccountsViewProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
  currentUser?: User;
  onAddAccount: (newAcc: Omit<ChartOfAccount, 'id'>) => void;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  client,
  accounts,
  entries,
  currentUser,
  onAddAccount,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    isAddModalOpen,
    setIsAddModalOpen,
    newCode,
    setNewCode,
    newName,
    setNewName,
    newType,
    newClassification,
    setNewClassification,
    handleTypeChange,
    handleCreateAccount,
    validateNewAccount,
    formErrors,
    balanceMap,
    filteredAccounts,
    typeCounts,
    exportCOAToCSV,
    successToast,
  } = useChartOfAccounts({
    client,
    accounts,
    entries,
    currentUser,
    onAddAccount,
  });

  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case 'asset':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Asset (1xxx)</span>;
      case 'liability':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Liability (2xxx)</span>;
      case 'equity':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Equity (3xxx)</span>;
      case 'revenue':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Revenue (4xxx)</span>;
      case 'expense':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Expense (5xxx+)</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Context */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Chart of Accounts (COA)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard Canadian GAAP hierarchy with live balance calculation derived from journal entries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCOAToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors border border-slate-200 min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Class Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code (e.g. 2150), name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {(['ALL', 'asset', 'liability', 'equity', 'revenue', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap min-h-[36px] ${
                selectedType === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'ALL' ? 'All' : t} ({typeCounts[t]})
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Account Name</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4 text-right">Net Balance (CAD)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => {
                const bal = balanceMap[acc.id] || 0;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{acc.accountCode}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900 flex items-center space-x-1.5">
                      <span>{acc.name}</span>
                      {acc.isSystem && (
                        <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          System
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">{getTypeBadge(acc.type)}</td>
                    <td className="py-2.5 px-4 text-slate-500 capitalize">{acc.classification.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(bal)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Check className="w-2.5 h-2.5" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Add Account Code</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl space-y-0.5 text-xs text-rose-800">
                <div className="font-bold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Validation Errors</span>
                </div>
                {formErrors.map((err, i) => (
                  <div key={i} className="pl-4">• {err}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account Type</label>
                <select
                  value={newType}
                  onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="asset">Asset (1000 - 1999)</option>
                  <option value="liability">Liability (2000 - 2999)</option>
                  <option value="equity">Equity (3000 - 3999)</option>
                  <option value="revenue">Revenue (4000 - 4999)</option>
                  <option value="expense">Expense (5000 - 9999)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Account Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5420"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Classification</label>
                  <select
                    value={newClassification}
                    onChange={(e) => setNewClassification(e.target.value as AccountClassification)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    {newType === 'asset' && (
                      <>
                        <option value="current_asset">Current Asset</option>
                        <option value="bank">Bank / Cash</option>
                        <option value="accounts_receivable">Accounts Receivable</option>
                      </>
                    )}
                    {newType === 'liability' && (
                      <>
                        <option value="current_liability">Current Liability</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="accounts_payable">Accounts Payable</option>
                        <option value="sales_tax_payable">Sales Tax Payable</option>
                      </>
                    )}
                    {newType === 'equity' && (
                      <>
                        <option value="owner_equity">Owner Equity</option>
                        <option value="retained_earnings">Retained Earnings</option>
                      </>
                    )}
                    {newType === 'revenue' && (
                      <>
                        <option value="operating_revenue">Operating Revenue</option>
                        <option value="other_revenue">Other Revenue</option>
                      </>
                    )}
                    {newType === 'expense' && (
                      <>
                        <option value="operating_expense">Operating Expense</option>
                        <option value="cost_of_goods_sold">Cost of Goods Sold</option>
                        <option value="payroll_expense">Payroll Expense</option>
                        <option value="tax_expense">Tax Expense</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Hosting & Subscriptions"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs min-h-[40px]"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
