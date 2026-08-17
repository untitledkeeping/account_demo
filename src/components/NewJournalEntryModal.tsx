import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Building,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry, LedgerLine, TaxCode, User } from '../types';
import { calculateTaxFromSubtotal, formatCurrency } from '../utils/taxCalculator';

interface NewJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  currentUser: User;
  onPostEntry: (entry: JournalEntry) => void;
}

interface DraftLine {
  accountId: string;
  description: string;
  debit: number;
  credit: number;
  taxCode?: TaxCode;
}

export const NewJournalEntryModal: React.FC<NewJournalEntryModalProps> = ({
  isOpen,
  onClose,
  client,
  accounts,
  currentUser,
  onPostEntry,
}) => {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');

  const bankAcc = accounts.find((a) => a.classification === 'bank') || accounts[0];
  const expenseAcc = accounts.find((a) => a.type === 'expense') || accounts[0];
  const gstAcc = accounts.find((a) => a.accountCode === '2150');
  const qstAcc = accounts.find((a) => a.accountCode === '2160');

  // Lines state
  const [lines, setLines] = useState<DraftLine[]>([
    { accountId: expenseAcc.id, description: 'Office supplies & expenses', debit: 100.0, credit: 0, taxCode: client.provinceCode === 'QC' ? 'GST_QST' : 'GST_5' },
    { accountId: bankAcc.id, description: 'Payment via Operating Account', debit: 0, credit: client.provinceCode === 'QC' ? 114.98 : 105.0 },
  ]);

  if (!isOpen) return null;

  // Calculate totals
  const totalDebits = Math.round(lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0) * 100) / 100;
  const totalCredits = Math.round(lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0) * 100) / 100;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;
  const variance = Math.round((totalDebits - totalCredits) * 100) / 100;

  const handleAddLine = () => {
    setLines([...lines, { accountId: accounts[0]?.id || '', description: '', debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: keyof DraftLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  /**
   * Auto-Splits Canadian taxes for an expense line item
   */
  const handleAutoApplyTaxSplit = (index: number) => {
    const baseLine = lines[index];
    const subtotal = Number(baseLine.debit) || 0;
    if (subtotal <= 0) return;

    const breakdown = calculateTaxFromSubtotal(subtotal, baseLine.taxCode || 'GST_QST', client.provinceCode);

    const newLines: DraftLine[] = [
      {
        accountId: baseLine.accountId,
        description: baseLine.description || 'Pre-tax Expense',
        debit: subtotal,
        credit: 0,
        taxCode: baseLine.taxCode,
      },
    ];

    if (breakdown.gstAmount > 0 && gstAcc) {
      newLines.push({
        accountId: gstAcc.id,
        description: 'GST Input Tax Credit (5%)',
        debit: breakdown.gstAmount,
        credit: 0,
      });
    }

    if (breakdown.qstAmount > 0 && qstAcc) {
      newLines.push({
        accountId: qstAcc.id,
        description: 'QST Input Tax Refund (9.975%)',
        debit: breakdown.qstAmount,
        credit: 0,
      });
    }

    // Add balancing credit to Bank
    newLines.push({
      accountId: bankAcc.id,
      description: 'Bank payment',
      debit: 0,
      credit: breakdown.total,
    });

    setLines(newLines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || !memo) return;

    const entryId = `je-manual-${Date.now()}`;
    const ledgerLines: LedgerLine[] = lines.map((l, idx) => ({
      id: `line-${entryId}-${idx}`,
      journalEntryId: entryId,
      accountId: l.accountId,
      description: l.description || memo,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      taxCode: l.taxCode,
    }));

    const newEntry: JournalEntry = {
      id: entryId,
      clientBusinessId: client.id,
      entryNumber: Math.floor(1000 + Math.random() * 9000),
      entryDate,
      memo,
      source: 'manual',
      status: 'posted',
      createdBy: currentUser.fullName,
      postedAt: new Date().toISOString(),
      lines: ledgerLines,
    };

    onPostEntry(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Post Compound Journal Entry</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {client.legalName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforces balanced double-entry (Debits === Credits) with Canadian tax deconstruction.
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Transaction Date</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Memo / Description</label>
              <input
                type="text"
                required
                placeholder="e.g., Commercial Lease Mont-Royal or Invoice #4092"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Ledger Lines Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Compound Ledger Lines
              </label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lines.map((line, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs">
                  {/* Account Selector */}
                  <div className="col-span-12 sm:col-span-4">
                    <select
                      value={line.accountId}
                      onChange={(e) => handleUpdateLine(idx, 'accountId', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.accountCode} - {a.name.slice(0, 24)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Line Description */}
                  <div className="col-span-12 sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Line detail..."
                      value={line.description}
                      onChange={(e) => handleUpdateLine(idx, 'description', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Debit CAD */}
                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Debit"
                      value={line.debit === 0 ? '' : line.debit}
                      onChange={(e) => handleUpdateLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>

                  {/* Credit CAD */}
                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Credit"
                      value={line.credit === 0 ? '' : line.credit}
                      onChange={(e) => handleUpdateLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>

                  {/* Action delete */}
                  <div className="col-span-2 sm:col-span-1 text-right flex justify-end space-x-1">
                    {line.debit > 0 && idx === 0 && (
                      <button
                        type="button"
                        onClick={() => handleAutoApplyTaxSplit(idx)}
                        title="Auto-calculate GST & QST splits"
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      disabled={lines.length <= 2}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Balance Equality Proof Footer */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isBalanced ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-center space-x-2 text-xs">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900">Balanced Journal Entry Ready to Post</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-rose-900">
                    Imbalance of {formatCurrency(Math.abs(variance))} detected. Debits must equal Credits.
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4 font-mono text-xs font-bold">
              <div>Debits: {formatCurrency(totalDebits)}</div>
              <div>Credits: {formatCurrency(totalCredits)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isBalanced || !memo}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Post to General Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
