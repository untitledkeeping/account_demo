// src/services/api.ts
import {
  Firm,
  ClientBusiness,
  ChartOfAccount,
  JournalEntry,
  BankTransaction,
  ReceiptDocument,
  SalesTaxSummary,
  TaxCode,
} from '../types';

const API_BASE = '/api/v1';

export class ApiClient {
  private firmId: string;
  private userId: string;
  private userName: string;

  constructor(
    firmId: string = 'firm-studio-books-001',
    userId: string = 'usr-sarah-04',
    userName: string = 'Sarah Tremblay, CPA'
  ) {
    this.firmId = firmId;
    this.userId = userId;
    this.userName = userName;
  }

  setContext(firmId: string, userId: string, userName: string) {
    this.firmId = firmId;
    this.userId = userId;
    this.userName = userName;
  }

  private getHeaders(clientId?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-firm-id': this.firmId,
      'x-user-id': this.userId,
      'x-user-name': this.userName,
    };
    if (clientId) {
      headers['x-client-id'] = clientId;
    }
    return headers;
  }

  // 1. Health & Firm Overview
  async getFirmOverview(): Promise<any> {
    const res = await fetch(`${API_BASE}/firm/overview`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch firm overview');
    return res.json();
  }

  // 2. Clients
  async getClients(): Promise<ClientBusiness[]> {
    const res = await fetch(`${API_BASE}/clients`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  }

  async getClient(clientId: string): Promise<ClientBusiness> {
    const res = await fetch(`${API_BASE}/clients/${clientId}`, {
      headers: this.getHeaders(clientId),
    });
    if (!res.ok) throw new Error('Failed to fetch client details');
    return res.json();
  }

  async createClient(clientData: Partial<ClientBusiness>): Promise<ClientBusiness> {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create client business');
    }
    return res.json();
  }

  // 3. Chart of Accounts
  async getAccounts(clientId: string): Promise<ChartOfAccount[]> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/accounts`, {
      headers: this.getHeaders(clientId),
    });
    if (!res.ok) throw new Error('Failed to fetch chart of accounts');
    return res.json();
  }

  async createAccount(clientId: string, accountData: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/accounts`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify(accountData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create account');
    }
    return res.json();
  }

  // 4. General Ledger & Journal Entries
  async getJournalEntries(clientId: string): Promise<JournalEntry[]> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/journal-entries`, {
      headers: this.getHeaders(clientId),
    });
    if (!res.ok) throw new Error('Failed to fetch journal entries');
    return res.json();
  }

  async postJournalEntry(clientId: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/journal-entries`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to post journal entry');
    }
    return res.json();
  }

  async reverseJournalEntry(clientId: string, entryId: string, reason?: string): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/journal-entries/${entryId}/reverse`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reverse journal entry');
    }
    return res.json();
  }

  async batchImportEntries(clientId: string, entries: any[]): Promise<{ message: string; entries: JournalEntry[] }> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/journal-entries/batch`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to batch import entries');
    }
    return res.json();
  }

  // 5. Bank Transactions
  async getBankTransactions(clientId: string): Promise<BankTransaction[]> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/bank-transactions`, {
      headers: this.getHeaders(clientId),
    });
    if (!res.ok) throw new Error('Failed to fetch bank transactions');
    return res.json();
  }

  async reconcileBankTransaction(
    clientId: string,
    transactionId: string,
    targetAccountId: string,
    taxCode: TaxCode
  ): Promise<{ bankTransaction: BankTransaction; journalEntry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/bank-transactions/reconcile`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify({ transactionId, targetAccountId, taxCode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reconcile bank transaction');
    }
    return res.json();
  }

  // 6. Receipts
  async getReceipts(clientId: string): Promise<ReceiptDocument[]> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/receipts`, {
      headers: this.getHeaders(clientId),
    });
    if (!res.ok) throw new Error('Failed to fetch receipts');
    return res.json();
  }

  async scanReceiptOCR(
    clientId: string,
    payload: { fileName: string; fileBase64?: string; mimeType?: string; imageUrl?: string }
  ): Promise<ReceiptDocument> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/receipts/ocr-scan`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to scan receipt with Gemini OCR');
    }
    return res.json();
  }

  async uploadReceipt(clientId: string, receiptData: { vendor: string; total: number; fileName?: string; suggestedAccountId?: string; notes?: string }): Promise<ReceiptDocument> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/receipts`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify(receiptData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload receipt');
    }
    return res.json();
  }

  async postReceiptToLedger(
    clientId: string,
    receiptId: string,
    targetAccountId: string
  ): Promise<{ receipt: ReceiptDocument; journalEntry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/receipts/${receiptId}/post`, {
      method: 'POST',
      headers: this.getHeaders(clientId),
      body: JSON.stringify({ targetAccountId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to post receipt to ledger');
    }
    return res.json();
  }

  // 7. Tax Reports
  async getSalesTaxSummary(clientId: string, period: string = '2026-Q2'): Promise<SalesTaxSummary> {
    const res = await fetch(`${API_BASE}/clients/${clientId}/reports/sales-tax-summary?period=${period}`, {
      headers: this.getHeaders(clientId),
    });
    if (!res.ok) throw new Error('Failed to fetch sales tax summary');
    return res.json();
  }
}

export const api = new ApiClient();
