import { useState, useMemo, useCallback, type FormEvent } from 'react';
import {
  ChartOfAccount,
  ClientBusiness,
  JournalEntry,
  AccountType,
  AccountClassification,
  User,
} from '../types';
import { calculateAccountBalances } from '../utils/ledgerEngine';

export interface UseChartOfAccountsProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
  currentUser?: User;
  onAddAccount: (newAcc: Omit<ChartOfAccount, 'id'>) => void;
}

export interface COAValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useChartOfAccounts({
  client,
  accounts,
  entries,
  currentUser,
  onAddAccount,
}: UseChartOfAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for creating a new account
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('expense');
  const [newClassification, setNewClassification] = useState<AccountClassification>('operating_expense');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Compute live balances for all accounts
  const balanceMap = useMemo(() => {
    return calculateAccountBalances(accounts, entries);
  }, [accounts, entries]);

  // Validate GAAP code ranges and consistency
  const validateNewAccount = useCallback(
    (code: string, name: string, type: AccountType, classification: AccountClassification): COAValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const cleanCode = code.trim();
      const cleanName = name.trim();

      if (!cleanCode) {
        errors.push('Account code is required.');
      } else if (!/^\d{4,5}$/.test(cleanCode)) {
        errors.push('Account code must be a 4 or 5-digit number (e.g. 1010, 5200).');
      }

      // Uniqueness check
      const codeExists = accounts.some(
        (a) => a.accountCode === cleanCode && a.clientBusinessId === client.id
      );
      if (codeExists) {
        errors.push(`Account code ${cleanCode} is already assigned to another account.`);
      }

      if (!cleanName) {
        errors.push('Account name is required.');
      } else if (cleanName.length < 3) {
        errors.push('Account name must be at least 3 characters long.');
      }

      // Check standard GAAP number range
      const numericCode = parseInt(cleanCode, 10);
      if (numericCode) {
        if (type === 'asset' && (numericCode < 1000 || numericCode > 1999)) {
          warnings.push('Asset accounts standard numbering is 1000 - 1999.');
        } else if (type === 'liability' && (numericCode < 2000 || numericCode > 2999)) {
          warnings.push('Liability accounts standard numbering is 2000 - 2999.');
        } else if (type === 'equity' && (numericCode < 3000 || numericCode > 3999)) {
          warnings.push('Equity accounts standard numbering is 3000 - 3999.');
        } else if (type === 'revenue' && (numericCode < 4000 || numericCode > 4999)) {
          warnings.push('Revenue accounts standard numbering is 4000 - 4999.');
        } else if (type === 'expense' && (numericCode < 5000 || numericCode > 9999)) {
          warnings.push('Expense accounts standard numbering is 5000 - 9999.');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [accounts, client.id]
  );

  // Auto-adjust default classification when type changes
  const handleTypeChange = useCallback((type: AccountType) => {
    setNewType(type);
    switch (type) {
      case 'asset':
        setNewClassification('current_asset');
        break;
      case 'liability':
        setNewClassification('current_liability');
        break;
      case 'equity':
        setNewClassification('owner_equity');
        break;
      case 'revenue':
        setNewClassification('operating_revenue');
        break;
      case 'expense':
        setNewClassification('operating_expense');
        break;
    }
  }, []);

  // Submit Handler with Validation
  const handleCreateAccount = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const validation = validateNewAccount(newCode, newName, newType, newClassification);

      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      onAddAccount({
        clientBusinessId: client.id,
        accountCode: newCode.trim(),
        name: newName.trim(),
        type: newType,
        classification: newClassification,
        currency: 'CAD',
        isActive: true,
        isSystem: false,
      });

      setNewCode('');
      setNewName('');
      setFormErrors([]);
      setIsAddModalOpen(false);
      setSuccessToast(`Account ${newCode.trim()} - ${newName.trim()} created successfully.`);
      setTimeout(() => setSuccessToast(null), 3000);
    },
    [newCode, newName, newType, newClassification, validateNewAccount, onAddAccount, client.id]
  );

  // Filtered & Sorted Accounts
  const filteredAccounts = useMemo(() => {
    return accounts
      .slice()
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
      .filter((acc) => {
        const matchesSearch =
          acc.accountCode.includes(searchTerm) ||
          acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.classification.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType === 'ALL' || acc.type === selectedType;

        return matchesSearch && matchesType;
      });
  }, [accounts, searchTerm, selectedType]);

  // Account Type Breakdown Counts
  const typeCounts = useMemo(() => {
    const counts = {
      ALL: accounts.length,
      asset: 0,
      liability: 0,
      equity: 0,
      revenue: 0,
      expense: 0,
    };
    accounts.forEach((a) => {
      if (counts[a.type] !== undefined) {
        counts[a.type]++;
      }
    });
    return counts;
  }, [accounts]);

  // Export COA to CSV
  const exportCOAToCSV = useCallback(() => {
    const headers = ['Account Code', 'Account Name', 'Type', 'Classification', 'Net Balance (CAD)', 'Status'];
    const rows = filteredAccounts.map((a) => {
      const bal = balanceMap[a.id] || 0;
      return [
        a.accountCode,
        `"${a.name.replace(/"/g, '""')}"`,
        a.type.toUpperCase(),
        a.classification,
        bal.toFixed(2),
        a.isActive ? 'ACTIVE' : 'INACTIVE',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${client.legalName.replace(/ /g, '_')}_Chart_Of_Accounts_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredAccounts, balanceMap, client.legalName]);

  return {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    isAddModalOpen,
    setIsAddModalOpen,
    newCode,
    setNewCode,
    newName,
    setNewName,
    newType,
    newClassification,
    setNewClassification,
    handleTypeChange,
    handleCreateAccount,
    validateNewAccount,
    formErrors,
    balanceMap,
    filteredAccounts,
    typeCounts,
    exportCOAToCSV,
    successToast,
  };
}
