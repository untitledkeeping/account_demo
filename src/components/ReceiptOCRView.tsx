import React from 'react';
import {
  Receipt,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Eye,
  Check,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Search,
  Filter,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import { ClientBusiness, ReceiptDocument, ChartOfAccount, User } from '../types';
import { formatCurrency, extractTaxesFromGrossTotal } from '../utils/taxCalculator';
import { useReceiptOCR } from '../hooks/useReceiptOCR';

interface ReceiptOCRViewProps {
  client: ClientBusiness;
  receipts: ReceiptDocument[];
  accounts: ChartOfAccount[];
  currentUser: User;
  onPostReceiptToLedger: (receipt: ReceiptDocument, targetAccountId: string) => void;
  onAddSimulatedReceipt: (vendor: string, total: number) => void;
}

export const ReceiptOCRView: React.FC<ReceiptOCRViewProps> = ({
  client,
  receipts,
  accounts,
  currentUser,
  onPostReceiptToLedger,
  onAddSimulatedReceipt,
}) => {
  const {
    selectedReceipt,
    selectedReceiptId,
    setSelectedReceiptId,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    currentTargetAccountId,
    handleSelectTargetAccount,
    filteredReceipts,
    currentValidation,
    handlePostReceipt,
    isUploadOpen,
    setIsUploadOpen,
    customVendor,
    setCustomVendor,
    customTotal,
    setCustomTotal,
    handleUploadSubmit,
    metrics,
    accountMap,
    successToast,
  } = useReceiptOCR({
    client,
    receipts,
    accounts,
    currentUser,
    onPostReceiptToLedger,
    onAddSimulatedReceipt,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Context & Reviewer Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              Receipt & Invoice OCR Ingestion
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Reviewing Auditor: <strong className="text-slate-900">{currentUser.fullName}</strong>
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-200/60 text-emerald-900 border border-emerald-300/50">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Pending Ingestion Queue: <strong className="text-amber-700">{metrics.pendingCount} documents</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
        >
          <UploadCloud className="w-4 h-4 stroke-[3]" />
          <span>Simulate Receipt Upload</span>
        </button>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Receipt Document Queue List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Incoming Documents ({receipts.length})</span>
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Mindee OCR Active</span>
              </span>
            </div>

            {/* Search and Status Filters */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter vendor, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1 rounded font-medium ${statusFilter === 'ALL' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                All ({receipts.length})
              </button>
              <button
                onClick={() => setStatusFilter('NEEDS_REVIEW')}
                className={`flex-1 py-1 rounded font-medium ${statusFilter === 'NEEDS_REVIEW' ? 'bg-white font-bold text-amber-700 shadow-xs' : 'text-slate-600'}`}
              >
                Pending ({metrics.pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('POSTED')}
                className={`flex-1 py-1 rounded font-medium ${statusFilter === 'POSTED' ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-600'}`}
              >
                Posted ({metrics.postedCount})
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredReceipts.map((r) => {
              const isSelected = selectedReceipt?.id === r.id;
              const isPosted = r.status === 'posted';

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReceiptId(r.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/50'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs truncate max-w-[170px]">
                      {r.extractedVendor || r.fileName}
                    </span>
                    <span className="font-mono font-bold text-xs">
                      {formatCurrency(r.extractedTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                      {r.extractedDate}
                    </span>
                    {isPosted ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Posted to GL</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Needs Review
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Split Screen Auditor (Document Preview + OCR Extracted Fields) */}
        {selectedReceipt ? (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Mindee Ingestion Pipeline
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedReceipt.extractedVendor || 'Scanned Document'}
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  File: {selectedReceipt.fileName} • Uploaded by {selectedReceipt.uploadedBy}
                </div>
              </div>

              {selectedReceipt.status === 'posted' ? (
                <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Posted to General Ledger</span>
                </div>
              ) : (
                <button
                  onClick={handlePostReceipt}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Post to Ledger as {currentUser.fullName}</span>
                </button>
              )}
            </div>

            {/* Validation & Mathematical Verification Box */}
            {currentValidation.isMathematicallyValid ? (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Mathematical Tax Integrity Confirmed:</strong> Subtotal (${selectedReceipt.extractedSubtotal.toFixed(2)}) + GST (${selectedReceipt.extractedGst.toFixed(2)}) + QST (${selectedReceipt.extractedQst.toFixed(2)}) === Total (${selectedReceipt.extractedTotal.toFixed(2)})
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Variance: $0.00
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-xs text-amber-900">
                <div className="flex items-center space-x-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tax Discrepancy Flagged</span>
                </div>
                <div className="pl-6">
                  {currentValidation.warnings.map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Split Visual Document Mock + Structured OCR Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual Simulated Thermal Paper Receipt */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 font-mono text-xs text-slate-700 space-y-3 shadow-inner">
                <div className="text-center border-b border-dashed border-slate-300 pb-3">
                  <div className="font-bold text-slate-900 text-sm tracking-wide">
                    {selectedReceipt.extractedVendor}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">MONTREAL, QC • H2Y 1C6</div>
                  <div className="text-[10px] text-slate-400 mt-1">CRA BN: 849204812RT0001 • RQ: 1092847291TQ0001</div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>DATE: {selectedReceipt.extractedDate}</span>
                  <span>TRANS: #09482</span>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>1x Commercial Supplies</span>
                    <span className="font-bold">{formatCurrency(selectedReceipt.extractedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax Code: QC-GST/QST</span>
                    <span>14.975%</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>{formatCurrency(selectedReceipt.extractedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>GST (5.000%):</span>
                    <span>{formatCurrency(selectedReceipt.extractedGst)}</span>
                  </div>
                  <div className="flex justify-between text-blue-800 font-semibold">
                    <span>QST (9.975%):</span>
                    <span>{formatCurrency(selectedReceipt.extractedQst)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1.5">
                    <span>TOTAL CAD:</span>
                    <span>{formatCurrency(selectedReceipt.extractedTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Structured Extracted Metadata & Account Mapping */}
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[11px]">Vendor Name</label>
                  <input
                    type="text"
                    disabled
                    value={selectedReceipt.extractedVendor}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[11px]">Date</label>
                    <input
                      type="text"
                      disabled
                      value={selectedReceipt.extractedDate}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[11px]">Total Amount</label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(selectedReceipt.extractedTotal)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[11px]">
                    Destination Chart of Account
                  </label>
                  <select
                    value={currentTargetAccountId}
                    onChange={(e) => handleSelectTargetAccount(selectedReceipt.id, e.target.value)}
                    disabled={selectedReceipt.status === 'posted'}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    {accounts
                      .filter((a) => a.type === 'expense' || a.type === 'asset')
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountCode} - {acc.name} ({acc.type.toUpperCase()})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">Double-Entry Posting Projection:</div>
                  <div className="font-mono text-[10px] text-slate-700">
                    • DR: {accountMap.get(currentTargetAccountId)?.accountCode || 'Expense'} - {formatCurrency(selectedReceipt.extractedSubtotal)}<br />
                    • DR: 2150 (GST Receivable / ITC) - {formatCurrency(selectedReceipt.extractedGst)}<br />
                    • DR: 2160 (QST Receivable / ITR) - {formatCurrency(selectedReceipt.extractedQst)}<br />
                    • CR: 1010 (Operating Bank / Cash) - {formatCurrency(selectedReceipt.extractedTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Receipt Selected</h3>
            <p className="text-xs text-slate-500 mt-1">Select an incoming document on the left queue to inspect OCR values.</p>
          </div>
        )}
      </div>

      {/* Simulated Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Upload Simulated Receipt Document</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Vendor / Merchant Name</label>
                <input
                  type="text"
                  required
                  value={customVendor}
                  onChange={(e) => setCustomVendor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Gross Total Amount (CAD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={customTotal}
                  onChange={(e) => setCustomTotal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900">
                Mindee OCR will automatically deconstruct Canadian taxes (5% GST + 9.975% QST) based on {client.legalName}'s tax profile.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md shadow-emerald-600/20"
                >
                  Process & Extract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
