import React from 'react';
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
  ChevronDown,
  Plus,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Firm, ClientBusiness, ActiveTab, User, UserRole } from '../types';

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
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provinceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'firm-overview', label: 'Firm Portfolio', icon: Building2 },
    { id: 'general-ledger', label: 'General Ledger', icon: BookOpen },
    { id: 'bank-reconciliation', label: 'Bank Feeds', icon: ArrowRightLeft },
    { id: 'chart-of-accounts', label: 'Accounts (COA)', icon: FileSpreadsheet },
    { id: 'receipts-ocr', label: 'Receipts & OCR', icon: Receipt },
    { id: 'tax-filing', label: 'CRA & RQ Tax', icon: FileCheck2 },
    { id: 'financial-reports', label: 'Reports', icon: BarChart3 },
    { id: 'csv-import', label: 'CSV Import', icon: UploadCloud },
    { id: 'architecture-docs', label: 'Engineering Hub', icon: Code2 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Firm Context */}
          <div className="flex items-center space-x-4">
            <div
              onClick={() => onSelectTab('firm-overview')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
                <Layers className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-white">Studio Books</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Firm-First
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
                  {firm.name}
                </p>
              </div>
            </div>

            {/* Client Business Switcher Dropdown */}
            <div className="relative">
              <button
                id="client-switcher-btn"
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg text-sm transition-colors text-slate-200"
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {activeClient.legalName}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                  {activeClient.provinceCode}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isClientDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 overflow-hidden">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Client Businesses ({clients.length}/{firm.activeClientLimit})
                      </span>
                      <button
                        onClick={() => {
                          setIsClientDropdownOpen(false);
                          onOpenNewClient();
                        }}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add File</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search client or province..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1">
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
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="font-medium text-xs text-white truncate">{client.legalName}</div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                              <span>BN: {client.businessNumber.slice(0, 9)}</span>
                              <span>•</span>
                              <span>{client.status}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
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

          {/* Right Header Controls: Actions & User Switcher */}
          <div className="flex items-center space-x-3">
            <button
              id="new-journal-entry-quick-btn"
              onClick={onOpenNewEntry}
              className="hidden sm:flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm shadow-emerald-500/30"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Post Journal Entry</span>
            </button>

            {/* User / Team Role Switcher */}
            <div className="relative">
              <button
                id="user-role-switcher-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[11px] font-bold text-emerald-400">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                    {currentUser.fullName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-400 capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Persona / Role
                    </span>
                  </div>
                  <div className="space-y-1">
                    {allUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          user.id === currentUser.id
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-white">{user.fullName}</div>
                        <div className="text-[10px] text-slate-400 capitalize flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Role: {user.role.replace('_', ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
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
    </header>
  );
};
