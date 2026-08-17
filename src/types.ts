export type CanadianProvince = 'QC' | 'ON' | 'BC' | 'AB' | 'MB' | 'SK' | 'NS' | 'NB' | 'NL' | 'PE' | 'NT' | 'YT' | 'NU';
export type ProvinceCode = CanadianProvince;

export type UserRole = 'firm_owner' | 'firm_admin' | 'staff_bookkeeper' | 'client_guest';

export interface Firm {
  id: string;
  name: string;
  subscriptionTier: 'solo' | 'practice_flagship' | 'firm_enterprise';
  activeClientLimit: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  twoFactorEnabled: boolean;
  role: UserRole;
}

export type BookkeepingStatus = 'Books Closed' | 'Needs Review' | 'Awaiting Receipts' | 'Reconciliation Pending' | 'Up to Date';

export interface ClientBusiness {
  id: string;
  firmId: string;
  legalName: string;
  operatingName?: string;
  businessNumber: string; // BN9 / NEQ
  provinceCode: CanadianProvince;
  gstRegistered: boolean;
  gstNumber?: string;
  qstRegistered: boolean;
  qstNumber?: string;
  fiscalYearEndMonth: number; // 1 - 12
  currency: 'CAD' | 'USD';
  isActive: boolean;
  status: BookkeepingStatus;
  lastClosedMonth: string; // e.g. "2026-06"
  assignedBookkeeper: string;
  notes?: string;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountClassification =
  | 'current_asset'
  | 'bank'
  | 'accounts_receivable'
  | 'current_liability'
  | 'credit_card'
  | 'accounts_payable'
  | 'sales_tax_payable'
  | 'retained_earnings'
  | 'owner_equity'
  | 'operating_revenue'
  | 'other_revenue'
  | 'cost_of_goods_sold'
  | 'operating_expense'
  | 'payroll_expense'
  | 'tax_expense';

export interface ChartOfAccount {
  id: string;
  clientBusinessId: string;
  accountCode: string;
  name: string;
  type: AccountType;
  classification: AccountClassification;
  currency: 'CAD' | 'USD';
  isActive: boolean;
  isSystem?: boolean;
}

export type TaxCode = 'GST_5' | 'QST_9_975' | 'GST_QST' | 'HST_13' | 'HST_15' | 'EXEMPT' | 'ZERO_RATED' | 'NONE';

export interface LedgerLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
  taxCode?: TaxCode;
  taxAmount?: number;
}

export type JournalStatus = 'draft' | 'posted' | 'voided';
export type JournalSource = 'manual' | 'bank_feed' | 'qbo_import' | 'wave_import' | 'ocr_receipt' | 'receipt_ocr' | 'csv_import' | 'reversal';

export interface JournalEntry {
  id: string;
  clientBusinessId: string;
  entryNumber: number;
  entryDate: string; // YYYY-MM-DD
  memo: string;
  source: JournalSource;
  status: JournalStatus;
  createdBy: string;
  postedAt: string;
  isReversal?: boolean;
  reversalOfEntryId?: string;
  lines: LedgerLine[];
}

export interface BankTransaction {
  id: string;
  clientBusinessId: string;
  externalTransactionId: string;
  accountId: string; // associated bank account
  transactionDate: string;
  description: string;
  amount: number; // Negative for outflow (expense), Positive for inflow (deposit)
  isReconciled: boolean;
  matchedJournalEntryId?: string;
  suggestedAccountId?: string;
  suggestedTaxCode?: TaxCode;
  confidenceScore?: number; // 0.0 - 1.0
  categoryHint?: string;
}

export type ReceiptStatus = 'pending_ocr' | 'pending_review' | 'extracted' | 'matched' | 'posted' | 'rejected';

export interface ReceiptDocument {
  id: string;
  clientBusinessId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt: string;
  status: ReceiptStatus;
  extractedVendor: string;
  extractedDate: string;
  extractedTotal: number;
  extractedGst: number;
  extractedQst: number;
  extractedSubtotal: number;
  suggestedAccountId: string;
  notes?: string;
}

export interface SalesTaxSummary {
  period: string; // e.g. "2026-Q2"
  province: CanadianProvince;
  gst: {
    line101SalesTotal: number;
    line105GstCollected: number;
    line108ItcsClaimed: number;
    line109NetGstPayable: number;
  };
  qst?: {
    line201SalesTotal: number;
    line205QstCollected: number;
    line208ItrsClaimed: number;
    line209NetQstPayable: number;
  };
  totalRemittanceDue: number;
}

export type ActiveTab =
  | 'firm-overview'
  | 'general-ledger'
  | 'bank-reconciliation'
  | 'chart-of-accounts'
  | 'receipts-ocr'
  | 'tax-filing'
  | 'financial-reports'
  | 'csv-import'
  | 'architecture-docs';
