// src/components/Navbar.tsx
import React, { useState } from 'react';
import {
  ChevronRight,
  Briefcase,
  ChevronDown,
  Plus,
  Search,
  Check,
  Building2,
  Menu,
  FileSpreadsheet,
  Receipt,
  BookOpen,
  ArrowRightLeft,
  FileCheck2,
  BarChart3,
  UploadCloud,
  Server,
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
  onToggleSidebar?: () => void;
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
  onToggleSidebar,
}) => {
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provinceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'firm-overview': return 'Firm Portfolio';
      case 'general-ledger': return 'General Ledger';
      case 'bank-reconciliation': return 'Bank Feeds & Reconciliation';
      case 'chart-of-accounts': return 'Chart of Accounts (GAAP)';
      case 'receipts-ocr': return 'Receipts & AI OCR Ingestion';
      case 'tax-filing': return 'CRA & RQ Sales Tax Filing';
      case 'financial-reports': return 'Financial Statements & Reports';
      case 'csv-import': return 'CSV Batch Import';
      case 'architecture-docs': return 'Backend & Database Explorer';
      default: return 'Practice Hub';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 text-slate-900 sticky top-0 z-20 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Left: Breadcrumbs & Client Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden"
                aria-label="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Breadcrumb Navigation Trail */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 min-w-0">
              <span
                onClick={() => onSelectTab('firm-overview')}
                className="cursor-pointer hover:text-slate-900 truncate hidden sm:inline"
              >
                {firm.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />

              {/* Client Selector Dropdown */}
              <div className="relative">
                <button
                  id="client-switcher-btn"
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 transition-colors max-w-[180px] xs:max-w-[220px] sm:max-w-[280px]"
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{activeClient.legalName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 shrink-0">
                    {activeClient.provinceCode}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {isClientDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1.5 border-b border-slate-100 mb-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Client Businesses ({clients.length}/{firm.activeClientLimit})
                        </span>
                        <button
                          onClick={() => {
                            setIsClientDropdownOpen(false);
                            onOpenNewClient();
                          }}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center space-x-1"
                        >
                          <span>+ Add Client</span>
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search client, BN9, province..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-none">
                      {filteredClients.map((client) => {
                        const isSelected = client.id === activeClient.id;
                        return (
                          <div
                            key={client.id}
                            onClick={() => {
                              onSelectClient(client);
                              setIsClientDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="truncate mr-2 min-w-0">
                              <div className="font-semibold text-xs text-slate-900 truncate flex items-center space-x-1.5">
                                <span>{client.legalName}</span>
                                {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                                <span>BN: {client.businessNumber.slice(0, 9)}</span>
                                <span>•</span>
                                <span>{client.status}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                              {client.provinceCode}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:inline" />
              <span className="text-slate-900 font-bold truncate hidden md:inline">
                {getTabTitle(activeTab)}
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              id="new-journal-entry-quick-btn"
              onClick={onOpenNewEntry}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Post Entry</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
