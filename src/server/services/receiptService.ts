// src/server/services/receiptService.ts
import prisma from '../db';
import { CanadianProvince } from '../../types';

export class ReceiptService {
  /**
   * Post an OCR receipt to the general ledger (Expense + Sales Tax ITC/ITR + Accounts Payable)
   */
  static async postReceiptToLedger(data: {
    receiptId: string;
    targetAccountId: string;
    createdBy: string;
  }) {
    const { receiptId, targetAccountId, createdBy } = data;

    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { client: true },
    });

    if (!receipt) throw new Error('Receipt not found.');
    if (receipt.status === 'posted') throw new Error('Receipt is already posted to ledger.');

    const client = receipt.client;
    const clientAccounts = await prisma.chartOfAccount.findMany({
      where: { clientBusinessId: client.id },
    });

    const expenseAcc = clientAccounts.find((a) => a.id === targetAccountId) || clientAccounts[0];
    const apAcc =
      clientAccounts.find((a) => a.classification === 'accounts_payable') ||
      clientAccounts.find((a) => a.accountCode === '2000') ||
      clientAccounts[0];
    const gstAcc = clientAccounts.find((a) => a.accountCode === '2150');
    const qstAcc = clientAccounts.find((a) => a.accountCode === '2160');

    const lines: Array<{
      accountId: string;
      description: string;
      debit: number;
      credit: number;
      taxCode?: string;
      taxAmount?: number;
    }> = [
      {
        accountId: expenseAcc.id,
        description: `Invoice: ${receipt.extractedVendor}`,
        debit: receipt.extractedSubtotal,
        credit: 0,
        taxCode: client.provinceCode === 'QC' ? 'GST_QST' : 'GST_5',
        taxAmount: receipt.extractedGst + receipt.extractedQst,
      },
    ];

    if (receipt.extractedGst > 0 && gstAcc) {
      lines.push({
        accountId: gstAcc.id,
        description: 'GST Input Tax Credit (5%)',
        debit: receipt.extractedGst,
        credit: 0,
      });
    }

    if (receipt.extractedQst > 0 && qstAcc && client.provinceCode === 'QC') {
      lines.push({
        accountId: qstAcc.id,
        description: 'QST Input Tax Refund (9.975%)',
        debit: receipt.extractedQst,
        credit: 0,
      });
    }

    lines.push({
      accountId: apAcc.id,
      description: `Payable to ${receipt.extractedVendor}`,
      debit: 0,
      credit: receipt.extractedTotal,
    });

    const lastEntry = await prisma.journalEntry.findFirst({
      where: { clientBusinessId: client.id },
      orderBy: { entryNumber: 'desc' },
      select: { entryNumber: true },
    });
    const entryNumber = (lastEntry?.entryNumber || 5000) + 1;

    const journalEntry = await prisma.journalEntry.create({
      data: {
        clientBusinessId: client.id,
        entryNumber,
        entryDate: receipt.extractedDate,
        memo: `Receipt OCR: ${receipt.extractedVendor}`,
        source: 'ocr_receipt',
        status: 'posted',
        createdBy,
        lines: {
          create: lines,
        },
      },
    });

    const updatedReceipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: 'posted',
        postedEntryId: journalEntry.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        clientBusinessId: client.id,
        action: 'POST_RECEIPT_TO_LEDGER',
        entityType: 'Receipt',
        entityId: receiptId,
        details: JSON.stringify({
          vendor: receipt.extractedVendor,
          total: receipt.extractedTotal,
          postedJournalEntryId: journalEntry.id,
        }),
      },
    });

    return {
      receipt: updatedReceipt,
      journalEntry,
    };
  }
}
