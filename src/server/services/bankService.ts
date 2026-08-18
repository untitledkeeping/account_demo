// src/server/services/bankService.ts
import prisma from '../db';
import { extractTaxesFromGrossTotal } from './taxService';
import { CanadianProvince, TaxCode } from '../../types';

export class BankService {
  /**
   * Reconcile a bank transaction by creating the matching balanced journal entry
   */
  static async reconcileTransaction(data: {
    transactionId: string;
    targetAccountId: string;
    taxCode: TaxCode;
    createdBy: string;
  }) {
    const { transactionId, targetAccountId, taxCode, createdBy } = data;

    const tx = await prisma.bankTransaction.findUnique({
      where: { id: transactionId },
      include: { client: true },
    });

    if (!tx) throw new Error('Bank transaction not found.');
    if (tx.isReconciled) throw new Error('Transaction is already reconciled.');

    const client = tx.client;
    const isOutflow = tx.amount < 0;
    const absAmount = Math.abs(tx.amount);
    const taxSplit = extractTaxesFromGrossTotal(absAmount, client.provinceCode as CanadianProvince, taxCode);

    // Fetch accounts
    const clientAccounts = await prisma.chartOfAccount.findMany({
      where: { clientBusinessId: client.id },
    });

    const bankAcc =
      clientAccounts.find((a) => a.id === tx.accountId) ||
      clientAccounts.find((a) => a.classification === 'bank') ||
      clientAccounts[0];

    const targetAcc = clientAccounts.find((a) => a.id === targetAccountId) || clientAccounts[1];
    const gstAcc = clientAccounts.find((a) => a.accountCode === '2150');
    const qstAcc = clientAccounts.find((a) => a.accountCode === '2160');

    // Build ledger lines
    const lines: Array<{
      accountId: string;
      description: string;
      debit: number;
      credit: number;
      taxCode?: string;
      taxAmount?: number;
    }> = [];

    if (isOutflow) {
      // Outflow: Expense/Target debit, Bank credit
      lines.push({
        accountId: targetAcc.id,
        description: tx.description,
        debit: taxSplit.subtotal,
        credit: 0,
        taxCode,
        taxAmount: taxSplit.totalTax,
      });

      if (taxSplit.gstAmount > 0 && gstAcc) {
        lines.push({
          accountId: gstAcc.id,
          description: 'GST Input Tax Credit (5%)',
          debit: taxSplit.gstAmount,
          credit: 0,
        });
      }

      if (taxSplit.qstAmount > 0 && qstAcc && client.provinceCode === 'QC') {
        lines.push({
          accountId: qstAcc.id,
          description: 'QST Input Tax Refund (9.975%)',
          debit: taxSplit.qstAmount,
          credit: 0,
        });
      }

      lines.push({
        accountId: bankAcc.id,
        description: `Bank clearing: ${tx.externalTransactionId}`,
        debit: 0,
        credit: absAmount,
      });
    } else {
      // Inflow: Bank debit, Revenue/Target credit
      lines.push({
        accountId: bankAcc.id,
        description: `Deposit: ${tx.description}`,
        debit: absAmount,
        credit: 0,
      });

      lines.push({
        accountId: targetAcc.id,
        description: tx.description,
        debit: 0,
        credit: taxSplit.subtotal,
        taxCode,
        taxAmount: taxSplit.totalTax,
      });

      if (taxSplit.gstAmount > 0 && gstAcc) {
        lines.push({
          accountId: gstAcc.id,
          description: 'GST Collected (5%)',
          debit: 0,
          credit: taxSplit.gstAmount,
        });
      }

      if (taxSplit.qstAmount > 0 && qstAcc && client.provinceCode === 'QC') {
        lines.push({
          accountId: qstAcc.id,
          description: 'QST Collected (9.975%)',
          debit: 0,
          credit: taxSplit.qstAmount,
        });
      }
    }

    // Get next entry number
    const lastEntry = await prisma.journalEntry.findFirst({
      where: { clientBusinessId: client.id },
      orderBy: { entryNumber: 'desc' },
      select: { entryNumber: true },
    });
    const entryNumber = (lastEntry?.entryNumber || 2000) + 1;

    // Create journal entry & update bank transaction
    const journalEntry = await prisma.journalEntry.create({
      data: {
        clientBusinessId: client.id,
        entryNumber,
        entryDate: tx.transactionDate,
        memo: `Bank Match: ${tx.description}`,
        source: 'bank_feed',
        status: 'posted',
        createdBy,
        lines: {
          create: lines,
        },
      },
    });

    const updatedTx = await prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        isReconciled: true,
        matchedJournalEntryId: journalEntry.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        clientBusinessId: client.id,
        action: 'RECONCILE_BANK_TRANSACTION',
        entityType: 'BankTransaction',
        entityId: transactionId,
        details: JSON.stringify({
          matchedJournalEntryId: journalEntry.id,
          amount: tx.amount,
          description: tx.description,
        }),
      },
    });

    return {
      bankTransaction: updatedTx,
      journalEntry,
    };
  }
}
