import React, { useState } from 'react';
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
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, AccountType, AccountClassification, JournalEntry } from '../types';
import { calculateAccountBalances } from '../utils/ledgerEngine';
import { formatCurrency } from '../utils/taxCalculator';

interface ChartOfAccountsViewProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
  onAddAccount: (newAcc: Omit<ChartOfAccount, 'id'>) => void;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  client,
  accounts,
  entries,
  onAddAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New account form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('expense');
  const [newClassification, setNewClassification] = useState<AccountClassification>('operating_expense');

  const balanceMap = calculateAccountBalances(accounts, entries);

  const filteredAccounts = accounts
    .slice()
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
    .filter((acc) => {
      const matchesSearch =
        acc.accountCode.includes(searchTerm) ||
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.classification.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'ALL' || acc.type === selectedType;

      return matchesSearch && matchesType;
    });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    onAddAccount({
      clientBusinessId: client.id,
      accountCode: newCode,
      name: newName,
      type: newType,
      classification: newClassification,
      currency: 'CAD',
      isActive: true,
      isSystem: false,
    });

    setNewCode('');
    setNewName('');
    setIsAddModalOpen(false);
  };

  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case 'asset':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Asset</span>;
      case 'liability':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Liability</span>;
      case 'equity':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Equity</span>;
      case 'revenue':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Revenue</span>;
      case 'expense':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Expense</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Chart of Accounts (COA)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard GAAP account hierarchy with real-time balance calculations derived directly from the immutable double-entry journal.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>Add Account Code</span>
        </button>
      </div>

      {/* Class Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code (e.g., 2150), name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {['ALL', 'asset', 'liability', 'equity', 'revenue', 'expense'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                selectedType === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'ALL' ? 'All Classes' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Normal Balance</th>
                <th className="py-3 px-4 text-right">Debit Sum</th>
                <th className="py-3 px-4 text-right">Credit Sum</th>
                <th className="py-3 px-4 text-right">Net Balance (CAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => {
                const bal = balanceMap.get(acc.id);
                const normalBal = acc.type === 'asset' || acc.type === 'expense' ? 'Debit' : 'Credit';

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {acc.accountCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span>{acc.name}</span>
                        {acc.isSystem && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            System
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(acc.type)}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] capitalize">
                      {acc.classification.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-semibold text-[11px]">
                      {normalBal}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {bal && bal.debitTotal > 0 ? formatCurrency(bal.debitTotal) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {bal && bal.creditTotal > 0 ? formatCurrency(bal.creditTotal) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {bal ? formatCurrency(bal.netBalance) : '$0.00'}
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Chart of Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new standardized account code to {client.legalName}'s general ledger structure.
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 6600, 1030"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Advertising & Digital Marketing"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AccountType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="asset">Asset (1000s)</option>
                    <option value="liability">Liability (2000s)</option>
                    <option value="equity">Equity (3000s)</option>
                    <option value="revenue">Revenue (4000s)</option>
                    <option value="expense">Expense (5000-6000s)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Classification</label>
                  <select
                    value={newClassification}
                    onChange={(e) => setNewClassification(e.target.value as AccountClassification)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="operating_expense">Operating Expense</option>
                    <option value="cost_of_goods_sold">Cost of Goods Sold</option>
                    <option value="operating_revenue">Operating Revenue</option>
                    <option value="bank">Bank / Cash</option>
                    <option value="accounts_receivable">Accounts Receivable</option>
                    <option value="accounts_payable">Accounts Payable</option>
                    <option value="sales_tax_payable">Sales Tax Payable</option>
                    <option value="owner_equity">Owner Equity</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
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
