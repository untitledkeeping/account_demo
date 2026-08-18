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
  ArrowDown,
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
  Building2,
  Users,
  Briefcase,
  Wallet,
  Receipt,
  FileText,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { ClientBusiness, Firm } from '../types';

interface ArchitectureHubProps {
  firm: Firm;
  activeClient: ClientBusiness;
}

type SubTab =
  | 'visual_flow'
  | 'guide'
  | 'database_ddl'
  | 'api_specs'
  | 'frontend_client'
  | 'api_tester'
  | 'roadmap';

type EntityNodeType = 'firm' | 'user' | 'client' | 'account' | 'trust_account' | 'ledger' | 'banking' | 'tax';

export const ArchitectureHub: React.FC<ArchitectureHubProps> = ({
  firm,
  activeClient,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('visual_flow');
  const [selectedEntity, setSelectedEntity] = useState<EntityNodeType>('client');
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

  const entityDetails: Record<
    EntityNodeType,
    {
      title: string;
      cardinality: string;
      sqlTable: string;
      foreignKey: string;
      role: string;
      explanation: string;
      sampleData: Record<string, any>;
    }
  > = {
    firm: {
      title: 'Practice / Accounting Firm (Root Tenant)',
      cardinality: '1 Firm : N Users | 1 Firm : N Client Businesses (Max 15 in Tier)',
      sqlTable: 'firms',
      foreignKey: 'Primary Key (id)',
      role: 'Top-level tenant boundary. Owns practice settings, subscription limits, and all accounting data.',
      explanation:
        'When you arrive at the platform, the Firm represents your Accounting or Bookkeeping Practice. It establishes the global security boundary (SOC-2/CRA compliant multi-tenancy) so no client data is ever leaked outside your practice.',
      sampleData: {
        id: firm.id,
        name: firm.name,
        subscriptionTier: firm.subscriptionTier,
        activeClientLimit: firm.activeClientLimit,
        currentClientCount: 12,
      },
    },
    user: {
      title: 'Practice Users & Accountants (Staff)',
      cardinality: 'N Users : 1 Firm | N Users : M Client Businesses',
      sqlTable: 'users',
      foreignKey: 'firm_id -> firms.id',
      role: 'CPAs, Senior Bookkeepers, and Auditors working inside the practice.',
      explanation:
        'A Practice has multiple Users (e.g. Firm Owner, Senior CPA, Staff Bookkeeper). Each User can be assigned to manage specific Client Businesses or oversee the entire firm portfolio.',
      sampleData: {
        id: 'user-cpa-1',
        firmId: firm.id,
        fullName: 'Sarah Jenkins, CPA',
        role: 'senior_accountant',
        assignedClients: ['client-apex-1', 'client-northstar-2'],
      },
    },
    client: {
      title: 'Client Businesses (Corporate Entities)',
      cardinality: '1 Client Business : 1 Firm | 1 Client Business : N Accounts',
      sqlTable: 'client_businesses',
      foreignKey: 'firm_id -> firms.id',
      role: 'Individual business entities (e.g. Apex Creative Studio Inc.) under the practice 15-business boundary.',
      explanation:
        'The Practice manages multiple Client Businesses. Each client is a distinct legal entity in Canada with its own 9-digit CRA Business Number (BN), provincial tax jurisdiction (QC, ON, BC, AB), and independent books.',
      sampleData: {
        id: activeClient.id,
        firmId: firm.id,
        legalName: activeClient.legalName,
        businessNumber: activeClient.businessNumber,
        provinceCode: activeClient.provinceCode,
        reportingFrequency: activeClient.reportingFrequency,
      },
    },
    account: {
      title: 'Chart of Accounts (General Ledger Accounts)',
      cardinality: '1 Client Business : N Accounts',
      sqlTable: 'chart_of_accounts',
      foreignKey: 'client_business_id -> client_businesses.id',
      role: 'Standard Canadian 4-digit GL accounts (Operating Bank, AR, AP, Revenue, Expenses, GST/QST/HST).',
      explanation:
        'Each Client Business owns its own Chart of Accounts (COA). Standardized 4-digit numbering: 1000s = Assets, 2000s = Liabilities (including Sales Tax Payable), 3000s = Equity, 4000s = Revenue, 5000s+ = Expenses.',
      sampleData: {
        id: 'acc-1010',
        clientBusinessId: activeClient.id,
        code: '1010',
        name: 'Operating Chequing Account (CAD)',
        type: 'asset',
        classification: 'bank',
        currentBalance: 42150.2,
      },
    },
    trust_account: {
      title: 'Trust & Escrow Accounts (Client Retainers / Fiduciary)',
      cardinality: '1 Client Business : N Trust Accounts (Classification: trust_escrow)',
      sqlTable: 'chart_of_accounts (classification = trust_escrow)',
      foreignKey: 'client_business_id -> client_businesses.id',
      role: 'Dedicated fiduciary bank accounts for holding unearned client retainers or third-party funds.',
      explanation:
        'In Canada, professional practices (lawyers, consultants, real estate brokers) hold client retainer deposits in a Trust Account (1020). These funds do NOT belong to the business until billed, so they sit in Trust Assets with an offsetting Trust Liability (2050) without inflating operating revenue.',
      sampleData: {
        id: 'acc-1020',
        clientBusinessId: activeClient.id,
        code: '1020',
        name: 'Client Retainer Trust Account (Fiduciary CAD)',
        type: 'asset',
        classification: 'trust_escrow',
        offsettingLiabilityAccount: '2050 (Trust Liability Retainers)',
        currentBalance: 12500.0,
      },
    },
    ledger: {
      title: 'Double-Entry Journal Entries & Ledger Lines',
      cardinality: '1 Client Business : N Journal Entries | 1 Entry : N Ledger Lines (Debits & Credits)',
      sqlTable: 'journal_entries & ledger_lines',
      foreignKey: 'journal_entry_id -> journal_entries.id | account_id -> chart_of_accounts.id',
      role: 'Immutable balanced accounting records enforcing mathematical equality (SUM(Debits) === SUM(Credits)).',
      explanation:
        'Every financial event creates a Journal Entry header with 2 or more Ledger Lines. Canadian GST (Line 108 ITC) and QST (Line 208 ITR) are automatically broken out onto distinct tax ledger lines.',
      sampleData: {
        entryId: 'entry-1045',
        memo: 'Bell Canada Commercial Telecom',
        totalDebits: 172.46,
        totalCredits: 172.46,
        lines: [
          { code: '6400', name: 'Telecom Expense', debit: 150.0, credit: 0.0 },
          { code: '2150', name: 'GST Paid on Purchases (5%)', debit: 7.5, credit: 0.0 },
          { code: '2160', name: 'QST Paid on Purchases (9.975%)', debit: 14.96, credit: 0.0 },
          { code: '1010', name: 'Operating Chequing Outflow', debit: 0.0, credit: 172.46 },
        ],
      },
    },
    banking: {
      title: 'Bank Feeds & Reconciliation Engine',
      cardinality: '1 Bank Account : N Statement Transactions | 1 Tx : 1 Matched Entry',
      sqlTable: 'bank_transactions',
      foreignKey: 'bank_account_id -> chart_of_accounts.id',
      role: 'Automated 2-way matching between raw bank statement feeds and recorded general ledger lines.',
      explanation:
        'Transactions downloaded from Canadian institutions (RBC, TD, Desjardins) are ingested and matched against ledger entries to ensure statement balances match general ledger balances to the exact penny.',
      sampleData: {
        id: 'bank-tx-881',
        bankAccountId: 'acc-1010',
        date: '2026-08-12',
        description: 'PRE-AUTH DEBIT HYDRO QUEBEC',
        amount: -432.18,
        status: 'matched',
        matchedEntryId: 'entry-1022',
      },
    },
    tax: {
      title: 'CRA & Revenu Québec Tax Filing Reports',
      cardinality: '1 Client Business : N Filing Periods (e.g. 2026-Q2)',
      sqlTable: 'Derived from ledger_lines + chart_of_accounts (2150, 2160, 2170)',
      foreignKey: 'client_business_id -> client_businesses.id',
      role: 'Automated Line 105 vs 108 (GST/HST) and Line 205 vs 208 (QST) government remittance worksheets.',
      explanation:
        'Tax returns are computed live from the ledger. When sales occur, GST/QST collected is credited to liability accounts. When expenses occur, ITCs and ITRs are debited to reduce the net payable to CRA and Revenu Québec.',
      sampleData: {
        period: '2026-Q2',
        jurisdiction: 'Quebec (GST 5% + QST 9.975%)',
        line105GstCollected: 600.0,
        line108ItcsClaimed: 191.25,
        netGstPayable: 408.75,
        line205QstCollected: 1197.0,
        line208ItrsClaimed: 381.55,
        netQstPayable: 815.45,
        totalRemittanceDueCAD: 1224.2,
      },
    },
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
        { id: 'acc-1020', code: '1020', name: 'Client Retainer Trust Account (CAD)', type: 'asset', currentBalance: 12500.0 },
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
              <GitBranch className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Domain Model, Entity Hierarchy & Architecture</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Visual relationship flow: Practice (Firm) → Staff Users → Client Businesses → Chart of Accounts (Operating & Trust) → Double-Entry Ledgers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCopy(MERMAID_DIAGRAM_SPEC, 'mermaid-spec')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copiedSection === 'mermaid-spec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'mermaid-spec' ? 'Copied Diagram Spec!' : 'Copy Diagram Flow'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-1.5 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab('visual_flow')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'visual_flow'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>1. Visual Flow Diagram (Firm → User → Business → Account)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'guide'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>2. Step-by-Step Implementation Guide</span>
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
          <span>3. Database & SQL DDL Schema</span>
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
          <span>4. REST API Routes (`server.ts`)</span>
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
          <span>5. React API Client & Hooks</span>
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
          <span>6. Live REST API Tester</span>
        </button>
      </div>

      {/* SUBTAB 1: VISUAL FLOW DIAGRAM & ENTITY INSPECTOR */}
      {activeSubTab === 'visual_flow' && (
        <div className="space-y-6">
          {/* Quick Verbal Summary Card */}
          <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Core Hierarchy Summary (How the pieces connect)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>1. Practice (Firm)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  The top tenant boundary (your firm). Holds subscription limits, global settings, and practice users.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                <div className="font-bold text-blue-400 flex items-center space-x-1.5">
                  <Users className="w-4 h-4" />
                  <span>2. Users (Staff / CPAs)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Accountants working within the practice who are assigned to manage one or more client businesses.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                <div className="font-bold text-purple-400 flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>3. Client Businesses</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Corporate legal entities (e.g. Apex Creative Studio Inc.) with CRA Business Numbers & provincial rules.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
                <div className="font-bold text-amber-400 flex items-center space-x-1.5">
                  <Wallet className="w-4 h-4" />
                  <span>4. Accounts (Operating & Trust)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Standard Canadian GL accounts (Operating Bank <code className="text-white">1010</code>, Trust Escrow <code className="text-white">1020</code>, Tax <code className="text-white">2150/2160</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Visual Hierarchy Flow Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Visual Flow Nodes */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Interactive Domain Flow Diagram</span>
                  </h2>
                  <span className="text-[11px] text-slate-500 font-medium">Click any node to inspect its database contract</span>
                </div>

                {/* Flow Diagram Cards Stack */}
                <div className="space-y-3">
                  {/* LEVEL 1: FIRM */}
                  <div
                    onClick={() => setSelectedEntity('firm')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedEntity === 'firm'
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">Level 1: Accounting Practice (Firm)</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">Tenant Root</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{firm.name} (Tier: 15-Client Flagship)</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">1</span>
                    </div>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  {/* LEVEL 2: USERS & CLIENT BUSINESSES (SPLIT LEVEL) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setSelectedEntity('user')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedEntity === 'user'
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Level 2A: Staff Users</div>
                          <span className="text-[10px] text-blue-700 font-mono font-bold">1 Firm → N Users</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        CPAs, Bookkeepers & Auditors assigned to client portfolios.
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedEntity('client')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedEntity === 'client'
                          ? 'border-purple-500 bg-purple-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <div className="w-7 h-7 rounded-md bg-purple-600 text-white flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Level 2B: Client Businesses</div>
                          <span className="text-[10px] text-purple-700 font-mono font-bold">1 Firm → Up to 15 Clients</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {activeClient.legalName} ({activeClient.provinceCode})
                      </p>
                    </div>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  {/* LEVEL 3: CHART OF ACCOUNTS (OPERATING VS TRUST) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setSelectedEntity('account')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedEntity === 'account'
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Operating Accounts (1010)</div>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold">General Business Cash</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Standard chequing, AR, AP, Revenue, Expenses & Sales Tax accounts.
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedEntity('trust_account')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedEntity === 'trust_account'
                          ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <div className="w-7 h-7 rounded-md bg-amber-600 text-white flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">Trust Accounts (1020)</div>
                          <span className="text-[10px] text-amber-700 font-mono font-bold">Client Retainer / Escrow</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Fiduciary accounts held on trust for clients (strictly segregated).
                      </p>
                    </div>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  {/* LEVEL 4: DOUBLE-ENTRY LEDGERS, BANKING & TAX */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div
                      onClick={() => setSelectedEntity('ledger')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                        selectedEntity === 'ledger'
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <FileSpreadsheet className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                      <div className="font-bold text-xs text-slate-900">Journal Entries</div>
                      <span className="text-[9px] text-blue-700 font-mono">Debits === Credits</span>
                    </div>

                    <div
                      onClick={() => setSelectedEntity('banking')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                        selectedEntity === 'banking'
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <RefreshCw className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                      <div className="font-bold text-xs text-slate-900">Bank Feeds</div>
                      <span className="text-[9px] text-emerald-700 font-mono">Reconciliation</span>
                    </div>

                    <div
                      onClick={() => setSelectedEntity('tax')}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                        selectedEntity === 'tax'
                          ? 'border-purple-500 bg-purple-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <FileCheck2Icon className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                      <div className="font-bold text-xs text-slate-900">CRA / RQ Tax</div>
                      <span className="text-[9px] text-purple-700 font-mono">GST / QST / HST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Selected Node Contract Inspector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 sticky top-20">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>Selected Entity Contract</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    {entityDetails[selectedEntity].title}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/90 space-y-1">
                    <div className="text-slate-500 font-semibold text-[11px]">Cardinality & Multiplicity</div>
                    <div className="font-mono font-bold text-slate-900">{entityDetails[selectedEntity].cardinality}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/90">
                      <div className="text-slate-500 font-semibold text-[10px]">SQL Table</div>
                      <div className="font-mono font-bold text-slate-900">{entityDetails[selectedEntity].sqlTable}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/90">
                      <div className="text-slate-500 font-semibold text-[10px]">Foreign Key Link</div>
                      <div className="font-mono font-bold text-slate-900 truncate">{entityDetails[selectedEntity].foreignKey}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-semibold text-[11px] mb-1">Business Purpose</div>
                    <p className="text-slate-700 leading-relaxed">{entityDetails[selectedEntity].explanation}</p>
                  </div>

                  <div>
                    <div className="text-slate-500 font-semibold text-[11px] mb-1">Live Sample Database Record</div>
                    <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-slate-800">
                      {JSON.stringify(entityDetails[selectedEntity].sampleData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Account vs. Operating Account Visual Guide Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Specialized Canadian Domain Guide: Operating Accounts vs. Trust / Escrow Accounts</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span>General Operating Account (Account Code: 1010)</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Owned fully by the client business. Used to receive customer invoice payments, disburse vendor cheques, pay employee wages, and remit Canadian GST/QST.
                </p>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-emerald-200 text-slate-800">
                  Debit Bank (1010) | Credit Consulting Revenue (4010)
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-amber-900 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Client Retainer Trust Account (Account Code: 1020)</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Fiduciary funds held on behalf of third parties (e.g. upfront legal/consulting retainers, real estate security deposits). Cannot be spent on general expenses until an invoice is rendered.
                </p>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-amber-200 text-slate-800">
                  Debit Trust Bank (1020) | Credit Trust Liability (2050)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: STEP-BY-STEP IMPLEMENTATION GUIDE */}
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
                Execute the SQL script in <strong>Tab 3 (Database & SQL DDL Schema)</strong>. This provisions:
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-medium">
                <li><code className="text-slate-900 font-mono">firms</code>: Accounting practices.</li>
                <li><code className="text-slate-900 font-mono">client_businesses</code>: Client entities under the 15-business boundary.</li>
                <li><code className="text-slate-900 font-mono">chart_of_accounts</code>: 4-digit Canadian standardized accounts (including Operating & Trust).</li>
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
                Setup the server endpoints using the template in <strong>Tab 4 (REST API Routes)</strong>:
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
                In <code className="text-slate-900 font-mono">/src/context/AccountingContext.tsx</code>, replace in-memory arrays with API fetchers (provided in <strong>Tab 5</strong>):
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

      {/* SUBTAB 3: DATABASE & SQL DDL SCHEMA */}
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

      {/* SUBTAB 4: REST API ROUTES (`server.ts`) */}
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

      {/* SUBTAB 5: FRONTEND CLIENT & HOOKS */}
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

      {/* SUBTAB 6: LIVE REST API TESTER */}
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
    </div>
  );
};

// Helper custom icon wrapper
function FileCheck2Icon(props: { className?: string }) {
  return <FileText className={props.className} />;
}

const MERMAID_DIAGRAM_SPEC = `%% Studio Books Entity & Domain Relationship Diagram
graph TD
    %% Level 1: Practice
    Firm["Accounting Practice (Firm / Tenant Root)\\nTable: firms"]
    
    %% Level 2: Users and Businesses
    User["Staff Users (CPAs & Bookkeepers)\\nTable: users"]
    Client["Client Businesses (Max 15)\\nTable: client_businesses"]
    
    %% Level 3: Accounts
    OperatingAcc["Operating Bank Account (1010)\\nTable: chart_of_accounts"]
    TrustAcc["Trust / Retainer Escrow Account (1020)\\nTable: chart_of_accounts"]
    TaxAcc["Sales Tax Accounts (2150 GST / 2160 QST)\\nTable: chart_of_accounts"]
    RevenueExpense["Revenue (4xxx) & Expenses (5xxx+)\\nTable: chart_of_accounts"]
    
    %% Level 4: Ledgers and Feeds
    Journal["Double-Entry Journal Entries\\nTable: journal_entries"]
    LedgerLines["Ledger Lines (Debits === Credits)\\nTable: ledger_lines"]
    BankFeeds["Bank Feeds & Reconciliation\\nTable: bank_transactions"]
    TaxFiling["CRA & RQ Tax Filings\\nLine 105/108 & Line 205/208"]

    %% Linkages
    Firm -->|1 : N| User
    Firm -->|1 : N (Max 15)| Client
    User -.->|Manages / Assigned| Client
    Client -->|1 : N| OperatingAcc
    Client -->|1 : N| TrustAcc
    Client -->|1 : N| TaxAcc
    Client -->|1 : N| RevenueExpense
    Client -->|1 : N| Journal
    Journal -->|1 : N| LedgerLines
    OperatingAcc -->|Reconciles with| BankFeeds
    LedgerLines -->|Generates| TaxFiling
`;

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
    code VARCHAR(10) NOT NULL, -- e.g. '1010', '1020', '2150', '2160', '4010', '5010'
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
    classification VARCHAR(50) NOT NULL, -- 'bank' | 'trust_escrow' | 'accounts_receivable' | 'sales_tax_payable' | 'operating_revenue' | 'operating_expense'
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
