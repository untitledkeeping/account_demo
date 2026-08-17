import React from 'react';
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
  ShieldCheck,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { useFinancialReports, ReportType } from '../hooks/useFinancialReports';

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
  const {
    reportType,
    setReportType,
    pnl,
    balanceSheet,
    trialBalance,
    balanceSheetProof,
    trialBalanceProof,
    isExporting,
    exportCurrentReportToCSV,
  } = useFinancialReports({
    client,
    accounts,
    entries,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Financial Statements & GAAP Reports
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time calculated accounting statements directly projected from the immutable general ledger.
          </p>
        </div>

        {/* Report Selector & Export */}
        <div className="flex flex-wrap items-center gap-3">
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

          <button
            onClick={exportCurrentReportToCSV}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
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

            {/* Expenses Section */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-200 pb-1.5 mb-2">
                <span>3. Operating Expenses</span>
                <span className="font-mono">({formatCurrency(pnl.totalExpenses)})</span>
              </div>
              <div className="space-y-1.5 pl-4">
                {pnl.expenseAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Income Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center font-bold text-base shadow-md">
              <span className="uppercase tracking-wider">Net Operating Income (Loss)</span>
              <span className={`font-mono ${pnl.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(pnl.netIncome)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: BALANCE SHEET */}
      {reportType === 'balance_sheet' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{client.legalName}</h2>
            <div className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Statement of Financial Position (Balance Sheet)</div>
            <div className="text-xs text-slate-500 mt-0.5">As of August 31, 2026 (Currency: CAD)</div>
          </div>

          {/* Mathematical Proof Bar */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-900 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Accounting Equation Proof:</strong> Assets (${balanceSheetProof.totalAssets.toFixed(2)}) = Liabilities + Equity (${balanceSheetProof.liabilitiesAndEquity.toFixed(2)})
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
              Variance: ${balanceSheetProof.variance.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Left: Assets */}
            <div className="space-y-4">
              <div className="font-bold text-sm text-slate-900 uppercase border-b-2 border-slate-900 pb-1 flex justify-between">
                <span>Assets</span>
                <span className="font-mono">{formatCurrency(balanceSheet.totalAssets)}</span>
              </div>
              <div className="space-y-1.5 pl-2">
                {balanceSheet.assets.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-700">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-6">
              {/* Liabilities */}
              <div className="space-y-4">
                <div className="font-bold text-sm text-slate-900 uppercase border-b-2 border-slate-900 pb-1 flex justify-between">
                  <span>Liabilities</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.totalLiabilities)}</span>
                </div>
                <div className="space-y-1.5 pl-2">
                  {balanceSheet.liabilities.map((acc) => (
                    <div key={acc.account.id} className="flex justify-between text-slate-700">
                      <span>{acc.account.accountCode} - {acc.account.name}</span>
                      <span className="font-mono font-medium">{formatCurrency(acc.netBalance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equity */}
              <div className="space-y-4">
                <div className="font-bold text-sm text-slate-900 uppercase border-b-2 border-slate-900 pb-1 flex justify-between">
                  <span>Equity</span>
                  <span className="font-mono">{formatCurrency(balanceSheet.totalEquity)}</span>
                </div>
                <div className="space-y-1.5 pl-2">
                  {balanceSheet.equity.map((acc) => (
                    <div key={acc.account.id} className="flex justify-between text-slate-700">
                      <span>{acc.account.accountCode} - {acc.account.name}</span>
                      <span className="font-mono font-medium">{formatCurrency(acc.netBalance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50/60 px-2 py-1 rounded">
                    <span>Current Year Retained Earnings (Net Income)</span>
                    <span className="font-mono font-bold">{formatCurrency(balanceSheet.currentYearNetIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities & Equity Summary */}
              <div className="bg-slate-900 text-white p-3 rounded-xl flex justify-between items-center font-bold text-sm">
                <span>Total Liabilities & Equity</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                </span>
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
            <div className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Trial Balance Verification Schedule</div>
            <div className="text-xs text-slate-500 mt-0.5">As of August 31, 2026 (Currency: CAD)</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Account Code</th>
                  <th className="py-2.5 px-4">Account Name</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Debit (CAD)</th>
                  <th className="py-2.5 px-4 text-right">Credit (CAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalance.rows.map((row) => (
                  <tr key={row.account.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{row.account.accountCode}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{row.account.name}</td>
                    <td className="py-2.5 px-4 text-slate-500 uppercase text-[10px]">{row.account.type}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold font-mono text-xs">
                  <td colSpan={3} className="py-3 px-4 uppercase tracking-wider font-sans">
                    Total Trial Balance Verification
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    {formatCurrency(trialBalance.totalDebits)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    {formatCurrency(trialBalance.totalCredits)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
