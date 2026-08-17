import React from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowRightLeft,
  Search,
  Plus,
  ExternalLink,
  Calendar,
  User as UserIcon,
  Briefcase,
  Users,
} from 'lucide-react';
import { Firm, ClientBusiness, BookkeepingStatus, User, ActiveTab } from '../types';
import { useFirmOverview } from '../hooks/useFirmOverview';

interface FirmOverviewProps {
  firm: Firm;
  clients: ClientBusiness[];
  currentUser?: User;
  onSelectClient: (client: ClientBusiness, targetTab?: ActiveTab) => void;
  onOpenNewClient: () => void;
  bankTxCounts?: Record<string, number>;
  receiptCounts?: Record<string, number>;
}

export const FirmOverview: React.FC<FirmOverviewProps> = ({
  firm,
  clients,
  currentUser,
  onSelectClient,
  onOpenNewClient,
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

  const getStatusBadge = (status: BookkeepingStatus) => {
    switch (status) {
      case 'Books Closed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Books Closed</span>
          </span>
        );
      case 'Up to Date':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Up to Date</span>
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            <span>Needs Review</span>
          </span>
        );
      case 'Awaiting Receipts':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Receipt className="w-3 h-3" />
            <span>Awaiting Receipts</span>
          </span>
        );
      case 'Reconciliation Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <ArrowRightLeft className="w-3 h-3" />
            <span>Recon Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Refined Practice Header Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {firm.name}
              </h1>
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {firm.subscriptionTier.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Multi-client Canadian bookkeeping platform with immutable double-entry ledger, automated GST/HST/QST tax schedules, and receipt OCR ingestion.
            </p>

            {currentUser && (
              <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <UserIcon className="w-3 h-3 text-emerald-600" />
                  <span>{currentUser.fullName} ({currentUser.role.replace('_', ' ')})</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>My Assigned Files: <strong className="text-slate-900">{metrics.myClientsCount}</strong></span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <button
              id="firm-add-client-hero-btn"
              onClick={onOpenNewClient}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm shadow-emerald-600/20 min-h-[44px]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Provision Client File ({clients.length}/{firm.activeClientLimit})</span>
            </button>
          </div>
        </div>

        {/* Practice KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Managed Files</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {clients.length} <span className="text-xs text-slate-400 font-normal">/ {firm.activeClientLimit} max</span>
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
              {firm.activeClientLimit - clients.length} slots available
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Books Health</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {metrics.totalClients > 0 ? Math.round((metrics.upToDateCount / metrics.totalClients) * 100) : 100}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {metrics.upToDateCount} of {clients.length} up to date
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Unreconciled Feeds</span>
              <ArrowRightLeft className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              {metrics.totalUnreconciledBankTx}
            </div>
            <div className="text-[11px] text-orange-700 mt-0.5 font-medium">
              Live items awaiting match
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Pending Receipts</span>
              <Receipt className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              {metrics.totalPendingReceipts}
            </div>
            <div className="text-[11px] text-purple-700 mt-0.5 font-medium">
              OCR parsed & in review
            </div>
          </div>
        </div>
      </div>

      {/* Client Portfolio Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Client Portfolio</h2>
            <p className="text-xs text-slate-500">
              Select a client to access general ledger, bank feeds, and tax returns.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-64 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, BN9, province..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Quick Assigned Bookkeeper Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setBookkeeperFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all min-h-[36px] ${
                  bookkeeperFilter === 'ALL'
                    ? 'bg-white font-bold text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Staff
              </button>
              {currentUser && (
                <button
                  onClick={() => setBookkeeperFilter('MINE')}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition-all min-h-[36px] ${
                    bookkeeperFilter === 'MINE'
                      ? 'bg-white font-bold text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Files ({metrics.myClientsCount})
                </button>
              )}
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 min-h-[36px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Awaiting Receipts">Awaiting Receipts</option>
              <option value="Reconciliation Pending">Recon Pending</option>
              <option value="Up to Date">Up to Date</option>
              <option value="Books Closed">Books Closed</option>
            </select>
          </div>
        </div>

        {/* Client List */}
        <div className="divide-y divide-slate-100">
          {filteredClients.map((client) => {
            const unreconciled = bankTxCounts[client.id] || 0;
            const receipts = receiptCounts[client.id] || 0;
            const isAssignedToMe =
              Boolean(currentUser?.fullName) &&
              client.assignedBookkeeper.toLowerCase() === currentUser?.fullName.toLowerCase();

            return (
              <div
                key={client.id}
                className={`p-4 sm:p-5 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                  isAssignedToMe ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Left info */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-600 cursor-pointer"
                      onClick={() => onSelectClient(client)}
                    >
                      {client.legalName}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {client.provinceCode}
                    </span>
                    {getStatusBadge(client.status)}
                    {isAssignedToMe && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Assigned to You
                      </span>
                    )}
                  </div>

                  {client.operatingName && (
                    <div className="text-xs text-slate-500 italic">
                      dba: {client.operatingName}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-3 gap-y-1 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <span className="font-semibold text-slate-700">BN9:</span>
                      <span>{client.businessNumber}</span>
                    </span>
                    {client.gstRegistered && (
                      <span className="text-emerald-800 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] border border-emerald-200/50">
                        GST/HST Active
                      </span>
                    )}
                    {client.qstRegistered && (
                      <span className="text-blue-800 font-medium bg-blue-50 px-1.5 py-0.5 rounded text-[11px] border border-blue-200/50">
                        QST Active (QC)
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>FY-End: Month {client.fiscalYearEndMonth}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-600">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bookkeeper: <strong>{client.assignedBookkeeper}</strong></span>
                    </span>
                  </div>

                  {client.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong className="text-slate-700">Note:</strong> {client.notes}
                    </p>
                  )}
                </div>

                {/* Right Action Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:self-center">
                  <button
                    onClick={() => onSelectClient(client, 'bank-reconciliation')}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border min-h-[40px] ${
                      unreconciled > 0
                        ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{unreconciled} Recon</span>
                  </button>

                  <button
                    onClick={() => onSelectClient(client, 'receipts-ocr')}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border min-h-[40px] ${
                      receipts > 0
                        ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{receipts} Receipts</span>
                  </button>

                  <button
                    id={`open-client-${client.id}-btn`}
                    onClick={() => onSelectClient(client, 'general-ledger')}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-xs min-h-[40px]"
                  >
                    <span>Open Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-700 text-sm">No client businesses match your criteria</div>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the filter options or search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
