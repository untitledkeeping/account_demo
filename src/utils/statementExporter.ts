// src/utils/statementExporter.ts
import { ClientBusiness, ChartOfAccount, JournalEntry } from '../types';
import { ProfitAndLossReport, BalanceSheetReport, TrialBalanceReport } from '../utils/ledgerEngine';

export interface StatementExportOptions {
  client: ClientBusiness;
  firmName?: string;
  preparedBy?: string;
  periodLabel?: string;
}

export class StatementExporter {
  /**
   * Export financial statement as formatted CSV
   */
  static downloadCSV(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate P&L CSV content
   */
  static generatePnlCSV(pnl: ProfitAndLossReport, options: StatementExportOptions): string {
    const rows: string[][] = [
      ['FINANCIAL STATEMENT: STATEMENT OF PROFIT AND LOSS'],
      [`Client Legal Name`, `"${options.client.legalName}"`],
      [`CRA Business Number`, `"${options.client.businessNumber || 'N/A'}"`],
      [`Jurisdiction`, `"${options.client.provinceCode}, Canada"`],
      [`Reporting Period`, `"${options.periodLabel || 'Current Fiscal Period'}"`],
      [`Prepared By`, `"${options.preparedBy || 'Senior CPA'}"`],
      [`Firm`, `"${options.firmName || 'Studio Bookkeeping & Associates Inc.'}"`],
      [''],
      ['Category', 'Account Code', 'Account Name', 'Amount (CAD)'],
    ];

    // Revenue
    pnl.revenueAccounts.forEach((a) => {
      rows.push(['Operating Revenue', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
    });
    rows.push(['Total Revenue', '', '', pnl.totalRevenue.toFixed(2)]);
    rows.push(['']);

    // COGS
    if (pnl.totalCogs > 0) {
      pnl.cogsAccounts.forEach((a) => {
        rows.push(['Cost of Goods Sold', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
      });
      rows.push(['Total Cost of Goods Sold', '', '', pnl.totalCogs.toFixed(2)]);
      rows.push(['Gross Operating Profit', '', '', pnl.grossProfit.toFixed(2)]);
      rows.push(['']);
    }

    // Expenses
    pnl.expenseAccounts.forEach((a) => {
      rows.push(['Operating Expense', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
    });
    rows.push(['Total Operating Expenses', '', '', pnl.totalExpenses.toFixed(2)]);
    rows.push(['']);
    rows.push(['NET OPERATING INCOME', '', '', pnl.netIncome.toFixed(2)]);

    return rows.map((r) => r.join(',')).join('\n');
  }

  /**
   * Generate Balance Sheet CSV content
   */
  static generateBalanceSheetCSV(bs: BalanceSheetReport, options: StatementExportOptions): string {
    const rows: string[][] = [
      ['FINANCIAL STATEMENT: BALANCE SHEET'],
      [`Client Legal Name`, `"${options.client.legalName}"`],
      [`CRA Business Number`, `"${options.client.businessNumber || 'N/A'}"`],
      [`Jurisdiction`, `"${options.client.provinceCode}, Canada"`],
      [`As of Date`, `"${new Date().toISOString().split('T')[0]}"`],
      [`Prepared By`, `"${options.preparedBy || 'Senior CPA'}"`],
      [`Firm`, `"${options.firmName || 'Studio Bookkeeping & Associates Inc.'}"`],
      [''],
      ['Section', 'Account Code', 'Account Name', 'Balance (CAD)'],
    ];

    // Assets
    bs.assetAccounts.forEach((a) => {
      rows.push(['Assets', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
    });
    rows.push(['Total Assets', '', '', bs.totalAssets.toFixed(2)]);
    rows.push(['']);

    // Liabilities
    bs.liabilityAccounts.forEach((a) => {
      rows.push(['Liabilities', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
    });
    rows.push(['Total Liabilities', '', '', bs.totalLiabilities.toFixed(2)]);
    rows.push(['']);

    // Equity
    bs.equityAccounts.forEach((a) => {
      rows.push(['Equity', a.account.accountCode, `"${a.account.name.replace(/"/g, '""')}"`, a.netBalance.toFixed(2)]);
    });
    rows.push(['Current Period Net Income', '', '', bs.currentPeriodNetIncome.toFixed(2)]);
    rows.push(['Total Equity', '', '', bs.totalEquity.toFixed(2)]);
    rows.push(['']);
    rows.push(['TOTAL LIABILITIES & EQUITY', '', '', bs.totalLiabilitiesAndEquity.toFixed(2)]);

    return rows.map((r) => r.join(',')).join('\n');
  }

  /**
   * Generate Trial Balance CSV content
   */
  static generateTrialBalanceCSV(tb: TrialBalanceReport, options: StatementExportOptions): string {
    const rows: string[][] = [
      ['FINANCIAL STATEMENT: TRIAL BALANCE (WORKING PAPERS)'],
      [`Client Legal Name`, `"${options.client.legalName}"`],
      [`CRA Business Number`, `"${options.client.businessNumber || 'N/A'}"`],
      [`Jurisdiction`, `"${options.client.provinceCode}, Canada"`],
      [`Reporting Date`, `"${new Date().toISOString().split('T')[0]}"`],
      [`Prepared By`, `"${options.preparedBy || 'Senior CPA'}"`],
      [`Firm`, `"${options.firmName || 'Studio Bookkeeping & Associates Inc.'}"`],
      [''],
      ['Account Code', 'Account Name', 'Type', 'Debit (CAD)', 'Credit (CAD)'],
    ];

    tb.items.forEach((r) => {
      rows.push([
        r.accountCode,
        `"${r.accountName.replace(/"/g, '""')}"`,
        r.type.toUpperCase(),
        r.debit > 0 ? r.debit.toFixed(2) : '0.00',
        r.credit > 0 ? r.credit.toFixed(2) : '0.00',
      ]);
    });

    rows.push(['']);
    rows.push(['TRIAL BALANCE TOTALS', '', '', tb.totalDebits.toFixed(2), tb.totalCredits.toFixed(2)]);

    return rows.map((r) => r.join(',')).join('\n');
  }

  /**
   * Generate General Ledger Audit Trail CSV content
   */
  static generateGLDetailCSV(
    entries: JournalEntry[],
    accountMap: Map<string, ChartOfAccount>,
    options: StatementExportOptions
  ): string {
    const rows: string[][] = [
      ['FINANCIAL REPORT: GENERAL LEDGER AUDIT TRAIL REGISTER'],
      [`Client Legal Name`, `"${options.client.legalName}"`],
      [`CRA Business Number`, `"${options.client.businessNumber || 'N/A'}"`],
      [`Jurisdiction`, `"${options.client.provinceCode}, Canada"`],
      [`Prepared By`, `"${options.preparedBy || 'Senior CPA'}"`],
      [`Firm`, `"${options.firmName || 'Studio Bookkeeping & Associates Inc.'}"`],
      [''],
      ['Entry #', 'Date', 'Memo', 'Source', 'Status', 'Account Code', 'Account Name', 'Line Description', 'Debit (CAD)', 'Credit (CAD)', 'Tax Code', 'Created By'],
    ];

    entries.forEach((e) => {
      e.lines.forEach((l) => {
        const acc = accountMap.get(l.accountId);
        rows.push([
          `#${e.entryNumber}`,
          e.entryDate,
          `"${e.memo.replace(/"/g, '""')}"`,
          e.source,
          e.status,
          acc ? acc.accountCode : l.accountId,
          acc ? `"${acc.name.replace(/"/g, '""')}"` : 'Unknown Account',
          `"${l.description.replace(/"/g, '""')}"`,
          l.debit > 0 ? l.debit.toFixed(2) : '0.00',
          l.credit > 0 ? l.credit.toFixed(2) : '0.00',
          l.taxCode || 'NONE',
          `"${e.createdBy.replace(/"/g, '""')}"`,
        ]);
      });
    });

    return rows.map((r) => r.join(',')).join('\n');
  }

  /**
   * Trigger Publication-Ready Print Window for PDF Export
   */
  static printStatementWindow(
    title: string,
    statementHtml: string,
    options: StatementExportOptions
  ) {
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (!printWindow) {
      alert('Please allow popups to open the PDF print preview.');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${options.client.legalName}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 15mm 15mm 20mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .firm-brand {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .client-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    .report-title {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      margin-top: 2px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 11px;
    }
    .meta-item strong {
      display: block;
      font-size: 9px;
      text-transform: uppercase;
      color: #64748b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      border-bottom: 1.5px solid #0f172a;
      padding: 6px 8px;
    }
    th.num, td.num {
      text-align: right;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11px;
    }
    .section-header {
      font-weight: 800;
      background: #f8fafc;
      color: #0f172a;
      text-transform: uppercase;
      font-size: 11px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
    }
    .subtotal-row {
      font-weight: 700;
      border-top: 1px solid #94a3b8;
      border-bottom: 1px solid #94a3b8;
    }
    .grand-total {
      font-weight: 800;
      font-size: 12px;
      border-top: 1.5px solid #0f172a;
      border-bottom: 3px double #0f172a;
    }
    .signoff-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      font-size: 10px;
    }
    .signature-line {
      border-bottom: 1px solid #94a3b8;
      height: 35px;
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="firm-brand">${options.firmName || 'Studio Bookkeeping & Associates Inc.'} • Canadian Practice Platform</div>
    <div class="client-title">${options.client.legalName}</div>
    <div class="report-title">${title}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <strong>CRA Business No.</strong>
      ${options.client.businessNumber || 'Unassigned'}
    </div>
    <div class="meta-item">
      <strong>Jurisdiction</strong>
      ${options.client.provinceCode}, Canada
    </div>
    <div class="meta-item">
      <strong>Reporting Period</strong>
      ${options.periodLabel || 'Fiscal Year 2026'}
    </div>
    <div class="meta-item">
      <strong>Prepared By</strong>
      ${options.preparedBy || 'Sarah Tremblay, CPA'}
    </div>
  </div>

  ${statementHtml}

  <div class="signoff-section">
    <div>
      <div class="signature-line"></div>
      <strong>Prepared By:</strong> ${options.preparedBy || 'Sarah Tremblay, CPA'} (Bookkeeper / Auditor)
      <div style="color: #64748b; margin-top: 2px;">Studio Bookkeeping & Associates Inc.</div>
    </div>
    <div>
      <div class="signature-line"></div>
      <strong>Client Authorization & Acceptance:</strong> ${options.client.legalName}
      <div style="color: #64748b; margin-top: 2px;">Date: ________________________</div>
    </div>
  </div>

  <div class="footer">
    Generated from Immutable Double-Entry Ledger • Studio Books Accounting Engine • Certified Canadian Multi-Client Practice
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
