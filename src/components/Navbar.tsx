import React, { useState } from 'react';
import {
  Building2,
  BookOpen,
  ArrowRightLeft,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  BarChart3,
  UploadCloud,
  Code2,
  Server,
  ChevronDown,
  Plus,
  ShieldCheck,
  Briefcase,
  Layers,
  Menu,
  X,
  Search,
  Check,
} from 'lucide-react';
import { Firm, ClientBusiness, ActiveTab, User } from '../types';

interface NavbarProps {
  firm: Firm;
  clients: ClientBusiness[];
  activeClient: ClientBusiness;
  onSelectClient: (client: ClientBusiness) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenNewEntry: () => void;
  onOpenNewClient: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  firm,
  clients,
  activeClient,
  onSelectClient,
  activeTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  allUsers,
  onOpenNewEntry,
  onOpenNewClient,
}) => {
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provinceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems: { id: ActiveTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'firm-overview', label: 'Firm Portfolio', shortLabel: 'Portfolio', icon: Building2 },
    { id: 'general-ledger', label: 'General Ledger', shortLabel: 'Ledger', icon: BookOpen },
    { id: 'bank-reconciliation', label: 'Bank Feeds', shortLabel: 'Banking', icon: ArrowRightLeft },
    { id: 'chart-of-accounts', label: 'Chart of Accounts', shortLabel: 'Accounts', icon: FileSpreadsheet },
    { id: 'receipts-ocr', label: 'Receipts & OCR', shortLabel: 'Receipts', icon: Receipt },
    { id: 'tax-filing', label: 'CRA & RQ Tax', shortLabel: 'Tax Filing', icon: FileCheck2 },
    { id: 'financial-reports', label: 'Financial Reports', shortLabel: 'Reports', icon: BarChart3 },
    { id: 'csv-import', label: 'CSV Import', shortLabel: 'Import', icon: UploadCloud },
    { id: 'architecture-docs', label: 'Backend & Database', shortLabel: 'Backend / DB', icon: Server },
  ];

  const handleTabSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      {/* Top Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left: Brand & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div
              onClick={() => handleTabSelect('firm-overview')}
              className="flex items-center space-x-2 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white">Studio Books</span>
                  <span className="hidden sm:inline-block text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Firm
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[120px] sm:max-w-[180px]">
                  {firm.name}
                </p>
              </div>
            </div>

            {/* Active Client Selector Dropdown */}
            <div className="relative">
              <button
                id="client-switcher-btn"
                onClick={() => {
                  setIsClientDropdownOpen(!isClientDropdownOpen);
                  setIsUserDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors text-slate-200 max-w-[150px] xs:max-w-[190px] sm:max-w-[260px] min-h-[38px]"
              >
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white truncate text-xs sm:text-sm">
                  {activeClient.legalName}
                </span>
                <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-slate-700 text-slate-300 shrink-0">
                  {activeClient.provinceCode}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isClientDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Client Files ({clients.length}/{firm.activeClientLimit})
                      </span>
                      <button
                        onClick={() => {
                          setIsClientDropdownOpen(false);
                          onOpenNewClient();
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 p-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add File</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search client name, province..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filteredClients.map((client) => {
                      const isSelected = client.id === activeClient.id;
                      return (
                        <div
                          key={client.id}
                          onClick={() => {
                            onSelectClient(client);
                            setIsClientDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="truncate mr-2 min-w-0">
                            <div className="font-medium text-xs text-white truncate flex items-center space-x-1.5">
                              <span>{client.legalName}</span>
                              {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                              <span>BN: {client.businessNumber.slice(0, 9)}</span>
                              <span>•</span>
                              <span>{client.status}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                            {client.provinceCode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Action & User Persona Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="new-journal-entry-quick-btn"
              onClick={onOpenNewEntry}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm shadow-emerald-500/20 min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Post Entry</span>
              <span className="sm:hidden">Entry</span>
            </button>

            {/* User Profile / Role Switcher */}
            <div className="relative">
              <button
                id="user-role-switcher-btn"
                onClick={() => {
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                  setIsClientDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-slate-300 transition-colors min-h-[38px]"
              >
                <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[11px] font-bold text-emerald-400 shrink-0">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                    {currentUser.fullName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-400 capitalize truncate max-w-[110px]">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Bookkeeper
                    </span>
                  </div>
                  <div className="space-y-1">
                    {allUsers.map((user) => {
                      const isCurrentUser = user.id === currentUser.id;
                      return (
                        <div
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setIsUserDropdownOpen(false);
                          }}
                          className={`p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                            isCurrentUser
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="font-semibold text-white flex items-center justify-between">
                            <span>{user.fullName}</span>
                            {isCurrentUser && <Check className="w-3 h-3 text-emerald-400" />}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize flex items-center space-x-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{user.role.replace('_', ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Tab Navigation Bar */}
        <div className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-800/70">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleTabSelect(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Drawer / Accordion */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-3 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navigation
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs px-2 text-slate-400">
            <span>Signed in as: <strong className="text-white">{currentUser.fullName}</strong></span>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenNewClient();
              }}
              className="text-emerald-400 font-semibold hover:underline"
            >
              + Add Client
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
