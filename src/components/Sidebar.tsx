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
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab, Firm, User, ClientBusiness } from '../types';

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
  bankTxCount = 0,
  receiptCount = 0,
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
          badge: bankTxCount > 0 ? bankTxCount : undefined,
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        },
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: FileSpreadsheet },
        {
          id: 'receipts-ocr',
          label: 'Receipts & AI OCR',
          icon: Receipt,
          badge: receiptCount > 0 ? receiptCount : undefined,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
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
      className="bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen text-slate-300 select-none z-30 shrink-0 sticky top-0"
    >
      {/* Top Firm Branding */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
          <div
            onClick={() => onSelectTab('firm-overview')}
            className="flex items-center space-x-3 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-emerald-500/20 shrink-0 group-hover:bg-emerald-400 transition-colors">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm text-white tracking-tight truncate">
                    Studio Books
                  </span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    CPA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {firm.name}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Categories */}
        <div className="py-3 px-2 space-y-4 overflow-y-auto max-h-[calc(100vh-175px)] scrollbar-none">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
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
                    className={`relative w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isCollapsed ? 'justify-center' : 'justify-between'
                    } ${
                      isActive
                        ? 'text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarItem"
                        className="absolute inset-0 bg-emerald-500 rounded-xl shadow-sm shadow-emerald-500/20"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={`relative z-10 text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          isActive
                            ? 'bg-slate-950 text-emerald-400 border-slate-800'
                            : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
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
      <div className="p-2 border-t border-slate-800/80 space-y-1 bg-slate-900/90">
        {/* Practice Settings Trigger */}
        <button
          onClick={onOpenSettings}
          title={isCollapsed ? 'Practice Settings' : undefined}
          className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <Settings className="w-4 h-4 text-slate-400" />
            {!isCollapsed && <span>Practice Settings</span>}
          </div>
          {!isCollapsed && <span className="text-[10px] text-slate-400 font-mono">QC / CRA</span>}
        </button>

        {/* User Persona Profile Card */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title={isCollapsed ? currentUser.fullName : undefined}
            className={`w-full flex items-center p-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition-colors ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <div className="font-bold text-white text-xs truncate max-w-[130px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-emerald-400 capitalize truncate max-w-[130px]">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* User Switcher Dropdown */}
          {isUserMenuOpen && (
            <div
              className={`absolute bottom-12 ${
                isCollapsed ? 'left-14 w-60' : 'left-0 w-64'
              } bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100`}
            >
              <div className="px-2 py-1 border-b border-slate-800 mb-1">
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
                        ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate min-w-0">
                      <div className="text-white font-medium truncate">{user.fullName}</div>
                      <div className="text-[10px] text-slate-400 capitalize truncate">
                        {user.role.replace('_', ' ')}
                      </div>
                    </div>
                    {user.id === currentUser.id && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
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
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
