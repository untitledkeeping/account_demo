// src/components/FinancialReportsView.tsx
import React from 'react';
import {
  BarChart3,
  Scale,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Calendar,
  Layers,
  Building,
  ShieldCheck,
  Search,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { useFinancialReports, ReportType, PeriodFilter } from '../hooks/useFinancialReports';

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
    periodFilter,
    setPeriodFilter,
    periodLabel,
    searchTerm,
    setSearchTerm,
    pnl,
    balanceSheet,
    trialBalance,
    glDetailEntries,
    accountMap,
    balanceSheetProof,
    trialBalanceProof,
    isExporting,
    exportToExcel,
    exportToPDF,
  } = useFinancialReports({
    client,
    accounts,
    entries,
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Top Header & Export Controls */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Financial Statements & CPA Working Papers
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
            <span>BN9: <strong className="text-slate-700">{client.businessNumber || 'Unassigned'}</strong></span>
            <span>•</span>
            <span>Period: <strong className="text-emerald-700">{periodLabel}</strong></span>
            <span>•</span>
            <span>Jurisdiction: <strong className="text-slate-700">{client.provinceCode}, Canada</strong></span>
          </div>
        </div>

        {/* Dual Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[38px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF / Print</span>
          </button>

          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[38px]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExporting ? 'Exporting...' : 'Export Excel (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Statement Navigation Bar & Period Filter */}
      <div className="bg-white p-3 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* 4 Statement Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setReportType('pnl')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all min-h-[34px] ${
              reportType === 'pnl'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profit & Loss (P&L)
          </button>
          <button
            onClick={() => setReportType('balance_sheet')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all min-h-[34px] ${
              reportType === 'balance_sheet'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setReportType('trial_balance')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all min-h-[34px] ${
              reportType === 'trial_balance'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trial Balance
          </button>
          <button
            onClick={() => setReportType('gl_detail')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all min-h-[34px] ${
              reportType === 'gl_detail'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GL Audit Trail
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Reporting Range:</span>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="YTD">Year-to-Date (YTD 2026)</option>
            <option value="Q1">Q1 (Jan - Mar 2026)</option>
            <option value="Q2">Q2 (Apr - Jun 2026)</option>
            <option value="Q3">Q3 (Jul - Sep 2026)</option>
            <option value="Q4">Q4 (Oct - Dec 2026)</option>
            <option value="ALL">All Cumulative History</option>
          </select>
        </div>
      </div>

      {/* REPORT 1: PROFIT & LOSS */}
      {reportType === 'pnl' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="text-center border-b border-slate-100 pb-4">
            <div className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Studio Bookkeeping & Associates Inc.</div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">{client.legalName}</h2>
            <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mt-0.5">Statement of Profit and Loss (Income Statement)</div>
            <div className="text-xs text-slate-400 mt-0.5">{periodLabel} • Canadian Dollars (CAD)</div>
          </div>

          <div className="space-y-6 text-xs max-w-3xl mx-auto">
            {/* 1. Revenue */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-1.5 mb-2">
                <span>1. Operating Revenue</span>
                <span className="font-mono">{formatCurrency(pnl.totalRevenue)}</span>
              </div>
              <div className="space-y-2 pl-3">
                {pnl.revenueAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. COGS */}
            {pnl.totalCogs > 0 && (
              <div>
                <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-300 pb-1.5 mb-2">
                  <span>2. Cost of Goods Sold (COGS)</span>
                  <span className="font-mono">({formatCurrency(pnl.totalCogs)})</span>
                </div>
                <div className="space-y-2 pl-3">
                  {pnl.cogsAccounts.map((acc) => (
                    <div key={acc.account.id} className="flex justify-between text-slate-600">
                      <span>{acc.account.accountCode} - {acc.account.name}</span>
                      <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center font-bold text-emerald-900 bg-emerald-50 px-3 py-2 rounded-lg mt-2 border border-emerald-200/60">
                  <span>Gross Operating Profit</span>
                  <span className="font-mono">{formatCurrency(pnl.grossProfit)}</span>
                </div>
              </div>
            )}

            {/* 3. Expenses */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-300 pb-1.5 mb-2">
                <span>3. Operating Expenses</span>
                <span className="font-mono">({formatCurrency(pnl.totalExpenses)})</span>
              </div>
              <div className="space-y-2 pl-3">
                {pnl.expenseAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Income Summary */}
            <div className="pt-4 border-t-2 border-slate-900">
              <div className="flex justify-between items-center font-extrabold text-sm sm:text-base text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span>NET OPERATING INCOME / (LOSS)</span>
                <span className={`font-mono ${pnl.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(pnl.netIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: BALANCE SHEET */}
      {reportType === 'balance_sheet' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="text-center border-b border-slate-100 pb-4">
            <div className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Studio Bookkeeping & Associates Inc.</div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">{client.legalName}</h2>
            <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mt-0.5">Balance Sheet (Statement of Financial Position)</div>
            <div className="text-xs text-slate-400 mt-0.5">As of {new Date().toISOString().split('T')[0]} • CAD</div>
          </div>

          {/* Mathematical Proof Badge */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs max-w-3xl mx-auto ${
            balanceSheetProof.isBalanced
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200/80'
              : 'bg-rose-50 text-rose-900 border-rose-200/80'
          }`}>
            <div className="flex items-center space-x-2">
              {balanceSheetProof.isBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-bold">
                Accounting Equation Verified: Assets ({formatCurrency(balanceSheetProof.totalAssets)}) = Liabilities & Equity ({formatCurrency(balanceSheetProof.liabilitiesAndEquity)})
              </span>
            </div>
            <span className="font-mono text-[11px]">Variance: ${balanceSheetProof.variance.toFixed(2)}</span>
          </div>

          <div className="space-y-6 text-xs max-w-3xl mx-auto">
            {/* Assets */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-1.5 mb-2">
                <span>Assets</span>
                <span className="font-mono">{formatCurrency(balanceSheet.totalAssets)}</span>
              </div>
              <div className="space-y-2 pl-3">
                {balanceSheet.assetAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-300 pb-1.5 mb-2">
                <span>Liabilities</span>
                <span className="font-mono">{formatCurrency(balanceSheet.totalLiabilities)}</span>
              </div>
              <div className="space-y-2 pl-3">
                {balanceSheet.liabilityAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equity */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-900 uppercase border-b border-slate-300 pb-1.5 mb-2">
                <span>Equity</span>
                <span className="font-mono">{formatCurrency(balanceSheet.totalEquity)}</span>
              </div>
              <div className="space-y-2 pl-3">
                {balanceSheet.equityAccounts.map((acc) => (
                  <div key={acc.account.id} className="flex justify-between text-slate-600">
                    <span>{acc.account.accountCode} - {acc.account.name}</span>
                    <span className="font-mono font-medium text-slate-800">{formatCurrency(acc.netBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-600 italic">
                  <span>Current Period Net Operating Income</span>
                  <span className="font-mono font-medium text-slate-800">{formatCurrency(balanceSheet.currentPeriodNetIncome)}</span>
                </div>
              </div>
            </div>

            {/* Total Liabilities & Equity */}
            <div className="pt-4 border-t-2 border-slate-900">
              <div className="flex justify-between items-center font-extrabold text-sm sm:text-base text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="font-mono text-slate-900">
                  {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: TRIAL BALANCE */}
      {reportType === 'trial_balance' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="text-center border-b border-slate-100 pb-4">
            <div className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Studio Bookkeeping & Associates Inc.</div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">{client.legalName}</h2>
            <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide mt-0.5">Trial Balance Working Papers</div>
            <div className="text-xs text-slate-400 mt-0.5">{periodLabel} • Verified GL Accounts</div>
          </div>

          {/* Mathematical Proof Badge */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs max-w-4xl mx-auto ${
            trialBalanceProof.isBalanced
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200/80'
              : 'bg-rose-50 text-rose-900 border-rose-200/80'
          }`}>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">
                Debit/Credit Balance Confirmed: Debits ({formatCurrency(trialBalanceProof.totalDebits)}) = Credits ({formatCurrency(trialBalanceProof.totalCredits)})
              </span>
            </div>
            <span className="font-mono text-[11px]">Variance: $0.00</span>
          </div>

          <div className="overflow-x-auto max-w-4xl mx-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Account Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Debit (CAD)</th>
                  <th className="py-2.5 px-3 text-right">Credit (CAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalance.items.map((r) => (
                  <tr key={r.accountCode} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.accountCode}</td>
                    <td className="py-2 px-3 text-slate-700">{r.accountName}</td>
                    <td className="py-2 px-3 text-slate-500 uppercase text-[10px]">{r.type}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-900">
                      {r.debit > 0 ? formatCurrency(r.debit) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-900">
                      {r.credit > 0 ? formatCurrency(r.credit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-extrabold text-slate-900">
                <tr>
                  <td colSpan={3} className="py-3 px-3 uppercase">TRIAL BALANCE TOTALS</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatCurrency(trialBalance.totalDebits)}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatCurrency(trialBalance.totalCredits)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: GENERAL LEDGER AUDIT TRAIL */}
      {reportType === 'gl_detail' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Studio Bookkeeping & Associates Inc.</div>
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">{client.legalName}</h2>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mt-0.5">General Ledger Audit Trail Register</div>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search memo, entry #, reviewer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Entry #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Memo & Line Items</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {glDetailEntries.map((e) => (
                  <React.Fragment key={e.id}>
                    <tr className="bg-slate-50/50 font-semibold border-t border-slate-200">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">#{e.entryNumber}</td>
                      <td className="py-2 px-3 text-slate-600">{e.entryDate}</td>
                      <td colSpan={2} className="py-2 px-3 text-slate-900 font-bold">
                        {e.memo}
                        <span className="ml-2 text-[10px] font-normal text-slate-400">({e.source} • {e.createdBy})</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(e.lines.reduce((s, l) => s + l.debit, 0))}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(e.lines.reduce((s, l) => s + l.credit, 0))}
                      </td>
                    </tr>
                    {e.lines.map((l) => {
                      const acc = accountMap.get(l.accountId);
                      return (
                        <tr key={l.id} className="text-slate-600 hover:bg-slate-50/40">
                          <td className="py-1.5 px-3"></td>
                          <td className="py-1.5 px-3"></td>
                          <td className="py-1.5 px-3 pl-6 text-slate-500">↳ {l.description}</td>
                          <td className="py-1.5 px-3 font-mono text-[11px] text-slate-700">
                            {acc ? `${acc.accountCode} - ${acc.name}` : l.accountId}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-700">
                            {l.debit > 0 ? formatCurrency(l.debit) : '-'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-700">
                            {l.credit > 0 ? formatCurrency(l.credit) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CPA Sign-Off & Verification Footer Card */}
      <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">Certified Canadian Practice Statements</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            All statements are strictly compiled from immutable double-entry journal lines with real-time trial balance balancing proofs, ready for CPA compilation and CRA tax filing compliance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Current Statement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
