// src/hooks/useFinancialReports.ts
import { useState, useMemo, useCallback } from 'react';
import {
  ChartOfAccount,
  ClientBusiness,
  JournalEntry,
} from '../types';
import {
  generateProfitAndLoss,
  generateBalanceSheet,
  generateTrialBalance,
} from '../utils/ledgerEngine';
import { StatementExporter } from '../utils/statementExporter';

export interface UseFinancialReportsProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
  firmName?: string;
  preparedBy?: string;
}

export type ReportType = 'pnl' | 'balance_sheet' | 'trial_balance' | 'gl_detail';
export type PeriodFilter = 'YTD' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ALL';

export function useFinancialReports({
  client,
  accounts,
  entries,
  firmName = 'Studio Bookkeeping & Associates Inc.',
  preparedBy = 'Sarah Tremblay, CPA',
}: UseFinancialReportsProps) {
  const [reportType, setReportType] = useState<ReportType>('pnl');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('YTD');
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Account map for rapid lookups
  const accountMap = useMemo(() => {
    const map = new Map<string, ChartOfAccount>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Filter entries based on period
  const filteredEntries = useMemo(() => {
    if (periodFilter === 'ALL') return entries;

    return entries.filter((e) => {
      const month = parseInt(e.entryDate.split('-')[1] || '1', 10);
      if (periodFilter === 'Q1') return month >= 1 && month <= 3;
      if (periodFilter === 'Q2') return month >= 4 && month <= 6;
      if (periodFilter === 'Q3') return month >= 7 && month <= 9;
      if (periodFilter === 'Q4') return month >= 10 && month <= 12;
      return true; // YTD
    });
  }, [entries, periodFilter]);

  // Period label for headers
  const periodLabel = useMemo(() => {
    switch (periodFilter) {
      case 'Q1': return 'First Quarter (Q1 2026)';
      case 'Q2': return 'Second Quarter (Q2 2026)';
      case 'Q3': return 'Third Quarter (Q3 2026)';
      case 'Q4': return 'Fourth Quarter (Q4 2026)';
      case 'ALL': return 'Full Cumulative Ledger History';
      default: return 'Year-to-Date (Ended August 2026)';
    }
  }, [periodFilter]);

  // Generate Accounting Statements
  const pnl = useMemo(() => {
    return generateProfitAndLoss(accounts, filteredEntries);
  }, [accounts, filteredEntries]);

  const balanceSheet = useMemo(() => {
    return generateBalanceSheet(accounts, filteredEntries);
  }, [accounts, filteredEntries]);

  const trialBalance = useMemo(() => {
    return generateTrialBalance(accounts, filteredEntries);
  }, [accounts, filteredEntries]);

  // Balance Sheet Verification Proof
  const balanceSheetProof = useMemo(() => {
    const totalAssets = balanceSheet.totalAssets;
    const liabilitiesAndEquity = balanceSheet.totalLiabilitiesAndEquity;
    const variance = Math.round(Math.abs(totalAssets - liabilitiesAndEquity) * 100) / 100;
    const isBalanced = variance < 0.01;

    return {
      totalAssets,
      liabilitiesAndEquity,
      variance,
      isBalanced,
    };
  }, [balanceSheet]);

  // Trial Balance Verification Proof
  const trialBalanceProof = useMemo(() => {
    const totalDebits = trialBalance.totalDebits;
    const totalCredits = trialBalance.totalCredits;
    const variance = Math.round(Math.abs(totalDebits - totalCredits) * 100) / 100;
    const isBalanced = variance < 0.01;

    return {
      totalDebits,
      totalCredits,
      variance,
      isBalanced,
    };
  }, [trialBalance]);

  // GL Detail Filtered Rows
  const glDetailEntries = useMemo(() => {
    if (!searchTerm) return filteredEntries;
    const term = searchTerm.toLowerCase();
    return filteredEntries.filter(
      (e) =>
        e.memo.toLowerCase().includes(term) ||
        e.entryNumber.toString().includes(term) ||
        e.createdBy.toLowerCase().includes(term) ||
        e.lines.some((l) => l.description.toLowerCase().includes(term))
    );
  }, [filteredEntries, searchTerm]);

  // Export to Excel / CSV
  const exportToExcel = useCallback(() => {
    setIsExporting(true);
    const options = { client, firmName, preparedBy, periodLabel };
    const dateStr = new Date().toISOString().split('T')[0];
    const safeClient = client.legalName.replace(/[^a-zA-Z0-9]/g, '_');

    try {
      if (reportType === 'pnl') {
        const csv = StatementExporter.generatePnlCSV(pnl, options);
        StatementExporter.downloadCSV(`${safeClient}_Profit_And_Loss_${dateStr}.csv`, csv);
      } else if (reportType === 'balance_sheet') {
        const csv = StatementExporter.generateBalanceSheetCSV(balanceSheet, options);
        StatementExporter.downloadCSV(`${safeClient}_Balance_Sheet_${dateStr}.csv`, csv);
      } else if (reportType === 'trial_balance') {
        const csv = StatementExporter.generateTrialBalanceCSV(trialBalance, options);
        StatementExporter.downloadCSV(`${safeClient}_Trial_Balance_${dateStr}.csv`, csv);
      } else {
        const csv = StatementExporter.generateGLDetailCSV(filteredEntries, accountMap, options);
        StatementExporter.downloadCSV(`${safeClient}_GL_Audit_Trail_${dateStr}.csv`, csv);
      }
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  }, [reportType, client, firmName, preparedBy, periodLabel, pnl, balanceSheet, trialBalance, filteredEntries, accountMap]);

  // Export to PDF / Print Window
  const exportToPDF = useCallback(() => {
    const options = { client, firmName, preparedBy, periodLabel };

    let title = 'Financial Statement';
    let tableHtml = '';

    if (reportType === 'pnl') {
      title = 'Statement of Profit and Loss';
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th class="num">Amount (CAD)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="section-header"><td colspan="3">1. Operating Revenue</td></tr>
            ${pnl.revenueAccounts
              .map(
                (a) => `<tr>
                  <td>${a.account.accountCode}</td>
                  <td>${a.account.name}</td>
                  <td class="num">${a.netBalance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>`
              )
              .join('')}
            <tr class="subtotal-row">
              <td colspan="2">Total Operating Revenue</td>
              <td class="num">${pnl.totalRevenue.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>

            ${
              pnl.totalCogs > 0
                ? `<tr class="section-header"><td colspan="3">2. Cost of Goods Sold (COGS)</td></tr>
                ${pnl.cogsAccounts
                  .map(
                    (a) => `<tr>
                    <td>${a.account.accountCode}</td>
                    <td>${a.account.name}</td>
                    <td class="num">${a.netBalance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                  </tr>`
                  )
                  .join('')}
                <tr class="subtotal-row">
                  <td colspan="2">Total Cost of Goods Sold</td>
                  <td class="num">${pnl.totalCogs.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>
                <tr class="subtotal-row" style="background: #f1f5f9;">
                  <td colspan="2">Gross Operating Profit</td>
                  <td class="num">${pnl.grossProfit.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>`
                : ''
            }

            <tr class="section-header"><td colspan="3">3. Operating Expenses</td></tr>
            ${pnl.expenseAccounts
              .map(
                (a) => `<tr>
                  <td>${a.account.accountCode}</td>
                  <td>${a.account.name}</td>
                  <td class="num">${a.netBalance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>`
              )
              .join('')}
            <tr class="subtotal-row">
              <td colspan="2">Total Operating Expenses</td>
              <td class="num">${pnl.totalExpenses.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>

            <tr class="grand-total">
              <td colspan="2">NET OPERATING INCOME / (LOSS)</td>
              <td class="num">${pnl.netIncome.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (reportType === 'balance_sheet') {
      title = 'Balance Sheet Statement of Financial Position';
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th class="num">Balance (CAD)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="section-header"><td colspan="3">Assets</td></tr>
            ${balanceSheet.assetAccounts
              .map(
                (a) => `<tr>
                  <td>${a.account.accountCode}</td>
                  <td>${a.account.name}</td>
                  <td class="num">${a.netBalance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>`
              )
              .join('')}
            <tr class="subtotal-row">
              <td colspan="2">Total Assets</td>
              <td class="num">${balanceSheet.totalAssets.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>

            <tr class="section-header"><td colspan="3">Liabilities</td></tr>
            ${balanceSheet.liabilityAccounts
              .map(
                (a) => `<tr>
                  <td>${a.account.accountCode}</td>
                  <td>${a.account.name}</td>
                  <td class="num">${a.netBalance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>`
              )
              .join('')}
            <tr class="subtotal-row">
              <td colspan="2">Total Liabilities</td>
              <td class="num">${balanceSheet.totalLiabilities.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>

            <tr class="section-header"><td colspan="3">Equity</td></tr>
            ${balanceSheet.equityAccounts
              .map(
                (a) => `<tr>
                  <td>${a.account.accountCode}</td>
                  <td>${a.account.name}</td>
                  <td class="num">${a.netBalance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
                </tr>`
              )
              .join('')}
            <tr>
              <td>-</td>
              <td>Current Period Net Operating Income</td>
              <td class="num">${balanceSheet.currentPeriodNetIncome.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>
            <tr class="subtotal-row">
              <td colspan="2">Total Equity</td>
              <td class="num">${balanceSheet.totalEquity.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>

            <tr class="grand-total">
              <td colspan="2">TOTAL LIABILITIES & EQUITY</td>
              <td class="num">${balanceSheet.totalLiabilitiesAndEquity.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (reportType === 'trial_balance') {
      title = 'Trial Balance Working Papers';
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Type</th>
              <th class="num">Debit (CAD)</th>
              <th class="num">Credit (CAD)</th>
            </tr>
          </thead>
          <tbody>
            ${trialBalance.items
              .map(
                (r) => `<tr>
                  <td><strong>${r.accountCode}</strong></td>
                  <td>${r.accountName}</td>
                  <td>${r.type.toUpperCase()}</td>
                  <td class="num">${r.debit > 0 ? r.debit.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }) : '-'}</td>
                  <td class="num">${r.credit > 0 ? r.credit.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }) : '-'}</td>
                </tr>`
              )
              .join('')}
            <tr class="grand-total">
              <td colspan="3">TRIAL BALANCE TOTALS</td>
              <td class="num">${trialBalance.totalDebits.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
              <td class="num">${trialBalance.totalCredits.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      title = 'General Ledger Audit Trail Register';
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Entry #</th>
              <th>Date</th>
              <th>Memo / Description</th>
              <th>Account</th>
              <th class="num">Debit</th>
              <th class="num">Credit</th>
            </tr>
          </thead>
          <tbody>
            ${filteredEntries
              .map((e) =>
                e.lines
                  .map((l, idx) => {
                    const acc = accountMap.get(l.accountId);
                    return `<tr>
                    <td>${idx === 0 ? `<strong>#${e.entryNumber}</strong>` : ''}</td>
                    <td>${idx === 0 ? e.entryDate : ''}</td>
                    <td>${idx === 0 ? `<strong>${e.memo}</strong><br>` : ''}<span style="color: #64748b;">${l.description}</span></td>
                    <td>${acc ? `${acc.accountCode} - ${acc.name}` : l.accountId}</td>
                    <td class="num">${l.debit > 0 ? l.debit.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }) : '-'}</td>
                    <td class="num">${l.credit > 0 ? l.credit.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }) : '-'}</td>
                  </tr>`;
                  })
                  .join('')
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    StatementExporter.printStatementWindow(title, tableHtml, options);
  }, [reportType, client, firmName, preparedBy, periodLabel, pnl, balanceSheet, trialBalance, filteredEntries, accountMap]);

  return {
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
  };
}
