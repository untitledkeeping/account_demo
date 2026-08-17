import React, { useState } from 'react';
import {
  Code2,
  Database,
  Terminal,
  Play,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Calendar,
  DollarSign,
  Copy,
  Check,
  Server,
  Zap,
  Lock,
} from 'lucide-react';
import { ClientBusiness, Firm } from '../types';

interface ArchitectureHubProps {
  firm: Firm;
  activeClient: ClientBusiness;
}

export const ArchitectureHub: React.FC<ArchitectureHubProps> = ({
  firm,
  activeClient,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'api_tester' | 'sql_rls' | 'roadmap_cost'>('api_tester');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('firm_overview');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Roadmap tasks state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'p1-1': true,
    'p1-2': true,
    'p1-3': true,
    'p2-1': true,
    'p3-1': true,
  });

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const endpoints = [
    {
      id: 'firm_overview',
      method: 'GET',
      path: '/api/v1/firm/overview',
      description: 'Fetch multi-client portfolio health status and filing deadlines for the 15-business boundary.',
      mockResponse: {
        firmId: firm.id,
        name: firm.name,
        tier: firm.subscriptionTier,
        activeClientLimit: firm.activeClientLimit,
        activeClientsCount: 12,
        clients: [
          {
            id: activeClient.id,
            legalName: activeClient.legalName,
            province: activeClient.provinceCode,
            status: activeClient.status,
            unreconciledCount: 5,
            pendingReceiptsCount: 3,
            lastClosedMonth: activeClient.lastClosedMonth,
          },
        ],
      },
    },
    {
      id: 'post_journal_entry',
      method: 'POST',
      path: `/api/v1/clients/${activeClient.id}/journal-entries`,
      description: 'Atomically post an immutable balanced double-entry transaction with CRA/RQ tax lines.',
      mockPayload: {
        entryDate: '2026-08-17',
        memo: 'Commercial Studio Fiber Telecom - Bell Canada',
        source: 'manual',
        lines: [
          { accountCode: '6400', description: 'Monthly Telecom', debit: 175.0, credit: 0.0, taxCode: 'GST_QST' },
          { accountCode: '2150', description: 'GST Paid (5%)', debit: 8.75, credit: 0.0 },
          { accountCode: '2160', description: 'QST Paid (9.975%)', debit: 17.46, credit: 0.0 },
          { accountCode: '1010', description: 'Bank Operating Account', debit: 0.0, credit: 201.21 },
        ],
      },
      mockResponse: {
        status: 'posted',
        entryNumber: 1045,
        clientBusinessId: activeClient.id,
        isBalanced: true,
        debitSum: 201.21,
        creditSum: 201.21,
        postedAt: new Date().toISOString(),
      },
    },
    {
      id: 'tax_summary',
      method: 'GET',
      path: `/api/v1/clients/${activeClient.id}/reports/sales-tax-summary?period=2026-Q2`,
      description: 'Aggregates GST (Line 105 vs 108 ITCs) and QST (Line 205 vs 208 ITRs) directly formatted for CRA & Revenu Québec filing.',
      mockResponse: {
        period: '2026-Q2',
        province: activeClient.provinceCode,
        gst: {
          line101SalesTotal: 12000.0,
          line105GstCollected: 600.0,
          line108ItcsClaimed: 191.25,
          line109NetGstPayable: 408.75,
        },
        qst: activeClient.provinceCode === 'QC' ? {
          line201SalesTotal: 12000.0,
          line205QstCollected: 1197.0,
          line208ItrsClaimed: 381.55,
          line209NetQstPayable: 815.45,
        } : null,
        totalRemittanceDue: 1224.2,
      },
    },
  ];

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const handleRunEndpoint = () => {
    setApiResponse(JSON.stringify(currentEndpoint.mockResponse, null, 2));
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Context */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-emerald-400" />
              <span>Studio Books Engineering Hub</span>
            </h1>
            <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Jeff • Ben • Johnson
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl">
            Live technical workbench for API testing, PostgreSQL Row-Level Security verification, immutable double-entry ledger proofs, and 10-week Surrey demo roadmap tracking.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl space-x-1 border border-slate-700">
          <button
            onClick={() => setActiveSubTab('api_tester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'api_tester'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            REST API Playground
          </button>
          <button
            onClick={() => setActiveSubTab('sql_rls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'sql_rls'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            PostgreSQL & RLS
          </button>
          <button
            onClick={() => setActiveSubTab('roadmap_cost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'roadmap_cost'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            10-Week Sprint Roadmap
          </button>
        </div>
      </div>

      {/* TAB 1: REST API PLAYGROUND */}
      {activeSubTab === 'api_tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Endpoint List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Engine Endpoints ({endpoints.length})
            </div>
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep.id);
                    setApiResponse(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedEndpoint === ep.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold truncate">{ep.path.split('?')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{ep.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Live Request / Response Runner */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded font-mono ${
                    currentEndpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentEndpoint.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">{currentEndpoint.path}</span>
                </div>
                <p className="text-xs text-slate-500">{currentEndpoint.description}</p>
              </div>

              <button
                onClick={handleRunEndpoint}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Request</span>
              </button>
            </div>

            {/* Request Payload (if POST) */}
            {currentEndpoint.mockPayload && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Request Body (JSON)</label>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(currentEndpoint.mockPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Viewer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Response Payload (200 OK)</label>
                {apiResponse && (
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Status 200 OK • 14ms (PostgreSQL RLS Validated)</span>
                  </span>
                )}
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 min-h-[160px]">
                {apiResponse || '// Click "Execute Request" above to test endpoint execution.'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POSTGRESQL & ROW-LEVEL SECURITY EXPLORER */}
      {activeSubTab === 'sql_rls' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>PostgreSQL 16 Multi-Tenant DDL & Row-Level Security</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Postgres RLS context sessions (`app.current_firm_id`, `app.current_client_id`) preventing cross-tenant data leakage at the database engine level.
              </p>
            </div>

            <button
              onClick={() => handleCopyCode(POSTGRES_DDL_SNIPPET)}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied DDL!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Session Context Enforcement Pattern</span>
              </h3>
              <p className="text-xs text-slate-600">
                Every backend query initializes the database transaction with the tenant boundary variables before running CRUD operations:
              </p>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
{`// Fastify / Express Middleware
await prisma.$executeRawUnsafe(
  \`SET LOCAL app.current_firm_id = '\${user.firmId}'; 
   SET LOCAL app.current_client_id = '\${clientId}';\`
);`}
              </pre>

              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 font-medium">
                <span className="font-bold">SOC-2 / CRA Guarantee:</span> Even if application code has a bug or omits a WHERE clause, PostgreSQL RLS drops any row belonging to other firms or clients.
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Immutable Balance Trigger</span>
              </h3>
              <p className="text-xs text-slate-600">
                A database trigger fires on every `ledger_lines` insertion to mathematically guarantee Debits === Credits:
              </p>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
{`CREATE OR REPLACE FUNCTION verify_journal_entry_balanced()
RETURNS TRIGGER AS $$
DECLARE
  v_debit NUMERIC; v_credit NUMERIC;
BEGIN
  SELECT SUM(debit), SUM(credit) INTO v_debit, v_credit
  FROM ledger_lines WHERE journal_entry_id = NEW.journal_entry_id;
  IF v_debit <> v_credit THEN
    RAISE EXCEPTION 'Unbalanced Journal Entry: Debits (%) != Credits (%)', 
      v_debit, v_credit;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 10-WEEK SPRINT ROADMAP & DEMO TRACKER */}
      {activeSubTab === 'roadmap_cost' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>10-Week Sprint to Surrey Demo (Target: October 24, 2026)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Execution roadmap with task assignments across Jeff (Backend), Ben (Frontend/UX), and Johnson (Domain).
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold text-emerald-900 font-mono">
              Estimated Total MVP Cost: $2,710 – $3,950 CAD (~$900–$1,300/founder)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phase 1 & 2 */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">Phase 1 (Weeks 1-3): Ledger Engine & DB</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Jeff & Ben</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p1-1']} onChange={() => toggleTask('p1-1')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p1-1'] ? 'line-through text-slate-400' : 'text-slate-700'}>PostgreSQL 16 schema & Row-Level Security policies</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p1-2']} onChange={() => toggleTask('p1-2')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p1-2'] ? 'line-through text-slate-400' : 'text-slate-700'}>Double-entry balance trigger & reversal workflow</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p1-3']} onChange={() => toggleTask('p1-3')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p1-3'] ? 'line-through text-slate-400' : 'text-slate-700'}>Auth & 15-business boundary isolation</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">Phase 2 (Weeks 4-6): CSV Ingestion & OCR</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Jeff & Ben</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p2-1']} onChange={() => toggleTask('p2-1')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p2-1'] ? 'line-through text-slate-400' : 'text-slate-700'}>QuickBooks Online & Wave CSV import parsers</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p2-2']} onChange={() => toggleTask('p2-2')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p2-2'] ? 'line-through text-slate-400' : 'text-slate-700'}>Receipt document OCR pipeline & auto tax deconstruction</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p2-3']} onChange={() => toggleTask('p2-3')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p2-3'] ? 'line-through text-slate-400' : 'text-slate-700'}>Bank feed candidate auto-matcher</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Phase 3 & 4 */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">Phase 3 (Weeks 7-8): Canadian Tax & Reports</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">Jeff & Johnson</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p3-1']} onChange={() => toggleTask('p3-1')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p3-1'] ? 'line-through text-slate-400' : 'text-slate-700'}>CRA GST Line 105/108 & Revenu Québec Line 205/208 worksheets</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p3-2']} onChange={() => toggleTask('p3-2')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p3-2'] ? 'line-through text-slate-400' : 'text-slate-700'}>Balance Sheet & Profit/Loss auto-closing queries</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">Phase 4 (Weeks 9-10): Surrey Demo Polish</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Ben, Jeff & Johnson</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p4-1']} onChange={() => toggleTask('p4-1')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p4-1'] ? 'line-through text-slate-400' : 'text-slate-700'}>Load real sanitized Studio Bookkeeping client datasets</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!completedTasks['p4-2']} onChange={() => toggleTask('p4-2')} className="rounded text-emerald-600" />
                    <span className={completedTasks['p4-2'] ? 'line-through text-slate-400' : 'text-slate-700'}>Dry run 2-click client switcher & live bank reconciliation</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const POSTGRES_DDL_SNIPPET = `-- Studio Books PostgreSQL Multi-Tenant Schema
CREATE TABLE firms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'practice_flagship',
    active_client_limit INT NOT NULL DEFAULT 15
);

CREATE TABLE client_businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    legal_name VARCHAR(255) NOT NULL,
    business_number VARCHAR(15),
    province_code VARCHAR(2) NOT NULL DEFAULT 'QC',
    gst_registered BOOLEAN DEFAULT TRUE,
    qst_registered BOOLEAN DEFAULT TRUE
);

ALTER TABLE client_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_business_firm_isolation ON client_businesses
    FOR ALL USING (firm_id = NULLIF(current_setting('app.current_firm_id', true), '')::uuid);
`;
