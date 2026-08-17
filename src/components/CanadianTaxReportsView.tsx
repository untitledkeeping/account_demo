import React from 'react';
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
  AlertTriangle,
  PenLine,
  User as UserIcon,
  Check,
  X,
} from 'lucide-react';
import { ClientBusiness, ChartOfAccount, JournalEntry, User } from '../types';
import { formatCurrency } from '../utils/taxCalculator';
import { useCanadianTax } from '../hooks/useCanadianTax';

interface CanadianTaxReportsViewProps {
  client: ClientBusiness;
  accounts: ChartOfAccount[];
  entries: JournalEntry[];
  currentUser?: User;
}

export const CanadianTaxReportsView: React.FC<CanadianTaxReportsViewProps> = ({
  client,
  accounts,
  entries,
  currentUser,
}) => {
  const {
    selectedPeriod,
    setSelectedPeriod,
    summary,
    audit,
    isExported,
    handleExport,
    filingDeclaration,
    isDeclarationModalOpen,
    setIsDeclarationModalOpen,
    signAndFileReturn,
    successToast,
  } = useCanadianTax({
    client,
    accounts,
    entries,
    currentUser,
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

      {/* Header Context */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Canadian Sales Tax Engine (CRA & RQ)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {client.legalName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated tax returns matching CRA GST34 and Revenu Québec VDZ-471 official schedule lines.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 min-h-[40px]"
          >
            <option value="2026-Q1">2026 Q1 (Jan 1 - Mar 31)</option>
            <option value="2026-Q2">2026 Q2 (Apr 1 - Jun 30)</option>
            <option value="2026-Q3">2026 Q3 (Jul 1 - Sep 30)</option>
            <option value="2026-YTD">2026 Full Year to Date</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs transition-all border border-slate-200 min-h-[40px]"
          >
            {isExported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsDeclarationModalOpen(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[40px]"
          >
            <PenLine className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Sign & File</span>
          </button>
        </div>
      </div>

      {/* Official Certified Filing Banner if filed */}
      {filingDeclaration && (
        <div className="bg-emerald-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Electronic Filing Certificate
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Filed for {filingDeclaration.period} by {filingDeclaration.signedBy} ({filingDeclaration.role})
              </div>
              <div className="text-[10px] text-emerald-200 font-mono mt-0.5">
                Token: {filingDeclaration.confirmationNumber}
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-emerald-200 font-mono">
            Certified: {new Date(filingDeclaration.confirmedAt).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Tax Remittance Summary Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
            Total Combined Net Remittance Due
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
            {formatCurrency(summary.totalRemittanceDue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Filing Deadline for {selectedPeriod}: <strong className="text-slate-800">August 31, 2026</strong>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
          <div>
            <div className="text-slate-400 text-[10px]">Federal Net GST (Line 109)</div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-700">
              {formatCurrency(summary.gst.line109NetGstPayable)}
            </div>
          </div>
          {summary.qst && (
            <div>
              <div className="text-slate-400 text-[10px]">Québec Net QST (Line 209)</div>
              <div className="text-base sm:text-lg font-bold font-mono text-blue-700">
                {formatCurrency(summary.qst.line209NetQstPayable)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Readiness Warnings */}
      {audit.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-xs text-amber-900">
          <div className="font-bold flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Filing Verification Notice</span>
          </div>
          {audit.warnings.map((w, i) => (
            <div key={i} className="pl-5">• {w}</div>
          ))}
        </div>
      )}

      {/* Official Filing Return Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Federal GST/HST Worksheet (CRA) */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                CRA
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">GST / HST Return (Form GST34)</h3>
                <p className="text-[10px] text-slate-400">BN: {client.gstNumber || client.businessNumber}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Federal
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">Line 101 - Sales & Revenue</div>
                <div className="text-[10px] text-slate-500">Gross revenue for reporting period</div>
              </div>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(summary.gst.line101SalesTotal)}</span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">Line 105 - Total GST/HST Collected</div>
                <div className="text-[10px] text-slate-500">Output tax on customer billings</div>
              </div>
              <span className="font-mono font-bold text-emerald-700">{formatCurrency(summary.gst.line105GstCollected)}</span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">Line 108 - Input Tax Credits (ITCs)</div>
                <div className="text-[10px] text-slate-500">GST paid on qualifying purchases</div>
              </div>
              <span className="font-mono font-bold text-rose-600">({formatCurrency(summary.gst.line108ItcsClaimed)})</span>
            </div>

            <div className="py-2.5 flex justify-between items-center bg-slate-50 px-2.5 rounded-lg font-bold">
              <div>
                <div className="text-slate-900">Line 109 - Net GST/HST Payable</div>
                <div className="text-[9px] text-slate-500 font-normal">Line 105 minus Line 108</div>
              </div>
              <span className={`font-mono text-xs sm:text-sm ${summary.gst.line109NetGstPayable >= 0 ? 'text-slate-900' : 'text-emerald-700'}`}>
                {formatCurrency(summary.gst.line109NetGstPayable)}
              </span>
            </div>
          </div>
        </div>

        {/* Québec QST Worksheet (Revenu Québec) */}
        {summary.qst ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  RQ
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">QST Return (Form VDZ-471)</h3>
                  <p className="text-[10px] text-slate-400">Reg: {client.qstNumber || '1092847291TQ0001'}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Québec 9.975%
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">Line 201 - Québec Taxable Sales</div>
                  <div className="text-[10px] text-slate-500">Taxable revenue in Québec</div>
                </div>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(summary.qst.line201SalesTotal)}</span>
              </div>

              <div className="py-2 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">Line 205 - Total QST Collected</div>
                  <div className="text-[10px] text-slate-500">9.975% output tax</div>
                </div>
                <span className="font-mono font-bold text-blue-700">{formatCurrency(summary.qst.line205QstCollected)}</span>
              </div>

              <div className="py-2 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">Line 208 - Input Tax Refunds (ITRs)</div>
                  <div className="text-[10px] text-slate-500">QST paid on qualifying expenses</div>
                </div>
                <span className="font-mono font-bold text-rose-600">({formatCurrency(summary.qst.line208ItrsClaimed)})</span>
              </div>

              <div className="py-2.5 flex justify-between items-center bg-slate-50 px-2.5 rounded-lg font-bold">
                <div>
                  <div className="text-slate-900">Line 209 - Net QST Payable</div>
                  <div className="text-[9px] text-slate-500 font-normal">Line 205 minus Line 208</div>
                </div>
                <span className={`font-mono text-xs sm:text-sm ${summary.qst.line209NetQstPayable >= 0 ? 'text-slate-900' : 'text-emerald-700'}`}>
                  {formatCurrency(summary.qst.line209NetQstPayable)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/70 rounded-xl sm:rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center justify-center text-center space-y-2">
            <Building className="w-8 h-8 text-slate-300" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">No Provincial Sales Tax Filing</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              {client.legalName} is located in {client.provinceCode}, where sales taxes follow federal Harmonized Sales Tax (HST) rules.
            </p>
          </div>
        )}
      </div>

      {/* Declaration Signature Modal */}
      {isDeclarationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Sign & Certify Tax Return</h3>
              </div>
              <button
                onClick={() => setIsDeclarationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">Filing Entity: <strong className="text-slate-900">{client.legalName}</strong></div>
                <div className="text-slate-500">Period: <strong className="text-slate-900">{selectedPeriod}</strong></div>
                <div className="text-slate-500">Combined Remittance: <strong className="text-emerald-700 font-mono">{formatCurrency(summary.totalRemittanceDue)}</strong></div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Authorizing Bookkeeper Signature</label>
                <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">{currentUser?.fullName || 'Senior Accountant'}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">({currentUser?.role || 'staff'})</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                By certifying, you attest that the ITCs and ITRs claimed correspond to legitimate business expenditures in accordance with the Excise Tax Act (CRA) and the Quebec Taxation Act (RQ).
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDeclarationModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={signAndFileReturn}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xs min-h-[40px]"
              >
                Confirm & Sign Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
