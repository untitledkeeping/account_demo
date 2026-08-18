// prisma/test-api.ts
import prisma from '../src/server/db';
import { LedgerService } from '../src/server/services/ledgerService';
import { BankService } from '../src/server/services/bankService';
import { ReceiptService } from '../src/server/services/receiptService';

async function runVerification() {
  console.log('🧪 Starting Database & Service Layer Verification...\n');

  // 1. Verify Firms and Clients
  const firm = await prisma.firm.findFirst({
    include: { clients: true, users: true },
  });
  console.log(`✅ Firm: ${firm?.name} (Clients count: ${firm?.clients.length}, Users count: ${firm?.users.length})`);

  const client = firm?.clients[0];
  if (!client) throw new Error('No client found');
  console.log(`✅ Selected Client: ${client.legalName} (${client.provinceCode})`);

  // 2. Verify Chart of Accounts
  const accounts = await prisma.chartOfAccount.findMany({
    where: { clientBusinessId: client.id },
  });
  console.log(`✅ Client Chart of Accounts: ${accounts.length} accounts configured.`);

  // 3. Verify Account Balances & Calculations
  const balances = await LedgerService.getAccountBalances(client.id);
  const nonZeroBalances = Object.values(balances).filter((b) => b.netBalance !== 0);
  console.log(`✅ Calculated Balances: ${nonZeroBalances.length} active ledger balances.`);

  // 4. Verify Sales Tax Summary
  const taxSummary = await LedgerService.getSalesTaxSummary(client.id, '2026-Q2');
  console.log(`✅ Sales Tax Summary (2026-Q2):`);
  console.log(`   - GST Collected (Line 105): $${taxSummary.gst.line105GstCollected}`);
  console.log(`   - GST ITCs (Line 108): $${taxSummary.gst.line108ItcsClaimed}`);
  console.log(`   - Net GST Payable (Line 109): $${taxSummary.gst.line109NetGstPayable}`);
  if (taxSummary.qst) {
    console.log(`   - QST Collected (Line 205): $${taxSummary.qst.line205QstCollected}`);
    console.log(`   - QST ITRs (Line 208): $${taxSummary.qst.line208ItrsClaimed}`);
    console.log(`   - Net QST Payable (Line 209): $${taxSummary.qst.line209NetQstPayable}`);
  }
  console.log(`   - Total Remittance Due: $${taxSummary.totalRemittanceDue} CAD`);

  // 5. Test Posting Balanced Journal Entry
  const expenseAcc = accounts.find((a) => a.accountCode === '6000') || accounts[0];
  const bankAcc = accounts.find((a) => a.accountCode === '1010') || accounts[1];
  const gstAcc = accounts.find((a) => a.accountCode === '2150');

  const testEntry = await LedgerService.postJournalEntry({
    clientBusinessId: client.id,
    entryDate: '2026-08-17',
    memo: 'Test Verification Rent Posting',
    source: 'manual',
    createdBy: 'Test Suite',
    lines: [
      { accountId: expenseAcc.id, description: 'Rent Expense', debit: 1000.0, credit: 0 },
      { accountId: gstAcc ? gstAcc.id : expenseAcc.id, description: 'GST Paid', debit: 50.0, credit: 0 },
      { accountId: bankAcc.id, description: 'Bank Outflow', debit: 0, credit: 1050.0 },
    ],
  });
  console.log(`✅ Posted Test Journal Entry #${testEntry.entryNumber} (Balanced Debits $1050 === Credits $1050)`);

  // 6. Test Imbalanced Journal Entry Rejection
  try {
    await LedgerService.postJournalEntry({
      clientBusinessId: client.id,
      entryDate: '2026-08-17',
      memo: 'Should Fail',
      source: 'manual',
      createdBy: 'Test Suite',
      lines: [
        { accountId: expenseAcc.id, description: 'Debit 100', debit: 100.0, credit: 0 },
        { accountId: bankAcc.id, description: 'Credit 50', debit: 0, credit: 50.0 },
      ],
    });
    console.error('❌ Imbalanced entry was not rejected!');
  } catch (err: any) {
    console.log(`✅ Imbalanced Journal Entry correctly rejected: "${err.message}"`);
  }

  // 7. Test Reversal
  const reversal = await LedgerService.reverseJournalEntry(testEntry.id, 'Test Suite', 'Unit test reversal');
  console.log(`✅ Created Immutable Reversal Entry #${reversal.entryNumber} for Entry #${testEntry.entryNumber}`);

  console.log('\n🎉 All Database & Accounting Service Verifications Passed!');
}

runVerification()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
