// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  BookOpen,
  ArrowRightLeft,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  BarChart3,
  UploadCloud,
  Server,
  ChevronLeft,
  ChevronRight,
  Settings,
  User as UserIcon,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  FilePlus2,
  UserPlus,
  Upload,
} from 'lucide-react';
import { ActiveTab, Firm, User } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  firm: Firm;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenSettings: () => void;
  onOpenNewEntry?: () => void;
  onOpenNewClient?: () => void;
  bankTxCount?: number;
  receiptCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavGroup {
  id: string;
  title: string;
  collapsible?: boolean;
  items: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  firm,
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenSettings,
  onOpenNewEntry,
  onOpenNewClient,
  bankTxCount = 5,
  receiptCount = 3,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Collapsible section state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    practice: true,
    bookkeeping: true,
    tax: true,
    tools: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'practice',
      title: 'PRACTICE HUB',
      collapsible: false,
      items: [
        { id: 'firm-overview', label: 'Firm Portfolio', icon: Building2 },
      ],
    },
    {
      id: 'bookkeeping',
      title: 'CORE BOOKKEEPING',
      collapsible: true,
      items: [
        { id: 'general-ledger', label: 'General Ledger', icon: BookOpen },
        {
          id: 'bank-reconciliation',
          label: 'Bank Feeds',
          icon: ArrowRightLeft,
          badge: bankTxCount > 0 ? `${bankTxCount}` : '5',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/80 font-semibold',
        },
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: FileSpreadsheet },
        {
          id: 'receipts-ocr',
          label: 'Receipts & AI OCR',
          icon: Receipt,
          badge: receiptCount > 0 ? `${receiptCount}` : '3',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/80 font-semibold',
        },
      ],
    },
    {
      id: 'tax',
      title: 'TAX & COMPLIANCE',
      collapsible: true,
      items: [
        { id: 'tax-filing', label: 'CRA & RQ Tax', icon: FileCheck2 },
        { id: 'financial-reports', label: 'Financial Reports', icon: BarChart3 },
      ],
    },
    {
      id: 'tools',
      title: 'TOOLS & PLATFORM',
      collapsible: true,
      items: [
        { id: 'csv-import', label: 'CSV Importer', icon: UploadCloud },
        { id: 'architecture-docs', label: 'Backend & Database', icon: Server },
      ],
    },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 256 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen text-slate-700 select-none z-30 shrink-0 sticky top-0 shadow-xs"
    >
      {/* Top Section */}
      <div>
        {/* Branding Header with Stable Top Toggle Button */}
        <div className="h-16 flex items-center px-3.5 border-b border-slate-100 justify-between">
          <div
            onClick={() => onSelectTab('firm-overview')}
            className="flex items-center space-x-3 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-xs shrink-0 group-hover:bg-emerald-800 transition-colors">
              <Layers className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="font-bold text-sm text-slate-900 tracking-tight truncate">
                  Studio Books
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  Bookkeeping & Associates
                </p>
              </div>
            )}
          </div>

          {/* Toggle Button Always Stays in Top Header */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Wave-Style "+ Create New" Action Button */}
        <div className="p-3 pb-1 relative">
          <button
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center transition-colors shadow-xs ${
              isCollapsed
                ? 'justify-center p-2.5 min-h-[38px]'
                : 'justify-between px-3.5 py-2.5 text-xs min-h-[38px]'
            }`}
            title={isCollapsed ? 'Create New...' : undefined}
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 stroke-[3]" />
              {!isCollapsed && <span>Create New</span>}
            </div>
            {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />}
          </button>

          {/* Quick Create Dropdown Menu */}
          {isCreateMenuOpen && (
            <div
              className={`absolute top-14 ${
                isCollapsed ? 'left-14 w-56' : 'left-3 right-3'
              } bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 space-y-0.5`}
            >
              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  if (onOpenNewEntry) onOpenNewEntry();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FilePlus2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>New Journal Entry</span>
              </button>

              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  onSelectTab('receipts-ocr');
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Upload & Scan Receipt</span>
              </button>

              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  if (onOpenNewClient) onOpenNewClient();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Provision Client File</span>
              </button>

              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  onSelectTab('csv-import');
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Batch CSV Import</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Navigation Categories */}
        <div className="py-2 px-3 space-y-3 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-none">
          {navGroups.map((group) => {
            const isExpanded = expandedGroups[group.id] !== false;

            return (
              <div key={group.id} className="space-y-1">
                {!isCollapsed && (
                  <div
                    onClick={() => group.collapsible && toggleGroup(group.id)}
                    className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 flex items-center justify-between ${
                      group.collapsible ? 'cursor-pointer hover:text-slate-600' : ''
                    }`}
                  >
                    <span>{group.title}</span>
                    {group.collapsible && (
                      <ChevronDown
                        className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'transform rotate-0' : 'transform -rotate-90'
                        }`}
                      />
                    )}
                  </div>
                )}

                {/* Items List with Smooth Collapse */}
                <AnimatePresence initial={false}>
                  {(isCollapsed || isExpanded) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-0.5 overflow-hidden"
                    >
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => onSelectTab(item.id)}
                            title={isCollapsed ? item.label : undefined}
                            className={`relative w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isCollapsed ? 'justify-center' : 'justify-between'
                            } ${
                              isActive
                                ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/70 font-bold shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? 'text-emerald-700' : 'text-slate-500'
                                }`}
                              />
                              {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </div>

                            {!isCollapsed && item.badge !== undefined && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                  item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer: Practice Settings & User Persona */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/60">
        {/* Practice Settings Trigger */}
        <button
          onClick={onOpenSettings}
          title={isCollapsed ? 'Practice Settings' : undefined}
          className={`w-full flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs transition-all border border-transparent hover:border-slate-200/80 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-slate-500" />
            {!isCollapsed && <span>Practice Settings</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-slate-500 font-mono">QC / CRA</span>
          )}
        </button>

        {/* User Persona Profile Card */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title={isCollapsed ? currentUser.fullName : undefined}
            className={`w-full flex items-center p-2 rounded-xl text-xs text-slate-700 hover:bg-white hover:shadow-2xs transition-all border border-transparent hover:border-slate-200/80 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                BA
              </div>
              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate max-w-[130px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold truncate max-w-[130px]">
                    Firm Owner
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </button>

          {/* User Switcher Dropdown */}
          {isUserMenuOpen && (
            <div
              className={`absolute bottom-14 ${
                isCollapsed ? 'left-14 w-60' : 'left-0 w-64'
              } bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100`}
            >
              <div className="px-2 py-1 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Bookkeeper
                </span>
              </div>
              <div className="space-y-1">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user);
                      setIsUserMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      user.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate min-w-0">
                      <div className="text-slate-900 font-bold truncate">{user.fullName}</div>
                      <div className="text-[10px] text-slate-500 capitalize truncate">
                        {user.role.replace('_', ' ')}
                      </div>
                    </div>
                    {user.id === currentUser.id && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
