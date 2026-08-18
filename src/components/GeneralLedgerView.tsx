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
  Download,
  Check,
  ChevronsUpDown,
  UserCheck,
  Briefcase,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClientBusiness, JournalEntry, ChartOfAccount, User } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { useGeneralLedger } from '../hooks/useGeneralLedger';

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
  const {
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    authorFilter,
    setAuthorFilter,
    showReversalsOnly,
    setShowReversalsOnly,
    expandedEntries,
    toggleExpand,
    expandAll,
    collapseAll,
    accountMap,
    uniqueAuthors,
    staffStats,
    filteredEntries,
    grandTotalDebits,
    grandTotalCredits,
    isBalanced,
    executeReversalWithCurrentUser,
    isAuthoredByCurrentUser,
    exportLedgerToCSV,
  } = useGeneralLedger({
    client,
    entries,
    accounts,
    currentUser,
    onReverseEntry,
  });

  const [reversalCandidate, setReversalCandidate] = useState<JournalEntry | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const handleConfirmReversal = () => {
    if (!reversalCandidate) return;
    executeReversalWithCurrentUser(reversalCandidate, reversalReason || undefined);
    setReversalCandidate(null);
    setReversalReason('');
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ocr_receipt':
      case 'receipt_ocr':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/90">
            <Receipt className="w-2.5 h-2.5 text-slate-500" />
            <span>OCR Receipt</span>
          </span>
        );
      case 'bank_feed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/90">
            <ArrowRightLeft className="w-2.5 h-2.5 text-slate-500" />
            <span>Bank Feed</span>
          </span>
        );
      case 'qbo_import':
      case 'wave_import':
      case 'csv_import':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/90">
            <FileText className="w-2.5 h-2.5 text-slate-500" />
            <span>CSV Import</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/90">
            <Tag className="w-2.5 h-2.5 text-slate-500" />
            <span>Manual</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Client Context Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              General Ledger
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200/70 font-medium">
              <UserIcon className="w-3 h-3 text-emerald-600" />
              <span>
                Staff: <strong className="text-slate-900">{currentUser.fullName}</strong>
              </span>
              <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-emerald-200/60 text-emerald-900">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>

            <span className="text-slate-300">•</span>
            <span>Client Lead: <strong className="text-slate-700">{client.assignedBookkeeper || currentUser.fullName}</strong></span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 self-stretch sm:self-auto">
          <button
            onClick={exportLedgerToCSV}
            title="Download CSV report with full staff creator attribution"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200 min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="post-journal-entry-main-btn"
            onClick={onOpenNewEntry}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Entry</span>
          </button>
        </div>
      </div>

      {/* Audit Metrics & Live Equation Proof */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1: Current User Activity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Entries by {currentUser.fullName.split(' ')[0]}
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {staffStats.currentUserEntriesCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                of {staffStats.totalEntriesCount} ({staffStats.totalEntriesCount > 0 ? Math.round((staffStats.currentUserEntriesCount / staffStats.totalEntriesCount) * 100) : 0}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Volume: {formatCurrency(staffStats.currentUserDebitVolume)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Contributing Staff Team */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Staff Contributors
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {uniqueAuthors.length}{' '}
              <span className="text-xs font-normal text-slate-500">Bookkeepers</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]" title={uniqueAuthors.join(', ')}>
              {uniqueAuthors.join(', ')}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Mathematical Ledger Equality Balance */}
        <div className={`p-4 rounded-xl border shadow-xs flex items-center justify-between ${
          isBalanced
            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
              <span>Trial Balance Status</span>
              {isBalanced && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-900">
              Debits: {formatCurrency(grandTotalDebits)}
            </div>
            <div className="text-xs font-mono font-bold text-slate-900">
              Credits: {formatCurrency(grandTotalCredits)}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
            isBalanced ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {isBalanced ? 'Balanced' : 'Imbalanced'}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memo, entry #, line description, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Staff Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setAuthorFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all min-h-[36px] ${
                authorFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Staff ({entries.length})
            </button>
            <button
              onClick={() => setAuthorFilter('MINE')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 min-h-[36px] ${
                authorFilter === 'MINE'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3 h-3" />
              <span>My Entries ({staffStats.currentUserEntriesCount})</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Bookkeeper Dropdown */}
            <div className="flex items-center space-x-1 text-slate-500">
              <span>Author:</span>
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Authors</option>
                <option value="MINE">My Entries ({currentUser.fullName})</option>
                {uniqueAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author} {author.toLowerCase() === currentUser.fullName.toLowerCase() ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center space-x-1 text-slate-500">
              <span>Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Sources</option>
                <option value="manual">Manual Entry</option>
                <option value="ocr_receipt">OCR Receipt</option>
                <option value="bank_feed">Bank Feed</option>
                <option value="csv_import">CSV Import</option>
              </select>
            </div>

            {/* Reversals Only Checkbox */}
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={showReversalsOnly}
                onChange={(e) => setShowReversalsOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span>Reversals Only</span>
            </label>
          </div>

          {/* Expand / Collapse */}
          <div className="flex items-center space-x-2 text-slate-500">
            <button
              onClick={expandAll}
              className="text-[11px] hover:text-slate-900 font-medium px-2 py-0.5 rounded hover:bg-slate-100"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="text-[11px] hover:text-slate-900 font-medium px-2 py-0.5 rounded hover:bg-slate-100"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredEntries.map((entry) => {
          let entryDebits = 0;
          let entryCredits = 0;
          entry.lines.forEach((l) => {
            entryDebits += l.debit;
            entryCredits += l.credit;
          });

          const isExpanded = expandedEntries[entry.id] !== false;
          const isCreatedByCurrentUser = isAuthoredByCurrentUser(entry);

          return (
            <div
              key={entry.id}
              className={`bg-white rounded-xl border transition-all ${
                entry.isReversal
                  ? 'border-amber-200 bg-amber-50/15'
                  : isCreatedByCurrentUser
                  ? 'border-emerald-200/90 shadow-xs'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {/* Entry Card Header */}
              <div
                onClick={() => toggleExpand(entry.id)}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 cursor-pointer select-none border-b border-slate-100"
              >
                <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3">
                  <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-slate-900 text-white mt-0.5 sm:mt-0 shrink-0">
                    #{entry.entryNumber}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{entry.memo}</span>
                      {getSourceBadge(entry.source)}
                      {entry.isReversal && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          Reversal
                        </span>
                      )}
                      {isCreatedByCurrentUser && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                          <UserCheck className="w-2.5 h-2.5" />
                          <span>You</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span>Date: <strong className="text-slate-600 font-normal">{entry.entryDate}</strong></span>
                      <span>•</span>
                      <span>By: <strong className="text-slate-700">{entry.createdBy}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-slate-400 text-[10px] sm:hidden mr-2">Balance:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(entryDebits)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {!entry.isReversal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReversalCandidate(entry);
                          setReversalReason(`Reversal of Entry #${entry.entryNumber}: ${entry.memo}`);
                        }}
                        title="Post Immutable Reversal Entry"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Multi-Line Ledger Table */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[540px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <th className="py-2 px-3 sm:px-4">Account Code & Name</th>
                        <th className="py-2 px-3 sm:px-4">Line Description</th>
                        <th className="py-2 px-3 sm:px-4">Tax Code</th>
                        <th className="py-2 px-3 sm:px-4 text-right">Debit (CAD)</th>
                        <th className="py-2 px-3 sm:px-4 text-right">Credit (CAD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {entry.lines.map((line) => {
                        const acc = accountMap.get(line.accountId);
                        return (
                          <tr key={line.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 sm:px-4 font-sans font-medium text-slate-900">
                              <span className="font-mono text-slate-500 mr-1.5 font-bold">
                                {acc?.accountCode || 'N/A'}
                              </span>
                              <span>{acc?.name || 'Unknown Account'}</span>
                            </td>
                            <td className="py-2 px-3 sm:px-4 font-sans text-slate-600">
                              {line.description}
                            </td>
                            <td className="py-2 px-3 sm:px-4 font-sans">
                              {line.taxCode ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {line.taxCode}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 sm:px-4 text-right text-slate-900 font-semibold">
                              {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                            </td>
                            <td className="py-2 px-3 sm:px-4 text-right text-slate-900 font-semibold">
                              {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50/70 font-bold text-slate-900 border-t border-slate-200">
                        <td colSpan={3} className="py-1.5 px-3 sm:px-4 text-right font-sans text-[10px] uppercase tracking-wider text-slate-500">
                          Total Balance Proof:
                        </td>
                        <td className="py-1.5 px-3 sm:px-4 text-right text-emerald-700">
                          {formatCurrency(entryDebits)}
                        </td>
                        <td className="py-1.5 px-3 sm:px-4 text-right text-emerald-700">
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
          <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-700 text-sm">No journal entries match criteria</div>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>

      {/* Reversal Confirmation Modal */}
      {reversalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Post Immutable Reversing Entry
                </h3>
                <p className="text-xs text-slate-500">
                  Entry #{reversalCandidate.entryNumber}: {reversalCandidate.memo}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audit Attribution</span>
              </div>
              <p className="text-slate-500">
                Recorded under your credentials: <strong className="text-slate-800">{currentUser.fullName}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reversal Memo / Reason
              </label>
              <input
                type="text"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="Reason for reversing this journal entry..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setReversalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors min-h-[40px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs min-h-[40px]"
              >
                Confirm & Post Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
