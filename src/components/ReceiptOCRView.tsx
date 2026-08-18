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
  X,
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
  onScanReceiptWithAI?: (file: File) => Promise<ReceiptDocument>;
}

export const ReceiptOCRView: React.FC<ReceiptOCRViewProps> = ({
  client,
  receipts,
  accounts,
  currentUser,
  onPostReceiptToLedger,
  onAddSimulatedReceipt,
  onScanReceiptWithAI,
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
    isScanning,
    handleRealFileUpload,
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
    onScanReceiptWithAI,
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Context & Reviewer Info */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Receipt & Invoice OCR Ingestion
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200/70 font-medium">
              <UserIcon className="w-3 h-3 text-emerald-600" />
              <span>
                Auditor: <strong className="text-slate-900">{currentUser.fullName}</strong>
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <span>
              Queue: <strong className="text-amber-700">{metrics.pendingCount} pending</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs min-h-[40px]"
        >
          <UploadCloud className="w-4 h-4 stroke-[3]" />
          <span>Simulate Receipt Upload</span>
        </button>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Receipt Document Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Documents ({receipts.length})</span>
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>OCR Active</span>
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter vendor, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1.5 rounded-md font-medium min-h-[32px] ${statusFilter === 'ALL' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                All ({receipts.length})
              </button>
              <button
                onClick={() => setStatusFilter('NEEDS_REVIEW')}
                className={`flex-1 py-1.5 rounded-md font-medium min-h-[32px] ${statusFilter === 'NEEDS_REVIEW' ? 'bg-white font-bold text-amber-700 shadow-xs' : 'text-slate-600'}`}
              >
                Pending ({metrics.pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('POSTED')}
                className={`flex-1 py-1.5 rounded-md font-medium min-h-[32px] ${statusFilter === 'POSTED' ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-600'}`}
              >
                Posted ({metrics.postedCount})
              </button>
            </div>
          </div>

          {/* Document Cards */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-0.5">
            {filteredReceipts.map((r) => {
              const isSelected = selectedReceipt?.id === r.id;
              const isPosted = r.status === 'posted';

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReceiptId(r.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-emerald-500/50'
                      : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate max-w-[170px]">
                      {r.extractedVendor || r.fileName}
                    </span>
                    <span className="font-mono font-bold text-xs">
                      {formatCurrency(r.extractedTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                      {r.extractedDate}
                    </span>
                    {isPosted ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Posted</span>
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

        {/* Right Column: Split Screen Auditor */}
        {selectedReceipt ? (
          <div className="lg:col-span-8 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  OCR Verification
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedReceipt.extractedVendor || 'Scanned Document'}
                </h2>
                <div className="text-[11px] text-slate-400 font-mono">
                  File: {selectedReceipt.fileName} • Uploaded by {selectedReceipt.uploadedBy}
                </div>
              </div>

              {selectedReceipt.status === 'posted' ? (
                <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Posted to General Ledger</span>
                </div>
              ) : (
                <button
                  onClick={handlePostReceipt}
                  className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[40px]"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Post to Ledger</span>
                </button>
              )}
            </div>

            {/* Tax Verification Banner */}
            {currentValidation.isMathematicallyValid ? (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-emerald-900">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Mathematical Tax Integrity Confirmed:</strong> Subtotal (${selectedReceipt.extractedSubtotal.toFixed(2)}) + GST (${selectedReceipt.extractedGst.toFixed(2)}) + QST (${selectedReceipt.extractedQst.toFixed(2)}) = ${selectedReceipt.extractedTotal.toFixed(2)}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                  Variance: $0.00
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1 text-xs text-amber-900">
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

            {/* Split Receipt Ticket + Field Mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Receipt Ticket */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 font-mono text-xs text-slate-700 space-y-2.5">
                <div className="text-center border-b border-dashed border-slate-300 pb-2.5">
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedReceipt.extractedVendor}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">MONTREAL, QC • H2Y 1C6</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">CRA BN: 849204812RT0001 • RQ: 1092847291TQ0001</div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>DATE: {selectedReceipt.extractedDate}</span>
                  <span>TRANS: #09482</span>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 py-2.5 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Commercial Supplies</span>
                    <span className="font-bold">{formatCurrency(selectedReceipt.extractedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax Code: QC-GST/QST</span>
                    <span>14.975%</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-[10px] pt-0.5">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>{formatCurrency(selectedReceipt.extractedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>GST (5%):</span>
                    <span>{formatCurrency(selectedReceipt.extractedGst)}</span>
                  </div>
                  <div className="flex justify-between text-blue-800 font-semibold">
                    <span>QST (9.975%):</span>
                    <span>{formatCurrency(selectedReceipt.extractedQst)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-slate-300 pt-1">
                    <span>TOTAL CAD:</span>
                    <span>{formatCurrency(selectedReceipt.extractedTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Vendor Name</label>
                  <input
                    type="text"
                    disabled
                    value={selectedReceipt.extractedVendor}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Date</label>
                    <input
                      type="text"
                      disabled
                      value={selectedReceipt.extractedDate}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Total Amount</label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(selectedReceipt.extractedTotal)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px]">
                    Destination Account
                  </label>
                  <select
                    value={currentTargetAccountId}
                    onChange={(e) => handleSelectTargetAccount(selectedReceipt.id, e.target.value)}
                    disabled={selectedReceipt.status === 'posted'}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 min-h-[38px]"
                  >
                    {accounts
                      .filter((a) => a.type === 'expense' || a.type === 'asset')
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountCode} - {acc.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800">Double-Entry Posting:</div>
                  <div className="font-mono text-[9px] text-slate-700">
                    DR {accountMap.get(currentTargetAccountId)?.accountCode || 'Expense'}: {formatCurrency(selectedReceipt.extractedSubtotal)} | DR GST: {formatCurrency(selectedReceipt.extractedGst)} | DR QST: {formatCurrency(selectedReceipt.extractedQst)} | CR Cash: {formatCurrency(selectedReceipt.extractedTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-10 text-center text-slate-400 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No Document Selected</h3>
            <p className="text-xs text-slate-500 mt-1">Select an item from the left queue to inspect OCR data.</p>
          </div>
        )}
      </div>

      {/* Upload Modal (Real File AI Scanner + Quick Presets) */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Gemini AI Invoice & Receipt Scanner</h3>
                  <p className="text-[11px] text-slate-500">Multimodal vision with Canadian GST/HST/QST breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isScanning ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
                  <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-900">Gemini 2.5 Flash Analyzing Invoice...</div>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Extracting vendor, subtotal, Canadian sales taxes (GST/QST), and matching Chart of Accounts.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* 1. Real File Dropzone */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Option A: Upload Real Receipt (Image or PDF)
                  </label>
                  <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                    <UploadCloud className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="font-bold text-slate-800 text-xs">Click to browse or drop invoice file</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, WEBP, and PDF up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleRealFileUpload(file);
                      }}
                    />
                  </label>
                </div>

                {/* 2. Quick Demo Presets */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Option B: Quick One-Click Canadian Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onAddSimulatedReceipt('Bell Canada Commercial Fiber', 172.46);
                        setIsUploadOpen(false);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                    >
                      <div className="font-bold text-slate-800 text-[11px]">Bell Canada Fiber</div>
                      <div className="text-[10px] text-slate-500">$172.46 CAD • Telecom (6400)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddSimulatedReceipt('Hydro-Québec (Montréal)', 482.5);
                        setIsUploadOpen(false);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                    >
                      <div className="font-bold text-slate-800 text-[11px]">Hydro-Québec</div>
                      <div className="text-[10px] text-slate-500">$482.50 CAD • Utilities (6200)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddSimulatedReceipt('Costco Wholesale Anjou', 674.82);
                        setIsUploadOpen(false);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                    >
                      <div className="font-bold text-slate-800 text-[11px]">Costco Wholesale</div>
                      <div className="text-[10px] text-slate-500">$674.82 CAD • COGS (5000)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddSimulatedReceipt('Bureau en Gros / Staples', 258.45);
                        setIsUploadOpen(false);
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                    >
                      <div className="font-bold text-slate-800 text-[11px]">Bureau en Gros</div>
                      <div className="text-[10px] text-slate-500">$258.45 CAD • Supplies (6100)</div>
                    </button>
                  </div>
                </div>

                {/* 3. Custom Manual Simulation */}
                <form onSubmit={handleUploadSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-700">Option C: Custom Vendor & Amount</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Vendor Name"
                        value={customVendor}
                        onChange={(e) => setCustomVendor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Total CAD"
                        value={customTotal}
                        onChange={(e) => setCustomTotal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-xs transition-colors"
                    >
                      Process Custom Invoice
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
