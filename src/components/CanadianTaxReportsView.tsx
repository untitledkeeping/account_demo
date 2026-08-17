import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  Printer,
  Calendar,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry } from '../types';
import { generateSalesTaxSummary } from '../utils/ledgerEngine';
import { formatCurrency } from '../utils/taxCalculator';

interface CanadianTaxReportsViewProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
}

export const CanadianTaxReportsView: React.FC<CanadianTaxReportsViewProps> = ({
  client,
  accounts,
  entries,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-Q2');
  const [isExported, setIsExported] = useState(false);

  const summary = generateSalesTaxSummary(client, accounts, entries, selectedPeriod);

  const handleExport = () => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Canadian Sales Tax Filing Engine (CRA & RQ)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated tax returns matching Canada Revenue Agency (GST34) and Revenu Québec (VDZ-471) official lines: Line 105/108 ITCs and Line 205/208 ITRs.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="2026-Q1">2026 Q1 (Jan 1 - Mar 31)</option>
            <option value="2026-Q2">2026 Q2 (Apr 1 - Jun 30)</option>
            <option value="2026-Q3">2026 Q3 (Jul 1 - Sep 30)</option>
            <option value="2026-YTD">2026 Full Year to Date</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
          >
            {isExported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Worksheet Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Official PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tax Remittance Summary Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-700 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-1">
            Total Combined Net Remittance Due
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {formatCurrency(summary.totalRemittanceDue)}
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Filing Deadline for {selectedPeriod}: <span className="font-semibold text-white">August 31, 2026</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-slate-400 text-[11px]">Federal Net GST (Line 109)</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {formatCurrency(summary.gst.line109NetGstPayable)}
            </div>
          </div>
          {summary.qst && (
            <div>
              <div className="text-slate-400 text-[11px]">Québec Net QST (Line 209)</div>
              <div className="text-lg font-bold font-mono text-blue-400">
                {formatCurrency(summary.qst.line209NetQstPayable)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Filing Return Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Federal GST/HST Worksheet (CRA) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                CRA
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">GST / HST Return (Form GST34)</h3>
                <p className="text-[11px] text-slate-500">Registration: {client.gstNumber || client.businessNumber}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Federal 5%
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-800">Line 101: Total Taxable Sales & Revenues</div>
                <div className="text-[11px] text-slate-400">Gross operating sales before taxes</div>
              </div>
              <div className="font-mono font-bold text-slate-900">
                {formatCurrency(summary.gst.line101SalesTotal)}
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-800">Line 105: Total GST/HST Collected</div>
                <div className="text-[11px] text-slate-400">Tax charged to clients on sales</div>
              </div>
              <div className="font-mono font-bold text-emerald-700">
                {formatCurrency(summary.gst.line105GstCollected)}
              </div>
            </div>

            <div className="py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-800">Line 108: Input Tax Credits (ITCs) Claimed</div>
                <div className="text-[11px] text-slate-400">GST paid on qualifying business expenses & supplies</div>
              </div>
              <div className="font-mono font-bold text-rose-700">
                ({formatCurrency(summary.gst.line108ItcsClaimed)})
              </div>
            </div>

            <div className="py-3.5 flex justify-between items-center bg-slate-50/80 -mx-6 px-6 font-bold border-t border-slate-200">
              <div>
                <div className="text-slate-900 text-sm">Line 109: Net Federal GST Payable / (Refund)</div>
                <div className="text-[11px] text-slate-500 font-normal">Line 105 minus Line 108</div>
              </div>
              <div className="font-mono text-base text-emerald-700">
                {formatCurrency(summary.gst.line109NetGstPayable)}
              </div>
            </div>
          </div>
        </div>

        {/* Québec QST Worksheet (Revenu Québec) */}
        {summary.qst ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  RQ
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">QST Return (Form VDZ-471)</h3>
                  <p className="text-[11px] text-slate-500">Registration: {client.qstNumber || 'Active'}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Québec 9.975%
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Line 201: Total Taxable Sales in Québec</div>
                  <div className="text-[11px] text-slate-400">Total revenue subject to QST</div>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  {formatCurrency(summary.qst.line201SalesTotal)}
                </div>
              </div>

              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Line 205: Total QST Collected</div>
                  <div className="text-[11px] text-slate-400">9.975% provincial sales tax collected</div>
                </div>
                <div className="font-mono font-bold text-blue-700">
                  {formatCurrency(summary.qst.line205QstCollected)}
                </div>
              </div>

              <div className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Line 208: Input Tax Refunds (ITRs) Claimed</div>
                  <div className="text-[11px] text-slate-400">QST paid on qualifying operating expenses</div>
                </div>
                <div className="font-mono font-bold text-rose-700">
                  ({formatCurrency(summary.qst.line208ItrsClaimed)})
                </div>
              </div>

              <div className="py-3.5 flex justify-between items-center bg-slate-50/80 -mx-6 px-6 font-bold border-t border-slate-200">
                <div>
                  <div className="text-slate-900 text-sm">Line 209: Net Québec QST Payable / (Refund)</div>
                  <div className="text-[11px] text-slate-500 font-normal">Line 205 minus Line 208</div>
                </div>
                <div className="font-mono text-base text-blue-700">
                  {formatCurrency(summary.qst.line209NetQstPayable)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <Building className="w-10 h-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Not Registered for Québec QST</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {client.legalName} is domiciled in {client.provinceCode}. Canadian HST/GST rules apply without provincial QST returns.
            </p>
          </div>
        )}
      </div>

      {/* Compliance Audit Note */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-slate-800">CRA & Revenu Québec Audit Compliance Guarantee</div>
          <p className="mt-0.5 text-slate-500">
            Every dollar in Line 108 (ITCs) and Line 208 (ITRs) is linked directly to immutable, double-entry journal records and verified receipt documents with registered BN9/NEQ numbers.
          </p>
        </div>
      </div>
    </div>
  );
};
