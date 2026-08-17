import { useState, useMemo, useCallback } from 'react';
import {
  JournalEntry,
  ChartOfAccount,
  ClientBusiness,
  User,
  LedgerLine,
  JournalSource,
} from '../types';
import { createReversalJournalEntry } from '../utils/ledgerEngine';

export interface UseGeneralLedgerProps {
  client: ClientBusiness;
  entries: JournalEntry[];
  accounts: ChartOfAccount[];
  currentUser: User;
  onReverseEntry?: (entry: JournalEntry) => void;
  onPostEntry?: (entry: JournalEntry) => void;
}

export interface LedgerStaffStats {
  totalEntriesCount: number;
  currentUserEntriesCount: number;
  currentUserDebitVolume: number;
  currentUserCreditVolume: number;
  uniqueAuthors: string[];
}

export function useGeneralLedger({
  client,
  entries,
  accounts,
  currentUser,
  onReverseEntry,
  onPostEntry,
}: UseGeneralLedgerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [authorFilter, setAuthorFilter] = useState<string>('ALL'); // 'ALL', 'MINE', or specific author name
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start?: string; end?: string }>({});
  const [showReversalsOnly, setShowReversalsOnly] = useState<boolean>(false);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  // Fast account lookup map
  const accountMap = useMemo(() => {
    const map = new Map<string, ChartOfAccount>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Extract unique authors across all client entries
  const uniqueAuthors = useMemo(() => {
    const authorsSet = new Set<string>();
    entries.forEach((e) => {
      if (e.createdBy) authorsSet.add(e.createdBy.trim());
    });
    // Ensure current user is present for quick switching
    if (currentUser?.fullName) {
      authorsSet.add(currentUser.fullName.trim());
    }
    return Array.from(authorsSet).sort();
  }, [entries, currentUser]);

  // Compute staff contribution statistics
  const staffStats: LedgerStaffStats = useMemo(() => {
    let currentUserEntriesCount = 0;
    let currentUserDebitVolume = 0;
    let currentUserCreditVolume = 0;

    const currentUserName = currentUser?.fullName?.toLowerCase() || '';

    entries.forEach((entry) => {
      const isMine = entry.createdBy?.toLowerCase() === currentUserName;
      if (isMine) {
        currentUserEntriesCount++;
        entry.lines.forEach((line) => {
          currentUserDebitVolume += line.debit;
          currentUserCreditVolume += line.credit;
        });
      }
    });

    return {
      totalEntriesCount: entries.length,
      currentUserEntriesCount,
      currentUserDebitVolume: Math.round(currentUserDebitVolume * 100) / 100,
      currentUserCreditVolume: Math.round(currentUserCreditVolume * 100) / 100,
      uniqueAuthors,
    };
  }, [entries, currentUser, uniqueAuthors]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Text Search (Memo, Entry #, Line descriptions, or Creator Name)
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        entry.memo.toLowerCase().includes(term) ||
        entry.entryNumber.toString().includes(term) ||
        entry.createdBy.toLowerCase().includes(term) ||
        entry.lines.some((l) => l.description.toLowerCase().includes(term));

      // 2. Source Filter
      const matchesSource =
        sourceFilter === 'ALL' ||
        entry.source === sourceFilter ||
        (sourceFilter === 'ocr_receipt' && (entry.source === 'ocr_receipt' || entry.source === 'receipt_ocr'));

      // 3. Author Filter (All, Mine, or Specific Author)
      let matchesAuthor = true;
      if (authorFilter === 'MINE') {
        matchesAuthor = entry.createdBy.toLowerCase() === currentUser.fullName.toLowerCase();
      } else if (authorFilter !== 'ALL') {
        matchesAuthor = entry.createdBy.toLowerCase() === authorFilter.toLowerCase();
      }

      // 4. Reversal Only Filter
      const matchesReversal = !showReversalsOnly || entry.isReversal;

      // 5. Date Range Filter
      const matchesStartDate = !dateRangeFilter.start || entry.entryDate >= dateRangeFilter.start;
      const matchesEndDate = !dateRangeFilter.end || entry.entryDate <= dateRangeFilter.end;

      return matchesSearch && matchesSource && matchesAuthor && matchesReversal && matchesStartDate && matchesEndDate;
    });
  }, [entries, searchTerm, sourceFilter, authorFilter, showReversalsOnly, dateRangeFilter, currentUser]);

  // Calculate live Grand Debits and Credits
  const { grandTotalDebits, grandTotalCredits, isBalanced } = useMemo(() => {
    let debits = 0;
    let credits = 0;

    filteredEntries.forEach((entry) => {
      if (entry.status === 'posted') {
        entry.lines.forEach((line) => {
          debits += line.debit;
          credits += line.credit;
        });
      }
    });

    debits = Math.round(debits * 100) / 100;
    credits = Math.round(credits * 100) / 100;
    const balanced = Math.abs(debits - credits) < 0.01;

    return {
      grandTotalDebits: debits,
      grandTotalCredits: credits,
      isBalanced: balanced,
    };
  }, [filteredEntries]);

  // Toggle entry expansion state
  const toggleExpand = useCallback((id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const expandAll = useCallback(() => {
    const allExpanded: Record<string, boolean> = {};
    filteredEntries.forEach((e) => {
      allExpanded[e.id] = true;
    });
    setExpandedEntries(allExpanded);
  }, [filteredEntries]);

  const collapseAll = useCallback(() => {
    const allCollapsed: Record<string, boolean> = {};
    filteredEntries.forEach((e) => {
      allCollapsed[e.id] = false;
    });
    setExpandedEntries(allCollapsed);
  }, [filteredEntries]);

  // Factory function to create a new JournalEntry with guaranteed currentUser attribution
  const createEntryWithCurrentUser = useCallback(
    (params: {
      entryDate: string;
      memo: string;
      source?: JournalSource;
      lines: Omit<LedgerLine, 'id' | 'journalEntryId'>[];
    }): JournalEntry => {
      const entryId = `je-${params.source || 'manual'}-${Date.now()}`;
      const fullLines: LedgerLine[] = params.lines.map((l, idx) => ({
        ...l,
        id: `line-${entryId}-${idx + 1}`,
        journalEntryId: entryId,
      }));

      const newEntry: JournalEntry = {
        id: entryId,
        clientBusinessId: client.id,
        entryNumber: Math.floor(1000 + Math.random() * 9000),
        entryDate: params.entryDate,
        memo: params.memo,
        source: params.source || 'manual',
        status: 'posted',
        createdBy: currentUser.fullName,
        postedAt: new Date().toISOString(),
        lines: fullLines,
      };

      if (onPostEntry) {
        onPostEntry(newEntry);
      }

      return newEntry;
    },
    [client.id, currentUser.fullName, onPostEntry]
  );

  // Reversal handler ensuring currentUser is tagged as the reversal author
  const executeReversalWithCurrentUser = useCallback(
    (originalEntry: JournalEntry, customReason?: string) => {
      const reason = customReason || `Reversal of Entry #${originalEntry.entryNumber}: ${originalEntry.memo}`;
      const reversal = createReversalJournalEntry(
        originalEntry,
        currentUser.fullName,
        reason
      );

      if (onReverseEntry) {
        onReverseEntry(reversal);
      }
      return reversal;
    },
    [currentUser.fullName, onReverseEntry]
  );

  // Helper to check if a specific entry was authored by the logged in bookkeeper
  const isAuthoredByCurrentUser = useCallback(
    (entry: JournalEntry) => {
      return entry.createdBy?.toLowerCase() === currentUser?.fullName?.toLowerCase();
    },
    [currentUser]
  );

  // Export filtered ledger to CSV with complete author attribution
  const exportLedgerToCSV = useCallback(() => {
    const headers = [
      'Entry #',
      'Date',
      'Memo',
      'Source',
      'Status',
      'Created By Staff',
      'Is Reversal',
      'Account Code',
      'Account Name',
      'Line Description',
      'Tax Code',
      'Debit (CAD)',
      'Credit (CAD)',
    ];

    const rows: string[][] = [];

    filteredEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        const acc = accountMap.get(line.accountId);
        rows.push([
          `#${entry.entryNumber}`,
          entry.entryDate,
          `"${entry.memo.replace(/"/g, '""')}"`,
          entry.source,
          entry.status,
          `"${entry.createdBy.replace(/"/g, '""')}"`,
          entry.isReversal ? 'YES' : 'NO',
          acc?.accountCode || '',
          `"${(acc?.name || '').replace(/"/g, '""')}"`,
          `"${line.description.replace(/"/g, '""')}"`,
          line.taxCode || '',
          line.debit > 0 ? line.debit.toFixed(2) : '0.00',
          line.credit > 0 ? line.credit.toFixed(2) : '0.00',
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${client.legalName.replace(/ /g, '_')}_General_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredEntries, accountMap, client.legalName]);

  return {
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    authorFilter,
    setAuthorFilter,
    dateRangeFilter,
    setDateRangeFilter,
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
    createEntryWithCurrentUser,
    executeReversalWithCurrentUser,
    isAuthoredByCurrentUser,
    exportLedgerToCSV,
  };
}
