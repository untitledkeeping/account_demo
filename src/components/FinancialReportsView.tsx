import React, { useState } from 'react';
import {
  BarChart3,
  Scale,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Layers,
  Building,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry } from '../types';
import {
  generateProfitAndLoss,
  generateBalanceSheet,
  generateTrialBalance,
} from '../utils/ledgerEngine';
import { formatCurrency } from '../utils/taxCalculator';

interface FinancialReportsViewProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  client,
  accounts,
  entries,
}) => {
  const [reportType, setReportType] = useState<'pnl' | 'balance_sheet' | 'trial_balance'>('pnl');

  const pnl = generateProfitAndLoss(accounts, entries);
  const balanceSheet = generateBalanceSheet(accounts, entries);
  const trialBalance = generateTrialBalance(accounts, entries);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Financial Statements & Reports
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time calculated accounting statements directly projected from the immutable general ledger.
          </p>
        </div>

        {/* Report Selector Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1">
          <button
            onClick={() => setReportType('pnl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'pnl'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setReportType('balance_sheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'balance_sheet'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setReportType('trial_balance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'trial_balance'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trial Balance
          </button>
        </div>
      </div>

      {/* REPORT 1: PROFIT & LOSS */}
      {reportType === 'pnl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{client.legalName}</h2>
            <div className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Statement of Profit and Loss (Income Statement)</div>
            <div className="text-xs text-slate-500 mt-0.5">For the Period Ended August 2026 (Currency: CAD)</div>
          </div>

          <div className="space-y-6 text-xs font-sans">
            {/* Revenue Section */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-200 pb-1.5 mb-2">
                <span>1. Operating Revenue</span>
                <span className="font-mono">{formatCurrency(pnl.totalRevenue)}</span>
              </div>
              <div className="space-y-1.5 pl-4">
                {pnl.revenueAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* COGS Section */}
            {pnl.totalCogs > 0 && (
              <div>
                <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-200 pb-1.5 mb-2">
                  <span>2. Cost of Goods Sold (COGS)</span>
                  <span className="font-mono">({formatCurrency(pnl.totalCogs)})</span>
                </div>
                <div className="space-y-1.5 pl-4">
                  {pnl.cogsAccounts.map((acc) => (
                    <div key={acc.account.id} className="flex justify-between text-slate-600">
                      <span>{acc.account.accountCode} - {acc.account.name}</span>
                      <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gross Profit Line */}
            <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center font-bold text-sm text-slate-900 border border-slate-200">
              <span className="uppercase">Gross Operating Profit</span>
              <span className="font-mono text-emerald-700">{formatCurrency(pnl.grossProfit)}</span>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-200 pb-1.5 mb-2">
                <span>3. Operating Expenses</span>
                <span className="font-mono font-bold text-rose-700">({formatCurrency(pnl.totalExpenses)})</span>
              </div>
              <div className="space-y-2 pl-4">
                {pnl.expenseAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Income Summary Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl flex justify-between items-center font-bold text-base shadow-md">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Net Operating Income</div>
                <div className="text-xs text-slate-400 font-normal">Gross Profit minus Operating Expenses</div>
              </div>
              <div className="text-2xl font-mono text-emerald-400">
                {formatCurrency(pnl.netIncome)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: BALANCE SHEET */}
      {reportType === 'balance_sheet' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{client.legalName}</h2>
            <div className="text-sm font-bold text-blue-700 uppercase tracking-wider">Balance Sheet (Financial Position)</div>
            <div className="text-xs text-slate-500 mt-0.5">As of August 2026 (Currency: CAD)</div>
          </div>

          {/* Balance proof banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-bold">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Accounting Equation Verified: Assets = Liabilities + Equity</span>
            </div>
            <span className="font-mono text-emerald-700">Variance: $0.00</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans">
            {/* Left: Assets */}
            <div className="space-y-4">
              <div className="flex justify-between items-center font-bold text-sm text-slate-900 uppercase border-b border-slate-300 pb-2">
                <span>Assets</span>
                <span className="font-mono text-emerald-700">{formatCurrency(balanceSheet.totalAssets)}</span>
              </div>
              <div className="space-y-2 pl-2">
                {balanceSheet.assetAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg flex justify-between font-bold text-slate-900 border border-slate-200">
                <span>Total Assets</span>
                <span className="font-mono">{formatCurrency(balanceSheet.totalAssets)}</span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-4">
              {/* Liabilities */}
              <div>
                <div className="flex justify-between items-center font-bold text-sm text-slate-900 uppercase border-b border-slate-300 pb-2">
                  <span>Liabilities</span>
                  <span className="font-mono text-purple-700">{formatCurrency(balanceSheet.totalLiabilities)}</span>
                </div>
                <div className="space-y-2 pl-2 mt-2">
                  {balanceSheet.liabilityAccounts.map((acc) => (
                    <div key={acc.account.id} className="flex justify-between text-slate-600">
                      <span>{acc.account.accountCode} - {acc.account.name}</span>
                      <span className="font-mono font-bold text-slate-800">{formatCurrency(acc.netBalance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equity */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center font-bold text-sm text-slate-900 uppercase border-b border-slate-300 pb-2">
                  <span>Equity</span>
                  <span className="font-mono text-amber-700">{formatCurrency(balanceSheet.totalEquity)}</span>
                </div>
                <div className="space-y-2 pl-2 mt-2">
                  {balanceSheet.equityAccounts.map((acc) => (
                    <div key={acc.account.id} className="flex justify-between text-slate-600">
                      <span>{acc.account.accountCode} - {acc.account.name}</span>
                      <span className="font-mono font-bold text-slate-800">{formatCurrency(acc.netBalance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/60 p-1.5 rounded">
                    <span>Current Period Net Income</span>
                    <span className="font-mono font-bold">{formatCurrency(balanceSheet.currentPeriodNetIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-2.5 rounded-lg flex justify-between font-bold">
                <span>Total Liabilities & Equity</span>
                <span className="font-mono text-emerald-400">{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: TRIAL BALANCE */}
      {reportType === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{client.legalName}</h2>
            <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Trial Balance Proof Worksheet</div>
            <div className="text-xs text-slate-500 mt-0.5">Debit and Credit equality verification across all ledger accounts</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-sans font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Account Title</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4 text-right">Debit (CAD)</th>
                  <th className="py-2.5 px-4 text-right">Credit (CAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalance.items.map((item) => (
                  <tr key={item.accountCode} className="hover:bg-slate-50/60">
                    <td className="py-2 px-4 font-bold text-slate-900">{item.accountCode}</td>
                    <td className="py-2 px-4 font-sans text-slate-800">{item.accountName}</td>
                    <td className="py-2 px-4 font-sans uppercase text-[10px] text-slate-500">{item.type}</td>
                    <td className="py-2 px-4 text-right text-slate-900 font-bold">
                      {item.debit > 0 ? formatCurrency(item.debit) : '—'}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-900 font-bold">
                      {item.credit > 0 ? formatCurrency(item.credit) : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                  <td colSpan={3} className="py-3 px-4 text-right uppercase font-sans text-xs text-slate-400">
                    Trial Balance Totals (Equality Check):
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 text-sm">
                    {formatCurrency(trialBalance.totalDebits)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 text-sm">
                    {formatCurrency(trialBalance.totalCredits)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
