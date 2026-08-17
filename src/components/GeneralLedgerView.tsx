import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Tag,
  Calendar,
  Layers,
  FileText,
  Building,
  ArrowDownUp,
  Receipt,
  ArrowRightLeft,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { ClientBusiness, JournalEntry, ChartOfAccount, User } from '../types';
import { formatCurrency } from '../utils/taxCalculator';

interface GeneralLedgerViewProps {
  client: ClientBusiness;
  entries: JournalEntry[];
  accounts: ChartOfAccount[];
  currentUser: User;
  onOpenNewEntry: () => void;
  onReverseEntry: (entry: JournalEntry) => void;
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  client,
  entries,
  accounts,
  currentUser,
  onOpenNewEntry,
  onReverseEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [authorFilter, setAuthorFilter] = useState<'ALL' | 'MINE'>('ALL');
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const accountMap = new Map<string, ChartOfAccount>();
  accounts.forEach((a) => accountMap.set(a.id, a));

  // Compute Total Debits and Credits
  let grandTotalDebits = 0;
  let grandTotalCredits = 0;

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entryNumber.toString().includes(searchTerm) ||
      entry.lines.some((l) => l.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSource = sourceFilter === 'ALL' || entry.source === sourceFilter;
    const matchesAuthor =
      authorFilter === 'ALL' ||
      entry.createdBy.toLowerCase() === currentUser.fullName.toLowerCase();

    return matchesSearch && matchesSource && matchesAuthor;
  });

  filteredEntries.forEach((entry) => {
    if (entry.status === 'posted') {
      entry.lines.forEach((line) => {
        grandTotalDebits += line.debit;
        grandTotalCredits += line.credit;
      });
    }
  });

  grandTotalDebits = Math.round(grandTotalDebits * 100) / 100;
  grandTotalCredits = Math.round(grandTotalCredits * 100) / 100;
  const isBalanced = Math.abs(grandTotalDebits - grandTotalCredits) < 0.01;

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ocr_receipt':
      case 'receipt_ocr':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Receipt className="w-3 h-3" />
            <span>OCR Receipt</span>
          </span>
        );
      case 'bank_feed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <ArrowRightLeft className="w-3 h-3" />
            <span>Bank Feed</span>
          </span>
        );
      case 'qbo_import':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-3 h-3" />
            <span>QBO Import</span>
          </span>
        );
      case 'wave_import':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <FileText className="w-3 h-3" />
            <span>Wave Import</span>
          </span>
        );
      case 'csv_import':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <FileText className="w-3 h-3" />
            <span>CSV Import</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Tag className="w-3 h-3" />
            <span>Manual Entry</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Client Subheader Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              General Ledger (Double-Entry)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-slate-500">
              Immutable journal entries enforcing debits === credits balance.
            </p>
            <span className="text-slate-300">•</span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Bookkeeper: <strong className="text-slate-900">{currentUser.fullName}</strong></span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="post-journal-entry-main-btn"
            onClick={onOpenNewEntry}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Balanced Entry</span>
          </button>
        </div>
      </div>

      {/* Live Balance Verification Proof Card */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isBalanced
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-rose-50 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center space-x-3">
          {isBalanced ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Double-Entry Mathematical Balance Proof
            </div>
            <div className="text-xs text-emerald-700">
              {isBalanced
                ? 'All posted journal lines strictly satisfy the fundamental accounting equation.'
                : 'Warning: Ledger imbalance detected. Please audit lines.'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono font-bold">
          <div>
            <span className="text-slate-500 font-sans font-normal">Debits: </span>
            <span className="text-slate-900 font-bold">{formatCurrency(grandTotalDebits)}</span>
          </div>
          <div className="text-slate-300">=</div>
          <div>
            <span className="text-slate-500 font-sans font-normal">Credits: </span>
            <span className="text-slate-900 font-bold">{formatCurrency(grandTotalCredits)}</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-sans text-[11px] font-bold">
            Balanced
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memo, entry #, line..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Author Filter Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setAuthorFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                authorFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Staff Entries
            </button>
            <button
              onClick={() => setAuthorFilter('MINE')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                authorFilter === 'MINE'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3 h-3" />
              <span>My Entries</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Source:</span>
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Sources</option>
            <option value="manual">Manual Entry</option>
            <option value="ocr_receipt">OCR Receipt Extraction</option>
            <option value="receipt_ocr">OCR Receipt (Alt)</option>
            <option value="bank_feed">Bank Feed Match</option>
            <option value="qbo_import">QuickBooks Import</option>
            <option value="wave_import">Wave Import</option>
            <option value="csv_import">CSV Batch Import</option>
          </select>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          let entryDebits = 0;
          let entryCredits = 0;
          entry.lines.forEach((l) => {
            entryDebits += l.debit;
            entryCredits += l.credit;
          });

          const isExpanded = expandedEntries[entry.id] !== false; // Default expanded
          const isCreatedByCurrentUser = entry.createdBy.toLowerCase() === currentUser.fullName.toLowerCase();

          return (
            <div
              key={entry.id}
              className={`bg-white rounded-xl border transition-all ${
                entry.isReversal
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {/* Entry Card Header */}
              <div
                onClick={() => toggleExpand(entry.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none border-b border-slate-100"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-900 text-white">
                    #{entry.entryNumber}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{entry.memo}</span>
                      {getSourceBadge(entry.source)}
                      {entry.isReversal && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          Reversing Entry
                        </span>
                      )}
                      {isCreatedByCurrentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Posted by You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-3 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Date: {entry.entryDate}</span>
                      </span>
                      <span>•</span>
                      <span>Created by: {entry.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-500 font-sans text-[11px]">Total Balance</div>
                    <div className="font-bold text-slate-900">{formatCurrency(entryDebits)}</div>
                  </div>

                  {!entry.isReversal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReverseEntry(entry);
                      }}
                      title="Post Immutable Reversing Entry"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Multi-Line Ledger Breakdown */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <th className="py-2.5 px-4">Account Code & Name</th>
                        <th className="py-2.5 px-4">Line Description</th>
                        <th className="py-2.5 px-4">Tax Code</th>
                        <th className="py-2.5 px-4 text-right">Debit (CAD)</th>
                        <th className="py-2.5 px-4 text-right">Credit (CAD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {entry.lines.map((line) => {
                        const acc = accountMap.get(line.accountId);
                        return (
                          <tr key={line.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                              <span className="font-mono text-slate-500 mr-2 font-bold">
                                {acc?.accountCode || 'N/A'}
                              </span>
                              <span>{acc?.name || 'Unknown Account'}</span>
                            </td>
                            <td className="py-2.5 px-4 font-sans text-slate-600">
                              {line.description}
                            </td>
                            <td className="py-2.5 px-4 font-sans">
                              {line.taxCode ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {line.taxCode}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-semibold">
                              {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-900 font-semibold">
                              {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                        <td colSpan={3} className="py-2 px-4 text-right font-sans text-[11px] uppercase tracking-wider text-slate-500">
                          Total Entry Balance Proof:
                        </td>
                        <td className="py-2 px-4 text-right text-emerald-700">
                          {formatCurrency(entryDebits)}
                        </td>
                        <td className="py-2 px-4 text-right text-emerald-700">
                          {formatCurrency(entryCredits)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-700 text-sm">No journal entries found</div>
            <p className="text-xs text-slate-500 mt-1">Post a new journal entry or adjust search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
