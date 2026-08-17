import { useState, useMemo, useCallback } from 'react';
import {
  Firm,
  ClientBusiness,
  BookkeepingStatus,
  User,
  ActiveTab,
} from '../types';

export interface UseFirmOverviewProps {
  firm: Firm;
  clients: ClientBusiness[];
  currentUser?: User;
  bankTxCounts?: Record<string, number>;
  receiptCounts?: Record<string, number>;
  onSelectClient: (client: ClientBusiness, targetTab?: ActiveTab) => void;
  onOpenNewClient: () => void;
}

export function useFirmOverview({
  firm,
  clients,
  currentUser,
  bankTxCounts = {},
  receiptCounts = {},
  onSelectClient,
  onOpenNewClient,
}: UseFirmOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bookkeeperFilter, setBookkeeperFilter] = useState<string>('ALL');

  // Unique assigned bookkeepers across the firm
  const uniqueBookkeepers = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.assignedBookkeeper) set.add(c.assignedBookkeeper.trim());
    });
    if (currentUser?.fullName) {
      set.add(currentUser.fullName.trim());
    }
    return Array.from(set).sort();
  }, [clients, currentUser]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        client.legalName.toLowerCase().includes(term) ||
        (client.operatingName && client.operatingName.toLowerCase().includes(term)) ||
        client.businessNumber.includes(term) ||
        client.assignedBookkeeper.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;

      let matchesBookkeeper = true;
      if (bookkeeperFilter === 'MINE') {
        matchesBookkeeper =
          Boolean(currentUser?.fullName) &&
          client.assignedBookkeeper.toLowerCase() === currentUser?.fullName?.toLowerCase();
      } else if (bookkeeperFilter !== 'ALL') {
        matchesBookkeeper = client.assignedBookkeeper.toLowerCase() === bookkeeperFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesBookkeeper;
    });
  }, [clients, searchTerm, statusFilter, bookkeeperFilter, currentUser]);

  // Practice Metrics & Capacity
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const capacityLimit = firm.activeClientLimit;
    const capacityPercentage = Math.round((totalClients / capacityLimit) * 100);

    let upToDateCount = 0;
    let needsAttentionCount = 0;
    let myClientsCount = 0;
    let totalUnreconciledBankTx = 0;
    let totalPendingReceipts = 0;

    const currentUserName = currentUser?.fullName?.toLowerCase() || '';

    clients.forEach((c) => {
      if (c.status === 'Up to Date' || c.status === 'Books Closed') {
        upToDateCount++;
      } else {
        needsAttentionCount++;
      }

      if (c.assignedBookkeeper.toLowerCase() === currentUserName) {
        myClientsCount++;
      }

      totalUnreconciledBankTx += bankTxCounts[c.id] || 0;
      totalPendingReceipts += receiptCounts[c.id] || 0;
    });

    return {
      totalClients,
      capacityLimit,
      capacityPercentage,
      upToDateCount,
      needsAttentionCount,
      myClientsCount,
      totalUnreconciledBankTx,
      totalPendingReceipts,
    };
  }, [clients, firm, currentUser, bankTxCounts, receiptCounts]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    bookkeeperFilter,
    setBookkeeperFilter,
    uniqueBookkeepers,
    filteredClients,
    metrics,
    onSelectClient,
    onOpenNewClient,
  };
}
