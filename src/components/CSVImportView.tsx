import React from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Download,
  Building,
  Check,
  FileText,
  ShieldCheck,
  User as UserIcon,
  AlertTriangle,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry, User } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { useCSVImport } from '../hooks/useCSVImport';

interface CSVImportViewProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  currentUser?: User;
  onBatchImportEntries: (entries: Partial<JournalEntry>[]) => void;
}

export const CSVImportView: React.FC<CSVImportViewProps> = ({
  client,
  accounts,
  currentUser,
  onBatchImportEntries,
}) => {
  const {
    csvText,
    setCsvText,
    fileName,
    parsedResult,
    isSuccess,
    isDragging,
    batchValidation,
    handleParse,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleExecuteImport,
    loadQBOTemplate,
    loadWaveTemplate,
    loadBankTemplate,
  } = useCSVImport({
    client,
    accounts,
    currentUser,
    onBatchImportEntries,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              CSV Ingestion & Platform Migration
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Importing Bookkeeper: <strong className="text-slate-900">{currentUser?.fullName || 'Senior Accountant'}</strong>
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <p className="text-xs text-slate-500">
              Zero-friction migration pipeline supporting QuickBooks Online, Wave, and Canadian bank feeds with automatic Canadian tax deconstruction.
            </p>
          </div>
        </div>

        {parsedResult && parsedResult.extractedEntries.length > 0 && (
          <button
            onClick={handleExecuteImport}
            disabled={!batchValidation.isValid}
            className={`flex items-center space-x-2 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md ${
              batchValidation.isValid
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Successfully Imported {parsedResult.extractedEntries.length} Entries!</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 stroke-[3]" />
                <span>Import {parsedResult.extractedEntries.length} Journal Entries</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Preset Format Buttons */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Load Pre-Configured Sample Migration Templates
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadQBOTemplate}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>QuickBooks Online General Ledger (.csv)</span>
          </button>

          <button
            onClick={loadWaveTemplate}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wave Accounting Export (.csv)</span>
          </button>

          <button
            onClick={loadBankTemplate}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Desjardins / RBC Bank Feed (.csv)</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop File Ingestion & Manual CSV Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CSV Raw Text Editor and File Dropper */}
        <div className="lg:col-span-5 space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer bg-white ${
              isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
              <UploadCloud className="w-8 h-8 mx-auto text-slate-400" />
              <div className="font-bold text-xs text-slate-800">
                Drop CSV file here or click to browse
              </div>
              <div className="text-[11px] text-slate-500">
                Supports QuickBooks Online, Wave, Xero, and Canadian bank CSVs
              </div>
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Raw CSV Payload ({fileName})</span>
              <span className="text-[11px] text-slate-400 font-mono">{csvText.split('\n').length} lines</span>
            </div>
            <textarea
              rows={9}
              value={csvText}
              onChange={(e) => handleParse(e.target.value)}
              className="w-full font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500"
              placeholder="Paste raw CSV content here..."
            />
          </div>
        </div>

        {/* Right: Validation Inspector & Pre-flight Preview */}
        <div className="lg:col-span-7 space-y-4">
          {batchValidation.isBalanced ? (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Batch Double-Entry Integrity Validated:</strong> Debits (${batchValidation.totalDebits.toFixed(2)}) === Credits (${batchValidation.totalCredits.toFixed(2)})
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                Balanced
              </span>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-xs text-amber-900">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Batch Imbalance Detected</span>
              </div>
              <div className="pl-6">
                Total Debits (${batchValidation.totalDebits.toFixed(2)}) do not match Total Credits (${batchValidation.totalCredits.toFixed(2)}).
              </div>
            </div>
          )}

          {/* Parsed Entries Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Extracted Journal Entries Preview ({parsedResult?.extractedEntries.length || 0})
                </h3>
                <div className="text-[11px] text-slate-500">
                  Target Entity: {client.legalName} ({client.provinceCode})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {parsedResult?.detectedFormat || 'Auto-Mapped'}
              </span>
            </div>

            <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-100">
              {parsedResult?.extractedEntries.map((entry, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-800">#{idx + 1}</span>
                      <span className="text-slate-500 font-mono">{entry.entryDate}</span>
                      <span className="font-semibold text-slate-900">{entry.memo}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                      {entry.source}
                    </span>
                  </div>

                  <div className="pl-4 border-l-2 border-slate-200 space-y-1 font-mono text-[11px]">
                    {entry.lines?.map((line, lIdx) => (
                      <div key={lIdx} className="flex justify-between text-slate-600">
                        <span>{line.description}</span>
                        <div className="space-x-3">
                          {line.debit > 0 && <span className="text-slate-900">DR: {formatCurrency(line.debit)}</span>}
                          {line.credit > 0 && <span className="text-slate-700">CR: {formatCurrency(line.credit)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {(!parsedResult || parsedResult.extractedEntries.length === 0) && (
                <div className="p-12 text-center text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-xs">No valid journal entries extracted from CSV.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
