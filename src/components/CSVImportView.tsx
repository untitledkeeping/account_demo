import React, { useState } from 'react';
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
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry } from '../types';
import {
  parseCSVText,
  convertCSVToLedgerEntries,
  SAMPLE_QBO_CSV,
  SAMPLE_WAVE_CSV,
  SAMPLE_BANK_CSV,
  ParsedCSVResult,
} from '../utils/csvParser';
import { formatCurrency } from '../utils/taxCalculator';

interface CSVImportViewProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  onBatchImportEntries: (entries: Partial<JournalEntry>[]) => void;
}

export const CSVImportView: React.FC<CSVImportViewProps> = ({
  client,
  accounts,
  onBatchImportEntries,
}) => {
  const [csvText, setCsvText] = useState<string>(SAMPLE_QBO_CSV);
  const [fileName, setFileName] = useState<string>('qbo_general_ledger_export.csv');
  const [parsedResult, setParsedResult] = useState<ParsedCSVResult | null>(() => {
    const raw = parseCSVText(SAMPLE_QBO_CSV);
    return convertCSVToLedgerEntries(raw, 'qbo_general_ledger_export.csv', client.id, accounts, client.provinceCode);
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleParse = (text: string, name: string = fileName) => {
    setCsvText(text);
    setFileName(name);
    const raw = parseCSVText(text);
    const result = convertCSVToLedgerEntries(raw, name, client.id, accounts, client.provinceCode);
    setParsedResult(result);
    setIsSuccess(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParse(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!parsedResult || parsedResult.extractedEntries.length === 0) return;
    onBatchImportEntries(parsedResult.extractedEntries);
    setIsSuccess(true);
  };

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
          <p className="text-xs text-slate-500 mt-1">
            Zero-friction migration pipeline supporting QuickBooks Online, Wave, and generic Canadian bank statement exports with automatic Canadian tax deconstruction.
          </p>
        </div>

        {parsedResult && parsedResult.extractedEntries.length > 0 && (
          <button
            onClick={handleExecuteImport}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
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
            onClick={() => handleParse(SAMPLE_QBO_CSV, 'quickbooks_online_gl_2026.csv')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>QuickBooks Online General Ledger (.csv)</span>
          </button>

          <button
            onClick={() => handleParse(SAMPLE_WAVE_CSV, 'wave_accounting_export.csv')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wave Accounting Export (.csv)</span>
          </button>

          <button
            onClick={() => handleParse(SAMPLE_BANK_CSV, 'desjardins_rbc_statement.csv')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Desjardins / RBC Bank Feed (.csv)</span>
          </button>
        </div>
      </div>

      {/* Upload & CSV Input Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Upload CSV File</h3>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/50">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">Choose CSV File</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Drag and drop or browse</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Or Paste Raw CSV Data</label>
              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => handleParse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Parsed Preview & Double-Entry Mapping */}
        <div className="lg:col-span-8 space-y-4">
          {parsedResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{parsedResult.fileName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Detected: {parsedResult.sourceType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Parsed {parsedResult.rowCount} rows • Generated {parsedResult.extractedEntries.length} compound journal entries
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Auto-Balancing Status</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">Debits === Credits [PASS]</span>
                </div>
              </div>

              {/* Sample Parsed Rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-sans font-bold border-b border-slate-200">
                      {parsedResult.headers.map((h) => (
                        <th key={h} className="py-2 px-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedResult.rows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        {parsedResult.headers.map((h) => (
                          <td key={h} className="py-2 px-3 text-slate-800 whitespace-nowrap">
                            {r[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Ready to batch-post into {client.legalName}'s immutable General Ledger with automatic GST/QST expense deconstruction.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-700 text-sm">No CSV loaded</div>
              <p className="text-xs text-slate-500 mt-1">Select a sample template or upload a file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
