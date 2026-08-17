import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowRightLeft,
  Search,
  Plus,
  ExternalLink,
  Shield,
  Calendar,
  Sparkles,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { Firm, ClientBusiness, CanadianProvince, BookkeepingStatus } from '../types';

interface FirmOverviewProps {
  firm: Firm;
  clients: ClientBusiness[];
  onSelectClient: (client: ClientBusiness, targetTab?: 'general-ledger' | 'bank-reconciliation' | 'receipts-ocr' | 'tax-filing') => void;
  onOpenNewClient: () => void;
  bankTxCounts?: Record<string, number>;
  receiptCounts?: Record<string, number>;
}

export const FirmOverview: React.FC<FirmOverviewProps> = ({
  firm,
  clients,
  onSelectClient,
  onOpenNewClient,
  bankTxCounts = {},
  receiptCounts = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.businessNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.operatingName && client.operatingName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvince = provinceFilter === 'ALL' || client.provinceCode === provinceFilter;
    const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;

    return matchesSearch && matchesProvince && matchesStatus;
  });

  const totalUnreconciled = Object.values(bankTxCounts).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  const totalPendingReceipts = Object.values(receiptCounts).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
  const booksClosedCount = clients.filter((c) => c.status === 'Books Closed' || c.status === 'Up to Date').length;

  const getStatusBadge = (status: BookkeepingStatus) => {
    switch (status) {
      case 'Books Closed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Books Closed</span>
          </span>
        );
      case 'Up to Date':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Up to Date</span>
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>Needs Review</span>
          </span>
        );
      case 'Awaiting Receipts':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
            <Receipt className="w-3 h-3" />
            <span>Awaiting Receipts</span>
          </span>
        );
      case 'Reconciliation Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
            <ArrowRightLeft className="w-3 h-3" />
            <span>Reconciliation Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Firm Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-700/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {firm.name}
              </h1>
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {firm.subscriptionTier.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">
              Centralized firm-first workspace managing 15-client business files under strict PostgreSQL Row-Level Security, immutable double-entry journalizing, and integrated Canadian CRA / Revenu Québec tax filing.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="firm-add-client-hero-btn"
              onClick={onOpenNewClient}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Provision Client File ({clients.length}/{firm.activeClientLimit})</span>
            </button>
          </div>
        </div>

        {/* Firm High-Level Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Managed Files</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {clients.length} <span className="text-xs text-slate-400 font-normal">/ {firm.activeClientLimit} limit</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium">
              {firm.activeClientLimit - clients.length} slots available
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Closed / Up to Date</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round((booksClosedCount / clients.length) * 100)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {booksClosedCount} of {clients.length} businesses
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Unreconciled Feeds</span>
              <ArrowRightLeft className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {totalUnreconciled}
            </div>
            <div className="text-[11px] text-orange-400 mt-1 font-medium">
              Action required across 4 files
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Pending Receipts</span>
              <Receipt className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {totalPendingReceipts}
            </div>
            <div className="text-[11px] text-purple-400 mt-1 font-medium">
              OCR parsed & awaiting review
            </div>
          </div>
        </div>
      </div>

      {/* Client Portfolio List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Client Businesses Portfolio</h2>
            <p className="text-xs text-slate-500">
              Select any client file to drill down into the immutable General Ledger, Bank Feeds, and Tax Returns.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business, BN9..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Provinces</option>
              <option value="QC">Québec (QC - GST+QST)</option>
              <option value="ON">Ontario (ON - HST)</option>
              <option value="BC">British Columbia (BC)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Awaiting Receipts">Awaiting Receipts</option>
              <option value="Reconciliation Pending">Reconciliation Pending</option>
              <option value="Up to Date">Up to Date</option>
              <option value="Books Closed">Books Closed</option>
            </select>
          </div>
        </div>

        {/* Client Cards Table */}
        <div className="divide-y divide-slate-100">
          {filteredClients.map((client) => {
            const unreconciled = bankTxCounts[client.id] || 0;
            const receipts = receiptCounts[client.id] || 0;

            return (
              <div
                key={client.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 text-base hover:text-emerald-600 cursor-pointer" onClick={() => onSelectClient(client)}>
                      {client.legalName}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {client.provinceCode}
                    </span>
                    {getStatusBadge(client.status)}
                  </div>

                  {client.operatingName && (
                    <div className="text-xs text-slate-500 italic">
                      dba: {client.operatingName}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-4 gap-y-1 pt-1">
                    <span className="flex items-center space-x-1">
                      <span className="font-medium text-slate-700">BN:</span>
                      <span>{client.businessNumber}</span>
                    </span>
                    {client.gstRegistered && (
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        GST/HST: {client.gstNumber || 'Active'}
                      </span>
                    )}
                    {client.qstRegistered && (
                      <span className="text-blue-700 font-medium bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                        QST (QC): {client.qstNumber || 'Active'}
                      </span>
                    )}
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Year-End: Month {client.fiscalYearEndMonth}</span>
                    </span>
                  </div>

                  {client.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-normal">
                      <span className="font-semibold text-slate-700">Bookkeeper Note:</span> {client.notes}
                    </p>
                  )}
                </div>

                {/* Right Quick Action Badges & Drill Down */}
                <div className="flex flex-wrap items-center gap-3 lg:self-center">
                  {/* Bank feed quick trigger */}
                  <button
                    onClick={() => onSelectClient(client, 'bank-reconciliation')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      unreconciled > 0
                        ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{unreconciled} Unreconciled</span>
                  </button>

                  {/* Receipts quick trigger */}
                  <button
                    onClick={() => onSelectClient(client, 'receipts-ocr')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      receipts > 0
                        ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{receipts} Receipts</span>
                  </button>

                  {/* Primary Open File Button */}
                  <button
                    id={`open-client-${client.id}-btn`}
                    onClick={() => onSelectClient(client, 'general-ledger')}
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm"
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
              <div className="font-semibold text-slate-700 text-sm">No client businesses match your filter</div>
              <p className="text-xs text-slate-500 mt-1">Try changing the province or search keyword.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
