import { ChartOfAccount, JournalEntry, LedgerLine, CanadianProvince } from '../types';
import { extractTaxesFromGrossTotal } from './taxCalculator';

export interface CSVRow {
  [key: string]: string;
}

export interface ParsedCSVResult {
  fileName: string;
  sourceType: 'qbo' | 'wave' | 'bank_feed' | 'custom';
  rowCount: number;
  headers: string[];
  rows: CSVRow[];
  extractedEntries: Partial<JournalEntry>[];
  warnings: string[];
}

export function parseCSVText(csvText: string): { headers: string[]; rows: CSVRow[] } {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Parse header
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCSVLine(lines[i]);
    const rowObj: CSVRow = {};
    headers.forEach((header, idx) => {
      rowObj[header] = rawCols[idx] ? rawCols[idx].trim().replace(/^["']|["']$/g, '') : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Converts parsed CSV rows into structured Journal Entries based on detected schema
 */
export function convertCSVToLedgerEntries(
  parsed: { headers: string[]; rows: CSVRow[] },
  fileName: string,
  clientId: string,
  accounts: ChartOfAccount[],
  province: CanadianProvince = 'QC'
): ParsedCSVResult {
  const { headers, rows } = parsed;
  const warnings: string[] = [];
  let sourceType: 'qbo' | 'wave' | 'bank_feed' | 'custom' = 'custom';

  const lowerHeaders = headers.map((h) => h.toLowerCase());

  if (lowerHeaders.some((h) => h.includes('quickbooks') || (h.includes('trans #') && h.includes('split')))) {
    sourceType = 'qbo';
  } else if (lowerHeaders.some((h) => h.includes('wave') || (h.includes('transaction id') && h.includes('business')))) {
    sourceType = 'wave';
  } else if (lowerHeaders.some((h) => h.includes('withdrawal') || h.includes('deposit') || h.includes('balance'))) {
    sourceType = 'bank_feed';
  }

  // Find standard default accounts
  const bankAcc = accounts.find((a) => a.classification === 'bank') || accounts[0];
  const salesAcc = accounts.find((a) => a.classification === 'operating_revenue') || accounts[0];
  const expenseAcc = accounts.find((a) => a.classification === 'operating_expense') || accounts[0];
  const gstAcc = accounts.find((a) => a.accountCode === '2150');
  const qstAcc = accounts.find((a) => a.accountCode === '2160');

  const entries: Partial<JournalEntry>[] = [];

  rows.forEach((row, index) => {
    // Find date field
    const dateKey = Object.keys(row).find((k) => k.toLowerCase().includes('date')) || headers[0];
    const descKey = Object.keys(row).find((k) => k.toLowerCase().includes('desc') || k.toLowerCase().includes('memo') || k.toLowerCase().includes('vendor')) || headers[1];
    const amountKey = Object.keys(row).find((k) => k.toLowerCase().includes('amount') || k.toLowerCase().includes('total') || k.toLowerCase().includes('net')) || headers[2];

    const rawDate = row[dateKey] || '2026-08-01';
    const description = row[descKey] || `Imported transaction #${index + 1}`;
    const rawAmountStr = (row[amountKey] || '0').replace(/[$,]/g, '').trim();
    const amount = parseFloat(rawAmountStr) || 0;

    if (amount === 0) return;

    const formattedDate = sanitizeDate(rawDate);
    const isOutflow = amount < 0 || row['Type']?.toLowerCase().includes('expense') || row['Type']?.toLowerCase().includes('payment');
    const absAmount = Math.abs(amount);

    // Auto calculate tax for realistic imported expense
    const taxes = extractTaxesFromGrossTotal(absAmount, province);

    const lines: LedgerLine[] = [];
    const entryId = `import-entry-${Date.now()}-${index}`;

    if (isOutflow) {
      // Outflow: Debit Expense + Tax Accounts, Credit Bank
      if (province === 'QC' && gstAcc && qstAcc) {
        lines.push({
          id: `line-${entryId}-1`,
          journalEntryId: entryId,
          accountId: expenseAcc.id,
          description: description,
          debit: taxes.subtotal,
          credit: 0,
          taxCode: 'GST_QST',
        });
        lines.push({
          id: `line-${entryId}-2`,
          journalEntryId: entryId,
          accountId: gstAcc.id,
          description: 'GST Paid on Purchase (5%)',
          debit: taxes.gstAmount,
          credit: 0,
        });
        lines.push({
          id: `line-${entryId}-3`,
          journalEntryId: entryId,
          accountId: qstAcc.id,
          description: 'QST Paid on Purchase (9.975%)',
          debit: taxes.qstAmount,
          credit: 0,
        });
      } else {
        lines.push({
          id: `line-${entryId}-1`,
          journalEntryId: entryId,
          accountId: expenseAcc.id,
          description: description,
          debit: absAmount,
          credit: 0,
        });
      }

      lines.push({
        id: `line-${entryId}-bank`,
        journalEntryId: entryId,
        accountId: bankAcc.id,
        description: 'Bank payment',
        debit: 0,
        credit: absAmount,
      });
    } else {
      // Inflow: Debit Bank, Credit Revenue + Tax
      lines.push({
        id: `line-${entryId}-bank`,
        journalEntryId: entryId,
        accountId: bankAcc.id,
        description: 'Bank deposit',
        debit: absAmount,
        credit: 0,
      });

      if (province === 'QC' && gstAcc && qstAcc) {
        lines.push({
          id: `line-${entryId}-sales`,
          journalEntryId: entryId,
          accountId: salesAcc.id,
          description: description,
          debit: 0,
          credit: taxes.subtotal,
          taxCode: 'GST_QST',
        });
        lines.push({
          id: `line-${entryId}-gst`,
          journalEntryId: entryId,
          accountId: gstAcc.id,
          description: 'GST Collected (5%)',
          debit: 0,
          credit: taxes.gstAmount,
        });
        lines.push({
          id: `line-${entryId}-qst`,
          journalEntryId: entryId,
          accountId: qstAcc.id,
          description: 'QST Collected (9.975%)',
          debit: 0,
          credit: taxes.qstAmount,
        });
      } else {
        lines.push({
          id: `line-${entryId}-sales`,
          journalEntryId: entryId,
          accountId: salesAcc.id,
          description: description,
          debit: 0,
          credit: absAmount,
        });
      }
    }

    entries.push({
      id: entryId,
      clientBusinessId: clientId,
      entryNumber: 1000 + index,
      entryDate: formattedDate,
      memo: `[Imported] ${description}`,
      source: sourceType === 'qbo' ? 'qbo_import' : sourceType === 'wave' ? 'wave_import' : 'bank_feed',
      status: 'posted',
      createdBy: 'user-import-bot',
      postedAt: new Date().toISOString(),
      lines,
    });
  });

  return {
    fileName,
    sourceType,
    rowCount: rows.length,
    headers,
    rows: rows.slice(0, 10), // sample 10 preview
    extractedEntries: entries,
    warnings,
  };
}

function sanitizeDate(raw: string): string {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return '2026-08-01';
}

export const SAMPLE_QBO_CSV = `Date,Transaction Type,Num,Name,Memo/Description,Split,Amount,Balance
2026-08-02,Expense,CHEQ-104,Bell Canada,Internet & Fiber Optic Line,Telephone & Internet,-149.50,42150.20
2026-08-04,Deposit,DEP-98,Client Payment - Consulting,Services Rendered,Consulting Revenue,2874.38,45024.58
2026-08-07,Expense,CC-442,Bureau en Gros,Printer Toner & Copy Paper,Office Supplies,-218.45,44806.13
2026-08-11,Expense,EFT-991,Hydro-Québec,Monthly Commercial Power,Utilities Expense,-432.18,44373.95
2026-08-14,Deposit,DEP-99,SaaS Subscription Invoicing,August Platform Retainers,Operating Revenue,6450.00,50823.95`;

export const SAMPLE_WAVE_CSV = `Transaction ID,Date,Description,Account,Amount,Type
WV-8491,2026-08-03,Costco Wholesale Wholesale food supplies,Cost of Goods Sold,-684.20,Withdrawal
WV-8492,2026-08-06,Stripe Payout - Online Store Sales,Operating Revenue,3420.00,Deposit
WV-8493,2026-08-09,Canada Post Expedited Shipping,Shipping & Delivery,-88.40,Withdrawal
WV-8494,2026-08-12,Google Workspace Suite Subscription,Software & SaaS Subscriptions,-46.80,Withdrawal`;

export const SAMPLE_BANK_CSV = `Date,Description,Withdrawal,Deposit,Balance
2026-08-01,PRE-AUTHORIZED DEBIT HYDRO QUEBEC,328.40,,34820.10
2026-08-05,DESJARDINS MERCHANT SETTLEMENT,,4290.00,39110.10
2026-08-08,INTERAC E-TRANSFER OUT OFFICE RENT,2450.00,,36660.10
2026-08-12,PURCHASE AMAZON BUSINESS CA,184.95,,36475.15`;
