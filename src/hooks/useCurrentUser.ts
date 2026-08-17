import { useMemo } from 'react';
import { User, UserRole, ClientBusiness, JournalEntry } from '../types';
import { useAccounting } from '../context/AccountingContext';

export interface UserPermissions {
  canPostManualEntries: boolean;
  canReverseEntries: boolean;
  canFileTaxes: boolean;
  canProvisionClients: boolean;
  canClosePeriod: boolean;
  canManageStaff: boolean;
  canExportReports: boolean;
}

export interface UseCurrentUserResult {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  permissions: UserPermissions;
  isFirmOwner: boolean;
  isFirmAdmin: boolean;
  isStaffBookkeeper: boolean;
  assignedClients: ClientBusiness[];
  myEntriesCount: number;
  recentActivity: JournalEntry[];
}

export const useCurrentUser = (): UseCurrentUserResult => {
  const { currentUser, setCurrentUser, users, clients, journalEntries } = useAccounting();

  const isFirmOwner = currentUser.role === 'firm_owner';
  const isFirmAdmin = currentUser.role === 'firm_admin';
  const isStaffBookkeeper = currentUser.role === 'staff_bookkeeper';

  const permissions = useMemo<UserPermissions>(() => {
    switch (currentUser.role) {
      case 'firm_owner':
      case 'firm_admin':
        return {
          canPostManualEntries: true,
          canReverseEntries: true,
          canFileTaxes: true,
          canProvisionClients: true,
          canClosePeriod: true,
          canManageStaff: true,
          canExportReports: true,
        };
      case 'staff_bookkeeper':
        return {
          canPostManualEntries: true,
          canReverseEntries: true,
          canFileTaxes: true,
          canProvisionClients: false,
          canClosePeriod: false,
          canManageStaff: false,
          canExportReports: true,
        };
      default:
        return {
          canPostManualEntries: false,
          canReverseEntries: false,
          canFileTaxes: false,
          canProvisionClients: false,
          canClosePeriod: false,
          canManageStaff: false,
          canExportReports: true,
        };
    }
  }, [currentUser.role]);

  const assignedClients = useMemo(() => {
    return clients.filter(
      (c) => c.assignedBookkeeper.toLowerCase() === currentUser.fullName.toLowerCase()
    );
  }, [clients, currentUser.fullName]);

  const myEntries = useMemo(() => {
    return journalEntries.filter(
      (j) => j.createdBy.toLowerCase() === currentUser.fullName.toLowerCase()
    );
  }, [journalEntries, currentUser.fullName]);

  const switchUserById = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  return {
    currentUser,
    allUsers: users,
    setCurrentUser,
    switchUserById,
    permissions,
    isFirmOwner,
    isFirmAdmin,
    isStaffBookkeeper,
    assignedClients,
    myEntriesCount: myEntries.length,
    recentActivity: myEntries.slice(0, 5),
  };
};
