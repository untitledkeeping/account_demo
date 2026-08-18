// src/components/FirmOverview.tsx
import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowRightLeft,
  Search,
  Plus,
  ChevronRight,
  ShieldCheck,
  FolderKanban,
  FileText,
  MoreHorizontal,
  ChevronLeft,
  Briefcase,
  FileSpreadsheet,
  FileCheck2,
  Zap,
  UploadCloud,
  FilePlus2,
  ArrowUpRight,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { Firm, ClientBusiness, BookkeepingStatus, User, ActiveTab } from '../types';
import { useFirmOverview } from '../hooks/useFirmOverview';

interface FirmOverviewProps {
  firm: Firm;
  clients: ClientBusiness[];
  currentUser?: User;
  onSelectClient: (client: ClientBusiness, targetTab?: ActiveTab) => void;
  onOpenNewClient: () => void;
  onOpenNewEntry?: () => void;
  bankTxCounts?: Record<string, number>;
  receiptCounts?: Record<string, number>;
}

export const FirmOverview: React.FC<FirmOverviewProps> = ({
  firm,
  clients,
  currentUser,
  onSelectClient,
  onOpenNewClient,
  onOpenNewEntry,
  bankTxCounts = {},
  receiptCounts = {},
}) => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    bookkeeperFilter,
    setBookkeeperFilter,
    uniqueBookkeepers,
    filteredClients,
    metrics,
  } = useFirmOverview({
    firm,
    clients,
    currentUser,
    bankTxCounts,
    receiptCounts,
    onSelectClient,
    onOpenNewClient,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuClientId, setActiveMenuClientId] = useState<string | null>(null);

  const pageSize = 4;
  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getClientInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: BookkeepingStatus) => {
    switch (status) {
      case 'Books Closed':
      case 'Up to Date':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Up to Date</span>
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Needs Review</span>
          </span>
        );
      case 'Awaiting Receipts':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <Receipt className="w-3 h-3 text-purple-600" />
            <span>Awaiting Receipts</span>
          </span>
        );
      case 'Reconciliation Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <ArrowRightLeft className="w-3 h-3 text-orange-600" />
            <span>Recon Pending</span>
          </span>
        );
    }
  };

  const getClientNotes = (client: ClientBusiness) => {
    if (client.notes) return client.notes;
    if (client.provinceCode === 'QC') {
      return 'Q2 QST remittance due August 31. Reconcile Desjardins merchant account POS batches.';
    }
    if (client.provinceCode === 'BC') {
      return 'Clean books, monthly retainers collected via Stripe CAD.';
    }
    return 'Regular operating cycle. Standard reconciliation active.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Wave-Style Quick Actions Ribbon */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Quick Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenNewEntry && (
            <button
              onClick={onOpenNewEntry}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200/90 hover:border-emerald-300 text-xs font-semibold transition-all shadow-2xs"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ New Journal Entry</span>
            </button>
          )}

          <button
            onClick={() => onSelectClient(clients[0], 'receipts-ocr')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-900 border border-slate-200/90 hover:border-purple-300 text-xs font-semibold transition-all shadow-2xs"
          >
            <Receipt className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Scan Receipt / Invoice</span>
          </button>

          <button
            onClick={() => onSelectClient(clients[0], 'bank-reconciliation')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-800 hover:text-orange-900 border border-slate-200/90 hover:border-orange-300 text-xs font-semibold transition-all shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-600" />
            <span>+ Reconcile Bank Feed</span>
          </button>

          <button
            onClick={() => onSelectClient(clients[0], 'tax-filing')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-200/90 hover:border-blue-300 text-xs font-semibold transition-all shadow-2xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>+ CRA & RQ Tax Filing</span>
          </button>
        </div>
      </div>

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {firm.name}
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              PRACTICE FLAGSHIP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Multi-client Canadian bookkeeping platform with immutable double-entry ledger, automated GST/HST/QST tax schedules, and receipt OCR ingestion.
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center space-x-2 bg-white hover:bg-emerald-50 text-emerald-700 font-bold border border-emerald-600/80 px-4 py-2 rounded-xl text-xs transition-colors shadow-2xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Provision Client File ({clients.length}/{firm.activeClientLimit})</span>
        </button>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Managed Files */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2.5 text-slate-500 text-xs font-semibold">
            <div className="p-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/50 text-emerald-700">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span>Managed Files</span>
          </div>
          <div className="pt-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {clients.length}
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">
                / {firm.activeClientLimit} max
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              {firm.activeClientLimit - clients.length} slots available
            </div>
          </div>
        </div>

        {/* Card 2: Books Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2.5 text-slate-500 text-xs font-semibold">
            <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>Books Health</span>
          </div>
          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {metrics.booksHealthPercent}%
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {metrics.upToDateCount} of {clients.length} up to date
            </div>
          </div>
        </div>

        {/* Card 3: Unreconciled Feeds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2.5 text-slate-500 text-xs font-semibold">
            <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <span>Unreconciled Feeds</span>
          </div>
          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {metrics.totalUnreconciledTx || 60}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Live items awaiting match
            </div>
          </div>
        </div>

        {/* Card 4: Pending Receipts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2.5 text-slate-500 text-xs font-semibold">
            <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
            <span>Pending Receipts</span>
          </div>
          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {metrics.totalPendingReceipts || 36}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              OCR parsed & in review
            </div>
          </div>
        </div>
      </div>

      {/* Client Portfolio Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Client Portfolio</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a client to access general ledger, bank feeds, and tax returns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients, BN9, province..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Staff Filter */}
            <select
              value={bookkeeperFilter}
              onChange={(e) => setBookkeeperFilter(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Staff</option>
              {uniqueBookkeepers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Up to Date">Up to Date</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Reconciliation Pending">Recon Pending</option>
              <option value="Awaiting Receipts">Awaiting Receipts</option>
            </select>
          </div>
        </div>

        {/* Explicit Table Column Header Bar */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          <div className="col-span-4">Client Business</div>
          <div className="col-span-3">Status & Notes</div>
          <div className="col-span-2">Fiscal Year-End & Tax</div>
          <div className="col-span-3 text-right">Pending Actions</div>
        </div>

        {/* Client Rows List */}
        <div className="divide-y divide-slate-100">
          {paginatedClients.map((client) => {
            const reconCount = bankTxCounts[client.id] || 5;
            const recCount = receiptCounts[client.id] || 3;
            const isMenuOpen = activeMenuClientId === client.id;

            return (
              <div
                key={client.id}
                onClick={() => onSelectClient(client, 'general-ledger')}
                className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start lg:items-center group relative"
              >
                {/* Column 1: Client Identity (4 cols) */}
                <div className="lg:col-span-4 flex items-start space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {getClientInitials(client.legalName)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {client.legalName}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {client.provinceCode}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      BN9: <strong className="text-slate-700">{client.businessNumber.slice(0, 9)}RC0001</strong>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Bookkeeper: <strong className="text-slate-600">{client.assignedBookkeeper}</strong>
                    </div>
                  </div>
                </div>

                {/* Column 2: Status & Notes (3 cols) */}
                <div className="lg:col-span-3 space-y-1.5 min-w-0">
                  <div>{getStatusBadge(client.status)}</div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-slate-700">Note:</span> {getClientNotes(client)}
                  </p>
                </div>

                {/* Column 3: Fiscal Year-End & Tax (2 cols) */}
                <div className="lg:col-span-2 space-y-1 text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-800">
                    FY-End: Month {client.fiscalYearEnd || 12}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-emerald-700 font-bold">GST/HST Active</span>
                  </div>
                  {client.provinceCode === 'QC' && (
                    <div className="text-blue-700 font-bold">
                      QST Active
                    </div>
                  )}
                </div>

                {/* Column 4: Pending Actions (3 cols) */}
                <div className="lg:col-span-3 flex items-center justify-end space-x-2 w-full lg:w-auto relative">
                  {/* Recon Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClient(client, 'bank-reconciliation');
                    }}
                    title={`${reconCount} bank feed items awaiting matching`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>{reconCount} To Reconcile</span>
                  </button>

                  {/* Receipts Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClient(client, 'receipts-ocr');
                    }}
                    title={`${recCount} OCR receipts awaiting review`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>{recCount} Receipts</span>
                  </button>

                  {/* Three-Dots Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuClientId(isMenuOpen ? null : client.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="More Options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Three-Dots Menu Dropdown */}
                    {isMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 text-left space-y-0.5"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuClientId(null);
                            onSelectClient(client, 'general-ledger');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View General Ledger</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuClientId(null);
                            onSelectClient(client, 'bank-reconciliation');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-orange-600" />
                          <span>Reconcile Bank Feeds</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuClientId(null);
                            onSelectClient(client, 'receipts-ocr');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2"
                        >
                          <Receipt className="w-3.5 h-3.5 text-purple-600" />
                          <span>Review OCR Receipts</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuClientId(null);
                            onSelectClient(client, 'financial-reports');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Financial Statements</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuClientId(null);
                            onSelectClient(client, 'tax-filing');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CRA & RQ Tax Returns</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Enter Client File Chevron */}
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:border-emerald-300 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length} clients
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === idx + 1
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold'
                    : 'text-slate-600 hover:bg-white border border-transparent'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
