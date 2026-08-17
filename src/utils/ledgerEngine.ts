import {
  ChartOfAccount,
  JournalEntry,
  SalesTaxSummary,
  ClientBusiness,
} from '../types';

export interface AccountBalance {
  account: ChartOfAccount;
  debitTotal: number;
  creditTotal: number;
  netBalance: number; // Signed based on normal balance
}

export interface ProfitAndLossReport {
  period: string;
  revenueAccounts: AccountBalance[];
  totalRevenue: number;
  cogsAccounts: AccountBalance[];
  totalCogs: number;
  grossProfit: number;
  expenseAccounts: AccountBalance[];
  totalExpenses: number;
  netIncome: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assetAccounts: AccountBalance[];
  totalAssets: number;
  liabilityAccounts: AccountBalance[];
  totalLiabilities: number;
  equityAccounts: AccountBalance[];
  retainedEarnings: number;
  currentPeriodNetIncome: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  variance: number;
}

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceReport {
  items: TrialBalanceItem[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

/**
 * Calculates raw debit and credit sums per account from all posted journal entries
 */
export function calculateAccountBalances(
  accounts: ChartOfAccount[],
  entries: JournalEntry[],
  asOfDate?: string
): Map<string, AccountBalance> {
  const balanceMap = new Map<string, AccountBalance>();

  for (const acc of accounts) {
    balanceMap.set(acc.id, {
      account: acc,
      debitTotal: 0,
      creditTotal: 0,
      netBalance: 0,
    });
  }

  const validEntries = entries.filter((e) => {
    if (e.status !== 'posted') return false;
    if (asOfDate && e.entryDate > asOfDate) return false;
    return true;
  });

  for (const entry of validEntries) {
    for (const line of entry.lines) {
      const balance = balanceMap.get(line.accountId);
      if (balance) {
        balance.debitTotal += line.debit;
        balance.creditTotal += line.credit;
      }
    }
  }

  // Calculate Net Balance according to GAAP normal balance rules
  balanceMap.forEach((bal) => {
    const type = bal.account.type;
    if (type === 'asset' || type === 'expense') {
      // Normal balance is DEBIT
      bal.netBalance = bal.debitTotal - bal.creditTotal;
    } else {
      // Normal balance is CREDIT (liability, equity, revenue)
      bal.netBalance = bal.creditTotal - bal.debitTotal;
    }
  });

  return balanceMap;
}

/**
 * Generates the Trial Balance report
 */
export function generateTrialBalance(
  accounts: ChartOfAccount[],
  entries: JournalEntry[],
  asOfDate?: string
): TrialBalanceReport {
  const balanceMap = calculateAccountBalances(accounts, entries, asOfDate);
  const items: TrialBalanceItem[] = [];
  let totalDebits = 0;
  let totalCredits = 0;

  accounts
    .slice()
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
    .forEach((acc) => {
      const bal = balanceMap.get(acc.id);
      if (!bal || (bal.debitTotal === 0 && bal.creditTotal === 0)) return;

      let debit = 0;
      let credit = 0;

      if (acc.type === 'asset' || acc.type === 'expense') {
        const net = bal.debitTotal - bal.creditTotal;
        if (net >= 0) debit = net;
        else credit = -net;
      } else {
        const net = bal.creditTotal - bal.debitTotal;
        if (net >= 0) credit = net;
        else debit = -net;
      }

      totalDebits += debit;
      totalCredits += credit;

      items.push({
        accountCode: acc.accountCode,
        accountName: acc.name,
        type: acc.type,
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
      });
    });

  totalDebits = Math.round(totalDebits * 100) / 100;
  totalCredits = Math.round(totalCredits * 100) / 100;

  return {
    items,
    totalDebits,
    totalCredits,
    isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
  };
}

/**
 * Generates Profit & Loss (Income Statement)
 */
export function generateProfitAndLoss(
  accounts: ChartOfAccount[],
  entries: JournalEntry[],
  startDate?: string,
  endDate?: string
): ProfitAndLossReport {
  const filteredEntries = entries.filter((e) => {
    if (e.status !== 'posted') return false;
    if (startDate && e.entryDate < startDate) return false;
    if (endDate && e.entryDate > endDate) return false;
    return true;
  });

  const balanceMap = calculateAccountBalances(accounts, filteredEntries);

  const revenueAccounts: AccountBalance[] = [];
  const cogsAccounts: AccountBalance[] = [];
  const expenseAccounts: AccountBalance[] = [];

  let totalRevenue = 0;
  let totalCogs = 0;
  let totalExpenses = 0;

  accounts.forEach((acc) => {
    const bal = balanceMap.get(acc.id);
    if (!bal || (bal.debitTotal === 0 && bal.creditTotal === 0)) return;

    if (acc.type === 'revenue') {
      revenueAccounts.push(bal);
      totalRevenue += bal.netBalance;
    } else if (acc.classification === 'cost_of_goods_sold') {
      cogsAccounts.push(bal);
      totalCogs += bal.netBalance;
    } else if (acc.type === 'expense') {
      expenseAccounts.push(bal);
      totalExpenses += bal.netBalance;
    }
  });

  totalRevenue = Math.round(totalRevenue * 100) / 100;
  totalCogs = Math.round(totalCogs * 100) / 100;
  totalExpenses = Math.round(totalExpenses * 100) / 100;

  const grossProfit = Math.round((totalRevenue - totalCogs) * 100) / 100;
  const netIncome = Math.round((grossProfit - totalExpenses) * 100) / 100;

  return {
    period: startDate && endDate ? `${startDate} to ${endDate}` : 'Year to Date 2026',
    revenueAccounts,
    totalRevenue,
    cogsAccounts,
    totalCogs,
    grossProfit,
    expenseAccounts,
    totalExpenses,
    netIncome,
  };
}

/**
 * Generates Balance Sheet
 */
export function generateBalanceSheet(
  accounts: ChartOfAccount[],
  entries: JournalEntry[],
  asOfDate: string = '2026-12-31'
): BalanceSheetReport {
  const balanceMap = calculateAccountBalances(accounts, entries, asOfDate);

  const assetAccounts: AccountBalance[] = [];
  const liabilityAccounts: AccountBalance[] = [];
  const equityAccounts: AccountBalance[] = [];

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquityRaw = 0;

  // Compute Net Income for current period to reflect in Equity
  const pnl = generateProfitAndLoss(accounts, entries, undefined, asOfDate);
  const currentPeriodNetIncome = pnl.netIncome;

  accounts.forEach((acc) => {
    const bal = balanceMap.get(acc.id);
    if (!bal) return;

    if (acc.type === 'asset' && bal.netBalance !== 0) {
      assetAccounts.push(bal);
      totalAssets += bal.netBalance;
    } else if (acc.type === 'liability' && bal.netBalance !== 0) {
      liabilityAccounts.push(bal);
      totalLiabilities += bal.netBalance;
    } else if (acc.type === 'equity' && bal.netBalance !== 0) {
      equityAccounts.push(bal);
      totalEquityRaw += bal.netBalance;
    }
  });

  totalAssets = Math.round(totalAssets * 100) / 100;
  totalLiabilities = Math.round(totalLiabilities * 100) / 100;
  const totalEquity = Math.round((totalEquityRaw + currentPeriodNetIncome) * 100) / 100;
  const totalLiabilitiesAndEquity = Math.round((totalLiabilities + totalEquity) * 100) / 100;
  const variance = Math.round((totalAssets - totalLiabilitiesAndEquity) * 100) / 100;

  return {
    asOfDate,
    assetAccounts,
    totalAssets,
    liabilityAccounts,
    totalLiabilities,
    equityAccounts,
    retainedEarnings: totalEquityRaw,
    currentPeriodNetIncome,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced: Math.abs(variance) < 0.05,
    variance,
  };
}

/**
 * Calculates Canadian Sales Tax Summary (GST Line 105/108 & QST Line 205/208)
 */
export function generateSalesTaxSummary(
  client: ClientBusiness,
  accounts: ChartOfAccount[],
  entries: JournalEntry[],
  period: string = '2026-Q2'
): SalesTaxSummary {
  // Find sales tax payable accounts
  const gstPayableAcc = accounts.find((a) => a.accountCode === '2150' || a.name.toLowerCase().includes('gst'));
  const qstPayableAcc = accounts.find((a) => a.accountCode === '2160' || a.name.toLowerCase().includes('qst'));

  let line101SalesTotal = 0;
  let line105GstCollected = 0;
  let line108ItcsClaimed = 0;

  let line201SalesTotal = 0;
  let line205QstCollected = 0;
  let line208ItrsClaimed = 0;

  const validEntries = entries.filter((e) => e.status === 'posted');

  for (const entry of validEntries) {
    for (const line of entry.lines) {
      // Check if line is Revenue to estimate taxable sales
      const acc = accounts.find((a) => a.id === line.accountId);
      if (acc?.type === 'revenue') {
        line101SalesTotal += line.credit;
        line201SalesTotal += line.credit;
      }

      // Check GST Account Lines
      if (gstPayableAcc && line.accountId === gstPayableAcc.id) {
        // Credits on liability = Tax Collected on sales
        line105GstCollected += line.credit;
        // Debits on liability = Input Tax Credits (ITCs) paid on expenses
        line108ItcsClaimed += line.debit;
      }

      // Check QST Account Lines
      if (qstPayableAcc && line.accountId === qstPayableAcc.id) {
        // Credits = QST Collected
        line205QstCollected += line.credit;
        // Debits = Input Tax Refunds (ITRs) paid
        line208ItrsClaimed += line.debit;
      }
    }
  }

  line101SalesTotal = Math.round(line101SalesTotal * 100) / 100;
  line105GstCollected = Math.round(line105GstCollected * 100) / 100;
  line108ItcsClaimed = Math.round(line108ItcsClaimed * 100) / 100;
  const line109NetGstPayable = Math.round((line105GstCollected - line108ItcsClaimed) * 100) / 100;

  line201SalesTotal = Math.round(line201SalesTotal * 100) / 100;
  line205QstCollected = Math.round(line205QstCollected * 100) / 100;
  line208ItrsClaimed = Math.round(line208ItrsClaimed * 100) / 100;
  const line209NetQstPayable = Math.round((line205QstCollected - line208ItrsClaimed) * 100) / 100;

  const totalRemittanceDue = Math.round((line109NetGstPayable + (client.provinceCode === 'QC' ? line209NetQstPayable : 0)) * 100) / 100;

  return {
    period,
    province: client.provinceCode,
    gst: {
      line101SalesTotal,
      line105GstCollected,
      line108ItcsClaimed,
      line109NetGstPayable,
    },
    qst:
      client.provinceCode === 'QC'
        ? {
            line201SalesTotal,
            line205QstCollected,
            line208ItrsClaimed,
            line209NetQstPayable,
          }
        : undefined,
    totalRemittanceDue,
  };
}

/**
 * Creates an immutable reversing entry for a posted journal entry
 */
export function createReversalJournalEntry(
  originalEntry: JournalEntry,
  userId: string,
  reversalReason: string = 'Correction of previous entry'
): JournalEntry {
  const reversedLines = originalEntry.lines.map((line, idx) => ({
    id: `rev-line-${Date.now()}-${idx}`,
    journalEntryId: '',
    accountId: line.accountId,
    description: `Reversal: ${line.description}`,
    debit: line.credit, // Invert debit and credit
    credit: line.debit,
    taxCode: line.taxCode,
    taxAmount: line.taxAmount,
  }));

  const newEntryId = `je-rev-${Date.now()}`;
  reversedLines.forEach((l) => (l.journalEntryId = newEntryId));

  return {
    id: newEntryId,
    clientBusinessId: originalEntry.clientBusinessId,
    entryNumber: originalEntry.entryNumber + 1000,
    entryDate: new Date().toISOString().split('T')[0],
    memo: `[REVERSAL OF #${originalEntry.entryNumber}] ${reversalReason}`,
    source: 'manual',
    status: 'posted',
    createdBy: userId,
    postedAt: new Date().toISOString(),
    isReversal: true,
    reversalOfEntryId: originalEntry.id,
    lines: reversedLines,
  };
}
