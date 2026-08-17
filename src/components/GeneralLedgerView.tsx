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
      {/* Client & Active Bookkeeper Context Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              General Ledger (Double-Entry)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Active Bookkeeper: <strong className="text-slate-900">{currentUser.fullName}</strong>
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-200/60 text-emerald-900 border border-emerald-300/50">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>

            <span className="text-slate-300">•</span>

            <span className="text-slate-500">
              Assigned Client Lead:{' '}
              <strong className="text-slate-800">{client.assignedBookkeeper || currentUser.fullName}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 self-start md:self-center">
          <button
            onClick={exportLedgerToCSV}
            title="Download CSV report with complete staff creator attribution"
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="post-journal-entry-main-btn"
            onClick={onOpenNewEntry}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Balanced Entry</span>
          </button>
        </div>
      </div>

      {/* Staff Audit Metrics & Live Mathematical Proof Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Current User Activity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Entries by {currentUser.fullName.split(' ')[0]}
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {staffStats.currentUserEntriesCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                of {staffStats.totalEntriesCount} total ({staffStats.totalEntriesCount > 0 ? Math.round((staffStats.currentUserEntriesCount / staffStats.totalEntriesCount) * 100) : 0}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Volume: {formatCurrency(staffStats.currentUserDebitVolume)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Contributing Staff Team */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Contributing Staff
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {uniqueAuthors.length}{' '}
              <span className="text-xs font-normal text-slate-500">Bookkeepers</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[200px]" title={uniqueAuthors.join(', ')}>
              {uniqueAuthors.join(', ')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Mathematical Ledger Equality Balance */}
        <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between ${
          isBalanced
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
              <span>Equation Status</span>
              {isBalanced && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-900">
              Debits: {formatCurrency(grandTotalDebits)}
            </div>
            <div className="text-xs font-mono font-bold text-slate-900">
              Credits: {formatCurrency(grandTotalCredits)}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
            isBalanced ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {isBalanced ? 'Balanced' : 'Imbalanced'}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memo, entry #, line description, or bookkeeper name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Staff Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
            <button
              onClick={() => setAuthorFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                authorFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Staff ({entries.length})
            </button>
            <button
              onClick={() => setAuthorFilter('MINE')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 ${
                authorFilter === 'MINE'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>My Entries ({staffStats.currentUserEntriesCount})</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Specific Author Filter Dropdown */}
            <div className="flex items-center space-x-1.5 text-slate-500">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Bookkeeper:</span>
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Bookkeepers</option>
                <option value="MINE">My Entries ({currentUser.fullName})</option>
                <optgroup label="Filter By Individual Bookkeeper">
                  {uniqueAuthors.map((author) => (
                    <option key={author} value={author}>
                      {author} {author.toLowerCase() === currentUser.fullName.toLowerCase() ? '(You)' : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center space-x-1.5 text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Sources</option>
                <option value="manual">Manual Entry</option>
                <option value="ocr_receipt">OCR Receipt</option>
                <option value="bank_feed">Bank Feed Match</option>
                <option value="qbo_import">QuickBooks Import</option>
                <option value="wave_import">Wave Import</option>
                <option value="csv_import">CSV Batch Import</option>
              </select>
            </div>

            {/* Reversals Only Toggle */}
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

          {/* Expand / Collapse Actions */}
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
      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          let entryDebits = 0;
          let entryCredits = 0;
          entry.lines.forEach((l) => {
            entryDebits += l.debit;
            entryCredits += l.credit;
          });

          const isExpanded = expandedEntries[entry.id] !== false; // Default expanded
          const isCreatedByCurrentUser = isAuthoredByCurrentUser(entry);

          return (
            <div
              key={entry.id}
              className={`bg-white rounded-xl border transition-all ${
                entry.isReversal
                  ? 'border-amber-200 bg-amber-50/20'
                  : isCreatedByCurrentUser
                  ? 'border-emerald-200/90 shadow-sm hover:border-emerald-300'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {/* Entry Card Header */}
              <div
                onClick={() => toggleExpand(entry.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none border-b border-slate-100"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-900 text-white mt-0.5 sm:mt-0">
                    #{entry.entryNumber}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{entry.memo}</span>
                      {getSourceBadge(entry.source)}
                      {entry.isReversal && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          Reversing Entry
                        </span>
                      )}
                      {isCreatedByCurrentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                          <UserCheck className="w-3 h-3" />
                          <span>Posted by You</span>
                        </span>
                      )}
                    </div>

                    {/* Bookkeeper Attribution & Timestamp */}
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Date: {entry.entryDate}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-slate-600">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span>Created by:</span>
                        <strong className="text-slate-800 font-semibold">{entry.createdBy}</strong>
                      </span>
                      {entry.postedAt && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(entry.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
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
                        setReversalCandidate(entry);
                        setReversalReason(`Reversal of Entry #${entry.entryNumber}: ${entry.memo}`);
                      }}
                      title="Post Immutable Reversing Entry under your staff credentials"
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
            <div className="font-semibold text-slate-700 text-sm">No journal entries match criteria</div>
            <p className="text-xs text-slate-500 mt-1">
              {authorFilter === 'MINE'
                ? `You have not created any entries for ${client.legalName} yet. Click "Post Balanced Entry" to record one.`
                : 'Try adjusting your search terms or filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Staff Reversal Confirmation Modal */}
      {reversalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
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

            {/* Audit Log Attribution Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audit Attribution Record</span>
              </div>
              <p className="text-slate-500">
                This reversal will be permanently appended to the immutable General Ledger under your credentials:
              </p>
              <div className="font-medium text-slate-800 flex items-center space-x-2 pt-0.5">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {currentUser.fullName}
                </span>
                <span className="text-slate-400">({currentUser.role.replace('_', ' ')})</span>
              </div>
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

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setReversalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
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
