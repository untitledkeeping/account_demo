// src/server/services/ledgerService.ts
import prisma from '../db';
import { extractTaxesFromGrossTotal } from './taxService';
import { CanadianProvince } from '../../types';

export class LedgerService {
  /**
   * Post a balanced double-entry journal entry to the ledger
   */
  static async postJournalEntry(data: {
    clientBusinessId: string;
    entryDate: string;
    memo: string;
    source?: string;
    createdBy: string;
    lines: Array<{
      accountId: string;
      description: string;
      debit: number;
      credit: number;
      taxCode?: string;
      taxAmount?: number;
    }>;
  }) {
    const { clientBusinessId, entryDate, memo, source = 'manual', createdBy, lines } = data;

    if (!lines || lines.length < 2) {
      throw new Error('A valid journal entry requires at least two ledger lines.');
    }

    let totalDebits = 0;
    let totalCredits = 0;
    for (const line of lines) {
      totalDebits += Number(line.debit || 0);
      totalCredits += Number(line.credit || 0);
    }

    totalDebits = Math.round(totalDebits * 100) / 100;
    totalCredits = Math.round(totalCredits * 100) / 100;

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(
        `Journal entry is out of balance. Total debits ($${totalDebits.toFixed(
          2
        )}) must equal total credits ($${totalCredits.toFixed(2)}).`
      );
    }

    // Get max entry number for this client
    const lastEntry = await prisma.journalEntry.findFirst({
      where: { clientBusinessId },
      orderBy: { entryNumber: 'desc' },
      select: { entryNumber: true },
    });
    const entryNumber = (lastEntry?.entryNumber || 1000) + 1;

