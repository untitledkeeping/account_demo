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

export interface UseFinancialReportsProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
}

export type ReportType = 'pnl' | 'balance_sheet' | 'trial_balance';

export function useFinancialReports({
  client,
  accounts,
  entries,
}: UseFinancialReportsProps) {
  const [reportType, setReportType] = useState<ReportType>('pnl');
  const [isExporting, setIsExporting] = useState(false);

  // Generate Accounting Statements
  const pnl = useMemo(() => {
    return generateProfitAndLoss(accounts, entries);
  }, [accounts, entries]);

  const balanceSheet = useMemo(() => {
    return generateBalanceSheet(accounts, entries);
  }, [accounts, entries]);

  const trialBalance = useMemo(() => {
    return generateTrialBalance(accounts, entries);
  }, [accounts, entries]);

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

  // CSV Export Handler
  const exportCurrentReportToCSV = useCallback(() => {
    setIsExporting(true);
    let filename = '';
    let csvContent = '';

    if (reportType === 'pnl') {
      filename = `${client.legalName.replace(/ /g, '_')}_Profit_And_Loss_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['Category', 'Account Code', 'Account Name', 'Amount (CAD)'];
      const rows: string[][] = [];

      pnl.revenueAccounts.forEach((a) => {
        rows.push(['Operating Revenue', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
      });
      rows.push(['Total Revenue', '', '', pnl.totalRevenue.toFixed(2)]);

      pnl.cogsAccounts.forEach((a) => {
        rows.push(['COGS', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
      });
      rows.push(['Total COGS', '', '', pnl.totalCogs.toFixed(2)]);
      rows.push(['Gross Operating Profit', '', '', pnl.grossProfit.toFixed(2)]);

      pnl.expenseAccounts.forEach((a) => {
        rows.push(['Operating Expense', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
      });
      rows.push(['Total Operating Expenses', '', '', pnl.totalExpenses.toFixed(2)]);
      rows.push(['Net Operating Income', '', '', pnl.netIncome.toFixed(2)]);

      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (reportType === 'balance_sheet') {
      filename = `${client.legalName.replace(/ /g, '_')}_Balance_Sheet_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['Section', 'Account Code', 'Account Name', 'Balance (CAD)'];
      const rows: string[][] = [];

      balanceSheet.assets.forEach((a) => {
        rows.push(['Assets', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
      });
      rows.push(['Total Assets', '', '', balanceSheet.totalAssets.toFixed(2)]);

      balanceSheet.liabilities.forEach((a) => {
        rows.push(['Liabilities', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
      });
      rows.push(['Total Liabilities', '', '', balanceSheet.totalLiabilities.toFixed(2)]);

      balanceSheet.equity.forEach((a) => {
        rows.push(['Equity', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
      });
      rows.push(['Current Period Net Income', '', '', balanceSheet.currentYearNetIncome.toFixed(2)]);
      rows.push(['Total Equity', '', '', balanceSheet.totalEquity.toFixed(2)]);
      rows.push(['Total Liabilities & Equity', '', '', balanceSheet.totalLiabilitiesAndEquity.toFixed(2)]);

      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      filename = `${client.legalName.replace(/ /g, '_')}_Trial_Balance_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['Account Code', 'Account Name', 'Type', 'Debit (CAD)', 'Credit (CAD)'];
      const rows = trialBalance.rows.map((r) => [
        r.account.accountCode,
        `"${r.account.name.replace(/"/g, '""')}"`,
        r.account.type.toUpperCase(),
        r.debit > 0 ? r.debit.toFixed(2) : '0.00',
        r.credit > 0 ? r.credit.toFixed(2) : '0.00',
      ]);
      rows.push(['TOTALS', '', '', trialBalance.totalDebits.toFixed(2), trialBalance.totalCredits.toFixed(2)]);

      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 1500);
  }, [reportType, client.legalName, pnl, balanceSheet, trialBalance]);

  return {
    reportType,
    setReportType,
    pnl,
    balanceSheet,
    trialBalance,
    balanceSheetProof,
    trialBalanceProof,
    isExporting,
    exportCurrentReportToCSV,
  };
}
