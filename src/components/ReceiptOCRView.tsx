import React, { useState } from 'react';
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
} from 'lucide-react';
import { ClientBusiness, ReceiptDocument, ChartOfAccount, JournalEntry } from '../types';
import { formatCurrency, extractTaxesFromGrossTotal } from '../utils/taxCalculator';

interface ReceiptOCRViewProps {
  client: ClientBusiness;
  receipts: ReceiptDocument[];
  accounts: ChartOfAccount[];
  onPostReceiptToLedger: (receipt: ReceiptDocument, targetAccountId: string) => void;
  onAddSimulatedReceipt: (vendor: string, total: number) => void;
}

export const ReceiptOCRView: React.FC<ReceiptOCRViewProps> = ({
  client,
  receipts,
  accounts,
  onPostReceiptToLedger,
  onAddSimulatedReceipt,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDocument | null>(receipts[0] || null);
  const [targetAccountId, setTargetAccountId] = useState<string>(
    receipts[0]?.suggestedAccountId || accounts.find((a) => a.type === 'expense')?.id || accounts[0]?.id
  );

  // New simulated upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [customVendor, setCustomVendor] = useState('Costco Business Centre');
  const [customTotal, setCustomTotal] = useState('348.90');

  const handleSelectReceipt = (r: ReceiptDocument) => {
    setSelectedReceipt(r);
    setTargetAccountId(r.suggestedAccountId || accounts.find((a) => a.type === 'expense')?.id || accounts[0]?.id);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(customTotal) || 100;
    onAddSimulatedReceipt(customVendor, tot);
    setIsUploadOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Receipt & Invoice OCR Ingestion
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated document parser extracting vendor names, transaction dates, pre-tax subtotals, GST (5%), and Québec QST (9.975%) for instant ledger posting.
          </p>
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
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-1">
            <span>Incoming Documents ({receipts.length})</span>
            <span className="text-emerald-700 font-semibold">Mindee OCR Ready</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {receipts.map((r) => {
              const isSelected = selectedReceipt?.id === r.id;
              const isPosted = r.status === 'posted';

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectReceipt(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
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

        {/* Right Col: Split Screen Auditor (Document Preview + OCR Extracted Fields) */}
        {selectedReceipt ? (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedReceipt.extractedVendor}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>OCR Confidence: 99.2%</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  File: {selectedReceipt.fileName} • Uploaded by {selectedReceipt.uploadedBy.replace('usr-', '')}
                </p>
              </div>

              {selectedReceipt.status === 'posted' ? (
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Posted to General Ledger</span>
                </div>
              ) : (
                <button
                  onClick={() => onPostReceiptToLedger(selectedReceipt, targetAccountId)}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve & Post to Ledger</span>
                </button>
              )}
            </div>

            {/* Split Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receipt Visual Mockup with OCR Overlays */}
              <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden flex flex-col justify-between min-h-[340px] border border-slate-800">
                <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  OCR BOUNDING BOXES
                </div>

                <div className="space-y-4 pt-4">
                  {/* Bounding Box 1: Vendor */}
                  <div className="border border-emerald-400 bg-emerald-500/10 p-2 rounded-md">
                    <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Field: Vendor</div>
                    <div className="text-sm font-bold text-white">{selectedReceipt.extractedVendor}</div>
                  </div>

                  {/* Bounding Box 2: Date & Invoice */}
                  <div className="border border-cyan-400 bg-cyan-500/10 p-2 rounded-md flex justify-between">
                    <div>
                      <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Field: Date</div>
                      <div className="text-xs text-white font-mono">{selectedReceipt.extractedDate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Jurisdiction</div>
                      <div className="text-xs text-white font-mono">{client.provinceCode}</div>
                    </div>
                  </div>

                  {/* Bounding Box 3: Tax Split */}
                  <div className="border border-purple-400 bg-purple-500/10 p-2 rounded-md space-y-1">
                    <div className="text-[10px] text-purple-400 font-mono font-bold uppercase">Field: Canadian Taxes</div>
                    <div className="flex justify-between text-xs font-mono">
                      <span>GST / TPS (5%):</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(selectedReceipt.extractedGst)}</span>
                    </div>
                    {client.provinceCode === 'QC' && (
                      <div className="flex justify-between text-xs font-mono">
                        <span>QST / TVQ (9.975%):</span>
                        <span className="font-bold text-blue-400">{formatCurrency(selectedReceipt.extractedQst)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Box */}
                <div className="border-2 border-emerald-500 bg-emerald-500/20 p-3 rounded-lg flex items-baseline justify-between mt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Total Extracted</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatCurrency(selectedReceipt.extractedTotal)}
                  </span>
                </div>
              </div>

              {/* Editable Fields Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Account</label>
                  <select
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    disabled={selectedReceipt.status === 'posted'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Pre-Tax Subtotal</label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(selectedReceipt.extractedSubtotal)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">GST (5%)</label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(selectedReceipt.extractedGst)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-700 font-bold"
                    />
                  </div>
                </div>

                {client.provinceCode === 'QC' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">QST (9.975%)</label>
                      <input
                        type="text"
                        disabled
                        value={formatCurrency(selectedReceipt.extractedQst)}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-blue-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Gross Total</label>
                      <input
                        type="text"
                        disabled
                        value={formatCurrency(selectedReceipt.extractedTotal)}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                )}

                {selectedReceipt.notes && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block mb-0.5">Line Description</span>
                    <p className="text-xs text-slate-600">{selectedReceipt.notes}</p>
                  </div>
                )}

                <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Posting will generate a debit to the selected expense account, debits to GST & QST receivable (ITCs/ITRs), and a credit to Accounts Payable / Corporate Card.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Receipt Selected</h3>
            <p className="text-xs text-slate-500 mt-1">Select a receipt from the left queue to audit extracted OCR tags.</p>
          </div>
        )}
      </div>

      {/* Simulated Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Simulate Receipt OCR Ingestion</h3>
            <p className="text-xs text-slate-500 mb-4">
              Simulate uploading a scanned merchant invoice to trigger Mindee/Textract OCR parsing and tax deconstruction.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Merchant / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={customVendor}
                  onChange={(e) => setCustomVendor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gross Total Amount (CAD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={customTotal}
                  onChange={(e) => setCustomTotal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="font-semibold text-slate-800">Auto Tax Calculation (QC Rate 14.975%):</div>
                <div className="font-mono text-[11px]">
                  Estimated GST (5%): {formatCurrency(parseFloat(customTotal || '0') * (0.05 / 1.14975))}
                </div>
                <div className="font-mono text-[11px]">
                  Estimated QST (9.975%): {formatCurrency(parseFloat(customTotal || '0') * (0.09975 / 1.14975))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  Process Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