    // Atomic transaction
    const entry = await prisma.journalEntry.create({
      data: {
        clientBusinessId,
        entryNumber,
        entryDate,
        memo,
        source,
        status: 'posted',
        createdBy,
        lines: {
          create: lines.map((l) => ({
            accountId: l.accountId,
            description: l.description,
            debit: Number(l.debit || 0),
            credit: Number(l.credit || 0),
            taxCode: l.taxCode,
            taxAmount: l.taxAmount,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        clientBusinessId,
        action: 'POST_JOURNAL_ENTRY',
        entityType: 'JournalEntry',
        entityId: entry.id,
        details: JSON.stringify({
          entryNumber: entry.entryNumber,
          memo: entry.memo,
          totalAmount: totalDebits,
          linesCount: lines.length,
        }),
      },
    });

    return entry;
  }

  /**
   * Post an immutable reversing entry
   */
  static async reverseJournalEntry(entryId: string, createdBy: string, reason: string = 'Correction of previous entry') {
    const original = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { lines: true },
    });

    if (!original) {
      throw new Error('Original journal entry not found.');
    }

    if (original.status === 'reversed') {
      throw new Error('This journal entry has already been reversed.');
    }

    // Invert lines (debit becomes credit, credit becomes debit)
    const reversedLines = original.lines.map((l) => ({
      accountId: l.accountId,
      description: `Reversal: ${l.description}`,
      debit: l.credit,
      credit: l.debit,
      taxCode: l.taxCode || undefined,
      taxAmount: l.taxAmount || undefined,
    }));

    const lastEntry = await prisma.journalEntry.findFirst({
      where: { clientBusinessId: original.clientBusinessId },
      orderBy: { entryNumber: 'desc' },
      select: { entryNumber: true },
    });
    const entryNumber = (lastEntry?.entryNumber || 1000) + 1;

    const reversal = await prisma.journalEntry.create({
      data: {
        clientBusinessId: original.clientBusinessId,
        entryNumber,
        entryDate: new Date().toISOString().split('T')[0],
        memo: `[REVERSAL OF #${original.entryNumber}] ${reason}`,
        source: 'manual',
        status: 'posted',
        createdBy,
        isReversal: true,
        reversalOfEntryId: original.id,
        lines: {
          create: reversedLines,
        },
      },
      include: {
        lines: {
          include: { account: true },
        },
      },
    });

    // Mark original as reversed
    await prisma.journalEntry.update({
      where: { id: original.id },
      data: { status: 'reversed' },
    });

    await prisma.auditLog.create({
      data: {
        clientBusinessId: original.clientBusinessId,
        action: 'REVERSE_JOURNAL_ENTRY',
        entityType: 'JournalEntry',
        entityId: reversal.id,
        details: JSON.stringify({
          originalEntryNumber: original.entryNumber,
          reversalEntryNumber: reversal.entryNumber,
          reason,
        }),
      },
    });

    return reversal;
  }

  /**
   * Calculate live account balances for a client business
   */
  static async getAccountBalances(clientBusinessId: string, asOfDate?: string) {
    const accounts = await prisma.chartOfAccount.findMany({
      where: { clientBusinessId, isActive: true },
      orderBy: { accountCode: 'asc' },
    });

    const entries = await prisma.journalEntry.findMany({
      where: {
        clientBusinessId,
        status: { in: ['posted', 'reversed'] },
        ...(asOfDate ? { entryDate: { lte: asOfDate } } : {}),
      },
      include: { lines: true },
    });

    const balanceMap: Record<
      string,
      { account: (typeof accounts)[0]; debitTotal: number; creditTotal: number; netBalance: number }
    > = {};

    for (const acc of accounts) {
      balanceMap[acc.id] = {
        account: acc,
        debitTotal: 0,
        creditTotal: 0,
        netBalance: 0,
      };
    }

    for (const entry of entries) {
      for (const line of entry.lines) {
        if (balanceMap[line.accountId]) {
          balanceMap[line.accountId].debitTotal += line.debit;
          balanceMap[line.accountId].creditTotal += line.credit;
        }
      }
    }

    // Normal GAAP balance calculation
    for (const id in balanceMap) {
      const item = balanceMap[id];
      const type = item.account.type;
      if (type === 'asset' || type === 'expense') {
        item.netBalance = Math.round((item.debitTotal - item.creditTotal) * 100) / 100;
      } else {
        item.netBalance = Math.round((item.creditTotal - item.debitTotal) * 100) / 100;
      }
      item.debitTotal = Math.round(item.debitTotal * 100) / 100;
      item.creditTotal = Math.round(item.creditTotal * 100) / 100;
    }

    return balanceMap;
  }

  /**
   * Generate Sales Tax Summary (Line 105/108 & Line 205/208)
   */
  static async getSalesTaxSummary(clientBusinessId: string, period: string = '2026-Q2') {
    const client = await prisma.clientBusiness.findUnique({
      where: { id: clientBusinessId },
    });
    if (!client) throw new Error('Client business not found.');

    const accounts = await prisma.chartOfAccount.findMany({
      where: { clientBusinessId },
    });

    const gstPayableAcc = accounts.find((a) => a.accountCode === '2150' || a.name.toLowerCase().includes('gst'));
    const qstPayableAcc = accounts.find((a) => a.accountCode === '2160' || a.name.toLowerCase().includes('qst'));

    const entries = await prisma.journalEntry.findMany({
      where: { clientBusinessId, status: { in: ['posted', 'reversed'] } },
      include: { lines: true },
    });

    let line101SalesTotal = 0;
    let line105GstCollected = 0;
    let line108ItcsClaimed = 0;

    let line201SalesTotal = 0;
    let line205QstCollected = 0;
    let line208ItrsClaimed = 0;

    for (const entry of entries) {
      for (const line of entry.lines) {
        const acc = accounts.find((a) => a.id === line.accountId);
        if (acc?.type === 'revenue') {
          line101SalesTotal += line.credit;
          line201SalesTotal += line.credit;
        }

        if (gstPayableAcc && line.accountId === gstPayableAcc.id) {
          line105GstCollected += line.credit;
          line108ItcsClaimed += line.debit;
        }

        if (qstPayableAcc && line.accountId === qstPayableAcc.id) {
          line205QstCollected += line.credit;
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

    const totalRemittanceDue =
      Math.round((line109NetGstPayable + (client.provinceCode === 'QC' ? line209NetQstPayable : 0)) * 100) / 100;

    return {
      period,
      province: client.provinceCode as CanadianProvince,
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
}
