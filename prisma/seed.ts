// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import {
  INITIAL_FIRM,
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_RECEIPTS,
} from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Studio Books database seed...');

  // 1. Clear existing data in cascade order
  await prisma.auditLog.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.bankTransaction.deleteMany();
  await prisma.ledgerLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.chartOfAccount.deleteMany();
  await prisma.clientBusiness.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();

  console.log('🧹 Cleaned up existing database tables.');

  // 2. Seed Firm
  const firm = await prisma.firm.create({
    data: {
      id: INITIAL_FIRM.id,
      name: INITIAL_FIRM.name,
      subscriptionTier: INITIAL_FIRM.subscriptionTier,
      activeClientLimit: INITIAL_FIRM.activeClientLimit,
      createdAt: new Date(INITIAL_FIRM.createdAt),
    },
  });
  console.log(`✅ Seeded Firm: ${firm.name}`);

  // 3. Seed Users
  for (const user of INITIAL_USERS) {
    await prisma.user.create({
      data: {
        id: user.id,
        firmId: firm.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_USERS.length} practice users.`);

  // 4. Seed Client Businesses
  for (const client of INITIAL_CLIENTS) {
    await prisma.clientBusiness.create({
      data: {
        id: client.id,
        firmId: firm.id,
        legalName: client.legalName,
        operatingName: client.operatingName,
        businessNumber: client.businessNumber,
        provinceCode: client.provinceCode,
        gstRegistered: client.gstRegistered,
        gstNumber: client.gstNumber,
        qstRegistered: client.qstRegistered,
        qstNumber: client.qstNumber,
        fiscalYearEndMonth: client.fiscalYearEndMonth,
        currency: client.currency,
        isActive: client.isActive,
        status: client.status,
        lastClosedMonth: client.lastClosedMonth,
        assignedBookkeeper: client.assignedBookkeeper,
        notes: client.notes,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_CLIENTS.length} Canadian client businesses.`);

  // 5. Seed Chart of Accounts
  for (const account of INITIAL_ACCOUNTS) {
    await prisma.chartOfAccount.create({
      data: {
        id: account.id,
        clientBusinessId: account.clientBusinessId,
        accountCode: account.accountCode,
        name: account.name,
        type: account.type,
        classification: account.classification,
        currency: account.currency,
        isActive: account.isActive,
        isSystem: account.isSystem ?? false,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_ACCOUNTS.length} chart of accounts across all clients.`);

  // 6. Seed Journal Entries & Ledger Lines (Atomic Double-Entry)
  for (const entry of INITIAL_JOURNAL_ENTRIES) {
    await prisma.journalEntry.create({
      data: {
        id: entry.id,
        clientBusinessId: entry.clientBusinessId,
        entryNumber: entry.entryNumber,
        entryDate: entry.entryDate,
        memo: entry.memo,
        source: entry.source,
        status: entry.status,
        createdBy: entry.createdBy,
        postedAt: new Date(entry.postedAt),
        isReversal: entry.isReversal ?? false,
        reversalOfEntryId: entry.reversalOfEntryId,
        lines: {
          create: entry.lines.map((l) => ({
            id: l.id,
            accountId: l.accountId,
            description: l.description,
            debit: l.debit,
            credit: l.credit,
            taxCode: l.taxCode,
            taxAmount: l.taxAmount,
          })),
        },
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_JOURNAL_ENTRIES.length} balanced journal entries.`);

  // 7. Seed Bank Transactions
  for (const tx of INITIAL_BANK_TRANSACTIONS) {
    await prisma.bankTransaction.create({
      data: {
        id: tx.id,
        clientBusinessId: tx.clientBusinessId,
        accountId: tx.accountId,
        externalTransactionId: tx.externalTransactionId,
        transactionDate: tx.transactionDate,
        description: tx.description,
        amount: tx.amount,
        isReconciled: tx.isReconciled,
        matchedJournalEntryId: tx.matchedJournalEntryId,
        suggestedAccountId: tx.suggestedAccountId,
        suggestedTaxCode: tx.suggestedTaxCode,
        confidenceScore: tx.confidenceScore,
        categoryHint: tx.categoryHint,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_BANK_TRANSACTIONS.length} bank feed transactions.`);

  // 8. Seed Receipts
  for (const r of INITIAL_RECEIPTS) {
    await prisma.receipt.create({
      data: {
        id: r.id,
        clientBusinessId: r.clientBusinessId,
        uploadedBy: r.uploadedBy,
        fileName: r.fileName,
        fileUrl: r.fileUrl,
        uploadedAt: new Date(r.uploadedAt),
        status: r.status,
        extractedVendor: r.extractedVendor,
        extractedDate: r.extractedDate,
        extractedTotal: r.extractedTotal,
        extractedGst: r.extractedGst,
        extractedQst: r.extractedQst,
        extractedSubtotal: r.extractedSubtotal,
        suggestedAccountId: r.suggestedAccountId,
        notes: r.notes,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_RECEIPTS.length} OCR receipt documents.`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
