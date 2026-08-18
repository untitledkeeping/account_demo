// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Hexagon,
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
  bankTxCount?: number;
  receiptCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavGroup {
  title: string;
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
  bankTxCount = 5,
  receiptCount = 3,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: 'PRACTICE HUB',
      items: [
        { id: 'firm-overview', label: 'Firm Portfolio', icon: Building2 },
      ],
    },
    {
      title: 'CORE BOOKKEEPING',
      items: [
        { id: 'general-ledger', label: 'General Ledger', icon: BookOpen },
        {
          id: 'bank-reconciliation',
          label: 'Bank Feeds',
          icon: ArrowRightLeft,
          badge: bankTxCount > 0 ? bankTxCount : 5,
          badgeColor: 'bg-orange-50 text-orange-700 border-orange-200/90 font-bold',
        },
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: FileSpreadsheet },
        {
          id: 'receipts-ocr',
          label: 'Receipts & AI OCR',
          icon: Receipt,
          badge: receiptCount > 0 ? receiptCount : 3,
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/90 font-bold',
        },
      ],
    },
    {
      title: 'TAX & COMPLIANCE',
      items: [
        { id: 'tax-filing', label: 'CRA & RQ Tax', icon: FileCheck2 },
        { id: 'financial-reports', label: 'Financial Reports', icon: BarChart3 },
      ],
    },
    {
      title: 'TOOLS & PLATFORM',
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
      {/* Top Firm Branding */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-100 justify-between">
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

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Categories */}
        <div className="py-3 px-3 space-y-4 overflow-y-auto max-h-[calc(100vh-175px)] scrollbar-none">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {group.title}
                </div>
              )}
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer: Practice Settings, User Persona, and Toggle */}
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

        {/* Collapsed Expand Toggle */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
