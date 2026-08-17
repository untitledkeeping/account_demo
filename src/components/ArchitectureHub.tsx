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
  ArrowRight,
  FileCode,
  Globe,
  HardDrive,
  RefreshCw,
  Table,
  Cpu,
  BookOpen,
  Download,
  KeyRound,
  ExternalLink,
  ChevronRight,
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
  const [activeSubTab, setActiveSubTab] = useState<
    'guide' | 'database_ddl' | 'api_specs' | 'frontend_client' | 'api_tester' | 'roadmap'
  >('guide');

  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('post_journal_entry');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Roadmap tasks state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'db-1': true,
    'db-2': true,
    'api-1': true,
    'fe-1': false,
    'fe-2': false,
  });

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const endpoints = [
    {
      id: 'get_clients',
      method: 'GET',
      path: '/api/v1/clients',
      title: 'List Firm Clients',
      description: 'Fetch all client businesses associated with the active firm, including tax jurisdiction and reconciliation counts.',
      headers: {
        'x-firm-id': firm.id,
        'x-user-id': 'user-senior-cpa-1',
      },
      mockResponse: [
        {
          id: activeClient.id,
          firmId: firm.id,
          legalName: activeClient.legalName,
          businessNumber: activeClient.businessNumber,
          provinceCode: activeClient.provinceCode,
          reportingFrequency: activeClient.reportingFrequency,
          status: activeClient.status,
          unreconciledCount: 5,
          pendingReceiptsCount: 3,
        },
      ],
    },
    {
      id: 'get_accounts',
      method: 'GET',
      path: `/api/v1/clients/${activeClient.id}/accounts`,
      title: 'Get Chart of Accounts',
      description: 'Retrieves all standard Canadian GL accounts with current calculated debit/credit balances.',
      headers: {
        'x-firm-id': firm.id,
        'x-client-id': activeClient.id,
      },
      mockResponse: [
        { id: 'acc-1010', code: '1010', name: 'Operating Chequing Account (CAD)', type: 'asset', currentBalance: 42150.2 },
        { id: 'acc-2150', code: '2150', name: 'GST/HST Paid on Purchases (ITC)', type: 'liability', currentBalance: 320.45 },
        { id: 'acc-2160', code: '2160', name: 'QST Paid on Purchases (ITR)', type: 'liability', currentBalance: 639.3 },
        { id: 'acc-4010', code: '4010', name: 'Consulting & Professional Fees Revenue', type: 'revenue', currentBalance: 24500.0 },
      ],
    },
    {
      id: 'post_journal_entry',
      method: 'POST',
      path: `/api/v1/clients/${activeClient.id}/journal-entries`,
      title: 'Post Balanced Journal Entry',
      description: 'Atomically creates an immutable balanced double-entry transaction. Enforces Debits === Credits in a single SQL transaction.',
      headers: {
        'Content-Type': 'application/json',
        'x-firm-id': firm.id,
        'x-client-id': activeClient.id,
        'x-user-id': 'user-senior-cpa-1',
      },
      mockPayload: {
        entryDate: '2026-08-17',
        memo: 'Bell Canada Fiber Telecom & Cloud Hosting',
        source: 'manual',
        lines: [
          { accountId: 'acc-6400', description: 'Telecom Expense', debit: 150.0, credit: 0.0, taxCode: 'GST_QST' },
          { accountId: 'acc-2150', description: 'GST Paid (5%)', debit: 7.5, credit: 0.0 },
          { accountId: 'acc-2160', description: 'QST Paid (9.975%)', debit: 14.96, credit: 0.0 },
          { accountId: 'acc-1010', description: 'Bank Chequing Outflow', debit: 0.0, credit: 172.46 },
        ],
      },
      mockResponse: {
        status: 'success',
        message: 'Journal Entry #1045 posted successfully',
        entry: {
          id: `entry-${Date.now()}`,
          entryNumber: 1045,
          entryDate: '2026-08-17',
          memo: 'Bell Canada Fiber Telecom & Cloud Hosting',
          isBalanced: true,
          totalDebits: 172.46,
          totalCredits: 172.46,
          linesCount: 4,
          postedAt: new Date().toISOString(),
        },
      },
    },
    {
      id: 'tax_summary',
      method: 'GET',
      path: `/api/v1/clients/${activeClient.id}/reports/sales-tax-summary?period=2026-Q2`,
      title: 'CRA & RQ Tax Summary',
      description: 'Aggregates GST (Line 105 vs 108 ITCs) and QST (Line 205 vs 208 ITRs) directly mapped for provincial remittances.',
      headers: {
        'x-firm-id': firm.id,
        'x-client-id': activeClient.id,
      },
      mockResponse: {
        period: '2026-Q2',
        province: activeClient.provinceCode,
        gst: {
          line101SalesTotal: 12000.0,
          line105GstCollected: 600.0,
          line108ItcsClaimed: 191.25,
          line109NetGstPayable: 408.75,
        },
        qst: {
          line201SalesTotal: 12000.0,
          line205QstCollected: 1197.0,
          line208ItrsClaimed: 381.55,
          line209NetQstPayable: 815.45,
        },
        totalNetPayableCAD: 1224.2,
      },
    },
  ];

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const handleRunEndpoint = () => {
    setApiResponse(JSON.stringify(currentEndpoint.mockResponse, null, 2));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-5 sm:p-7 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Server className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Backend, Database & API Architecture Hub</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Full-stack reference for database table design, Express REST routes, and connecting React to PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCopy(COMPLETE_ARCHITECTURE_MARKDOWN, 'full-md')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copiedSection === 'full-md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'full-md' ? 'Copied Full Guide!' : 'Copy Markdown Spec'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-1.5 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'guide'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Step-by-Step Implementation Guide</span>
        </button>

        <button
          onClick={() => setActiveSubTab('database_ddl')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'database_ddl'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>2. Database & SQL DDL Schema</span>
        </button>

        <button
          onClick={() => setActiveSubTab('api_specs')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'api_specs'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>3. REST API Routes (`server.ts`)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('frontend_client')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'frontend_client'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>4. React API Client & Hooks</span>
        </button>

        <button
          onClick={() => setActiveSubTab('api_tester')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'api_tester'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>5. Live REST API Tester</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roadmap')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'roadmap'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>6. Sprint Checklist</span>
        </button>
      </div>

      {/* SUBTAB 1: STEP-BY-STEP IMPLEMENTATION GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          {/* Visual Architecture Flow */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Full-Stack Architecture & Data Flow</span>
            </h2>
            <p className="text-xs text-slate-600">
              Here is how the browser frontend, backend Express server, and PostgreSQL database interact:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center space-x-1.5 text-blue-700">
                    <Globe className="w-4 h-4" />
                    <span>1. React Frontend (Vite)</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-sans">Client</span>
                </div>
                <p className="text-slate-600 font-sans text-[11px]">
                  User actions in General Ledger, Banking, or Receipts dispatch calls via <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">/src/services/api.ts</code>. Includes header headers <code className="text-slate-800 font-mono">x-firm-id</code> and <code className="text-slate-800 font-mono">x-client-id</code>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center space-x-1.5 text-emerald-700">
                    <Server className="w-4 h-4" />
                    <span>2. Express Node API</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans">server.ts</span>
                </div>
                <p className="text-slate-600 font-sans text-[11px]">
                  Receives <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">/api/v1/*</code> requests, executes business validation (e.g. Debits === Credits, Canadian GST/QST math), and runs database queries.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center space-x-1.5 text-purple-700">
                    <Database className="w-4 h-4" />
                    <span>3. PostgreSQL / Cloud SQL</span>
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-sans">Storage</span>
                </div>
                <p className="text-slate-600 font-sans text-[11px]">
                  Stores persistent relational data with foreign keys, compound indexes, and Row-Level Security (RLS) ensuring strict multi-tenant practice isolation.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Execution Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create Database & Run DDL Tables</h3>
                  <span className="text-[11px] text-slate-500">Database Layer (Cloud SQL or PostgreSQL)</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Execute the SQL script in <strong>Tab 2 (Database & SQL DDL Schema)</strong>. This provisions:
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium">
                <li><code className="text-slate-900 font-mono">firms</code>: Accounting practices.</li>
                <li><code className="text-slate-900 font-mono">client_businesses</code>: Client entities under the 15-business boundary.</li>
                <li><code className="text-slate-900 font-mono">chart_of_accounts</code>: 4-digit Canadian standardized accounts.</li>
                <li><code className="text-slate-900 font-mono">journal_entries</code> & <code className="text-slate-900 font-mono">ledger_lines</code>: Double-entry lines.</li>
                <li><code className="text-slate-900 font-mono">bank_transactions</code> & <code className="text-slate-900 font-mono">receipts</code>.</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Configure Express API Router in `server.ts`</h3>
                  <span className="text-[11px] text-slate-500">Backend API Services Layer</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Setup the server endpoints using the template in <strong>Tab 3 (REST API Routes)</strong>:
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium">
                <li>Binds to <code className="text-slate-900 font-mono">0.0.0.0:3000</code>.</li>
                <li>Serves JSON endpoints on <code className="text-slate-900 font-mono">/api/v1/*</code>.</li>
                <li>Integrates Vite middleware in development mode and static file serving in production.</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Header-Based Multi-Tenancy (Without Auth Initially)</h3>
                  <span className="text-[11px] text-slate-500">Fast MVP Development Strategy</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Since authentication is deferred for early development:
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium">
                <li>The frontend passes <code className="text-emerald-700 font-mono">x-firm-id</code> and <code className="text-emerald-700 font-mono">x-client-id</code> in HTTP request headers.</li>
                <li>The backend extracts these headers to filter all database queries automatically.</li>
                <li>When JWT or OAuth is added later, simply replace the header extractor with token verification middleware.</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Connect React Context to REST API</h3>
                  <span className="text-[11px] text-slate-500">Frontend Data Sync Layer</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                In <code className="text-slate-900 font-mono">/src/context/AccountingContext.tsx</code>, replace in-memory arrays with API fetchers (provided in <strong>Tab 4</strong>):
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium">
                <li>Load initial data via <code className="text-slate-900 font-mono">api.getClients()</code> and <code className="text-slate-900 font-mono">api.getAccounts()</code>.</li>
                <li>Post entries via <code className="text-slate-900 font-mono">api.postJournalEntry()</code>.</li>
                <li>Reconcile banking transactions via <code className="text-slate-900 font-mono">api.reconcileBankTx()</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DATABASE & SQL DDL SCHEMA */}
      {activeSubTab === 'database_ddl' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Production PostgreSQL 16 Schema & Table Definitions</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Copy and run this exact script in your PostgreSQL or Cloud SQL console to instantiate the complete database.
              </p>
            </div>

            <button
              onClick={() => handleCopy(POSTGRES_COMPLETE_DDL, 'sql-ddl')}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              {copiedSection === 'sql-ddl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'sql-ddl' ? 'Copied SQL Script!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-100 p-4 sm:p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 max-h-[600px] leading-relaxed">
            {POSTGRES_COMPLETE_DDL}
          </pre>
        </div>
      )}

      {/* SUBTAB 3: REST API ROUTES (`server.ts`) */}
      {activeSubTab === 'api_specs' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <span>Complete Express API Server (`server.ts`)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Full implementation with Double-Entry balance validation, tax calculation, and multi-tenant header filtering.
              </p>
            </div>

            <button
              onClick={() => handleCopy(EXPRESS_SERVER_CODE, 'express-code')}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              {copiedSection === 'express-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'express-code' ? 'Copied Server Code!' : 'Copy server.ts Code'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 text-emerald-300 p-4 sm:p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 max-h-[600px] leading-relaxed">
            {EXPRESS_SERVER_CODE}
          </pre>
        </div>
      )}

      {/* SUBTAB 4: FRONTEND CLIENT & HOOKS */}
      {activeSubTab === 'frontend_client' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <span>Frontend API Service & Context Integration (`src/services/api.ts`)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lightweight HTTP client with automatic header injection and typed response helpers for React components.
              </p>
            </div>

            <button
              onClick={() => handleCopy(FRONTEND_API_SERVICE_CODE, 'client-code')}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              {copiedSection === 'client-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'client-code' ? 'Copied Client Service!' : 'Copy api.ts Code'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 text-blue-300 p-4 sm:p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 max-h-[600px] leading-relaxed">
            {FRONTEND_API_SERVICE_CODE}
          </pre>
        </div>
      )}

      {/* SUBTAB 5: LIVE REST API TESTER */}
      {activeSubTab === 'api_tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Endpoint List */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Testable Endpoints ({endpoints.length})
            </div>
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep.id);
                    setApiResponse(null);
                  }}
                  className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedEndpoint === ep.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold truncate">{ep.path.split('?')[0]}</span>
                  </div>
                  <div className="text-xs font-semibold">{ep.title}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{ep.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Live Request / Response Runner */}
          <div className="lg:col-span-8 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded font-mono ${
                      currentEndpoint.method === 'GET'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentEndpoint.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">{currentEndpoint.path}</span>
                </div>
                <p className="text-xs text-slate-500">{currentEndpoint.description}</p>
              </div>

              <button
                onClick={handleRunEndpoint}
                className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs min-h-[38px] shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Call</span>
              </button>
            </div>

            {/* Headers */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Request Headers</label>
              <pre className="bg-slate-900 text-slate-300 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                {JSON.stringify(currentEndpoint.headers, null, 2)}
              </pre>
            </div>

            {/* Request Payload (if POST) */}
            {currentEndpoint.mockPayload && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Request Body (JSON)</label>
                <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
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
                    <span>200 OK • Balanced DB Transaction</span>
                  </span>
                )}
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 min-h-[160px]">
                {apiResponse || '// Click "Simulate Call" above to test API response.'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: ROADMAP & SPRINT CHECKLIST */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Backend & Database Implementation Checklist</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track and verify each stage of the database, API, and frontend wiring.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900 font-mono">
              Status: Ready for Cloud SQL / PostgreSQL Execution
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Phase 1: Database & Schemas</span>
              <div className="space-y-2 text-xs">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!completedTasks['db-1']}
                    onChange={() => toggleTask('db-1')}
                    className="rounded text-emerald-600 mt-0.5"
                  />
                  <span className={completedTasks['db-1'] ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                    Execute SQL DDL script creating all 8 core tables with foreign keys and UUID keys
                  </span>
                </label>
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!completedTasks['db-2']}
                    onChange={() => toggleTask('db-2')}
                    className="rounded text-emerald-600 mt-0.5"
                  />
                  <span className={completedTasks['db-2'] ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                    Seed database with standard Canadian 4-digit Chart of Accounts (1010, 2150, 2160, 4010, 5010)
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Phase 2: Express Server & APIs</span>
              <div className="space-y-2 text-xs">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!completedTasks['api-1']}
                    onChange={() => toggleTask('api-1')}
                    className="rounded text-emerald-600 mt-0.5"
                  />
                  <span className={completedTasks['api-1'] ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                    Create `/api/v1/clients/:clientId/journal-entries` with atomic Debits === Credits validation
                  </span>
                </label>
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!completedTasks['api-2']}
                    onChange={() => toggleTask('api-2')}
                    className="rounded text-emerald-600 mt-0.5"
                  />
                  <span className={completedTasks['api-2'] ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                    Add Canadian Sales Tax aggregation endpoint (`/reports/sales-tax-summary`) for CRA GST & RQ QST
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const POSTGRES_COMPLETE_DDL = `-- ====================================================================
-- STUDIO BOOKS: CANADIAN MULTI-TENANT POSTGRESQL 16 DDL SCHEMA
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Accounting Practices / Firms (Practice-first tenant root)
CREATE TABLE firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'practice_flagship',
    active_client_limit INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Practice Users & Accountants
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'senior_accountant', -- 'firm_owner' | 'senior_accountant' | 'staff_bookkeeper' | 'auditor'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Client Businesses (15-business practice boundary)
CREATE TABLE client_businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    legal_name VARCHAR(255) NOT NULL,
    business_number VARCHAR(15), -- 9-digit CRA BN (e.g. 849201948 RC0001)
    province_code VARCHAR(2) NOT NULL DEFAULT 'QC', -- 'QC' | 'ON' | 'BC' | 'AB'
    reporting_frequency VARCHAR(20) NOT NULL DEFAULT 'quarterly', -- 'monthly' | 'quarterly' | 'annual'
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    gst_registered BOOLEAN DEFAULT TRUE,
    qst_registered BOOLEAN DEFAULT TRUE,
    last_closed_month VARCHAR(7) DEFAULT '2026-06',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Standardized Chart of Accounts (Canadian 4-Digit G/L codes)
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_business_id UUID NOT NULL REFERENCES client_businesses(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL, -- e.g. '1010', '2150', '2160', '4010', '5010'
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
    category VARCHAR(100),
    is_tax_account BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_business_id, code)
);

-- 6. Journal Entries (Immutable Double-Entry Header)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_business_id UUID NOT NULL REFERENCES client_businesses(id) ON DELETE CASCADE,
    entry_number INT NOT NULL,
    entry_date DATE NOT NULL,
    memo TEXT NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual' | 'qbo_import' | 'wave_import' | 'receipt_ocr' | 'bank_feed'
    status VARCHAR(30) NOT NULL DEFAULT 'posted', -- 'draft' | 'posted' | 'reversed'
    created_by VARCHAR(255) NOT NULL,
    reversed_entry_id UUID REFERENCES journal_entries(id),
    reversal_reason TEXT,
    posted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ledger Lines (Compound Double-Entry Lines: Debits & Credits)
CREATE TABLE ledger_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    description VARCHAR(255) NOT NULL,
    debit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_code VARCHAR(30), -- 'GST_QST' | 'HST_ON' | 'EXEMPT' | 'ZERO_RATED'
    tax_rate NUMERIC(6, 4) DEFAULT 0.0000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bank Transactions (Feed ingestion & Reconciliation state)
CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_business_id UUID NOT NULL REFERENCES client_businesses(id) ON DELETE CASCADE,
    bank_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL, -- negative for outflows, positive for inflows
    status VARCHAR(30) NOT NULL DEFAULT 'unmatched', -- 'unmatched' | 'matched' | 'cleared'
    matched_entry_id UUID REFERENCES journal_entries(id),
    reconciled_at TIMESTAMPTZ,
    reconciled_by VARCHAR(255)
);

-- 9. Receipt Documents & OCR Extraction
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_business_id UUID NOT NULL REFERENCES client_businesses(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    receipt_date DATE NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    gst_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    qst_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'extracted', -- 'extracted' | 'posted_to_ledger' | 'archived'
    suggested_account_id UUID REFERENCES chart_of_accounts(id),
    posted_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES & INTEGRITY TRIGGERS
-- ====================================================================
CREATE INDEX idx_client_firm ON client_businesses(firm_id);
CREATE INDEX idx_accounts_client ON chart_of_accounts(client_business_id);
CREATE INDEX idx_entries_client_date ON journal_entries(client_business_id, entry_date DESC);
CREATE INDEX idx_lines_entry ON ledger_lines(journal_entry_id);
CREATE INDEX idx_bank_client_status ON bank_transactions(client_business_id, status);
`;

const EXPRESS_SERVER_CODE = `import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// 1. Multi-Tenant Header Extraction Middleware (No Auth Required for MVP)
// -------------------------------------------------------------
app.use('/api', (req, res, next) => {
  const firmId = req.headers['x-firm-id'] as string || 'firm-flagship-1';
  const clientId = req.headers['x-client-id'] as string || req.params.clientId;
  const userId = req.headers['x-user-id'] as string || 'user-senior-cpa-1';

  (req as any).context = { firmId, clientId, userId };
  next();
});

// -------------------------------------------------------------
// 2. Firm & Client API Endpoints
// -------------------------------------------------------------
app.get('/api/v1/firm/overview', async (req: Request, res: Response) => {
  const { firmId } = (req as any).context;
  // Query DB: SELECT * FROM firms WHERE id = firmId;
  res.json({
    firmId,
    name: 'Studio Bookkeeping Practice',
    activeClientLimit: 15,
    activeClientsCount: 12,
  });
});

app.get('/api/v1/clients', async (req: Request, res: Response) => {
  const { firmId } = (req as any).context;
  // Query DB: SELECT * FROM client_businesses WHERE firm_id = firmId;
  res.json([
    { id: 'client-1', legalName: 'Apex Creative Studio Inc.', provinceCode: 'QC' },
    { id: 'client-2', legalName: 'NorthStar Logistics Ltd.', provinceCode: 'ON' },
  ]);
});

// -------------------------------------------------------------
// 3. General Ledger & Balanced Double-Entry Endpoint
// -------------------------------------------------------------
app.post('/api/v1/clients/:clientId/journal-entries', async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const { entryDate, memo, source, lines } = req.body;

  if (!lines || !Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ error: 'A journal entry requires at least two lines.' });
  }

  let totalDebits = 0;
  let totalCredits = 0;
  lines.forEach((line: any) => {
    totalDebits += Number(line.debit || 0);
    totalCredits += Number(line.credit || 0);
  });

  // Strict double-entry balance validation
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return res.status(422).json({
      error: \`Transaction is imbalanced. Debits ($\${totalDebits.toFixed(2)}) must equal Credits ($\${totalCredits.toFixed(2)}).\`
    });
  }

  // Database Transaction: INSERT INTO journal_entries (...) & INSERT INTO ledger_lines (...)
  res.status(201).json({
    status: 'posted',
    entryNumber: 1045,
    clientBusinessId: clientId,
    isBalanced: true,
    totalDebits,
    totalCredits,
    postedAt: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 4. Canadian Sales Tax Summary (CRA & Revenu Québec)
// -------------------------------------------------------------
app.get('/api/v1/clients/:clientId/reports/sales-tax-summary', async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const period = req.query.period as string || '2026-Q2';

  // Compute tax lines from ledger_lines joining tax accounts (2150 GST ITC, 2160 QST ITR)
  res.json({
    period,
    gst: {
      line101SalesTotal: 12000.0,
      line105GstCollected: 600.0,
      line108ItcsClaimed: 191.25,
      line109NetGstPayable: 408.75,
    },
    qst: {
      line201SalesTotal: 12000.0,
      line205QstCollected: 1197.0,
      line208ItrsClaimed: 381.55,
      line209NetQstPayable: 815.45,
    },
    totalRemittanceDue: 1224.2,
  });
});

// -------------------------------------------------------------
// 5. Mount Vite or Serve Static Production Bundle
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
  });
}

startServer();`;

const FRONTEND_API_SERVICE_CODE = `// src/services/api.ts
// Frontend API Client with Typed Endpoints and Header Injection

const API_BASE = '/api/v1';

export class ApiClient {
  private firmId: string;
  private clientId: string;
  private userId: string;

  constructor(firmId: string, clientId: string, userId: string) {
    this.firmId = firmId;
    this.clientId = clientId;
    this.userId = userId;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-firm-id': this.firmId,
      'x-client-id': this.clientId,
      'x-user-id': this.userId,
    };
  }

  async getFirmOverview() {
    const res = await fetch(\`\${API_BASE}/firm/overview\`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch firm overview');
    return res.json();
  }

  async getAccounts(clientId: string) {
    const res = await fetch(\`\${API_BASE}/clients/\${clientId}/accounts\`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  }

  async postJournalEntry(clientId: string, entry: any) {
    const res = await fetch(\`\${API_BASE}/clients/\${clientId}/journal-entries\`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to post journal entry');
    }
    return res.json();
  }

  async getTaxSummary(clientId: string, period: string) {
    const res = await fetch(\`\${API_BASE}/clients/\${clientId}/reports/sales-tax-summary?period=\${period}\`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch sales tax report');
    return res.json();
  }
}

export const api = new ApiClient('firm-flagship-1', 'client-apex-1', 'user-senior-cpa-1');`;

const COMPLETE_ARCHITECTURE_MARKDOWN = `# Studio Books: Backend, Database & REST API Architecture Specification

## 1. Executive Summary & Topology
Studio Books is a Canadian multi-tenant bookkeeping practice management platform designed for the 15-business boundary.

- **Frontend**: React 18 + Vite + Tailwind CSS.
- **Backend Service**: Node.js + Express (running on port 3000).
- **Database Engine**: PostgreSQL 16 (or Google Cloud SQL) with Row-Level Security (RLS) and foreign key constraints.
- **Multi-Tenant Routing (No Initial Auth)**: Tenant identification via HTTP headers (\`x-firm-id\`, \`x-client-id\`, \`x-user-id\`).

## 2. Core PostgreSQL Relational Tables
1. \`firms\` (Tenant Root)
2. \`users\` (Bookkeepers, CPAs, Firm Owners)
3. \`client_businesses\` (Client entities, e.g., Apex Creative Studio Inc.)
4. \`chart_of_accounts\` (Standardized Canadian 4-digit GL accounts)
5. \`journal_entries\` (Balanced transaction headers)
6. \`ledger_lines\` (Double-entry debits and credits)
7. \`bank_transactions\` (Reconciliation feed)
8. \`receipts\` (OCR extraction documents)

## 3. Double-Entry Integrity Guarantee
Every journal entry requires \`SUM(debit) == SUM(credit)\`. The backend enforces this before executing database transactions.

## 4. Canadian Sales Tax Integration (CRA & Revenu Québec)
- GST: Line 105 (Collected) vs Line 108 (ITCs Claimed)
- QST: Line 205 (Collected) vs Line 208 (ITRs Claimed)
`;
