// src/server/routes/api.ts
import { Router, Request, Response } from 'express';
import prisma from '../db';
import { LedgerService } from '../services/ledgerService';
import { BankService } from '../services/bankService';
import { ReceiptService } from '../services/receiptService';
import { OCRService } from '../services/ocrService';
import { extractTaxesFromGrossTotal } from '../services/taxService';
import { CanadianProvince } from '../../types';

export const apiRouter = Router();

// -------------------------------------------------------------
// 1. Health & Practice Overview
// -------------------------------------------------------------
apiRouter.get('/health', async (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRouter.get('/firm/overview', async (req: Request, res: Response) => {
  try {
    const firmId = (req.headers['x-firm-id'] as string) || 'firm-studio-books-001';
    const firm = await prisma.firm.findFirst({
      where: { id: firmId },
      include: {
        users: true,
        clients: {
          include: {
            bankTransactions: { where: { isReconciled: false } },
            receipts: { where: { status: { in: ['pending_review', 'extracted'] } } },
          },
        },
      },
    });

    if (!firm) {
      return res.status(404).json({ error: 'Firm not found.' });
    }

    const activeClientsCount = firm.clients.filter((c) => c.isActive).length;
    const totalUnreconciledBankTx = firm.clients.reduce((acc, c) => acc + c.bankTransactions.length, 0);
    const totalPendingReceipts = firm.clients.reduce((acc, c) => acc + c.receipts.length, 0);

    res.json({
      id: firm.id,
      name: firm.name,
      subscriptionTier: firm.subscriptionTier,
      activeClientLimit: firm.activeClientLimit,
      activeClientsCount,
      totalUnreconciledBankTx,
      totalPendingReceipts,
      users: firm.users,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 2. Client Businesses
// -------------------------------------------------------------
apiRouter.get('/clients', async (req: Request, res: Response) => {
  try {
    const firmId = (req.headers['x-firm-id'] as string) || 'firm-studio-books-001';
    const clients = await prisma.clientBusiness.findMany({
      where: { firmId },
      orderBy: { legalName: 'asc' },
      include: {
        bankTransactions: { where: { isReconciled: false }, select: { id: true } },
        receipts: { where: { status: { in: ['pending_review', 'extracted'] } }, select: { id: true } },
      },
    });

    const formatted = clients.map((c) => ({
      ...c,
      unreconciledCount: c.bankTransactions.length,
      pendingReceiptsCount: c.receipts.length,
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const client = await prisma.clientBusiness.findUnique({
      where: { id: clientId },
    });
    if (!client) return res.status(404).json({ error: 'Client business not found.' });
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/clients', async (req: Request, res: Response) => {
  try {
    const firmId = (req.headers['x-firm-id'] as string) || 'firm-studio-books-001';
    const {
      legalName,
      operatingName,
      businessNumber,
      provinceCode = 'QC',
      reportingFrequency = 'quarterly',
      gstRegistered = true,
      gstNumber,
      qstRegistered = provinceCode === 'QC',
      qstNumber,
      fiscalYearEndMonth = 12,
      currency = 'CAD',
      assignedBookkeeper,
      notes,
    } = req.body;

    if (!legalName) {
      return res.status(400).json({ error: 'Legal name is required.' });
    }

    // Create client
    const newClient = await prisma.clientBusiness.create({
      data: {
        firmId,
        legalName,
        operatingName,
        businessNumber,
        provinceCode,
        reportingFrequency,
        gstRegistered,
        gstNumber,
        qstRegistered,
        qstNumber,
        fiscalYearEndMonth: Number(fiscalYearEndMonth),
        currency,
        status: 'Up to Date',
        assignedBookkeeper,
        notes,
      },
    });

    // Auto-create standard Canadian chart of accounts for this client
    const standardAccounts = [
      { code: '1010', name: 'Operating Chequing (CAD)', type: 'asset', classification: 'bank', isSystem: true },
      { code: '1020', name: 'Client Retainer Trust Account (Fiduciary CAD)', type: 'asset', classification: 'trust_escrow' },
      { code: '1200', name: 'Accounts Receivable (Trade Debtors)', type: 'asset', classification: 'accounts_receivable', isSystem: true },
      { code: '2000', name: 'Accounts Payable (Trade Vendors)', type: 'liability', classification: 'accounts_payable', isSystem: true },
      { code: '2050', name: 'Corporate Visa / Mastercard', type: 'liability', classification: 'credit_card' },
      { code: '2150', name: 'GST/HST Sales Tax Payable (CRA)', type: 'liability', classification: 'sales_tax_payable', isSystem: true },
      { code: '2160', name: 'QST Sales Tax Payable (Revenu Québec)', type: 'liability', classification: 'sales_tax_payable', isSystem: true },
      { code: '3000', name: 'Retained Earnings', type: 'equity', classification: 'retained_earnings', isSystem: true },
      { code: '3100', name: 'Owner Capital & Common Shares', type: 'equity', classification: 'owner_equity' },
      { code: '4000', name: 'Commercial Sales & Professional Revenue', type: 'revenue', classification: 'operating_revenue' },
      { code: '5000', name: 'Cost of Goods Sold', type: 'expense', classification: 'cost_of_goods_sold' },
      { code: '6000', name: 'Commercial Rent & Lease', type: 'expense', classification: 'operating_expense' },
      { code: '6100', name: 'Office Supplies & Stationery', type: 'expense', classification: 'operating_expense' },
      { code: '6200', name: 'Utilities (Hydro / Gas)', type: 'expense', classification: 'operating_expense' },
      { code: '6300', name: 'Software & SaaS Subscriptions', type: 'expense', classification: 'operating_expense' },
      { code: '6400', name: 'Telephone & Fiber Internet', type: 'expense', classification: 'operating_expense' },
      { code: '6500', name: 'Accounting & Legal Professional Fees', type: 'expense', classification: 'operating_expense' },
    ];

    for (const acc of standardAccounts) {
      await prisma.chartOfAccount.create({
        data: {
          clientBusinessId: newClient.id,
          accountCode: acc.code,
          name: acc.name,
          type: acc.type,
          classification: acc.classification,
          currency,
          isSystem: acc.isSystem ?? false,
        },
      });
    }

    res.status(201).json(newClient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 3. Chart of Accounts
// -------------------------------------------------------------
apiRouter.get('/clients/:clientId/accounts', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const balances = await LedgerService.getAccountBalances(clientId);
    const result = Object.values(balances).map((b) => ({
      ...b.account,
      currentBalance: b.netBalance,
      debitTotal: b.debitTotal,
      creditTotal: b.creditTotal,
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/accounts', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { accountCode, name, type, classification, currency = 'CAD' } = req.body;

    if (!accountCode || !name || !type || !classification) {
      return res.status(400).json({ error: 'Missing required account fields.' });
    }

    const account = await prisma.chartOfAccount.create({
      data: {
        clientBusinessId: clientId,
        accountCode,
        name,
        type,
        classification,
        currency,
      },
    });

    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 4. General Ledger & Journal Entries
// -------------------------------------------------------------
apiRouter.get('/clients/:clientId/journal-entries', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const entries = await prisma.journalEntry.findMany({
      where: { clientBusinessId: clientId },
      orderBy: { entryNumber: 'desc' },
      include: {
        lines: {
          include: { account: true },
        },
      },
    });

    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/journal-entries', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const createdBy = (req.headers['x-user-name'] as string) || 'Senior CPA';
    const { entryDate, memo, source, lines } = req.body;

    const entry = await LedgerService.postJournalEntry({
      clientBusinessId: clientId,
      entryDate: entryDate || new Date().toISOString().split('T')[0],
      memo,
      source,
      createdBy,
      lines,
    });

    res.status(201).json(entry);
  } catch (error: any) {
    res.status(422).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/journal-entries/:entryId/reverse', async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const createdBy = (req.headers['x-user-name'] as string) || 'Senior CPA';
    const { reason } = req.body;

    const reversal = await LedgerService.reverseJournalEntry(entryId, createdBy, reason);
    res.status(201).json(reversal);
  } catch (error: any) {
    res.status(422).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/journal-entries/batch', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const createdBy = (req.headers['x-user-name'] as string) || 'Senior CPA';
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array is required.' });
    }

    const createdEntries = [];
    for (const e of entries) {
      const created = await LedgerService.postJournalEntry({
        clientBusinessId: clientId,
        entryDate: e.entryDate || new Date().toISOString().split('T')[0],
        memo: e.memo || 'Batch Import Entry',
        source: 'csv_import',
        createdBy,
        lines: e.lines,
      });
      createdEntries.push(created);
    }

    res.status(201).json({
      message: `Successfully imported ${createdEntries.length} journal entries.`,
      entries: createdEntries,
    });
  } catch (error: any) {
    res.status(422).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 5. Bank Transactions & Reconciliation
// -------------------------------------------------------------
apiRouter.get('/clients/:clientId/bank-transactions', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const transactions = await prisma.bankTransaction.findMany({
      where: { clientBusinessId: clientId },
      orderBy: { transactionDate: 'desc' },
      include: { bankAccount: true, matchedJournalEntry: true },
    });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/bank-transactions/reconcile', async (req: Request, res: Response) => {
  try {
    const createdBy = (req.headers['x-user-name'] as string) || 'Senior CPA';
    const { transactionId, targetAccountId, taxCode } = req.body;

    if (!transactionId || !targetAccountId) {
      return res.status(400).json({ error: 'Transaction ID and target account ID are required.' });
    }

    const result = await BankService.reconcileTransaction({
      transactionId,
      targetAccountId,
      taxCode: taxCode || 'GST_QST',
      createdBy,
    });

    res.json(result);
  } catch (error: any) {
    res.status(422).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 6. Receipts & OCR Ingestion
// -------------------------------------------------------------
apiRouter.get('/clients/:clientId/receipts', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const receipts = await prisma.receipt.findMany({
      where: { clientBusinessId: clientId },
      orderBy: { uploadedAt: 'desc' },
      include: { suggestedAccount: true, postedEntry: true },
    });

    res.json(receipts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/receipts/ocr-scan', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const uploadedBy = (req.headers['x-user-name'] as string) || 'Senior Auditor';
    const { fileName, fileBase64, mimeType, imageUrl } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required.' });
    }

    const receipt = await OCRService.scanReceipt({
      clientBusinessId: clientId,
      uploadedBy,
      fileName,
      fileBase64,
      mimeType,
      imageUrl,
    });

    res.status(201).json(receipt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/receipts', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const uploadedBy = (req.headers['x-user-name'] as string) || 'Bookkeeper';
    const { vendor, total, fileName, suggestedAccountId, notes } = req.body;

    const client = await prisma.clientBusiness.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ error: 'Client not found.' });

    const taxSplit = extractTaxesFromGrossTotal(Number(total), client.provinceCode as CanadianProvince);

    const receipt = await prisma.receipt.create({
      data: {
        clientBusinessId: clientId,
        uploadedBy,
        fileName: fileName || `${vendor.toLowerCase().replace(/\s+/g, '_')}_invoice.pdf`,
        status: 'extracted',
        extractedVendor: vendor,
        extractedDate: new Date().toISOString().split('T')[0],
        extractedSubtotal: taxSplit.subtotal,
        extractedGst: taxSplit.gstAmount,
        extractedQst: taxSplit.qstAmount,
        extractedTotal: Number(total),
        suggestedAccountId,
        notes,
      },
    });

    res.status(201).json(receipt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/clients/:clientId/receipts/:receiptId/post', async (req: Request, res: Response) => {
  try {
    const { receiptId } = req.params;
    const createdBy = (req.headers['x-user-name'] as string) || 'Senior CPA';
    const { targetAccountId } = req.body;

    if (!targetAccountId) {
      return res.status(400).json({ error: 'Target expense account ID is required.' });
    }

    const result = await ReceiptService.postReceiptToLedger({
      receiptId,
      targetAccountId,
      createdBy,
    });

    res.json(result);
  } catch (error: any) {
    res.status(422).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 7. Financial & Canadian Sales Tax Reports
// -------------------------------------------------------------
apiRouter.get('/clients/:clientId/reports/sales-tax-summary', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const period = (req.query.period as string) || '2026-Q2';

    const summary = await LedgerService.getSalesTaxSummary(clientId, period);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
